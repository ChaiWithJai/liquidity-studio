import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {unzipSync,strFromU8} from 'fflate';
import {DurableStore} from './storage.js';
import {ScopedRepository} from './repository.js';
import {NativeEditorService} from './native-editor.js';
import {EditorPackService} from './editor-pack-service.js';
import {nativeFontRegistry} from './native-editor-fonts.js';
import {validateEditorPack} from './editor-pack.js';
import {createEditorRecoveryKit} from '../src/lib/editor-recovery-kit.js';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function exported(t){const store=new DurableStore(':memory:');t.after(()=>store.close());const actor={id:'kit-owner',role:'founder'},scope={organizationId:'kit-organization',brandId:'kit-brand',preset:'liquidity_desk'};store.update('identity',()=>({users:[actor],memberships:[]}));const identity={authorize:async()=>{}},repo=new ScopedRepository(store,scope);await repo.ready;const native=new NativeEditorService({repo,identity,scope,availableFonts:nativeFontRegistry()}),service=new EditorPackService({native});const image=await sharp({create:{width:16,height:16,channels:4,background:{r:12,g:50,b:80,alpha:0.5}}}).png().toBuffer();await native.uploadAsset(actor,{name:'Original controlled non-person fixture',contentType:'image/png',base64:image.toString('base64'),rightsDeclaration:'Original generated fixture, no person or third-party rights',consent:'not_personal_data',idempotencyKey:'readable_recovery_kit_fixture_001'});return service.export(actor);}
test('recovery kit retains an exact restorable pack and extracts every font/notice with verifiable checksums',async t=>{
 const pack=await exported(t),kit=await createEditorRecoveryKit(pack),entries=unzipSync(kit.bytes),restored=JSON.parse(strFromU8(entries['studio-editor-pack.json']));assert.deepEqual(restored,pack);assert.equal(validateEditorPack(restored).pack.sha256,pack.sha256);assert.equal(restored.assets.length,1);const asset=restored.assets[0],payload=restored.files.find(file=>file.sha256===asset.file);assert.equal(sha(Buffer.from(payload.base64,'base64')),asset.file);
 for(const font of pack.fonts){assert.equal(sha(entries['fonts/'+font.filename]),font.file);assert.equal(sha(entries['fonts/'+font.licenseFilename]),font.licenseFile);}
 const manifest=JSON.parse(strFromU8(entries['recovery-manifest.json']));assert.equal(manifest.packSha256,pack.sha256);assert.deepEqual(manifest.files,kit.manifest.files);for(const line of strFromU8(entries.SHA256SUMS).trim().split('\n')){const [digest,path]=line.split('  ');assert.equal(sha(entries[path]),digest);}
 const guide=strFromU8(entries['RESTORE.md']);assert.match(guide,/studio-editor-pack.json/);assert.match(guide,/does NOT contain.*Penpot/s);assert.match(guide,/NEW empty recovery brand/);assert.match(guide,/Keep.*private/);assert.ok(Object.keys(entries).every(path=>!path.startsWith('/')&&!path.split('/').includes('..')));
});
test('recovery kit rejects changed payloads and unsafe font paths without producing a partial download',async t=>{
 const pack=await exported(t),changed=structuredClone(pack);changed.files[0].base64='AAAA';await assert.rejects(createEditorRecoveryKit(changed),/could not verify/);
 const {sha256,...content}=structuredClone(pack);content.fonts[0].filename='../outside.ttf';const unsafe={...content,sha256:sha(Buffer.from(JSON.stringify(content)))};await assert.rejects(createEditorRecoveryKit(unsafe),/could not verify/);
 const tampered=structuredClone(pack),font=tampered.fonts[0],file=tampered.files.find(f=>f.sha256===font.file);file.base64=Buffer.alloc(file.size,1).toString('base64');const {sha256:_,...rehashed}=tampered;await assert.rejects(createEditorRecoveryKit({...rehashed,sha256:sha(Buffer.from(JSON.stringify(rehashed)))}),/could not verify/);
});
