# Hosted native hook verification

Manual-only source verification for the original C2/C3 hooks against Penpot
`ff7a66f51938b2293260ea27a64e2c4e0833b5e3`. It uses the same immutable official
devenv digest as the reviewed font candidate workflow. It never builds a frontend,
installs PNPM, creates a native image, connects a native database, starts an
application, or enables editing.

Dispatch only after source review. `source_sha` must be the full reviewed Studio
commit containing both `tools/penpot-brand-access` and
`tools/penpot-live-fence`. The confirmation is
`verify-reviewed-penpot-native-hooks`. The recipe checkout is the workflow's own
event commit; the independently pinned hook checkout is recorded in the artifact.
No push or PR trigger exists. Do not dispatch a second run to conceal a failure.

The C2 exact-source apply script installs its original access module and narrow
reconciliation command/test and registers that command in the explicit RPC scan.
C3 applies its exact pinned WebSocket patch and installs its original live module
and focused test. Namespace loading checks the actual reconciliation command,
access/HTTP-authority/live modules and patched HTTP/util WebSocket namespaces
before Kaocha runs. All four expected focused test namespaces must load and each
must contain at least one test var; a zero-test discovery cannot be called a pass.

The pinned backend defines `clojure -M:dev:test` and Kaocha in its actual
`backend/deps.edn`. The small supplied config restricts namespace discovery to
`test/app/studio`, avoiding unrelated database/Redis suites while retaining those
same aliases/dependencies. It is not a mock replacement for the compiler.
`backend/tests.edn`, both deps files and all tracked lock/package files must remain
unchanged. No new runtime dependency is introduced.

Hosted bounds: Ubuntu 24.04 runner with at least 12 GB RAM and 12 GB free disk;
official AMD64 development container with 8 GiB memory, no additional swap,
four CPUs and a 4 GiB JVM heap; 45-minute command deadline/60-minute job deadline.
No host services, credentials, Google tokens, Docker socket or persistent customer
volume are mounted into it. Existing pinned Maven/Git Clojure dependencies resolve
on the disposable hosted runner. This is separate from local machine capacity.

The seven-day artifact retains exact source SHAs, input/installed source hashes,
the applied patch, pinned image/toolchain metadata, dependency immutability guards
and namespace/test logs, including failures. It excludes upstream source trees,
compiled vendor bundles and native credentials. Compilation is not native ACL,
DB-CAS, sharing-policy or measured five-second live-revocation acceptance. Those
remain separate owned-runtime checks after successful compilation and review.

Primary pinned conventions:

- [Backend CI](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/.github/workflows/tests-backend.yml)
- [Backend dependencies](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/deps.edn)
- [Kaocha configuration](https://github.com/penpot/penpot/blob/ff7a66f51938b2293260ea27a64e2c4e0833b5e3/backend/tests.edn)

No local compile, Docker pull, test runner or manual hosted dispatch was performed
while preparing this recipe.
