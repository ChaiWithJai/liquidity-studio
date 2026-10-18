/** Operator-owned research pointers. These are source selection, never approved claims. */
// Additive entry IDs/passages version individual selections. Keep existing entries unchanged
// so unrelated saved candidates do not become stale merely because another topic gains a source.
export const SOURCE_CATALOG_REVISION = "pilot-primary-v1";
export const DEFAULT_SOURCE_HOSTS =
  "angelcity.com,www.gutenberg.org,www.prnewswire.com,investor.amctheatres.com,newsroom.hasbro.com,www.nykaa.com,explore.trin.cam.ac.uk";
const entries = Object.freeze([
  Object.freeze({
    id: "angel-city-ownership-2024",
    preset: "liquidity_desk",
    storyId: "story_angel_city",
    topicTerms: ["angel", "city"],
    sourceUrl:
      "https://angelcity.com/acfc-post/angel-city-ownership-agreement-announcement",
    publisher: "Angel City FC",
    kind: "financial",
    coverage:
      "Ownership agreement announcement. Legacy media-rights and sponsorship claims are not established by this source.",
  }),
  Object.freeze({
    id: "huda-ownership-2025",
    preset: "liquidity_desk",
    storyId: "story_huda_buyback",
    topicTerms: ["huda", "beauty"],
    sourceUrl:
      "https://www.prnewswire.com/news-releases/huda-beauty-reclaims-full-ownership-as-an-independent-beauty-brand-302471853.html",
    publisher: "Huda Beauty issuer release via PR Newswire",
    kind: "financial",
    coverage:
      "The issuer release is dated June 3, 2025. The legacy 2024 buyback date and margin estimates require correction or independent evidence; this selection does not approve them.",
  }),
  Object.freeze({
    id: "beyonce-amc-distribution-2023",
    preset: "liquidity_desk",
    storyId: "story_beyonce_amc",
    topicTerms: ["beyonc", "amc"],
    sourceUrl: "https://investor.amctheatres.com/news-events/press-releases/detail/10/renaissance-a-film-by-beyonc-will-take-over-movie-theaters-worldwide-this-december",
    publisher: "Parkwood Entertainment and AMC issuer announcement, October 2, 2023",
    kind: "financial",
    coverage: "Historical theatrical distribution announcement only. Legacy tour revenue, revenue split, opening gross and merchandise figures are not established. Photo rights are not granted by this source selection.",
  }),
  Object.freeze({
    id: "luckychap-monopoly-development-2024",
    preset: "liquidity_desk",
    storyId: "story_margot_luckychap",
    topicTerms: ["luckychap"],
    sourceUrl: "https://newsroom.hasbro.com/node/34741",
    publisher: "Hasbro and Lionsgate issuer announcement, April 10, 2024",
    kind: "financial",
    coverage: "LuckyChap production and Monopoly development announcement. Does not establish Margot Robbie compensation, producer profit shares or risk-free equity returns. Box office is not producer profit.",
  }),
  Object.freeze({
    id: "nykaa-online-physical-company-profile",
    preset: "liquidity_desk",
    storyId: "story_nykaa_ipo",
    topicTerms: ["nykaa"],
    sourceUrl: "https://www.nykaa.com/who_are_we",
    publisher: "Nykaa issuer company profile",
    passage: {
      version: "nykaa-company-origin-platforms-v1",
      section: "The Nykaa Story",
      nextSection: "Our Vision",
      paragraphPrefixes: ["Nykaa is built on", "Over the years, Nykaa"],
    },
    kind: "financial",
    coverage: "Issuer account of company origin and online/physical business. Excludes undated store/customer totals and all legacy IPO valuation, market-share and causal CAC claims. Not the FY2022 PDF report.",
  }),
  Object.freeze({
    id: "ramanujan-trinity-institutional-record",
    preset: "vedic_dharma",
    storyId: "research_1",
    topicTerms: ["ramanujan"],
    sourceUrl: "https://explore.trin.cam.ac.uk/assets/ramanujan/",
    publisher: "Trinity College Cambridge institutional memorial record",
    passage: {
      version: "ramanujan-institutional-biography-opening-v1",
      section: "Srinivasa Ramanujan, FRS ஸ்ரீநிவாச ராமானுஜன்",
      nextSection: "Memorial inscription",
      paragraphPrefixes: ["Srinivasa Ramanujan was an autodidact"],
    },
    kind: "cultural",
    coverage: "Institutional biographical account only, not a theorem proof or evidence for devotional causation. Excludes the later memorial translation and its first-Indian-FRS claim. Original manuscript archive retrieval remains separate research.",
  }),
  Object.freeze({
    id: "yoga-sutras-primary-translation",
    preset: "vedic_dharma",
    storyId: "research_4",
    topicTerms: ["yoga", "sutra"],
    sourceUrl: "https://www.gutenberg.org/cache/epub/2526/pg2526-images.html",
    publisher: "Charles Johnston translation via Project Gutenberg",
    passage: {
      version: "yoga-book-ii-29-30-32-46-v1",
      section: "BOOK II",
      nextSection: "INTRODUCTION TO BOOK III",
      paragraphPrefixes: ["29.", "30.", "32.", "46."],
    },
    kind: "cultural",
    coverage:
      "Historical text translation for cultural review. This is not clinical evidence or a medical outcome claim.",
  }),
]);
export function catalogForStory(story, scope) {
  return entries
    .filter(
      (entry) =>
        entry.preset === scope?.preset &&
        entry.storyId === story.id &&
        entry.topicTerms.every((term) =>
          String(story.title || "")
            .toLowerCase()
            .includes(term),
        ),
    )
    .map((entry) => ({
      ...entry,
      status: "unreviewed",
      approval: "none",
      catalogRevision: SOURCE_CATALOG_REVISION,
    }));
}
