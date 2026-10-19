"""Hosted-only bounded wheel/checkpoint acquisition. Never imports model packages."""
import argparse,hashlib,json,os,pathlib,re,subprocess,sys,tempfile,urllib.parse,urllib.request,zipfile,email,platform
ROOT=pathlib.Path(__file__).resolve().parent
CHECKPOINT={'fileId':'1mcr7ALciuAsHCpLnrtG_eop5-EYhbCmz','name':'modnet_photographic_portrait_matting.ckpt','bytes':26255603,'modifiedTime':'2020-12-07T05:21:01.930Z','authorsFolder':'1umYmlCulvIFNaqPjwod1SayFmSRHziyR'}
HOSTS={'pypi.org','files.pythonhosted.org','download.pytorch.org','download-r2.pytorch.org','drive.google.com','drive.usercontent.google.com'}
class Redirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  valid(newurl);return super().redirect_request(req,fp,code,msg,headers,newurl)
def valid(url):
 u=urllib.parse.urlsplit(url)
 if u.scheme!='https' or u.hostname not in HOSTS or u.username or u.password or u.port not in (None,443):raise ValueError('Unapproved source URL')
def read(url,maximum):
 valid(url)
 client=urllib.request.build_opener(urllib.request.ProxyHandler({}),Redirect())
 with client.open(urllib.request.Request(url,headers={'User-Agent':'Studio-provenance/1'}),timeout=30) as r:
  valid(r.url);data=r.read(maximum+1)
  if r.status!=200 or len(data)>maximum:raise ValueError('Source response exceeds bound')
  return data,r.headers.get('Content-Type','').lower(),r.url
sha=lambda b:hashlib.sha256(b).hexdigest()
def checkpoint(destination,expected=None):
 url='https://drive.google.com/uc?export=download&id='+CHECKPOINT['fileId']
 data,mime,actual=read(url,CHECKPOINT['bytes'])
 if len(data)!=CHECKPOINT['bytes'] or any(x in mime for x in ['html','json','text/']):raise ValueError('Author checkpoint unavailable or identity/size changed')
 digest=sha(data)
 if expected and digest!=expected:raise ValueError('Reviewed checkpoint digest changed')
 destination.write_bytes(data);destination.chmod(0o600)
 return {**CHECKPOINT,'available':True,'requestedUrl':url,'actualUrl':actual,'sha256':digest,'digestAuthority':'operator-recorded authors-linked acquisition, not authors-published checksum','deserialized':False}
def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
def capture(out):
 core=json.loads((ROOT/'core-source-metadata.json').read_text());pins=[]
 html=read(core['torchCPU']['source'],4*1024*1024)[0].decode()
 links=re.findall(r'href=["\']([^"\']+)',html)
 target=core['torchCPU']['filename'];matches=[urllib.parse.urljoin(core['torchCPU']['source'],x) for x in links if pathlib.PurePosixPath(urllib.parse.unquote(urllib.parse.urlsplit(x).path)).name==target]
 if len(matches)!=1:raise ValueError('Exact official CPU wheel missing or ambiguous')
 url=matches[0]
 if urllib.parse.parse_qs(urllib.parse.urlsplit(url).fragment).get('sha256')!=[core['torchCPU']['sha256']]:raise ValueError('CPU wheel source hash changed')
 pins.append('torch @ '+url)
 for key in ['onnx','onnxruntime']:
  metadata=json.loads(read(core[key]['source'],8*1024*1024)[0]);rows=[x for x in metadata['urls'] if x['filename']==core[key]['filename'] and not x['yanked']]
  if len(rows)!=1 or rows[0]['digests']['sha256']!=core[key]['sha256']:raise ValueError('Core wheel source hash changed')
  pins.append(key+' @ '+rows[0]['url']+'#sha256='+core[key]['sha256'])
 # These extra image preprocess packages are resolved only here; their exact
 # complete versions/hashes MUST be reviewed and committed before conversion.
 pins+=['opencv-python-headless']
 with tempfile.TemporaryDirectory(prefix='modnet-wheel-capture-') as tmp:
  tmp=pathlib.Path(tmp);report=tmp/'pip-report.json'
  subprocess.run([sys.executable,'-m','pip','--isolated','--disable-pip-version-check','--no-cache-dir','install','--dry-run','--ignore-installed','--only-binary=:all:','--index-url','https://pypi.org/simple','--report',str(report),*pins],check=True,timeout=600)
  rows=json.loads(report.read_text())['install'];assert 3<=len(rows)<=48
  packages=[];requirements=[];total=0
  for row in rows:
   meta=row['metadata'];name=re.sub(r'[-_.]+','-',meta['name']).lower();version=meta['version'];url=row['download_info']['url'];valid(url)
   if name.startswith(('nvidia-','cuda-')):raise ValueError('CPU-only lock required')
   digest=row['download_info']['archive_info']['hashes']['sha256'];assert re.fullmatch('[a-f0-9]{64}',digest)
   filename=pathlib.PurePosixPath(urllib.parse.unquote(urllib.parse.urlsplit(url).path)).name;assert filename.endswith('.whl')
   data,_,_=read(url,512*1024*1024);total+=len(data);assert total<=1536*1024*1024 and sha(data)==digest
   wheel=tmp/filename;wheel.write_bytes(data)
   with zipfile.ZipFile(wheel) as z:
    # Vendored packages can carry their own nested dist-info records. Only
    # this wheel's top-level distribution metadata identifies the resolved row.
    members=[n for n in z.namelist() if n.count('/')==1 and n.endswith('.dist-info/METADATA')]
    if len(members)!=1:
     raise ValueError(f'Expected one root wheel METADATA for {name[:100]}=={version[:100]}; found {len(members)}')
    assert z.getinfo(members[0]).file_size<=2*1024*1024
    m=email.message_from_bytes(z.read(members[0]));assert re.sub(r'[-_.]+','-',m['Name']).lower()==name and m['Version']==version
    notices=[{'path':n,'sha256':sha(z.read(n)),'bytes':z.getinfo(n).file_size} for n in z.namelist() if '.dist-info/' in n and re.search(r'(?i)(license|notice|copying)',n) and not n.endswith('/') and z.getinfo(n).file_size<=2*1024*1024]
   packages.append({'name':name,'version':version,'url':url,'filename':filename,'bytes':len(data),'sha256':digest,'requiresDist':m.get_all('Requires-Dist',[]),'license':m.get('License-Expression') or m.get('License'),'notices':notices})
   requirements.append(f'{name}=={version} --hash=sha256:{digest}');wheel.unlink()
  assert len({x['name'] for x in packages})==len(packages)
  (out/'requirements.lock').write_text('\n'.join(sorted(requirements))+'\n')
  write(out/'wheel-lock.json',{'schemaVersion':1,'pythonImage':core['python']['amd64ImageDigest'],'platform':'linux/amd64 CPython3.11','pythonVersion':sys.version,'packages':packages,'aggregateWheelBytes':total,'pipVersion':subprocess.check_output([sys.executable,'-m','pip','--version'],text=True).strip(),'requirementsSha256':sha((out/'requirements.lock').read_bytes()),'reviewedForConversion':False})
  path=tmp/'original.ckpt'
  try:
   receipt=checkpoint(path);write(out/'checkpoint-acquisition.json',receipt)
  except Exception as e:
   write(out/'checkpoint-acquisition.json',{**CHECKPOINT,'available':False,'failureType':type(e).__name__,'deserialized':False,'sha256':None})
  finally:path.unlink(missing_ok=True)
def restore(lockdir,wheels,destination,expected):
 lock=json.loads((lockdir/'wheel-lock.json').read_text());assert lock['reviewedForConversion'] is True
 assert sha((lockdir/'requirements.lock').read_bytes())==lock['requirementsSha256']
 total=0
 for e in lock['packages']:
  data,_,_=read(e['url'],e['bytes']);total+=len(data);assert total<=1536*1024*1024 and len(data)==e['bytes'] and sha(data)==e['sha256']
  assert pathlib.PurePosixPath(e['filename']).name==e['filename'] and e['filename'].endswith('.whl');(wheels/e['filename']).write_bytes(data)
 return checkpoint(destination,expected)
if __name__=='__main__':
 if os.environ.get('GITHUB_ACTIONS')!='true':raise SystemExit('Hosted Actions only; no local model/wheel acquisition')
 if sys.implementation.name!='cpython' or sys.version_info[:3]!=(3,11,17) or platform.system()!='Linux' or platform.machine()!='x86_64':raise SystemExit('Exact pinned Linux AMD64 CPython3.11.17 required')
 os.umask(0o077);p=argparse.ArgumentParser();p.add_argument('mode',choices=['capture','restore']);p.add_argument('--out',required=True);p.add_argument('--lockdir');p.add_argument('--checkpoint-sha256');a=p.parse_args();out=pathlib.Path(a.out);out.mkdir(mode=0o700)
 if a.mode=='capture':capture(out)
 else:
  assert re.fullmatch('[a-f0-9]{64}',a.checkpoint_sha256 or '');w=out/'wheels';w.mkdir();write(out/'checkpoint-acquisition.json',restore(pathlib.Path(a.lockdir),w,out/'original.ckpt',a.checkpoint_sha256))
