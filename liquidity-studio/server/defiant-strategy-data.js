// Supplied issue214 examples only. No tenants, forecasts, cleared rights or provider configuration.
export const demoData = {
  "nodes": [
    {
      "id": "node_lagos",
      "kind": "region",
      "name": "Lagos",
      "subtitle": "Nigeria",
      "tags": [
        "Afrobeats",
        "Alté",
        "Fuji-Amapiano Fusion",
        "Street-Pop"
      ],
      "verification": "example",
      "seedRef": "node_lagos"
    },
    {
      "id": "node_london",
      "kind": "region",
      "name": "London",
      "subtitle": "United Kingdom",
      "tags": [
        "Afro-Swing",
        "UK Drill",
        "Garage/Jungle",
        "Diaspora R&B/Soul"
      ],
      "verification": "example",
      "seedRef": "node_london"
    },
    {
      "id": "node_atlanta",
      "kind": "region",
      "name": "Atlanta",
      "subtitle": "United States",
      "tags": [
        "Melodic Trap",
        "Southern Street Rap",
        "808 Club Bounce",
        "R&B Trap"
      ],
      "verification": "example",
      "seedRef": "node_atlanta"
    },
    {
      "id": "node_toronto",
      "kind": "region",
      "name": "Toronto",
      "subtitle": "Canada",
      "tags": [
        "Nocturnal Melodic R&B",
        "Patois-Infused Road Rap",
        "Bricks In The 6 Drill",
        "Punjabi-Trap Crossover"
      ],
      "verification": "example",
      "seedRef": "node_toronto"
    },
    {
      "id": "node_mumbai",
      "kind": "region",
      "name": "Mumbai",
      "subtitle": "India",
      "tags": [
        "Gully Hip-Hop",
        "Tabla-Drill",
        "Hinglish Melodic Trap",
        "Indo-Afro Bounce"
      ],
      "verification": "example",
      "seedRef": "node_mumbai"
    },
    {
      "id": "node_kingston",
      "kind": "region",
      "name": "Kingston",
      "subtitle": "Jamaica",
      "tags": [
        "Modern Dancehall",
        "Trap-Dancehall",
        "Roots Dub Revival",
        "Riddim Vocal"
      ],
      "verification": "example",
      "seedRef": "node_kingston"
    },
    {
      "id": "yt_sig_lagos_01",
      "kind": "artist",
      "name": "Teniola Vibe",
      "subtitle": "Alté / Fuji-Amapiano Fusion",
      "regionId": "node_lagos",
      "profile": "Yoruba-Pidgin melodic cadence with acoustic guitar & log-drum pocket",
      "bpm": 113,
      "evidenceIds": [
        "evidence:yt_sig_lagos_01"
      ],
      "relatedResourceIds": [
        "conn_cat_nipsey_london_marsha_real_big",
        "conn_xxl_global_freshman_cypher",
        "conn_studio_kofi_mensah_ldn",
        "conn_cat_nipsey_hussle_and_motivate",
        "conn_xxl_inside_track_co_sign",
        "conn_cat_nipsey_toronto_murda_pnd"
      ],
      "verification": "example",
      "seedRef": "yt_sig_lagos_01"
    },
    {
      "id": "yt_sig_london_01",
      "kind": "artist",
      "name": "Kairo SE15",
      "subtitle": "Afro-Swing / Melodic UK Road Rap",
      "regionId": "node_london",
      "profile": "Gritty South London storytelling over warm Fender Rhodes & syncopated rimshots",
      "bpm": 116,
      "evidenceIds": [
        "evidence:yt_sig_london_01"
      ],
      "relatedResourceIds": [],
      "verification": "example",
      "seedRef": "yt_sig_london_01"
    },
    {
      "id": "yt_sig_atlanta_01",
      "kind": "artist",
      "name": "Lil Vonn WestEnd",
      "subtitle": "Melodic Trap / 808 Club Bounce",
      "regionId": "node_atlanta",
      "profile": "Double-time Atlanta triplet pocket with brass-heavy 808 low end",
      "bpm": 140,
      "evidenceIds": [
        "evidence:yt_sig_atlanta_01"
      ],
      "relatedResourceIds": [],
      "verification": "example",
      "seedRef": "yt_sig_atlanta_01"
    },
    {
      "id": "yt_sig_toronto_01",
      "kind": "artist",
      "name": "Desta 6ix",
      "subtitle": "Nocturnal East-African/Caribbean Melodic Trap",
      "regionId": "node_toronto",
      "profile": "Atmospheric minor-key vocal run blending Toronto R&B with East African pentatonic phrasing",
      "bpm": 118,
      "evidenceIds": [
        "evidence:yt_sig_toronto_01"
      ],
      "relatedResourceIds": [],
      "verification": "example",
      "seedRef": "yt_sig_toronto_01"
    },
    {
      "id": "yt_sig_mumbai_01",
      "kind": "artist",
      "name": "Raghav & The Colaba Cypher",
      "subtitle": "Tabla-Drill / Hinglish Gully Rap",
      "regionId": "node_mumbai",
      "profile": "Rapid-fire Marathi-Hindi-English internal rhymes over live tabla and sliding drill bass",
      "bpm": 140,
      "evidenceIds": [
        "evidence:yt_sig_mumbai_01"
      ],
      "relatedResourceIds": [
        "conn_cat_nipsey_hussle_and_motivate",
        "conn_xxl_global_freshman_cypher",
        "conn_studio_rohan_varma_bom_ldn"
      ],
      "verification": "example",
      "seedRef": "yt_sig_mumbai_01"
    },
    {
      "id": "yt_sig_kingston_01",
      "kind": "artist",
      "name": "Zahara Sound",
      "subtitle": "Roots-Trap Dancehall",
      "regionId": "node_kingston",
      "profile": "Raspy Patois singjay delivery with heavy sub-bass dub drop",
      "bpm": 102,
      "evidenceIds": [
        "evidence:yt_sig_kingston_01"
      ],
      "relatedResourceIds": [
        "conn_cat_nipsey_succa_proof_konshens",
        "conn_xxl_2010_nipsey_freshman_vault",
        "conn_studio_kofi_mensah_ldn",
        "conn_xxl_inside_track_co_sign"
      ],
      "verification": "example",
      "seedRef": "yt_sig_kingston_01"
    },
    {
      "id": "conn_cat_nipsey_succa_proof_konshens",
      "kind": "catalog",
      "name": "Nipsey Hussle — 'Succa Proof' (feat. Konshens & J-Black) [Victory Lap Master Stems]",
      "subtitle": "Unverified reference; rights unknown",
      "description": "Pre-existing Jamaican dancehall collaboration with Konshens on Grammy-nominated Victory Lap; pairs directly with Defiant Records' Vybz Kartel Kingston pipeline and emerging Kingston signal Zahara Sound.",
      "regionIds": [
        "node_kingston",
        "node_london",
        "node_toronto"
      ],
      "verification": "example",
      "seedRef": "conn_cat_nipsey_succa_proof_konshens"
    },
    {
      "id": "conn_cat_nipsey_toronto_murda_pnd",
      "kind": "catalog",
      "name": "Nipsey Hussle — 'Grinding All My Life' (prod. Murda Beatz) & 'Young Nigga' (PND/40 'West District' Sample)",
      "subtitle": "Unverified reference; rights unknown",
      "description": "Native Canadian/6ix sonic DNA (Murda Beatz, Belly, PartyNextDoor, Noah '40' Shebib) already inside Victory Lap; bridges directly into Defiant Presents: 'Bricks In The 6'.",
      "regionIds": [
        "node_toronto",
        "node_atlanta",
        "node_london"
      ],
      "verification": "example",
      "seedRef": "conn_cat_nipsey_toronto_murda_pnd"
    },
    {
      "id": "conn_cat_nipsey_london_marsha_real_big",
      "kind": "catalog",
      "name": "Nipsey Hussle — 'Real Big' (feat. London's Marsha Ambrosius) & 'Victory Lap' (Arctic Monkeys Interpolation)",
      "subtitle": "Unverified reference; rights unknown",
      "description": "Direct UK Soul & Rock lineage on Victory Lap; connects seamlessly with Defiant London Docklands Studio and UK Road Rap's adoption of Nipsey's $100 Crenshaw 'Proud 2 Pay' ownership ethos.",
      "regionIds": [
        "node_london",
        "node_lagos",
        "node_toronto"
      ],
      "verification": "example",
      "seedRef": "conn_cat_nipsey_london_marsha_real_big"
    },
    {
      "id": "conn_cat_nipsey_hussle_and_motivate",
      "kind": "catalog",
      "name": "Nipsey Hussle — 'Hussle & Motivate' & 'Prolific' (w/ Bino Rideaux) Interpolation Stems",
      "subtitle": "Unverified reference; rights unknown",
      "description": "High-energy underdog anthem; 140 BPM double-time pocket locks directly into Mumbai Gully / Tabla-Drill ('Raghav & The Colaba Cypher') and Rohan Varma's sub-bass production.",
      "regionIds": [
        "node_mumbai",
        "node_london",
        "node_atlanta"
      ],
      "verification": "example",
      "seedRef": "conn_cat_nipsey_hussle_and_motivate"
    },
    {
      "id": "conn_xxl_2010_nipsey_freshman_vault",
      "kind": "format",
      "name": "XXL 2010 Freshman Class Vault (Nipsey Hussle Cover, Freestyle & Unseen Outtakes)",
      "subtitle": "Unverified reference; rights unknown",
      "description": "Anchors Grammy-window catalog revival in XXL's canonical 2010 Freshman stamp—connecting Nipsey's early grind to the next generation of global freshmen.",
      "regionIds": [
        "node_kingston",
        "node_toronto",
        "node_london",
        "node_mumbai",
        "node_atlanta",
        "node_lagos"
      ],
      "verification": "example",
      "seedRef": "conn_xxl_2010_nipsey_freshman_vault"
    },
    {
      "id": "conn_xxl_global_freshman_cypher",
      "kind": "format",
      "name": "XXL Global Diaspora Cypher Format (Modeled on the 200M+ View 2016 XXL Cypher)",
      "subtitle": "Unverified reference; rights unknown",
      "description": "Places 3–5 regional YouTube breakouts over a single anchor producer's beat (MCVERTT / Rohan Varma / Kofi Mensah) under the XXL banner for zero-CAC viral debate and replay velocity.",
      "regionIds": [
        "node_mumbai",
        "node_lagos",
        "node_kingston",
        "node_london",
        "node_toronto",
        "node_atlanta"
      ],
      "verification": "example",
      "seedRef": "conn_xxl_global_freshman_cypher"
    },
    {
      "id": "conn_xxl_inside_track_co_sign",
      "kind": "format",
      "name": "XXL 'Inside Track' Executive Co-Sign Series (Steve 'Steve-O' Carless & Vanessa Satten)",
      "subtitle": "Unverified reference; rights unknown",
      "description": "Provides executive storytelling around catalog equity, rehearsal discipline, and 'The Marathon' vertical integration.",
      "regionIds": [
        "node_london",
        "node_atlanta",
        "node_toronto",
        "node_kingston"
      ],
      "verification": "example",
      "seedRef": "conn_xxl_inside_track_co_sign"
    },
    {
      "id": "conn_studio_kofi_mensah_ldn",
      "kind": "person",
      "name": "Kofi 'Bridge' Mensah + Defiant London Docklands 24/7 Studio",
      "subtitle": "Sample collaborator",
      "description": "",
      "regionIds": [
        "node_lagos",
        "node_london",
        "node_toronto"
      ],
      "verification": "example",
      "seedRef": "conn_studio_kofi_mensah_ldn"
    },
    {
      "id": "conn_studio_rohan_varma_bom_ldn",
      "kind": "person",
      "name": "Rohan Varma (Desi-Drill & Tabla Sub-Bass Architect — Mumbai/London)",
      "subtitle": "Sample collaborator",
      "description": "",
      "regionIds": [
        "node_mumbai",
        "node_london",
        "node_toronto"
      ],
      "verification": "example",
      "seedRef": "conn_studio_rohan_varma_bom_ldn"
    }
  ],
  "edges": [
    {
      "id": "edge_lagos_to_london",
      "kind": "route",
      "name": "Lagos → London",
      "from": "node_lagos",
      "to": "node_london",
      "subtitle": "UkNaija / Peckham-Victoria Island Corridor",
      "description": "Pair Lagos raw vocal with a UK Afro-Swing/Drill 16-bar verse; seed via Peckham sound systems and 1Xtra specialist radio.",
      "requirements": [
        "Verify bridge relationship",
        "Confirm participation, availability and rights"
      ],
      "state": "hypothesis",
      "verification": "example",
      "seedRef": "edge_lagos_to_london"
    },
    {
      "id": "edge_london_to_toronto",
      "kind": "route",
      "name": "London → Toronto",
      "from": "node_london",
      "to": "node_toronto",
      "subtitle": "Commonwealth Road-Rap & Patois Bridge",
      "description": "Cross-pollinate London club edits into Caribana / GTA sound crews and Defiant Presents: Bricks In The 6 slots.",
      "requirements": [
        "Verify bridge relationship",
        "Confirm participation, availability and rights"
      ],
      "state": "hypothesis",
      "verification": "example",
      "seedRef": "edge_london_to_toronto"
    },
    {
      "id": "edge_london_to_atlanta",
      "kind": "route",
      "name": "London → Atlanta",
      "from": "node_london",
      "to": "node_atlanta",
      "subtitle": "Transatlantic 808 & Melodic Crossover Bridge",
      "description": "Lock a 48-hour Atlanta-London studio camp (Patchwerk + Docklands) and drop an XXL-co-signed visual.",
      "requirements": [
        "Verify bridge relationship",
        "Confirm participation, availability and rights"
      ],
      "state": "hypothesis",
      "verification": "example",
      "seedRef": "edge_london_to_atlanta"
    },
    {
      "id": "edge_lagos_to_atlanta",
      "kind": "route",
      "name": "Lagos → Atlanta",
      "from": "node_lagos",
      "to": "node_atlanta",
      "subtitle": "Detty December to A-Town Club Bridge (The Gift Model)",
      "description": "Add 808 sub-bass weight to Lagos log-drum stems; service to Atlanta club DJs and diaspora lounges.",
      "requirements": [
        "Verify bridge relationship",
        "Confirm participation, availability and rights"
      ],
      "state": "hypothesis",
      "verification": "example",
      "seedRef": "edge_lagos_to_atlanta"
    },
    {
      "id": "edge_kingston_to_london",
      "kind": "route",
      "name": "Kingston → London",
      "from": "node_kingston",
      "to": "node_london",
      "subtitle": "Windrush Sound-System & Jungle/Bashment Bridge",
      "description": "Cut custom dubplates in Kingston; flip into a 140 BPM UK club/jungle edit and 106 BPM bashment original.",
      "requirements": [
        "Verify bridge relationship",
        "Confirm participation, availability and rights"
      ],
      "state": "hypothesis",
      "verification": "example",
      "seedRef": "edge_kingston_to_london"
    },
    {
      "id": "edge_kingston_to_toronto",
      "kind": "route",
      "name": "Kingston → Toronto",
      "from": "node_kingston",
      "to": "node_toronto",
      "subtitle": "Kingston-to-6ix Patois & Riddim Highway",
      "description": "Blend Kingston dancehall hook with nocturnal Toronto R&B/Trap chords; premiere across GTA sound systems.",
      "requirements": [
        "Verify bridge relationship",
        "Confirm participation, availability and rights"
      ],
      "state": "hypothesis",
      "verification": "example",
      "seedRef": "edge_kingston_to_toronto"
    },
    {
      "id": "edge_mumbai_to_london",
      "kind": "route",
      "name": "Mumbai → London",
      "from": "node_mumbai",
      "to": "node_london",
      "subtitle": "South Asian Diaspora / BBC Asian Network Corridor",
      "description": "Fuse Mumbai Gully/Tabla pocket with UK Drill sliding 808s via West London diaspora producers.",
      "requirements": [
        "Verify bridge relationship",
        "Confirm participation, availability and rights"
      ],
      "state": "hypothesis",
      "verification": "example",
      "seedRef": "edge_mumbai_to_london"
    },
    {
      "id": "edge_mumbai_to_toronto",
      "kind": "route",
      "name": "Mumbai → Toronto",
      "from": "node_mumbai",
      "to": "node_toronto",
      "subtitle": "Desi-Wave Global Streaming Superhighway",
      "description": "Pair Mumbai street lyricist with Toronto/Brampton melodic hook producer; launch synchronized YouTube Shorts + Reels.",
      "requirements": [
        "Verify bridge relationship",
        "Confirm participation, availability and rights"
      ],
      "state": "hypothesis",
      "verification": "example",
      "seedRef": "edge_mumbai_to_toronto"
    }
  ],
  "evidence": [
    {
      "id": "evidence:yt_sig_lagos_01",
      "sourceUrl": "https://www.youtube.com/watch?v=lagos_surulere_01",
      "title": "Teniola Vibe - Midnight in Surulere (Live Rooftop One-Take)",
      "method": "supplied-seed",
      "verification": "unverified-example",
      "observedAt": null,
      "excerpt": "Example reference; URL and performance have not been verified."
    },
    {
      "id": "evidence:yt_sig_london_01",
      "sourceUrl": "https://www.youtube.com/watch?v=london_peckham_01",
      "title": "Kairo SE15 - Rye Lane Rain (Peckham Live Mic Session)",
      "method": "supplied-seed",
      "verification": "unverified-example",
      "observedAt": null,
      "excerpt": "Example reference; URL and performance have not been verified."
    },
    {
      "id": "evidence:yt_sig_atlanta_01",
      "sourceUrl": "https://www.youtube.com/watch?v=atlanta_cascade_01",
      "title": "Lil Vonn WestEnd - Cascade Bounce (One-Mic Warehouse Freestyle)",
      "method": "supplied-seed",
      "verification": "unverified-example",
      "observedAt": null,
      "excerpt": "Example reference; URL and performance have not been verified."
    },
    {
      "id": "evidence:yt_sig_toronto_01",
      "sourceUrl": "https://www.youtube.com/watch?v=toronto_lawrence_01",
      "title": "Desta 6ix - Lawrence East 3AM (Live Studio Take)",
      "method": "supplied-seed",
      "verification": "unverified-example",
      "observedAt": null,
      "excerpt": "Example reference; URL and performance have not been verified."
    },
    {
      "id": "evidence:yt_sig_mumbai_01",
      "sourceUrl": "https://www.youtube.com/watch?v=mumbai_colaba_04",
      "title": "Colaba Causeway Cypher Ep. 4 - Tabla & 808s (Uncut Street Session)",
      "method": "supplied-seed",
      "verification": "unverified-example",
      "observedAt": null,
      "excerpt": "Example reference; URL and performance have not been verified."
    },
    {
      "id": "evidence:yt_sig_kingston_01",
      "sourceUrl": "https://www.youtube.com/watch?v=kingston_yard_01",
      "title": "Zahara Sound - Spanish Town Road Dubplate (Live Yard Session)",
      "method": "supplied-seed",
      "verification": "unverified-example",
      "observedAt": null,
      "excerpt": "Example reference; URL and performance have not been verified."
    }
  ],
  "observations": [],
  "resources": [
    {
      "id": "conn_cat_nipsey_succa_proof_konshens",
      "nodeId": "conn_cat_nipsey_succa_proof_konshens",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    },
    {
      "id": "conn_cat_nipsey_toronto_murda_pnd",
      "nodeId": "conn_cat_nipsey_toronto_murda_pnd",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    },
    {
      "id": "conn_cat_nipsey_london_marsha_real_big",
      "nodeId": "conn_cat_nipsey_london_marsha_real_big",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    },
    {
      "id": "conn_cat_nipsey_hussle_and_motivate",
      "nodeId": "conn_cat_nipsey_hussle_and_motivate",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    },
    {
      "id": "conn_xxl_2010_nipsey_freshman_vault",
      "nodeId": "conn_xxl_2010_nipsey_freshman_vault",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    },
    {
      "id": "conn_xxl_global_freshman_cypher",
      "nodeId": "conn_xxl_global_freshman_cypher",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    },
    {
      "id": "conn_xxl_inside_track_co_sign",
      "nodeId": "conn_xxl_inside_track_co_sign",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    },
    {
      "id": "conn_studio_kofi_mensah_ldn",
      "nodeId": "conn_studio_kofi_mensah_ldn",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    },
    {
      "id": "conn_studio_rohan_varma_bom_ldn",
      "nodeId": "conn_studio_rohan_varma_bom_ldn",
      "rights": {
        "status": "unknown",
        "notes": "Seed access/clearance claims are not evidence."
      },
      "availability": {
        "status": "unknown"
      },
      "verification": "example"
    }
  ]
};

import {fail} from './auth.js';
const kinds=new Set(['region','artist','signal','person','resource','format','catalog','external']);
const id=value=>typeof value==='string'&&/^[A-Za-z0-9_:-]{1,128}$/.test(value);
const bad=message=>{throw fail(422,message);};
const text=(v,name,max=2000,optional=false)=>{if(optional&&(v===undefined||v===null))return undefined;if(typeof v!=='string'||!v.trim()||v.length>max)bad(`Invalid ${name}`);return v.trim();};
const exact=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k)))bad('Unsupported import fields');};
const ids=(v=[])=>{if(!Array.isArray(v)||v.length>256||v.some(x=>!id(x))||new Set(v).size!==v.length)bad('Invalid referenced IDs');return [...v];};
const rows=(v,max)=>{if(!Array.isArray(v)||v.length>max)bad('Import exceeds bounded record count');return v;};
export function normalizeIntake(input){
 exact(input,['nodes','edges','evidence','observations','resources']);
 const nodes=rows(input.nodes||[],256).map(n=>{
  exact(n,['id','kind','name','subtitle','description','profile','regionId','regionIds','tags','evidenceIds','relatedResourceIds']);
  if(!id(n.id)||!kinds.has(n.kind))bad('Each node needs a stable ID and supported kind');
  return {id:n.id,kind:n.kind,name:text(n.name,'node name',200),...Object.fromEntries(['subtitle','description','profile'].filter(k=>n[k]!==undefined).map(k=>[k,text(n[k],k)])),...(n.regionId?{regionId:ids([n.regionId])[0]}:{}),regionIds:ids(n.regionIds),tags:rows(n.tags||[],20).map(x=>text(x,'tag',80)),evidenceIds:ids(n.evidenceIds),relatedResourceIds:ids(n.relatedResourceIds),verification:'user-reported'};
 });
 const evidence=rows(input.evidence||[],256).map(e=>{
  exact(e,['id','sourceUrl','title','excerpt','observedAt']);if(!id(e.id))bad('Invalid evidence ID');
  let url;try{url=new URL(e.sourceUrl);}catch{bad('Evidence requires a valid HTTPS reference');}
  if(url.protocol!=='https:'||url.username||url.password||url.href.length>2048)bad('Evidence requires an HTTPS reference without credentials');
  if(e.observedAt!==undefined&&e.observedAt!==null&&(typeof e.observedAt!=='string'||!Number.isFinite(Date.parse(e.observedAt))))bad('Invalid observation time');
  return {id:e.id,sourceUrl:url.href,title:text(e.title,'evidence title',300),excerpt:text(e.excerpt,'excerpt',4000,true)||'',observedAt:e.observedAt||null,method:'manual-import',verification:'user-reported'};
 });
 const edges=rows(input.edges||[],512).map(e=>{exact(e,['id','kind','name','from','to','subtitle','description','requirements','evidenceIds']);if(!id(e.id)||!id(e.from)||!id(e.to)||!['route','relationship','match'].includes(e.kind))bad('Invalid directed relationship');return {id:e.id,kind:e.kind,from:e.from,to:e.to,name:text(e.name,'relationship name',200),subtitle:text(e.subtitle,'subtitle',200,true)||'',description:text(e.description,'description',2000,true)||'',requirements:rows(e.requirements||[],20).map(x=>text(x,'requirement',300)),evidenceIds:ids(e.evidenceIds),state:'hypothesis',verification:'user-reported'};});
 const resources=rows(input.resources||[],256).map(r=>{exact(r,['id','nodeId','capabilities','location','rights','availability']);if(!id(r.id)||!id(r.nodeId))bad('Invalid resource ID');exact(r.rights||{},['notes','evidenceIds']);exact(r.availability||{},['start','end','timeZone','notes']);const a=r.availability||{};for(const k of ['start','end'])if(a[k]!==undefined&&a[k]!==null&&(typeof a[k]!=='string'||!Number.isFinite(Date.parse(a[k]))))bad('Invalid availability time');if(a.start&&a.end&&Date.parse(a.start)>=Date.parse(a.end))bad('Availability must end after it starts');if(a.timeZone){try{new Intl.DateTimeFormat('en',{timeZone:a.timeZone});}catch{bad('Invalid availability time zone');}}return {id:r.id,nodeId:r.nodeId,capabilities:rows(r.capabilities||[],20).map(x=>text(x,'capability',80)),location:text(r.location,'location',200,true)||'',rights:{status:'unverified',notes:text(r.rights?.notes,'rights notes',2000,true)||'',evidenceIds:ids(r.rights?.evidenceIds)},availability:{...a,status:a.start&&a.end?'user-reported':'unknown'},verification:'user-reported'};});
 const observations=rows(input.observations||[],256).map(o=>{exact(o,['id','nodeId','evidenceId','metric','unit','value','observedAt']);if(!id(o.id)||!id(o.nodeId)||!id(o.evidenceId)||(o.value!==null&&(typeof o.value!=='number'||!Number.isFinite(o.value)||o.value<0)))bad('Invalid user-reported observation');if(o.observedAt!==undefined&&o.observedAt!==null&&(typeof o.observedAt!=='string'||!Number.isFinite(Date.parse(o.observedAt))))bad('Invalid observation time');return {id:o.id,nodeId:o.nodeId,evidenceId:o.evidenceId,metric:text(o.metric,'metric',80),unit:text(o.unit,'unit',40),value:o.value,state:o.value===null?'unknown':'user-reported',observedAt:o.observedAt||null};});
 return {nodes,edges,evidence,observations,resources};
}
export function assertReferences(data){
 const unique=(list,name)=>{const set=new Set(list.map(x=>x.id));if(set.size!==list.length)bad(`Duplicate ${name} ID`);return set;};
 const nodes=unique(data.nodes,'node'),edges=unique(data.edges,'edge'),evidence=unique(data.evidence,'evidence'),resources=unique(data.resources,'resource');unique(data.observations,'observation');
 if([...edges].some(x=>nodes.has(x)))bad('Node and edge IDs must be distinct');
 for(const n of data.nodes){if(n.regionId&&(!nodes.has(n.regionId)||data.nodes.find(x=>x.id===n.regionId)?.kind!=='region'))bad('Unknown region');for(const x of n.regionIds||[])if(!nodes.has(x)||data.nodes.find(n=>n.id===x)?.kind!=='region')bad('Unknown region reference');for(const x of n.evidenceIds||[])if(!evidence.has(x))bad('Unknown evidence');for(const x of n.relatedResourceIds||[])if(!resources.has(x))bad('Unknown related resource');}
 for(const e of data.edges){if(!nodes.has(e.from)||!nodes.has(e.to)||e.from===e.to)bad('Unknown or self relationship endpoint');for(const x of e.evidenceIds||[])if(!evidence.has(x))bad('Unknown relationship evidence');}
 for(const r of data.resources){if(!nodes.has(r.nodeId))bad('Unknown resource node');for(const x of r.rights?.evidenceIds||[])if(!evidence.has(x))bad('Unknown rights evidence');}
 for(const o of data.observations)if(!nodes.has(o.nodeId)||!evidence.has(o.evidenceId))bad('Unknown observation source');
 if(data.nodes.length>256||data.edges.length>512||Buffer.byteLength(JSON.stringify(data))>1024*1024)bad('Strategy exceeds supported capacity');
}
export function projectGraph(state,{focusId='',selectedId='',query='',kinds='',showExamples='true'}={}){
 const all=state.graph.nodes.map(n=>({...n,sourceId:n.seedRef||n.id})),allEdges=state.graph.edges.map(e=>({...e,sourceId:e.seedRef||e.id})),items=[...all,...allEdges,...state.graph.clusters],find=id=>items.find(x=>x.id===id),focus=find(focusId),regions=all.filter(x=>x.kind==='region');
 if(focus&&allEdges.some(e=>e.id===focus.id))throw fail(422,'Focus a node or working group; select a relationship for its details');if(focusId&&!focus)throw fail(404,'Selected graph focus no longer exists');if(selectedId&&!find(selectedId))throw fail(404,'Selected finding no longer exists');
 const ring=nodes=>nodes.map((n,i)=>({...n,x:50+32*Math.cos(i*2*Math.PI/Math.max(1,nodes.length)),y:50+32*Math.sin(i*2*Math.PI/Math.max(1,nodes.length))}));
 let nodes=ring(regions.length?regions:all.slice(0,24)),visible=new Set(nodes.map(n=>n.id)),edges=allEdges.filter(e=>visible.has(e.from)&&visible.has(e.to));
 const city=focus?.kind==='region'?focus:all.find(n=>n.id===focus?.regionId),artist=['artist','signal'].includes(focus?.kind)?focus:city?all.find(n=>n.kind==='artist'&&n.regionId===city.id):null;
 const related=(artist?.relatedResourceIds||[]).map(resourceId=>{const resource=state.resources.find(r=>r.id===resourceId);const node=resource&&find(resource.nodeId);return node?{...resource,...node,resourceId:resource.id,suggestion:true}:null;}).filter(Boolean);
 if(focus&&focus.kind!=='cluster'&&focus.kind!=='route'&&!city){
  // A real imported person/signal need not have a geographic association. Show
  // its actual incident neighborhood rather than inventing a region or hiding it.
  const incident=allEdges.filter(e=>e.from===focus.id||e.to===focus.id),neighborIds=[focus.id,...new Set(incident.flatMap(e=>[e.from,e.to]).filter(id=>id!==focus.id))].slice(0,24);
  nodes=ring(neighborIds.map(find).filter(Boolean));visible=new Set(nodes.map(n=>n.id));edges=incident.filter(e=>visible.has(e.from)&&visible.has(e.to));
 }
 if(focus?.kind==='cluster'){nodes=ring(focus.nodeIds.map(find).filter(Boolean));visible=new Set(nodes.map(n=>n.id));edges=allEdges.filter(e=>visible.has(e.from)&&visible.has(e.to));}
 if(city){const routes=allEdges.filter(e=>e.kind==='route'&&e.from===city.id),targets=[...new Set(routes.map(e=>e.to))].map(find).filter(Boolean);nodes=[{...city,x:18,y:46},...(artist?[{...artist,x:44,y:46}]:[]),...targets.map((n,i)=>({...n,x:78,y:targets.length===1?46:23+i*47/Math.max(1,targets.length-1)}))];edges=routes.map(e=>({...e,from:artist?.id||city.id,sourceRegion:e.from}));if(artist)edges.push({id:`discovery:${artist.id}`,from:city.id,to:artist.id,kind:'discovery',label:'Referenced in',verification:artist.verification});if(focus.kind==='artist'&&related[0]){const n=related.find(x=>x.kind==='person')||related[0];nodes.push({...n,x:45,y:79});edges.push({id:`suggestion:${artist.id}:${n.id}`,from:artist.id,to:n.id,kind:'match',label:'Possible collaboration',suggestion:true,verification:'unverified'});}}
 const selectedKinds=kinds?kinds.split(','):[],allows=n=>(showExamples!=='false'||n.verification!=='example')&&(!selectedKinds.length||selectedKinds.includes(n.kind)||selectedKinds.includes('route')&&allEdges.some(e=>e.kind==='route'&&(e.from===n.id||e.to===n.id||e.from===n.regionId)));
 if(!focus&&selectedKinds.length){nodes=ring(all.filter(allows).slice(0,24));const ids=new Set(nodes.map(n=>n.id));edges=allEdges.filter(e=>ids.has(e.from)&&ids.has(e.to));}
 nodes=nodes.filter(allows);const filteredIds=new Set(nodes.map(n=>n.id));edges=edges.filter(e=>filteredIds.has(e.from)&&filteredIds.has(e.to)&&(showExamples!=='false'||e.verification!=='example')&&(selectedKinds.length!==1||selectedKinds[0]!=='route'||e.kind==='route'));
 return {revision:state.revision,nodes,edges,filters:{kinds:selectedKinds,showExamples:showExamples!=='false',query},selectedItem:find(selectedId)?{...find(selectedId),resource:state.resources.find(r=>r.nodeId===selectedId)||null,evidence:state.evidence.filter(e=>(find(selectedId).evidenceIds||[]).includes(e.id))}:null,matches:query.trim()?items.filter(n=>allows(n)&&n.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0,20):[],relatedResources:related.filter(allows)};
}
