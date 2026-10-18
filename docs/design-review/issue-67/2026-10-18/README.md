# Supplementary calendar acceptance captures

These are new component-level after captures for #67, using the real shared client and authenticated ephemeral SQLite/HTTP API. They are not recaptures of the founder's private review corpus and do not overwrite its annotations. Legacy research titles visible in the fixture remain unreviewed; screenshots do not endorse their quantities or claims.

| Capture | Observed state |
| --- | --- |
| C01 | Existing undated weekday plans, before an explicit date placement |
| C02 | Whole campaign placed on March 8, with separate legacy plans |
| C03 | A reel-format plan distinct from its campaign placement |
| C04 | Revision conflict after an actual external metadata edit |
| C05 | Mobile agenda after actual native touch drag/reorder |
| C06 | Unknown server outcome after the response was lost; same-key retry offered |

The capture manifest records source commit/file hashes, image hashes, actual viewport and full-page pixel dimensions, isolated actor/scope, state, and test provenance. Desktop viewport is 1440×1100; mobile is 390×844. Full-page images can be taller than those viewports. No application CSS, sticky positioning or clock was changed solely for capture; the selected March dates are explicit user actions and persisted all-day assignments used to exercise the DST boundary.

The original canonical S06 and S07 were 1280×720 product journeys: calendar overview, then Tuesday card to source review. This isolated harness exercises the real Open story callback but does not mount the complete production source-review screen. Therefore C01–C06 are supplementary, not relabeled S06/S07. The combined App owner must add versioned S06/S07 after captures at that viewport. Human usability assessment remains unknown; the attached evidence is automated task/API evidence.

Reproduce with the existing Node22 dependencies:

```sh
NODE_ENV=test STUDIO_CALENDAR_EVIDENCE_DIR=/private/temporary/capture-directory \
  npm run test:browser -- tests/calendar-workspace.spec.js \
  --output=/private/temporary/unique-playwright-output
```

Run from the `liquidity-studio` directory. The test fixture owns and removes only its temporary database/cache/listener. Credentials are generated in memory and are not in these artifacts. See [component contract](../../../specs/dated-calendar-component.md) for integration and limits.
