;; Original optional policy hook for pinned Penpot ff7a66f (2.18.3).
;; Source only: not built, wired, or enabled. No protocol relay or credentials.
(ns app.studio.access
  (:require [app.db :as db]
            [app.common.exceptions :as ex]
            [app.common.uuid :as uuid]
            [app.rpc :as-alias rpc]
            [app.util.services :as sv]))

(defn- denied! []
  (ex/raise :type :authorization :code :studio-native-access-denied
            :hint "Current Studio brand access is required"))

(defn- file-team [pool id]
  (when-not (uuid? id) (denied!))
  (:team-id (db/exec-one! pool
              ["SELECT p.team_id FROM file f JOIN project p ON p.id=f.project_id WHERE f.id=? AND f.deleted_at IS NULL AND p.deleted_at IS NULL" id])))

(defn- project-team [pool id]
  (when-not (uuid? id) (denied!))
  (:team-id (db/exec-one! pool
              ["SELECT team_id FROM project WHERE id=? AND deleted_at IS NULL" id])))

(defn wrap
  "Install before spec-conform/validation/auth wrappers are applied in app.rpc/wrap.
   authorize is a constructor-only current-authority function, not browser metadata.
   Without it, existing operator/personal runtime behavior is unchanged.
   Configured governed runtime fails closed; C2 callback always denies admission."
  [{:keys [::authorize ::db/pool]} f mdata]
  (if-not authorize
    f
    (fn [cfg params]
      (let [profile-id (::rpc/profile-id params)
            command (::sv/name mdata)]
        (when-not (uuid? profile-id) (denied!))
        (if (= command "get-profile")
          (f cfg params)
          (let [[team-id operation]
                (case command
                  "get-file" [(file-team pool (:id params)) :read]
                  "update-file" [(file-team pool (:id params)) :write]
                  "get-project" [(project-team pool (:id params)) :read]
                  "get-team" [(:id params) :read]
                  "get-team-members" [(:team-id params) :read]
                  ;; Sharing is not an ordinary editor permission in Studio.
                  "create-share-link" (denied!)
                  ;; Indirect commands are added only with exact native ownership
                  ;; resolution and focused checks. No caller-declared team bypass.
                  (denied!))]
            (when-not (uuid? team-id) (denied!))
            (when-not (true? (:allowed (authorize {:native-profile-id profile-id
                                                 :native-team-id team-id
                                                 :operation operation})))
              (denied!))
            (f cfg params)))))))
