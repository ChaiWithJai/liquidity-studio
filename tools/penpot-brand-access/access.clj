;; Original optional policy helpers for pinned Penpot ff7a66f (2.18.3).
;; Constructor configuration is private; browser data never classifies governance.
(ns app.studio.access
  (:require [app.db :as db]
            [app.common.exceptions :as ex]
            [app.common.uuid :as uuid]))

(defn denied! []
  (ex/raise :type :authorization :code :studio-native-access-denied
            :hint "Current Studio brand access is required"))

(defn file-team [pool id]
  (when-not (uuid? id) (denied!))
  (:team-id (db/exec-one! pool
              ["SELECT p.team_id FROM file f JOIN project p ON p.id=f.project_id WHERE f.id=? AND f.deleted_at IS NULL AND p.deleted_at IS NULL" id])))

(defn project-team [pool id]
  (when-not (uuid? id) (denied!))
  (:team-id (db/exec-one! pool
              ["SELECT team_id FROM project WHERE id=? AND deleted_at IS NULL" id])))

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
