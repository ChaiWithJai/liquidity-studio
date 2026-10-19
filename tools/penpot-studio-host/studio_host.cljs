;; Original Studio host integration; UI state only, never identity or native commands.
(ns app.main.studio-host
  (:require [app.main.store :as st]))

(defn snapshot
  [state file-id]
  (let [file (get-in state [:files file-id])
        persistence (:persistence state)
        status (:status persistence)
        queue (:queue persistence)
        editing? (or (get-in state [:workspace-local :edition])
                     (get-in state [:workspace-local :transform])
                     (get-in state [:workspace-drawing :object]))]
    {:file-id (str file-id)
     :page-id (some-> (:current-page-id state) str)
     :revision (:revn file)
     :status (cond
               (or (not= file-id (:current-file-id state))
                   (not (contains? file :data))) "unknown"
               (= status :error) "error"
               editing? "editing"
               (or (= status :saving) (seq queue)) "saving"
               (= status :pending) "pending"
               (and (= status :saved) (empty? queue)
                    (int? (:revn file)) (<= 0 (:revn file))) "saved"
               :else "unknown")}))

(defn- configured-origin
  []
  (try
    (let [value (unchecked-get js/window "penpotStudioOrigin")
          url (js/URL. value)]
      (when (and (= "https:" (.-protocol url)) (= value (.-origin url))) value))
    (catch :default _ nil)))

(defn mount!
  [file-id]
  (let [origin (configured-origin)]
    (if (or (nil? origin) (identical? js/window (.-parent js/window)))
      (fn [])
      (let [nonce (atom nil)
            watch-key (gensym "studio-host-")
            last-snapshot (atom nil)
            emit! (fn [force?]
                    (when @nonce
                      (let [{:keys [page-id revision status]} (snapshot @st/state file-id)
                            value [page-id revision status]]
                        (when (or force? (not= value @last-snapshot))
                          (reset! last-snapshot value)
                          (.postMessage (.-parent js/window)
                                      #js {:type "studio-penpot-state" :version 1
                                           :nonce @nonce :fileId (str file-id)
                                           :pageId page-id :revision revision :status status}
                                      origin)))))
            receive (fn [event]
                      (let [data (.-data event)
                            token (when data (unchecked-get data "nonce"))]
                        (when (and (= origin (.-origin event))
                                   (identical? (.-source event) (.-parent js/window))
                                   (= "studio-penpot-observe" (when data (unchecked-get data "type")))
                                   (= 1 (when data (unchecked-get data "version")))
                                   (= (str file-id) (when data (unchecked-get data "fileId")))
                                   (string? token) (re-matches #"[A-Za-z0-9_-]{43}" token))
                          (reset! nonce token)
                          (emit! true))))]
        (add-watch st/state watch-key (fn [_ _ _ _] (emit! false)))
        (.addEventListener js/window "message" receive)
        (fn []
          (remove-watch st/state watch-key)
          (.removeEventListener js/window "message" receive)
          (reset! nonce nil))))))
