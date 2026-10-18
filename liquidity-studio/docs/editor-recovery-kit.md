# Download and restore a readable recovery kit

In Operations → Portable brand recovery, **Download recovery kit (ZIP)** downloads
one private folder containing the exact existing JSON editor pack, readable font
files and OFL notices, a checksum inventory and `RESTORE.md`. The original
**Download current brand pack** JSON download remains available.

Extract the ZIP with your operating system. Read `RESTORE.md` before removing a
source installation. To restore through Operations, select the extracted
`studio-editor-pack.json`, create a new empty recovery brand and confirm the
explicit owner/source mapping. The ZIP itself is not an upload format. Keep the
same file and destination when checking or resuming an interrupted restore.

The font folder contains exact bytes from the pack, preserving their filenames
and licenses. A self-hosted destination must install these into its existing
`liquidity-studio/public/fonts` or `/usr/local/share/fonts/liquidity` directory;
restoration checks those bytes. Assets, cutouts, supported media/history and
lineage remain embedded in the unchanged JSON and use the existing restore
service. Do not manually recreate storage references from the readable folder.

A registered Penpot design remains a separate native export. Download its
`.penpot` archive and retain a [licensed font sidecar](penpot-font-recovery.md)
before leaving that native server. A Studio pack does not contain the Penpot
server's files, custom font-ID registry, teams or infrastructure. The included
guide makes this boundary explicit rather than claiming a native archive is
present or that an archive includes its fonts.

The kit adds no account, service, database, runtime dependency or import path.
It uses the existing scoped export request, then locally verifies the pack seal
and font hashes before creating a store-mode ZIP with the already installed
`fflate`. Export JSON remains capped at 48 MiB; readable payload construction is
bounded at 96 MiB. This is a bounded allocation policy, not measured maximum-pack
browser capacity. Keep the plain JSON export as the fallback.

Hosted contracts verify an actual service-exported pack remains byte-equivalent,
its image payload and exact fonts/notices survive, every checksum resolves, and
changed payloads/unsafe names fail. The browser contract exercises the actual
Operations download and reselects the extracted JSON for the existing preview.
No local test, build or runtime was used to implement this slice. Fresh-install
rendering, full native recovery, infrastructure recovery and the remaining #57
acceptance are separate work; downloading the kit does not close the ticket.
