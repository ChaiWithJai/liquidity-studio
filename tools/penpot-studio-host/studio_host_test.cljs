(ns frontend-tests.studio-host-test
  (:require [cljs.test :as t]
            [app.main.studio-host :as host]
            [app.main.ui.studio-entry :as entry]))

(t/deftest reports-actual-acknowledgment-not-iframe-readiness
  (let [state {:current-file-id "file" :current-page-id "page"
               :files {"file" {:data {} :revn 7}}
               :persistence {:status :saved :queue []}}]
    (t/is (= "saved" (:status (host/snapshot state "file"))))
    (t/is (= 7 (:revision (host/snapshot state "file"))))
    (t/is (= "clean" (:status (host/snapshot (dissoc state :persistence) "file"))))
    (t/is (= "clean" (:status (host/snapshot (assoc state :persistence {:queue [] :index {}}) "file"))))
    (t/is (= "unknown" (:status (host/snapshot (assoc-in state [:files "file" :revn] nil) "file"))))
    (t/is (= "unknown" (:status (host/snapshot (assoc-in state [:files "file"] {:revn 7}) "file"))))
    (let [pristine (dissoc state :persistence)]
      (t/is (= "unknown" (:status (host/snapshot (assoc-in pristine [:persistence :index] {"commit" {}}) "file"))))
      (t/is (= "unknown" (:status (host/snapshot (assoc-in pristine [:persistence :run-id] "active") "file"))))
      (t/is (= "saving" (:status (host/snapshot (assoc-in pristine [:persistence :queue] ["commit"]) "file"))))
      (t/is (= "editing" (:status (host/snapshot (assoc-in pristine [:workspace-local :edition] "shape") "file")))))
    (t/is (= "unknown" (:status (host/snapshot (assoc state :current-file-id "other") "file"))))
    (t/is (= "editing" (:status (host/snapshot (assoc-in state [:workspace-local :edition] "shape") "file"))))
    (t/is (= "editing" (:status (host/snapshot (assoc-in state [:workspace-local :transform] :move) "file"))))
    (t/is (= "editing" (:status (host/snapshot (assoc-in state [:workspace-drawing :object] {}) "file"))))
    (t/is (= "saving" (:status (host/snapshot (assoc-in state [:persistence :queue] ["pending"]) "file"))))
    (t/is (= "pending" (:status (host/snapshot (assoc-in state [:persistence :status] :pending) "file"))))
    (t/is (= "error" (:status (host/snapshot (assoc-in state [:persistence :status] :error) "file"))))))

(t/deftest login-return-is-only-the-fixed-native-challenge-path
  (t/is (= (str "/studio-connect?challenge=" (apply str (repeat 43 "a")))
           (entry/connection-return-path (apply str (repeat 43 "a")))))
  (t/is (nil? (entry/connection-return-path "https://other.example/")))
  (t/is (nil? (entry/connection-return-path "short"))))

(t/deftest parent-origin-allows-only-explicit-canonical-loopback-development
  (doseq [origin ["https://studio.example.com" "http://localhost:3002"
                  "http://127.0.0.1:39043" "http://[::1]:3002"]]
    (t/is (= origin (host/configured-parent-origin origin))))
  (doseq [origin [nil "http://remote.example:3002" "http://app.localhost:3002"
                  "http://127.0.0.2:3002" "http://localhost" "http://localhost:80"
                  "http://localhost:0" "http://localhost:65536" "http://localhost:03002"
                  "http://localhost:3002/" "http://user@localhost:3002"
                  "http://localhost:3002?next=other"]]
    (t/is (nil? (host/configured-parent-origin origin)))))
