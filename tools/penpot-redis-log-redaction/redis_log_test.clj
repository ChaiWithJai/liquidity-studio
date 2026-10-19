(ns app.studio.redis-log-test
  (:require [app.redis :as redis]
            [clojure.test :refer [deftest is]]))

(deftest malformed-credential-bearing-uri-is-sanitized
  (let [input "redis://sample-user:sample-password@invalid host:6379/0"
        error (try (#'redis/parse-uri input)
                   nil
                   (catch Exception cause cause))]
    (is (instance? clojure.lang.ExceptionInfo error))
    (is (= "Invalid Redis connection URI" (ex-message error)))
    (is (= {:type :configuration :code :invalid-redis-uri} (ex-data error)))
    (is (nil? (ex-cause error)))
    (is (not (.contains (pr-str (Throwable->map error)) "sample-password")))
    (is (not (.contains (pr-str (Throwable->map error)) "sample-user")))))

(deftest valid-client-uri-keeps-authentication-and-target
  (let [^io.lettuce.core.RedisURI uri
        (#'redis/parse-uri "redis://sample-user:sample-password@127.0.0.1:6379/0")]
    (is (= "127.0.0.1" (.getHost uri)))
    (is (= 6379 (.getPort uri)))
    (is (= 0 (.getDatabase uri)))
    (is (= "sample-user" (.getUsername uri)))
    (is (= "sample-password" (String. ^chars (.getPassword uri))))))
