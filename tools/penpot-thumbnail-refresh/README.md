# Refresh stale native text-board thumbnails

Source-only patch for #52/#55 against Penpot `ff7a66f51938b2293260ea27a64e2c4e0833b5e3`. No local tests, build, native request, document edit or runtime activation.

Actual customer evidence: the unselected original board showed `image.thumbnail-bitmap` with stored asset `03d3421e-6777-4706-8afe-6f70c0866d31` and no live text shape. Its SVG export SHA256 `7aa720f6f0af7db59b0fe7e8214f5a172d3e89c4e41a35de30ae807ddfb554a8` paints the full metric sentence including `(Shared working draft)`, not merely metadata. Selecting the board through normal Layers immediately reveals that same full live SVG text. The restore clone's PNG also shows it. The saved rich text is correct; this patch never normalizes/replaces it.

The upstream healer was introduced by official commit `011feeaf7175837167481b187f0ece924e8d5a07`, “Fix missing text in legacy SVG board thumbnails (#11552)”. This was not a Studio patch. Its permanent browser-local `healed-text-thumbnails` object-ID set is updated **before** rasterization. Once marked, a canceled/failed heal or a later external/imported edit can leave a persisted old bitmap trusted across page loads. Source proof is the exact pinned `thumbnails.cljs` and its before/after hashes in `source-manifest.json`; upstream metadata was read through the official GitHub API.

The change discards cached **text-board** bitmaps locally on page entry, then queues local regeneration through the existing render queue. It does not call the remote thumbnail-delete or thumbnail-create RPCs on page reads. It removes the permanent “healed once” browser-storage exemption. Until a fresh render succeeds, Penpot renders live document children instead of the old bitmap; a failed render does not keep displaying the stale image. Text-free cached boards remain untouched. Existing local/peer commit invalidation, queue/debounce, cancellation, source data, fonts and geometry are unchanged. There is no subscription to thumbnail updates, so the operation cannot trigger itself in a render loop. One extra normal thumbnail refresh per visited cached text board is the deliberate cost; no stress/performance claim is made.

Apply in the disposable hosted pinned checkout, alongside the nonoverlapping existing font-upload patch:

```
python3 studio/tools/penpot-thumbnail-refresh/apply.py upstream
```

The script requires exact upstream HEAD, both exact original source/test hashes and both patch hashes; it checks/applies both patches together and verifies exact outputs. It neither compiles nor runs tests. Preserve this receipt, patch files, modified files, MPL notice and full corresponding source with the later hosted frontend delivery. This is a **frontend** change; rebuilding only the backend JAR cannot activate it.

The existing manual `penpot-font-ui-candidate.yml` now applies this guarded patch after the nonoverlapping font patch, preserves exact modified source/test and patches, performs the normal complete frontend build and compiles/runs only the existing thumbnail test namespace. Its final delivery now reuses the reviewed bounded recipient-encrypted chunk layout: no plaintext frontend/source archive is uploaded, no private key enters CI. Recipient public key/fingerprint are required dispatch inputs. The workflow has not run for this change.

The added case in the existing `frontend-tests.data.workspace-thumbnails-test` namespace exercises actual healer event emission: local discard precedes local refresh; only the cached text board is selected; the clear removes its bitmap, preserves the text-free board cache and leaves full file content byte-equivalent as Clojure data. Run that existing namespace under the hosted native frontend test recipe, then the existing canonical full frontend compilation. No new test matrix or account gate is added. A hosted build success is not browser acceptance.

Actual follow-through after the reviewed frontend artifact is deployed: reopen the original page without selecting/hovering the board, see full saved wording in its live/regenerated display, reload and verify the same wording, then deselect/reselect once. Confirm the existing saved SVG and human wording remain unchanged. No source approval, text edit, role change or new account is required.
