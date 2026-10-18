# Saved Penpot draft SVG download

Studio’s **Save SVG** prepares a one-use download of the first board in the chosen format of the existing saved Penpot file. The customer follows **Download draft SVG** while signed into their connected native account. This is a static draft handoff, not publication approval or Reel video.

The native gateway forwards that presented native cookie only to the fixed local Studio callback. The callback does not fall back to the private operator cookie. Studio rechecks the current campaign and saved native revision before and after export. It uses the existing pinned native export parser and strict SVG embedding service. Each supported native font variant is tied to its verified licensed original; generated font bytes are read from that variant and embedded with the retained font notices. Unknown fonts and external images fail clearly rather than being substituted or omitted. Text, layout and the saved file are unchanged.

The developer provider enables this route only with the existing private grant key. Add the exact `/studio-save-svg` location from `tools/penpot-native-connect/server.conf.example` to the existing native gateway and restart the existing first-party adapter after reviewing the source. Keep access logs disabled on this path because its query contains a short-lived opaque permit. No browser may choose a callback, file, page, profile, font URL or operator identity. Permits last two minutes, are kept only in process memory, and are consumed before a single export attempt; restart or unknown outcome requires preparing a new download.

The upstream native Export SVG button remains separate: its raw download currently contains protected font URLs. An attempted render-embed query compatibility patch failed actual rendering and was withdrawn. This Studio path does not claim that upstream native export is repaired.

Source changes and hosted regressions are prepared here. Actual ordinary Studio download and standalone-font acceptance must be performed in Neo after integration. No local functional test, build, native restart or export was run for this slice.
