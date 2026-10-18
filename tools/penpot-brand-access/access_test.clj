(ns app.studio.access-test
  (:require [clojure.test :refer [deftest is]]
            [app.common.uuid :as uuid]
            [app.studio.access :as access]))
(def team (uuid/parse "11111111-1111-4111-8111-111111111111"))
(def personal (uuid/parse "22222222-2222-4222-8222-222222222222"))
(def profile (uuid/parse "33333333-3333-4333-8333-333333333333"))
(deftest classification-is-local-and-preserves-personal-native-policy
  (let [calls (atom [])
        cfg {::access/governed-teams #{team}
             ::access/authorize (fn [resource] (swap! calls conj resource) {:allowed true :governed false})}
        resource {:native-profile-id profile :native-team-id team :operation :read
                  :native-session {:id "actual-native-session" :profile-id profile}}]
    (is (= {:governed true :allowed true} (access/authorize-resource cfg resource)))
    (is (= [resource] @calls))
    (is (= {:governed false :allowed true}
           (access/authorize-resource (assoc cfg ::access/authorize (fn [_] (throw (Exception. "unavailable"))))
                                      (assoc resource :native-team-id personal))))
    (is (= {:governed true :allowed false}
           (access/authorize-resource {::access/governed-teams #{team}} resource)))
    (is (= {:governed true :allowed false}
           (access/authorize-resource (assoc cfg ::access/authorize (fn [_] (throw (Exception. "unavailable")))) resource)))
    (is (= {:governed true :allowed false}
           (access/authorize-resource cfg (dissoc resource :native-profile-id))))))
