# Signed upstream Doory license evidence

On October 18, 2026, source/artifact verification found an upstream change that addresses the previously absent GPG-signed license text: [commit 5f70d74c55ab300fec58545bc5c1ece69fa8f041](https://github.com/shaongitbd/doory/commit/5f70d74c55ab300fec58545bc5c1ece69fa8f041), “Sign the licence with Siam's GPG key (#99).” This report does not change editor code, runtime configuration, the selected model or a licensing decision.

The exact [LICENSE](https://github.com/shaongitbd/doory/blob/5f70d74c55ab300fec58545bc5c1ece69fa8f041/LICENSE) is a SHA-512 clearsigned message. GnuPG 2.4.8 verified it in a new isolated 0700 temporary key home, with batch mode and automatic key retrieval disabled. Verification returned exit 0, `GOODSIG` and `VALIDSIG` for fingerprint `32553D6C37CF387A36FFD6BBFEB106691898A504`. The key came from the same commit's [licenses/siam-gpg.asc](https://github.com/shaongitbd/doory/blob/5f70d74c55ab300fec58545bc5c1ece69fa8f041/licenses/siam-gpg.asc); a separate read of [the author's published GitHub key](https://github.com/shaongitbd.gpg) yielded the same fingerprint. This proves a valid signature under that published key, not independent real-world identity certification. GnuPG correctly reported undefined trust in the isolated keyring; no ownertrust was assigned.

The verified plaintext is byte-identical to the signing commit's parent LICENSE. Compared with the previously inspected 27b6f682 license, the only plaintext difference is its copyright line adding “and the Doory contributors listed in AUTHORS.md.” Conditions 1–4 and the disclaimer are unchanged. The preceding [contributor-credit commit](https://github.com/shaongitbd/doory/commit/d44688c626e8c30628270d25be1a8d8fa56dc623) explains that change. The new [NOTICE](https://github.com/shaongitbd/doory/blob/5f70d74c55ab300fec58545bc5c1ece69fa8f041/NOTICE) and AUTHORS remain part of the upstream notice basis; this verification does not silently substitute a new license into an older artifact.

| Exact text artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Signed LICENSE | 2911 | `04f5a9eb941e517088dc8cdc6d815675fc2b6dc6a1ca8606f2a57e39ef9431d9` |
| Upstream public key | 413 | `d68f44f6afecca18d3080c7f69ff02da3c36f14f692499cb58482e1d761f9568` |

The narrow earlier claim “no signed text is supplied upstream” is superseded. Before changing a retained artifact's distribution disposition, its operator still needs to reconcile the exact source basis, signed license/NOTICE/contributor and dependency notices, accompanying documentation, and launch attribution. This report does not claim that existing private artifacts were repackaged, that public distribution is cleared, or that upstream terms are MIT. No legal conclusion or blanket commercial clearance is made.

MODNet's separate missing checkpoint/exporter/toolchain/opset/optimization receipt remains unresolved. The selected ONNX identity is known, but its upstream reference recipe does not establish the exact conversion lineage; this license signature does not fill that gap. Issue #55 stays open.

No model bytes were downloaded and no model conversion, inference, local test runner, build or runtime change occurred. Only small public license/key/source text was read and cryptographically verified.
