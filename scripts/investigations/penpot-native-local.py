"""Fixed-loopback QA reproducer. Credentials and full native data remain private."""
import argparse, collections, hashlib, json, os, pathlib, stat, uuid
from urllib.parse import urlparse
import requests
parser=argparse.ArgumentParser()
parser.add_argument('--account-file',required=True)
parser.add_argument('--evidence-dir',required=True)
parser.add_argument('--anchor-file',required=True)
parser.add_argument('--create-name')
parser.add_argument('--compiled')
parser.add_argument('--archive')
parser.add_argument('--export-file')
args=parser.parse_args()
credential_path=pathlib.Path(args.account_file)
if stat.S_IMODE(credential_path.stat().st_mode)&0o077:raise SystemExit('QA credentials must be private0600')
account=json.loads(credential_path.read_text())['accounts'][0]
# Supply only the explicitly provisioned disposable local QA account file.
out=pathlib.Path(args.evidence_dir);out.mkdir(mode=0o700,parents=True,exist_ok=True);os.chmod(out,0o700)
s=requests.Session();s.trust_env=False
base='http://localhost:39008'
def rpc(command,payload):
 try:r=s.post(base+'/api/rpc/command/'+command,json=payload,headers={'Accept':'application/json','Origin':base},timeout=30,allow_redirects=False)
 except requests.RequestException:raise SystemExit('Local RPC transport failed') from None
 if r.status_code!=200:raise SystemExit(f'Local RPC {command} returned {r.status_code}; response omitted')
 return r.json()
def save(name,payload):
 p=out/name;p.write_text(json.dumps(payload,indent=2));p.chmod(0o600)
rpc('login-with-password',{'email':account['email'],'password':account['password']})
anchor=rpc('get-file',{'id':args.anchor_file})
if sum(bool(v) for v in [args.create_name,args.compiled,args.archive,args.export_file])!=1:raise SystemExit('Select exactly one local QA operation')
def end_value(response):
 if response.status_code!=200 or 'event: error' in response.text:raise SystemExit('Native archive RPC failed; response omitted')
 try:return json.loads(response.text.split('event: end\ndata: ')[1].split('\n')[0])
 except (ValueError,IndexError):raise SystemExit('Native archive RPC did not report completion') from None
if args.export_file:
 file=rpc('get-file',{'id':args.export_file})
 if file['projectId']!=anchor['projectId']:raise SystemExit('Export requires the owned QA project')
 response=s.post(base+'/api/rpc/command/export-binfile',json={'file-id':file['id'],'include-libraries':True,'embed-assets':False},headers={'Accept':'text/event-stream','Origin':base},timeout=60,allow_redirects=False)
 url=end_value(response).get('~#uri','');parsed=urlparse(url)
 if parsed.scheme!='http' or parsed.hostname!='localhost' or parsed.port!=39008 or not parsed.path.startswith('/assets/by-id/') or parsed.query or parsed.fragment or parsed.username:raise SystemExit('Unexpected archive download target')
 response=s.get(url,timeout=30,allow_redirects=False)
 if response.status_code!=200:raise SystemExit('Native archive download failed')
 p=out/'native-export.penpot';p.write_bytes(response.content);p.chmod(0o600)
 print('Native archive exported',len(response.content),'bytes SHA256',hashlib.sha256(response.content).hexdigest());raise SystemExit(0)
if args.archive:
 p=pathlib.Path(args.archive)
 if p.stat().st_size>32*1024*1024:raise SystemExit('Local fixture archive exceeds32MiB')
 with p.open('rb') as handle:
  # Omit version: multipart strings are not accepted by the enum. Official default is native version3.
  response=s.post(base+'/api/rpc/command/import-binfile',data={'project-id':anchor['projectId'],'name':'Studio native QA archive restored'},files={'file':(p.name,handle,'application/zip')},headers={'Accept':'text/event-stream','Origin':base},timeout=60,allow_redirects=False)
 result=end_value(response)
 if not isinstance(result,list) or len(result)!=1 or not isinstance(result[0],str) or not result[0].startswith('~u'):raise SystemExit('Unexpected archive result')
 restored=rpc('get-file',{'id':result[0][2:]});save('archive-restored.json',restored)
 print('Actual native archive parsed into new QA file',restored['id']);raise SystemExit(0)
if args.create_name:
 if args.compiled:raise SystemExit('Create and apply must be separate explicit steps')
 file=rpc('create-file',{'name':'Studio native QA '+args.create_name,'project-id':anchor['projectId']})
 save('new-file.json',file);print('Created new disposable native file',file['id']);raise SystemExit(0)
if not args.compiled:raise SystemExit('Use --create-name or --compiled')
payload=json.loads(pathlib.Path(args.compiled).read_text());file=rpc('get-file',{'id':payload['fileId']})
if file['projectId']!=anchor['projectId'] or not file['name'].startswith('Studio native QA ') or file['revn']!=0:raise SystemExit('Apply requires a newly created empty QA file in the same owned project')
changes=payload['changes']+[{'type':'del-page','id':p} for p in file['data']['pages']]
rpc('update-file',{'id':file['id'],'session-id':str(uuid.uuid4()),'revn':file['revn'],'vern':file['vern'],'changes':changes})
result=rpc('get-file',{'id':file['id']});save('native-saved.json',result)
shapes=[o for p in result['data']['pagesIndex'].values() for o in p['objects'].values()]
summary={'fileId':file['id'],'revision':result['revn'],'pages':len(result['data']['pages']),'shapeTypes':dict(collections.Counter(o.get('type') for o in shapes)),'components':len(result['data'].get('components',{})),'boundary':'Saved model only; browser visual/export/archive proof required separately'}
save('summary.json',summary);print(json.dumps(summary))
