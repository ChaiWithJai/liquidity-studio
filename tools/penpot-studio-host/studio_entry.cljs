;; Optional navigation guide; native authorization and personal work are unchanged.
(ns app.main.ui.studio-entry
  (:require [app.main.studio-host :as host]
            [app.util.storage :as storage]
            [rumext.v2 :as mf]))

(defn connection-return-path
  [token]
  (when (and (string? token) (re-matches #"[A-Za-z0-9_-]{43}" token))
    (str "/studio-connect?challenge=" token)))

(defn prepare-login-return!
  [section params]
  (when-let [path (and (= section :auth-login) (host/parent-origin)
                      (connection-return-path (:studio-connect params)))]
    ;; Reuse the normal native login continuation. The target is never caller-supplied.
    (binding [storage/*sync* true]
      (swap! storage/session assoc :login-redirect (str (.-origin js/location) path)))))

(mf/defc entry*
  [{:keys [content]}]
  (let [personal? (mf/use-state false)
        origin (host/parent-origin)
        framed? (not (identical? js/window (.-parent js/window)))]
    (if (or (nil? origin) @personal?)
      content
      [:main {:style {:max-width "38rem" :margin "12vh auto" :padding "24px"
                      :font-family "system-ui" :line-height "1.5"}}
       [:h1 "Your brand work starts in Studio"]
       (if framed?
         [:p "Use Return to copy and preview above to resume this story, then reopen its saved design."]
         [:p "Choose your organization, brand and story in Studio to open the right saved design."])
       (when-not framed? [:p [:a {:href origin} "Open Studio"]])
       [:details
        [:summary "Personal or operator workspace"]
        [:p "Your existing personal files and native administration remain available."]
        [:button {:type "button" :on-click #(reset! personal? true)} "Continue in Penpot"]]])))
