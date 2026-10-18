import requests,json,copy,uuid,hashlib,asyncio,time
from pathlib import Path
import websockets
import os
# Fixed disposable target: reject overrides before reading any QA credentials.
BASE='http://127.0.0.1:39007/api/v1'
if os.environ.get('DOORY_API_BASE', BASE) != BASE:
 raise SystemExit('DOORY_API_BASE must match the fixed owned loopback API target')
ORIGIN='http://127.0.0.1:39007'
ROOT=Path(os.environ['DOORY_EVIDENCE_DIR'])
private_lines=(line.strip() for line in (ROOT/'private.env').read_text().splitlines())
secret=dict(line.split('=',1) for line in private_lines if line and not line.startswith('#'))['QA_PASSWORD']
checks=[]
def call(s,method,path,data=None,expected=200,extra=None):
 h={'Origin':ORIGIN,'X-CSRFToken':s.cookies.get('csrftoken','')};h.update(extra or {})
 route='/shared/[redacted]/' if '/shared/' in path else path
 try:
  r=s.request(method,BASE+path,json=data,headers=h,timeout=15,allow_redirects=False)
 except requests.RequestException:
  raise SystemExit(f'HTTP transport failed: {method} {route}') from None
 assert r.status_code==expected,(method,route,r.status_code)
 return r.json() if r.content else None
def mark(name):checks.append(name);print('PASS',name,flush=True)
a,b,anon=requests.Session(),requests.Session(),requests.Session()
for session in (a,b,anon):session.trust_env=False
for s,email in [(a,'owner-a@example.invalid'),(b,'owner-b@example.invalid')]:
 call(s,'GET','/auth/csrf/',expected=204)
 call(s,'POST','/auth/login/',{'email':email,'password':secret})
mark('two_ephemeral_session_logins')
f=json.loads(Path(__file__).with_name('doory-native-fixture.json').read_text());f.update(width=1080,height=1350)
p2=copy.deepcopy(f['document']['pages'][0]);p2['id']=str(uuid.uuid4());p2['name']='Second page'
for o in p2['objects']:o['id']=str(uuid.uuid4())
p2['objects'][0]['text']='SECOND PAGE'
f['document']['pages'].append(p2)
d=call(a,'POST','/designs/',f,201);ident=d['id'];path='/designs/'+ident+'/'
r=call(a,'GET',path);assert r['document']==f['document'];mark('native_two_page_create_read_exact_json')
call(b,'GET',path,expected=404);call(b,'PATCH',path,{'title':'unauthorized'},404);mark('outsider_owner_read_write_rejected')
edit=copy.deepcopy(r['document']);edit['pages'][0]['objects'][0]['text']='EDITED NATIVE HEADING'
u=call(a,'PATCH',path,{'document':edit,'base_revision':r['revision']});assert u['revision']>r['revision']
call(a,'PATCH',path,{'document':edit,'base_revision':r['revision']},409)
r=call(a,'GET',path);assert r['document']==edit;mark('editable_text_persisted_and_stale_revision_409')
(ROOT/'native-document-export.json').write_text(json.dumps(r['document'],indent=2))
share=call(a,'POST',path+'share-links/',{'role':'view'},201);sp='/shared/'+share['token']+'/'
assert call(anon,'GET',sp)['document']==edit;mark('anonymous_valid_share_intentionally_discloses_document')
call(b,'PATCH',sp,{'document':edit,'base_revision':r['revision']},403);mark('view_share_write_rejected')
locked=call(a,'POST',path+'share-links/',{'role':'view','password':secret},201)
call(anon,'GET','/shared/'+locked['token']+'/',expected=401)
assert call(anon,'GET','/shared/'+locked['token']+'/',extra={'X-Share-Password':secret})['document']==edit
mark('password_share_requires_password')
async def socket_checks():
 uri='ws://127.0.0.1:39009/ws/designs/'+ident+'/'
 async with websockets.connect(uri,origin=ORIGIN) as w:
  try:await asyncio.wait_for(w.recv(),5);raise AssertionError('anonymous accepted')
  except websockets.ConnectionClosed as e:assert e.code==4401
 mark('anonymous_room_rejected_4401')
 cookie='; '.join(k+'='+v for k,v in b.cookies.get_dict().items())
 async with websockets.connect(uri,origin=ORIGIN,additional_headers={'Cookie':cookie}) as w:
  await w.send(json.dumps({'type':'auth','token':'not-a-valid-token'}))
  try:await asyncio.wait_for(w.recv(),5);raise AssertionError('outsider accepted')
  except websockets.ConnectionClosed as e:assert e.code==4403
 mark('outsider_room_invalid_share_rejected_4403')
 async with websockets.connect(uri,origin=ORIGIN,additional_headers={'Cookie':cookie}) as w:
  await w.send(json.dumps({'type':'auth','token':share['token']}))
  ready=json.loads(await asyncio.wait_for(w.recv(),10));assert ready['type']=='ready' and ready['canWrite']==False
  call(a,'PATCH',path+'share-links/'+share['id']+'/',{'is_active':False})
  t=time.monotonic()
  try:
   while True:await asyncio.wait_for(w.recv(),15)
  except websockets.ConnectionClosed as e:
   assert e.code in [4403,4404],e.code
   checks.append('active_shared_room_revoked_in_'+str(round(time.monotonic()-t,2))+'s')
 mark('active_shared_room_revocation_observed')
asyncio.run(socket_checks())
call(anon,'GET',sp,expected=404);mark('revoked_share_http_rejected')
# Explicit owner remap is a controlled experiment, not a production identity converter.
export=copy.deepcopy(r['document']);imported=call(b,'POST','/designs/',{'title':'Explicit QA owner remap','width':1080,'height':1350,'document':export},201)
assert call(b,'GET','/designs/'+imported['id']+'/')['document']==export
call(a,'GET','/designs/'+imported['id']+'/',expected=404)
mark('explicit_native_json_copy_to_second_owner_preserves_document_and_isolation')
report={'sourceCommit':'27b6f68221fdbf1ef1bedc182e303210ca9e39f5','checks':checks,'sourceDesignId':ident,'mappedDesignId':imported['id'],'nativeDocumentSha256':hashlib.sha256(json.dumps(export,sort_keys=True).encode()).hexdigest(),'bounds':'Actual local HTTP/WebSocket API only; owners are not Studio brands. No browser hydration, self-contained archive, fonts/assets, Penpot or cloud integration proven.'}
(ROOT/'api-acceptance.json').write_text(json.dumps(report,indent=2));print('REPORT SAVED',flush=True)
