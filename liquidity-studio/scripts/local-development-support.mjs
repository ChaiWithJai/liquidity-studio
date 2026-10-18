// Developer-only helpers. Importing this file does not start a server or database.
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import http from 'node:http';import {randomBytes} from 'node:crypto';import {fileURLToPath} from 'node:url';
export function parseLocalArguments(args){let profile='development',port=3002,check=false,penpotConfigurationPath;const seen=new Set();for(let i=0;i<args.length;i++){const key=args[i];if(seen.has(key))throw Error('Duplicate option');seen.add(key);if(key==='--profile')profile=args[++i];else if(key==='--port'&&/^\d{4,5}$/.test(args[i+1]||''))port=Number(args[++i]);else if(key==='--penpot-config'){penpotConfigurationPath=args[++i];if(!penpotConfigurationPath)throw Error('Private Penpot configuration path required');}else if(key==='--check')check=true;else throw Error('Use --profile development|staging|production [--port 3002] [--penpot-config /absolute/private/operator.json] [--check]');}if(!['development','staging','production'].includes(profile)||port<1024||port>65535)throw Error('Local profile and unprivileged port required');if(penpotConfigurationPath!==undefined&&(!path.isAbsolute(penpotConfigurationPath)||penpotConfigurationPath.length>4096))throw Error('Absolute private Penpot configuration path required');return {profile,port,check,...(penpotConfigurationPath?{penpotConfigurationPath}:{})};}
export function rejectDeployment(env){if(env.NODE_ENV==='production'||['K_SERVICE','K_REVISION','CLOUD_RUN_JOB','FUNCTION_TARGET','GAE_ENV','AWS_LAMBDA_FUNCTION_NAME'].some(k=>env[k]))throw Error('Developer launcher is forbidden in a deployment or NODE_ENV=production');}
export function sanitizedChildEnvironment(input){const env={NODE_ENV:'development',LOCAL_STUDIO_DEVELOPMENT_CHILD:'1'};for(const key of ['PATH','HOME','USER','LOGNAME','TMPDIR','LANG','LC_ALL','TERM'])if(typeof input[key]==='string')env[key]=input[key];return env;}
const loopback=host=>['127.0.0.1','::ffff:127.0.0.1','::1'].includes(host);
export function developerCookieName(profile){if(!['development','staging','production'].includes(profile))throw Error('Invalid profile');return 'studio_dev_'+profile;}
export function mapRequestCookie(value,profile){if(typeof value!=='string'||value.length>4096)return '';const name=developerCookieName(profile),matches=value.split(';').map(x=>x.trim()).filter(x=>x.startsWith(name+'='));if(matches.length!==1)return '';const token=matches[0].slice(name.length+1);return /^[A-Za-z0-9_-]{43}$/.test(token)?'studio_session='+token:'';}
export function mapResponseCookie(value,profile){const rewrite=x=>typeof x==='string'&&x.startsWith('studio_session=')?developerCookieName(profile)+x.slice('studio_session'.length):x;return Array.isArray(value)?value.map(rewrite):rewrite(value);}
export function requestAllowed(req,origin){return loopback(req.socket.remoteAddress)&&req.headers.host===new URL(origin).host&&!req.headers.forwarded&&!Object.keys(req.headers).some(k=>k.startsWith('x-forwarded-'))&&(!req.headers.origin||req.headers.origin===origin);}
export async function createDevelopmentServer({profile='development',port=3002,home=os.homedir(),penpotConfigurationPath}={}){
 rejectDeployment(process.env);if(!['development','staging','production'].includes(profile)||!Number.isInteger(port)||port<0||port>65535||(port!==0&&port<1024))throw Error('Invalid local server configuration');
 process.umask(0o077);let origin=`http://127.0.0.1:${port}`;const app=fileURLToPath(new URL('../',import.meta.url));
 // App provider calls use fetch; block remote fetch here. Existing source-retrieval
 // https.request retains its own DNS pin/host/size/deadline guards. Not an OS firewall.
 const originalFetch=globalThis.fetch;const offlineFetch=(input,options)=>{const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname))return Promise.reject(Error('Developer model/provider fetch is offline'));return originalFetch(input,options);};
 for(const key of Object.keys(process.env))if(/^(GOOGLE_|GCLOUD_|GCP_|GEMINI_|OPENAI_|ANTHROPIC_|AI_|STUDIO_|FIRESTORE_|CLOUD_TASKS_)/.test(key))delete process.env[key];
 Object.assign(process.env,{NODE_ENV:'development',STUDIO_AUTH_MODE:'password',STUDIO_STORAGE_MODE:'sqlite',AI_PROVIDER:'gcp-gemini',AI_ALLOW_SYNTHETIC:'true',AI_VERTEX_USE_ADC:'false',AI_VERTEX_USE_METADATA:'false',STUDIO_NATIVE_EDITOR_ENABLED:'false',STUDIO_NATIVE_PORTABLE_ENABLED:'false',STUDIO_NATIVE_CUTOUT_ENABLED:'false',STUDIO_OPERATOR_JOBS_ENABLED:'true',STUDIO_SOURCE_PREPARATION_ENABLED:'true',STUDIO_HELPER_CONTROL_ENABLED:'true',STUDIO_PENPOT_ENABLED:'false',STUDIO_JOB_DISPATCHER:'local'});
function directory(parent,name){const full=path.join(parent,name);if(!fs.existsSync(full))fs.mkdirSync(full,{mode:0o700});const st=fs.lstatSync(full);if(!st.isDirectory()||st.isSymbolicLink()||(st.mode&0o777)!==0o700)throw Error('Private real mode0700 profile directories required');return full;}
home=fs.realpathSync(home);let parent=home;
// ~/.config may preexist with0755; never chmod or repurpose it.
const configParent=path.join(parent,'.config');if(!fs.existsSync(configParent))fs.mkdirSync(configParent,{mode:0o700});if(fs.lstatSync(configParent).isSymbolicLink()||!fs.statSync(configParent).isDirectory())throw Error('Real config directory required');
parent=directory(configParent,'liquidity-studio');parent=directory(parent,'development');const root=directory(parent,profile),database=path.join(root,'studio.sqlite'),marker=path.join(root,'profile.json');
function privateFile(file){const st=fs.lstatSync(file);if(!st.isFile()||st.isSymbolicLink()||(st.mode&0o777)!==0o600||st.nlink!==1)throw Error('Private regular profile files required');}
for(const name of ['studio.sqlite','studio.sqlite-wal','studio.sqlite-shm','profile.json'])if(fs.existsSync(path.join(root,name)))privateFile(path.join(root,name));
if(fs.existsSync(database)&&!fs.existsSync(marker))throw Error('Refusing an unmarked existing database');
const lock=path.join(root,'launcher.lock');const lockFd=fs.openSync(lock,'wx',0o600);fs.writeFileSync(lockFd,String(process.pid));fs.closeSync(lockFd);
let settings,server,vite,store,closing=false,workerPromise;const signals=[],workerStop=new AbortController();
async function close(){
 if(closing)return;closing=true;for(const [name,handler]of signals)process.removeListener(name,handler);
 server?.close();server?.closeAllConnections();workerStop.abort();
 let deadline;
 try{if(workerPromise)await Promise.race([workerPromise.catch(()=>{}),new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error('Local worker did not drain within10seconds; preserve profile for reviewed recovery')),10000);})]);}
 catch(error){console.error(error.message);process.exitCode=1;if(process.env.LOCAL_STUDIO_DEVELOPMENT_CHILD==='1')process.exit(1);throw error;}
 finally{clearTimeout(deadline);}
 await vite?.close();store?.close();if(globalThis.fetch===offlineFetch)globalThis.fetch=originalFetch;
 if(fs.existsSync(lock)&&fs.readFileSync(lock,'utf8')===String(process.pid))fs.unlinkSync(lock);
}
try {
 globalThis.fetch=offlineFetch;
 if(fs.existsSync(marker)){settings=JSON.parse(fs.readFileSync(marker,'utf8'));if(settings.schemaVersion!==1||settings.purpose!=='studio-local-development-only'||settings.profile!==profile||settings.database!==database||!['founder','marketer'].every(k=>typeof settings.passwords?.[k]==='string'&&settings.passwords[k].length>=32)||!fs.existsSync(database))throw Error('Profile marker mismatch; no automatic reuse/repair');}
 else {if(fs.readdirSync(root).some(name=>name!=='launcher.lock'))throw Error('Fresh profile directory must be empty');settings={schemaVersion:1,purpose:'studio-local-development-only',profile,database,passwords:{founder:randomBytes(32).toString('base64url'),marketer:randomBytes(32).toString('base64url')}};fs.writeFileSync(marker,JSON.stringify(settings,null,2)+'\n',{mode:0o600,flag:'wx'});}
 const {DurableStore}=await import('../server/storage.js');const {createPlatform}=await import('../server/platform.js');const {createHttpServer}=await import('../server/index.js');
 store=new DurableStore(database);const platform=createPlatform({authMode:'password',store});await platform.ready;
 let identity=await store.get('identity');
 if(identity.users.length===0){for(const role of ['founder','marketer'])await platform.identity.provision({username:`local-${role}`,password:settings.passwords[role],role});identity=await store.get('identity');const founder=identity.users.find(x=>x.role==='founder'),marketer=identity.users.find(x=>x.role==='marketer');await platform.identity.setMembership(founder,{userId:marketer.id,organizationId:'org_default',brandIds:['brand_vedic']});}
 identity=await store.get('identity');
 for(const role of ['founder','marketer']){const matches=identity.users.filter(x=>x.username===`local-${role}`);if(matches.length!==1||matches[0].role!==role)throw Error('Fixed chooser persona mismatch; no automatic repair');const check=await platform.identity.login(`local-${role}`,settings.passwords[role]);if(!check)throw Error('Stored chooser credential no longer matches; preserve profile for review');await platform.identity.logout(check.token);}
 // Memberships and extra users are current service-owned data, not startup defaults.
 const {localPenpotDevelopment}=await import('./local-penpot-development.mjs');
 const developmentPenpotStoryDesigns=await localPenpotDevelopment({configurationPath:penpotConfigurationPath,platform});
 const api=createHttpServer(null,{platform,nativeEditorEnabled:false,penpotEnabled:false,helperControlEnabled:true,developmentPenpotStoryDesigns});
 server=http.createServer({requestTimeout:30000,headersTimeout:10000,maxHeaderSize:8192},async(req,res)=>{try{
  if(!requestAllowed(req,origin))throw Object.assign(Error('Loopback origin required'),{status:403});
  const url=new URL(req.url,origin);req.headers.cookie=mapRequestCookie(req.headers.cookie,profile);
  const setHeader=res.setHeader.bind(res);res.setHeader=(name,value)=>setHeader(name,name.toLowerCase()==='set-cookie'?mapResponseCookie(value,profile):value);if(url.origin!==origin)throw Object.assign(Error('Origin rejected'),{status:403});
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' ws://127.0.0.1:${port}; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`);
  if(url.pathname==='/'&&req.method==='GET'&&!(await platform.identity.authenticate(req.headers.cookie.slice('studio_session='.length)))){res.writeHead(303,{Location:'/__dev'});res.end();return;}
  if(url.pathname==='/__dev'&&req.method==='GET'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><html><head><title>Local Studio profiles</title></head><body><h1>${profile} · local emulation</h1><p>Offline synthetic generation. This is never the deployed staging or production environment.</p><form method="post" action="/__dev/session"><button name="persona" value="founder">Founder · current grants (initially both brands)</button><button name="persona" value="marketer">Marketer · current grants (initially Chai With Jai only)</button></form><p>Switch profile: stop this launcher, then run <code>npm run dev:studio -- --profile development|staging|production</code>.</p><a href="/">Open Studio</a></body></html>`);return;}
  if(url.pathname==='/__dev/session'&&req.method==='POST'){
   if(req.headers.origin!==origin||req.headers['content-type']!=='application/x-www-form-urlencoded'||url.search)throw Object.assign(Error('Same-origin persona form required'),{status:403});
   req.setTimeout(5000,()=>req.destroy());const bodyDeadline=setTimeout(()=>req.destroy(),5000);let body='';try{for await(const chunk of req){body+=chunk.toString('utf8');if(Buffer.byteLength(body)>128)throw Object.assign(Error('Persona form too large'),{status:413});}}finally{clearTimeout(bodyDeadline);}
   if(!/^persona=(founder|marketer)$/.test(body))throw Object.assign(Error('Fixed persona required'),{status:400});const persona=body.slice(8);const old=req.headers.cookie.slice('studio_session='.length);if(old)await platform.identity.logout(old);
   const login=await platform.identity.login(`local-${persona}`,settings.passwords[persona]);if(!login)throw Error('Local persona unavailable');res.writeHead(303,{'Set-Cookie':`${developerCookieName(profile)}=${login.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800`,Location:'/'});res.end();return;
  }
  if(url.pathname.startsWith('/__dev'))throw Object.assign(Error('Not found'),{status:404});
  if(url.pathname==='/api'||url.pathname.startsWith('/api/')||['/readyz','/healthz'].includes(url.pathname))return api.emit('request',req,res);
  vite.middlewares(req,res,()=>{res.statusCode=404;res.end('Not found');});
 }catch(error){if(!res.headersSent){res.statusCode=error.status||500;res.end(error.status?error.message:'Local developer request failed');}else res.destroy();}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});port=server.address().port;origin=`http://127.0.0.1:${port}`;
 const {createServer}=await import('vite');vite=await createServer({root:app,mode:'development',cacheDir:path.join(root,'vite-cache'),server:{middlewareMode:true,proxy:{},hmr:{server,host:'127.0.0.1',port},fs:{strict:true,allow:[app,path.join(root,'vite-cache')]}},clearScreen:false,plugins:[{name:'local-profile-banner',configResolved(config){config.server.proxy={};},transformIndexHtml(){return [{tag:'aside',attrs:{id:'studio-local-profile',style:'padding:8px 16px;background:#fff3c4;color:#28220d;font:14px system-ui;position:relative;z-index:10000'},children:`LOCAL ${profile.toUpperCase()} EMULATION · synthetic generation · guarded source jobs · <a href="/__dev">Switch persona</a>`,injectTo:'body-prepend'}];}}]});
 // The local plugin clears the inherited standalone API proxy; outer routing owns /api.
 server.prependListener('upgrade',(req,socket)=>{if(!requestAllowed(req,origin)||req.headers.origin!==origin)socket.destroy();});
 const {runWorker}=await import('../server/job-worker.js');workerPromise=runWorker({platform,signal:workerStop.signal,idleMs:1000});workerPromise.catch(()=>{console.error('Local durable worker failed; stopping the developer application. Retain profile data for review.');process.exitCode=1;void close().catch(()=>{});});
 console.log(`LOCAL ${profile} emulation · ${origin}/__dev · synthetic + guarded source jobs · stop and relaunch to switch profiles`);
 for(const signal of ['SIGINT','SIGTERM']){const handler=()=>close().then(()=>process.exit(0));signals.push([signal,handler]);process.once(signal,handler);}
 return {server,platform,store,close,root,origin};
}catch(error){await close();throw error;}
}
