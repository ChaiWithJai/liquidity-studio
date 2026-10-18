import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  buildPreparedCandidate,
  validatePreparedCandidate,
  preparationFingerprint,
  preparationUrls,
  candidateArtwork,
  validateCandidateLayout,
} from "./prepared-source-candidate.js";
const text =
  "A retrieved primary source excerpt with enough material for an operator to inspect.";
const evidence = [
  {
    id: "evidence",
    text,
    textSha256: createHash("sha256").update(text).digest("hex"),
    sourceUrl: "https://source.example/a",
    status: "unreviewed",
    approval: "none",
  },
];
const story = {
  id: "story",
  title: "Owner topic is not itself evidence",
  sourceClaims: [
    {
      text: "Unverified input",
      sourceUrl: "https://source.example/a",
      status: "unreviewed",
    },
  ],
  revision: 1,
};
test("prepared artwork is extractive, explicitly unreviewed and separate from approved campaign", () => {
  const candidate = buildPreparedCandidate({
    id: "candidate",
    scope: { organizationId: "org", brandId: "brand" },
    story,
    brandProfile: {},
    evidence,
    jobId: "job",
    itemId: "item",
    attemptId: "attempt",
    createdAt: "now",
  });
  assert.equal(validatePreparedCandidate(candidate, evidence), true);
  assert.equal(candidate.artwork.story.keyStatHighlight, text);
  assert.equal(candidate.excerpts[0].clinicalReview, null);
  assert.equal(story.campaignDraft, undefined);
  assert.equal(story.sourceClaims[0].status, "unreviewed");
  for (const modify of [
    (copy) => (copy.provenance.humanApproval = "approved"),
    (copy) => (copy.artwork.story.keyStatHighlight = "Invented medical claim"),
    (copy) => (copy.excerpts[0].text = "Invented fact"),
  ]) {
    const copy = structuredClone(candidate);
    modify(copy);
    assert.throws(() => validatePreparedCandidate(copy, evidence));
  }
});
test("preparation fingerprint fences content while allowing planning metadata and deduplicates source URLs", () => {
  const before = preparationFingerprint(story);
  assert.equal(
    preparationFingerprint({
      ...story,
      revision: 5,
      status: "Scheduled",
      scheduledDay: "Tuesday",
      assigneeId: "other",
    }),
    before,
  );
  assert.notEqual(
    preparationFingerprint({ ...story, contentRevision: 2 }),
    before,
  );
  assert.notEqual(
    preparationFingerprint({
      ...story,
      sourceClaims: [{ ...story.sourceClaims[0], text: "Changed evidence" }],
    }),
    before,
  );
  assert.deepEqual(
    preparationUrls({
      ...story,
      sourceClaims: [...story.sourceClaims, ...story.sourceClaims],
    }),
    ["https://source.example/a"],
  );
  assert.throws(
    () => preparationUrls({ ...story, sourceClaims: [] }),
    /source URLs/,
  );
});
test("operator catalog prepares existing Huda topic without changing unsourced legacy claims or trusting other preset IDs", () => {
  const huda = {
    id: "story_huda_buyback",
    title: "How Huda Kattan Bought Back 100% of Huda Beauty",
    sourceClaims: [
      {
        id: "legacy",
        text: "2024 and margin estimates remain unverified",
        sourceUrl: null,
        status: "unreviewed",
      },
    ],
  };
  const scope = {
    organizationId: "org",
    brandId: "brand",
    preset: "liquidity_desk",
  };
  assert.ok(preparationUrls(huda, scope)[0].includes("huda-beauty-reclaims"));
  assert.throws(() =>
    preparationUrls(huda, { ...scope, preset: "vedic_dharma" }),
  );
  assert.equal(huda.sourceClaims[0].sourceUrl, null);
  assert.equal(huda.sourceClaims[0].status, "unreviewed");
  assert.notEqual(
    preparationFingerprint(huda, scope),
    preparationFingerprint(huda, { ...scope, preset: "vedic_dharma" }),
  );
});
test("every prepared format uses the canonical renderer without invented filler or long title overflow", async () => {
  const { renderSvg } = await import("./artwork.js");
  const longText = Array.from(
    { length: 3 },
    (_, i) =>
      `Source paragraph ${i}: ` + "An exact source word sequence. ".repeat(30),
  ).join("\n");
  const snapshots = [
    {
      ...evidence[0],
      text: longText,
      textSha256: createHash("sha256").update(longText).digest("hex"),
    },
  ];
  const candidate = buildPreparedCandidate({
    id: "candidate",
    scope: { organizationId: "org", brandId: "brand" },
    story,
    brandProfile: {},
    evidence: snapshots,
  });
  for (const format of ["infographic", "carousel", "story", "reel"])
    assert.ok(
      renderSvg({
        campaign: candidate.artwork,
        brandProfile: {},
        format,
        slideIndex: 0,
      }).startsWith("<svg"),
    );
  assert.ok(candidate.excerpts.every((excerpt) => excerpt.text.length <= 220));
});

test("numbered primary-text verse keeps its meaningful sentence rather than only the verse number", () => {
  const text =
    "29. The eight means of Yoga are: the Commandments, the Rules, right Poise, right Control of the life-force, Withdrawal, Attention, Meditation, Contemplation.";
  const snapshots = [
    {
      ...evidence[0],
      text,
      textSha256: createHash("sha256").update(text).digest("hex"),
    },
  ];
  const candidate = buildPreparedCandidate({
    id: "verse-candidate",
    scope: { organizationId: "org", brandId: "brand" },
    story,
    brandProfile: {},
    evidence: snapshots,
  });
  assert.match(candidate.artwork.infographic.headline, /^29\. The eight means of Yoga/);
  assert.match(candidate.excerpts[0].text, /29\. The eight means of Yoga/);
  assert.ok(text.includes(candidate.artwork.infographic.headline));
});


test('version2 fits canonical four-format pages for both brands using exact source prefixes and mapped offsets',()=>{
 const long='Beyoncé’s primary institutional source records historical plans and limitations without asserting completed outcomes or medical advice. '.repeat(8);
 const snapshots=[{...evidence[0],text:long,textSha256:createHash('sha256').update(long).digest('hex')}];
 for(const preset of ['liquidity_desk','vedic_dharma']){
  const candidate=buildPreparedCandidate({id:'new',scope:{organizationId:'org',brandId:preset,preset},story,brandProfile:{},evidence:snapshots});
  assert.equal(candidate.artworkProjectionVersion,2);
  assert.equal(validatePreparedCandidate(candidate,snapshots),true);
  assert.doesNotThrow(()=>validateCandidateLayout(candidate.artwork,{brandName:preset,logoText:preset==='vedic_dharma'?'CWJ // ॐ':'Liquidity Desk'}));
  for(const map of candidate.sourceFieldMappings){
   const value=map.fieldPath.split('.').reduce((v,key)=>v[key],candidate.artwork);
   assert.equal(value,snapshots[0].text.slice(map.startOffset,map.startOffset+map.textLength));
   assert.ok(candidate.excerpts.some(e=>e.evidenceId===map.evidenceId&&e.startOffset===map.startOffset&&e.text.startsWith(value)));
  }
  assert.equal(candidate.excerpts[0].clinicalReview,null);assert.equal(candidate.provenance.modelCalls,0);
  for(const alter of [c=>c.sourceFieldMappings[0].startOffset++,c=>c.sourceFieldMappings[0].textLength++,c=>c.artworkProjectionVersion=3,c=>c.artwork.infographic.headline+=' fabricated']){
   const copy=structuredClone(candidate);alter(copy);assert.throws(()=>validatePreparedCandidate(copy,snapshots));
  }
 }
});

test('historical version1 retains original artwork and fingerprint semantics without automatic migration',()=>{
 const candidate=buildPreparedCandidate({id:'old',scope:{organizationId:'org',brandId:'brand'},story,brandProfile:{},evidence});
 delete candidate.artworkProjectionVersion;delete candidate.sourceFieldMappings;
 candidate.artwork=candidateArtwork(candidate.excerpts);
 const before=JSON.stringify(candidate),fingerprint=preparationFingerprint(story);
 assert.equal(validatePreparedCandidate(candidate,evidence),true);
 assert.equal(JSON.stringify(candidate),before);assert.equal(preparationFingerprint(story),fingerprint);
 candidate.artworkProjectionVersion=1;assert.equal(validatePreparedCandidate(candidate,evidence),true);
});


test('version dispatch rejects null, strings, zero and unknown versions rather than treating them as historical',()=>{
 const candidate=buildPreparedCandidate({id:'version',scope:{organizationId:'org',brandId:'brand'},story,brandProfile:{},evidence});
 for(const version of [null,'2',0,99])assert.throws(()=>validatePreparedCandidate({...candidate,artworkProjectionVersion:version},evidence),error=>error.status===422);
});

test('three retained primary paragraphs become three distinct source rows and timed facts without duplicate padding',()=>{
 const paragraphs=['First institutional paragraph records a planned alliance with explicit limits and no completed-outcome claim.','Second primary paragraph describes the geographic scope of the historical announcement for human review.','Third primary paragraph explains the planned retail offering without importing a partner market forecast.'];
 const text=paragraphs.join('\n'),snapshots=[{...evidence[0],text,textSha256:createHash('sha256').update(text).digest('hex')}];
 const candidate=buildPreparedCandidate({id:'three',scope:{organizationId:'org',brandId:'brand'},story,brandProfile:{},evidence:snapshots});
 assert.equal(validatePreparedCandidate(candidate,snapshots),true);assert.doesNotThrow(()=>validateCandidateLayout(candidate.artwork));
 assert.equal(new Set(candidate.artwork.infographic.statRows).size,3);
 for(let i=0;i<3;i++){
  const map=candidate.sourceFieldMappings.find(m=>m.fieldPath===`infographic.statRows.${i}`);
  assert.equal(map.startOffset,text.indexOf(paragraphs[i]));assert.equal(candidate.artwork.infographic.statRows[i],text.slice(map.startOffset,map.startOffset+map.textLength));
  assert.ok(paragraphs[i].startsWith(candidate.artwork.reel.beats[i].onScreenText));
 }
});
