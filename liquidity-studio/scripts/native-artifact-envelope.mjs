// Operator delivery only. Encryption is not a license or distribution permission.
import fs from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {createPublicKey,createPrivateKey,createHash,randomBytes,publicEncrypt,privateDecrypt,createCipheriv,createDecipheriv,constants} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const digest=x=>createHash('sha256').update(x).digest('hex');
function recipient(pem){const key=createPublicKey(pem);if(key.asymmetricKeyType!=='rsa'||key.asymmetricKeyDetails.modulusLength<3072)throw Error('RSA recipient of at least3072bits required');const der=key.export({type:'spki',format:'der'});return {key,sha256:digest(der)};}
export async function seal({input,output,envelope,publicPem,recipientSha256}){
 const r=recipient(publicPem);if(!/^[a-f0-9]{64}$/.test(recipientSha256)||r.sha256!==recipientSha256)throw Error('Recipient fingerprint mismatch');
 const st=fs.lstatSync(input);if(!st.isFile()||st.isSymbolicLink()||st.size>512*1024*1024)throw Error('Bounded regular artifact archive required');
 const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv),hash=createHash('sha256');let bytes=0;
 cipher.on('data',b=>{hash.update(b);bytes+=b.length;});
 const fd=fs.openSync(output,'wx',0o600);
 try{await pipeline(fs.createReadStream(input),cipher,fs.createWriteStream(output,{fd}));fs.writeFileSync(envelope,JSON.stringify({schemaVersion:1,algorithm:'RSA-OAEP-SHA256+AES-256-GCM',recipientSha256:r.sha256,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),wrappedKey:publicEncrypt({key:r.key,oaepHash:'sha256',padding:constants.RSA_PKCS1_OAEP_PADDING},key).toString('base64'),ciphertextBytes:bytes,ciphertextSha256:hash.digest('hex')},null,2)+'\n',{flag:'wx',mode:0o600});}
 catch(error){fs.rmSync(output,{force:true});throw error;}finally{key.fill(0);}
}
export async function open({input,output,envelope,privateKeyFile}){
 const stat=fs.lstatSync(privateKeyFile);if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&0o077))throw Error('Private key must be an owner-only regular file');
 const e=JSON.parse(fs.readFileSync(envelope,'utf8'));if(e.schemaVersion!==1||e.algorithm!=='RSA-OAEP-SHA256+AES-256-GCM'||!Number.isSafeInteger(e.ciphertextBytes)||e.ciphertextBytes<1||e.ciphertextBytes>512*1024*1024)throw Error('Unsupported envelope');
 const privateKey=createPrivateKey(fs.readFileSync(privateKeyFile));if(recipient(privateKey).sha256!==e.recipientSha256)throw Error('Wrong recipient');
 const key=privateDecrypt({key:privateKey,oaepHash:'sha256',padding:constants.RSA_PKCS1_OAEP_PADDING},Buffer.from(e.wrappedKey,'base64')),iv=Buffer.from(e.iv,'base64'),tag=Buffer.from(e.tag,'base64');if(key.length!==32||iv.length!==12||tag.length!==16)throw Error('Invalid encryption parameters');
 const hash=createHash('sha256');let bytes=0;const decipher=createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(tag);
 const source=fs.createReadStream(input);source.on('data',b=>{bytes+=b.length;hash.update(b);if(bytes>e.ciphertextBytes)source.destroy(Error('Ciphertext size mismatch'));});
 const fd=fs.openSync(output,'wx',0o600);
 try{await pipeline(source,decipher,fs.createWriteStream(output,{fd}));if(bytes!==e.ciphertextBytes||hash.digest('hex')!==e.ciphertextSha256)throw Error('Ciphertext integrity mismatch');}
 catch(error){fs.rmSync(output,{force:true});throw error;}finally{key.fill(0);}
}
if(process.argv[1]&&fs.realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const [mode,input,output,envelope,keyFile]=process.argv.slice(2);
 try{if(mode==='seal')await seal({input,output,envelope,publicPem:Buffer.from(process.env.NATIVE_RECIPIENT_PUBLIC_KEY_BASE64||'','base64'),recipientSha256:process.env.NATIVE_RECIPIENT_SHA256});else if(mode==='open')await open({input,output,envelope,privateKeyFile:keyFile});else throw Error('Use seal input output envelope or open input output envelope privateKeyFile');}
 catch(error){console.error(error.message);process.exitCode=1;}
}
