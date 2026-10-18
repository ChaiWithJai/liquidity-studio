;; Original optional native byte-admission hook for pinned Penpot ff7a66f.
(ns app.studio.assets
  (:require [app.db :as db]
            [app.http.session :as session]
            [app.rpc.permissions :as permissions]
            [app.rpc.commands.teams :as teams]
            [app.storage :as storage]
            [app.studio.access :as access]
            [yetti.response :as-alias response]))

(def hook-version "v1")

(def ^:private protected-buckets
  #{"file-media-object" "team-font-variant" "file-object-thumbnail"
    "file-thumbnail" "file-data" "file-data-fragment"})

(def ^:private private-headers
  {"cache-control" "private, no-store" "pragma" "no-cache"
   "expires" "0" "x-accel-expires" "0" "vary" "Cookie"})

(defn enabled? [cfg] (contains? cfg ::access/governed-teams))
(defn- pool [cfg] (or (::db/pool cfg) (::db/pool (::storage/storage cfg))))

(defn references
  "Only persisted native rows classify ownership. Retain soft-deleted references:
   native ACL decides liveness; deletion must not make governed bytes public."
  [cfg object]
  (let [id (:id object)
        metadata (meta object)
        bucket (:bucket metadata)
        file-join " JOIN file f ON f.id=r.file_id JOIN project p ON p.id=f.project_id "
        rows
        (case bucket
          "file-media-object"
          (db/exec! (pool cfg)
            [(str "SELECT DISTINCT r.file_id, p.team_id FROM file_media_object r" file-join
                  "WHERE r.media_id=? OR r.thumbnail_id=? LIMIT 65") id id])
          "team-font-variant"
          (db/exec! (pool cfg)
            ["SELECT DISTINCT r.team_id, (r.deleted_at IS NULL AND t.deleted_at IS NULL) AS live FROM team_font_variant r JOIN team t ON t.id=r.team_id WHERE r.ttf_file_id=? OR r.otf_file_id=? OR r.woff1_file_id=? OR r.woff2_file_id=? LIMIT 65"
             id id id id])
          "file-object-thumbnail"
          (db/exec! (pool cfg)
            [(str "SELECT DISTINCT r.file_id, p.team_id FROM file_tagged_object_thumbnail r" file-join
                  "WHERE r.media_id=? LIMIT 65") id])
          "file-thumbnail"
          (db/exec! (pool cfg)
            [(str "SELECT DISTINCT r.file_id, p.team_id FROM file_thumbnail r" file-join
                  "WHERE r.media_id=? LIMIT 65") id])
          ;; The exact metadata pointer is also used by pinned storage GC. Do
          ;; not classify an arbitrary metadata file-id without its current row.
          ("file-data" "file-data-fragment")
          (if (and (uuid? (:file-id metadata)) (uuid? (:id metadata)))
            (db/exec! (pool cfg)
              [(str "SELECT DISTINCT r.file_id, p.team_id FROM file_data r" file-join
                    "WHERE r.file_id=? AND r.id=? AND r.metadata->>'storage-ref-id'=?::text LIMIT 65")
               (:file-id metadata) (:id metadata) (str id)])
            [])
          [])]
    (when (or (> (count rows) 64) (some #(not (uuid? (:team-id %))) rows))
      (access/denied!))
    (vec rows)))

(defn- actual-session
  [cfg request]
  (let [capture (::access/capture-session cfg)
        valid? (::access/session-valid? cfg)
        context (when (fn? capture) (capture request))]
    (when (and (fn? valid?) context
               (uuid? (:native-profile-id context))
               (= (::session/profile-id request) (:native-profile-id context))
               (true? (valid? cfg context)))
      context)))

(defn native-readable?
  "Never accepts a share ID. A real current native principal must own a native
   ACL path; governed authority remains an additional independent requirement."
  [cfg profile {:keys [file-id team-id live]}]
  (if file-id
    (and (= team-id (access/current-file-team (pool cfg) file-id))
         (true? (:can-read (permissions/get-file-read-permissions (pool cfg) profile file-id nil))))
    (and (true? live)
         (true? (:can-read (teams/get-read-permissions (pool cfg) profile team-id))))))

(defn admission
  [cfg request object]
  (if-not (and (enabled? cfg) (contains? protected-buckets (:bucket (meta object))))
    {:private false}
    (let [refs (references cfg object)
          governed? (some #(access/governed-team? cfg (:team-id %)) refs)]
      (when (empty? refs) (access/denied!))
      (if-not governed?
        {:private false}
        (let [context (actual-session cfg request)
              profile (:native-profile-id context)]
          (when-not context (access/denied!))
          (when-not
            (some (fn [{:keys [team-id] :as ref}]
                    (and (native-readable? cfg profile ref)
                         (or (not (access/governed-team? cfg team-id))
                             (true? (:allowed (access/authorize-resource cfg
                                               (assoc context :native-team-id team-id :operation :asset)))))))
                  refs)
            (access/denied!))
          ;; S3 presigned redirects escape subsequent request authorization.
          ;; Current owned native storage is filesystem; do not invent a cloud
          ;; streaming mode or call a no-store redirect revocable.
          (when-not (#{:fs :assets-fs} (:backend object))
            (throw (ex-info "Governed native S3 asset delivery is unsupported" {:type :unsupported})))
          {:private true :context context})))))

(defn deliver
  "Run immediately before the native byte/X-Accel response. Personal/default-off
   behavior is unchanged. Governed errors never become a public cache response."
  [cfg request object serve]
  (if-not (enabled? cfg)
    (serve)
    (try
      (let [{:keys [private context]} (admission cfg request object)
            result (serve)]
        (if private
          (do
            (when-not (true? ((::access/session-valid? cfg) cfg context)) (access/denied!))
            (update result ::response/headers merge private-headers))
          result))
      (catch Exception error
        {::response/status (if (= :authorization (:type (ex-data error))) 403 503)
         ::response/headers private-headers
         ::response/body (if (= :authorization (:type (ex-data error)))
                           "Current native brand access is required"
                           "Private native asset delivery is unavailable")}))))
