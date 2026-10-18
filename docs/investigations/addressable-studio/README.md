# Addressable Campaign Studio

Issue 194 adds navigation identifiers to the URL: current organization and brand, tab, story, format, prepared-preview page, prepared-copy view and saved Studio layout ID. Reload and browser history resolve these identifiers through the authenticated workspace and existing saved-story/layout APIs. URLs carry no draft text, session, source approval or one-use native capability.

Unsaved prepared, artwork, source-review and native edits block browser Back/Forward, with a message to save or discard. Reload uses the browser's unsaved-work prompt; saved data is loaded through the normal revision-aware client. Unavailable workspaces fall back to a permitted backlog with a useful error. A failed forced story read stops restoration rather than using a cached target. A missing saved native layout never creates a replacement.

On October 18, 2026, actual BrowserOS Neo checks against an isolated local staging profile at loopback port 39042 verified:

- Opening the AMC story, reloading its exact URL, Back to backlog and Forward to the same story.
- Preparing one Yoga source preview through the existing local worker, choosing Carousel page 3, and restoring the same story/format/page after full reload.
- Browser Back refusing unsaved preview text while retaining both URL and buffer. An explicit preview save followed by full reload retained the saved title and page.
- An unavailable organization/brand URL displaying the permitted backlog and an explanatory error.

This used the local founder persona and separate staging SQLite data, not Google or maintained production acceptance. No source/clinical promotion, native inference, media export, dependency installation, local test runner or production build was run. Existing hosted test selectors were updated for customer-facing design labels. The private native editor was disabled in this runtime, so saved native-ID reopening is implemented through existing authorized read APIs but was not browser-verified here.

Design actions now distinguish editing a Studio layout from opening an already linked Penpot design. The existing linked Penpot panel remains available while editing a Studio layout; it does not claim to create a new Penpot file. That creation path is separate issue 195. Reviewed source promotion provides an explicit design/preview action without automatically opening an editor. Original export controls are hidden while a Studio layout is active to avoid downloading a different artifact.

The canonical public frontend was built by hosted CI run 39136538762 at source `dc83d100ec64c1156ad39d143713705182a45ea9`, then retrieved from artifact 12139787801. The 15 output files were copied without a local build. Archive SHA-256 and output hashes are recorded in [hosted-build.json](hosted-build.json). Final hosted checks run against the commit containing those generated files; the initial asset mismatch is not treated as a passing gate.
