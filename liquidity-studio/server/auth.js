import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
export function fail(status,message){return Object.assign(new Error(message),{status});}
const publicUser=({id,username,role})=>({id,username,role});
const digest=token=>createHash('sha256').update(token).digest('hex');
export class IdentityService {
 constructor(store){
  this.store=store;
  store.update('identity',value=>value||{users:[],organizations:[{id:'org_default',name:'Studio',brands:[{id:'brand_default',name:'The Liquidity Desk',preset:'liquidity_desk'},{id:'brand_vedic',name:'Chai With Jai',preset:'vedic_dharma'}]}],memberships:[]});
  this.dummySalt=randomBytes(16).toString('hex');
 }
 provision({username,password,role}){
  if(!['founder','marketer'].includes(role)||typeof username!=='string'||!username.trim()||typeof password!=='string'||password.length<12)throw fail(400,'Username and a password of at least 12 characters are required');
  return this.store.update('identity',state=>{
   if(state.users.some(user=>user.username===username))return state;
   const salt=randomBytes(16).toString('hex');const user={id:randomUUID(),username,role,salt,passwordHash:scryptSync(password,salt,64).toString('hex')};
   state.users.push(user);state.memberships.push({userId:user.id,organizationId:'org_default',brandIds:['brand_default','brand_vedic']});return state;
  });
 }
 provisionFromEnvironment(){
  for(const role of ['founder','marketer']){const prefix=`STUDIO_${role.toUpperCase()}`;if(process.env[`${prefix}_PASSWORD`])this.provision({username:process.env[`${prefix}_USERNAME`]||role,password:process.env[`${prefix}_PASSWORD`],role});}
 }
 login(username,password){
  if(typeof username!=='string'||typeof password!=='string'||password.length>1024)return null;
  const attempts=this.store.get(`login:${username}`);if(attempts?.until>Date.now()&&attempts.count>=10)throw fail(429,'Too many login attempts; retry later');
  const user=this.store.get('identity').users.find(user=>user.username===username);
  const hash=scryptSync(password,user?.salt||this.dummySalt,64);
  if(!user||!timingSafeEqual(hash,Buffer.from(user.passwordHash,'hex'))){this.store.update(`login:${username}`,old=>({until:old?.until>Date.now()?old.until:Date.now()+15*60*1000,count:old?.until>Date.now()?old.count+1:1}));return null;}
  this.store.delete(`login:${username}`);
  const token=randomBytes(32).toString('base64url');this.store.update(`session:${digest(token)}`,()=>({userId:user.id,expiresAt:Date.now()+8*3600000}));return {token,user:publicUser(user)};
 }
 authenticate(token){
  if(!token||typeof token!=='string'||token.length>256)return null;
  const session=this.store.get(`session:${digest(token)}`);if(!session)return null;
  if(session.expiresAt<Date.now()){this.logout(token);return null;}
  const user=this.store.get('identity').users.find(user=>user.id===session.userId);return user?publicUser(user):null;
 }
 logout(token){if(token)this.store.delete(`session:${digest(token)}`);}
 organizations(user){const state=this.store.get('identity');return state.organizations.filter(org=>state.memberships.some(member=>member.userId===user.id&&member.organizationId===org.id)).map(org=>({...org,brands:org.brands.filter(brand=>state.memberships.some(member=>member.userId===user.id&&member.organizationId===org.id&&member.brandIds.includes(brand.id)))}));}
 authorize(user,organizationId,brandId){
  if(!user)throw fail(401,'Sign in required');
  const org=this.organizations(user).find(org=>org.id===organizationId);const brand=org?.brands.find(brand=>brand.id===brandId);if(!brand)throw fail(403,'Organization or brand access denied');return {organizationId,brandId,preset:brand.preset};
 }
 requireFounder(user){if(user?.role!=='founder')throw fail(403,'Founder access required');}
 createOrganization(user,name){this.requireFounder(user);const organization={id:randomUUID(),name,brands:[]};this.store.update('identity',state=>{state.organizations.push(organization);state.memberships.push({userId:user.id,organizationId:organization.id,brandIds:[]});return state;});return organization;}
 createBrand(user,{organizationId,name,preset='liquidity_desk'}){this.requireFounder(user);if(!this.organizations(user).some(org=>org.id===organizationId))throw fail(403,'Organization access denied');const brand={id:randomUUID(),name,preset};this.store.update('identity',state=>{state.organizations.find(org=>org.id===organizationId).brands.push(brand);state.memberships.find(member=>member.userId===user.id&&member.organizationId===organizationId).brandIds.push(brand.id);return state;});return brand;}
 setMembership(user,{userId,organizationId,brandIds}){this.requireFounder(user);const owned=this.organizations(user).find(org=>org.id===organizationId);if(!owned||brandIds.some(id=>!owned.brands.some(brand=>brand.id===id)))throw fail(403,'Organization or brand access denied');this.store.update('identity',state=>{if(!state.users.some(member=>member.id===userId))throw fail(404,'User not found');state.memberships=state.memberships.filter(member=>!(member.userId===userId&&member.organizationId===organizationId));state.memberships.push({userId,organizationId,brandIds});return state;});return {updated:true};}
}
