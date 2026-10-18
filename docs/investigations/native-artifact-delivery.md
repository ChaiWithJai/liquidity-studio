# Native artifact access and encrypted delivery

The repository is PUBLIC (`gh repo view` returned `isPrivate:false`). GitHub's [official artifact download documentation](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts) permits signed-in users with repository read access to download workflow artifacts. A `private` artifact name or `privateOnly` manifest field does not impose access control. These artifacts must not be described as access-restricted.

The bounded latest100-artifact inventory on October18 found unexpired plaintext native-editor artifacts12149872003 (run39163499581),12148679342 (39161901990),12147631850 (39157577369),12147570274 (39156511238), each about5.35MB and expiringOctober21. This is a recent-page inventory, not a complete historical search. No artifact was deleted; accepted local copies remain preserved. Encryption of future deliveries cannot recall previously available bytes.

The manual native workflow now requires an explicit operator RSA public recipient and its SHA-256 SPKI-DER fingerprint. It packages the complete native delivery as a tar archive, encrypts it using a fresh AES-256-GCM key, wraps that key using RSA-OAEP-SHA256, and uploads only ciphertext and its envelope. The RSA private key remains on the operator's machine. The original-only canonical workflow is unchanged. The ciphertext remains downloadable by repository readers; decryption requires the recipient private key. This protects delivery confidentiality, not licensing or AAL distribution rights.

Operator setup, once, in a private directory (these are instructions, not executed during implementation):

```sh
umask 077
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out native-recipient.pem
openssl pkey -in native-recipient.pem -pubout -out native-recipient.pub.pem
openssl pkey -pubin -in native-recipient.pub.pem -outform DER | shasum -a 256
base64 < native-recipient.pub.pem | tr -d '\n'
```

Supply only the public PEM base64 and fingerprint to manual dispatch. Download the encrypted artifact, then use the original-owned delivery tool:

```sh
node liquidity-studio/scripts/native-artifact-envelope.mjs open native-editor.tar.gz.enc native-editor.tar.gz envelope.json /absolute/private/native-recipient.pem
```

The tool requires owner-only private-key permissions, refuses existing output files, bounds archive input to512MiB, verifies authenticated decryption plus ciphertext length/digest, and removes incomplete plaintext on failure. Inspect the retained internal source/asset manifests as before, then extract under the existing bounded safe-path procedure. Do not treat successful decryption as source, license or runtime acceptance. No local tests, builds, model runs, key generation or artifact deletion were performed for this source change. Hosted regression source covers exact-byte roundtrip, fingerprint mismatch, tamper rejection and failed-output cleanup.
