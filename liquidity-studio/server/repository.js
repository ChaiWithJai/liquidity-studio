import {randomUUID} from 'node:crypto';
import {DEFAULT_BRAND_PROFILE,INITIAL_CONTENT_BACKLOG} from './domain.js';
import {fail} from './auth.js';
export const scopeKey=({organizationId,brandId})=>`scope:${organizationId}:${brandId}`;
export class ScopedRepository {
 constructor(store,scope){this.store=store;this.scope=scope;this.key=scopeKey(scope);store.update(this.key,state=>state||{
  schemaVersion:1,brandProfile:{...DEFAULT_BRAND_PROFILE,brandName:scope.preset==='vedic_dharma'?'Chai With Jai':DEFAULT_BRAND_PROFILE.brandName},
  backlog:scope.preset==='vedic_dharma'?[]:INITIAL_CONTENT_BACKLOG.map((story,index)=>({...story,sourceClaims:story.verifiedFacts.map((text,i)=>({id:`legacy_${i}`,text,status:'unreviewed',sourceUrl:null})),verifiedFacts:[],scheduledDay:['Monday','Tuesday','Wednesday','Thursday','Friday'][index%5],campaignDraft:null,revision:1})),
  telemetry:{traces:[],batchJobs:[],backpropDataset:[]},jobs:[],assets:[],preflights:[],usage:[]
 });}
 read(){return this.store.get(this.key);}
 mutate(callback){return this.store.update(this.key,callback);}
 async getBrandProfile(){return this.read().brandProfile;}
 async updateBrandProfile(patch){return this.mutate(state=>{state.brandProfile={...state.brandProfile,...patch};return state;}).brandProfile;}
 async listBacklog(){return this.read().backlog;}
 async getCalendarSchedule(){const backlog=await this.listBacklog();return ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day=>({day,items:backlog.filter(story=>story.scheduledDay===day)}));}
 async addBacklogStory(input){const story={id:randomUUID(),title:input.title,category:input.category||'Uncategorized',audienceTag:input.audienceTag||'General',trendBadge:'Added to Queue',status:'In Backlog',scheduledDay:input.scheduledDay||'Monday',sourceClaims:input.sourceClaims||[],verifiedFacts:(input.sourceClaims||[]).filter(claim=>claim.status==='approved').map(claim=>claim.text),campaignDraft:null,revision:1};this.mutate(state=>{state.backlog.unshift(story);return state;});return story;}
 updateStory(id,change){let updated;this.mutate(state=>{const story=state.backlog.find(story=>story.id===id);if(!story)throw fail(404,'Story not found');change(story);story.revision=(story.revision||0)+1;updated=story;return state;});return updated;}
 async updateStoryStatus(id,status,scheduledDay){return this.updateStory(id,story=>{if(status)story.status=status;if(scheduledDay)story.scheduledDay=scheduledDay;});}
 async saveCampaignDraft(id,campaign){return this.updateStory(id,story=>{story.campaignDraft=campaign;story.status='Draft Ready';});}
 async updateCampaignFormatDraft(id,format,content,expectedRevision){return this.updateStory(id,story=>{if(!story.campaignDraft)throw fail(404,'Draft not found');if(expectedRevision!==undefined&&story.revision!==expectedRevision)throw fail(409,'Draft changed; reload before saving');story.campaignDraft[format]=content;});}
 async updateSourceClaims(id,claims){return this.updateStory(id,story=>{story.sourceClaims=claims;story.verifiedFacts=claims.filter(claim=>claim.status==='approved').map(claim=>claim.text);});}
 recordUsage(event){this.mutate(state=>{if(!state.usage.some(row=>row.id===event.id))state.usage.push({...event,timestamp:new Date().toISOString()});return state;});}
 claimJob(idempotencyKey){let job;let claimed=false;this.mutate(state=>{job=state.jobs.find(job=>job.idempotencyKey===idempotencyKey);if(!job){job={jobId:randomUUID(),idempotencyKey,status:'RUNNING',startedAt:new Date().toISOString(),completedStoryIds:[]};state.jobs.unshift(job);claimed=true;}return state;});return {job,claimed};}
 updateJob(id,patch){return this.mutate(state=>{Object.assign(state.jobs.find(job=>job.jobId===id),patch);return state;}).jobs.find(job=>job.jobId===id);}
 saveAsset(asset){const record={id:randomUUID(),...asset,createdAt:new Date().toISOString()};this.mutate(state=>{state.assets.push(record);return state;});return record;}
 getAsset(id){return this.read().assets.find(asset=>asset.id===id)||null;}
 savePreflight(record){const value={id:randomUUID(),createdAt:new Date().toISOString(),...record};this.mutate(state=>{state.preflights.push(value);return state;});return value;}
 exportData(){return {schemaVersion:1,exportedAt:new Date().toISOString(),data:this.read()};}
 importData(bundle){if(bundle?.schemaVersion!==1||bundle.data?.schemaVersion!==1||!Array.isArray(bundle.data.backlog)||!Array.isArray(bundle.data.assets)||typeof bundle.data.brandProfile?.brandName!=='string'||!Array.isArray(bundle.data.telemetry?.traces)||!Array.isArray(bundle.data.telemetry?.backpropDataset)||!Array.isArray(bundle.data.telemetry?.batchJobs)||!Array.isArray(bundle.data.jobs)||!Array.isArray(bundle.data.usage)||!Array.isArray(bundle.data.preflights))throw fail(400,'Invalid import schema');const allowed=['schemaVersion','brandProfile','backlog','telemetry','jobs','assets','preflights','usage'];const data=Object.fromEntries(allowed.map(key=>[key,bundle.data[key]]));this.store.update(this.key,()=>data);return {imported:true};}
}
