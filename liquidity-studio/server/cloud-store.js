import { createHash } from 'node:crypto';
import { transactionKeys, transactionValues } from './storage-transaction.js';

const CHUNK_BYTES = 128000;
const MAX_VALUE_BYTES = 4 * 1024 * 1024;
const MAX_ARTIFACT_BYTES = 20 * 1024 * 1024;
const hash = value => createHash('sha256').update(value).digest('hex');
const failure = (code, message) => Object.assign(new Error(message), { code });
const identifier = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);

// This server-side store is not an authorization boundary: the use case must supply
// a membership-checked scope. Clients never receive Firestore or bucket credentials.
export class FirestoreStore {
  constructor({ firestore, bucket, collection = 'liquidity_state_v1' }) {
    if (!firestore || !identifier(collection)) throw new Error('Firestore store requires a client and valid collection');
    this.firestore = firestore;
    this.bucket = bucket;
    this.collection = firestore.collection(collection);
  }

  ref(key) {
    if (typeof key !== 'string' || !key || Buffer.byteLength(key) > 512) throw failure('INVALID_STORE_KEY', 'Invalid storage key');
    return this.collection.doc(hash(key));
  }

  async read(transaction, ref, key) {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return { value: null, chunkCount: 0, revision: 0 };
    const data = snapshot.data();
    if (data.key !== key || data.schemaVersion !== 1 || !Number.isInteger(data.chunkCount) || data.chunkCount < 1 || data.chunkCount > Math.ceil(MAX_VALUE_BYTES / CHUNK_BYTES)) throw failure('STORE_CORRUPT', 'Stored record metadata is invalid');
    const refs = Array.from({ length: data.chunkCount }, (_, i) => ref.collection('chunks').doc(String(i)));
    const parts = await transaction.getAll(...refs);
    if (parts.some(part => !part.exists)) throw failure('STORE_CORRUPT', 'Stored record is incomplete');
    const encoded = Buffer.concat(parts.map(part => Buffer.from(part.data().bytes)));
    if (encoded.byteLength !== data.bytes || hash(encoded) !== data.sha256) throw failure('STORE_CORRUPT', 'Stored record checksum mismatch');
    return { value: JSON.parse(encoded.toString('utf8')), chunkCount: data.chunkCount, revision: data.revision, sha256: data.sha256 };
  }

  async get(key) {
    const ref = this.ref(key);
    return this.firestore.runTransaction(async transaction => (await this.read(transaction, ref, key)).value, { readOnly: true });
  }

  async update(key, callback) {
    const ref = this.ref(key);
    if (typeof callback !== 'function') throw failure('INVALID_UPDATE', 'Storage update requires a pure synchronous callback');
    return this.firestore.runTransaction(async transaction => {
      const current = await this.read(transaction, ref, key);
      const next = callback(current.value);
      if (next === undefined || next?.then instanceof Function) throw failure('INVALID_UPDATE', 'Storage callback must return JSON synchronously');
      let encoded;
      try { encoded = Buffer.from(JSON.stringify(next)); } catch { throw failure('INVALID_UPDATE', 'Storage callback must return JSON'); }
      if (encoded.byteLength > MAX_VALUE_BYTES) throw failure('STORE_CAPACITY', 'Record exceeds the four MiB transaction capacity; archive content before adding more');
      const digest = hash(encoded);
      // Repository initialization can run for every request; unchanged data must
      // not rewrite all chunks or count as a new persisted revision.
      if (current.sha256 === digest) return JSON.parse(encoded.toString('utf8'));
      const chunks = Math.ceil(encoded.byteLength / CHUNK_BYTES);
      for (let i = 0; i < chunks; i++) transaction.set(ref.collection('chunks').doc(String(i)), { bytes: encoded.subarray(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES) });
      for (let i = chunks; i < current.chunkCount; i++) transaction.delete(ref.collection('chunks').doc(String(i)));
      transaction.set(ref, { schemaVersion: 1, key, revision: current.revision + 1, chunkCount: chunks, bytes: encoded.byteLength, sha256: digest });
      return JSON.parse(encoded.toString('utf8'));
    }, { maxAttempts: 5 });
  }

  async transact(keys, callback) {
    keys = transactionKeys(keys, callback);
    const refs = keys.map(key => this.ref(key));
    return this.firestore.runTransaction(async transaction => {
      // Firestore requires every read (including chunk records) before any write.
      const current = await Promise.all(keys.map((key, index) => this.read(transaction, refs[index], key)));
      const encoded = transactionValues(callback(current.map(record => record.value)), keys.length);
      const buffers = encoded.map(value => Buffer.from(value));
      buffers.forEach((buffer, index) => {
        const prior = current[index], ref = refs[index], digest = hash(buffer);
        if (prior.sha256 === digest) return;
        const chunks = Math.ceil(buffer.byteLength / CHUNK_BYTES);
        for (let i = 0; i < chunks; i++) transaction.set(ref.collection('chunks').doc(String(i)), { bytes: buffer.subarray(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES) });
        for (let i = chunks; i < prior.chunkCount; i++) transaction.delete(ref.collection('chunks').doc(String(i)));
        transaction.set(ref, { schemaVersion: 1, key: keys[index], revision: prior.revision + 1, chunkCount: chunks, bytes: buffer.byteLength, sha256: digest });
      });
      return encoded.map(value => JSON.parse(value));
    }, { maxAttempts: 5 });
  }

  async operatorInventory(transaction) {
    const indexed = await transaction.get(this.collection.orderBy('key').select('key').limit(513));
    const parents = await transaction.get(this.collection.orderBy('__name__').select('key').limit(513));
    if (indexed.size > 512 || parents.size > 512) throw failure('OPERATOR_INVENTORY_CAPACITY', 'Operator inventory exceeds 512 logical records; preserve state for owner review');
    const inspect = snapshot => snapshot.docs.map(doc => {
      const key = doc.data().key;
      if (typeof key !== 'string' || !key || Buffer.byteLength(key) > 512 || doc.id !== hash(key)) throw failure('STORE_CORRUPT', 'Operator inventory contains invalid parent metadata');
      return [doc.id, key];
    }).sort((a,b) => a[0].localeCompare(b[0]));
    const listed = inspect(indexed), all = inspect(parents);
    if (JSON.stringify(listed) !== JSON.stringify(all) || new Set(all.map(([,key])=>key)).size !== all.length) throw failure('STORE_CORRUPT', 'Operator key inventory is incomplete');
    const inventory = all.map(([,key])=>key).sort();
    return inventory;
  }

  async operatorRecords(transaction, keys, refs) {
    const current = await Promise.all(keys.map((key,index)=>this.read(transaction,refs[index],key)));
    // Bound the selected current values too; do not expand unrelated payloads.
    const currentBytes = current.reduce((total,record)=>total+Buffer.byteLength(JSON.stringify(record.value)),0);
    if (currentBytes > MAX_VALUE_BYTES) throw failure('STORE_CAPACITY', 'Operator current records exceed four MiB capacity');
    return current;
  }

  async inspectWithKeyInventory(keys, callback) {
    keys = transactionKeys(keys, callback);
    const refs = keys.map(key => this.ref(key));
    return this.firestore.runTransaction(async transaction => {
      const inventory = await this.operatorInventory(transaction);
      const records = await this.operatorRecords(transaction, keys, refs);
      const result = callback(records.map(record => record.value), inventory);
      if (result?.then instanceof Function) { result.catch?.(()=>{}); throw failure('INVALID_TRANSACTION', 'Operator inspection callback must be synchronous'); }
      return result;
    }, {readOnly:true});
  }

  // One-off operator admission, not a product/store key limit. Query snapshots
  // and named values share the same read-write transaction; never prefetch keys().
  async transactWithKeyInventory(keys, callback) {
    keys = transactionKeys(keys, callback);
    const refs = keys.map(key => this.ref(key));
    return this.firestore.runTransaction(async transaction => {
      const inventory = await this.operatorInventory(transaction);
      const current = await this.operatorRecords(transaction, keys, refs);
      const encoded = transactionValues(callback(current.map(record=>record.value), inventory), keys.length);
      const buffers = encoded.map(value=>Buffer.from(value));
      buffers.forEach((buffer,index)=>{
        const prior=current[index], ref=refs[index], digest=hash(buffer);
        if(prior.sha256===digest)return;
        const chunks=Math.ceil(buffer.byteLength/CHUNK_BYTES);
        for(let i=0;i<chunks;i++)transaction.set(ref.collection('chunks').doc(String(i)),{bytes:buffer.subarray(i*CHUNK_BYTES,(i+1)*CHUNK_BYTES)});
        for(let i=chunks;i<prior.chunkCount;i++)transaction.delete(ref.collection('chunks').doc(String(i)));
        transaction.set(ref,{schemaVersion:1,key:keys[index],revision:prior.revision+1,chunkCount:chunks,bytes:buffer.byteLength,sha256:digest});
      });
      return encoded.map(value=>JSON.parse(value));
    }, {maxAttempts:5});
  }

  async deleteIf(key, guardKeys, predicate) {
    const keys = transactionKeys([key, ...guardKeys], predicate);
    const refs = keys.map(item => this.ref(item));
    return this.firestore.runTransaction(async transaction => {
      const records = await Promise.all(keys.map((item, index) => this.read(transaction, refs[index], item)));
      const allowed = predicate(records.map(record => record.value));
      if (allowed instanceof Promise) allowed.catch(() => {});
      if (typeof allowed !== 'boolean') throw new Error('Conditional deletion requires a synchronous boolean predicate');
      if (allowed) {
        for (let i=0;i<records[0].chunkCount;i++) transaction.delete(refs[0].collection('chunks').doc(String(i)));
        transaction.delete(refs[0]);
      }
      return allowed;
    }, {maxAttempts:5});
  }
  async delete(key) {
    const ref = this.ref(key);
    await this.firestore.runTransaction(async transaction => {
      const current = await this.read(transaction, ref, key);
      for (let i = 0; i < current.chunkCount; i++) transaction.delete(ref.collection('chunks').doc(String(i)));
      transaction.delete(ref);
    }, { maxAttempts: 5 });
  }

  async keys(prefix = '') {
    if (typeof prefix !== 'string' || Buffer.byteLength(prefix) > 512) throw failure('INVALID_STORE_KEY', 'Invalid storage prefix');
    let query = this.collection.orderBy('key');
    if (prefix) query = query.startAt(prefix).endAt(`${prefix}\uf8ff`);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data().key).filter(key => key.startsWith(prefix));
  }

  scopePrefix(scope) {
    if (!identifier(scope?.organizationId) || !identifier(scope?.brandId)) throw failure('INVALID_ARTIFACT_SCOPE', 'Artifact requires valid organization and brand scope');
    return `organizations/${scope.organizationId}/brands/${scope.brandId}/artifacts/`;
  }

  artifactFile(scope, reference) {
    const prefix = this.scopePrefix(scope);
    if (!this.bucket || reference?.bucket !== this.bucket.name || typeof reference.object !== 'string' || !reference.object.startsWith(prefix) || !/^[a-zA-Z0-9_-]{1,128}\/[a-f0-9]{64}$/.test(reference.object.slice(prefix.length)) || !/^\d+$/.test(String(reference.generation)) || !/^[a-f0-9]{64}$/.test(reference.sha256) || !Number.isInteger(reference.size) || reference.size < 1 || reference.size > MAX_ARTIFACT_BYTES) throw failure('ARTIFACT_FORBIDDEN', 'Artifact reference does not belong to the authorized scope');
    return this.bucket.file(reference.object, { generation: reference.generation });
  }

  async uploadArtifact(scope, id, buffer, contentType) {
    const prefix = this.scopePrefix(scope);
    if (!this.bucket || !identifier(id) || !Buffer.isBuffer(buffer) || !buffer.length || buffer.length > MAX_ARTIFACT_BYTES || !['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/json', 'application/zip', 'text/plain', 'text/plain; charset=utf-8', 'video/mp4'].includes(contentType)) throw failure('INVALID_ARTIFACT', 'Artifact ID, bytes or content type is invalid');
    const sha256 = hash(buffer);
    const object = `${prefix}${id}/${sha256}`;
    const file = this.bucket.file(object);
    try {
      await file.save(buffer, { resumable: false, validation: 'crc32c', preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType, metadata: { organizationId: scope.organizationId, brandId: scope.brandId, sha256 } } });
    } catch (error) {
      // Retried content-addressed upload is safe only if the existing object agrees.
      if (![409, 412].includes(Number(error.code))) throw failure('ARTIFACT_UPLOAD_FAILED', 'Artifact upload failed');
    }
    const [metadata] = await file.getMetadata();
    if (metadata.metadata?.sha256 !== sha256 || metadata.metadata?.organizationId !== scope.organizationId || metadata.metadata?.brandId !== scope.brandId || Number(metadata.size) !== buffer.length || metadata.contentType !== contentType) throw failure('ARTIFACT_INTEGRITY', 'Artifact metadata does not match uploaded content');
    return { bucket: this.bucket.name, object, generation: String(metadata.generation), sha256, size: buffer.length, contentType };
  }

  async downloadArtifact(scope, reference) {
    const file = this.artifactFile(scope, reference);
    const [metadata] = await file.getMetadata();
    if (Number(metadata.size) !== reference.size || metadata.contentType !== reference.contentType || metadata.metadata?.organizationId !== scope.organizationId || metadata.metadata?.brandId !== scope.brandId || metadata.metadata?.sha256 !== reference.sha256) throw failure('ARTIFACT_INTEGRITY', 'Artifact ownership or checksum metadata is invalid');
    const [buffer] = await file.download({ validation: 'crc32c' });
    if (buffer.length !== reference.size || hash(buffer) !== reference.sha256) throw failure('ARTIFACT_INTEGRITY', 'Artifact bytes do not match the recorded checksum');
    return buffer;
  }

  async deleteArtifact(scope, reference) {
    const file = this.artifactFile(scope, reference);
    await file.delete({ ifGenerationMatch: reference.generation, ignoreNotFound: true });
  }

  async checkHealth() {
    // An HTTP deadline does not cancel SDK work. Share the outstanding probe so
    // repeated liveness polling cannot create unbounded dependency requests.
    if (!this.healthRequest) {
      this.healthRequest = (async () => {
        try {
          await this.get('identity');
          if (!this.bucket) throw new Error('Asset bucket not configured');
          await this.bucket.getMetadata();
          return { repository: 'available', artifacts: 'available' };
        } catch {
          throw failure('CLOUD_DEPENDENCY_UNAVAILABLE', 'Cloud repository or artifact dependency is unavailable');
        }
      })().finally(() => { this.healthRequest = null; });
    }
    return this.healthRequest;
  }

  async backup() { throw failure('REMOTE_BACKUP_REQUIRED', 'Use an authorized Firestore/GCS backup or scoped portable export; local backup paths are unsupported'); }
  async close() { await this.firestore.terminate(); }
}

export async function createCloudStore({ projectId = process.env.GOOGLE_CLOUD_PROJECT, bucketName = process.env.STUDIO_ASSET_BUCKET || process.env.STUDIO_GCS_BUCKET, databaseId = process.env.STUDIO_FIRESTORE_DATABASE || '(default)', collection = process.env.STUDIO_FIRESTORE_COLLECTION || 'liquidity_state_v1' } = {}) {
  if (!projectId || !bucketName || /[\s/:]/.test(bucketName)) throw failure('CLOUD_CONFIG_REQUIRED', 'Firestore mode requires an explicit project and GCS bucket');
  const [{ Firestore }, { Storage }] = await Promise.all([import('@google-cloud/firestore'), import('@google-cloud/storage')]);
  const firestore = new Firestore({ projectId, databaseId });
  const storage = new Storage({ projectId, retryOptions: { autoRetry: true, maxRetries: 2, totalTimeout: 10, maxRetryDelay: 1 } });
  return new FirestoreStore({ firestore, bucket: storage.bucket(bucketName), collection });
}
