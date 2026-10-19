;; Original optional constructor wiring for pinned Penpot ff7a66f (2.18.3).
(ns app.studio.configuration
  (:require [app.common.json :as json]
            [app.http.client :as client]
            [app.http.assets :as native-assets]
            [app.studio.assets :as assets]
            [app.studio.access :as access]
            [app.studio.http-authority :as authority]
            [app.studio.live :as live]
            [clojure.set :as set]
            [integrant.core :as ig])
  (:import [java.nio.file Files Path LinkOption OpenOption]
           [java.nio.file.attribute PosixFilePermission]))

(defn- invalid! []
  (throw (IllegalArgumentException. "Private native access configuration is invalid")))

(defn- uuid-text? [value]
  (and (string? value) (re-matches #"[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}" value)))

(defn read-settings
  "One bounded, operator-owned private file. No browser, RPC or global props input."
  [filename]
  (when-not (and (string? filename) (seq filename)) (invalid!))
  (let [path (Path/of filename (make-array String 0))
        nofollow (into-array LinkOption [LinkOption/NOFOLLOW_LINKS])]
    (when-not (and (.isAbsolute path) (Files/isRegularFile path nofollow)
                   (not (Files/isSymbolicLink path))
                   (<= (Files/size path) 16384)
                   (= (System/getProperty "user.name") (.getName (Files/getOwner path nofollow))))
      (invalid!))
    (let [permissions (Files/getPosixFilePermissions path nofollow)
          permitted #{PosixFilePermission/OWNER_READ PosixFilePermission/OWNER_WRITE}]
      (when-not (and (contains? permissions PosixFilePermission/OWNER_READ)
                     (set/subset? (set permissions) permitted)) (invalid!)))
    (with-open [input (Files/newInputStream path (make-array OpenOption 0))]
      (let [bytes (.readNBytes input 16385)]
        (when (> (alength bytes) 16384) (invalid!))
        (let [value (try (json/decode (String. bytes "UTF-8") :key-fn json/read-kebab-key)
                         (catch Exception _ (invalid!)))
              teams (:governed-teams value)]
          (when-not (and (map? value)
                         (= #{:schema-version :governed-teams :grant-key :callback-origin} (disj (set (keys value)) :callback-timeout-ms))
                         (= 1 (:schema-version value))
                         (contains? #{1000 3000} (get value :callback-timeout-ms 1000))
                         (vector? teams) (seq teams)
                         (every? #(and (map? %) (= #{:team-id :operator-profile-id} (set (keys %)))
                                       (uuid-text? (:team-id %)) (uuid-text? (:operator-profile-id %))) teams)
                         (= (count teams) (count (set (map :team-id teams))))
                         (string? (:grant-key value)) (re-matches #"[A-Za-z0-9_-]{43}" (:grant-key value))
                         (contains? #{"http://host.docker.internal:39044" "http://studio-native-connect:39044"} (:callback-origin value)))
            (invalid!))
          {:governed-teams (set (map #(java.util.UUID/fromString (:team-id %)) teams))
           :operators (into {} (map (fn [entry] [(java.util.UUID/fromString (:team-id entry))
                                                 (java.util.UUID/fromString (:operator-profile-id entry))]) teams))
           :grant-key (:grant-key value) :callback-origin (:callback-origin value)
           :callback-timeout-ms (get value :callback-timeout-ms 1000)})))))

(defmethod ig/init-key ::authority
  [_ {:keys [::client/client grant-key callback-origin callback-timeout-ms]
      :or {callback-timeout-ms 1000}}]
  ;; The actual existing Integrant HTTP client already has redirects disabled.
  ;; The adapter validates that invariant and supplies its own total deadline.
  (authority/create {::client/client client :grant-key grant-key :callback-origin callback-origin :callback-timeout-ms callback-timeout-ms}))

(defn asset-hook-installed?
  "Fixed loaded-code markers from the original module and exact native handler patch."
  []
  (let [module-version (ns-resolve 'app.studio.assets 'hook-version)
        handler-version (ns-resolve 'app.http.assets 'studio-access-version)]
    (boolean (and module-version handler-version
         (= "v1" (var-get module-version))
         (= "v1" (var-get handler-version))
         (fn? assets/deliver)))))

(defn install
  "Default off. Add only server constructor keys to the real RPC and WS graph."
  ([system] (install system (System/getenv "STUDIO_NATIVE_ACCESS_CONFIG")))
  ([system filename]
   (if (nil? filename)
     system
     (let [{:keys [governed-teams operators grant-key callback-origin callback-timeout-ms]} (read-settings filename)
           targets [:app.rpc/methods :app.http.websocket/routes :app.http.assets/routes]]
       (when-not (and (contains? system ::client/client)
                      (every? #(map? (get system %)) targets)) (invalid!))
       (let [common {::access/governed-teams governed-teams
                     ::access/operators operators
                     ::access/callback-timeout-ms callback-timeout-ms
                     ::access/capture-session live/context
                     ::access/session-valid? live/session-current?
                     ::access/authorize (ig/ref ::authority)}]
         (-> system
             (assoc ::authority {::client/client (ig/ref ::client/client)
                                 :grant-key grant-key :callback-origin callback-origin :callback-timeout-ms callback-timeout-ms})
             (update :app.rpc/methods merge common
                     {::access/installed-features {:rpc-policy "v1" :session "v1" :live "v1" :assets (if (asset-hook-installed?) "v1" false)}
                      ::access/reconciliation-key grant-key
                      ::access/authorize-reconciliation (ig/ref ::authority)})
             (update :app.http.websocket/routes merge common)
             (update :app.http.assets/routes merge common)))))))
