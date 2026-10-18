import { SaxesParser } from "saxes";
import { createHash } from "node:crypto";
import { fail } from "./auth.js";

export const NCBI_PROVIDER = "ncbi-efetch-pubmed-v1";
export const NCBI_EXTRACTION = "ncbi-efetch-abstract-v1";
export const NCBI_SELECTION = "catalog-pubmed-abstract-v1";
export const NCBI_DOCTYPE = '<!DOCTYPE PubmedArticleSet PUBLIC "-//NLM//DTD PubMedArticle, 1st January 2025//EN" "https://dtd.nlm.nih.gov/ncbi/pubmed/out/pubmed_250101.dtd">';
const records = Object.freeze({
  "23439798": Object.freeze({ sections: [
    ["SETTINGS AND DESIGN", "Settings and design:"],
    ["MATERIALS AND METHODS", "Materials and methods:"],
    ["RESULTS", "Results:"], ["CONCLUSION", "Conclusion:"],
  ] }),
  "21446363": Object.freeze({ prefix: "The study was carried out to evaluate the immediate effect Bhramari pranayama," }),
  "25535358": Object.freeze({ prefix: "In the past 50 y," }),
});
const invalid = () => fail(422, "NCBI record identity or abstract structure is unavailable; source research required");
const keys = (value) => value && typeof value === "object" && !Array.isArray(value)
  && Object.keys(value).sort().join("|") === "pmid|provider";
export function assertNcbiDescriptor(value) {
  if (!keys(value) || typeof value.pmid !== "string" || value.provider !== NCBI_PROVIDER || !Object.hasOwn(records, value.pmid)) throw invalid();
  return value;
}
export function ncbiCitation(value) {
  return `https://pubmed.ncbi.nlm.nih.gov/${assertNcbiDescriptor(value).pmid}/`;
}
export function ncbiRequest(value, descriptor) {
  assertNcbiDescriptor(descriptor);
  if (value !== ncbiCitation(descriptor)) throw invalid();
  return new URL(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${descriptor.pmid}&retmode=xml&tool=liquidity_studio`);
}
export function ncbiSelectionDigest(descriptor) {
  assertNcbiDescriptor(descriptor);
  return createHash("sha256").update(JSON.stringify({ provider: NCBI_PROVIDER, pmid: descriptor.pmid, policy: records[descriptor.pmid] })).digest("hex");
}
export function assertNcbiEvidence(descriptor, snapshot) {
  assertNcbiDescriptor(descriptor);
  assertNcbiDescriptor(snapshot?.retrieval);
  if (snapshot.retrieval.pmid !== descriptor.pmid || snapshot.sourceUrl !== ncbiCitation(descriptor)
      || snapshot.requestedUrl !== ncbiRequest(snapshot.sourceUrl, descriptor).href
      || typeof snapshot.contentType !== "string" || !["text/xml", "application/xml"].includes(snapshot.contentType.split(";")[0].trim().toLowerCase())
      || !Number.isSafeInteger(snapshot.responseBytes) || snapshot.responseBytes < 1 || snapshot.responseBytes > 512 * 1024
      || !/^[a-f0-9]{64}$/.test(snapshot.responseSha256)
      || snapshot.extractionVersion !== NCBI_EXTRACTION || snapshot.selectionMethod !== NCBI_SELECTION
      || snapshot.selectionQuerySha256 !== ncbiSelectionDigest(descriptor)) throw invalid();
}

/** Saxes has no DTD/network resolver. The single allowed declaration is inert
 * identification syntax; never add entities or fetch its system identifier. */
export function extractNcbiAbstract(body, contentType, descriptor) {
  assertNcbiDescriptor(descriptor);
  if (typeof body !== "string" || Buffer.byteLength(body, "utf8") > 512 * 1024
      || !["text/xml", "application/xml"].includes(contentType.split(";")[0].trim().toLowerCase())) throw invalid();
  const declarations = body.match(/<!DOCTYPE[\s\S]*?>/g) || [];
  if (declarations.length > 1 || declarations.some(value => value !== NCBI_DOCTYPE)
      || /<!ENTITY\b/.test(body)) throw invalid();
  const parser = new SaxesParser({ xmlns: false });
  const stack = [], pmids = [], abstracts = [];
  let doctypeCount = 0, articleCount = 0, citationCount = 0, bibliographyCount = 0, abstractCount = 0, currentPart = null, pmidText = null, nodes = 0;
  const clean = text => text.replace(/\s+/g, " ").trim();
  const root = "PubmedArticleSet/PubmedArticle/MedlineCitation";
  const inline = new Set(["b", "i", "u", "sup", "sub", "italic", "bold", "superscript", "subscript"]);
  parser.on("xmldecl", value => {
    if (value.version !== "1.0" || (value.encoding !== undefined && !/^utf-?8$/i.test(value.encoding))) throw invalid();
  });
  parser.on("error", () => { throw invalid(); });
  parser.on("processinginstruction", () => { throw invalid(); });
  parser.on("doctype", value => {
    if (++doctypeCount > 1 || `<!DOCTYPE${value}>` !== NCBI_DOCTYPE) throw invalid();
  });
  parser.on("opentag", node => {
    if (++nodes > 20000 || stack.length >= 40 || node.name.length > 100 || node.name.includes(":")
        || Object.keys(node.attributes).length > 32
        || Object.entries(node.attributes).some(([key, value]) => (key === "xmlns" || key.startsWith("xmlns:")) || key.length > 100 || typeof value !== "string" || value.length > 1024)) throw invalid();
    if ((!stack.length && node.name !== "PubmedArticleSet")
        || (stack.length === 1 && node.name !== "PubmedArticle")) throw invalid();
    if (currentPart && !inline.has(node.name)) throw invalid();
    stack.push(node.name);
    const at = stack.join("/");
    if (at === "PubmedArticleSet/PubmedArticle" && ++articleCount > 1) throw invalid();
    if (at === root && ++citationCount > 1) throw invalid();
    if (at === `${root}/Article` && ++bibliographyCount > 1) throw invalid();
    if (at === `${root}/Article/Abstract` && ++abstractCount > 1) throw invalid();
    if (at === `${root}/PMID`) {
      if (pmids.length || pmidText !== null) throw invalid();
      pmidText = "";
    }
    if (at === `${root}/Article/Abstract/AbstractText`) {
      if (abstracts.length >= 16) throw invalid();
      currentPart = { label: node.attributes.Label ?? null, text: "" };
    }
  });
  const text = value => {
    if (currentPart) {
      currentPart.text += value;
      if (currentPart.text.length > 24000) throw invalid();
    }
    if (pmidText !== null && stack.join("/") === `${root}/PMID`) {
      pmidText += value;
      if (pmidText.length > 20) throw invalid();
    }
  };
  parser.on("text", text);
  parser.on("cdata", text);
  parser.on("closetag", () => {
    const at = stack.join("/");
    if (at === `${root}/PMID`) { pmids.push(clean(pmidText)); pmidText = null; }
    if (at === `${root}/Article/Abstract/AbstractText`) {
      abstracts.push({ label: currentPart.label, text: clean(currentPart.text) }); currentPart = null;
    }
    stack.pop();
  });
  try { parser.write(body).close(); } catch { throw invalid(); }
  if (doctypeCount !== declarations.length || articleCount !== 1 || citationCount !== 1 || bibliographyCount !== 1 || abstractCount !== 1 || pmids.length !== 1 || pmids[0] !== descriptor.pmid || !abstracts.length) throw invalid();
  const policy = records[descriptor.pmid];
  let selected;
  if (policy.sections) {
    let previous = -1;
    selected = policy.sections.map(([label, prefix]) => {
      const matches = abstracts.flatMap((part, index) => part.label === label ? [{ part, index }] : []);
      if (matches.length !== 1 || matches[0].index <= previous || !matches[0].part.text) throw invalid();
      previous = matches[0].index;
      return `${prefix} ${matches[0].part.text}`;
    }).join("\n");
  } else {
    if (abstracts.length !== 1 || abstracts[0].label !== null || !abstracts[0].text.startsWith(`${policy.prefix} `)) throw invalid();
    selected = abstracts[0].text;
  }
  if (selected.length < 40 || selected.length > 24000) throw invalid();
  return selected;
}
