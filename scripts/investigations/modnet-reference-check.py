"""Original reproducible MODNet reference comparison; no model download.
Requires numpy, Pillow, OpenCV, onnxruntime. Supply the owned pinned checkpoint
and synthetic portrait explicitly. Outputs metadata, never image/model bytes.
"""
import argparse, hashlib, json, pathlib, subprocess, tempfile
from datetime import datetime, timezone
import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('--model', required=True)
parser.add_argument('--image', required=True)
parser.add_argument('--node', default='node')
parser.add_argument('--output', required=True)
a=parser.parse_args()
model=pathlib.Path(a.model)
expected='07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9'
if hashlib.sha256(model.read_bytes()).hexdigest()!=expected: raise ValueError('Checkpoint digest mismatch')
session=ort.InferenceSession(str(model), providers=['CPUExecutionProvider'])
source=Image.open(a.image).convert('RGBA')
root=pathlib.Path(__file__).resolve().parents[2]
module=(root/'liquidity-studio/src/lib/modnet-processor.js').as_uri()
results=[]
with tempfile.TemporaryDirectory(prefix='studio-modnet-reference-') as temporary:
 tmp=pathlib.Path(temporary)
 for name,dimensions in [('portrait',(512,768)),('landscape',(768,512)),('square',(768,768)),('small',(320,480)),('noninteger',(1024,640))]:
  w,h=dimensions
  image=source.resize(dimensions,Image.Resampling.LANCZOS)
  rgba=np.array(image)
  # Add explicit opaque/sharp/color edges to exercise area sampling, not only a smooth photograph.
  rgba[:16,:]=[255,0,127,255]
  rgba[:,:16]=[0,255,64,255]
  rgba.tofile(tmp/'image.rgba')
  js=f"""import fs from 'node:fs';import {{prepareModnetInput}} from {json.dumps(module)};
const o=prepareModnetInput(new Uint8Array(fs.readFileSync(process.argv[1])),Number(process.argv[2]),Number(process.argv[3]));
fs.writeFileSync(process.argv[4],Buffer.from(o.data.buffer));console.log(JSON.stringify(o.dims));"""
  dims=json.loads(subprocess.check_output([a.node,'--input-type=module','-e',js,str(tmp/'image.rgba'),str(w),str(h),str(tmp/'input.f32')],text=True))
  _,_,rh,rw=dims
  reference=cv2.resize((rgba[:,:,:3].astype('float64')-127.5)/127.5,(rw,rh),interpolation=cv2.INTER_AREA).transpose(2,0,1)[None].astype('float32')
  actual=np.fromfile(tmp/'input.f32',dtype='float32').reshape(dims)
  ref_matte=session.run(None,{session.get_inputs()[0].name:reference})[0]
  actual_matte=session.run(None,{session.get_inputs()[0].name:actual})[0]
  actual_matte.astype('float32').tofile(tmp/'matte.f32')
  post_js=f"""import fs from 'node:fs';import {{applyModnetMatte}} from {json.dumps(module)};
const b=fs.readFileSync(process.argv[2]);const matte=new Float32Array(b.buffer,b.byteOffset,b.length/4);
const out=applyModnetMatte(new Uint8Array(fs.readFileSync(process.argv[1])),Number(process.argv[3]),Number(process.argv[4]),matte,Number(process.argv[5]),Number(process.argv[6]));fs.writeFileSync(process.argv[7],out);"""
  subprocess.check_call([a.node,'--input-type=module','-e',post_js,str(tmp/'image.rgba'),str(tmp/'matte.f32'),str(w),str(h),str(rw),str(rh),str(tmp/'output.rgba')])
  output=np.fromfile(tmp/'output.rgba',dtype='uint8').reshape(h,w,4)
  reference_alpha=cv2.resize((np.squeeze(ref_matte)*255).astype('uint8'),(w,h),interpolation=cv2.INTER_AREA)
  post_delta=np.abs(output[:,:,3].astype('int16')-reference_alpha.astype('int16'))
  if not np.array_equal(output[:,:,:3],rgba[:,:,:3]): raise AssertionError('Original RGB changed')
  delta=np.abs(actual-reference)
  alpha_delta=np.abs((actual_matte*255).astype('uint8').astype('int16')-(ref_matte*255).astype('uint8').astype('int16'))
  result=dict(fixture=name,rgbaSha256=hashlib.sha256(rgba.tobytes()).hexdigest(),width=w,height=h,modelDimensions=dims,inputMaxAbsolute=float(delta.max()),inputMeanAbsolute=float(delta.mean()),modelAlphaMaxDifference=int(alpha_delta.max()),modelAlphaMeanDifference=float(alpha_delta.mean()),finalAlphaMaxDifference=int(post_delta.max()),finalAlphaMeanDifference=float(post_delta.mean()),originalRgbPreserved=True)
  if result['inputMaxAbsolute']>1e-6 or result['modelAlphaMaxDifference']>1 or result['finalAlphaMaxDifference']>1: raise AssertionError(result)
  results.append(result)
report=dict(generatedAt=datetime.now(timezone.utc).isoformat(),inputSha256=hashlib.sha256(pathlib.Path(a.image).read_bytes()).hexdigest(),processor='studio-modnet-area-v1',modelSha256=expected,reference='ZHKKKe/MODNet@28165a451e4610c9d77cfdf925a94610bb2810fb/onnx/inference_onnx.py',scope='CPU reference agreement, not browser timing or ground-truth segmentation quality',versions=dict(opencv=cv2.__version__,onnxruntime=ort.__version__),fixtures=results)
pathlib.Path(a.output).write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
