# Supplied-media clipping in the creator inbox

Implementation checkpoint for approved #281. Browser/runtime acceptance is pending. This does not establish access to cleared Nipsey video or official audio.

From an enabled strategy organization's **Creator videos**, select a source. The original source URL, saved recording proposal and notes remain the context. **Find more creator videos** holds editable queries and explicit bounded metadata search. Without a configured provider, query saving and supplied references remain available; no canned live results are reported.

Open **Make a short from your files**. Supply an MP4 (up to 20 MiB) and, when permitted, a WAV (up to 6 MiB), record the source/permission note, then save the inputs. Choose a source interval up to 30 seconds, inspect the source frame and 9:16 crop, set caption and audio levels, and **Save segment**. Audio starts at the beginning of the clip. Changes are manual, not model suggestions or clearance decisions.

**Render 9:16 MP4** plays those actual files through browser canvas and AudioContext mixing. Keep the tab active; cancel remains available. A browser without MP4 MediaRecorder support keeps the saved segment and explains the restriction. Play the rendered MP4, then **Save rendered MP4**. A changed segment invalidates the old render so old bytes cannot be labeled with a new proposal revision. Interrupted saves retain an exact retry intent. Conflicts retain working values and require explicit comparison/adoption of the current segment revision.

A saved clip can be reopened through the source's addressable `clip` selection, played and downloaded to share. Private bytes are fetched through the current authenticated request before creating a temporary browser URL. **Add source to report** carries the selected immutable clip, original source, saved match, input hashes and permission notes. The existing explicit destination/objective/deliverables handoff retains that report in the draft brief. No publication, native campaign generation or rights approval happens automatically.

Source checks are authored for hosted CI: interval/crop geometry, byte-identical chunk reconstruction, copied clip URL selection and authenticated binary request context. Official Svelte MCP reports zero issues. No local build, test, install, model or runtime operation was performed for this source checkpoint. Actual MP4 playback/mix/reopen/handoff acceptance must use explicitly owned or permitted files and must be recorded separately from real artist/manager acceptance.
