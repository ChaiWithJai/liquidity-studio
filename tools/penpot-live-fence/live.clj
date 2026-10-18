;; Original optional integration hook for Penpot ff7a66f (2.18.3).
;; Source only. No native runtime has been changed or five-second result claimed.
(ns app.studio.live
  (:require [app.db :as db]
            [app.http.session :as session]
            [app.http :as-alias http]
            [app.common.time :as ct]
            [app.config :as cf]
            [app.common.exceptions :as ex]
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
  (let [team-id (access/file-team (::db/pool cfg) file-id)]
    (when-not (uuid? team-id) (denied!))
    {:kind :file :topic file-id :native-team-id team-id}))

(defn team-resource [team-id]
  (when-not (uuid? team-id) (denied!))
  {:kind :team :topic team-id :native-team-id team-id})

(defn allowed?
  "Resolve current ownership first; bound the entire session/authority check."
  [cfg wsp resource operation]
  (let [work
        (future
          (try
            (let [same-team? (case (:kind resource)
                               :team true
                               :file (= (:native-team-id resource)
                                        (access/file-team (::db/pool cfg) (:topic resource)))
                               false)
                  context (::context wsp)]
              (and same-team?
                   (or (not (access/governed-team? cfg (:native-team-id resource)))
                       (and (session-current? cfg context)
                            (true? (:allowed
                                     (access/authorize-resource
                                       cfg
                                       {:native-profile-id (:native-profile-id context)
                                        :native-team-id (:native-team-id resource)
                                        :native-session (:native-session context)
                                        :operation operation})))))))
            (catch Throwable _ false)))]
    (try
      (true? (deref work 1000 false))
      (finally
        (when-not (realized? work) (future-cancel work))))))

(defn- subscription-key [resource]
  (if (= :file (:kind resource))
    :app.http.websocket/file-subscription
    :app.http.websocket/team-subscription))

(defn fence!
  "Purge only the affected subscription. Never erase a native document/buffer."
  [cfg wsp resource]
  (let [state (::ws/state wsp)
        k (subscription-key resource)
        current (get @state k)]
    (when (= (:topic resource) (:topic current))
      (swap! state dissoc k)
      (when-let [channel (:channel current)]
        (sp/close! channel)
        (mbus/purge! (::mbus/msgbus cfg) [channel])))))

(defn check!
  "Called by the native IO loop at a persistent one-second check boundary."
  [cfg wsp]
  (doseq [k [:app.http.websocket/file-subscription
            :app.http.websocket/team-subscription]
          :let [resource (::resource (get @(::ws/state wsp) k))]
          :when resource]
    (when-not (allowed? cfg wsp resource :read)
      (fence! cfg wsp resource))))

(defn allow-output?
  "Channel tags are server-owned. Check queued output too, immediately before send."
  [cfg wsp message]
  (if-let [resource (::resource message)]
    (let [current (get @(::ws/state wsp) (subscription-key resource))]
      (if (and (= (:topic resource) (:topic current))
               (allowed? cfg wsp resource :read))
        true
        (do (fence! cfg wsp resource) false)))
    true))

(defn handle-message [cfg delegate wsp message]
  (let [message (dissoc message ::resource)]
    (if-not (enabled? cfg)
      (delegate cfg wsp message)
      (case (:type message)
        :subscribe-file
        (let [resource (file-resource cfg (:file-id message))]
          (when-not (allowed? cfg wsp resource :read) (denied!))
          (delegate cfg wsp (assoc message ::resource resource)))
        :subscribe-team
        (let [resource (team-resource (:team-id message))]
          (when-not (allowed? cfg wsp resource :read) (denied!))
          (delegate cfg wsp (assoc message ::resource resource)))
        :pointer-update
        (let [subscription (:app.http.websocket/file-subscription @(::ws/state wsp))
              resource (::resource subscription)]
          (when-not (and resource (= (:file-id message) (:topic resource))
                         (allowed? cfg wsp resource :write))
            (when resource (fence! cfg wsp resource))
            (denied!))
          (delegate cfg wsp message))
        (delegate cfg wsp message)))))
