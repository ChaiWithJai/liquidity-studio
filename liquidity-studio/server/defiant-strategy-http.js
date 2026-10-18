import {DefiantStrategyService} from './defiant-strategy.js';
import {fail} from './auth.js';
/** Mounted only after existing authentication, before brand-required publishing. */
export async function strategyRequest({platform,user,route,method,body,url}){
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
