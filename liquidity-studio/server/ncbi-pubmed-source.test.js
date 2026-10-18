// Hosted-only tests. Actual complete Neo records; controlled single-record envelopes.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { EventEmitter } from "node:events";
import { performance } from "node:perf_hooks";
import { NCBI_PROVIDER, NCBI_EXTRACTION, NCBI_SELECTION, NCBI_DOCTYPE,
  ncbiRequest, ncbiSelectionDigest, extractNcbiAbstract } from "./ncbi-pubmed-source.js";
import { retrieveSource } from "./source-retrieval.js";
import { serialSourceRequest } from "./source-request-slot.js";
import { catalogForStory } from "./source-catalog.js";
import { buildPreparedCandidate, validatePreparedCandidate } from "./prepared-source-candidate.js";
import { projectPreparedHistory, restorePreparedHistory } from "./editor-pack-prepared.js";
import { BRAND_PRESETS } from "./domain.js";
const raw = await readFile(new URL("./fixtures/ncbi-efetch-three-records.xml", import.meta.url), "utf8");
const hash = text => createHash("sha256").update(text).digest("hex");
const articles = [...raw.matchAll(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g)].map(match => match[0]);
const topics = [["research_0", "Ashwagandha", "23439798"], ["research_2", "Bhramari", "21446363"], ["research_3", "Dinacharya circadian research", "25535358"]];
function record(pmid) {
  const matches = articles.filter(xml => xml.includes(`<PMID Version="1">${pmid}</PMID>`));
  assert.equal(matches.length, 1);
  return `<?xml version="1.0" ?>\n${NCBI_DOCTYPE}\n<PubmedArticleSet>${matches[0]}</PubmedArticleSet>`;
}
const descriptor = pmid => ({ provider: NCBI_PROVIDER, pmid });
function snapshot(pmid) {
  const xml = record(pmid), retrieval = descriptor(pmid), sourceUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
  return { schemaVersion: 1, id: "controlled-evidence", requestedUrl: ncbiRequest(sourceUrl, retrieval).href,
    sourceUrl, retrieval, retrievedAt: "2026-10-18T00:00:00Z", contentType: "text/xml; charset=UTF-8",
    responseSha256: hash(xml), responseBytes: Buffer.byteLength(xml), extractionVersion: NCBI_EXTRACTION,
    selectionMethod: NCBI_SELECTION, selectionQuerySha256: ncbiSelectionDigest(retrieval),
    text: extractNcbiAbstract(xml, "text/xml", retrieval), status: "unreviewed", approval: "none",
    // Filled below after extraction; this is a controlled response envelope, not worker acceptance.
    textSha256: "" };
}
function evidence(pmid) { const result = snapshot(pmid); result.textSha256 = hash(result.text); return result; }
const publicLookup = async () => [{ address: "8.8.8.8", family: 4 }];
function transport({ xml, status = 200, encoding, onCall = () => {} }) {
  return (url, options, callback) => {
    onCall(url, options);
    const req = new EventEmitter();
    req.destroy = () => req.emit("error", new Error("controlled transport error"));
    queueMicrotask(() => {
      const res = Readable.from([Buffer.from(xml)]);
      res.statusCode = status;
      res.headers = { "content-type": "text/xml; charset=UTF-8", ...(encoding === undefined ? {} : { "content-encoding": encoding }) };
      callback(res);
    });
    return req;
  };
}
test("real retained EFetch records preserve all reviewed abstract sections and four-format copy", () => {
  assert.equal(Buffer.byteLength(raw), 37580);
  assert.equal(hash(raw), "329017aa127d8d6c83a57b18793d299554e86b29a3746773046acbc2cd75a08c");
  assert.equal(articles.length, 3);
  for (const [id, title, pmid] of topics) {
    const scope = { organizationId: "org", brandId: "brand", preset: "vedic_dharma" }, story = { id, title, revision: 1 };
    const item = evidence(pmid), candidate = buildPreparedCandidate({ id: "candidate-" + pmid, scope, story, evidence: [item], brandProfile: BRAND_PRESETS.vedic_dharma, createdAt: "2026-10-18T00:00:00Z" });
    assert.equal(validatePreparedCandidate(candidate, [item]), true);
    for (const map of candidate.sourceFieldMappings) {
      const copy = map.fieldPath.split(".").reduce((value, key) => value[key], candidate.artwork);
      assert.equal(copy, item.text.slice(map.startOffset, map.startOffset + map.textLength));
    }
    assert.doesNotMatch(JSON.stringify(candidate.artwork), /thumbs|inhale|exhale|must chant|respiratory rate/i);
    assert.equal(item.status, "unreviewed");
    const archived = projectPreparedHistory([{ candidate, evidence: [item], revision: 1 }], scope);
    assert.deepEqual(archived[0].evidence[0].retrieval, descriptor(pmid));
    const restored = restorePreparedHistory(archived, { scope: { organizationId: "new-org", brandId: "new-brand" }, sourceScope: scope, packSha256: "a".repeat(64) });
    assert.deepEqual(restored[0].evidence[0].retrieval, descriptor(pmid));
    assert.equal(restored[0].evidence[0].approval, "none");
    assert.equal(restored[0].editorialStatus, "unreviewed");
  }
  const outside = record("23439798").replace("</MedlineCitation>", "<OtherAbstract><AbstractText>UNSELECTED foreign abstract text</AbstractText></OtherAbstract></MedlineCitation>");
  assert.equal(extractNcbiAbstract(outside, "text/xml", descriptor("23439798")), evidence("23439798").text);
  const ash = evidence("23439798").text;
  for (const prefix of ["Settings and design:", "Materials and methods:", "Results:", "Conclusion:"]) assert.ok(ash.split("\n").some(p => p.startsWith(prefix)));
  assert.ok(ash.includes("No serious adverse events were reported."));
  assert.ok(evidence("21446363").text.includes("two thumbs")); // Full evidence, never default artwork advice.
});
test("strict XML denies active declarations, malformed/foreign records and changed section boundaries", () => {
  const source = record("23439798"), d = descriptor("23439798");
  const cases = [raw, source.replace("23439798</PMID>", "999</PMID>"),
    source.replace(NCBI_DOCTYPE, '<!DOCTYPE PubmedArticleSet SYSTEM "file:///private">'),
    source.replace(NCBI_DOCTYPE, NCBI_DOCTYPE.replace("2025", "2026")),
    source.replace(NCBI_DOCTYPE, '<!DOCTYPE PubmedArticleSet [<!ENTITY x "expanded">]>'),
    source.replace(NCBI_DOCTYPE, '<!DOCTYPE PubmedArticleSet [<!ENTITY x SYSTEM "https://private.example">]>'),
    source.replace(NCBI_DOCTYPE, NCBI_DOCTYPE + NCBI_DOCTYPE),
    source.replace("<PubmedArticleSet>", '<?xml-stylesheet href="https://private.example"?><PubmedArticleSet>'),
    source.replace("Single center", "&unknown; Single center"),
    source.replace("<PubmedArticleSet>", '<PubmedArticleSet xmlns="https://foreign.example">'),
    source.replace("Single center", "x".repeat(24001)),
    source.replace('Label="SETTINGS AND DESIGN"', 'Label="CHANGED"'),
    source.replace('Label="RESULTS"', 'Label="MATERIALS AND METHODS"'),
    source.replace("</PubmedArticleSet>", ""),
    source.replace("</Article>", "</Article><Article><Abstract><AbstractText>extra</AbstractText></Abstract></Article>"),
    source.replace("<PubmedArticleSet>", "<PubmedArticleSet><DeleteCitation/>"),
    source.replace("<PMID Version=\"1\">23439798</PMID>", "<PMID>23439798</PMID><PMID>23439798</PMID>"),
    source.replace("Single center", "<Unexpected>Single center</Unexpected>"),
    source.replace("Single center", "<i>".repeat(41) + "Single center" + "</i>".repeat(41)),
  ];
  for (const xml of cases) assert.throws(() => extractNcbiAbstract(xml, "text/xml", d), { status: 422 });
  assert.throws(() => extractNcbiAbstract(source, "text/html", d), { status: 422 });
  assert.throws(() => extractNcbiAbstract("x".repeat(512 * 1024 + 1), "text/xml", d), { status: 422 });
  for (const value of [{ provider: NCBI_PROVIDER, pmid: "999" }, { provider: NCBI_PROVIDER, pmid: ["23439798"] }, { ...d, url: "https://private.example" }]) assert.throws(() => ncbiRequest("https://pubmed.ncbi.nlm.nih.gov/23439798/", value), { status: 422 });
  assert.throws(() => ncbiRequest("https://pubmed.ncbi.nlm.nih.gov/23439798/?override=1", d), { status: 422 });
});
test("clinical evidence binds actual transport and canonical identity across candidate, fork and portable validation", () => {
  const [id, title, pmid] = topics[0], scope = { organizationId: "org", brandId: "brand", preset: "vedic_dharma" }, story = { id, title, revision: 1 };
  const original = evidence(pmid), candidate = buildPreparedCandidate({ id: "candidate", scope, story, evidence: [original], brandProfile: BRAND_PRESETS.vedic_dharma, createdAt: "2026-10-18T00:00:00Z" });
  for (const change of [x => delete x.retrieval, x => x.retrieval.pmid = "21446363", x => x.requestedUrl = x.sourceUrl,
    x => x.sourceUrl = x.requestedUrl, x => x.extractionVersion = "plain-excerpts-v1", x => x.selectionQuerySha256 = "0".repeat(64)]) {
    const item = structuredClone(original); change(item);
    assert.throws(() => validatePreparedCandidate(candidate, [item]), { status: 422 });
    assert.throws(() => projectPreparedHistory([{ candidate, evidence: [item], revision: 1 }], scope), { status: 422 });
    assert.throws(() => buildPreparedCandidate({ id: "fork", scope, story, evidence: [item], brandProfile: BRAND_PRESETS.vedic_dharma, projectionFrom: candidate }), { status: 422 });
  }
});
test("EFetch transport keeps raw response hashes, fixed query/DNS/identity and rejects actual203 plus206", async () => {
  const d = descriptor("23439798"), citation = "https://pubmed.ncbi.nlm.nih.gov/23439798/", xml = record(d.pmid);
  const result = await retrieveSource(citation, { retrieval: d, lookup: publicLookup, get: transport({ xml, onCall: (url, options) => {
    assert.equal(url.href, ncbiRequest(citation, d).href);
    assert.equal(url.hostname, "eutils.ncbi.nlm.nih.gov");
    assert.equal(options.headers["Accept-Encoding"], "identity");
    assert.equal(options.headers.Accept, "application/xml, text/xml");
    assert.equal(typeof options.lookup, "function");
  } }) });
  assert.equal(result.sourceUrl, citation);
  assert.equal(result.requestedUrl, ncbiRequest(citation, d).href);
  assert.equal(result.responseSha256, hash(xml));
  assert.equal(result.responseBytes, Buffer.byteLength(xml));
  assert.equal(result.extractionVersion, NCBI_EXTRACTION);
  //203/absent is the ACTUAL observed scalar diagnostic, not a captured/guessed203 body.
  for (const status of [203, 206, 302]) await assert.rejects(retrieveSource(citation, { retrieval: d, lookup: publicLookup, get: transport({ xml, status }) }), error => error.status === 502 && error.upstreamStatus === status && error.sourceEncodingCategory === "absent");
  await assert.rejects(retrieveSource(citation, { retrieval: d, lookup: publicLookup, get: transport({ xml, encoding: "gzip" }) }), error => error.status === 502 && error.sourceEncodingCategory === "gzip");
  let called = false;
  await assert.rejects(retrieveSource(citation, { retrieval: d, lookup: async () => [{ address: "127.0.0.1", family: 4 }], get: () => { called = true; } }), { status: 400 });
  assert.equal(called, false);
});
test("source requests are serial at no more than one start per second; queued cancellation never dispatches", async () => {
  const first = new AbortController(), next = new AbortController(), times = [];
  let release, started;
  const ready = new Promise(resolve => { started = resolve; });
  const held = serialSourceRequest(first.signal, async () => { times.push(performance.now()); await new Promise(resolve => { release = resolve; started(); }); });
  await ready; // The public callback owns the serial slot.
  let contacted = false;
  const skipped = retrieveSource("https://pubmed.ncbi.nlm.nih.gov/23439798/", {
    retrieval: descriptor("23439798"), signal: next.signal,
    lookup: async () => { contacted = true; return publicLookup(); },
    get: () => { contacted = true; throw Error("cancelled queued work dispatched"); },
  });
  const rejected = assert.rejects(skipped, { status: 504 }); next.abort(); await rejected; assert.equal(contacted, false);
  const later = serialSourceRequest(new AbortController().signal, async () => { times.push(performance.now()); });
  release(); await held; await later;
  assert.ok(times[1] - times[0] >= 995);
});


test("in-flight DNS cancellation releases the slot and can never dispatch its late lookup", async () => {
  const controller = new AbortController();
  let began, resolveLookup, oldContacted = false;
  const lookupBegan = new Promise(resolve => { began = resolve; });
  const pending = retrieveSource("https://pubmed.ncbi.nlm.nih.gov/23439798/", {
    retrieval: descriptor("23439798"), signal: controller.signal,
    lookup: () => new Promise(resolve => { resolveLookup = resolve; began(); }),
    get: () => { oldContacted = true; throw Error("late cancelled source request"); },
  });
  const rejected = assert.rejects(pending, { status: 504 });
  await lookupBegan; controller.abort(); await rejected;
  const current = await retrieveSource("https://pubmed.ncbi.nlm.nih.gov/23439798/", {
    retrieval: descriptor("23439798"), lookup: publicLookup,
    get: transport({ xml: record("23439798") }),
  });
  assert.equal(current.sourceUrl, "https://pubmed.ncbi.nlm.nih.gov/23439798/");
  resolveLookup(await publicLookup());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(oldContacted, false);
});
