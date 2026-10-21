#!/usr/bin/env python3
"""Private resumable GET-only LabelOS API export. Never writes credentials to receipts."""
import argparse,datetime,hashlib,json,os,time,urllib.request,urllib.parse,urllib.error
from pathlib import Path
BASE='https://api-sandbox.labelos.com'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def write(path,data):
 path.write_bytes(data);os.chmod(path,0o600)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--key-file',required=True);ap.add_argument('--output',required=True);ap.add_argument('--initial-dir');ap.add_argument('--skip-breakdown',action='append',default=[]);ap.add_argument('--max-requests',type=int,default=600);args=ap.parse_args()
 keypath=Path(args.key_file);st=keypath.lstat()
 if not keypath.is_file() or keypath.is_symlink() or st.st_uid!=os.getuid() or st.st_mode&0o077:raise SystemExit('Credential must be an owner-only regular file')
 key=keypath.read_text().strip();out=Path(args.output);out.mkdir(mode=0o700,parents=True,exist_ok=True);os.chmod(out,0o700);rawdir=out/'raw';rawdir.mkdir(mode=0o700,exist_ok=True)
 mf=out/'manifest.private.json';manifest=json.loads(mf.read_text()) if mf.exists() else {'schemaVersion':1,'source':'labelos','environment':'sandbox','baseUrl':BASE,'startedAt':now(),'status':'in-progress','atomicSnapshot':False,'requests':[],'resources':{},'qualification':'API-visible catalog, unfiltered period summaries/breakdowns and global daily-series export over a capture interval; not an atomic provider database backup. Filtered cross-dimensional fact combinations are not exhaustively exported.'}
 def save():write(mf,(json.dumps(manifest,indent=2)+'\n').encode())
 manifest.setdefault('resumeHistory',[]).append({'at':now(),'previousStatus':manifest['status']});manifest['status']='in-progress';save();last=[0.];calls=[0]
 def request(path,params=None,refresh=False):
  params=params or {};url=BASE+path+('?' + urllib.parse.urlencode(params) if params else '')
  for entry in manifest['requests']:
   if not refresh and entry['url']==url and entry['status'] in [200,422]:
    data=(out/entry['file']).read_bytes()
    if hashlib.sha256(data).hexdigest()!=entry['sha256']:raise RuntimeError('Backup checksum mismatch')
    if entry['status']==422:
     error=RuntimeError('Provider request failed (422)');error.status=422;error.payload=json.loads(data);raise error
    return json.loads(data)
  if calls[0]>=args.max_requests:raise RuntimeError('Request budget reached; resume the export later')
  time.sleep(max(0,1.15-(time.monotonic()-last[0])));last[0]=time.monotonic();calls[0]+=1
  request_at=now();headers={'Accept':'application/json','Authorization':'Bearer '+key}
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=60) as r:
    data=r.read(16*1024*1024+1);status=r.status;response_date=r.headers.get('Date')
  except urllib.error.HTTPError as e:data=e.read(512*1024);status=e.code;response_date=e.headers.get('Date')
  if len(data)>16*1024*1024:raise RuntimeError('Response exceeded export bound')
  obj=json.loads(data);name=f'raw/{len(manifest["requests"])+1:06}.json';write(out/name,data)
  manifest['requests'].append({'method':'GET','url':url,'requestedAt':request_at,'receivedAt':now(),'responseDate':response_date,'status':status,'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});save()
  if status!=200:
   error=RuntimeError(f'Provider request failed ({status})');error.status=status;error.payload=obj;raise error
  return obj
 def paged(name,path,params=None,initial=None):
  if manifest['resources'].get(name,{}).get('complete'):return
  query=dict(params or {});cursor=None;seen=set();pages=0;rows=0
  while True:
   q={**query,**({'cursor':cursor} if cursor else {})};d=request(path,q);data=d.get('data')
   if not isinstance(data,list):raise RuntimeError('Expected paginated record list')
   pages+=1;rows+=len(data);page=d.get('page',{});more=page.get('has_more',False)
   manifest['resources'][name]={'path':path,'query':query,'pages':pages,'rows':rows,'complete':not more};save()
   if pages==1 or pages%10==0 or not more:print(json.dumps({'resource':name,'pages':pages,'rows':rows,'complete':not more}),flush=True)
   if not more:break
   next_cursor=page.get('next_cursor')
   if not next_cursor or next_cursor in seen:raise RuntimeError('Missing or repeated pagination cursor')
   seen.add(next_cursor);cursor=next_cursor
 def metrics_for(name,path,params,paginated):
  if manifest['resources'].get(name,{}).get('complete'):return
  metrics=list(cap['metrics']);excluded=[];sort_metric=None
  while metrics:
   try:
    query={**params,'metrics':','.join(metrics),**({'limit':500} if paginated else {}),**({'sort':sort_metric} if sort_metric else {})}
    if paginated:paged(name,path,query)
    else:
     d=request(path,query);manifest['resources'][name]={'path':path,'query':query,'rows':len(d['data']) if isinstance(d.get('data'),list) else 1,'interval':d.get('meta',{}).get('interval'),'complete':True};save()
    manifest['resources'][name].update(metrics=metrics,unsupportedMetrics=excluded);save();return
   except RuntimeError as e:
    detail=getattr(e,'payload',{}).get('error',{}).get('details',{})
    metric=detail.get('metric')
    if getattr(e,'status',None)==422 and metric in metrics:
     metrics.remove(metric);excluded.append(metric)
     if sort_metric==metric:sort_metric=None
     continue
    if getattr(e,'status',None)==422 and detail.get('parameter')=='sort' and 'sort is required' in getattr(e,'payload',{}).get('error',{}).get('message','') and not sort_metric:
     sort_metric='quantity' if 'quantity' in metrics else metrics[0];continue
    raise
  raise RuntimeError('No supported metrics')
 try:
  request('/openapi.json');cap=request('/v1/meta/capabilities')['data'];coverage=request('/v1/meta/coverage')['data'];manifest['coverage']=coverage;manifest['capabilities']=cap;save()
  period={'from':coverage['earliest'],'to':coverage['latest']}
  # This source currently reports <24 months. Explicitly stop rather than silently truncate a future larger window.
  first=datetime.date.fromisoformat(period['from']);end=datetime.date.fromisoformat(period['to'])
  if (end.year-first.year)*12+end.month-first.month>=24:raise RuntimeError('Coverage requires <=24-month window splitting before export')
  for name in ['artists','releases','tracks']:paged('catalog/'+name,'/v1/catalog/'+name,{'limit':200})
  for name in ['stores','countries']:
   d=request('/v1/catalog/'+name);manifest['resources']['catalog/'+name]={'path':'/v1/catalog/'+name,'query':{},'rows':len(d['data']),'complete':True};save()
  metrics_for('analytics/summary','/v1/analytics/summary',period,False)
  metrics_for('analytics/timeseries','/v1/analytics/timeseries',period,False)
  # Long ranges auto-aggregate to weeks. Capture explicit monthly windows and verify daily grain.
  daily_metrics=','.join(manifest['resources']['analytics/timeseries']['metrics'])
  start=first
  while start<=end:
   next_month=(start.replace(day=28)+datetime.timedelta(days=4)).replace(day=1)
   stop=min(end,next_month-datetime.timedelta(days=1));name='analytics/daily/'+start.strftime('%Y-%m')
   if not manifest['resources'].get(name,{}).get('complete'):
    query={'from':start.isoformat(),'to':stop.isoformat(),'metrics':daily_metrics};d=request('/v1/analytics/timeseries',query)
    if d.get('meta',{}).get('interval')!='day':raise RuntimeError('Provider did not return daily grain for the bounded window')
    manifest['resources'][name]={'path':'/v1/analytics/timeseries','query':query,'interval':'day','rows':len(d['data']),'complete':True};save()
    print(json.dumps({'resource':name,'rows':len(d['data']),'complete':True}),flush=True)
   start=next_month
  for dimension in cap['dimensions']:
   if dimension in args.skip_breakdown:
    manifest['resources']['analytics/'+dimension]={'complete':False,'status':'explicitly-skipped','reason':'Upstream export failed; existing responses preserved. This breakdown is not backed up.'};save();continue
   metrics_for('analytics/'+dimension,'/v1/analytics/'+dimension,period,True)
  manifest['endingCapabilities']=request('/v1/meta/capabilities',refresh=True)['data'];manifest['missingResources']=[k for k,v in manifest['resources'].items() if not v.get('complete')];manifest['status']='incomplete' if manifest['missingResources'] else 'complete';manifest['finishedAt']=now();save()
  files={p.relative_to(out).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(rawdir.glob('*.json'))};write(out/'SHA256SUMS',('\n'.join(f'{h}  {p}' for p,h in files.items())+'\n').encode())
  print(json.dumps({'status':manifest['status'],'missingResources':manifest['missingResources'],'requests':len(manifest['requests']),'resources':manifest['resources']}),flush=True)
 except Exception as e:
  manifest['status']='incomplete';manifest['stoppedAt']=now();manifest['stopReason']=str(e);save();print(json.dumps({'status':'incomplete','reason':str(e),'requests':len(manifest['requests'])}),flush=True);raise SystemExit(1)
if __name__=='__main__':main()
