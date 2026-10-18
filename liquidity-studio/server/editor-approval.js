import { createHash } from 'node:crypto';
import { fail } from './auth.js';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const copy = value => structuredClone(value);
const steps = { start: ['DraftReady', 'InPostProd'], submit: ['InPostProd', 'FinalLayout'], approve: ['FinalLayout', 'Approved'] };
function exact(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !['action','expectedRevision','expectedNativeRevision','idempotencyKey'].includes(key)) ||
    !['create','start','submit','approve','reject','restart'].includes(input.action) ||
    !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0 ||
    !Number.isSafeInteger(input.expectedNativeRevision) || input.expectedNativeRevision < 1 ||
    typeof input.idempotencyKey !== 'string' || !/^[A-Za-z0-9_-]{16,100}$/.test(input.idempotencyKey)) throw fail(400,'Invalid review transition');
}
/** Review authority lives in server-selected records, never browser role claims. */
export class EditorApprovalService {
  constructor({ repo, identity, native, scope, now = () => new Date().toISOString() }) {
    Object.assign(this,{repo,identity,native,scope,now}); this.store=repo.store;
  }
  keys(id) {
    const nativeKey=this.native.key(id);
    return ['identity',this.repo.key,nativeKey,`editor-review:${this.scope.organizationId}:${this.scope.brandId}:${id}`];
  }
  canApprove(identity, actor) {
    return actor.role === 'founder' || (actor.role === 'marketer' && identity.memberships.some(member =>
      member.userId === actor.id && member.organizationId === this.scope.organizationId &&
      Array.isArray(member.approvalBrandIds) && member.approvalBrandIds.includes(this.scope.brandId)));
  }
  async principal(actor) {
    if (!actor?.id) throw fail(401,'Sign in required');
    const identity = await this.store.get('identity');
    const current=identity?.users.find(user=>user.id===actor.id);
    if (!current) throw fail(403,'Current principal is unavailable');
    await this.identity.authorize(current,this.scope.organizationId,this.scope.brandId);
    return { actor:current, identityHash:hash(identity) };
  }
  scoped(native) {
    if (!native || native.organizationId!==this.scope.organizationId || native.brandId!==this.scope.brandId) throw fail(404,'Native document not found');
  }
  binding(native) {
    const documentSha256=native.documentRef?.artifact?.sha256 || native.documentRef?.sha256;
    if (!/^[a-f0-9]{64}$/.test(documentSha256 || '')) throw fail(422,'Native content integrity is unavailable');
    return { storyId:native.storyId, storyRevision:native.origin.storyRevision, generationId:native.origin.generationId, brandRevision:native.origin.brandRevision, nativeRevision:native.revision, documentSha256 };
  }
  stale(source,native,review) {
    try { this.native.assertCurrent(source,native.origin); }
    catch(error) { if ([409,422].includes(error.status)) return true; throw error; }
    return !!review && hash(review.binding)!==hash(this.binding(native));
  }
  dto(review,stale) {
    if (!review) return null;
    const { journal,...result }=review;
    return {...copy(result),stale};
  }
  async read(actor,id) {
    await this.repo.ready;
    const principal=await this.principal(actor); let result;
    await this.store.transact(this.keys(id),values=>{
      const [identity,source,native,review]=values;
      if(hash(identity)!==principal.identityHash) throw fail(409,'Membership changed; reload review');
      this.scoped(native);
      const dto=this.dto(review,this.stale(source,native,review));
      result=dto ? {...dto,canApprove:this.canApprove(identity,principal.actor),approval:dto.approval ? {...dto.approval,approvedByLabel:identity.users.find(user=>user.id===dto.approval.approvedBy)?.username || 'Former workspace member'} : null} : null;
      return values;
    });
    return result;
  }
  async transition(actor,id,input) {
    exact(input); await this.repo.ready;
    const principal=await this.principal(actor);
    const intent={key:`${principal.actor.id}:${input.idempotencyKey}`, fingerprint:hash({action:input.action,expectedRevision:input.expectedRevision,expectedNativeRevision:input.expectedNativeRevision})};
    const at=this.now(); let result;
    await this.store.transact(this.keys(id),values=>{
      const [identity,source,native,prior]=values;
      if(hash(identity)!==principal.identityHash) throw fail(409,'Membership changed; reload review');
      this.scoped(native);
      const replay=prior?.journal.find(entry=>entry.key===intent.key);
      if(replay){if(replay.fingerprint!==intent.fingerprint)throw fail(409,'Review idempotency key changed');result=copy(replay.receipt);return values;}
      if ((prior?.revision || 0)!==input.expectedRevision || native.revision!==input.expectedNativeRevision) throw fail(409,'Review or native document changed; preserve work and reload');
      this.native.assertCurrent(source,native.origin);
      if(prior?.journal.length>=256) throw fail(409,'Review journal capacity reached; retain receipts and reconcile with operator');
      if(input.action!=='restart' && prior && this.stale(source,native,prior)) throw fail(409,'Reviewed content changed; restart review explicitly');
      let stage;
      if(input.action==='create'){if(prior)throw fail(409,'Review already exists');stage='DraftReady';}
      else if(!prior) throw fail(409,'Create review before transitioning');
      else if(input.action==='restart') {
        if(prior.stage==='Approved' && !this.stale(source,native,prior) && !this.canApprove(identity,principal.actor)) throw fail(403,'Approval authority required to reopen a current approved layout');
        stage='DraftReady';
      }
      else if(input.action==='reject'){
        if(!['FinalLayout','Approved'].includes(prior.stage))throw fail(409,'Review cannot be rejected from this stage');
        if(!this.canApprove(identity,principal.actor))throw fail(403,'Approval authority required');
        stage='InPostProd';
      } else {
        const [from,to]=steps[input.action];
        if(prior.stage!==from)throw fail(409,'Review transition is out of order');
        if(input.action==='approve'&&!this.canApprove(identity,principal.actor))throw fail(403,'Approval authority required');
        stage=to;
      }
      const revision=(prior?.revision||0)+1, binding=this.binding(native);
      result={nativeId:id,revision,stage,actorId:principal.actor.id,at};
      const review={schemaVersion:1,nativeId:id,organizationId:this.scope.organizationId,brandId:this.scope.brandId,revision,stage,binding,
        approval:stage==='Approved'?{...binding,approvedBy:principal.actor.id,approvedAt:at,reviewRevision:revision}:null,
        createdAt:prior?.createdAt||at,updatedAt:at,
        history:[...(prior?.history||[]),{...result,action:input.action,binding}],
        journal:[...(prior?.journal||[]),{...intent,receipt:copy(result)}]};
      return [identity,source,native,review];
    });
    return result;
  }
}
