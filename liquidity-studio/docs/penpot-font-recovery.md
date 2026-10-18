# Penpot font sidecar recovery

This optional local operator tool packages a native `.penpot` archive with exact
licensed font source bytes and OFL notices. It restores the fonts into one fixed
native destination through Penpot's official chunked-upload API. It does not
import the archive, remap document fields, restore approval authority, provision
an installation, or prove fresh-install rendering. The existing Studio portable
pack and its supported Doory recovery remain separate.

The implementation extends the existing `server/penpot-font-pack.js` schema-1
validator with an optional `style` (`normal` by default), preserving old packs.
Font UUIDs are preserved, including one family shared by multiple weights. The
bounded pack permits eight variants, a 10 MiB archive and 20 MiB aggregate decoded
content. Original font files remain limited to 3 MiB each.

## Independent local destination

Private configuration may optionally set `nativeOrigin` and `operatorPort`. For
example, restore to an independent native instance on
`http://127.0.0.1:39046` while the operator page listens on
`http://127.0.0.1:39049`:

```json
{
  "nativeOrigin": "http://127.0.0.1:39046",
  "operatorPort": 39049
}
```

Add those two fields to the existing private destination configuration below;
keep its real destination profile/team/project and `cookieFile`. This does not
create an installation or sign in for you. The private cookie belongs to that
fixed destination and never enters the page or exported sidecar. Existing
http://localhost:39008 and http://127.0.0.1:39045 defaults are unchanged. Native origins must be exact
HTTP origins on `localhost` or `127.0.0.1` with an explicit unprivileged port,
without credentials, paths, query or fragment. The operator port is an integer
1024–65535; its page Host/Origin checks use that exact 127.0.0.1 port. Public/cloud
origins, arbitrary proxies and browser-selected destinations are unsupported.
Use a free operator port; this example leaves the existing 39045 Studio instance
untouched. Font UUID/conflict/source-byte/journal rules and ordinary archive
import remain unchanged. Independent fresh-instance rendering is not inferred
from configuring the endpoints; it still needs an actual restore.

## Fixed operator setup

Prepare a private configuration and journal directory with mode 0700, and the
configuration/session files with mode 0600. The session file contains the native
Cookie header for the explicitly configured operator account, never Google
credentials. The tool refuses Cloud Run, listens only on `127.0.0.1` (port 39045 by default), checks
Host/Origin/peer/forwarded headers, and accepts a restore POST only from its own
page. It is not mounted by the Studio server or developer launcher. Confirm the
port is free and coordinate the native account before starting it.

```json
{
  "archivePath": "/private/customer/current.penpot",
  "profileId": "11111111-1111-4111-8111-111111111111",
  "teamId": "22222222-2222-4222-8222-222222222222",
  "projectId": "33333333-3333-4333-8333-333333333333",
  "cookieFile": "/private/customer/native-session.txt",
  "journalPath": "/private/customer/recovery/intent.json",
  "fonts": [{
    "sourcePath": "/private/customer/MonaSans-Regular.otf",
    "licensePath": "/private/customer/MonaSans-OFL.txt",
    "sourceName": "MonaSans-Regular.otf",
    "family": "Mona Sans",
    "weight": 400,
    "style": "normal",
    "oldFontId": "custom-44444444-4444-4444-8444-444444444444"
  }]
}
```

On the destination installation, use `"packPath":"/private/customer/penpot-font-sidecar.json"`
instead of `archivePath` and `fonts`; keep the destination's own profile/team/project,
session file and journal path. This consumes the exact downloaded sidecar without
having to unpack or reconstruct its font files. The download's `archive.bytes`
is the base64 of the original `.penpot` archive, with `archive.sha256` to verify.
The page's **Download original native archive** link returns those same decoded
bytes for a later ordinary import. There is no automatic import in this tool.

Use only an independently verified archive/reference inventory. The tool does
not infer fonts from an arbitrary ZIP or resolve missing licenses. `family` is
the actual installed native family, which may differ from an old authored label
(for example Inter Variable versus Inter). Include Noto Sans Devanagari for
explicit Om runs; a system fallback is not a portable font.

```sh
node scripts/penpot-font-recovery.mjs --config /absolute/private/config.json
```

In BrowserOS neo, open the displayed local page. Download the sidecar, check its
destination and listed fonts, confirm the destination, then select **Restore
fonts**. Native `get-profile`, `get-project` and `get-font-variants` are checked
again throughout recovery. A readable project alone is not asserted to prove
native edit permission: `create-font-variant` enforces the current team edit ACL.
The browser never supplies a native URL, account/session, target, file bytes or
font metadata. The POST carries only the displayed pack digest, fixed destination
acknowledgement and stable intent UUID.

## Native persistence and recovery

Pinned Penpot 2.18.3 source
[`fonts.clj`](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/src/app/rpc/commands/fonts.clj)
accepts a caller-supplied family `font-id`, but refuses an ID already owned by
another team. Original font UUID preservation is suitable for an empty fresh
installation, not a shortcut around a same-server source team's ownership.
Every conflicting family visible in the destination inventory is rejected
before any upload. A UUID owned by an inaccessible foreign team cannot be
enumerated by this operator; the official creation API still rejects it without
overwriting it, potentially after a temporary upload has been staged. Do not
claim that destination read access proves global UUID absence.

The official calls are `create-upload-session {total-chunks:1}`, multipart
`upload-chunk {session-id,index:0,content}`, then `create-font-variant` with
`team-id`, unprefixed `font-id`, family, weight, style and an `uploads` MIME-to-
session map. There is no legacy direct `data` upload. The new native variant and
generated format object IDs are recorded separately. Readback verifies exact
original-format length/SHA and family/weight/style/team; generated formats are
listed, not falsely claimed byte-identical to an original TTF/OTF.

A private fsynced journal records each phase before its external write. An
exclusive lock rejects concurrent operator processes. Keep that journal after a
failure. A lost variant-creation reply can reconcile the same intent by verifying
the existing variant and original bytes without creating it again. An unknown
session/chunk outcome stops for inspection rather than silently allocating a new
session. Changed pack/destination/intent or altered saved bytes reject. Nothing
deletes fonts or staged upload sessions. Expired temporary native chunks follow
the upstream lifecycle. Stop the operator normally before inspecting/removing
its own stale process lock after a crash; do not bypass a live process.

After **Fonts verified**, import the included exact native archive using the
ordinary Penpot import UI. Page/layout/font readiness and PNG/SVG checks remain
separate acceptance steps. The baseline 2.18.3 Inter metadata parser defect is
not repaired by this operator upload; ordinary Fonts UI needs the already
reviewed derivative where affected. Operator API recovery must be labeled as
such. No new cloud resources or upstream compiled bundle are distributed.

## Validation scope

Hosted service tests use exact existing licensed font files and explicit official
RPC doubles to exercise two-weight UUID preservation, no-upload conflict refusal,
lost creation reply reconciliation, current profile denial and corrupt stored
bytes. Transport tests inspect the fixed native origin and multipart fields.
These are not actual native upload/import or fresh-instance browser acceptance.
Local execution, a new native installation and the actual Neo recovery trial
require a separately reviewed bounded runtime window. No local test runner or
build is needed to run the eventual operator page.
