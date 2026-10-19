(ns app.studio.http-authority-test
  (:require [clojure.test :refer [deftest is]]
            [app.common.json :as json]
            [app.common.uuid :as uuid]
            [app.http.client :as client]
            [app.studio.http-authority :as authority]
            [java-http-clj.core :as http])
  (:import [java.io ByteArrayInputStream]
           [java.util.concurrent CompletableFuture]))
(deftest fixed-private-body-and-bounded-response
  (let [calls (atom [])
        native-client (http/build-client {:follow-redirects :never})
        read-authority (authority/create {::client/client native-client :grant-key (apply str (repeat 43 "a"))
                                         :callback-origin "http://host.docker.internal:39044"})
        profile (uuid/parse "33333333-3333-4333-8333-333333333333")
        session (uuid/parse "44444444-4444-4444-8444-444444444444")
        resource {:native-profile-id profile :native-team-id (uuid/parse "11111111-1111-4111-8111-111111111111") :operation :read
                  :native-session {:id session :profile-id profile :cookie "never-forward"}}]
    (with-redefs [http/send-async (fn [request options]
                                  (swap! calls conj request)
                                  (CompletableFuture/completedFuture {:status 200 :body (ByteArrayInputStream. (.getBytes "{\"allowed\":true}" "UTF-8"))}))]
      (is (= false (:allowed (read-authority (assoc-in resource [:native-session :id] "legacy-raw-cookie-token")))))
      (is (empty? @calls))
      (is (= true (:allowed (read-authority resource))))
      (let [request (first @calls), payload (json/decode (:body request))]
        (is (= "http://host.docker.internal:39044/api/native/penpot/access/admission" (:uri request)))
        (is (= 1000 (:timeout request)))
        (is (= (str session) (get-in payload ["nativeSession" "id"])))
        (is (not (.contains (:body request) "never-forward")))
        (is (nil? (get-in request [:headers "cookie"])))))
    (with-redefs [http/send-async (fn [_ _] (CompletableFuture/completedFuture {:status 200 :body (ByteArrayInputStream. (byte-array 4097))}))]
      (is (= false (:allowed (read-authority resource)))))
    (is (thrown? Exception (authority/create {::client/client native-client :grant-key (apply str (repeat 43 "a"))
                                             :callback-origin "http://other.test:39044"})))))
(deftest completed-headers-do-not-run-blocked-body-inline-before-deadline
  (let [gate (java.util.concurrent.CountDownLatch. 1)
        closed (atom false)
        input (proxy [java.io.InputStream] []
                (read [] (.await gate 5 java.util.concurrent.TimeUnit/SECONDS) -1)
                (close [] (reset! closed true) (.countDown gate)))
        native-client (http/build-client {:follow-redirects :never})
        read-authority (authority/create {::client/client native-client :grant-key (apply str (repeat 43 "a"))
                                         :callback-origin "http://host.docker.internal:39044"})
        profile (uuid/parse "33333333-3333-4333-8333-333333333333")
        resource {:native-profile-id profile :native-team-id (uuid/parse "11111111-1111-4111-8111-111111111111") :operation :read
                  :native-session {:id (uuid/parse "44444444-4444-4444-8444-444444444444") :profile-id profile}}
        start (System/nanoTime)]
    (with-redefs [http/send-async (fn [_ _] (CompletableFuture/completedFuture {:status 200 :body input}))]
      (is (= false (:allowed (read-authority resource))))
      (is @closed)
      ;; A functional deadline check, not a latency/performance benchmark.
      ;; The old inline body callback blocks for five seconds before get(timeout).
      (is (< (/ (- (System/nanoTime) start) 1000000.0) 3000.0)))))
(deftest administrative-transport-keeps-acting-human-separate-from-actual-session
  (let [calls (atom [])
        native-client (http/build-client {:follow-redirects :never})
        read-authority (authority/create {::client/client native-client :grant-key (apply str (repeat 43 "a"))
                                         :callback-origin "http://host.docker.internal:39044"})
        operator (uuid/parse "55555555-5555-4555-8555-555555555555")
        person (uuid/parse "33333333-3333-4333-8333-333333333333")
        session (uuid/parse "44444444-4444-4444-8444-444444444444")]
    (with-redefs [http/send-async (fn [request _]
                                  (swap! calls conj request)
                                  (CompletableFuture/completedFuture {:status 200 :body (ByteArrayInputStream. (.getBytes "{\"allowed\":true}" "UTF-8"))}))]
      (is (:allowed (read-authority {:native-profile-id person :native-operator-profile-id operator
                                    :native-team-id (uuid/parse "11111111-1111-4111-8111-111111111111") :operation :write
                                    :native-session {:id session :profile-id operator}})))
      (let [request (first @calls) payload (json/decode (:body request))]
        (is (.endsWith (:uri request) "/admission"))
        (is (= (str operator) (get payload "nativeOperatorProfileId")))
        (is (= (str person) (get payload "nativeProfileId")))
        (is (= (str operator) (get-in payload ["nativeSession" "profileId"])))))))

(deftest private-compose-callback-is-a-finite-constructor-alias
  (let [native-client (http/build-client {:follow-redirects :never})
        settings {::client/client native-client :grant-key (apply str (repeat 43 "a"))}]
    (is (fn? (authority/create (assoc settings :callback-origin "http://studio-native-connect:39044"))))
    (doseq [origin ["http://studio-native-connect:39044/path" "http://studio-native-connect.evil:39044" "http://other:39044"]]
      (is (thrown? IllegalArgumentException (authority/create (assoc settings :callback-origin origin)))))))

(deftest only-finite-authority-denial-or-unavailability-leaves-the-http-adapter
  (let [native-client (http/build-client {:follow-redirects :never})
        callback (authority/create {::client/client native-client :grant-key (apply str (repeat 43 "a"))
                                    :callback-origin "http://host.docker.internal:39044"})
        profile (uuid/parse "33333333-3333-4333-8333-333333333333")
        resource {:native-profile-id profile :native-team-id profile :operation :read
                  :native-session {:id profile :profile-id profile}}]
    (doseq [[status expected] [[401 :authority-denied] [403 :authority-denied] [500 :authority-unavailable] [504 :authority-unavailable]]]
      (with-redefs [http/send-async (fn [_ _] (CompletableFuture/completedFuture
                                             {:status status :body (ByteArrayInputStream. (.getBytes "private arbitrary response" "UTF-8"))}))]
        (let [result (callback resource)]
          (is (false? (:allowed result)))
          (is (= expected (:reason result)))
          (is (= #{:allowed :authorized :reason} (set (keys result)))))))))

(deftest managed-deadline-retains-authorized-response-beyond-local-default
  (let [native-client (http/build-client {:follow-redirects :never})
        response (CompletableFuture.)
        entered (java.util.concurrent.CountDownLatch. 1)
        done (java.util.concurrent.CountDownLatch. 1)
        read-authority (authority/create {::client/client native-client :grant-key (apply str (repeat 43 "a"))
                                         :callback-origin "http://studio-native-connect:39044" :callback-timeout-ms 3000})
        resource {:native-profile-id (uuid/parse "33333333-3333-4333-8333-333333333333")
                  :native-team-id (uuid/parse "11111111-1111-4111-8111-111111111111") :operation :read
                  :native-session {:id (uuid/parse "44444444-4444-4444-8444-444444444444")
                                   :profile-id (uuid/parse "33333333-3333-4333-8333-333333333333")}}]
    (with-redefs [http/send-async (fn [request _]
                                  (is (= 3000 (:timeout request)))
                                  (.countDown entered) response)]
      (let [result (future (try (read-authority resource) (finally (.countDown done))))]
        (is (.await entered 1 java.util.concurrent.TimeUnit/SECONDS))
        ;; Explicit completion barrier: a valid managed request remains pending
        ;; past the old one-second bound, without retrying or caching an allow.
        (is (false? (.await done 1200 java.util.concurrent.TimeUnit/MILLISECONDS)))
        (.complete response {:status 200 :body (ByteArrayInputStream. (.getBytes "{\"allowed\":true}" "UTF-8"))})
        (is (= true (:allowed (deref result 1500 {:allowed false}))))))
    (doseq [bad [0 999 3001 "3000"]]
      (is (thrown? Exception (authority/create {::client/client native-client :grant-key (apply str (repeat 43 "a"))
                                               :callback-origin "http://studio-native-connect:39044" :callback-timeout-ms bad}))))))
