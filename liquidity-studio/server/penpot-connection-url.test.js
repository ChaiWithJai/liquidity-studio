import test from 'node:test';
import assert from 'node:assert/strict';
import {checkedPenpotConnectionUrl} from '../src/lib/penpot-connection-url.js';
const token='a'.repeat(43),managed='https://design.chaiwithjai.com',local='http://localhost:39008';
test('native handoff supports configured managed and existing local origins',()=>{
 for(const origin of [managed,local])assert.equal(checkedPenpotConnectionUrl(`${origin}/studio-connect?challenge=${token}`,origin),`${origin}/studio-connect?challenge=${token}`);
});
test('native handoff rejects foreign destinations and malformed one-use links',()=>{
 for(const value of [
  `https://other.example/studio-connect?challenge=${token}`,
  `${local}/studio-connect?challenge=${token}`,
  `${managed}/other?challenge=${token}`,
  `${managed}/studio-connect?challenge=${token}&challenge=${token}`,
  `${managed}/studio-connect?challenge=${token}&next=/`,
  `${managed}/studio-connect?challenge=short`,
  `${managed}/studio-connect?challenge=${token}#fragment`,
  `https://person:secret@design.chaiwithjai.com/studio-connect?challenge=${token}`
 ])assert.throws(()=>checkedPenpotConnectionUrl(value,managed),/connection link is unavailable/);
 assert.throws(()=>checkedPenpotConnectionUrl(`${managed}/studio-connect?challenge=${token}`,undefined));
 assert.throws(()=>checkedPenpotConnectionUrl(`${managed}/studio-connect?challenge=${token}`,managed+'/'));
});
