#!/usr/bin/env python3
"""Create a new private deployment cache credential set; never rotate in place."""
import argparse,hashlib,json,os,pathlib,secrets
RUNTIME_USER='studio_runtime'
HEALTH_USER='studio_health'
def generate(output):
 output=pathlib.Path(output).absolute();parent=output.parent.resolve(strict=True)
 if not parent.is_dir() or output.name in ('','.','..'):raise ValueError('New output directory required')
 output=parent/output.name;output.mkdir(mode=0o700);os.chmod(output,0o700)
 runtime=secrets.token_urlsafe(32);health=secrets.token_urlsafe(32)
 sha=lambda b:hashlib.sha256(b).hexdigest()
 files={
  'users.acl':('user default reset off\n'+f'user {RUNTIME_USER} reset on #{sha(runtime.encode())} ~* &* +@all\n'+f'user {HEALTH_USER} reset on #{sha(health.encode())} -@all +ping\n').encode(),
  'client.env':f'PENPOT_REDIS_URI=redis://{RUNTIME_USER}:{runtime}@penpot-valkey:6379/0\n'.encode(),
  'health.password':(health+'\n').encode(),
 }
 records=[]
 for name,data in files.items():
  fd=os.open(output/name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
  with os.fdopen(fd,'wb') as stream:
   os.fchmod(stream.fileno(),0o600);stream.write(data);stream.flush();os.fsync(stream.fileno())
  records.append({'path':name,'bytes':len(data),'sha256':sha(data)})
 data=(json.dumps({'schemaVersion':1,'runtimeUser':RUNTIME_USER,'healthUser':HEALTH_USER,'defaultUserEnabled':False,'scope':'One dedicated native deployment; not per-brand or least-privilege authorization.','files':records},indent=2)+'\n').encode()
 fd=os.open(output/'manifest.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as stream:os.fchmod(stream.fileno(),0o600);stream.write(data);stream.flush();os.fsync(stream.fileno())
 fd=os.open(output,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)
 return output
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',required=True);args=parser.parse_args()
 try:generate(args.output)
 except (OSError,ValueError):parser.exit(1,'Cache credential preparation refused; preserve any existing or partial directory. No rotation performed.\n')
 print('Prepared one new private cache credential directory. No runtime activated.')
