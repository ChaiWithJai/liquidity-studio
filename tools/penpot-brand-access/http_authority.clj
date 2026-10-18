;; Original fixed native→Studio private authority adapter. No cookies or RPC relay.
(ns app.studio.http-authority
  (:require [app.common.json :as json]
            [app.common.uuid :as uuid]
            [app.http.client :as client]
            [java-http-clj.core :as http])
  (:import [java.net.http HttpClient HttpClient$Redirect]
           [java.util.concurrent CompletableFuture TimeUnit]
           [java.io InputStream]
           [java.util.function Function BiConsumer]))

(defn- body [resource]
  (if (:native-operator-profile-id resource)
    {:nativeOperatorProfileId (str (:native-operator-profile-id resource))
     :nativeTeamId (str (:native-team-id resource))
     :nativeMemberId (str (:native-member-id resource))
     :intentId (str (:intent-id resource))
     :expectedEpoch (:expected-epoch resource) :grantEpoch (:grant-epoch resource)
     :present (:present resource)}
    (do
      ;; Legacy v0 :id may be the raw cookie credential. Never stringify it.
      (when-not (and (uuid? (get-in resource [:native-session :id]))
                     (uuid? (:native-profile-id resource))
                     (= (:native-profile-id resource) (get-in resource [:native-session :profile-id])))
        (throw (IllegalArgumentException. "Governed native access requires a UUID v1 session; sign in again")))
    {:nativeProfileId (str (:native-profile-id resource))
     :nativeTeamId (str (:native-team-id resource))
     :operation (name (:operation resource))
     :nativeSession {:id (str (get-in resource [:native-session :id]))
                     :profileId (str (get-in resource [:native-session :profile-id]))}})))

(defn create
  "Uses the existing pinned java-http-clj client. Fixed local callback, key and
   total deadline are constructor-only. The original Node39044 forwards only
   these two paths to its fixed Studio origin; the native cookie is never sent."
  [{:keys [::client/client grant-key callback-origin]}]
  (when-not (and (instance? HttpClient client)
                 (= HttpClient$Redirect/NEVER (.followRedirects ^HttpClient client))
                 (= callback-origin "http://host.docker.internal:39044")
                 (string? grant-key) (re-matches #"[A-Za-z0-9_-]{43}" grant-key))
    (throw (IllegalArgumentException. "Fixed native authority configuration required")))
  (fn [resource]
    (let [payload (try (json/encode (body resource)) (catch Exception _ nil))
          path (if (:native-operator-profile-id resource) "reconciliation" "admission")
          stream (atom nil)
          request (when (and payload (<= (alength (.getBytes payload "UTF-8")) 4096))
                    {:uri (str callback-origin "/api/native/penpot/access/" path)
                     :method :post :timeout 1000
                     :headers {"content-type" "application/json"
                               "x-studio-native-grant-key" grant-key}
                     :body payload})]
      (if-not request
        {:allowed false :authorized false}
        (let [closed (atom false)
              ^CompletableFuture request-future (http/send-async request {:client client :as :input-stream})
              ;; A response arriving after timeout must not leave an unread stream.
              _ (.whenComplete request-future
                  (reify BiConsumer
                    (accept [_ response error]
                      (when-let [input (:body response)]
                        (when @closed
                          (try (.close ^InputStream input) (catch Exception _ nil)))))))
              ^CompletableFuture pending
              (.thenApply request-future
                (reify Function
                  (apply [_ response]
                    (reset! stream (:body response))
                    (with-open [^InputStream input (:body response)]
                      (if (or @closed (not= 200 (:status response)))
                        {:allowed false :authorized false}
                        (let [bytes (.readNBytes input 4097)]
                          (if (> (alength bytes) 4096)
                            {:allowed false :authorized false}
                            (json/decode (String. bytes "UTF-8") :key-fn json/read-kebab-key))))))))]
          (try
            ;; Includes headers AND bounded body consumption; no retry/redirect.
            (let [result (.get pending 1000 TimeUnit/MILLISECONDS)]
              (if (map? result) result {:allowed false :authorized false}))
            (catch Exception _ {:allowed false :authorized false})
            (finally
              (reset! closed true)
              (.cancel pending true)
              (.cancel request-future true)
              (when-let [^InputStream input @stream]
                (try (.close input) (catch Exception _ nil))))))))))
