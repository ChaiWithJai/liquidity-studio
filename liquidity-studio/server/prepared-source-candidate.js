import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fail } from "./auth.js";
import { brandRevision } from "./multimodal-contract.js";
import { renderSvg, sourcePrefixForLines } from "./artwork.js";
import { storyContentDigest } from "./story-content-revision.js";
import { catalogForStory, SOURCE_CATALOG_REVISION, sourceCopySelection, clinicalCopyBindings } from "./source-catalog.js";
import { assertNcbiDescriptor, assertNcbiEvidence } from "./ncbi-pubmed-source.js";
export const PREPARATION_PURPOSE = "source-preparation";
export function preparationInput(story, scope) {
  return {
    title: story.title,
    contentDigest: storyContentDigest(story),
    sourceClaims: story.sourceClaims || [],
    contentRevision: story.contentRevision || 1,
    catalog: catalogForStory(story, scope),
    catalogRevision: SOURCE_CATALOG_REVISION,
  };
}
export function preparationFingerprint(story, scope) {
  return createHash("sha256")
    .update(JSON.stringify(preparationInput(story, scope)))
    .digest("hex");
}
export function preparationUrls(story, scope) {
  let urls = [
    ...new Set(
      (story.sourceClaims || [])
        .map((claim) => claim.sourceUrl)
        .filter(Boolean),
    ),
  ];
  if (!urls.length)
    urls = catalogForStory(story, scope).map((entry) => entry.sourceUrl);
  if (!urls.length || urls.length > 2)
    throw fail(
      422,
      "Preparation requires one or two source URLs; review the source selection",
    );
  return urls;
}
function excerptsFor(evidence) {
  return evidence
    .flatMap((snapshot) => {
      const paragraphs = snapshot.text
        .split("\n")
        .map((text) =>
          text.includes(" -- ") ? text.slice(text.indexOf(" -- ") + 4) : text,
        )
        .filter(
          (text) =>
            text.length >= 40 &&
            !(
              /^(About |Media Contact|View original|For more information)/i.test(
                text,
              ) || /^SOURCE /.test(text)
            ),
        );
      return paragraphs.slice(0, 4).map((text) => {
        const sentence = text.match(/^.{25,}?[.!?](?=\s|$)/)?.[0] || text;
        const cut = sentence.slice(0, 140);
        const excerpt =
          sentence.length > 140 ? cut.slice(0, cut.lastIndexOf(" ")) : cut;
        return {
          evidenceId: snapshot.id,
          sourceUrl: snapshot.sourceUrl,
          text: excerpt,
          startOffset: snapshot.text.indexOf(excerpt),
          status: "unreviewed",
          clinicalReview: null,
        };
      });
    })
    .slice(0, 4);
}
export function candidateArtwork(excerpts) {
  const [sourceHeading, first = sourceHeading, second = first, third = first] =
    excerpts.map((excerpt) => excerpt.text);
  const heading = sourceHeading
    .replace(/^\d+\.\s+/, "")
    .split(/:\s/)[0]
    .replace(/\s+are$/, "");
  const texts = [first, second, third];
  return {
    infographic: {
      headline: heading.slice(0, 100),
      statRows: texts,
      bottomTakeaway: third,
      caption: first,
    },
    carousel: {
      coverHook: heading.slice(0, 100),
      slides: [
        ...texts.map((text, index) => ({
          slideNumber: index + 1,
          title: heading.slice(0, 70),
          bodyMetric: text,
          visualNote: "Source excerpt text card",
        })),
        {
          slideNumber: 4,
          title: heading.slice(0, 70),
          bodyMetric: third,
          visualNote: "Editorial review step; no factual assertion",
        },
      ],
    },
    story: {
      hookBanner: heading.slice(0, 90),
      keyStatHighlight: first,
      interactiveStickerPrompt: second.slice(0, 90),
    },
    reel: {
      spokenHook0to3s: heading.slice(0, 90),
      beats: texts.map((text, index) => ({
        timecode: ["0:00-0:05", "0:05-0:15", "0:15-0:30"][index],
        voiceover: text.slice(0, 100),
        onScreenText: text.slice(0, 75),
        bRollDirection: "Unreviewed source excerpt text card",
      })),
      closingCta: third.slice(0, 90),
    },
  };
}
/** Version2 changes only new source-derived artwork, never historical human work. */
export function candidateArtworkV2(excerpts) {
  const [heading, first = heading, second = first, third = second] = excerpts;
  const sourceFieldMappings = [];
  const value = (fieldPath, excerpt, width, size, maxLines) => {
    const text = maxLines ? sourcePrefixForLines(excerpt.text, {width,size,maxLines}) : excerpt.text;
    sourceFieldMappings.push({fieldPath,evidenceId:excerpt.evidenceId,startOffset:excerpt.startOffset,textLength:text.length});
    return text;
  };
  const h = path => value(path,heading,900,52,2);
  const rows = excerpts.length >= 3 ? excerpts.slice(-3) : [first,second,third];
  const artwork = {
    infographic: {
      headline:h("infographic.headline"),
      statRows:rows.map((x,i)=>value(`infographic.statRows.${i}`,x,840,34,3)),
      bottomTakeaway:value("infographic.bottomTakeaway",third,900,29,2),
      caption:value("infographic.caption",first),
    },
    carousel: {
      coverHook:h("carousel.coverHook"),
      slides:[...rows,third].map((x,i)=>({
        slideNumber:i+1,title:h(`carousel.slides.${i}.title`),
        bodyMetric:value(`carousel.slides.${i}.bodyMetric`,x,840,34,4),
        visualNote:i===3?"Editorial review step; no factual assertion":"Source excerpt text card",
      })),
    },
    story:{
      hookBanner:value("story.hookBanner",heading,900,52,3),
      keyStatHighlight:value("story.keyStatHighlight",first,840,34,5),
      interactiveStickerPrompt:value("story.interactiveStickerPrompt",second,900,29,2),
    },
    reel:{
      spokenHook0to3s:value("reel.spokenHook0to3s",heading,740,52,3),
      beats:rows.map((x,i)=>({
        timecode:["0:00-0:05","0:05-0:15","0:15-0:30"][i],
        voiceover:value(`reel.beats.${i}.voiceover`,x,680,34,5),
        onScreenText:value(`reel.beats.${i}.onScreenText`,x,740,52,3),
        bRollDirection:"Unreviewed source excerpt text card",
      })),
      closingCta:value("reel.closingCta",third,740,29,2),
    },
  };
  return {artwork,sourceFieldMappings};
}

/** Reject classification or projection downgrades for newly introduced clinical sources. */
export function assertClinicalSelectionBinding(sourceSelection,evidence,version) {
 const pointers=Array.isArray(sourceSelection)?sourceSelection:[];
 for (const snapshot of Array.isArray(evidence)?evidence:[]) if(snapshot?.retrieval!==undefined)assertNcbiDescriptor(snapshot.retrieval);
 for(const bound of clinicalCopyBindings()) {
  const used=pointers.some(p=>p?.id===bound.catalogId||p?.artworkSelectionId===bound.id||p?.sourceUrl===bound.sourceUrl)||
    (Array.isArray(evidence)&&evidence.some(e=>e?.sourceUrl===bound.sourceUrl||e?.retrieval?.pmid===bound.retrieval.pmid))||pointers.some(p=>p?.retrieval?.pmid===bound.retrieval.pmid);
  if(!used)continue;
  if(version!==3||pointers.length!==1||pointers[0]?.id!==bound.catalogId||pointers[0]?.artworkSelectionId!==bound.id||pointers[0]?.sourceUrl!==bound.sourceUrl||pointers[0]?.kind!=='clinical'||pointers[0]?.publisher!==bound.publisher)
   throw fail(422,'Pinned clinical source classification and projection required');
  assertNcbiDescriptor(pointers[0].retrieval);
  if(pointers[0].retrieval.pmid!==bound.retrieval.pmid||!Array.isArray(evidence)||evidence.length!==1)throw fail(422,'Pinned clinical transport required');
  assertNcbiEvidence(bound.retrieval,evidence[0]);
 }
}

/** Version3 selects useful, pinned exact clauses/sentences; never truncates to fit. */
export function candidateArtworkV3(evidence, sourceSelection, preset) {
  if (!Array.isArray(sourceSelection) || sourceSelection.length !== 1 || evidence.length !== 1)
    throw fail(422, "Exact copy requires one pinned source selection");
  assertClinicalSelectionBinding(sourceSelection,evidence,3);
  const pointer=sourceSelection[0],selection=sourceCopySelection(pointer?.artworkSelectionId);
  const snapshot=evidence[0];
  if (!selection || pointer.id!==selection.catalogId || pointer.sourceUrl!==selection.sourceUrl ||
      snapshot.sourceUrl!==selection.sourceUrl || preset!==selection.preset)
    throw fail(422, "Unknown or mismatched exact copy selection");
  const span=(text,form='clause')=>{
    if (typeof text!=='string' || !text || text.length>2000) throw fail(422,"Invalid exact source copy");
    const offset=snapshot.text.indexOf(text);
    if (offset<0 || snapshot.text.indexOf(text,offset+1)!==-1)
      throw fail(422,"Selected source copy is missing or ambiguous; source research required");
    return {text,evidenceId:snapshot.id,sourceUrl:snapshot.sourceUrl,startOffset:offset,form};
  };
  const heading=span(selection.headline,'label'),facts=selection.facts.map(item=>span(item.text,item.form));
  const overlays=selection.overlays.map(text=>span(text,'label'));
  let caption;
  if(selection.captionText!==undefined)caption=span(selection.captionText,'context');
  else {
   const paragraphs=snapshot.text.split('\n').filter(text=>text.startsWith(selection.captionPrefix+' '));
   if(paragraphs.length!==1)throw fail(422,"Source context paragraph is missing or ambiguous");
   caption=span(paragraphs[0],'context');
  }
  const context=span(selection.contextText,'label');
  const sourceFieldMappings=[];
  const value=(fieldPath,item)=>{sourceFieldMappings.push({fieldPath,evidenceId:item.evidenceId,startOffset:item.startOffset,textLength:item.text.length,copyForm:item.form});return item.text;};
  const editorial='Review the full source context before using this draft.';
  const artwork={
    infographic:{headline:value('infographic.headline',heading),statRows:facts.map((x,i)=>value(`infographic.statRows.${i}`,x)),bottomTakeaway:value('infographic.bottomTakeaway',context),caption:value('infographic.caption',caption)},
    carousel:{coverHook:value('carousel.coverHook',heading),slides:[...facts,null].map((x,i)=>({slideNumber:i+1,title:x?value(`carousel.slides.${i}.title`,heading):'Review the source',bodyMetric:x?value(`carousel.slides.${i}.bodyMetric`,x):editorial,visualNote:value(`carousel.slides.${i}.visualNote`,context)}))},
    story:{hookBanner:value('story.hookBanner',heading),keyStatHighlight:value('story.keyStatHighlight',facts[selection.storyFactIndex]),interactiveStickerPrompt:value('story.interactiveStickerPrompt',context)},
    reel:{spokenHook0to3s:value('reel.spokenHook0to3s',heading),beats:facts.map((x,i)=>({timecode:['0:00-0:05','0:05-0:15','0:15-0:30'][i],voiceover:value(`reel.beats.${i}.voiceover`,x),onScreenText:value(`reel.beats.${i}.onScreenText`,overlays[i]),bRollDirection:'Unreviewed source excerpt text card'})),closingCta:value('reel.closingCta',context)},
  };
  const excerpts=[heading,...facts].map(({form,...item})=>({...item,status:'unreviewed',clinicalReview:null}));
  return {artwork,sourceFieldMappings,excerpts};
}

export function buildPreparedCandidate({
  id,
  scope,
  story,
  brandProfile,
  evidence,
  jobId,
  itemId,
  attemptId,
  createdAt,
  projectionFrom, // Trusted server fork context only; never an HTTP override.
}) {
  if (
    !id ||
    !scope?.organizationId ||
    !scope?.brandId ||
    !Array.isArray(evidence) ||
    !evidence.length ||
    evidence.length > 2
  )
    throw fail(422, "Invalid preparation evidence");
  for (const snapshot of evidence) {
    if (
      !snapshot.id ||
      snapshot.status !== "unreviewed" ||
      snapshot.approval !== "none" ||
      typeof snapshot.text !== "string" ||
      snapshot.textSha256 !==
        createHash("sha256").update(snapshot.text).digest("hex")
    )
      throw fail(422, "Preparation evidence integrity failed");
  }
  const sourceSelection=projectionFrom?structuredClone(projectionFrom.sourceSelection||[]):catalogForStory(story, scope).filter(entry=>evidence.some(snapshot=>snapshot.sourceUrl===entry.sourceUrl));
  const version=projectionFrom?(projectionFrom.artworkProjectionVersion===undefined?1:projectionFrom.artworkProjectionVersion):sourceSelection.some(entry=>entry.artworkSelectionId)?3:2;
  if (![1,2,3].includes(version)) throw fail(422,"Unknown retained copy projection");
  const priorExcerpts=version===3?null:excerptsFor(evidence);
  if (priorExcerpts && !priorExcerpts.length) throw fail(422, "No usable source excerpts were retrieved");
  assertClinicalSelectionBinding(sourceSelection,evidence,version);
  const projection=version===3?candidateArtworkV3(evidence,sourceSelection,scope.preset):version===2?candidateArtworkV2(priorExcerpts):{artwork:candidateArtwork(priorExcerpts)};
  const excerpts=version===3?projection.excerpts:priorExcerpts;
  return {
    schemaVersion: 1,
    ...(version>=2?{artworkProjectionVersion:version,sourceFieldMappings:projection.sourceFieldMappings}:{}),
    id,
    ...scope,
    storyId: story.id,
    contentRevision: story.contentRevision || 1,
    inputFingerprint: preparationFingerprint(story, scope),
    brandRevision: brandRevision(brandProfile),
    jobId,
    itemId,
    attemptId,
    createdAt,
    excerpts,
    sourceSelection,
    artwork: projection.artwork,
    provenance: {
      purpose: PREPARATION_PURPOSE,
      mode: "extractive-unreviewed",
      humanApproval: "none",
      requiresReview: true,
      provider: "none",
      modelCalls: 0,
      evidenceIds: evidence.map((snapshot) => snapshot.id),
    },
  };
}
export function validatePreparedCandidate(candidate, evidence) {
  if (
    candidate?.provenance?.purpose !== PREPARATION_PURPOSE ||
    candidate.provenance.mode !== "extractive-unreviewed" ||
    candidate.provenance.humanApproval !== "none" ||
    candidate.provenance.requiresReview !== true ||
    candidate.provenance.provider !== "none" ||
    candidate.provenance.modelCalls !== 0
  )
    throw fail(422, "Candidate cannot claim human approval or model execution");
  const version = candidate.artworkProjectionVersion === undefined ? 1 : candidate.artworkProjectionVersion;
  if (version !== 1 && version !== 2 && version !== 3) throw fail(422, "Unknown candidate artwork projection version");
  if (!Array.isArray(evidence) || !evidence.length || evidence.length > 2 ||
      evidence.some(snapshot => !snapshot || typeof snapshot.text !== "string"))
    throw fail(422, "Invalid candidate evidence shape");
  assertClinicalSelectionBinding(candidate.sourceSelection,evidence,version);
  let excerpts = version===3?null:excerptsFor(evidence);
  if (excerpts && !excerpts.length) throw fail(422, "Candidate source excerpts required");
  let projection;
  try { projection = version===3?candidateArtworkV3(evidence,candidate.sourceSelection,candidate.preset):version === 2 ? candidateArtworkV2(excerpts) : {artwork:candidateArtwork(excerpts)}; }
  catch { throw fail(422, "Candidate source prefixes cannot fit the declared projection"); }
  if(version===3)excerpts=projection.excerpts;
  if ((version === 1 && candidate.sourceFieldMappings !== undefined) ||
      (version >= 2 && !isDeepStrictEqual(candidate.sourceFieldMappings, projection.sourceFieldMappings)))
    throw fail(422, "Candidate source field mappings must preserve exact source prefixes");
  if (
    !isDeepStrictEqual(candidate.excerpts, excerpts) ||
    !isDeepStrictEqual(candidate.artwork, projection.artwork) ||
    !isDeepStrictEqual(
      candidate.provenance.evidenceIds,
      evidence.map((snapshot) => snapshot.id),
    )
  )
    throw fail(422, "Candidate must preserve the retrieved excerpts exactly");
  return true;
}

export function validateCandidateLayout(artwork, brandProfile = {}) {
  try {
    for (const format of ["infographic", "carousel", "story", "reel"]) {
      const count =
        format === "carousel"
          ? artwork.carousel.slides.length
          : format === "reel"
            ? artwork.reel.beats.length
            : 1;
      for (let slideIndex = 0; slideIndex < count; slideIndex++)
        renderSvg({ campaign: artwork, brandProfile, format, slideIndex });
    }
  } catch {
    throw fail(
      422,
      "Candidate copy does not fit the artwork; shorten it and preserve local edits",
    );
  }
  return true;
}
