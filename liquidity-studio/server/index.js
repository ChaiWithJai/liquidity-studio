import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createPlatform} from './platform.js';
import {fail} from './auth.js';
import {computePreflight} from './preflight.js';
import {validateFeedUrl,normalizeFeed} from './discovery.js';
import {createExport} from './export-assets.js';
import {checkReadiness} from './operational-health.js';
import {startServer} from './runtime.js';
const DIST_DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const formats=['infographic','carousel','story','reel'];
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function text(value,name,max=300){if(typeof value!=='string'||!value.trim()||value.length>max)throw fail(400,`Invalid ${name}`);return value.trim();}
function claims(value){
 if(!Array.isArray(value)||value.length<1||value.length>30)throw fail(400,'At least one source claim is required');
 return value.map(claim=>{const result={id:text(claim.id,'claim id',128),text:text(claim.text,'claim text',3000),sourceUrl:text(claim.sourceUrl,'source URL',2048),status:claim.status||'unreviewed'};let url;try{url=new URL(result.sourceUrl);}catch{throw fail(400,'Invalid source URL');}if(url.protocol!=='https:'||url.username||url.password||!['approved','unreviewed','rejected'].includes(result.status))throw fail(400,'Invalid source claim');if(claim.kind)result.kind=claim.kind;if(claim.clinicalReview)result.clinicalReview=claim.clinicalReview;return result;});
}
async function readBody(req,limit=262144){
 if(!(req.headers['content-type']||'').startsWith('application/json'))throw fail(415,'Use application/json');
 if(Number(req.headers['content-length'])>limit)throw fail(413,'Request body is too large');
 let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>limit)throw fail(413,'Request body is too large');chunks.push(chunk);}
 let value;try{value=JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{throw fail(400,'Malformed JSON');}
 if(!value||Array.isArray(value)||typeof value!=='object')throw fail(400,'JSON object required');return value;
}
function token(req){const cookie=(req.headers.cookie||'').split(';').map(value=>value.trim()).find(value=>value.startsWith('studio_session='));return cookie?.slice('studio_session='.length);}
export function createHttpServer(appContainer=null,{platform=appContainer?null:createPlatform(),trustedTestMode=false,distDir=DIST_DIR}={}){
 if(appContainer&&!trustedTestMode&&!platform)throw new Error('Injected containers require an authenticated platform or explicit trustedTestMode');
 const server=http.createServer(async(req,res)=>{
  const requestId=randomUUID();let activeContainer;
  res.setHeader('X-Request-Id',requestId);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Cache-Control','no-store');
  const json=(status,payload)=>{if(res.headersSent)return;res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(payload));};
  try{
   const origin=req.headers.origin;const hostOrigin=`${req.socket.encrypted||process.env.STUDIO_COOKIE_SECURE==='true'?'https':'http'}://${req.headers.host}`;
   const allowed=(process.env.STUDIO_ALLOWED_ORIGINS||'').split(',').filter(Boolean);
   if(origin&&origin!==hostOrigin&&!allowed.includes(origin))throw fail(403,'Origin is not allowed');
   if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Credentials','true');}
   if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,X-Organization-Id,X-Brand-Id');return json(204,{});}
   const decoded=decodeURIComponent((req.url||'/').split('?')[0]);
   if(decoded.includes('\0')||decoded.includes('\\')||decoded.split('/').includes('..'))throw fail(400,'Invalid path');
   const url=new URL(req.url,'http://localhost');const route=url.pathname;
   if(req.method==='GET'&&route==='/healthz')return json(200,{status:'alive'});
   if(req.method==='GET'&&route==='/readyz'){
    if(trustedTestMode){const result=await checkReadiness(appContainer);return json(result.status==='ready'?200:503,result);}
    let timer;const available=await Promise.race([Promise.resolve(platform.ready).then(()=>platform.store.get('identity')).then(()=>true,()=>false),new Promise(resolve=>{timer=setTimeout(()=>resolve(false),1000);})]).finally(()=>clearTimeout(timer));return json(available?200:503,{status:available?'ready':'not_ready',checks:{repository:available?'available':'unavailable',generationProvider:'not_checked'},scope:'studio_repository_access'});
   }
   if(!route.startsWith('/api/')){
    if(req.method!=='GET')throw fail(405,'Method not allowed');
    const candidate=path.resolve(distDir,'.'+(route==='/'?'/index.html':route));const base=fs.realpathSync(distDir);
    let file;try{file=fs.realpathSync(candidate);}catch{throw fail(404,'Not found');}
    if(!file.startsWith(base+path.sep)||!fs.statSync(file).isFile())throw fail(404,'Not found');
    const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());return stream.pipe(res);
   }
   if(platform?.ready)await platform.ready;
   const identity=platform?.identity;let user=trustedTestMode?{id:'test',username:'test',role:'founder'}:await identity.authenticate(token(req));
   const session=async()=>{const organizations=await identity.organizations(user);return {user,organizations,activeScope:organizations[0]&&{organizationId:organizations[0].id,brandId:organizations[0].brands[0]?.id},permissions:{admin:user.role==='founder',canEdit:true}};};
   const cookie=(value,expires=false)=>{const secure=req.socket.encrypted||process.env.STUDIO_COOKIE_SECURE==='true';res.setHeader('Set-Cookie',`studio_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${expires?0:8*3600}${secure?'; Secure':''}`);};
   if(route==='/api/auth/login'&&req.method==='POST'){
    const body=await readBody(req);const login=await identity.login(text(body.username,'username',128),text(body.password,'password',1024));if(!login)throw fail(401,'Invalid username or password');user=login.user;cookie(login.token);return json(200,await session());
   }
   if(route==='/api/auth/logout'&&req.method==='POST'){await identity.logout(token(req));cookie('',true);return json(200,{user:null});}
   if(!user)return json(401,{user:null,error:'Sign in required',requestId});
   if(route==='/api/auth/session'&&req.method==='GET')return json(200,await session());
   const founder=()=>{if(user.role!=='founder')throw fail(403,'Founder access required');};
   const body=req.method==='POST'?await readBody(req,route==='/api/admin/import'?32*1024*1024:262144):{};
   if(route==='/api/admin/organizations'&&req.method==='POST'){founder();return json(201,{organization:await identity.createOrganization(user,text(body.name,'name'))});}
   if(route==='/api/admin/brands'&&req.method==='POST'){founder();if(!['liquidity_desk','vedic_dharma'].includes(body.preset||'liquidity_desk'))throw fail(400,'Invalid brand preset');return json(201,{brand:await identity.createBrand(user,{organizationId:text(body.organizationId,'organization'),name:text(body.name,'name'),preset:body.preset})});}
   if(route==='/api/admin/memberships'&&req.method==='POST'){founder();if(!Array.isArray(body.brandIds)||body.brandIds.some(id=>typeof id!=='string'))throw fail(400,'Invalid brand IDs');return json(200,await identity.setMembership(user,{userId:text(body.userId,'user id'),organizationId:text(body.organizationId,'organization'),brandIds:body.brandIds}));}
   const scope=trustedTestMode?{organizationId:'test',brandId:'test'}:await identity.authorize(user,url.searchParams.get('organizationId')||req.headers['x-organization-id'],url.searchParams.get('brandId')||req.headers['x-brand-id']);
   activeContainer=trustedTestMode?appContainer:await platform.forScope(scope);
   const {repo,telemetry}=activeContainer.ports;const {backlogCalendarService:backlog,multiFormatFormatterService:formatter,batchProductionService:batch,adminObservabilityService:admin}=activeContainer.services;
   if(route.startsWith('/api/admin/'))founder();
   if(route==='/api/studio/bootstrap'&&req.method==='GET')return json(200,{...await backlog.getStudioBootstrap(),...(trustedTestMode?{}:await session()),activeScope:scope});
   if(route==='/api/studio/brand-profile'&&req.method==='POST'){
    const fields=['brandName','tagline','primaryColor','secondaryColor','accentColor','fontFamily','logoText','tone','audience','strategy','valueGroups','pillars','colors','fonts','website'];if(Object.keys(body).some(key=>!fields.includes(key)))throw fail(400,'Unknown brand profile field');
    if(body.colors&&(!Array.isArray(body.colors)||body.colors.some(color=>typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color))))throw fail(400,'Invalid brand colors');
    if(body.fonts&&(!body.fonts||typeof body.fonts!=='object'||Array.isArray(body.fonts)||Object.values(body.fonts).some(font=>typeof font!=='string'||font.length>100)))throw fail(400,'Invalid fonts');
    if(body.website){let website;try{website=new URL(body.website);}catch{throw fail(400,'Invalid website');}if(website.protocol!=='https:')throw fail(400,'Invalid website');}
    if(Object.entries(body).filter(([key])=>key!=='fonts').some(([,value])=>typeof value!=='string'&&!Array.isArray(value)))throw fail(400,'Invalid brand profile value');return json(200,await backlog.updateBrandProfile(body));
   }
   if(route==='/api/studio/backlog'&&req.method==='POST'){
    const sourceClaims=claims(body.sourceClaims);if(body.scheduledDay&&!days.includes(body.scheduledDay))throw fail(400,'Invalid scheduled day');return json(201,await backlog.addStory({...body,title:text(body.title,'title'),sourceClaims}));
   }
   if(route==='/api/studio/source-claims'&&req.method==='POST'){const sourceClaims=claims(body.sourceClaims);return json(200,{story:await repo.updateSourceClaims(text(body.storyId,'story id'),sourceClaims)});}
   if(route==='/api/studio/schedule'&&req.method==='POST'){
    if(body.scheduledDay&&!days.includes(body.scheduledDay))throw fail(400,'Invalid scheduled day');if(body.status&&!['In Backlog','Ready for Campaign','Draft Ready','Scheduled','Published'].includes(body.status))throw fail(400,'Invalid story status');return json(200,await backlog.scheduleStory({...body,storyId:text(body.storyId,'story id')}));
   }
   if(route==='/api/studio/generate-campaign'&&req.method==='POST')return json(200,{...await formatter.generateCampaignForStory(text(body.storyId,'story id')),...await backlog.getStudioBootstrap()});
   if(route==='/api/studio/save-edit'&&req.method==='POST'){
    if(!formats.includes(body.format)||!body.content||typeof body.content!=='object'||Array.isArray(body.content))throw fail(400,'Invalid campaign edit');if(body.expectedRevision!==undefined&&!Number.isInteger(body.expectedRevision))throw fail(400,'Invalid revision');return json(200,await formatter.saveInlineEdit({...body,storyId:text(body.storyId,'story id')}));
   }
   if(route==='/api/studio/preflight'&&req.method==='POST'){
    const storyId=text(body.storyId,'story id');if(!(await repo.listBacklog()).some(story=>story.id===storyId))throw fail(404,'Story not found');if(!formats.includes(body.format))throw fail(400,'Invalid format');const measured=computePreflight(body);const record=await repo.savePreflight({storyId,format:body.format,...measured});return json(200,{...measured,evidenceId:record.id});
   }
   if(route==='/api/studio/export-asset'&&req.method==='POST'){
    const story=(await repo.listBacklog()).find(story=>story.id===body.storyId);if(!story?.campaignDraft)throw fail(404,'Draft not found');if(!formats.includes(body.format))throw fail(400,'Invalid format');
    const output=await createExport({brandProfile:await repo.getBrandProfile(),campaign:story.campaignDraft,format:body.format});
    const asset=await repo.saveAsset({storyId:story.id,format:body.format,filename:output.filename,contentType:output.contentType,base64:output.bytes.toString('base64')});
    await repo.updateStoryStatus(story.id,'Exported');await telemetry.recordMarketerAction({storyId:story.id,storyTitle:story.title,format:body.format,action:'download_created',finalContent:story.campaignDraft[body.format]});
    await repo.recordUsage?.({id:asset.id,type:'export',format:body.format});return json(201,{exported:true,exportId:asset.id,downloadUrl:`/api/studio/assets/${asset.id}?organizationId=${encodeURIComponent(scope.organizationId)}&brandId=${encodeURIComponent(scope.brandId)}`,...await backlog.getStudioBootstrap()});
   }
   if(route.startsWith('/api/studio/assets/')&&req.method==='GET'){
    const asset=await repo.getAsset(route.split('/').pop());if(!asset)throw fail(404,'Asset not found');res.writeHead(200,{'Content-Type':asset.contentType,'Content-Disposition':`attachment; filename="${asset.filename.replace(/[^a-zA-Z0-9_.-]/g,'_')}"`});return res.end(Buffer.from(asset.base64,'base64'));
   }
   if(route==='/api/studio/ingest'&&req.method==='POST'){return json(201,{added:await repo.ingestStories(normalizeFeed(body))});}
   if(route==='/api/admin/discovery-config'&&req.method==='POST'){const feedUrl=validateFeedUrl(body.feedUrl).href;await repo.mutate(state=>({...state,discovery:{feedUrl}}));return json(200,{configured:true,feedUrl});}
   if(route==='/api/admin/overview'&&req.method==='GET')return json(200,await admin.getOverview());
   if(route==='/api/admin/context-graph'&&req.method==='GET')return json(200,admin.getContextGraph());
   if(route==='/api/admin/gateway-config'&&req.method==='POST'){
    if(Object.keys(body).some(key=>!['provider','model','temperature'].includes(key)))throw fail(400,'Unsupported gateway setting');if(body.provider&&!['gcp-gemini','openai-gateway'].includes(body.provider))throw fail(400,'Invalid provider');if(body.model)text(body.model,'model',128);if(body.temperature!==undefined&&(!Number.isFinite(body.temperature)||body.temperature<0||body.temperature>2))throw fail(400,'Invalid temperature');return json(200,await admin.updateGatewayConfig(body));
   }
   if(route==='/api/admin/run-weekly-batch'&&req.method==='POST'){
    if(!trustedTestMode)text(body.idempotencyKey,'idempotency key',128);const maxStories=body.maxStories??1;if(!Number.isInteger(maxStories)||maxStories<1||maxStories>50)throw fail(400,'Invalid batch size');return json(200,await batch.runWeeklyBatch({idempotencyKey:body.idempotencyKey,maxStories}));
   }
   if(route==='/api/admin/backprop-jsonl'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/x-ndjson','Content-Disposition':'attachment; filename="feedback.jsonl"'});return res.end(await admin.exportBackpropDatasetJsonl());}
   if(route==='/api/admin/eject'&&req.method==='GET')return json(200,await repo.exportData());
   if(route==='/api/admin/import'&&req.method==='POST')return json(200,await repo.importData(body));
   throw fail(404,'Not found');
  }catch(error){const status=error.status||500;const code=status<500?error.message:'Request failed';
   try{await activeContainer?.ports.repo?.mutate?.(state=>{state.operationalEvents||=[];state.operationalEvents.push({requestId,method:req.method,status,code:status>=500?'INTERNAL_ERROR':code,at:new Date().toISOString()});state.operationalEvents=state.operationalEvents.slice(-1000);return state;});}catch{console.error(JSON.stringify({event:'error_record_failed',requestId}));}
   console.error(JSON.stringify({event:'request_failed',requestId,status,code:status>=500?'INTERNAL_ERROR':code}));return json(status,{error:code,requestId});
  }
 });
 server.requestTimeout=30000;server.headersTimeout=10000;return server;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))startServer(createHttpServer());
