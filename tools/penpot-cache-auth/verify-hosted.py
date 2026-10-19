#!/usr/bin/env python3
"""Hosted-only ephemeral Valkey acceptance; never use a customer fixture."""
import hashlib,json,os,pathlib,re,stat,subprocess,tempfile,time,uuid
from urllib.parse import urlsplit
from generate import generate

if os.environ.get('GITHUB_ACTIONS')!='true':raise SystemExit('Hosted Actions execution only')
IMAGE='valkey/valkey@sha256:640c5e62cea04b6d6f2084232651d0cc70362d31f4f805e7be94dbed6855e8f2'
TOOLS=pathlib.Path(__file__).resolve().parent
def run(args,input=None,check=True,timeout=30):
 r=subprocess.run(args,input=input,text=True,capture_output=True,timeout=timeout)
 if check and r.returncode:raise RuntimeError('Hosted cache operation rejected')
 return r
with tempfile.TemporaryDirectory(prefix='cache-auth-ci-') as temp:
 root=pathlib.Path(temp);private=generate(root/'private')
 assert stat.S_IMODE(private.stat().st_mode)==0o700
 expected={}
 for name in ['client.env','health.password','users.acl','manifest.json']:
  f=private/name;assert stat.S_IMODE(f.stat().st_mode)==0o600
  expected[name]=(f.stat().st_uid,hashlib.sha256(f.read_bytes()).hexdigest())
 line=(private/'client.env').read_text().strip();assert line.startswith('PENPOT_REDIS_URI=')
 uri=urlsplit(line.split('=',1)[1]);runtime=uri.password
 health=(private/'health.password').read_text().strip()
 assert uri.username=='studio_runtime' and uri.hostname=='penpot-valkey' and uri.path=='/0'
 assert re.fullmatch(r'[A-Za-z0-9_-]{43}',runtime) and re.fullmatch(r'[A-Za-z0-9_-]{43}',health)
 assert runtime!=health
 acl=(private/'users.acl').read_text()
 assert runtime not in acl and health not in acl
 assert 'user default reset off\n' in acl
 assert '#'+hashlib.sha256(runtime.encode()).hexdigest() in acl
 assert '#'+hashlib.sha256(health.encode()).hexdigest() in acl
 try:generate(private)
 except FileExistsError:pass
 else:raise AssertionError('Existing credentials were rotated')
 for name,(owner,digest) in expected.items():
  f=private/name;assert f.stat().st_uid==owner and hashlib.sha256(f.read_bytes()).hexdigest()==digest

 run(['docker','pull','--platform','linux/amd64',IMAGE],timeout=180)
 name='cache-auth-ci-'+uuid.uuid4().hex
 def client(user,secret,*command):
  code='IFS= read -r REDISCLI_AUTH; export REDISCLI_AUTH; exec valkey-cli --user "$1" '+ ' '.join(command)
  return run(['docker','exec','-i',name,'sh','-ec',code,'sh',user],input=secret+'\n',check=False)
 def ready():
  last=None
  for _ in range(100):
   r=run(['docker','exec',name,'/run/studio-cache/healthcheck.sh'],check=False,timeout=5)
   if r.returncode==0:return
   last=r
   time.sleep(.2)
  # This isolated server receives only generated fixture secrets. Redact both
  # before emitting bounded diagnostics; never inspect its environment.
  logged=run(['docker','logs','--tail','30',name],check=False)
  details=(logged.stdout+logged.stderr+'\nhealth: '+(last.stdout+last.stderr if last else 'not attempted'))
  for secret in (runtime,health):details=details.replace(secret,'[REDACTED]')
  print('Disposable cache readiness diagnostic: '+details[-5000:],flush=True)
  raise AssertionError('Authenticated health never became ready')
 try:
  run(['docker','run','-d','--name',name,'--platform','linux/amd64','--network','none',
       '--memory','192m','--memory-swap','192m','--cpus','.25','--pids-limit','64',
       '--tmpfs','/run/valkey-private:rw,noexec,nosuid,size=64k,mode=0700',
       '--mount','type=bind,src='+str(private/'users.acl')+',dst=/run/studio-cache-input/users.acl,readonly',
       '--mount','type=bind,src='+str(private/'health.password')+',dst=/run/studio-cache-input/health.password,readonly',
       '--mount','type=bind,src='+str(TOOLS)+',dst=/run/studio-cache,readonly',
       '--entrypoint','tini',IMAGE,'--','/run/studio-cache/start-valkey.sh','valkey-server',
       '--aclfile','/run/valkey-private/users.acl','--maxmemory','128mb','--maxmemory-policy','volatile-lfu'])
  ready()
  anonymous=run(['docker','exec',name,'valkey-cli','ping'],check=False)
  assert 'NOAUTH' in anonymous.stdout
  wrong=client('studio_runtime','not-the-generated-secret','ping')
  assert 'WRONGPASS' in wrong.stderr+wrong.stdout
  assert client('studio_runtime',runtime,'ping').stdout.strip()=='PONG'
  assert client('studio_runtime',runtime,'set','ci:owned','retained').stdout.strip()=='OK'
  assert client('studio_runtime',runtime,'get','ci:owned').stdout.strip()=='retained'
  assert client('studio_health',health,'ping').stdout.strip()=='PONG'
  assert 'NOPERM' in client('studio_health',health,'get','ci:owned').stdout
  run(['docker','restart','--time','10',name],timeout=30)
  ready()
  assert client('studio_runtime',runtime,'ping').stdout.strip()=='PONG'
  assert 'NOAUTH' in run(['docker','exec',name,'valkey-cli','ping'],check=False).stdout
  for filename,(owner,digest) in expected.items():
   f=private/filename
   assert f.stat().st_uid==owner and stat.S_IMODE(f.stat().st_mode)==0o600
   assert hashlib.sha256(f.read_bytes()).hexdigest()==digest
  logged=run(['docker','logs',name]);logs=logged.stdout+logged.stderr
  assert runtime not in logs and health not in logs
  print(json.dumps({'privateGeneration':True,'exclusiveNoRotation':True,'anonymousDenied':True,
   'wrongCredentialDenied':True,'runtimeClientReady':True,'healthPingOnly':True,
   'containerRestartReauthenticated':True,'hostPrivateFilesUnchanged':True,
   'customerRuntimeActivated':False}))
 finally:
  run(['docker','rm','-f','-v',name],check=False)
