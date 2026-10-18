;; Original optional integration hook for Penpot ff7a66f (2.18.3).
;; Source only. No native runtime has been changed or five-second result claimed.
(ns app.studio.live
  (:require [app.db :as db]
            [app.http.session :as session]
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
  "Capture only server-authenticated middleware fields, never WS query session-id."
  [request]
  (let [profile-id (::session/profile-id request)
        native-session (::session/session request)]
    (when (and (uuid? profile-id) (:id native-session)
               (= profile-id (:profile-id native-session)))
      {:native-profile-id profile-id
       :native-session (select-keys native-session [:id :profile-id :created-at :modified-at])})))

(defn file-resource [cfg file-id]
  (when-not (uuid? file-id) (denied!))
  (let [team-id (access/file-team (::db/pool cfg) file-id)]
    (when-not (uuid? team-id) (denied!))
    {:kind :file :topic file-id :native-team-id team-id}))

(defn team-resource [team-id]
  (when-not (uuid? team-id) (denied!))
  {:kind :team :topic team-id :native-team-id team-id})

(defn allowed?
  "One bounded current check. Ungoverned personal teams stay on native ACLs.
   The constructor callback is also required to have an interruptible <=1s I/O
   deadline; this outer deadline denies and cancels instead of caching authority."
  [cfg wsp resource operation]
  (if-not (access/governed-team? cfg (:native-team-id resource))
    true
    (let [work (future
                 (try
                   (let [{:keys [native-profile-id native-session]} (::context wsp)
                         current (when (:id native-session)
                                   (session/read-session (::session/manager cfg) (:id native-session)))]
                     (and (uuid? native-profile-id)
                          (= (:id native-session) (:id current))
                          (= native-profile-id (:profile-id current))
                          ;; A moved/deleted file cannot retain its old scope.
                          (or (= :team (:kind resource))
                              (= (:native-team-id resource)
                                 (access/file-team (::db/pool cfg) (:topic resource))))
                          (true? (:allowed
                                   (access/authorize-resource cfg
                                     {:native-profile-id native-profile-id
                                      :native-team-id (:native-team-id resource)
                                      :native-session (select-keys current [:id :profile-id :created-at :modified-at])
                                      :operation operation})))))
                   (catch Throwable _ false)))]
      (try (true? (deref work 1000 false))
           (finally (when-not (realized? work) (future-cancel work)))))))

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
