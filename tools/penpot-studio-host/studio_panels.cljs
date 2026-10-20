;; Original Studio compact presentation. No native commands or stored preferences.
(ns app.main.ui.studio-panels
  (:require [app.main.studio-host :as host]
            [rumext.v2 :as mf]))

(defn embedded? [origin same-window?]
  (and (some? (host/configured-parent-origin origin)) (not same-window?)))

(defn selected-panel [value]
  (if (#{:layers :properties} value) value :canvas))

(defn panel-activation-key?
  [event]
  (and (contains? #{"Enter" " "} (.-key event))
       (not (or (.-altKey event) (.-ctrlKey event)
                (.-metaKey event) (.-shiftKey event)))))

(defn isolate-panel-key!
  [event]
  ;; Keep native button activation, but not the document-level workspace
  ;; Enter shortcut or Space/panning stream. Tab and modified shortcuts pass.
  (when (panel-activation-key? event)
    (.stopPropagation event)))

(def compact-css
  ".studio-panel-shell,.studio-panel-left,.studio-panel-right{display:contents}.studio-panel-switcher{display:none}@media(max-width:1023px){:has(> .studio-panel-shell){position:relative;padding-top:36px;box-sizing:border-box}.studio-panel-shell{display:contents}.studio-panel-switcher{position:absolute;inset:0 0 auto 0;height:36px;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--color-background-primary,#18181b);color:var(--color-foreground-primary,#fff);border-bottom:1px solid #666;z-index:100}.studio-panel-switcher button{font:inherit;color:inherit;background:transparent;border:1px solid transparent;border-radius:4px;padding:4px 12px;cursor:pointer}.studio-panel-switcher button[aria-pressed=true]{border-color:currentColor}.studio-panel-switcher button:focus-visible{outline:2px solid #9af}.studio-panel-left,.studio-panel-right{display:none;position:absolute;top:36px;bottom:0;z-index:99;background:var(--color-background-primary,#18181b);box-shadow:0 4px 16px #0008;max-width:100%}.studio-panel-left{left:0}.studio-panel-right{right:0}.studio-panel-shell[data-panel=layers]>.studio-panel-left,.studio-panel-shell[data-panel=properties]>.studio-panel-right{display:block}.studio-panel-left>*,.studio-panel-right>*{height:100%;max-width:100vw}.studio-panel-shell~*{scroll-margin-top:36px}}")

(mf/defc panels*
  [{:keys [left right]}]
  (let [panel* (mf/use-state :canvas)
        embedded (embedded? (unchecked-get js/window "penpotStudioOrigin")
                            (identical? js/window (.-parent js/window)))]
    (if-not embedded
      [:* left right]
      [:div {:class "studio-panel-shell" :data-panel (name (selected-panel @panel*))}
       [:style compact-css]
       [:nav {:class "studio-panel-switcher" :aria-label "Editor panels"}
        (for [[id label] [[:canvas "Canvas"] [:layers "Layers"] [:properties "Properties"]]]
          [:button {:key (name id) :type "button"
                    :aria-pressed (= @panel* id)
                    :on-key-down isolate-panel-key!
                    :on-key-up isolate-panel-key!
                    :on-click #(reset! panel* id)} label])]
       [:div {:class "studio-panel-left"
              :on-focus-capture #(reset! panel* :layers)} left]
       [:div {:class "studio-panel-right"
              :on-focus-capture #(reset! panel* :properties)} right]])))
