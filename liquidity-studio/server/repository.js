import {randomUUID} from 'node:crypto';
import {DEFAULT_BRAND_PROFILE,INITIAL_CONTENT_BACKLOG,BRAND_PRESETS} from './domain.js';
import {fail} from './auth.js';
export const scopeKey=({organizationId,brandId})=>`scope:${organizationId}:${brandId}`;
export class ScopedRepository {
 constructor(store,scope){this.store=store;this.scope=scope;this.key=scopeKey(scope);this.ready=store.update(this.key,state=>state||{
  schemaVersion:1,brandProfile:structuredClone(BRAND_PRESETS[scope.preset]||DEFAULT_BRAND_PROFILE),
  backlog:scope.preset==='vedic_dharma'?[]:INITIAL_CONTENT_BACKLOG.map((story,index)=>({...story,sourceClaims:story.verifiedFacts.map((text,i)=>({id:`legacy_${i}`,text,status:'unreviewed',sourceUrl:null})),verifiedFacts:[],scheduledDay:['Monday','Tuesday','Wednesday','Thursday','Friday'][index%5],campaignDraft:null,revision:1})),
  telemetry:{traces:[],batchJobs:[],backpropDataset:[]},jobs:[],assets:[],preflights:[],usage:[]
 });}
 async read(){await this.ready;return this.store.get(this.key);}
 async mutate(callback){await this.ready;return this.store.update(this.key,callback);}
 async getBrandProfile(){return (await this.read()).brandProfile;}
 async updateBrandProfile(patch){return (await this.mutate(state=>{state.brandProfile={...state.brandProfile,...patch};return state;})).brandProfile;}
 async listBacklog(){return (await this.read()).backlog;}
 async getCalendarSchedule(){const backlog=await this.listBacklog();return ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day=>({day,items:backlog.filter(story=>story.scheduledDay===day)}));}
 async addBacklogStory(input){const story={id:randomUUID(),title:input.title,category:input.category||'Uncategorized',audienceTag:input.audienceTag||'General',trendBadge:'Added to Queue',status:'In Backlog',scheduledDay:input.scheduledDay||'Monday',sourceClaims:input.sourceClaims||[],verifiedFacts:(input.sourceClaims||[]).filter(claim=>claim.status==='approved').map(claim=>claim.text),campaignDraft:null,revision:1};await this.mutate(state=>{state.backlog.unshift(story);return state;});return story;}
 async updateStory(id,change){let updated;await this.mutate(state=>{const story=state.backlog.find(story=>story.id===id);if(!story)throw fail(404,'Story not found');change(story);story.revision=(story.revision||0)+1;updated=story;return state;});return updated;}
 async updateStoryStatus(id,status,scheduledDay){return this.updateStory(id,story=>{if(status)story.status=status;if(scheduledDay)story.scheduledDay=scheduledDay;});}
 async saveCampaignDraft(id,campaign,expectedRevision){return this.updateStory(id,story=>{if(expectedRevision!==undefined&&story.revision!==expectedRevision)throw fail(409,'Story changed during generation; retry');story.campaignDraft=campaign;story.status='Draft Ready';});}
 async updateCampaignFormatDraft(id,format,content,expectedRevision){return this.updateStory(id,story=>{if(!story.campaignDraft)throw fail(404,'Draft not found');if(expectedRevision!==undefined&&story.revision!==expectedRevision)throw fail(409,'Draft changed; reload before saving');story.campaignDraft[format]=content;});}
 async updateSourceClaims(id,claims){return this.updateStory(id,story=>{story.sourceClaims=claims;story.verifiedFacts=claims.filter(claim=>claim.status==='approved').map(claim=>claim.text);});}
 async ingestStories(stories){let added=0;await this.mutate(state=>{added=0;for(const input of stories){if(state.backlog.some(story=>story.sourceId===input.sourceId))continue;state.backlog.push({...input,id:randomUUID(),verifiedFacts:[],scheduledDay:'Monday',status:'In Backlog',campaignDraft:null,revision:1});added++;}return state;});return added;}
 async recordUsage(event){await this.mutate(state=>{if(!state.usage.some(row=>row.id===event.id))state.usage.push({...event,timestamp:new Date().toISOString()});return state;});}
 async claimJob(idempotencyKey){let job;let claimed=false;await this.mutate(state=>{claimed=false;job=state.jobs.find(job=>job.idempotencyKey===idempotencyKey);if(!job){job={jobId:randomUUID(),idempotencyKey,status:'RUNNING',startedAt:new Date().toISOString(),completedStoryIds:[]};state.jobs.unshift(job);claimed=true;}return state;});return {job,claimed};}
 async updateJob(id,patch){return (await this.mutate(state=>{Object.assign(state.jobs.find(job=>job.jobId===id),patch);return state;})).jobs.find(job=>job.jobId===id);}
 async saveAsset(asset){
  const record={id:randomUUID(),...asset,createdAt:new Date().toISOString()};
  if(this.store.uploadArtifact){record.artifactRef=await this.store.uploadArtifact(this.scope,record.id,Buffer.from(record.base64,'base64'),record.contentType);delete record.base64;}
  await this.mutate(state=>{state.assets.push(record);return state;});return record;
 }
 async getAsset(id){const record=(await this.read()).assets.find(asset=>asset.id===id);if(!record)return null;if(record.artifactRef)return {...record,base64:(await this.store.downloadArtifact(this.scope,record.artifactRef)).toString('base64')};return record;}
 async savePreflight(record){const value={id:randomUUID(),createdAt:new Date().toISOString(),...record};await this.mutate(state=>{state.preflights.push(value);return state;});return value;}
 async exportData(){const data=await this.read();data.assets=await Promise.all(data.assets.map(async asset=>{const complete=await this.getAsset(asset.id);delete complete.artifactRef;return complete;}));return {schemaVersion:1,exportedAt:new Date().toISOString(),data};}
 async importData(bundle){if(bundle?.schemaVersion!==1||bundle.data?.schemaVersion!==1||!Array.isArray(bundle.data.backlog)||!Array.isArray(bundle.data.assets)||typeof bundle.data.brandProfile?.brandName!=='string'||!Array.isArray(bundle.data.telemetry?.traces)||!Array.isArray(bundle.data.telemetry?.backpropDataset)||!Array.isArray(bundle.data.telemetry?.batchJobs)||!Array.isArray(bundle.data.jobs)||!Array.isArray(bundle.data.usage)||!Array.isArray(bundle.data.preflights))throw fail(400,'Invalid import schema');if(bundle.data.assets.some(asset=>asset.artifactRef||typeof asset.base64!=='string'||typeof asset.id!=='string'||typeof asset.filename!=='string'||!['image/png','application/zip','text/plain; charset=utf-8','text/plain'].includes(asset.contentType)))throw fail(400,'Invalid portable artifact');const allowed=['schemaVersion','brandProfile','backlog','telemetry','jobs','assets','preflights','usage'];const data=Object.fromEntries(allowed.map(key=>[key,bundle.data[key]]));if(this.store.uploadArtifact){for(const asset of data.assets){asset.artifactRef=await this.store.uploadArtifact(this.scope,asset.id,Buffer.from(asset.base64,'base64'),asset.contentType);delete asset.base64;}}await this.store.update(this.key,()=>data);return {imported:true};}
}
