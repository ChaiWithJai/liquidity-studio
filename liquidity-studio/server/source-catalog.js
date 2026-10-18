/** Operator-owned research pointers. These are source selection, never approved claims. */
// Additive entry IDs/passages version individual selections. Keep existing entries unchanged
// so unrelated saved candidates do not become stale merely because another topic gains a source.
export const SOURCE_CATALOG_REVISION = "pilot-primary-v1";
export const DEFAULT_SOURCE_HOSTS =
  "angelcity.com,www.gutenberg.org,www.prnewswire.com,investor.amctheatres.com,newsroom.hasbro.com,www.apparelgroup.com,explore.trin.cam.ac.uk";
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
    artworkSelectionId: "amc-release-copy-v1",
    preset: "liquidity_desk",
    storyId: "story_beyonce_amc",
    topicTerms: ["beyonc", "amc"],
    sourceUrl: "https://investor.amctheatres.com/news-events/press-releases/detail/10/renaissance-a-film-by-beyonc-will-take-over-movie-theaters-worldwide-this-december",
    publisher: "Parkwood Entertainment and AMC issuer announcement, October 2, 2023",
    passage: {
      version: "renaissance-distribution-release-v2",
      mode: "after-heading-prefix",
      section: "RENAISSANCE: A FILM BY BEYONCÉ Will Take Over Movie Theaters, Worldwide This December",
      paragraphPrefixes: [
        "RENAISSANCE: A FILM BY BEYONCÉ , chronicles",
        "LOS ANGELES--(BUSINESS WIRE)-- Today,",
        "The theatrical concert experience will descend",
        "The experience will air Thursdays,",
      ],
    },
    kind: "financial",
    coverage: "Historical theatrical distribution announcement only. Legacy tour revenue, revenue split, opening gross and merchandise figures are not established. Photo rights are not granted by this source selection.",
  }),
  Object.freeze({
    id: "luckychap-monopoly-development-2024",
    artworkSelectionId: "luckychap-development-copy-v1",
    preset: "liquidity_desk",
    storyId: "story_margot_luckychap",
    topicTerms: ["luckychap"],
    sourceUrl: "https://newsroom.hasbro.com/node/34741",
    publisher: "Hasbro and Lionsgate issuer announcement, April 10, 2024",
    kind: "financial",
    coverage: "LuckyChap production and Monopoly development announcement. Does not establish Margot Robbie compensation, producer profit shares or risk-free equity returns. Box office is not producer profit.",
  }),
  Object.freeze({
    id: "nykaa-apparel-alliance-2022-v1",
    artworkSelectionId: "nykaa-planned-alliance-copy-v1",
    preset: "liquidity_desk",
    storyId: "story_nykaa_ipo",
    topicTerms: ["nykaa"],
    sourceUrl: "https://www.apparelgroup.com/en/news/nykaa-enters-into-a-strategic-alliance-with-middle-east-based-apparel-group-to-recreate-omnichannel-beauty-retail-platform-in-the-gcc/",
    publisher: "Apparel Group counterparty announcement, October 6, 2022",
    passage: {
      version: "nykaa-planned-gcc-alliance-v2",
      mode: "after-heading-prefix",
      section: "Nykaa Enters into a Strategic Alliance with Middle East-based Apparel Group to Recreate Omnichannel Beauty Retail Platform in the GCC",
      paragraphPrefixes: ["Mumbai, October 6, 2022 :", "Founded by Falguni Nayar in 2012,"],
    },
    kind: "financial",
    coverage: "Historical counterparty announcement of a planned GCC omnichannel alliance. Does not establish completion, IPO valuation, market share or causal CAC claims. Excludes third-party market forecasts and About sections.",
  }),
  Object.freeze({
    id: "ramanujan-trinity-institutional-record",
    artworkSelectionId: "trinity-biography-copy-v1",
    preset: "vedic_dharma",
    storyId: "research_1",
    topicTerms: ["ramanujan"],
    sourceUrl: "https://explore.trin.cam.ac.uk/assets/ramanujan/",
    publisher: "Trinity College Cambridge institutional memorial record",
    passage: {
      version: "ramanujan-institutional-biography-opening-v2",
      section: "Srinivasa Ramanujan, FRS ஸ்ரீநிவாச ராமானுஜன்",
      nextSection: "Memorial inscription",
      paragraphPrefixes: ["Srinivasa Ramanujan was an autodidact", "Born into a poor Brahmin family in India,", "Ramanujan received a scholarship", "During his short lifetime, Ramanujan"],
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


// Immutable historical copy selections. New wording requires a NEW ID; never edit
// a published version. Text below must match one unique span of retained evidence.
// Roles describe excerpts/labels, not a claim that every span is a full sentence.
const copySelections = [
  {
    id:'amc-release-copy-v1',catalogId:'beyonce-amc-distribution-2023',preset:'liquidity_desk',
    sourceUrl:'https://investor.amctheatres.com/news-events/press-releases/detail/10/renaissance-a-film-by-beyonc-will-take-over-movie-theaters-worldwide-this-december',
    headline:'RENAISSANCE: A FILM BY BEYONCÉ',
    facts:[
      {text:'premieres December 1 in North American cinemas.',form:'clause'},
      {text:'will be released on the silver screen globally by AMC Theatres Distribution.',form:'clause'},
      {text:'officially open in the United States, Canada, and Mexico beginning Friday, December 1, 2023.',form:'clause'},
    ],
    overlays:['premieres December 1 in North American cinemas.','AMC Theatres Distribution','Friday, December 1, 2023.'],
    captionPrefix:'RENAISSANCE: A FILM BY BEYONCÉ , chronicles',contextText:'Friday, December 1, 2023.',storyFactIndex:0,
  },
  {
    id:'luckychap-development-copy-v1',catalogId:'luckychap-monopoly-development-2024',preset:'liquidity_desk',
    sourceUrl:'https://newsroom.hasbro.com/node/34741',headline:'LUCKYCHAP',
    facts:[
      {text:'Lionsgate (NYSE: LGF.A, LGF.B) and Hasbro announced today that they have signed a deal with LuckyChap',form:'clause'},
      {text:'to produce Monopoly , a motion picture in development',form:'clause'},
      {text:'Hasbro Entertainment will also produce.',form:'sentence'},
    ],
    overlays:['Lionsgate (NYSE: LGF.A, LGF.B) and Hasbro','a motion picture in development','Hasbro Entertainment will also produce.'],
    captionPrefix:'SANTA MONICA, Calif. April 10, 2024',contextText:'April 10, 2024',storyFactIndex:0,
  },
  {
    id:'trinity-biography-copy-v1',catalogId:'ramanujan-trinity-institutional-record',preset:'vedic_dharma',
    sourceUrl:'https://explore.trin.cam.ac.uk/assets/ramanujan/',headline:'Srinivasa Ramanujan',
    facts:[
      {text:'G.H. Hardy called him a natural genius.',form:'sentence'},
      {text:'He demonstrated unusual mathematical skill at school, winning accolades and awards.',form:'sentence'},
      {text:'Ramanujan independently compiled nearly 3900 results (mostly identities and equations).',form:'sentence'},
    ],
    overlays:['G.H. Hardy called him a natural genius.','He demonstrated unusual mathematical skill','Ramanujan independently compiled nearly 3900 results'],
    captionPrefix:'During his short lifetime, Ramanujan',contextText:'During his short lifetime',storyFactIndex:2,
  },
  {
    id:'nykaa-planned-alliance-copy-v1',catalogId:'nykaa-apparel-alliance-2022-v1',preset:'liquidity_desk',
    sourceUrl:'https://www.apparelgroup.com/en/news/nykaa-enters-into-a-strategic-alliance-with-middle-east-based-apparel-group-to-recreate-omnichannel-beauty-retail-platform-in-the-gcc/',
    headline:'Nykaa, an omnichannel consumer-tech company',
    facts:[
      {text:'received board approval to sign an agreement with the Middle East’s Apparel Group',form:'clause'},
      {text:'Nykaa will leverage the Apparel Group’s robust retail infrastructure network',form:'clause'},
      {text:'to build distinctive Gulf Cooperation Council (GCC) focused beauty offerings',form:'clause'},
    ],
    overlays:['received board approval to sign an agreement','the Apparel Group’s robust retail infrastructure network','Gulf Cooperation Council (GCC) focused beauty offerings'],
    captionPrefix:'Mumbai, October 6, 2022 :',contextText:'October 6, 2022',storyFactIndex:0,
  },
];
export function sourceCopySelection(id) {
  const selection=copySelections.find(item=>item.id===id);
  return selection?structuredClone(selection):null;
}
