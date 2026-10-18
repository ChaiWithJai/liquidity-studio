// Private native callbacks resolve the immutable team registry. Neither a
// browser-selected Studio scope nor a native cookie is an authority input.
import {timingSafeEqual} from 'node:crypto';
import {fail} from './auth.js';

const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(value);
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).sort().join(',') === [...keys].sort().join(',');

export function createNativeAccessController({store, nativeInstanceId, grantKey, accessFor}) {
  if (!uuid(nativeInstanceId) || typeof grantKey !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(grantKey) ||
      typeof store?.get !== 'function' || typeof accessFor !== 'function')
    throw Error('Private native access dependencies required');

  async function serviceFor(presentedKey, input) {
    if (typeof presentedKey !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(presentedKey) ||
        !timingSafeEqual(Buffer.from(presentedKey), Buffer.from(grantKey)))
      throw fail(403, 'Private native grant callback required');
    if (!uuid(input?.nativeTeamId)) throw fail(400, 'Actual native team required');
    const registry = await store.get(`penpot-brand-teams:${nativeInstanceId}`);
    const teams = registry?.teams?.filter(row => row.teamId === input.nativeTeamId) || [];
    if (teams.length !== 1) throw fail(403, 'Registered governed native team required');
    const scope = teams[0].scope;
    const service = await accessFor(scope);
    if (service?.pairing?.nativeInstanceId !== nativeInstanceId ||
        service.scope?.organizationId !== scope?.organizationId || service.scope?.brandId !== scope?.brandId)
      throw fail(503, 'Current native brand service unavailable');
    return service;
  }

  return {
    async forScope(scope) {
      const service=await accessFor(scope);
      if(service?.pairing?.nativeInstanceId!==nativeInstanceId ||
         service.scope?.organizationId!==scope?.organizationId || service.scope?.brandId!==scope?.brandId)
        throw fail(503,'Current native brand service unavailable');
      return service;
    },
    async admission(key, input) {
      const service = await serviceFor(key, input);
      const operator=input?.nativeOperatorProfileId;
      const keys=['nativeProfileId', 'nativeTeamId', 'operation', 'nativeSession',...(operator===undefined?[]:['nativeOperatorProfileId'])];
      if (!exact(input, keys) || (operator!==undefined&&(!uuid(operator)||operator===input.nativeProfileId)) ||
          !uuid(input.nativeProfileId) || !exact(input.nativeSession, ['id', 'profileId']) ||
          !uuid(input.nativeSession.id) || input.nativeSession.profileId !== (operator||input.nativeProfileId) ||
          !['read', 'write', 'tokens', 'comment', 'subscribe', 'pointer', 'asset', 'export'].includes(input.operation))
        throw fail(400, 'Verified native profile, UUID session and operation required');
      return service.admission(input);
    },
    async reconciliation(key, input) {
      const service = await serviceFor(key, input);
      if (!exact(input, ['nativeOperatorProfileId', 'nativeTeamId', 'nativeMemberId', 'intentId', 'expectedEpoch', 'grantEpoch', 'present']) ||
          !uuid(input.nativeOperatorProfileId) || !uuid(input.nativeMemberId) || !uuid(input.intentId) ||
          !Number.isSafeInteger(input.expectedEpoch) || input.expectedEpoch < 0 ||
          !Number.isSafeInteger(input.grantEpoch) || input.grantEpoch !== input.expectedEpoch + 1 ||
          typeof input.present !== 'boolean')
        throw fail(400, 'Exact native reconciliation intent required');
      return service.authorizeReconciliation(input);
    },
  };
}
