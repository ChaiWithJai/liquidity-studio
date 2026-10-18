(ns app.studio.access-test
  (:require [clojure.test :refer [deftest is]]
            [app.common.uuid :as uuid]
            [app.studio.access :as access]
            [app.http :as-alias http]
            [app.http.session :as session]
            [app.rpc :as-alias rpc]
            [app.util.services :as sv]
            [yetti.request :as yreq])
  (:import [io.undertow.server HttpServerExchange]
           [io.undertow.util HttpString]))
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
(deftest native-permission-context-enforces-governed-only-and-keeps-private-metadata-narrow
  (let [operator (uuid/parse "55555555-5555-4555-8555-555555555555")
        cfg {::access/governed-teams #{team} ::access/operators {team operator}
             ::access/session-valid? (fn [_ context] (= :verified context))
             ::access/authorize (fn [_] (throw (Exception. "Studio down")))}
        context {:cfg cfg :actual-profile-id operator :private-key true :command "get-team-members"
                 :session-context :verified
                 :resource {:native-profile-id profile :native-session {:id "unused"}}}]
    (binding [access/*request-context* context]
      (is (access/context-team-allowed? team))
      (is (access/context-team-allowed? personal)))
    (binding [access/*request-context* (assoc context :private-key false)]
      (is (not (access/context-team-allowed? team)))
      (is (access/context-team-allowed? personal)))
    (doseq [command ["get-file" "update-file" "create-share-link" "create-team-invitations"
                     "update-team-member-role" "set-file-shared" "import-binfile"]]
      (binding [access/*request-context* (assoc context :command command)]
        (is (not (access/context-team-allowed? team)))
        (is (access/context-team-allowed? personal))))))

(deftest governed-metadata-never-bypasses-current-native-session
  (let [cfg {::access/governed-teams #{team} ::access/operators {team profile}
             ::access/session-valid? (fn [_ _] false)}
        context {:cfg cfg :actual-profile-id profile :private-key true :command "get-team"
                 :session-context :expired}]
    (binding [access/*request-context* context]
      (is (not (access/context-team-allowed? team)))
      (is (access/context-team-allowed? personal)))
    (binding [access/*request-context* (update context :cfg dissoc ::access/session-valid?)]
      (is (not (access/context-team-allowed? team))))))

(deftest rpc-context-uses-authenticated-profile-and-captured-session
  (let [operator (uuid/parse "55555555-5555-4555-8555-555555555555")
        key (apply str (repeat 43 "a"))
        captured (atom [])
        request {::session/profile-id operator
                 ::session/session {:id team :profile-id operator}
                 :headers {"x-studio-native-grant-key" key "x-studio-acting-profile" (str profile)}}
        cfg {::access/governed-teams #{team} ::access/reconciliation-key key
             ::access/capture-session (fn [r] (swap! captured conj r) :captured)
             ::access/session-valid? (fn [_ c] (= c :captured))
             ::access/authorize (fn [r]
                                  (is (= profile (:native-profile-id r)))
                                  (is (= operator (:native-operator-profile-id r)))
                                  (is (= operator (get-in r [:native-session :profile-id])))
                                  {:allowed true})}
        handler (access/wrap-rpc cfg (fn [_ _] (access/context-team-allowed? team)) {::sv/name "get-file"})
        params (with-meta {::rpc/profile-id operator} {::http/request request})]
    (is (handler cfg params))
    (is (= [request] @captured))
    (is (thrown? Exception (handler cfg (with-meta {::rpc/profile-id operator}
                                         {::http/request (assoc-in request [:headers "x-studio-native-grant-key"] "invalid")}))))))

(deftest shared-file-creation-is-denied-only-in-governed-teams
  (let [request {::session/profile-id profile ::session/session {:id team :profile-id profile}}
        cfg {::access/governed-teams #{team}
             ::access/capture-session (constantly :current)
             ::access/session-valid? (fn [_ c] (= c :current))
             ::access/authorize (constantly {:allowed true})}
        handler (access/wrap-rpc cfg (fn [_ params] (access/context-team-allowed? (:team params)))
                                {::sv/name "create-file"})
        params (fn [team-id shared] (with-meta {:team team-id :is-shared shared} {::http/request request}))]
    (is (handler cfg (params team false)))
    (is (handler cfg (with-meta {:team team} {::http/request request})))
    (is (not (handler cfg (params team true))))
    (is (handler cfg (params personal true)))))

(deftest actual-ring2-request-private-metadata-uses-header-protocol
  (let [key (apply str (repeat 43 "a"))
        make-request (fn [presented]
                       (let [exchange (HttpServerExchange. nil)]
                         (.put (.getRequestHeaders exchange) (HttpString. "x-studio-native-grant-key") presented)
                         (assoc (yreq/->Request :get "/api/rpc/command/get-project" exchange)
                                ::session/profile-id profile ::session/session {:id team :profile-id profile})))
        cfg {::access/governed-teams #{team} ::access/operators {team profile}
             ::access/reconciliation-key key ::access/capture-session (constantly :current)
             ::access/session-valid? (fn [_ c] (= c :current))
             ::access/authorize (fn [_] (throw (Exception. "No ordinary operator fallback")))}
        handler (access/wrap-rpc cfg (fn [_ _] (access/context-team-allowed? team)) {::sv/name "get-project"})
        request (make-request key)]
    (is (yreq/request? request))
    (is (nil? (:headers request)))
    (is (= key (yreq/get-header request "x-studio-native-grant-key")))
    (is (handler cfg (with-meta {::rpc/profile-id profile} {::http/request request})))
    (is (not (handler cfg (with-meta {::rpc/profile-id profile} {::http/request (make-request "invalid")}))))))
