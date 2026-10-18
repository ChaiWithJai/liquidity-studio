/** Operator-owned research pointers. These are source selection, never approved claims. */
export const SOURCE_CATALOG_REVISION = "pilot-primary-v1";
export const DEFAULT_SOURCE_HOSTS =
  "angelcity.com,www.gutenberg.org,www.prnewswire.com";
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
