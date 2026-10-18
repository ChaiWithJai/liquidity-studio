;; Original narrow native command; not enabled until reviewed native build/config.
(ns app.rpc.commands.studio-access
  (:require [app.common.exceptions :as ex]
            [app.common.schema :as sm]
            [app.common.uuid :as uuid]
            [app.db :as db]
            [app.http :as-alias http]
            [app.rpc :as-alias rpc]
            [app.nitrate :as nitrate]
            [app.studio.access :as access]
            [app.util.services :as sv]))

(defn- conflict! []
  (ex/raise :type :validation :code :studio-native-grant-conflict
            :hint "Native grant epoch changed; preserve the exact reconciliation intent"))

(defn epoch-action [receipt {:keys [intent-id expected-epoch grant-epoch present operator-id]}]
  (cond
    (not= grant-epoch (inc expected-epoch)) (conflict!)
    (= grant-epoch (:epoch receipt))
    (if (and (= (str intent-id) (:intent receipt))
             (= present (:present receipt))
             (= (str operator-id) (:operator receipt))) :replay (conflict!))
    (= expected-epoch (:epoch receipt)) :apply
    :else (conflict!)))

(defn exact-membership? [member present]
  (if present
    (and member (false? (:is-owner member)) (false? (:is-admin member)) (true? (:can-edit member)))
    (nil? member)))

(def schema:reconcile
  [:map {:title "studio-reconcile-team-member"}
   [:team-id ::sm/uuid] [:member-id ::sm/uuid] [:intent-id ::sm/uuid]
   [:expected-epoch [:int {:min 0 :max 2147483646}]]
   [:grant-epoch [:int {:min 1 :max 2147483647}]] [:present ::sm/boolean]])

(sv/defmethod ::studio-reconcile-team-member
  {::sm/params schema:reconcile ::db/transaction true}
  [{:keys [::db/conn] :as cfg}
   {:keys [::rpc/profile-id team-id member-id intent-id expected-epoch grant-epoch present] :as params}]
  (let [expected (::access/reconciliation-key cfg)
        presented (get-in (meta params) [::http/request :headers "x-studio-native-grant-key"])]
    (when-not (and (string? expected) (re-matches #"[A-Za-z0-9_-]{43}" expected)
                   (string? presented) (re-matches #"[A-Za-z0-9_-]{43}" presented)
                   (java.security.MessageDigest/isEqual (.getBytes expected "UTF-8") (.getBytes presented "UTF-8")))
      (access/denied!)))
  ;; Neither native ownership nor the body alone authorizes a Studio grant.
  ;; This private constructor callback validates the current exact Studio intent,
  ;; scope, pairing, operator, team, member, epochs and desired membership.
  (when-not (and (access/governed-team? cfg team-id)
                 (::access/authorize-reconciliation cfg)
                 (true? (:authorized ((::access/authorize-reconciliation cfg)
                         {:native-operator-profile-id profile-id
                          :native-team-id team-id :native-member-id member-id
                          :intent-id intent-id :expected-epoch expected-epoch
                          :grant-epoch grant-epoch :present present}))))
    (access/denied!))
  (when (or (= profile-id member-id) (not= grant-epoch (inc expected-epoch)))
    (access/denied!))
  ;; The actual authenticated operator must be current native owner, never an
  ;; organization-owner fallback or merely a caller-selected operator UUID.
  (let [permissions (db/exec-one! conn ["SELECT is_owner FROM team_profile_rel WHERE team_id=? AND profile_id=? FOR UPDATE" team-id profile-id])
        member (db/exec-one! conn ["SELECT id, is_owner, is_admin, can_edit FROM team_profile_rel WHERE team_id=? AND profile_id=? FOR UPDATE" team-id member-id])
        target (db/exec-one! conn ["SELECT id FROM profile WHERE id=? AND is_active=true AND deleted_at IS NULL" member-id])]
    (when-not (and (:is-owner permissions) (or (not present) target) (not (:is-owner member))
                   (not (nitrate/organization-owner-of-team? cfg member-id team-id)))
      (access/denied!))
    ;; Existing server_prop is deliberately NOT preloaded and contains no cookie,
    ;; JWT, display name or email. Receipt + membership commit atomically.
    (let [key (str "studio-native-grant:" team-id ":" member-id)]
      (db/exec! conn ["INSERT INTO server_prop(id,content,preload) VALUES (?,jsonb_build_object('epoch',0),false) ON CONFLICT(id) DO NOTHING" key])
      (let [receipt (db/exec-one! conn ["SELECT (content->>'epoch')::bigint AS epoch, content->>'intent' AS intent, (content->>'present')::boolean AS present, content->>'operator' AS operator FROM server_prop WHERE id=? FOR UPDATE" key])]
        (when (= :apply (epoch-action receipt {:intent-id intent-id :expected-epoch expected-epoch
                                              :grant-epoch grant-epoch :present present :operator-id profile-id}))
            (if present
              (db/exec! conn ["INSERT INTO team_profile_rel(id,team_id,profile_id,is_owner,is_admin,can_edit) VALUES (?,?,?,false,false,true) ON CONFLICT(team_id,profile_id) DO UPDATE SET is_admin=false,can_edit=true,modified_at=clock_timestamp() WHERE team_profile_rel.is_owner=false" (uuid/next) team-id member-id])
              ;; Match pinned delete-team-rels cleanup: no files/edits are deleted,
              ;; but no leftover project/file grant can outlive team removal.
              (do
                (db/exec! conn ["DELETE FROM file_profile_rel AS r USING file AS f, project AS p WHERE r.file_id=f.id AND f.project_id=p.id AND p.team_id=? AND r.profile_id=?" team-id member-id])
                (db/exec! conn ["DELETE FROM project_profile_rel AS r USING project AS p WHERE r.project_id=p.id AND p.team_id=? AND r.profile_id=?" team-id member-id])
                (db/delete! conn :team-project-profile-rel {:team-id team-id :profile-id member-id})
                (db/delete! conn :team-profile-rel {:team-id team-id :profile-id member-id})))
            (db/exec! conn ["UPDATE server_prop SET content=jsonb_build_object('epoch',?::bigint,'intent',?::text,'present',?::boolean,'operator',?::text),preload=false WHERE id=?" grant-epoch (str intent-id) present (str profile-id) key]))
        (let [actual (db/exec-one! conn ["SELECT is_owner,is_admin,can_edit FROM team_profile_rel WHERE team_id=? AND profile_id=?" team-id member-id])]
          (when-not (exact-membership? actual present)
            (conflict!)))
        {:acknowledged true :team-id team-id :member-id member-id
         :intent-id intent-id :grant-epoch grant-epoch :present present}))))
