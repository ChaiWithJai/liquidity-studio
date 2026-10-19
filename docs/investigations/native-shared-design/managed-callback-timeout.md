# Managed native callback deadline

A valid managed admission returned HTTP 200 after 1.485673065 seconds, while the 800 ms forwarder had already failed the native create. Ordinary same-operation retry succeeded. Full reload encountered the same delivery problem.

Private managed adapter configuration may set `authorityTimeoutMs: 2500`; omission retains 800 ms. Private native `/run/studio-native/access.json` may set `callbackTimeoutMs: 3000`; omission retains 1000 ms. Only those explicit local/managed values are accepted. The native setting also bounds the live subscription check, so its former independent 1000 ms bound cannot discard a valid managed response. Existing byte limits, current authorization, expiry, cancellation and fail-closed behavior remain. No authorization result is cached, and no write is automatically retried.

The adapter and native private configuration must be activated together after hosted verification and candidate delivery. This source change does not change deployed services or policy. Tests are authored for hosted execution; no local tests/builds were run.
