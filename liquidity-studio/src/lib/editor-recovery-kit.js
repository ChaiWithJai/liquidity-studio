import {zipSync,strToU8} from 'fflate';
const MAX_PACK=48*1024*1024,MAX_PAYLOAD=96*1024*1024;
const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
function reject(){throw Error('The recovery kit could not verify its pack or licensed font files. Keep the original JSON pack and retry the export.');}
function bytes(file){if(!file||!Number.isSafeInteger(file.size)||file.size<1||file.size>4*1024*1024||typeof file.base64!=='string'||file.base64.length!==4*Math.ceil(file.size/3))reject();let value;try{value=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));}catch{reject();}if(value.length!==file.size)reject();return value;}
/** A readable envelope around the unchanged server-validated portable pack. */
export async function createEditorRecoveryKit(pack){
 if(!pack||pack.kind!=='studio-native-editor-pack'||![1,2].includes(pack.schemaVersion)||!Array.isArray(pack.files)||pack.files.length>1024||!Array.isArray(pack.fonts)||pack.fonts.length>16||!Array.isArray(pack.documents)||!Array.isArray(pack.assets))reject();
 const serialized=strToU8(JSON.stringify(pack));if(serialized.length>MAX_PACK)reject();const {sha256,...content}=pack;if(!/^[a-f0-9]{64}$/.test(sha256)||await hash(strToU8(JSON.stringify(content)))!==sha256)reject();
 const entries={'studio-editor-pack.json':serialized},inventory=[],byHash=new Map(pack.files.map(file=>[file.sha256,file]));let total=serialized.length;
 async function add(path,value){const sha256=await hash(value);if(entries[path]){if(await hash(entries[path])!==sha256)reject();return;}total+=value.length;if(total>MAX_PAYLOAD)throw Error('The readable recovery kit is too large. Download the unchanged JSON pack instead.');entries[path]=value;inventory.push({path,size:value.length,sha256});}
 inventory.push({path:'studio-editor-pack.json',size:serialized.length,sha256:await hash(serialized)});
 for(const font of pack.fonts){if(font.license!=='OFL-1.1'||!/^[A-Za-z0-9.-]+\.(ttf|otf)$/.test(font.filename)||!/^[A-Za-z0-9.-]+\.txt$/.test(font.licenseFilename))reject();for(const [name,id]of [[font.filename,font.file],[font.licenseFilename,font.licenseFile]]){const value=bytes(byHash.get(id));if(await hash(value)!==id)reject();await add('fonts/'+name,value);}}
 const manifest={kind:'studio-readable-recovery-kit',schemaVersion:1,packSha256:sha256,packSchemaVersion:pack.schemaVersion,scope:pack.scope,exportedAt:pack.exportedAt,contents:{layouts:pack.documents.length,images:pack.assets.filter(asset=>asset.metadata?.kind!=="audio").length,audio:pack.assets.filter(asset=>asset.metadata?.kind==="audio").length,embeddedFiles:pack.files.length,fontVariants:pack.fonts.length},files:inventory.map(file=>({...file}))};
 await add('recovery-manifest.json',strToU8(JSON.stringify(manifest,null,2)+'\n'));
 await add('RESTORE.md',strToU8(restoreGuide(pack,manifest.contents)));
 entries.SHA256SUMS=strToU8(inventory.map(file=>`${file.sha256}  ${file.path}`).join('\n')+'\n');
 // Store mode avoids a long main-thread compression pass and retains exact bytes.
 return {bytes:zipSync(entries,{level:0}),filename:'studio-recovery-kit.zip',manifest};
}
function restoreGuide(pack,counts){return `# Restore this saved Studio brand

Keep this kit private: it contains source evidence and owned artwork. It contains no sign-in credentials.

## What is included

- studio-editor-pack.json: the unchanged portable pack, including saved brand/backlog data, ${counts.layouts} Studio native layouts and history, ${counts.images} original/cutout images, ${counts.audio} uploaded audio sources, stored media exports and their supported lineage. Required payloads are embedded in the JSON; do not reconstruct asset paths manually.
- fonts/: ${counts.fontVariants} exact licensed font variants and their OFL notices, extracted for installation. Keep each notice beside its font.
- recovery-manifest.json: source identifiers, counts and file hashes. The pack's sealed digest is ${pack.sha256}.
- SHA256SUMS: hashes of the JSON, fonts, notices, manifest and this guide. On macOS run shasum -a 256 -c SHA256SUMS; on Linux use sha256sum -c SHA256SUMS from the extracted kit directory.

## Restore into Studio

1. Keep a backup of the destination before changing it. Run a compatible Studio release with portable recovery available. This kit is data, not an application, database backup or deployment image.
2. Install the exact fonts/ files and notices into the release's liquidity-studio/public/fonts directory, or its existing /usr/local/share/fonts/liquidity container font directory. Preserve filenames; do not substitute a system font. Restart the destination normally if needed. The restore service verifies these bytes before installation.
3. Sign into that installation, open Operations → Portable brand recovery, and choose studio-editor-pack.json from this extracted kit (not this ZIP).
4. Create a NEW empty recovery brand. Check the destination and explicitly acknowledge the retained source/owner mapping, then select Restore into this new brand. Existing brands are not replaced. If interrupted, keep this exact JSON and use Check retained recovery status / Retry retained recovery request; do not create another destination.
5. Reload the new brand and inspect backlog, source history, images/cutouts, saved layouts and stored media. Historical source/native approvals do not become current approvals. Use the current-owner review/continue actions before new editing or export. Compare text, fonts, page order and your own PNG/media outputs with the retained originals.

## Penpot is a separate export

This Studio pack does NOT contain a registered Penpot server's native .penpot archive, team/project, custom-font UUID registry or database. Before leaving that server, download each native design using Penpot's ordinary Download menu and package it with the existing Penpot font-sidecar operator tool (scripts/penpot-font-recovery.mjs). Use exact original licensed font bytes/notices and the actual custom IDs; do not assume a .penpot archive includes fonts. On a fresh Penpot installation, restore the sidecar's fonts to the fixed destination, then import its original archive through the normal UI. See liquidity-studio/docs/penpot-font-recovery.md in the release for its setup and conflict/retry rules. Same-server font-ID ownership may require an explicitly reviewed remap; this kit does not perform one.

## Check before removing the source

Test recovery while your originals and backups still exist. This download does not prove fresh-install rendering, infrastructure restore, account/session authority, database roles, Redis isolation, capacity, reconnect behavior or deployment cost. Do not delete a source just because export completed. Keep the exact pack, native archives/sidecars, application/source version and independently verified backups until your restored work is usable.
`;}
