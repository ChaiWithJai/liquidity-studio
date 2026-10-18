(ns app.studio.reconciliation-test
  (:require [clojure.test :refer [deftest is]]
            [app.rpc.commands.studio-access :as reconcile]
            [app.studio.access :as access]))
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
