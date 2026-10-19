;; Original optional integration hook for Penpot ff7a66f (2.18.3).
;; Source only. No native runtime has been changed or five-second result claimed.
(ns app.studio.live
  (:require [app.db :as db]
            [app.http.session :as session]
            [app.http :as-alias http]
            [app.common.time :as ct]
            [app.config :as cf]
            [app.common.exceptions :as ex]
            [app.common.logging :as l]
            [yetti.websocket :as yws]
            [app.msgbus :as mbus]
            [app.studio.access :as access]
            [app.util.websocket :as ws]
            [promesa.exec.csp :as sp]))

(defn enabled? [cfg] (contains? cfg ::access/governed-teams))

(defn- denied! []
  (ex/raise :type :authorization :code :studio-live-access-denied
            :hint "Current Studio brand access is required"))

(defn context
  "Capture authenticated middleware session and decoded token times, not query data."
  [request]
  (let [profile-id (::session/profile-id request)
        native-session (::session/session request)
        {:keys [type claims metadata]} (::http/auth-data request)
        issued-at (if (= 1 (:ver metadata))
                    (:iat claims)
                    (or (:modified-at native-session) (:created-at native-session)))
        expiry (:exp claims)]
    (when (and (#{:cookie :bearer} type) (#{0 1} (:ver metadata))
               (uuid? profile-id) (:id native-session)
               (= profile-id (:profile-id native-session))
               (ct/inst? issued-at)
               (or (not (contains? claims :exp)) (ct/inst? expiry)))
      {:native-profile-id profile-id
       :token-issued-at issued-at
       :token-expires-at expiry
       :native-session (select-keys native-session [:id :profile-id :created-at :modified-at])})))

(defn- current-session?
  [{:keys [native-profile-id native-session token-issued-at token-expires-at]} current]
  (let [now (ct/now)
        max-age (cf/get :auth-token-cookie-max-age session/default-cookie-max-age)
        modified-at (or (:modified-at current) (:created-at current))]
    (and (uuid? native-profile-id)
         (= (:id native-session) (:id current))
         (= native-profile-id (:profile-id current))
         (ct/duration? max-age)
         (ct/inst? modified-at) (ct/inst? token-issued-at)
         ;; Native cookie issuance/optional JWE expiry stays fixed for this socket,
         ;; even if another request renews the database session row.
         (ct/is-before? now (ct/plus token-issued-at max-age))
         (or (nil? token-expires-at) (ct/is-before? now token-expires-at))
         ;; Session manager reads do not apply age filtering; do it explicitly.
         (ct/is-before? now (ct/plus modified-at max-age)))))

(defn session-current?
  "Re-read the actual manager row and apply fixed token and current row expiry."
  [cfg context]
  (try
    (let [id (get-in context [:native-session :id])
          current (when id (session/read-session (::session/manager cfg) id))]
      (boolean (and current (current-session? context current))))
    (catch Throwable _ false)))

(defn file-resource [cfg file-id]
  (when-not (uuid? file-id) (denied!))
  (let [team-id (access/current-file-team (::db/pool cfg) file-id)]
    (when-not (uuid? team-id) (denied!))
    {:kind :file :topic file-id :native-team-id team-id}))

(defn team-resource [team-id]
  (when-not (uuid? team-id) (denied!))
  {:kind :team :topic team-id :native-team-id team-id})

(defn decision
  "Resolve current ownership and preserve only finite credential-free failures."
  [cfg wsp resource operation]
  (let [work (future
               (try
                 (let [same-team? (case (:kind resource)
                                    :team true
                                    :file (= (:native-team-id resource)
                                             (access/current-file-team (::db/pool cfg) (:topic resource)))
                                    false)
                       context (::context wsp)]
                   (cond
                     (not same-team?) {:allowed false :reason :file-team-changed}
                     (not (access/governed-team? cfg (:native-team-id resource))) {:allowed true}
                     (not (session-current? cfg context)) {:allowed false :reason :native-session-invalid}
                     :else (access/authorize-resource cfg
                             {:native-profile-id (:native-profile-id context)
                              :native-team-id (:native-team-id resource)
                              :native-session (:native-session context)
                              :operation operation})))
                 (catch Throwable _ {:allowed false :reason :authority-unavailable})))]
    (try
      (deref work 1000 {:allowed false :reason :check-timeout})
      (finally (when-not (realized? work) (future-cancel work))))))

(defn allowed? [cfg wsp resource operation]
  (true? (:allowed (decision cfg wsp resource operation))))

(defn- subscription-key [resource]
  (if (= :file (:kind resource))
    :app.http.websocket/file-subscription
    :app.http.websocket/team-subscription))

(defn log-fence! [reason]
  (binding [l/*context* nil]
    (l/warn :hint "studio live subscription fenced" :reason reason)))

(defn fence!
  "Purge before closing once. Existing native reconnect must authorize anew."
  ([cfg wsp resource] (fence! cfg wsp resource :authority-denied))
  ([cfg wsp resource reason]
   (let [state (::ws/state wsp)
         k (subscription-key resource)
         [before _] (swap-vals! state
                       (fn [value]
                         (if (::fenced value) value
                           (cond-> (assoc value ::fenced true)
                             (= (:topic resource) (:topic (get value k))) (dissoc k)))))]
     (when-not (::fenced before)
       (let [current (get before k)]
         (try
           (when (= (:topic resource) (:topic current))
             (when-let [channel (:channel current)]
               (sp/close! channel)
               (mbus/purge! (::mbus/msgbus cfg) [channel])))
           (finally
             ;; Never log a callback response, exception, ID, key or session.
             (log-fence! (if (#{:native-session-invalid :file-team-changed
                                :authority-denied :authority-unavailable :check-timeout
                                :subscription-stale} reason) reason :authority-denied))
             (yws/close (::ws/channel wsp) 4003 "Studio live authorization changed"))))))))

(defn check!
  "Called by the native IO loop at a persistent one-second check boundary."
  [cfg wsp]
  (doseq [k [:app.http.websocket/file-subscription
            :app.http.websocket/team-subscription]
          :let [resource (::resource (get @(::ws/state wsp) k))]
          :when (and resource (not (::fenced @(::ws/state wsp))))]
    (let [result (decision cfg wsp resource :read)]
      (when-not (true? (:allowed result))
        (fence! cfg wsp resource (:reason result))))))

(defn allow-output?
  "Drop all late output after fencing; tags never grant a fresh subscription."
  [cfg wsp message]
  (if (::fenced @(::ws/state wsp))
    false
    (if-let [resource (::resource message)]
      (let [current (get @(::ws/state wsp) (subscription-key resource))
            result (if (= (:topic resource) (:topic current))
                     (decision cfg wsp resource :read)
                     {:allowed false :reason :subscription-stale})]
        (if (and (true? (:allowed result)) (not (::fenced @(::ws/state wsp)))) true
          (do (fence! cfg wsp resource (:reason result)) false)))
      true)))

(defn handle-message [cfg delegate wsp message]
  (let [message (dissoc message ::resource)]
    (if-not (enabled? cfg)
      (delegate cfg wsp message)
      (do
       (when (and (::fenced @(::ws/state wsp)) (not (#{:open :close} (:type message)))) (denied!))
       (case (:type message)
        :subscribe-file
        (let [resource (file-resource cfg (:file-id message))]
          (when-not (and (allowed? cfg wsp resource :read) (not (::fenced @(::ws/state wsp)))) (denied!))
          (delegate cfg wsp (assoc message ::resource resource)))
        :subscribe-team
        (let [resource (team-resource (:team-id message))]
          (when-not (and (allowed? cfg wsp resource :read) (not (::fenced @(::ws/state wsp)))) (denied!))
          (delegate cfg wsp (assoc message ::resource resource)))
        :pointer-update
        (let [subscription (:app.http.websocket/file-subscription @(::ws/state wsp))
              resource (::resource subscription)
              result (if (and resource (= (:file-id message) (:topic resource)))
                       (decision cfg wsp resource :write)
                       {:allowed false :reason :subscription-stale})]
          (when-not (and (true? (:allowed result)) (not (::fenced @(::ws/state wsp))))
            (when resource (fence! cfg wsp resource (:reason result)))
            (denied!))
          (delegate cfg wsp message))
        (delegate cfg wsp message))))))
