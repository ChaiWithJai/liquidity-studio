;; Original optional policy helpers for pinned Penpot ff7a66f (2.18.3).
;; Constructor configuration is private; browser data never classifies governance.
(ns app.studio.access
  (:require [app.db :as db]
            [app.common.exceptions :as ex]
            [app.common.uuid :as uuid]
            [app.http :as-alias http]
            [app.http.session :as session]
            [app.rpc :as-alias rpc]
            [app.util.services :as sv]))

(defn denied! []
  (ex/raise :type :authorization :code :studio-native-access-denied
            :hint "Current Studio brand access is required"))

(defn file-team [pool id]
  (when-not (uuid? id) (denied!))
  (:team-id (db/exec-one! pool
              ["SELECT p.team_id FROM file f JOIN project p ON p.id=f.project_id WHERE f.id=?" id])))

(defn project-team [pool id]
  (when-not (uuid? id) (denied!))
  (:team-id (db/exec-one! pool
              ["SELECT team_id FROM project WHERE id=?" id])))

(defn governed-team? [cfg team-id]
  (contains? (::governed-teams cfg #{}) team-id))

(defn authorize-resource
  "Classification is LOCAL, not a decision returned by the authority callback.
   native-session is supplied by native middleware/C3, never a WS query UUID.
   Unknown/failed authority denies a governed team; personal teams retain native ACL."
  [cfg {:keys [native-profile-id native-team-id] :as resource}]
  (when-not (uuid? native-team-id) (denied!))
  (if-not (governed-team? cfg native-team-id)
    {:governed false :allowed true}
    {:governed true
     :allowed (boolean
                (and (uuid? native-profile-id)
                     (::authorize cfg)
                     (try (true? (:allowed ((::authorize cfg) resource)))
                          (catch Exception _ false))))}))

(defn assert-team! [cfg resource]
  (when-not (:allowed (authorize-resource cfg resource)) (denied!)))

(defn assert-file! [cfg resource file-id]
  (let [team-id (file-team (::db/pool cfg) file-id)]
    (assert-team! cfg (assoc resource :native-team-id team-id))))

;; Native RPC binds this around its complete authenticated dispatch, including
;; conditional reads. Existing permission helpers receive only a DB connection.
(def ^:dynamic *request-context* nil)

(def ^:private metadata-commands
  #{"get-project" "get-team" "get-team-members" "get-font-variants"})
(def ^:private denied-governed-mutations
  #{"create-share-link" "set-file-shared" "create-team-invitations"
    "update-team-invitation-role" "get-team-invitation-token"
    "update-team-member-role" "delete-team-member" "leave-team" "delete-team"
    "create-team-access-request" "move-files" "move-project" "duplicate-file"
    "duplicate-project" "import-binfile"})

(defn private-key? [expected presented]
  (and (string? expected) (re-matches #"[A-Za-z0-9_-]{43}" expected)
       (string? presented) (re-matches #"[A-Za-z0-9_-]{43}" presented)
       (java.security.MessageDigest/isEqual (.getBytes expected "UTF-8") (.getBytes presented "UTF-8"))))

(defn- operation []
  (if (.startsWith ^String (:command *request-context* "") "get-") :read :write))

(defn current-rpc-session? []
  (let [{:keys [cfg session-context]} *request-context*]
    (and (::session-valid? cfg)
         (try (true? ((::session-valid? cfg) cfg session-context)) (catch Exception _ false)))))

(defn context-team-allowed? [team-id]
  (if-not *request-context*
    true
    (let [{:keys [cfg resource private-key command actual-profile-id session-context]} *request-context*]
      (if-not (governed-team? cfg team-id)
        true
        (and (current-rpc-session?)
             (not (contains? denied-governed-mutations command))
             (or
              ;; Exact private administrative metadata only; not files/content,
              ;; invitations, role changes or human editor owner fallback.
              (and private-key (contains? metadata-commands command)
                   (= actual-profile-id (get (::operators cfg) team-id)))
              (:allowed (authorize-resource cfg (assoc resource :native-team-id team-id :operation (operation))))))))))

(defn guard-team! [team-id]
  (when-not (context-team-allowed? team-id) (denied!)))

(defn guard-file! [conn file-id]
  (when *request-context*
    (let [team-id (file-team conn file-id)]
      (when-not (uuid? team-id) (denied!))
      (guard-team! team-id))))

(defn guard-project! [conn project-id]
  (when *request-context*
    (let [team-id (project-team conn project-id)]
      (when-not (uuid? team-id) (denied!))
      (guard-team! team-id))))

(defn guard-library! [conn file-id library-id]
  (when *request-context*
    (let [cfg (:cfg *request-context*)
          source (file-team conn file-id) target (file-team conn library-id)]
      (when-not (and (uuid? source) (uuid? target)) (denied!))
      (when (and (not= source target)
                 (or (governed-team? cfg source) (governed-team? cfg target)))
        (denied!))
      (guard-team! target))))

(defn wrap-rpc [cfg f mdata]
  (if-not (contains? cfg ::governed-teams)
    f
    (fn [native-cfg params]
      (let [request (::http/request (meta params))
            actual (::session/profile-id request)
            native-session (::session/session request)
            session-context (when-let [capture (::capture-session cfg)] (capture request))
            key? (private-key? (::reconciliation-key cfg) (get-in request [:headers "x-studio-native-grant-key"]))
            acting-header (get-in request [:headers "x-studio-acting-profile"])
            acting (when (and key? acting-header) (uuid/parse* acting-header))
            resource (cond-> {:native-profile-id (or acting actual)
                              :native-session (select-keys native-session [:id :profile-id :created-at :modified-at])}
                       acting (assoc :native-operator-profile-id actual))]
        (when (and acting-header (or (not key?) (not (uuid? acting)))) (denied!))
        (binding [*request-context* {:cfg cfg :resource resource :actual-profile-id actual
                                    :private-key key? :session-context session-context :command (::sv/name mdata)}]
          (f native-cfg params))))))

(defn guard-thread! [conn thread-id]
  (when *request-context*
    (when-not (uuid? thread-id) (denied!))
    (let [row (db/exec-one! conn ["SELECT file_id FROM comment_thread WHERE id=?" thread-id])]
      (when-not (:file-id row) (denied!))
      (guard-file! conn (:file-id row)))))

(defn guard-team-expansion! [team-id]
  (when (and *request-context* (governed-team? (:cfg *request-context*) team-id))
    (denied!)))
