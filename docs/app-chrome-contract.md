# Application chrome contract

`liquidity-studio/src/app-chrome.css` owns application color and font values. `studio.css` imports it before mapping existing shell aliases; `ResearchPage` maps its research aliases to the same values. The standalone local development chooser and environment strip embed that file through their existing server-side presentation module, because the chooser has no application CSS entry.

This consolidation preserves current values, geometry and font choices. Research/local chrome uses Inter; the shell retains its existing DM Sans/system fallback. DM Sans is not shipped: selecting another shell face requires a separately evaluated visual change. Shell muted text remains `#738075`, while research/local muted text remains `#59665d`; the names make that existing distinction explicit.

## Existing role APIs

| Role | Current source contract | Boundary |
| --- | --- | --- |
| App frame and scope | `App.svelte` shell, organization/brand selectors and current URL state | Still inline; token sharing does not turn these into a reusable frame or scope component. Existing authorization and selection handlers remain authoritative. |
| Page header | App section header or screen-owned heading inside `ResearchPage` | Preserve one meaningful screen heading and current task context. There is no shared page-header component yet. |
| Page region | `ResearchPage({label, children})` | Named region, application control typography/focus and canvas/surface roles; no business handlers. |
| Toolbar/action bar | `ResearchToolbar({label, children})` | Existing named action group, responsive wrapping and component-owned action order. |
| Inspector | `ResearchInspector({label, children})` | Existing named detail region; screens own selection, dirty guards and save handlers. |
| Fields | Existing semantic labels, inputs and screen-owned groups | ResearchPage supplies control geometry; field grouping and validation remain screen-owned. No generic schema form is introduced. |
| Save/status | Existing screen status/provenance and explicit save actions | Saved, unsaved, pending and unknown retain their distinct existing meanings. No shared status API is claimed. |
| Empty/error/retry | Existing screen-owned copy, status/alert semantics and handlers | Token ownership does not establish a reusable empty-state or recovery contract. |

Application chrome does not own branded artwork, Emulator controls/simulated chrome, the Brand Kit specimen, or the Penpot iframe. ResearchPage keeps its entire Emulator subtree exclusion. No selectors or values are added to those surfaces. The conditional legacy NativeEditorHost palette remains separate pending an actual expanded-panel baseline; this pass does not restyle or claim parity for it.

These are source ownership contracts, not a claim of complete cross-screen visual, accessibility or representative-manager acceptance for issue #311. Existing hosted journeys remain the verification path; this change adds no new action, route, permission, API or state transition.
