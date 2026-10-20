import {DefiantVideoAnalysis} from './defiant-video-analysis.js';
import {AIGateway} from './gateway.js';
import {DefiantClips} from './defiant-clips.js';
import {DefiantYouTube,createYouTubeMetadataProvider} from './defiant-youtube.js';
import {DefiantStrategyService} from './defiant-strategy.js';
import {fail} from './auth.js';
/** Mounted only after existing authentication, before brand-required publishing. */
export async function strategyRequest({platform,user,route,method,body,url}){
 const analysis=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})\/inbox\/analysis(?:\/(moments))?$/);
 if(analysis){const service=new DefiantVideoAnalysis(new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:analysis[1]}),platform.videoAnalysisGateway||new AIGateway());if(method==='GET'&&!analysis[2]){if([...url.searchParams.keys()].some(k=>k!=='sourceId'))throw fail(400,'Unsupported analysis query');return service.read(user,url.searchParams.get('sourceId'));}if(method==='POST'&&!analysis[2])return service.analyze(user,body);if(method==='POST'&&analysis[2]==='moments')return service.saveMoment(user,body);throw fail(405,'Unsupported analysis action');}
 const media=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})\/inbox\/clips(?:\/(uploads|uploads\/([a-f0-9-]{36})\/complete|proposals))?$/);
 if(media){const service=new DefiantClips(new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:media[1]}));if(method==='GET'&&!media[2])return service.read(user,url.searchParams.get('sourceId'));if(method==='POST'&&media[2]==='uploads')return service.begin(user,body);if(method==='POST'&&media[3]){if(!body||Object.keys(body).length)throw fail(400,'Upload completion has no extra fields');return service.complete(user,media[3]);}if(method==='POST'&&media[2]==='proposals')return service.propose(user,body);throw fail(405,'Unsupported clip action');}
 const discovery=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})\/inbox\/discovery(?:\/(queries|run))?$/);
 if(discovery){const service=new DefiantYouTube(new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:discovery[1]}),platform.youtubeMetadataProvider??createYouTubeMetadataProvider({apiKey:process.env.STUDIO_YOUTUBE_API_KEY}));if(method==='GET'&&!discovery[2])return service.read(user);if(method==='POST'&&discovery[2]==='queries')return service.queries(user,body);if(method==='POST'&&discovery[2]==='run')return service.run(user,body);throw fail(405,'Unsupported discovery action');}
 const inbox=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})\/inbox(?:\/(import\/preview|import|sources\/([^/]+)\/match))?$/);
 if(inbox){const service=new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:inbox[1]});if(method==='GET'&&!inbox[2])return new DefiantYouTube(service).project(user,Object.fromEntries(url.searchParams));if(method==='POST'&&inbox[2]==='import/preview')return service.previewInbox(user,body);if(method==='POST'&&inbox[2]==='import')return service.importInbox(user,body);if(method==='POST'&&inbox[3])return service.updateInboxMatch(user,decodeURIComponent(inbox[3]),body);throw fail(405,'Unsupported inbox action');}
 const confirmation=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})\/resources\/([^/]+)\/confirmation$/);
 if(confirmation){if(method!=='POST')throw fail(405,'Unsupported resource action');return new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:confirmation[1]}).confirmResource(user,decodeURIComponent(confirmation[2]),body);}
 const handoff=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})\/reports\/([a-f0-9-]{36})\/handoff$/);
 if(handoff){if(method!=='POST')throw fail(405,'Unsupported report action');return new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:handoff[1]}).handoff(user,handoff[2],body);}
 const refresh=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})\/reports\/([a-f0-9-]{36})\/refresh$/);
 if(refresh){if(method!=='POST')throw fail(405,'Unsupported report action');return new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:refresh[1]}).refreshReport(user,refresh[2],body);}
 const match=route.match(/^\/api\/studio\/strategy\/([A-Za-z0-9_-]{1,128})(?:\/(enable|graph|import-preview|import|annotations|views|reports|clusters|destinations))?$/);if(!match)throw fail(404,'Strategy action not found');
 const service=new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:match[1]});
 if(method==='GET'&&!match[2])return service.read(user);
 if(method==='GET'&&match[2]==='graph'){if([...url.searchParams.keys()].some(k=>!['focusId','selectedId','query','kinds','showExamples'].includes(k)))throw fail(400,'Unsupported graph query');return service.graph(user,Object.fromEntries(url.searchParams));}
 if(method==='POST'&&match[2]==='destinations')return service.createDestination(user,body);
 if(method==='POST'&&match[2]==='clusters')return service.saveCluster(user,body);
 if(method==='POST'&&match[2]==='annotations')return service.annotate(user,body);
 if(method==='POST'&&match[2]==='views')return service.saveView(user,body);
 if(method==='POST'&&match[2]==='reports')return service.saveReport(user,body);
 if(method==='POST'&&match[2]==='enable')return service.enable(user,body);
 if(method==='POST'&&match[2]==='import-preview')return service.preview(user,body);
 if(method==='POST'&&match[2]==='import')return service.import(user,body);
 throw fail(405,'Unsupported strategy action');
}
