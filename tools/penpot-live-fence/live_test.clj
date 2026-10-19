(ns app.studio.live-test
  (:require [clojure.test :refer [deftest is testing use-fixtures]]
            [app.http.session :as session]
            [app.http :as-alias http]
            [app.common.time :as ct]
            [app.config :as cf]
            [app.studio.access :as access]
            [app.studio.live :as live]
            [app.db :as db]
            [app.msgbus :as mbus]
            [app.util.websocket :as ws]
            [promesa.exec.csp :as sp]
            [yetti.websocket :as yws]))

(use-fixtures :each (fn [run] (with-redefs [yws/close (fn [_ _ _] nil)] (run))))

(def profile (java.util.UUID/fromString "11111111-1111-4111-8111-111111111111"))
(def team (java.util.UUID/fromString "22222222-2222-4222-8222-222222222222"))
(def personal (java.util.UUID/fromString "33333333-3333-4333-8333-333333333333"))
(def file (java.util.UUID/fromString "44444444-4444-4444-8444-444444444444"))
(def client-session (java.util.UUID/fromString "55555555-5555-4555-8555-555555555555"))

(defn fixture []
  (let [manager (session/inmemory-manager)
        authenticated (session/create-session manager {:profile-id profile})
        allowed (atom true)
        calls (atom [])
        cfg {::access/governed-teams #{team}
             ::access/authorize (fn [resource] (swap! calls conj resource) {:allowed @allowed})
             ::session/manager manager ::db/pool nil}
        wsp {::live/context (live/context {::session/profile-id profile
                                          ::session/session authenticated
                                          ::http/auth-data {:type :cookie :metadata {:ver 1}
                                                            :claims {:iat (:modified-at authenticated)}}
                                          :params {:session-id client-session}})
             ::ws/state (atom {})}]
    {:cfg cfg :wsp wsp :manager manager :authenticated authenticated :allowed allowed :calls calls}))

(deftest middleware-session-is-authority-not-client-correlation-id
  (let [{:keys [cfg wsp manager authenticated calls]} (fixture)
        resource (live/team-resource team)]
    (is (live/allowed? cfg wsp resource :read))
    (is (= (:id authenticated) (get-in @calls [0 :native-session :id])))
    (is (not= client-session (get-in @calls [0 :native-session :id])))
    (session/delete-session manager (:id authenticated))
    (is (false? (live/allowed? cfg wsp resource :read)))
    (is (= 1 (count @calls)) "A deleted native session never reaches the Studio callback")))

(deftest current-denial-purges-affected-subscription-and-drops-queued-output
  (let [{:keys [cfg wsp allowed]} (fixture)
        resource {:kind :file :topic file :native-team-id team}
        channel (sp/chan) personal-channel (sp/chan)
        purged (atom [])]
    (swap! (::ws/state wsp) assoc
      :editor-buffer "UNSAVED HUMAN TEXT"
      :app.http.websocket/file-subscription {:topic file :channel channel ::live/resource resource}
      :app.http.websocket/team-subscription {:topic personal :channel personal-channel
                                            ::live/resource (live/team-resource personal)})
    (with-redefs [access/current-file-team (fn [_ _] team)
                  mbus/purge! (fn [_ channels] (swap! purged into channels))]
      (is (live/allow-output? cfg wsp {::live/resource resource :type :file-change}))
      (reset! allowed false) ; models durable membership revocation or natural grant expiry
      (live/check! cfg wsp)
      (is (nil? (:app.http.websocket/file-subscription @(::ws/state wsp))))
      (is (= personal (:topic (:app.http.websocket/team-subscription @(::ws/state wsp)))))
      (is (= "UNSAVED HUMAN TEXT" (:editor-buffer @(::ws/state wsp))))
      (is (= [channel] @purged))
      (is (false? (live/allow-output? cfg wsp {::live/resource resource :type :file-change}))))
    (sp/close! personal-channel)))

(deftest personal-access-does-not-depend-on-studio-and-file-moves-do-not-keep-old-authority
  (let [{:keys [cfg wsp calls]} (fixture)]
    (is (live/allowed? (assoc cfg ::access/authorize (fn [_] (throw (Exception. "offline"))))
                      wsp (live/team-resource personal) :read))
    (is (empty? @calls))
    (with-redefs [access/current-file-team (fn [_ _] personal)]
      (is (false? (live/allowed? cfg wsp {:kind :file :topic file :native-team-id team} :read))))))

(deftest personal-file-moved-into-governed-team-or-deleted-loses-old-classification
  (let [{:keys [cfg wsp calls]} (fixture)
        resource {:kind :file :topic file :native-team-id personal}
        channel (sp/chan)
        purged (atom [])]
    (swap! (::ws/state wsp) assoc :app.http.websocket/file-subscription
      {:topic file :channel channel ::live/resource resource})
    (with-redefs [access/current-file-team (fn [_ _] personal)]
      (is (live/allowed? cfg wsp resource :read))
      (is (empty? @calls) "Unchanged personal files do not call Studio"))
    (with-redefs [access/current-file-team (fn [_ _] team)
                  mbus/purge! (fn [_ channels] (swap! purged into channels))]
      (is (false? (live/allowed? cfg wsp resource :write)))
      (is (false? (live/allow-output? cfg wsp {::live/resource resource :type :file-change})))
      (is (nil? (:app.http.websocket/file-subscription @(::ws/state wsp))))
      (is (= [channel] @purged)))
    (with-redefs [access/current-file-team (fn [_ _] nil)]
      (is (false? (live/allowed? cfg wsp resource :read))))
    (is (empty? @calls) "A changed/deleted file is fenced before Studio admission")))

(deftest pointer-must-match-authorized-current-subscription-and-client-tags-are-stripped
  (let [{:keys [cfg wsp]} (fixture)
        resource {:kind :file :topic file :native-team-id team}
        delegated (atom [])
        delegate (fn [_ _ message] (swap! delegated conj message))]
    (swap! (::ws/state wsp) assoc :app.http.websocket/file-subscription {:topic file ::live/resource resource})
    (with-redefs [access/current-file-team (fn [_ _] team)]
      (live/handle-message cfg delegate wsp {:type :pointer-update :file-id file ::live/resource {:topic personal}})
      (is (nil? (::live/resource (first @delegated))))
      (is (thrown? Exception (live/handle-message cfg delegate wsp {:type :pointer-update :file-id personal})))
      (is (= 1 (count @delegated))))))

(deftest native-cookie-age-expires-even-when-another-request-renews-the-session-row
  (let [{:keys [cfg wsp manager authenticated calls]} (fixture)
        issued-at (:modified-at authenticated)
        clock (atom (ct/plus issued-at (ct/duration {:seconds 9})))
        original-get cf/get]
    (with-redefs [ct/now (fn [] @clock)
                  cf/get (fn [key fallback] (if (= key :auth-token-cookie-max-age)
                                            (ct/duration {:seconds 10}) (original-get key fallback)))]
      (is (live/allowed? cfg wsp (live/team-resource team) :read))
      (session/update-session manager authenticated)
      (is (= @clock (:modified-at (session/read-session manager (:id authenticated)))))
      (reset! clock (ct/plus issued-at (ct/duration {:seconds 10})))
      (is (some? (session/read-session manager (:id authenticated))) "The row still exists")
      (is (false? (live/allowed? cfg wsp (live/team-resource team) :read)))
      (is (= 1 (count @calls)) "Expiry denies before the Studio callback"))))

(deftest decoded-token-expiry-and-current-row-age-are-independent-bounds
  (let [{:keys [cfg wsp authenticated calls]} (fixture)
        issued-at (:modified-at authenticated)
        now (ct/plus issued-at (ct/duration {:seconds 11}))
        context (live/context {::session/profile-id profile ::session/session authenticated
                               ::http/auth-data {:type :bearer :metadata {:ver 1}
                                                 :claims {:iat issued-at :exp (ct/plus issued-at (ct/duration {:seconds 5}))}}})
        max-age (atom (ct/duration {:seconds 100}))
        original-get cf/get]
    (with-redefs [ct/now (constantly now)
                  cf/get (fn [key fallback] (if (= key :auth-token-cookie-max-age)
                                            @max-age (original-get key fallback)))]
      (is (false? (live/allowed? cfg (assoc wsp ::live/context context) (live/team-resource team) :read)))
      (reset! max-age (ct/duration {:seconds 10}))
      ;; A newer token time cannot make an aged native database row current.
      (is (false? (live/allowed? cfg (assoc wsp ::live/context
                                     (assoc context :token-issued-at now :token-expires-at nil))
                                (live/team-resource team) :read)))
      (is (empty? @calls)))
    (is (nil? (live/context {::session/profile-id profile ::session/session authenticated
                             ::http/auth-data {:type :cookie :metadata {:ver 1}
                                               :claims {:iat issued-at :exp "untrusted time string"}}})))))

(deftest stalled-authority-denies-with-a-bounded-check
  (let [{:keys [cfg wsp]} (fixture)
        started (promise) release (promise)
        cfg (assoc cfg ::access/authorize (fn [_] (deliver started true) @release {:allowed true}))]
    (try
      (is (false? (live/allowed? cfg wsp (live/team-resource team) :read)))
      (is (realized? started))
      (finally (deliver release true)))))

(deftest live-lookup-retains-current-only-sql-while-rpc-classifies-deleted-records
  (let [{:keys [cfg wsp calls]} (fixture)
        queries (atom [])
        resource {:kind :file :topic file :native-team-id personal}]
    ;; Exercise both real access helpers, not a redefinition of their result.
    ;; This bounded query contract double represents a deleted row still present
    ;; for native RPC classification, but absent from current-only ownership.
    (with-redefs [db/exec-one!
                  (fn [_ [sql id]]
                    (swap! queries conj [sql id])
                    (when-not (and (re-find #"f\.deleted_at IS NULL" sql)
                                   (re-find #"p\.deleted_at IS NULL" sql))
                      {:team-id personal}))]
      (is (= personal (access/file-team (::db/pool cfg) file)))
      (is (nil? (access/current-file-team (::db/pool cfg) file)))
      (is (false? (live/allowed? cfg wsp resource :read)))
      (is (false? (live/allowed? cfg wsp resource :write)))
      (is (thrown? Exception (live/file-resource cfg file)))
      (is (empty? @calls))
      (is (= 5 (count @queries))))))

(deftest transient-fence-closes-once-and-fresh-connection-must-authorize-before-output
  (let [{:keys [cfg wsp allowed]} (fixture)
        resource {:kind :file :topic file :native-team-id team}
        channel (sp/chan) purged (atom []) closed (atom []) notices (atom [])
        cfg (assoc cfg ::access/authorize (fn [_] (if @allowed {:allowed true} {:allowed false :reason :authority-unavailable})))
        fresh (assoc wsp ::ws/state (atom {}))
        delegate (fn [_ socket message]
                   (when (= :subscribe-file (:type message))
                     (swap! (::ws/state socket) assoc :app.http.websocket/file-subscription
                            {:topic file ::live/resource (::live/resource message)})))]
    (swap! (::ws/state wsp) assoc :editor-buffer "UNSAVED HUMAN WORDING"
           :app.http.websocket/file-subscription {:topic file :channel channel ::live/resource resource})
    (with-redefs [access/current-file-team (fn [_ _] team)
                  mbus/purge! (fn [_ channels] (swap! purged into channels))
                  yws/close (fn [_ code hint]
                              (is (= [channel] @purged) "Purge precedes socket close")
                              (swap! closed conj [code hint]))
                  live/log-fence! #(swap! notices conj %)]
      (reset! allowed false)
      (live/check! cfg wsp)
      (is (= [:authority-unavailable] @notices))
      (is (= [[4003 "Studio live authorization changed"]] @closed))
      (is (= "UNSAVED HUMAN WORDING" (:editor-buffer @(::ws/state wsp))))
      (live/check! cfg wsp)
      (live/fence! cfg wsp resource :authority-denied)
      (is (false? (live/allow-output? cfg wsp {:type :presence})))
      (is (false? (live/allow-output? cfg wsp {::live/resource resource :type :file-change})))
      (is (= 1 (count @closed))) (is (= 1 (count @notices)))
      ;; Native frontend's existing reconnect emits a new subscribe on a fresh state.
      (is (thrown? Exception (live/handle-message cfg delegate fresh {:type :subscribe-file :file-id file})))
      (is (nil? (:app.http.websocket/file-subscription @(::ws/state fresh))))
      (is (= 1 (count @closed)) "A still-denied new subscription does not create a close loop")
      (reset! allowed true)
      (is (thrown? Exception (live/handle-message cfg delegate wsp {:type :subscribe-file :file-id file})))
      (live/handle-message cfg delegate fresh {:type :subscribe-file :file-id file})
      (is (live/allow-output? cfg fresh {::live/resource resource :type :file-change}))
      (is (false? (live/allow-output? cfg wsp {::live/resource resource :type :file-change})))
      (is (= 1 (count @closed))))))

(deftest fence-reason-log-is-finite-and-never-repeats-for-late-output
  (let [{:keys [cfg wsp]} (fixture) notices (atom []) closed (atom 0)
        resource (live/team-resource team)]
    (with-redefs [live/log-fence! #(swap! notices conj %)
                  yws/close (fn [_ _ _] (swap! closed inc))]
      (live/fence! cfg wsp resource {:unsafe "private callback/token details"})
      (live/fence! cfg wsp resource :native-session-invalid)
      (is (= [:authority-denied] @notices))
      (is (= 1 @closed))
      (is (false? (live/allow-output? cfg wsp {::live/resource resource :type :file-change}))))))
