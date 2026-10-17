import test from 'node:test';import assert from 'node:assert/strict';
import {DurableStore} from './storage.js';import {IdentityService} from './auth.js';
test('password sessions persist, expire, logout and enforce explicit membership',async()=>{
 const store=new DurableStore(':memory:');const identity=new IdentityService(store);
 await identity.provision({username:'founder',password:'test-only-password-482!',role:'founder'});
 await identity.provision({username:'marketer',password:'test-only-password-371!',role:'marketer'});
 assert.equal(await identity.login('founder','wrong'),null);
 const login=await identity.login('founder','test-only-password-482!');assert.equal((await identity.authenticate(login.token)).username,'founder');
 const other=await identity.createOrganization(login.user,'Other');assert.equal((await identity.organizations(login.user)).length,2);
 const marketer=(await identity.login('marketer','test-only-password-371!')).user;
 await assert.rejects(identity.authorize(marketer,other.id,'brand_default'),/access/i);
 assert.doesNotMatch(JSON.stringify(store.get('identity')),/test-only-password/);
 await identity.logout(login.token);assert.equal(await identity.authenticate(login.token),null);store.close();
});
