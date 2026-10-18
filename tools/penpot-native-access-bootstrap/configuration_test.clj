(ns app.studio.configuration-test
  (:require [app.common.json :as json]
            [app.studio.access :as access]
            [app.studio.configuration :as configuration]
            [clojure.test :refer [deftest is]]
            [integrant.core :as ig])
  (:import [java.nio.file Files]
           [java.nio.file.attribute FileAttribute PosixFilePermissions]))

(def team "11111111-1111-1111-1111-111111111111")
(def operator "22222222-2222-2222-2222-222222222222")
(def settings {:schemaVersion 1
               :governedTeams [{:teamId team :operatorProfileId operator}]
               :grantKey (apply str (repeat 43 "a"))
               :callbackOrigin "http://host.docker.internal:39044"})

(defn with-settings [value f]
  (let [path (Files/createTempFile "studio-private-" ".json" (make-array FileAttribute 0))]
    (try
      (Files/setPosixFilePermissions path (PosixFilePermissions/fromString "rw-------"))
      (spit (.toFile path) (json/encode value))
      (f (str path))
      (finally (Files/deleteIfExists path)))))

(deftest default-off-preserves-existing-graph
  (let [system {:app.rpc/methods {:existing true}}]
    (is (identical? system (configuration/install system nil)))))

(deftest constructor-wiring-retains-real-session-manager
  (with-settings settings
    (fn [filename]
      (let [session (ig/ref :app.http.session/manager)
            system {:app.http.client/client {:existing true}
                    :app.rpc/methods {:app.http.session/manager session}
                    :app.http.websocket/routes {:app.http.session/manager session}
                    :app.http.assets/routes {:app.http.session/manager session}}
            result (configuration/install system filename)]
        (doseq [target [:app.rpc/methods :app.http.websocket/routes :app.http.assets/routes]]
          (is (= #{(java.util.UUID/fromString team)} (get-in result [target ::access/governed-teams])))
          (is (= {(java.util.UUID/fromString team) (java.util.UUID/fromString operator)}
                 (get-in result [target ::access/operators])))
          (is (= session (get-in result [target :app.http.session/manager])))
          (is (fn? (get-in result [target ::access/capture-session])))
          (is (fn? (get-in result [target ::access/session-valid?])))
          (is (= (ig/ref :app.studio.configuration/authority) (get-in result [target ::access/authorize]))))
        (is (= (:grantKey settings) (get-in result [:app.rpc/methods ::access/reconciliation-key])))
        (is (= (ig/ref :app.http.client/client)
               (get-in result [:app.studio.configuration/authority :app.http.client/client])))))))

(deftest malformed-private-config-fails-closed
  (doseq [value [(assoc settings :governedTeams [])
                 (assoc settings :governedTeams [{:teamId team}])
                 (assoc settings :governedTeams (repeat 2 {:teamId team :operatorProfileId operator}))
                 (assoc settings :governedTeams [{:teamId team :operatorProfileId "not-a-uuid"}])
                 (assoc settings :callbackOrigin "http://example.com:39044")
                 (assoc settings :grantKey "short")
                 (assoc settings :browserOverride true)]]
    (with-settings value #(is (thrown? IllegalArgumentException (configuration/read-settings %))))))

(deftest public-readable-config-and-missing-graph-fail-closed
  (with-settings settings
    (fn [filename]
      (is (thrown? IllegalArgumentException (configuration/install {} filename)))
      (Files/setPosixFilePermissions (java.nio.file.Path/of filename (make-array String 0))
                                    (PosixFilePermissions/fromString "rw-r--r--"))
      (is (thrown? IllegalArgumentException (configuration/read-settings filename))))))
