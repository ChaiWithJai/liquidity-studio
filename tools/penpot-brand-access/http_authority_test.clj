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
