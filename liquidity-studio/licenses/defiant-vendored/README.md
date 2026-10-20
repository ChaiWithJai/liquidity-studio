# Identified vendored SDK notices

The pinned MCP SDK 2.3.1 published JavaScript embeds dependencies absent from its installed package dependency list. Its published source maps and exact upstream `v2.3.1` pnpm lock identify the versions recorded in `manifest.json`.

Full text files here came from the exact official npm release archives after SHA-512 integrity verification. The `@cfworker/json-schema` 4.1.1 archive omits its license file; its text came from the official repository at the exact release `gitHead` recorded by npm. Each text has its own SHA-256 and provenance in the manifest. Fast URI's complete BSD text includes the original Gary Court and Fastify credits.

The build appends these texts to the installed-package notices and checks SDK versions, identities found in the selected published source maps, and text hashes. Unknown vendored identities fail rather than receive guessed attribution. It does not require every optional validator to survive tree shaking: alternate validator and upstream support dependency texts are included conservatively and labelled accordingly.

This is a bounded assessment of the identified dependencies inside these pinned SDK publications. It is not an all-product license audit, permission to publish private data, or a claim that every third-party project elsewhere in Studio has been assessed.
