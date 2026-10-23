# Optional hosted claim decision adapter

## Objective and assumptions
Add a disabled-by-default finite Jev HTTP adapter and a deterministic-first evaluation record constructor. This is an internal operator capability foundation, not mounted Studio/MCP behavior. Existing authority, case resolution and persistence are constructor-owned integrations; no caller may supply endpoint, credentials, arbitrary questions or override failed deterministic checks. Dataset references distinguish authored-development examples from observed-answer cases; no private case content or human labels enter Git. Existing owner authorization covers implementation, with source/hosted verification before runtime binding.

## Contract and plan
Official Vercel Decision HTTP documentation (October7,2026, read October23): fixed POST https://ai-gateway.vercel.sh/v1/evaluate, model typesafe-ai/jev; state plus named boolean/choice questions; answers with probability or choice/probabilities; usage inputTokens/outputTokens; optional providerMetadata.gateway routing/cost. Decisions are not Chat Completions. https://vercel.com/docs/ai-gateway/modalities/decision

Implement `server/defiant-jev-evaluation.js` and adjacent authored Node contracts. No dependency/index/build-output changes. Adapter accepts only server-resolved bounded claim and evidence. Fixed questions cover support (four choices), causal overreach, temporal comparability, identity overreach and citation sufficiency. Request restricts provider to typesafe-ai and requires zero data retention; unsupported policy fails, never retries/substitutes. No fallback model options. Response model must remain exact, all answer keys/types/probabilities finite and normalized, bounded usage; routing metadata cannot contradict the fixed model/provider. Retain only allowlisted model/usage/cost fields; discard provider free text/IDs.

Transport: disabled default, missing credential noI/O, fixed endpoint/no redirects, one request with15second deadline, input≤16KiB, response≤64KiB and perchunk≤64KiB, no retry. Failures return finite codes without raw errors/body/token. Credential injected synchronous getter, never environment discovery/logging. Config allows tightening timeout/bytes and a positive finite per-instance request cap (default1, max32); reserve synchronously before fetch so failures/concurrency cannot bypass cap. This cap is not a persistent account billing hard cap.

Evaluation orchestrator takes constructor-owned authorize, resolveCase, deterministicCheck, persistRecord and adapter. Each request names only a bounded caseId from a frozen finite manifest (≤32 entries; metadata refs datasetHash/caseId/origin). Resolve and deterministic gates must finish before provider credential lookup. Initial actor and organization are captured into a frozen operation context; changes to the caller context reject after async boundaries. Scope/revision authority rechecked after async work and before persistence. Deterministic result is one of pass/fail/insufficient-context with finite reason codes; fail/insufficient skips model. Return an immutable metadata-only attributed record with manifest/evidence/claim hashes, deterministic result, server-owned evaluator version, fixed question digest and explicit deterministic-check version, model outcome/usage/latency, model-alias version qualification and reviewer-label origin unknown. No claim/evidence/rawprovider payload in record. Persist callback must save exact immutable record; no metric accuracy calculation, human label or whole-answer correctness claim. Idempotent durable runtime integration and credential binding remain separate required work; no automatic batch execution.

## Commands and structure
Hosted only: `cd liquidity-studio && node --test server/*.test.js`; existing Verify also runs auxiliary/backwards/build/browser checks. Never run locally. New module/test paths above, public spec `docs/specs/defiant-jev-evaluation.md`. No npm install, new dependency, local model, runtime config, secret discovery or paid infrastructure.

## Style
ESM and named constructors, explicit finite allowlists, static errors, immutable returned records. Example invented result: `{ status: 'skipped', reason: 'deterministic-failure' }`.

## Authored verification tasks
- Fixed exact HTTP request; valid choice/boolean response, usage and retained qualification.
- Disabled/missing credentials/deterministic failure cause zero provider I/O.
- Reject redirects, HTTP errors, malformed JSON/probabilities/model/routing, oversized/stalled bodies; failure redaction and no retry.
- Concurrency consumes finite reservations and authority changes prevent record persistence.
- Frozen manifest/case provenance, no private content in saved record, authored labels never become human ground truth.
- Retained18 authored and observed case sets are runtime metadata references only; invented fixtures cover transport and orchestration without embedding those private datasets.

## Boundaries and remaining adoption work
Always preserve deterministic authority, exact evidence revision, bounded privacy and real observed usage. Coordinate new runtime/secret/persistence binding in a reviewed integration slice. Never turn this foundation into an enabled unauthenticated endpoint, substitute provider, claim spend hardcap from token count, infer human labels or run local models. Future actual hosted evaluation needs existing Gateway credential binding, agreed finite spend/run scope and durable idempotent recording; current service Vertex generation authority is not Jev authentication.

## Persistence qualification
The injected persistRecord must enforce current authority transactionally in its durable implementation. This module's pre/post checks cannot roll back an already committed record if revocation races a remote write. No durable runtime mount, retry-safe idempotency or account-wide spend lock is claimed by this foundation. Those remain explicit adoption work before a private evaluation run. The per-instance request cap reserves failed requests too; it is not a dollar hard cap. Source examples are invented and never substitute for the private18 authored examples or observed-answer provenance.

The constructor-owned resolver must verify the referenced dataset bytes and selected case association; the adapter does not infer that a caller-supplied dataset hash proves those bytes. Its own record hashes cover the exact claim/evidence strings actually submitted. No dataset path or raw artifact is accepted from an evaluate request.
