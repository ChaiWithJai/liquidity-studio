(ns app.studio.reconciliation-test
  (:require [clojure.test :refer [deftest is]]
            [app.rpc.commands.studio-access :as reconcile]
            [app.studio.access :as access]
            [app.common.uuid :as uuid]
            [app.db :as db]
            [app.http :as-alias http]
            [app.rpc :as-alias rpc]
            [yetti.request :as yreq])
  (:import [io.undertow.server HttpServerExchange]
           [io.undertow.util HttpString]))
(def operation {:intent-id "intent-one" :expected-epoch 0 :grant-epoch 1 :present true :operator-id "operator-one"})
(deftest epoch-cas-and-exact-replay
  (is (= :apply (reconcile/epoch-action {:epoch 0} operation)))
  (let [receipt {:epoch 1 :intent "intent-one" :present true :operator "operator-one"}]
    (is (= :replay (reconcile/epoch-action receipt operation)))
    (doseq [changed [(assoc operation :intent-id "other") (assoc operation :present false)
                     (assoc operation :operator-id "other") (assoc operation :grant-epoch 2)]]
      (is (thrown? Exception (reconcile/epoch-action receipt changed)))))
  (is (thrown? Exception (reconcile/epoch-action {:epoch 2} operation))))
(deftest actual-membership-must-match-even-on-replay
  (is (reconcile/exact-membership? {:is-owner false :is-admin false :can-edit true} true))
  (is (reconcile/exact-membership? nil false))
  (doseq [member [nil {:is-owner true :is-admin false :can-edit true}
                   {:is-owner false :is-admin true :can-edit true}
                   {:is-owner false :is-admin false :can-edit false}]]
    (is (not (reconcile/exact-membership? member true))))
  (is (not (reconcile/exact-membership? {:is-owner false :can-edit true} false))))

(deftest installed-feature-readback-is-constructor-only-and-fails-closed
  (is (= {:rpc-policy false :session false :live false :assets false}
         (reconcile/installed-features {})))
  (is (= {:rpc-policy "v1" :session "v1" :live "v1" :assets false}
         (reconcile/installed-features {::access/installed-features
                                       {:rpc-policy "v1" :session "v1" :live "v1" :assets true :untrusted "v1"}}))))

(deftest private-status-and-reconciliation-read-real-ring2-headers
  (let [team (uuid/parse "11111111-1111-4111-8111-111111111111")
        profile (uuid/parse "33333333-3333-4333-8333-333333333333")
        key (apply str (repeat 43 "a"))
        exchange (HttpServerExchange. nil)
        _ (.put (.getRequestHeaders exchange) (HttpString. "x-studio-native-grant-key") key)
        request (yreq/->Request :post "/api/rpc/command/studio-access-status" exchange)
        params (with-meta {::rpc/profile-id profile :team-id team} {::http/request request})
        called (atom false)
        cfg {::access/governed-teams #{team} ::access/operators {team profile}
             ::access/reconciliation-key key ::access/session-valid? (fn [_ _] true)
             ::access/authorize-reconciliation (fn [_] (reset! called true) {:authorized false})}]
    (is (nil? (:headers request)))
    (binding [access/*request-context* {:cfg cfg :actual-profile-id profile}]
      (with-redefs [db/exec-one! (fn [_ _] {:is-owner true})]
        (is (= profile (:operator-profile-id (reconcile/sm$studio-access-status cfg params))))))
    ;; It must reach the existing current-intent callback, then deny its false
    ;; decision before SQL. A missing raw :headers map used to deny before here.
    (is (thrown? Exception (reconcile/sm$studio-reconcile-team-member cfg params)))
    (is (true? @called))))
