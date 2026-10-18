(ns app.studio.assets-test
  (:require [clojure.test :refer [deftest is]]
            [app.db :as db]
            [app.http.session :as session]
            [app.rpc.permissions :as permissions]
            [app.rpc.commands.teams :as teams]
            [app.studio.access :as access]
            [app.studio.assets :as assets]
            [yetti.response :as-alias response]))

(def actor (java.util.UUID/fromString "11111111-1111-4111-8111-111111111111"))
(def governed (java.util.UUID/fromString "22222222-2222-4222-8222-222222222222"))
(def personal (java.util.UUID/fromString "33333333-3333-4333-8333-333333333333"))
(def object-id (java.util.UUID/fromString "44444444-4444-4444-8444-444444444444"))
(def file-id (java.util.UUID/fromString "55555555-5555-4555-8555-555555555555"))
(def object (with-meta {:id object-id :backend :fs} {:bucket "team-font-variant"}))
(def context {:native-profile-id actor :native-session {:id "actual-session" :profile-id actor}})
(def request {::session/profile-id actor})
(def cfg {::access/governed-teams #{governed}
          ::access/capture-session (constantly context)
          ::access/session-valid? (fn [_ _] true)
          ::access/authorize (fn [_] {:allowed true})})
(defn served [] {::response/status 204 ::response/headers {"x-accel-redirect" "/internal/assets/owned"}})

(deftest default-off-and-known-personal-retain-native-response
  (is (= (served) (assets/deliver {} {} object served)))
  (with-redefs [assets/references (fn [_ _] [{:team-id personal}])]
    (is (= (served) (assets/deliver cfg {} object served)))))

(deftest governed-anonymous-denied-and-current-paired-reader-private
  (with-redefs [assets/references (fn [_ _] [{:team-id governed}])
                assets/native-readable? (fn [_ _ _] true)]
    (is (= 403 (::response/status (assets/deliver cfg {} object served))))
    (let [result (assets/deliver cfg request object served)]
      (is (= 204 (::response/status result)))
      (is (= "/internal/assets/owned" (get-in result [::response/headers "x-accel-redirect"])))
      (is (= "private, no-store" (get-in result [::response/headers "cache-control"])))
      (is (= "0" (get-in result [::response/headers "x-accel-expires"]))))))

(deftest foreign-grant-expiry-and-session-deletion-deny-before-bytes
  (with-redefs [assets/references (fn [_ _] [{:team-id governed}])
                assets/native-readable? (fn [_ _ _] true)]
    (doseq [config [(assoc cfg ::access/authorize (fn [_] {:allowed false}))
                    (assoc cfg ::access/session-valid? (fn [_ _] false))
                    (dissoc cfg ::access/capture-session)]]
      (let [called (atom false)
            result (assets/deliver config request object #(do (reset! called true) (served)))]
        (is (= 403 (::response/status result)))
        (is (false? @called))
        (is (= "private, no-store" (get-in result [::response/headers "cache-control"])))))))

(deftest dedup-allows-one-current-reference-not-public-personal-existence
  (with-redefs [assets/references (fn [_ _] [{:team-id governed} {:team-id personal}])]
    (with-redefs [assets/native-readable? (fn [_ _ _] false)]
      (is (= 403 (::response/status (assets/deliver cfg request object served)))))
    (with-redefs [assets/native-readable? (fn [_ _ ref] (= personal (:team-id ref)))]
      (let [config (assoc cfg ::access/authorize (fn [_] (throw (Exception. "No current Studio grant"))))]
        (is (= 204 (::response/status (assets/deliver config request object served)))))))
  (with-redefs [assets/references (fn [_ _] [{:team-id governed} {:team-id personal}])
                assets/native-readable? (fn [_ _ _] true)]
    (is (= 403 (::response/status (assets/deliver cfg {} object served))))))

(deftest missing-reference-and-governed-s3-never-produce-public-redirect
  (with-redefs [assets/references (fn [_ _] [])]
    (is (= 403 (::response/status (assets/deliver cfg request object served)))))
  (with-redefs [assets/references (fn [_ _] [{:team-id governed}])
                assets/native-readable? (fn [_ _ _] true)]
    (let [called (atom false)
          result (assets/deliver cfg request (assoc object :backend :s3)
                                #(do (reset! called true) {::response/status 307}))]
      (is (= 503 (::response/status result)))
      (is (false? @called))
      (is (nil? (get-in result [::response/headers "location"]))))))

(deftest persisted-native-reference-query-never-uses-caller-scope
  (let [seen (atom nil)]
    (with-redefs [db/exec! (fn [_ query] (reset! seen query) [{:team-id governed}])]
      (is (= [{:team-id governed}] (assets/references cfg object)))
      (is (= [object-id object-id object-id object-id] (rest @seen)))
      (is (re-find #"team_font_variant" (first @seen)))))
  (with-redefs [db/exec! (fn [_ _] (repeat 65 {:team-id governed}))]
    (is (thrown? Exception (assets/references cfg object)))))

(deftest session-invalidated-during-response-preparation-has-no-byte-handoff
  (let [current (atom true)
        config (assoc cfg ::access/session-valid? (fn [_ _] @current))]
    (with-redefs [assets/references (fn [_ _] [{:team-id governed}])
                  assets/native-readable? (fn [_ _ _] true)]
      (let [result (assets/deliver config request object #(do (reset! current false) (served)))]
        (is (= 403 (::response/status result)))
        (is (nil? (get-in result [::response/headers "x-accel-redirect"])))
        (is (= "private, no-store" (get-in result [::response/headers "cache-control"])))))))

(deftest deleted-reference-stays-classified-but-cannot-authorize-bytes
  (with-redefs [access/current-file-team (fn [_ _] nil)
                permissions/get-file-read-permissions (fn [& _] {:can-read true})
                teams/get-read-permissions (fn [& _] {:can-read true})]
    (is (false? (assets/native-readable? cfg actor {:file-id file-id :team-id governed})))
    (is (false? (assets/native-readable? cfg actor {:team-id governed :live false})))
    (is (true? (assets/native-readable? cfg actor {:team-id governed :live true})))))
