import test from 'node:test';import assert from 'node:assert/strict';
import {DurableStore} from './storage.js';import {IdentityService} from './auth.js';
test('password sessions persist, expire, logout and enforce explicit membership',()=>{
 const store=new DurableStore(':memory:');const identity=new IdentityService(store);
 identity.provision({username:'founder',password:'test-only-password-482!',role:'founder'});
 identity.provision({username:'marketer',password:'test-only-password-371!',role:'marketer'});
 assert.equal(identity.login('founder','wrong'),null);
 const login=identity.login('founder','test-only-password-482!');assert.equal(identity.authenticate(login.token).username,'founder');
 const other=identity.createOrganization(login.user,'Other');assert.equal(identity.organizations(login.user).length,2);
 const marketer=identity.login('marketer','test-only-password-371!').user;
 assert.throws(()=>identity.authorize(marketer,other.id,'brand_default'),/access/i);
 assert.doesNotMatch(JSON.stringify(store.get('identity')),/test-only-password/);
 identity.logout(login.token);assert.equal(identity.authenticate(login.token),null);store.close();
});
