"""Fixed-loopback QA reproducer. Credentials and full native data remain private."""
import argparse, collections, json, os, pathlib, stat, uuid
import requests
parser=argparse.ArgumentParser()
parser.add_argument('--account-file',required=True)
parser.add_argument('--evidence-dir',required=True)
parser.add_argument('--anchor-file',required=True)
parser.add_argument('--create-name')
parser.add_argument('--compiled')
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
