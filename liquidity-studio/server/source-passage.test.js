import test from "node:test";
import assert from "node:assert/strict";
import { extractSourceText } from "./source-retrieval.js";
import { catalogForStory } from "./source-catalog.js";
import { buildPreparedCandidate, validatePreparedCandidate } from "./prepared-source-candidate.js";
import { createHash } from "node:crypto";

const story = { id: "research_4", title: "Yoga Sutras: yamas, niyamas and posture" };
const scope = { organizationId: "org_default", brandId: "brand_vedic", preset: "vedic_dharma" };
const entry = catalogForStory(story, scope)[0];
const lines = [
  "29. The eight means of Yoga are described together in this selected passage.",
  "30. The Commandments are described in this selected section of the source.",
  "32. The Rules are described in this selected section of the source.",
  "46. Right poise must be firm and without strain.",
];
const source = `<h1>The complete book</h1><table><tr><td>BOOK II</td></tr><tr><td>INTRODUCTION TO BOOK III</td></tr></table>
<h2>INTRODUCTION TO BOOK II</h2><p>Unrelated introductory prose about the Yoga book and spiritual consciousness.</p>
<h2><a id="book-two"></a>BOOK II</h2>${lines.map(line => `<p>${line}</p>`).join("")}
<p>Unselected commentary containing repeated Yoga and meditation keywords.</p>
<h2>INTRODUCTION TO BOOK III</h2><p>29. Later-book unrelated meditation and Yoga paragraph must never become preview copy.</p>`;

test("operator passage uses actual heading boundaries and requested verses, excluding TOC and unrelated ranked paragraphs", () => {
  const text = extractSourceText(source, "text/html", "Yoga meditation consciousness", entry.passage);
  assert.equal(text, lines.join("\n"));
  const evidence = [{ id: "selected", sourceUrl: entry.sourceUrl, text,
    textSha256: createHash("sha256").update(text).digest("hex"), status: "unreviewed", approval: "none" }];
  const candidate = buildPreparedCandidate({ id: "passage", story, scope, brandProfile: {}, evidence });
  assert.equal(validatePreparedCandidate(candidate, evidence), true);
  assert.ok(candidate.excerpts.every(item => lines.some(line => line.startsWith(item.text))));
  assert.ok(candidate.excerpts.every(item => text.slice(item.startOffset).startsWith(item.text)));
  assert.equal(candidate.provenance.modelCalls, 0);
});

test("missing, duplicate and inverted section/verse boundaries fail closed instead of falling back to unrelated text", () => {
  for (const body of [
    source.replace("<h2>INTRODUCTION TO BOOK III</h2>", "<h2>Different section</h2>"),
    source.replace("<p>46.", "<p>47."),
    source.replace("<p>30.", `<p>${lines[1]}</p><p>30.`),
    `<h2>BOOK II</h2>${source}`,
    source.replace("<h2><a id=\"book-two\"></a>BOOK II</h2>", "<h2>INTRODUCTION TO BOOK III</h2>")
  ]) assert.throws(() => extractSourceText(body, "text/html", "Yoga", entry.passage), /missing or ambiguous/);
});

test("passage selection is limited to the curated story, brand preset and exact source URL", () => {
  assert.equal(catalogForStory(story, { preset: "liquidity_desk" }).length, 0);
  assert.equal(catalogForStory({ ...story, id: "other" }, scope).length, 0);
  assert.equal(extractSourceText(`<p>${lines[0]}</p>`, "text/html", "Yoga"), lines[0]);
});
