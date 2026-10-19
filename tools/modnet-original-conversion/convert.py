"""Offline CPU conversion of the exact reviewed authors-linked checkpoint."""
import argparse,collections,hashlib,importlib.util,json,os,pathlib,sys,time
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--checkpoint',required=True);p.add_argument('--checkpoint-sha256',required=True);p.add_argument('--portrait',required=True);p.add_argument('--out',required=True);a=p.parse_args()
if os.environ.get('STUDIO_MODNET_OFFLINE_CONVERSION')!='1':raise SystemExit('Use reviewed offline hosted container')
# All imports below are from the reviewed complete wheel lock, never checkpoint code.
import cv2,numpy as np,onnx,onnxruntime as ort,torch
source=pathlib.Path(a.source);out=pathlib.Path(a.out);out.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
checkpoint=pathlib.Path(a.checkpoint);assert checkpoint.stat().st_size==26255603 and sha(checkpoint.read_bytes())==a.checkpoint_sha256
assert torch.__version__=='2.14.1+cpu' and onnx.__version__=='1.23.2' and ort.__version__=='1.31.0'
torch.manual_seed(0);np.random.seed(0);torch.set_num_threads(1);torch.set_num_interop_threads(1);torch.use_deterministic_algorithms(True)
sys.path.insert(0,str(source))
from src.models.modnet import MODNet
spec=importlib.util.spec_from_file_location('studio_modnet_export_graph',source/'onnx/modnet_onnx.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
original=MODNet(backbone_pretrained=False).cpu().eval();export=module.MODNet(backbone_pretrained=False).cpu().eval()
state=torch.load(checkpoint,map_location='cpu',weights_only=True)
if not isinstance(state,(dict,collections.OrderedDict)) or not 1<=len(state)<=1024:raise ValueError('Expected bounded plain tensor state dictionary')
clean={};total=0;prefixes=[]
for k,v in state.items():
 if not isinstance(k,str) or type(v) is not torch.Tensor:raise ValueError('Only named ordinary tensors accepted')
 key=k.removeprefix('module.');prefixes.append(k!=key)
 if key in clean or v.layout!=torch.strided or v.device.type!='cpu' or v.dtype not in (torch.float32,torch.int64):raise ValueError('Unexpected/colliding tensor')
 total+=v.numel()*v.element_size()
 if total>128*1024*1024 or not torch.isfinite(v).all().item():raise ValueError('Oversize/nonfinite checkpoint')
 clean[key]=v
for model in [original,export]:
 expected=model.state_dict()
 if set(expected)!=set(clean) or any(expected[k].shape!=clean[k].shape or expected[k].dtype!=clean[k].dtype for k in expected):raise ValueError('Checkpoint architecture mismatch')
 model.load_state_dict(clean,strict=True)
del state,clean
modelpath=out/'modnet-photographic-independent.onnx'
with torch.inference_mode():
 torch.onnx.export(export,torch.zeros(1,3,512,512),str(modelpath),export_params=True,input_names=['input'],output_names=['output'],opset_version=11,dynamo=False,external_data=False,dynamic_axes={'input':{0:'batch',2:'height',3:'width'},'output':{0:'batch',2:'height',3:'width'}})
assert modelpath.stat().st_size<=64*1024*1024
model=onnx.load(str(modelpath),load_external_data=False);onnx.checker.check_model(model)
if any(t.data_location==onnx.TensorProto.EXTERNAL or t.external_data for t in model.graph.initializer):raise ValueError('External tensors forbidden')
assert [(x.domain,x.version) for x in model.opset_import]==[('',11)]
opts=ort.SessionOptions();opts.intra_op_num_threads=1;opts.inter_op_num_threads=1;opts.graph_optimization_level=ort.GraphOptimizationLevel.ORT_DISABLE_ALL
session=ort.InferenceSession(str(modelpath),sess_options=opts,providers=['CPUExecutionProvider'])
portrait=pathlib.Path(a.portrait);assert sha(portrait.read_bytes())=='b614ff30258ad627172f0c4c23df65718c808cec1a6917b49471c86d6a95d6da'
image=cv2.imdecode(np.frombuffer(portrait.read_bytes(),np.uint8),cv2.IMREAD_COLOR);assert image is not None
image=cv2.cvtColor(image,cv2.COLOR_BGR2RGB)
def dims(w,h):
 if max(w,h)<512 or min(w,h)>512:
  if w>=h:w,h=int(w/h*512),512
  else:w,h=512,int(h/w*512)
 return w-w%32,h-h%32
def compare(x,y):
 assert x.shape==y.shape and np.isfinite(x).all() and np.isfinite(y).all()
 d=np.abs(x.astype(np.float64)-y.astype(np.float64));return {'maxAbsolute':float(d.max()),'meanAbsolute':float(d.mean())}
reports=[];passed=True
for label,w,h in [('retained',image.shape[1],image.shape[0]),('portrait',512,768),('landscape',768,512),('square',768,768),('small',320,480),('noninteger',1024,640)]:
 rgb=cv2.resize(image,(w,h),interpolation=cv2.INTER_AREA);mw,mh=dims(w,h)
 normalized=(rgb.astype(np.float64)-127.5)/127.5
 x=cv2.resize(normalized,(mw,mh),interpolation=cv2.INTER_AREA).transpose(2,0,1)[None].astype(np.float32)
 with torch.inference_mode():
  source_result=original(torch.from_numpy(x),True)[2].numpy();graph_result=export(torch.from_numpy(x)).numpy()
 result=session.run(['output'],{'input':x})[0]
 assert all(float(y.min())>=-1e-6 and float(y.max())<=1.000001 for y in [source_result,graph_result,result])
 first=compare(source_result,graph_result);second=compare(source_result,result)
 # Quantize at model resolution, then AREA resize as the existing processor.
 def alpha(y):return cv2.resize(np.floor(np.clip(y[0,0],0,1)*255+.5).astype(np.uint8),(w,h),interpolation=cv2.INTER_AREA)
 final=compare(alpha(source_result),alpha(result))
 ok=all(d['maxAbsolute']<=1e-4 and d['meanAbsolute']<=1e-5 for d in [first,second]) and final['maxAbsolute']<=1 and final['meanAbsolute']<=.1
 passed=passed and ok;reports.append({'fixture':label,'dimensions':[w,h],'modelDimensions':[mw,mh],'inputSha256':sha(x.tobytes()),'originalVsExportGraph':first,'originalVsOnnx':second,'alpha8bit':final,'passed':ok})
report={'schemaVersion':1,'passed':passed,'checkpointSha256':a.checkpoint_sha256,'onnxSha256':sha(modelpath.read_bytes()),'onnxBytes':modelpath.stat().st_size,'authorSource':'28165a451e4610c9d77cfdf925a94610bb2810fb','processor':'RGB normalized(float64−127.5)/127.5; INTER_AREA; 512/32-stride; float32 NCHW; model-resolution 8-bit alpha then INTER_AREA','sourcePortraitSha256':sha(portrait.read_bytes()),'stateTensorBytes':total,'modulePrefixesRemoved':sum(prefixes),'opset':11,'dynamo':False,'externalData':False,'postExportOptimizer':False,'exporterConstantFolding':'Torch built-in behavior enabled; no claim of no graph transformations','versions':{'torch':torch.__version__,'onnx':onnx.__version__,'onnxruntime':ort.__version__,'numpy':np.__version__,'opencv':cv2.__version__},'fixtures':reports,'scope':'NEW independent artifact; not Xenova conversion reconstruction, training-data audit, browser quality acceptance or runtime adoption'}
(out/'numerical-report.json').write_text(json.dumps(report,indent=2)+'\n')
if not passed:raise SystemExit('Numerical comparison failed; no adoption')
