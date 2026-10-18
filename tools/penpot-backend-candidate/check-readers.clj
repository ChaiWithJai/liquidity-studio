;; Hosted artifact inspection only. Read EDN data; never resolve/invoke symbols.
(require '[clojure.edn :as edn])
(import '[java.io PushbackReader StringReader]
        '[java.nio.charset StandardCharsets]
        '[java.nio.file Files Path]
        '[java.util.jar JarFile])

(defn deny-tag [tag _]
  (throw (ex-info "Tagged reader is not permitted in reader-map inspection" {:tag tag})))

(defn reader-map [text]
  (with-open [reader (PushbackReader. (StringReader. text))]
    (let [eof (Object.)
          opts {:eof eof :readers {'inst #(deny-tag 'inst %) 'uuid #(deny-tag 'uuid %)}
                :default deny-tag}
          value (edn/read opts reader)]
      (assert (and (map? value) (seq value)
                   (every? symbol? (keys value)) (every? symbol? (vals value)))
              "Expected a nonempty map of reader-tag symbols to function symbols")
      (assert (identical? eof (edn/read opts reader)) "Trailing EDN is not permitted")
      value)))

(let [[source-name jar-name output-name] *command-line-args*]
  (assert (and source-name jar-name output-name) "Expected source, JAR and output paths")
  (let [source-path (Path/of source-name (make-array String 0))]
    (assert (<= 1 (Files/size source-path) 65536) "Source reader map exceeds bound")
    (with-open [archive (JarFile. jar-name)]
      (let [entry (.getJarEntry archive "data_readers.clj")]
        (assert (and entry (<= 1 (.getSize entry) 65536)) "Missing or oversized packaged reader map")
        (with-open [stream (.getInputStream archive entry)]
          (let [bytes (.readNBytes stream 65537)
                _ (assert (<= (alength bytes) 65536) "Packaged reader map exceeds bound")
                source (reader-map (Files/readString source-path StandardCharsets/UTF_8))
                packaged (reader-map (String. bytes StandardCharsets/UTF_8))]
            (doseq [[tag function] source]
              (assert (= function (get packaged tag)) (str "Packaged reader mapping changed: " tag)))
            (spit output-name
                  (str "{\"resource\":\"data_readers.clj\",\"originalMappingsPreserved\":true,"
                       "\"requiredEntries\":" (count source) ",\"packagedEntries\":" (count packaged)
                       ",\"readerSymbolsEvaluated\":false}\n"))))))))
