var Rd=Object.defineProperty;var $l=t=>{throw TypeError(t)};var Pd=(t,e,r)=>e in t?Rd(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var or=(t,e,r)=>Pd(t,typeof e!="symbol"?e+"":e,r),yo=(t,e,r)=>e.has(t)||$l("Cannot "+r);var p=(t,e,r)=>(yo(t,e,"read from private field"),r?r.call(t):e.get(t)),se=(t,e,r)=>e.has(t)?$l("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),te=(t,e,r,n)=>(yo(t,e,"write to private field"),n?n.call(t,r):e.set(t,r),r),re=(t,e,r)=>(yo(t,e,"access private method"),r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function r(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=r(i);fetch(i.href,s)}})();const xc=!1;var to=Array.isArray,xd=Array.prototype.indexOf,za=Array.prototype.includes,ro=Array.from,Nc=Object.defineProperty,Ki=Object.getOwnPropertyDescriptor,Nd=Object.getOwnPropertyDescriptors,Od=Object.prototype,Dd=Array.prototype,Oc=Object.getPrototypeOf,Bl=Object.isExtensible;const Ld=()=>{};function Md(t){for(var e=0;e<t.length;e++)t[e]()}function Dc(){var t,e,r=new Promise((n,i)=>{t=n,e=i});return{promise:r,resolve:t,reject:e}}function Ud(t,e){if(Array.isArray(t))return t;if(!(Symbol.iterator in t))return Array.from(t);const r=[];for(const n of t)if(r.push(n),r.length===e)break;return r}const Rt=2,la=4,no=8,Lc=1<<24,Hr=16,qr=32,ii=64,Ho=128,dl=256,Wr=512,ft=1024,et=2048,kr=4096,$t=8192,It=16384,_a=32768,Wa=1<<25,ca=65536,Fs=1<<17,Mc=1<<18,ga=1<<19,Fd=1<<20,on=1<<25,$s=1<<21,Ji=1<<22,ti=1<<23,Di=Symbol("$state"),Uc=Symbol("component"),$d=Symbol("legacy props"),Bd=Symbol(""),Cs=Symbol("attributes"),Vo=Symbol("class"),zo=Symbol("style"),Oa=Symbol("text"),Rs=Symbol("form reset"),rs=new class extends Error{constructor(){super(...arguments);or(this,"name","StaleReactionError");or(this,"message","The reaction that called `getAbortSignal()` was re-run or destroyed")}};var Cc;const Hd=!!((Cc=globalThis.document)!=null&&Cc.contentType)&&globalThis.document.contentType.includes("xml"),Vd=1,zd=2,Fc=4,Wd=8,jd=16,qd=1,Gd=4,Kd=8,Jd=16,Yd=1,Xd=2,$c={},dt=Symbol("uninitialized"),Bc="http://www.w3.org/1999/xhtml",Qd="http://www.w3.org/2000/svg",Zd="http://www.w3.org/1998/Math/MathML";function ef(){console.warn("https://svelte.dev/e/derived_inert")}function tf(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function rf(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}let Hc=!1;function Vc(t){return t===this.v}function nf(t,e){return t!=t?e==e:t!==e||t!==null&&typeof t=="object"||typeof t=="function"}function zc(t){return!nf(t,this.v)}function af(t){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function sf(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function of(t,e,r){throw new Error("https://svelte.dev/e/each_key_duplicate")}function lf(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function cf(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function uf(t){throw new Error("https://svelte.dev/e/effect_orphan")}function df(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function ff(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function hf(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function pf(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function vf(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function _f(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}let gf=!1,Ct=null;function ua(t){Ct=t}function fl(t,e=!1,r){Ct={p:Ct,i:!1,c:null,e:null,s:t,x:null,r:me,l:null}}function hl(t){var e=Ct,r=e.e;if(r!==null){e.e=null;for(var n of r)fu(n)}return e.i=!0,Ct=e.p,pl(t)}function pl(t={}){return Nc(t,Uc,{value:!0}),t}function Wc(){return!0}let ki=[];function jc(){var t=ki;ki=[],Md(t)}function Pn(t){if(ki.length===0&&!$a){var e=ki;queueMicrotask(()=>{e===ki&&jc()})}ki.push(t)}function mf(){for(;ki.length>0;)jc()}const bf=-7169;function Xe(t,e){t.f=t.f&bf|e}function vl(t){(t.f&Wr)!==0||t.deps===null?Xe(t,ft):Xe(t,kr)}function qc(t,e,r){(t.f&et)!==0?e.add(t):(t.f&kr)!==0&&r.add(t),Xe(t,ft)}let Hl=!1;function wf(){Hl||(Hl=!0,document.addEventListener("reset",t=>{Promise.resolve().then(()=>{var e;if(!t.defaultPrevented)for(const r of t.target.elements)(e=r[Rs])==null||e.call(r)})},{capture:!0}))}function ma(t){var e=fe,r=me;Tr(null),dn(null);try{return t()}finally{Tr(e),dn(r)}}function _l(t,e,r,n=r){t.addEventListener(e,()=>ma(r));const i=t[Rs];i?t[Rs]=()=>{i(),n(!0)}:t[Rs]=()=>n(!0),wf()}function yf(t,e,r,n){const i=ja;var s=t.filter(m=>!m.settled),o=e.map(i);if(r.length===0&&s.length===0){n(o);return}var c=me,u=If(),f=s.length===1?s[0].promise:s.length>1?Promise.all(s.map(m=>m.promise)):null;function v(m){if((c.f&It)===0){u();try{n([...o,...m])}catch(I){an(I,c)}Bs()}}var g=Gc();if(r.length===0){f.then(()=>v([])).finally(g);return}function b(){Promise.all(r.map(m=>Ef(m))).then(v).catch(m=>an(m,c)).finally(g)}f?f.then(()=>{if((c.f&It)!==0){g();return}u(),b(),Bs()}):b()}function If(){var t=me,e=fe,r=Ct,n=z;return function(s=!0){dn(t),Tr(e),ua(r),s&&(t.f&It)===0&&(n==null||n.activate(),n==null||n.apply())}}function Bs(t=!0){dn(null),Tr(null),ua(null),t&&(z==null||z.deactivate())}function Gc(){var t=me,e=t.b,r=z,n=!!(e!=null&&e.is_rendered());return e==null||e.update_pending_count(1,r),r.increment(n,t),()=>{e==null||e.update_pending_count(-1,r),r.decrement(n,t)}}function ja(t){var e=Rt|et;return me!==null&&(me.f|=ga),{ctx:Ct,deps:null,effects:null,equals:Vc,f:e,fn:t,reactions:null,rv:0,v:dt,wv:0,parent:me,ac:null}}const Da=Symbol("obsolete");function Ef(t,e,r){let n=me;n===null&&sf();var i=void 0,s=Bi(dt),o=!fe,c=new Set;return Ff(()=>{var m,I;var u=me,f=Dc();i=f.promise;try{Promise.resolve(t()).then(f.resolve,R=>{R!==rs&&f.reject(R)}).finally(Bs)}catch(R){f.reject(R),Bs()}var v=z;if(o){if((u.f&_a)!==0)var g=Gc();if((m=n.b)!=null&&m.is_rendered())(I=v.async_deriveds.get(u))==null||I.reject(Da);else for(const R of c.values())R.reject(Da);c.add(f),v.async_deriveds.set(u,f)}const b=(R,S=void 0)=>{g==null||g(),c.delete(f),S!==Da&&(v.activate(),S?(s.f|=ti,da(s,S)):((s.f&ti)!==0&&(s.f^=ti),da(s,R)),v.deactivate())};f.promise.then(b,R=>b(null,R||"unknown"))}),yl(()=>{for(const u of c)u.reject(Da)}),new Promise(u=>{function f(v){function g(){v===i?u(s):f(i)}v.then(g,g)}f(i)})}function Ft(t){const e=ja(t);return mu(e),e}function Kc(t){const e=ja(t);return e.equals=zc,e}function Sf(t){var e=t.effects;if(e!==null){t.effects=null;for(var r=0;r<e.length;r+=1)Xt(e[r])}}function gl(t){var e,r=me,n=t.parent;if(!Mn&&n!==null&&t.v!==dt&&(n.f&(It|$t))!==0)return ef(),t.v;dn(n);try{Sf(t),e=Iu(t)}finally{dn(r)}return e}function Jc(t){var e=gl(t);if(!t.equals(e)&&(t.wv=wu(),(!(z!=null&&z.is_fork)||t.deps===null)&&(z!==null?(z.capture(t,e,!0),ri==null||ri.capture(t,e,!0)):t.v=e,t.deps===null))){Xe(t,ft);return}Mn||(yt!==null?(wl()||z!=null&&z.is_fork)&&yt.set(t,e):vl(t))}function kf(t){var e;if(t.effects!==null)for(const r of t.effects)(r.teardown||r.ac)&&((e=r.teardown)==null||e.call(r),r.ac!==null&&ma(()=>{r.ac.abort(rs),r.ac=null}),r.fn!==null&&(r.teardown=Ld),qa(r,0),El(r))}function Yc(t){if(t.effects!==null)for(const e of t.effects)e.teardown&&e.fn!==null&&fa(e)}let Io=null,qi=null,z=null,ri=null,yt=null,Wo=null,$a=!1,Eo=!1,Ba=null,Ps=null;var Vl=0;let Tf=1;var ta,Zn,Ri,ra,na,ia,Tn,aa,ur,Xa,An,$r,tn,sa,Pi,be,jo,qo,La,Go,Xc,Qc,Gi,Af,Ma;const Qs=class Qs{constructor(){se(this,be);or(this,"id",Tf++);se(this,ta,!1);or(this,"linked",!0);se(this,Zn,null);se(this,Ri,null);or(this,"async_deriveds",new Map);or(this,"current",new Map);or(this,"previous",new Map);se(this,ra,new Set);se(this,na,new Set);se(this,ia,0);se(this,Tn,new Map);se(this,aa,null);se(this,ur,[]);se(this,Xa,[]);se(this,An,new Set);se(this,$r,new Set);se(this,tn,new Map);se(this,sa,new Set);or(this,"is_fork",!1);se(this,Pi,!1);qi===null?Io=qi=this:(te(qi,Ri,this),te(this,Zn,qi)),qi=this}skip_effect(e){p(this,tn).has(e)||p(this,tn).set(e,{d:[],m:[]}),p(this,sa).delete(e)}unskip_effect(e,r=n=>this.schedule(n)){var n=p(this,tn).get(e);if(n){p(this,tn).delete(e);for(var i of n.d)Xe(i,et),r(i);for(i of n.m)Xe(i,kr),r(i)}p(this,sa).add(e)}capture(e,r,n=!1){e.v!==dt&&!this.previous.has(e)&&this.previous.set(e,e.v),(e.f&ti)===0&&(this.current.set(e,[r,n]),yt==null||yt.set(e,r)),this.is_fork||(e.v=r)}activate(){z=this}deactivate(){z=null,yt=null}flush(){try{Eo=!0,z=this,re(this,be,La).call(this)}finally{Vl=0,Wo=null,Ba=null,Ps=null,Eo=!1,z=null,yt=null,ln.clear()}}discard(){var e;for(const r of p(this,na))r(this);p(this,na).clear();for(const r of this.async_deriveds.values())r.reject(Da);re(this,be,Ma).call(this),(e=p(this,aa))==null||e.resolve()}register_created_effect(e){p(this,Xa).push(e)}increment(e,r){if(te(this,ia,p(this,ia)+1),e){let n=p(this,Tn).get(r)??0;p(this,Tn).set(r,n+1)}}decrement(e,r){if(te(this,ia,p(this,ia)-1),e){let n=p(this,Tn).get(r)??0;n===1?p(this,Tn).delete(r):p(this,Tn).set(r,n-1)}p(this,Pi)||(te(this,Pi,!0),Pn(()=>{te(this,Pi,!1),this.linked&&this.flush()}))}transfer_effects(e,r){for(const n of e)p(this,An).add(n);for(const n of r)p(this,$r).add(n);e.clear(),r.clear()}oncommit(e){p(this,ra).add(e)}ondiscard(e){p(this,na).add(e)}settled(){return(p(this,aa)??te(this,aa,Dc())).promise}static ensure(){if(z===null){const e=z=new Qs;!Eo&&!$a&&Pn(()=>{p(e,ta)||e.flush()})}return z}apply(){{yt=null;return}}schedule(e){var r;if(Wo=e,(r=e.b)!=null&&r.is_pending&&(e.f&(la|no|Lc))!==0&&(e.f&_a)===0){e.b.defer_effect(e);return}p(this,ur).push(e)}};ta=new WeakMap,Zn=new WeakMap,Ri=new WeakMap,ra=new WeakMap,na=new WeakMap,ia=new WeakMap,Tn=new WeakMap,aa=new WeakMap,ur=new WeakMap,Xa=new WeakMap,An=new WeakMap,$r=new WeakMap,tn=new WeakMap,sa=new WeakMap,Pi=new WeakMap,be=new WeakSet,jo=function(){if(this.is_fork)return!0;for(const n of p(this,Tn).keys()){for(var e=n,r=!1;e.parent!==null;){if(p(this,tn).has(e)){r=!0;break}e=e.parent}if(!r)return!0}return!1},qo=function(){var e=[];for(const s of p(this,ur))if(!((s.f&It)!==0||(s.f&(et|kr))===0)){for(var r=s,n=!1;r.parent!==null;){r=r.parent;var i=r.f;if((i&(ii|qr))!==0){if((i&ft)===0){n=!0;break}r.f^=ft}}n||e.push(r)}return te(this,ur,[]),e},La=function(){var c,u,f,v;te(this,ta,!0);for(const g of p(this,An))p(this,$r).delete(g),Xe(g,et),this.schedule(g);for(const g of p(this,$r))Xe(g,kr),this.schedule(g);this.apply();for(var e=Ba=[],r=[],n=Ps=[];p(this,ur).length>0;){Vl++>1e3&&(re(this,be,Ma).call(this),Rf());for(const g of re(this,be,qo).call(this))try{re(this,be,Go).call(this,g,e,r)}catch(b){throw tu(g),re(this,be,jo).call(this)||this.discard(),b}}if(z=null,n.length>0){var i=Qs.ensure();for(const g of n)i.schedule(g)}if(Ba=null,Ps=null,re(this,be,jo).call(this)){re(this,be,Gi).call(this,r),re(this,be,Gi).call(this,e);for(const[g,b]of p(this,tn))eu(g,b);n.length>0&&re(c=z,be,La).call(c);return}const s=re(this,be,Xc).call(this);if(s){re(this,be,Gi).call(this,r),re(this,be,Gi).call(this,e),re(u=s,be,Qc).call(u,this);return}p(this,An).clear(),p(this,$r).clear();for(const g of p(this,ra))g(this);p(this,ra).clear(),ri=this,zl(r),zl(e),ri=null,(f=p(this,aa))==null||f.resolve();var o=z;if(p(this,ia)===0&&(p(this,ur).length===0||o!==null)&&re(this,be,Ma).call(this),p(this,ur).length>0)if(o!==null){for(const g of p(this,ur))p(o,ur).push(g);te(this,ur,[])}else o=this;o!==null&&(ln.clear(),re(v=o,be,La).call(v))},Go=function(e,r,n){e.f^=ft;for(var i=e.first;i!==null;){var s=i.f,o=(s&(qr|ii))!==0,c=o&&(s&ft)!==0,u=c||(s&$t)!==0||p(this,tn).has(i);if(!u&&i.fn!==null){o?i.f^=ft:(s&la)!==0?r.push(i):as(i)&&((s&Hr)!==0&&p(this,$r).add(i),fa(i));var f=i.first;if(f!==null){i=f;continue}}for(;i!==null;){var v=i.next;if(v!==null){i=v;break}i=i.parent}}},Xc=function(){for(var e=p(this,Zn);e!==null;){if(!e.is_fork){for(const[r,[,n]]of this.current)if(e.current.has(r)&&!n)return e}e=p(e,Zn)}return null},Qc=function(e){var n;for(const[i,s]of e.current)!this.previous.has(i)&&e.previous.has(i)&&this.previous.set(i,e.previous.get(i)),this.current.set(i,s);for(const[i,s]of e.async_deriveds){const o=this.async_deriveds.get(i);o&&s.promise.then(o.resolve).catch(o.reject)}e.async_deriveds.clear(),this.transfer_effects(p(e,An),p(e,$r));const r=i=>{var s=i.reactions;if(s!==null&&!((i.f&Rt)!==0&&(i.f&(et|kr))===0))for(const u of s){var o=u.f;if((o&Rt)!==0)r(u);else{var c=u;o&(Ji|Hr)&&!this.async_deriveds.has(c)&&(p(this,$r).delete(c),Xe(c,et),this.schedule(c))}}};for(const i of this.current.keys())r(i);this.oncommit(()=>e.discard()),re(n=e,be,Ma).call(n),z=this,re(this,be,La).call(this)},Gi=function(e){for(var r=0;r<e.length;r+=1)qc(e[r],p(this,An),p(this,$r))},Af=function(){var g,b;for(let m=Io;m!==null;m=p(m,Ri)){var e=m.id<this.id,r=[];for(const[I,[R,S]]of this.current){if(m.current.has(I)){var n=m.current.get(I)[0];if(e&&R!==n)m.current.set(I,[R,S]);else continue}r.push(I)}if(e)for(const[I,R]of this.async_deriveds){const S=m.async_deriveds.get(I);S&&R.promise.then(S.resolve).catch(S.reject)}var i=[...m.current.keys()].filter(I=>!m.current.get(I)[1]);if(!(!p(m,ta)||i.length===0)){var s=i.filter(I=>!this.current.has(I));if(s.length===0)e&&m.discard();else if(r.length>0){if(e)for(const I of p(this,sa))m.unskip_effect(I,R=>{var S;(R.f&(Hr|Ji))!==0?m.schedule(R):re(S=m,be,Gi).call(S,[R])});m.activate();var o=new Set,c=new Map;for(var u of r)Zc(u,s,o,c);c=new Map;var f=[...m.current].filter(([I,R])=>{const S=this.current.get(I);return S?S[0]!==R[0]||S[1]!==R[1]:!0}).map(([I])=>I);if(f.length>0)for(const I of p(this,Xa))(I.f&(It|$t|Fs))===0&&ml(I,f,c)&&((I.f&(Ji|Hr))!==0?(Xe(I,et),m.schedule(I)):p(m,An).add(I));if(p(m,ur).length>0&&!p(m,Pi)){m.apply();for(var v of re(g=m,be,qo).call(g))re(b=m,be,Go).call(b,v,[],[])}m.deactivate()}}}},Ma=function(){if(this.linked){var e=p(this,Zn),r=p(this,Ri);e===null?Io=r:te(e,Ri,r),r===null?qi=e:te(r,Zn,e),this.linked=!1}};let $i=Qs;function Cf(t){var e=$a,r=ri;ri=null,$a=!0;try{for(var n;;){if(mf(),z===null)return n;z.flush()}}finally{$a=e,ri=r}}function Rf(){try{df()}catch(t){an(t,Wo)}}let Fr=null;function zl(t){var e=t.length;if(e!==0){for(var r=0;r<e;){var n=t[r++];if((n.f&(It|$t))===0&&as(n)&&(Fr=new Set,fa(n),n.deps===null&&n.first===null&&n.nodes===null&&n.teardown===null&&n.ac===null&&vu(n),(Fr==null?void 0:Fr.size)>0)){ln.clear();for(const i of Fr){if((i.f&(It|$t))!==0)continue;const s=[i];let o=i.parent;for(;o!==null;)Fr.has(o)&&(Fr.delete(o),s.push(o)),o=o.parent;for(let c=s.length-1;c>=0;c--){const u=s[c];(u.f&(It|$t))===0&&fa(u)}}Fr.clear()}}Fr=null}}function Zc(t,e,r,n){if(!r.has(t)&&(r.add(t),t.reactions!==null))for(const i of t.reactions){const s=i.f;(s&Rt)!==0?Zc(i,e,r,n):(s&(Ji|Hr))!==0&&(s&et)===0&&ml(i,e,n)&&(Xe(i,et),bl(i))}}function ml(t,e,r){const n=r.get(t);if(n!==void 0)return n;if(t.deps!==null)for(const i of t.deps){if(za.call(e,i))return!0;if((i.f&Rt)!==0&&ml(i,e,r))return r.set(i,!0),!0}return r.set(t,!1),!1}function bl(t){z.schedule(t)}function eu(t,e){if(!((t.f&qr)!==0&&(t.f&ft)!==0)){(t.f&et)!==0?e.d.push(t):(t.f&kr)!==0&&e.m.push(t),Xe(t,ft);for(var r=t.first;r!==null;)eu(r,e),r=r.next}}function tu(t){Xe(t,ft);for(var e=t.first;e!==null;)tu(e),e=e.next}let Hs=new Set;const ln=new Map;let ru=!1;function Bi(t,e){var r={f:0,v:t,reactions:null,equals:Vc,rv:0,wv:0};return r}function x(t,e){const r=Bi(t);return mu(r),r}function Pf(t,e=!1,r=!0){const n=Bi(t);return e||(n.equals=zc),n}function d(t,e,r=!1){fe!==null&&(!Vr||(fe.f&Fs)!==0)&&Wc()&&(fe.f&(Rt|Hr|Ji|Fs))!==0&&(cn===null||!cn.has(t))&&vf();let n=r?_r(e):e;return da(t,n,Ps)}var Ei=null,Ko=0;function da(t,e,r=null){if(!t.equals(e)){Mn?ln.set(t,e):ln.has(t)||ln.set(t,t.v);var n=$i.ensure();if(n.capture(t,e),(t.f&Rt)!==0){const i=t;(t.f&et)!==0&&gl(i),yt===null&&vl(i)}t.wv=wu(),Ei=null,Ko=0,nu(t,et,r),Ei=null,me!==null&&(me.f&ft)!==0&&(me.f&(qr|ii))===0&&(Ir===null?Bf([t]):Ir.push(t)),!n.is_fork&&Hs.size>0&&!ru&&xf()}return e}function xf(){ru=!1;for(const t of Hs){(t.f&ft)!==0&&Xe(t,kr);let e;try{e=as(t)}catch{e=!0}e&&fa(t)}Hs.clear()}function Ha(t){d(t,t.v+1)}function nu(t,e,r){var n=t.reactions;if(n!==null){var i=n.length;if(Ko+=i,Ko>1e5&&Ei===null&&(Ei=new Set),Ei!==null){if(Ei.has(t))return;Ei.add(t)}for(var s=0;s<i;s++){var o=n[s],c=o.f,u=(c&et)===0;if(u&&Xe(o,e),(c&Fs)!==0)Hs.add(o);else if((c&Rt)!==0){var f=o;yt==null||yt.delete(f),nu(f,kr,r)}else if(u){var v=o;(c&Hr)!==0&&Fr!==null&&Fr.add(v),r!==null?r.push(v):bl(v)}}}}function _r(t){if(typeof t!="object"||t===null||Di in t||Uc in t)return t;const e=Oc(t);if(e!==Od&&e!==Dd)return t;var r=new Map,n=to(t),i=x(0),s=Mi,o=c=>{if(Mi===s)return c();var u=fe,f=Mi;Tr(null),ql(s);var v=c();return Tr(u),ql(f),v};return n&&r.set("length",x(t.length)),new Proxy(t,{defineProperty(c,u,f){(!("value"in f)||f.configurable===!1||f.enumerable===!1||f.writable===!1)&&hf();var v=r.get(u);return v===void 0?o(()=>{var g=x(f.value);return r.set(u,g),g}):d(v,f.value,!0),!0},deleteProperty(c,u){var f=r.get(u);if(f===void 0){if(u in c){const v=o(()=>x(dt));r.set(u,v),Ha(i)}}else d(f,dt),Ha(i);return!0},get(c,u,f){var m;if(u===Di)return t;var v=r.get(u),g=u in c;if(v===void 0&&(!g||(m=Ki(c,u))!=null&&m.writable)&&(v=o(()=>{var I=_r(g?c[u]:dt),R=x(I);return R}),r.set(u,v)),v!==void 0){var b=a(v);return b===dt?void 0:b}return Reflect.get(c,u,f)},getOwnPropertyDescriptor(c,u){var b;(b=this.has)==null||b.call(this,c,u);var f=Reflect.getOwnPropertyDescriptor(c,u),v=r.get(u);if(v!==void 0){var g=a(v);if(g===dt)return;if(f&&"value"in f)f.value=g;else return{enumerable:!0,configurable:!0,value:g,writable:!0}}return f},has(c,u){var b;if(u===Di)return!0;var f=r.get(u),v=f!==void 0&&f.v!==dt||Reflect.has(c,u);if(f!==void 0||me!==null&&(!v||(b=Ki(c,u))!=null&&b.writable)){f===void 0&&(f=o(()=>{var m=v?_r(c[u]):dt,I=x(m);return I}),r.set(u,f));var g=a(f);if(g===dt)return!1}return v},set(c,u,f,v){var M;var g=r.get(u),b=u in c;if(n&&u==="length")for(var m=f;m<g.v;m+=1){var I=r.get(m+"");I!==void 0?d(I,dt):m in c&&(I=o(()=>x(dt)),r.set(m+"",I))}if(g===void 0)(!b||(M=Ki(c,u))!=null&&M.writable)&&(g=o(()=>x(void 0)),d(g,_r(f)),r.set(u,g));else{b=g.v!==dt;var R=o(()=>_r(f));d(g,R)}var S=Reflect.getOwnPropertyDescriptor(c,u);if(S!=null&&S.set&&S.set.call(v,f),!b){if(n&&typeof u=="string"){var N=r.get("length"),j=Number(u);Number.isInteger(j)&&j>=N.v&&d(N,j+1)}Ha(i)}return!0},ownKeys(c){a(i);var u=Reflect.ownKeys(c).filter(g=>{var b=r.get(g);return b===void 0||b.v!==dt});for(var[f,v]of r)v.v!==dt&&!(f in c)&&u.push(f);return u},setPrototypeOf(){pf()}})}function Wl(t){try{if(t!==null&&typeof t=="object"&&Di in t)return t[Di]}catch{}return t}function iu(t,e){return Object.is(Wl(t),Wl(e))}var Jo,au,su,ou,lu;function Nf(){if(Jo===void 0){Jo=window,au=document,su=/Firefox/.test(navigator.userAgent);var t=Element.prototype,e=Node.prototype,r=Text.prototype;ou=Ki(e,"firstChild").get,lu=Ki(e,"nextSibling").get,Bl(t)&&(t[Vo]=void 0,t[Cs]=null,t[zo]=void 0,t.__e=void 0),Bl(r)&&(r[Oa]=void 0)}}function Ln(t=""){return document.createTextNode(t)}function xn(t){return ou.call(t)}function ns(t){return lu.call(t)}function h(t,e){return xn(t)}function Ye(t,e=!1){{var r=xn(t);return r instanceof Comment&&r.data===""?ns(r):r}}function E(t,e=!1){return xn(t)}function l(t,e=1,r=!1){let n=t;for(;e--;)n=ns(n);return n}function Of(t){t.textContent=""}function cu(){return!1}function uu(t,e,r){return e==null||e===Bc?r?document.createElement(t,{is:r}):document.createElement(t):r?document.createElementNS(e,t,{is:r}):document.createElementNS(e,t)}function Df(t){var e=me;if(e===null)return fe.f|=ti,t;if((e.f&_a)===0&&(e.f&la)===0)throw t;an(t,e)}function an(t,e){if(t===$c)throw t;if(!(e!==null&&(e.f&It)!==0)){for(;e!==null;){if((e.f&Ho)!==0&&(e.f&(It|Wa))===0){if((e.f&_a)===0)throw t;try{e.b.error(t);return}catch(r){t=r}}e=e.parent}throw t}}function Lf(t){me===null&&(fe===null&&uf(),cf()),Mn&&lf()}function Mf(t,e){var r=e.last;r===null?e.last=e.first=t:(r.next=t,t.prev=r,e.last=t)}function $n(t,e){var r=me;r!==null&&(r.f&$t)!==0&&(t|=$t);var n={ctx:Ct,deps:null,nodes:null,f:t|et|Wr,first:null,fn:e,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,wv:0,ac:null};z==null||z.register_created_effect(n);var i=n;if((t&la)!==0)Ba!==null?Ba.push(n):$i.ensure().schedule(n);else if(e!==null){try{fa(n)}catch(o){throw Xt(n),o}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&ga)===0&&(i=i.first,(t&Hr)!==0&&(t&ca)!==0&&i!==null&&(i.f|=ca))}if(i!==null&&(i.parent=r,r!==null&&Mf(i,r),fe!==null&&(fe.f&Rt)!==0&&(t&ii)===0)){var s=fe;(s.effects??(s.effects=[])).push(i)}return n}function wl(){return fe!==null&&!Vr}function yl(t){const e=$n(no,null);return Xe(e,ft),e.teardown=t,e}function du(t){Lf();var e=me.f,r=!fe&&(e&qr)!==0&&Ct!==null&&!Ct.i;if(r){var n=Ct;(n.e??(n.e=[])).push(t)}else return fu(t)}function fu(t){return $n(la|Fd,t)}function Uf(t){$i.ensure();const e=$n(ii|ga,t);return(r={})=>new Promise(n=>{r.outro?Li(e,()=>{Xt(e),n(void 0)}):(Xt(e),n(void 0))})}function Il(t){return $n(la,t)}function Ff(t){return $n(Ji|ga,t)}function io(t,e=0){return $n(no|e,t)}function $(t,e=[],r=[],n=[]){yf(n,e,r,i=>{$n(no,()=>{t(...i.map(a))})})}function is(t,e=0){var r=$n(Hr|e,t);return r}function vr(t){return $n(qr|ga,t)}function hu(t){var e=t.teardown;if(e!==null){const r=Mn,n=fe;jl(!0),Tr(null);try{e.call(null)}catch(i){an(i,t.parent)}finally{jl(r),Tr(n)}}}function El(t,e=!1){var r=t.first;for(t.first=t.last=null;r!==null;){const i=r.ac;i!==null&&ma(()=>{i.abort(rs)});var n=r.next;(r.f&ii)!==0?r.parent=null:Xt(r,e),r=n}}function $f(t){for(var e=t.first;e!==null;){var r=e.next;(e.f&qr)===0&&Xt(e),e=r}}function Xt(t,e=!0){var r=!1;(e||(t.f&Mc)!==0)&&t.nodes!==null&&t.nodes.end!==null&&(pu(t.nodes.start,t.nodes.end),r=!0),t.f|=Wa,El(t,e&&!r),qa(t,0);var n=t.nodes&&t.nodes.t;if(n!==null)for(const s of n)s.stop();hu(t),t.f^=Wa,t.f|=It;var i=t.parent;i!==null&&i.first!==null&&vu(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes=t.ac=t.b=null}function pu(t,e){for(;t!==null;){var r=t===e?null:ns(t);t.remove(),t=r}}function vu(t){var e=t.parent,r=t.prev,n=t.next;r!==null&&(r.next=n),n!==null&&(n.prev=r),e!==null&&(e.first===t&&(e.first=n),e.last===t&&(e.last=r))}function Li(t,e,r=!0){var n=[];t.f|=dl,_u(t,n,!0);var i=()=>{r&&Xt(t),e&&e()},s=n.length;if(s>0){var o=()=>--s||i();for(var c of n)c.out(o)}else i()}function _u(t,e,r){if((t.f&$t)===0){t.f^=$t;var n=t.nodes&&t.nodes.t;if(n!==null)for(const c of n)(c.is_global||r)&&e.push(c);for(var i=t.first;i!==null;){var s=i.next;if((i.f&ii)===0){var o=(i.f&ca)!==0||(i.f&qr)!==0&&(t.f&Hr)!==0;_u(i,e,o?r:!1)}i=s}}}function Vs(t){t.f&=~dl,gu(t,!0)}function gu(t,e){if((t.f&dl)===0&&(t.f&$t)!==0){t.f^=$t,(t.f&ft)===0&&(Xe(t,et),$i.ensure().schedule(t));for(var r=t.first;r!==null;){var n=r.next,i=(r.f&ca)!==0||(r.f&qr)!==0;gu(r,i?e:!1),r=n}var s=t.nodes&&t.nodes.t;if(s!==null)for(const o of s)(o.is_global||e)&&o.in()}}function Sl(t,e){if(t.nodes)for(var r=t.nodes.start,n=t.nodes.end;r!==null;){var i=r===n?null:ns(r);e.append(r),r=i}}let Mn=!1;function jl(t){Mn=t}let fe=null,Vr=!1;function Tr(t){fe=t}let me=null;function dn(t){me=t}let cn=null;function mu(t){fe!==null&&((fe.f&$s)!==0||(fe.f&Rt)!==0)&&(cn??(cn=new Set)).add(t)}let Yt=null,pr=0,Ir=null;function Bf(t){Ir=t}let bu=1,Ti=0,Mi=Ti;function ql(t){Mi=t}function wu(){return++bu}function as(t){var e=t.f;if((e&et)!==0)return!0;if((e&kr)!==0){for(var r=t.deps,n=r.length,i=0;i<n;i++){var s=r[i];if(as(s)&&Jc(s),s.wv>t.wv)return!0}(e&Wr)!==0&&yt===null&&Xe(t,ft)}return!1}function yu(t,e,r=!0){var n=t.reactions;if(n!==null&&!(cn!==null&&cn.has(t)))for(var i=0;i<n.length;i++){var s=n[i];(s.f&Rt)!==0?yu(s,e,!1):e===s&&(r?Xe(s,et):(s.f&ft)!==0&&Xe(s,kr),bl(s))}}function Iu(t){var e=Yt,r=pr,n=Ir,i=fe,s=cn,o=Ct,c=Vr,u=Mi,f=t.f;Yt=null,pr=0,Ir=null,fe=(f&(qr|ii))===0?t:null,cn=null,ua(t.ctx),Vr=!1,Mi=++Ti,t.ac!==null&&(ma(()=>{t.ac.abort(rs)}),t.ac=null);try{t.f|=$s;var v=t.fn,g=v();t.f|=_a;var b=Gl(t);if(Wc()&&Ir!==null&&!Vr&&b!==null&&(t.f&(Rt|kr|et))===0)for(var m=0;m<Ir.length;m++)yu(Ir[m],t);if(i!==null&&i!==t){if(Ti++,i.deps!==null)for(let I=0;I<r;I+=1)i.deps[I].rv=Ti;if(e!==null)for(const I of e)I.rv=Ti;Ir!==null&&(n===null?n=Ir:n.push(...Ir))}return(t.f&ti)!==0&&(t.f^=ti),g}catch(I){return Gl(t),Df(I)}finally{t.f^=$s,Yt=e,pr=r,Ir=n,fe=i,cn=s,ua(o),Vr=c,Mi=u}}function Gl(t){var i;var e=t.deps,r=z==null?void 0:z.is_fork;if(Yt!==null){var n;if(r||qa(t,pr),e!==null&&pr>0)for(e.length=pr+Yt.length,n=0;n<Yt.length;n++)e[pr+n]=Yt[n];else t.deps=e=Yt;if(wl()&&(t.f&Wr)!==0)for(n=pr;n<e.length;n++)((i=e[n]).reactions??(i.reactions=[])).push(t)}else!r&&e!==null&&pr<e.length&&(qa(t,pr),e.length=pr);return e}function Hf(t,e){let r=e.reactions;if(r!==null){var n=xd.call(r,t);if(n!==-1){var i=r.length-1;i===0?r=e.reactions=null:(r[n]=r[i],r.pop())}}if(r===null&&(e.f&Rt)!==0&&(Yt===null||!za.call(Yt,e))){var s=e;(s.f&Wr)!==0&&(s.f^=Wr),s.v!==dt&&vl(s),s.ac!==null&&ma(()=>{s.ac.abort(rs),s.ac=null,Xe(s,et)}),kf(s),qa(s,0)}}function qa(t,e){var r=t.deps;if(r!==null)for(var n=e;n<r.length;n++)Hf(t,r[n])}function fa(t){var e=t.f;if((e&It)===0){Xe(t,ft);var r=me;me=t;try{(e&(Hr|Lc))!==0?$f(t):El(t),hu(t);var n=Iu(t);t.teardown=typeof n=="function"?n:null,t.wv=bu;var i;xc&&gf&&(t.f&et)!==0&&t.deps}finally{me=r}}}async function Eu(){await Promise.resolve(),Cf()}function a(t){var e=t.f,r=(e&Rt)!==0;if(fe!==null&&!Vr){var n=me!==null&&(me.f&It)!==0;if(!n&&(cn===null||!cn.has(t))){var i=fe.deps;if((fe.f&$s)!==0)t.rv<Ti&&(t.rv=Ti,Yt===null&&i!==null&&i[pr]===t?pr++:Yt===null?Yt=[t]:Yt.push(t));else{fe.deps??(fe.deps=[]),za.call(fe.deps,t)||fe.deps.push(t);var s=t.reactions;s===null?t.reactions=[fe]:za.call(s,fe)||s.push(fe)}}}if(Mn&&ln.has(t))return ln.get(t);if(r){var o=t;if(Mn){var c=o.v;return((o.f&ft)===0&&o.reactions!==null||ku(o))&&(c=gl(o)),ln.set(o,c),c}var u=(o.f&Wr)===0&&!Vr&&fe!==null&&(fe.f&Wr)!==0,f=(o.f&_a)===0;as(o)&&(u&&(o.f|=Wr),Jc(o)),u&&!f&&(Yc(o),Su(o))}if(yt!=null&&yt.has(t))return yt.get(t);if((t.f&ti)!==0)throw t.v;return t.v}function Su(t){if(t.f|=Wr,t.deps!==null)for(const r of t.deps){var e=r.reactions;e===null?r.reactions=[t]:za.call(e,t)||e.push(t),(r.f&Rt)!==0&&(r.f&Wr)===0&&(Yc(r),Su(r))}}function ku(t){if(t.v===dt)return!0;if(t.deps===null)return!1;for(const e of t.deps)if(ln.has(e)||(e.f&Rt)!==0&&ku(e))return!0;return!1}function ba(t){var e=Vr;try{return Vr=!0,t()}finally{Vr=e}}const Vf=["touchstart","touchmove"];function zf(t){return Vf.includes(t)}const Ai=Symbol("events"),Tu=new Set,Yo=new Set;function Wf(t,e,r,n={}){function i(s){if(n.capture||Xo.call(e,s),!s.cancelBubble)return ma(()=>r==null?void 0:r.call(this,s))}return t.startsWith("pointer")||t.startsWith("touch")||t==="wheel"?(i.__removed=!1,Pn(()=>{i.__removed||e.addEventListener(t,i,n)})):e.addEventListener(t,i,n),i}function Si(t,e,r,n,i){var s={capture:n,passive:i},o=Wf(t,e,r,s);(e===document.body||e===window||e===document||e instanceof HTMLMediaElement)&&yl(()=>{o.__removed=!0,e.removeEventListener(t,o,s)})}function P(t,e,r){(e[Ai]??(e[Ai]={}))[t]=r}function Au(t){for(var e=0;e<t.length;e++)Tu.add(t[e]);for(var r of Yo)r(t)}let So=null,ko=!1;function Xo(t){var R,S;var e=this,r=e.ownerDocument,n=t.type,i=((R=t.composedPath)==null?void 0:R.call(t))||[],s=i[0]||t.target;So=t,ko||(ko=!0,setTimeout(()=>{ko=!1,So=null}));var o=0,c=So===t&&t[Ai];if(c){var u=i.indexOf(c);if(u!==-1&&(e===document||e===window)){t[Ai]=e;return}var f=i.indexOf(e);if(f===-1)return;u<=f&&(o=u)}if(s=i[o]||t.target,s!==e){Nc(t,"currentTarget",{configurable:!0,get(){return s||r}});var v=fe,g=me;Tr(null),dn(null);try{for(var b,m=[];s!==null&&s!==e;){try{var I=(S=s[Ai])==null?void 0:S[n];I!=null&&(!s.disabled||t.target===s)&&I.call(s,t)}catch(N){b?m.push(N):b=N}if(t.cancelBubble)break;o++,s=o<i.length?i[o]:null}if(b){for(let N of m)queueMicrotask(()=>{throw N});throw b}}finally{t[Ai]=e,delete t.currentTarget,Tr(v),dn(g)}}}var Rc;const To=((Rc=globalThis==null?void 0:globalThis.window)==null?void 0:Rc.trustedTypes)&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:t=>t});function jf(t){return(To==null?void 0:To.createHTML(t))??t}function qf(t){var e=uu("template");return e.innerHTML=jf(t.replaceAll("<!>","<!---->")),e.content}function Ga(t,e){var r=me;r.nodes===null&&(r.nodes={start:t,end:e,a:null,t:null})}function C(t,e){var r=(e&Yd)!==0,n=(e&Xd)!==0,i,s=!t.startsWith("<!>");return()=>{i===void 0&&(i=qf(s?t:"<!>"+t),r||(i=xn(i)));var o=n||su?document.importNode(i,!0):i.cloneNode(!0);if(r){var c=xn(o),u=o.lastChild;Ga(c,u)}else Ga(o,o);return o}}function Es(){var t=document.createDocumentFragment(),e=document.createComment(""),r=Ln();return t.append(e,r),Ga(e,r),t}function T(t,e){t!==null&&t.before(e)}function Gf(t){let e=0,r=Bi(0),n;return()=>{wl()&&(a(r),io(()=>(e===0&&(n=ba(()=>t(()=>Ha(r)))),e+=1,()=>{Pn(()=>{e-=1,e===0&&(n==null||n(),n=void 0,Ha(r))})})))}}var Kf=ca|ga;function Jf(t,e,r,n){new Yf(t,e,r,n)}var Er,ul,Sr,xi,At,dr,Ut,fr,rn,Ni,ei,oa,Qa,Za,Cn,Zs,ge,Xf,Qf,Qo,Jn,Zf,Zo,Ua,xs,el,tl;class Yf{constructor(e,r,n,i){se(this,ge);or(this,"parent");or(this,"is_pending",!1);or(this,"transform_error");se(this,Er);se(this,ul,null);se(this,Sr);se(this,xi);se(this,At);se(this,dr,null);se(this,Ut,null);se(this,fr,null);se(this,rn,null);se(this,Ni,0);se(this,ei,0);se(this,oa,!1);se(this,Qa,new Set);se(this,Za,new Set);se(this,Cn,null);se(this,Zs,Gf(()=>(te(this,Cn,Bi(p(this,Ni))),()=>{te(this,Cn,null)})));var s;te(this,Er,e),te(this,Sr,r),te(this,xi,o=>{var c=me;c.b=this,c.f|=Ho,n(o)}),this.parent=me.b,this.transform_error=i??((s=this.parent)==null?void 0:s.transform_error)??(o=>o),te(this,At,is(()=>{re(this,ge,Zo).call(this)},Kf))}defer_effect(e){qc(e,p(this,Qa),p(this,Za))}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!p(this,Sr).pending}update_pending_count(e,r){re(this,ge,el).call(this,e,r),te(this,Ni,p(this,Ni)+e),!(!p(this,Cn)||p(this,oa))&&(te(this,oa,!0),Pn(()=>{te(this,oa,!1),p(this,Cn)&&da(p(this,Cn),p(this,Ni))}))}get_effect_pending(){return p(this,Zs).call(this),a(p(this,Cn))}error(e){if(e===$c||!p(this,Sr).onerror&&!p(this,Sr).failed)throw e;z!=null&&z.is_fork?(p(this,dr)&&z.skip_effect(p(this,dr)),p(this,Ut)&&z.skip_effect(p(this,Ut)),p(this,fr)&&z.skip_effect(p(this,fr)),z.oncommit(()=>{re(this,ge,Jn).call(this)||re(this,ge,tl).call(this,e)})):re(this,ge,tl).call(this,e)}}Er=new WeakMap,ul=new WeakMap,Sr=new WeakMap,xi=new WeakMap,At=new WeakMap,dr=new WeakMap,Ut=new WeakMap,fr=new WeakMap,rn=new WeakMap,Ni=new WeakMap,ei=new WeakMap,oa=new WeakMap,Qa=new WeakMap,Za=new WeakMap,Cn=new WeakMap,Zs=new WeakMap,ge=new WeakSet,Xf=function(){try{te(this,dr,vr(()=>p(this,xi).call(this,p(this,Er))))}catch(e){this.error(e)}},Qf=function(e){const r=p(this,Sr).failed,{reset:n,invoke_onerror:i}=re(this,ge,Qo).call(this,e);Pn(i),r&&te(this,fr,vr(()=>{r(p(this,Er),()=>e,()=>n)}))},Qo=function(e){var r=!1,n=!1;const i=()=>{if(!re(this,ge,Jn).call(this)){if(r){rf();return}r=!0,n&&_f(),p(this,fr)!==null&&Li(p(this,fr),()=>{te(this,fr,null)}),re(this,ge,xs).call(this,()=>{re(this,ge,Zo).call(this)})}};return{reset:i,invoke_onerror:()=>{var o,c;if(!re(this,ge,Jn).call(this))try{n=!0,(c=(o=p(this,Sr)).onerror)==null||c.call(o,e,i),n=!1}catch(u){an(u,p(this,At)&&p(this,At).parent)}}}},Jn=function(){return(p(this,At).f&(It|Wa))!==0},Zf=function(){const e=p(this,Sr).pending;e&&(this.is_pending=!0,te(this,Ut,vr(()=>e(p(this,Er)))),Pn(()=>{if(!re(this,ge,Jn).call(this)){var r=te(this,rn,document.createDocumentFragment()),n=Ln(),i=!1;if(r.append(n),te(this,dr,re(this,ge,xs).call(this,()=>{try{return vr(()=>p(this,xi).call(this,n))}catch(s){try{this.error(s),i=!0}catch(o){an(o,p(this,At).parent)}return null}})),p(this,dr)===null){te(this,rn,null),i&&re(this,ge,Ua).call(this,z);return}p(this,ei)===0&&(p(this,Er).before(r),te(this,rn,null),Li(p(this,Ut),()=>{te(this,Ut,null)}),re(this,ge,Ua).call(this,z))}}))},Zo=function(){try{if(this.is_pending=this.has_pending_snippet(),te(this,ei,0),te(this,Ni,0),te(this,dr,vr(()=>{p(this,xi).call(this,p(this,Er))})),p(this,ei)>0){var e=te(this,rn,document.createDocumentFragment());Sl(p(this,dr),e);const r=p(this,Sr).pending;te(this,Ut,vr(()=>r(p(this,Er))))}else re(this,ge,Ua).call(this,z)}catch(r){this.error(r)}},Ua=function(e){this.is_pending=!1,e.transfer_effects(p(this,Qa),p(this,Za))},xs=function(e){var r=me,n=fe,i=Ct;dn(p(this,At)),Tr(p(this,At)),ua(p(this,At).ctx);try{return $i.ensure(),e()}finally{dn(r),Tr(n),ua(i)}},el=function(e,r){var n;if(!this.has_pending_snippet()){this.parent&&re(n=this.parent,ge,el).call(n,e,r);return}te(this,ei,p(this,ei)+e),p(this,ei)===0&&(re(this,ge,Ua).call(this,r),p(this,Ut)&&Li(p(this,Ut),()=>{te(this,Ut,null)}),p(this,rn)&&(p(this,Er).before(p(this,rn)),te(this,rn,null)))},tl=function(e){p(this,dr)&&(Xt(p(this,dr)),te(this,dr,null)),p(this,Ut)&&(Xt(p(this,Ut)),te(this,Ut,null)),p(this,fr)&&(Xt(p(this,fr)),te(this,fr,null));let r=p(this,Sr).failed;const n=i=>{if(re(this,ge,Jn).call(this))return;const{reset:s,invoke_onerror:o}=re(this,ge,Qo).call(this,i);o(),r&&!re(this,ge,Jn).call(this)&&te(this,fr,re(this,ge,xs).call(this,()=>{try{return vr(()=>{var c=me;c.b=this,c.f|=Ho,r(p(this,Er),()=>i,()=>s)})}catch(c){return an(c,p(this,At).parent),null}}))};Pn(()=>{if(!re(this,ge,Jn).call(this)){var i;try{i=this.transform_error(e)}catch(s){an(s,p(this,At)&&p(this,At).parent);return}i!==null&&typeof i=="object"&&typeof i.then=="function"?i.then(n,s=>an(s,p(this,At)&&p(this,At).parent)):n(i)}})};function y(t,e){var r=e==null?"":typeof e=="object"?`${e}`:e;r!==(t[Oa]??(t[Oa]=t.nodeValue))&&(t[Oa]=r,t.nodeValue=`${r}`)}function eh(t,e){return th(t,e)}const Ss=new Map;function th(t,{target:e,anchor:r,props:n={},events:i,context:s,intro:o=!0,transformError:c}){Nf();var u=void 0,f=Uf(()=>{var v=r??e.appendChild(Ln());Jf(v,{pending:()=>{}},m=>{fl({});var I=Ct;s&&(I.c=s),i&&(n.$$events=i),u=t(m,n)||pl(),hl()},c);var g=new Set,b=m=>{for(var I=0;I<m.length;I++){var R=m[I];if(!g.has(R)){g.add(R);var S=zf(R);for(const M of[e,document]){var N=Ss.get(M);N===void 0&&(N=new Map,Ss.set(M,N));var j=N.get(R);j===void 0?(M.addEventListener(R,Xo,{passive:S}),N.set(R,1)):N.set(R,j+1)}}}};return b(ro(Tu)),Yo.add(b),()=>{var S;for(var m of g)for(const N of[e,document]){var I=Ss.get(N),R=I.get(m);--R==0?(N.removeEventListener(m,Xo),I.delete(m),I.size===0&&Ss.delete(N)):I.set(m,R)}Yo.delete(b),v!==r&&((S=v.parentNode)==null||S.removeChild(v))}});return rh.set(u,f),u}let rh=new WeakMap;var Br,nn,hr,Oi,es,ts,eo;class Cu{constructor(e,r=!0){or(this,"anchor");se(this,Br,new Map);se(this,nn,new Map);se(this,hr,new Map);se(this,Oi,new Set);se(this,es,!0);se(this,ts,e=>{if(p(this,Br).has(e)){var r=p(this,Br).get(e),n=p(this,nn).get(r);if(n)Vs(n),p(this,Oi).delete(r);else{var i=p(this,hr).get(r);i&&(Vs(i.effect),p(this,nn).set(r,i.effect),p(this,hr).delete(r),i.fragment.lastChild.remove(),this.anchor.before(i.fragment),n=i.effect)}for(const[s,o]of p(this,Br)){if(p(this,Br).delete(s),s===e)break;const c=p(this,hr).get(o);c&&(Xt(c.effect),p(this,hr).delete(o))}for(const[s,o]of p(this,nn)){if(s===r||p(this,Oi).has(s))continue;const c=()=>{if(Array.from(p(this,Br).values()).includes(s)){var f=document.createDocumentFragment();Sl(o,f),f.append(Ln()),p(this,hr).set(s,{effect:o,fragment:f})}else Xt(o);p(this,Oi).delete(s),p(this,nn).delete(s)};p(this,es)||!n?(p(this,Oi).add(s),Li(o,c,!1)):c()}}});se(this,eo,e=>{p(this,Br).delete(e);const r=Array.from(p(this,Br).values());for(const[n,i]of p(this,hr))r.includes(n)||(Xt(i.effect),p(this,hr).delete(n))});this.anchor=e,te(this,es,r)}ensure(e,r){var n=z,i=cu();if(r&&!p(this,nn).has(e)&&!p(this,hr).has(e))if(i){var s=document.createDocumentFragment(),o=Ln();s.append(o),p(this,hr).set(e,{effect:vr(()=>r(o)),fragment:s})}else p(this,nn).set(e,vr(()=>r(this.anchor)));if(p(this,Br).set(n,e),i){for(const[c,u]of p(this,nn))c===e?n.unskip_effect(u):n.skip_effect(u);for(const[c,u]of p(this,hr))c===e?n.unskip_effect(u.effect):n.skip_effect(u.effect);n.oncommit(p(this,ts)),n.ondiscard(p(this,eo))}else p(this,ts).call(this,n)}}Br=new WeakMap,nn=new WeakMap,hr=new WeakMap,Oi=new WeakMap,es=new WeakMap,ts=new WeakMap,eo=new WeakMap;function ce(t,e,r=!1){var n=new Cu(t),i=r?ca:0;function s(o,c){n.ensure(o,c)}is(()=>{var o=!1;e((c,u=0)=>{o=!0,s(u,c)}),o||s(-1,null)},i)}const nh=Symbol("NaN");function ih(t,e,r){var n=new Cu(t);is(()=>{var i=e();i!==i&&(i=nh),n.ensure(i,r)})}function Yi(t,e){return e}function ah(t,e,r){for(var n=[],i=e.length,s,o=e.length,c=0;c<i;c++){let g=e[c];Li(g,()=>{if(s){if(s.pending.delete(g),s.done.add(g),s.pending.size===0){var b=t.outrogroups;rl(t,ro(s.done)),b.delete(s),b.size===0&&(t.outrogroups=null)}}else o-=1},!1)}if(o===0){var u=n.length===0&&r!==null&&t.pending.size===0;if(u){var f=r,v=f.parentNode;Of(v),v.append(f),t.items.clear()}rl(t,e,!u)}else s={pending:new Set(e),done:new Set},(t.outrogroups??(t.outrogroups=new Set)).add(s)}function rl(t,e,r=!0){var n;if(t.pending.size>0){n=new Set;for(const o of t.pending.values())for(const c of o)n.add(t.items.get(c).e)}for(var i=0;i<e.length;i++){var s=e[i];if(n!=null&&n.has(s)){s.f|=on;const o=document.createDocumentFragment();Sl(s,o)}else Xt(e[i],r)}}var Kl;function Ne(t,e,r,n,i,s=null){var o=t,c=new Map,u=(e&Fc)!==0;if(u){var f=t;o=f.appendChild(Ln())}var v=null,g=Kc(()=>{var j=r();return to(j)?j:j==null?[]:ro(j)}),b=new Map,m=!0;function I(j){if((N.effect.f&It)===0){N.pending.delete(j);var M=a(g);N.fallback=v,sh(N,M,o,e,n),v!==null&&(M.length===0?(v.f&on)===0?Vs(v):(v.f^=on,Fa(v,null,o)):Li(v,()=>{v=null}))}}function R(j){N.pending.delete(j)}var S=is(()=>{for(var j=a(g),M=j.length,O=new Set,H=z,Q=cu(),D=0;D<M;D+=1){var ne=j[D],B=n(ne,D),U=m?null:c.get(B);U?(U.v&&da(U.v,ne),U.i&&da(U.i,D),Q&&H.unskip_effect(U.e)):(U=oh(c,m?o:Kl??(Kl=Ln()),ne,B,D,i,e,r),m||(U.e.f|=on),c.set(B,U)),O.add(B)}if(M===0&&s&&!v&&(m?v=vr(()=>s(o)):(v=vr(()=>s(Kl??(Kl=Ln()))),v.f|=on)),M>O.size&&of(),!m)if(b.set(H,O),Q){for(const[he,de]of c)O.has(he)||H.skip_effect(de.e);H.oncommit(I),H.ondiscard(R)}else I(H);a(g)}),N={effect:S,items:c,pending:b,outrogroups:null,fallback:v};m=!1}function Na(t){for(;t!==null&&(t.f&qr)===0;)t=t.next;return t}function sh(t,e,r,n,i){var U,he,de,Pt,st,ot,lt,Ae,Ce;var s=(n&Wd)!==0,o=e.length,c=t.items,u=Na(t.effect.first),f,v=null,g,b=[],m=[],I,R,S,N;if(s)for(N=0;N<o;N+=1)I=e[N],R=i(I,N),S=c.get(R).e,(S.f&on)===0&&((he=(U=S.nodes)==null?void 0:U.a)==null||he.measure(),(g??(g=new Set)).add(S));for(N=0;N<o;N+=1){if(I=e[N],R=i(I,N),S=c.get(R).e,t.outrogroups!==null)for(const tt of t.outrogroups)tt.pending.delete(S),tt.done.delete(S);if((S.f&$t)!==0&&(Vs(S),s&&((Pt=(de=S.nodes)==null?void 0:de.a)==null||Pt.unfix(),(g??(g=new Set)).delete(S))),(S.f&on)!==0)if(S.f^=on,S===u)Fa(S,null,r);else{var j=v?v.next:u;S===t.effect.last&&(t.effect.last=S.prev),S.prev&&(S.prev.next=S.next),S.next&&(S.next.prev=S.prev),Gn(t,v,S),Gn(t,S,j),Fa(S,j,r),v=S,b=[],m=[],u=Na(v.next);continue}if(S!==u){if(f!==void 0&&f.has(S)){if(b.length<m.length){var M=m[0],O;v=M.prev;var H=b[0],Q=b[b.length-1];for(O=0;O<b.length;O+=1)Fa(b[O],M,r);for(O=0;O<m.length;O+=1)f.delete(m[O]);Gn(t,H.prev,Q.next),Gn(t,v,H),Gn(t,Q,M),u=M,v=Q,N-=1,b=[],m=[]}else f.delete(S),Fa(S,u,r),Gn(t,S.prev,S.next),Gn(t,S,v===null?t.effect.first:v.next),Gn(t,v,S),v=S;continue}for(b=[],m=[];u!==null&&u!==S;)(f??(f=new Set)).add(u),m.push(u),u=Na(u.next);if(u===null)continue}(S.f&on)===0&&b.push(S),v=S,u=Na(S.next)}if(t.outrogroups!==null){for(const tt of t.outrogroups)tt.pending.size===0&&(rl(t,ro(tt.done)),(st=t.outrogroups)==null||st.delete(tt));t.outrogroups.size===0&&(t.outrogroups=null)}if(u!==null||f!==void 0){var D=[];if(f!==void 0)for(S of f)(S.f&$t)===0&&D.push(S);for(;u!==null;)(u.f&$t)===0&&u!==t.fallback&&D.push(u),u=Na(u.next);var ne=D.length;if(ne>0){var B=(n&Fc)!==0&&o===0?r:null;if(s){for(N=0;N<ne;N+=1)(lt=(ot=D[N].nodes)==null?void 0:ot.a)==null||lt.measure();for(N=0;N<ne;N+=1)(Ce=(Ae=D[N].nodes)==null?void 0:Ae.a)==null||Ce.fix()}ah(t,D,B)}}s&&Pn(()=>{var tt,Et;if(g!==void 0)for(S of g)(Et=(tt=S.nodes)==null?void 0:tt.a)==null||Et.apply()})}function oh(t,e,r,n,i,s,o,c){var u=(o&Vd)!==0?(o&jd)===0?Pf(r,!1,!1):Bi(r):null,f=(o&zd)!==0?Bi(i):null;return{v:u,i:f,e:vr(()=>(s(e,u??r,f??i,c),()=>{t.delete(n)}))}}function Fa(t,e,r){if(t.nodes)for(var n=t.nodes.start,i=t.nodes.end,s=e&&(e.f&on)===0?e.nodes.start:r;n!==null;){var o=ns(n);if(s.before(n),n===i)return;n=o}}function Gn(t,e,r){e===null?t.effect.first=r:e.next=r,r===null?t.effect.last=e:r.prev=e}function Jl(t,e,r=!1,n=!1,i=!1,s=!1){var o=t,c="";if(r)var u=t;$(()=>{var f=me;if(c!==(c=e()??"")){if(r&&!Hc){f.nodes=null,u.innerHTML=c,c!==""&&Ga(xn(u),u.lastChild);return}if(f.nodes!==null&&(pu(f.nodes.start,f.nodes.end),f.nodes=null),c!==""){var v=n?Qd:i?Zd:void 0,g=uu(n?"svg":i?"math":"template",v);g.innerHTML=c;var b=n||i?g:g.content;if(Ga(xn(b),b.lastChild),n||i)for(;xn(b);)o.before(xn(b));else o.before(b)}}})}function lh(t,e){var r;r=document.head.appendChild(Ln());try{is(()=>{var n=vr(()=>e(r));n.f|=Mc,Hc||(n.nodes===null?n.nodes={start:r,end:r,a:null,t:null}:n.nodes.end=r)})}finally{}}const Yl=[...` 	
\r\f \v\uFEFF`];function ch(t,e,r){var n=t==null?"":""+t;if(r){for(var i of Object.keys(r))if(r[i])n=n?n+" "+i:i;else if(n.length)for(var s=i.length,o=0;(o=n.indexOf(i,o))>=0;){var c=o+s;(o===0||Yl.includes(n[o-1]))&&(c===n.length||Yl.includes(n[c]))?n=(o===0?"":n.substring(0,o))+n.substring(c+1):o=c}}return n===""?null:n}function Xl(t,e=!1){var r=e?" !important;":";",n="";for(var i of Object.keys(t)){var s=t[i];s!=null&&s!==""&&(n+=" "+i+": "+s+r)}return n}function uh(t,e){if(e){var r="",n,i;return Array.isArray(e)?(n=e[0],i=e[1]):n=e,n&&(r+=Xl(n)),i&&(r+=Xl(i,!0)),r=r.trim(),r===""?null:r}return String(t)}function cr(t,e,r,n,i,s){var o=t[Vo];if(o!==r||o===void 0){var c=ch(r,n,s);c==null?t.removeAttribute("class"):t.className=c,t[Vo]=r}else if(s&&i!==s)for(var u in s){var f=!!s[u];(i==null||f!==!!i[u])&&t.classList.toggle(u,f)}return s}function Ao(t,e={},r,n){for(var i in r){var s=r[i];e[i]!==s&&(r[i]==null?t.style.removeProperty(i):t.style.setProperty(i,s,n))}}function Ql(t,e,r,n){var i=t[zo];if(i!==e){var s=uh(e,n);s==null?t.removeAttribute("style"):t.style.cssText=s,t[zo]=e}else n&&(Array.isArray(n)?(Ao(t,r==null?void 0:r[0],n[0]),Ao(t,r==null?void 0:r[1],n[1],"important")):Ao(t,r,n));return n}function dh(t,e){e?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function fh(t,e){var r=t.__defaultValue,n=t.multiple,i=n?r??[]:null;if(!(n&&!to(i))){t.selectedIndex;for(var s of t.options){var o=Xi(s);dh(s,n?i.includes(o):iu(o,r))}}}function zs(t,e,r=!1){if(t.multiple){if(e==null)return;if(!to(e))return tf();for(var n of t.options)n.selected=e.includes(Xi(n));return}for(n of t.options){var i=Xi(n);if(iu(i,e)){n.selected=!0;return}}(!r||e!==void 0)&&(t.selectedIndex=-1)}function lr(t){var e=new MutationObserver(r=>{r.every(hh)||("__defaultValue"in t&&fh(t),"__value"in t&&zs(t,t.__value))});e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),yl(()=>{e.disconnect()})}function Ur(t,e,r=e){var n=new WeakSet,i=!0;_l(t,"change",s=>{var o=s?"[selected]":":checked",c;if(t.multiple)c=[].map.call(t.querySelectorAll(o),Xi);else{var u=t.querySelector(o)??t.querySelector("option:not([disabled])");c=u&&Xi(u)}r(c),t.__value=c,z!==null&&n.add(z)}),Il(()=>{var s=e();if(t===document.activeElement){var o=z;if(n.has(o))return}if(zs(t,s,i),i&&s===void 0){var c=t.querySelector(":checked");c!==null&&(s=Xi(c),r(s))}t.__value=s,i=!1})}function Xi(t){return"__value"in t?t.__value:t.value}function hh(t){if(t.target.closest("selectedcontent")!==null)return!0;if(t.type==="childList"){var e=[...t.addedNodes,...t.removedNodes];return e.length>0&&e.every(r=>r.nodeName==="SELECTEDCONTENT")}return!1}const ph=Symbol("is custom element"),vh=Symbol("is html"),_h=Hd?"progress":"PROGRESS";function Jt(t,e){var r=Ru(t);r.value===(r.value=e??void 0)||t.value===e&&(e!==0||t.nodeName!==_h)||(t.value=e??"")}function wt(t,e,r,n){var i=Ru(t);i[e]!==(i[e]=r)&&(e==="loading"&&(t[Bd]=r),r==null?t.removeAttribute(e):typeof r!="string"&&gh(t).has(e)?t[e]=r:t.setAttribute(e,r))}function Ru(t){return t[Cs]??(t[Cs]={[ph]:t.nodeName.includes("-"),[vh]:t.namespaceURI===Bc})}var Zl=new Map;function gh(t){var e=t.getAttribute("is")||t.nodeName,r=Zl.get(e);if(r)return r;Zl.set(e,r=new Set);for(var n,i=t,s=Element.prototype;s!==i;){n=Nd(i);for(var o in n)n[o].set&&o!=="innerHTML"&&o!=="textContent"&&o!=="innerText"&&r.add(o);i=Oc(i)}return r}function He(t,e,r=e){var n=new WeakSet;_l(t,"input",async i=>{var s=i?t.defaultValue:t.value;if(s=Co(t)?Ro(s):s,r(s),z!==null&&n.add(z),await Eu(),s!==(s=e())){var o=t.selectionStart,c=t.selectionEnd,u=t.value.length;if(t.value=s??"",c!==null){var f=t.value.length;o===c&&c===u&&f>u?(t.selectionStart=f,t.selectionEnd=f):(t.selectionStart=o,t.selectionEnd=Math.min(c,f))}}}),ba(e)==null&&t.value&&(r(Co(t)?Ro(t.value):t.value),z!==null&&n.add(z)),io(()=>{var i=e();if(t===document.activeElement){var s=z;if(n.has(s))return}Co(t)&&i===Ro(t.value)||t.type==="date"&&!i&&!t.value||i!==t.value&&(t.value=i??"")})}function Ws(t,e,r=e){_l(t,"change",n=>{var i=n?t.defaultChecked:t.checked;r(i)}),ba(e)==null&&r(t.checked),io(()=>{var n=e();t.checked=!!n})}function Co(t){var e=t.type;return e==="number"||e==="range"}function Ro(t){return t===""?null:+t}function Po(t,e){return t===e||(t==null?void 0:t[Di])===e}function mh(t=pl(),e,r,n){var i=Ct.r,s=me;return Il(()=>{var o,c;return io(()=>{o=c,c=[],ba(()=>{Po(r(...c),t)||(e(t,...c),o&&Po(r(...o),t)&&e(null,...o))})}),()=>{let u=s;for(;u!==i&&u.parent!==null&&u.parent.f&Wa;)u=u.parent;const f=()=>{c&&Po(r(...c),t)&&e(null,...c)},v=u.teardown;u.teardown=()=>{f(),v==null||v()}}}),t}let ks=!1;function bh(t){var e=ks;try{return ks=!1,[t(),ks]}finally{ks=e}}function xo(t,e,r,n){var O;var i=!0,s=(r&Kd)!==0,o=(r&Jd)!==0,c=n,u=!0,f=void 0,v=()=>o&&i?(f??(f=ja(n)),a(f)):(u&&(u=!1,c=o?ba(n):n),c);let g;if(s){var b=Di in t||$d in t;g=((O=Ki(t,e))==null?void 0:O.set)??(b&&e in t?H=>t[e]=H:void 0)}var m,I=!1;s?[m,I]=bh(()=>t[e]):m=t[e],m===void 0&&n!==void 0&&(m=v(),g&&(ff(),g(m)));var R;if(R=()=>{var H=t[e];return H===void 0?v():(u=!0,H)},(r&Gd)===0)return R;if(g){var S=t.$$legacy;return(function(H,Q){return arguments.length>0?((!Q||S||I)&&g(Q?R():H),H):R()})}var N=!1,j=((r&qd)!==0?ja:Kc)(()=>(N=!1,R()));s&&a(j);var M=me;return(function(H,Q){if(arguments.length>0){const D=Q?a(j):s?_r(H):H;return d(j,D),N=!0,c!==void 0&&(c=D),H}return Mn&&N||(M.f&It)!==0?j.v:a(j)})}function Pu(t){Ct===null&&af(),du(()=>{const e=ba(t);if(typeof e=="function")return e})}const wh="5";var Pc;typeof window<"u"&&((Pc=window.__svelte??(window.__svelte={})).v??(Pc.v=new Set)).add(wh);const ec=Object.freeze({infographic:[1080,1350],carousel:[1080,1350],story:[1080,1920],reel:[1080,1920]});function Ns(t=""){return String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[e])}function Ts(t,e){return/^#[0-9a-f]{6}$/i.test(t||"")?t:e}function yh(t,e,r){const n=String(t??"").slice(0,12e3).split(/\s+/).filter(Boolean),i=[];let s="";for(const o of n){const c=o.match(new RegExp(`.{1,${e}}`,"gu"))||[];for(const u of c)s&&[...`${s} ${u}`].length>e&&(i.push(s),s=""),s=s?`${s} ${u}`:u}if(s&&i.push(s),i.length>r)throw new Error(`Content exceeds artwork capacity (${r} lines). Shorten the text before exporting.`);return i}function No(t,e,r,n,i,s,o,c=400,u="DejaVu Sans"){const f=yh(t,Math.max(8,Math.floor(i/(n*.63))),s);return{height:Math.max(1,f.length)*n*1.3,svg:`<text data-preflight-text="true" x="${e}" y="${r}" fill="${o}" font-family="${u}, Noto Sans Devanagari, sans-serif" font-size="${n}" font-weight="${c}">${f.map((v,g)=>`<tspan x="${e}" dy="${g?n*1.3:0}">${Ns(v)}</tspan>`).join("")}</text>`}}function Ih({brandProfile:t={},campaign:e,format:r="infographic",slideIndex:n=0}){var he,de,Pt,st,ot,lt,Ae,Ce,tt,Et,Qt;if(!e||!ec[r])throw new Error("A campaign and supported format are required");const[i,s]=ec[r],o=t.colors||[],c=Ts((he=o[0])==null?void 0:he.hex,"#141513"),u=Ts((de=o[2])==null?void 0:de.hex,"#C5D86D"),f=Ts((Pt=o[3])==null?void 0:Pt.hex,"#F4F1EA"),v=Ts((st=o[1])==null?void 0:st.hex,"#A8C5A0"),g=s===1920,b=r==="reel"?740:900,m=g?400:140;let I,R,S;if(r==="infographic"){const oe=e.infographic;if(!oe||!Array.isArray(oe.statRows))throw new Error("Infographic content missing");I=oe.headline,R=oe.statRows,S=oe.bottomTakeaway}else if(r==="carousel"){const oe=(lt=(ot=e.carousel)==null?void 0:ot.slides)==null?void 0:lt[n];if(!oe)throw new Error("Carousel slide missing");I=oe.title,R=[oe.bodyMetric],S=oe.visualNote}else if(r==="story"){const oe=e.story;if(!oe)throw new Error("Story content missing");I=oe.hookBanner,R=[oe.keyStatHighlight],S=oe.interactiveStickerPrompt}else{const oe=(Ce=(Ae=e.reel)==null?void 0:Ae.beats)==null?void 0:Ce[n];if(!oe)throw new Error("Reel beat missing");I=oe.onScreenText||e.reel.spokenHook0to3s,R=[oe.voiceover],S=e.reel.closingCta}const N=(oe,Ar)=>["Mona Sans","Inter","Instrument Serif","DejaVu Sans"].find(Bn=>String(oe||"").split("/")[0].trim()===Bn)||Ar,j=N((tt=t.fonts)==null?void 0:tt.heading,"DejaVu Sans"),M=N((Et=t.fonts)==null?void 0:Et.body,"DejaVu Sans"),O=[];let H=m;const Q=No(I,80,H,52,b,5,f,700,j);O.push(Q.svg),H+=Q.height+72;for(const oe of R){const Ar=No(oe,106,H,34,b-60,5,f,400,M);O.push(`<path d="M80 ${H-30}v${Ar.height+10}" stroke="${u}" stroke-width="6"/>`,Ar.svg),H+=Ar.height+50}const D=No(S,80,H+10,29,b,4,v,400,M),ne=g?s*.82-35:s-80;if(H+D.height>ne)throw new Error("Content exceeds the safe artwork area. Shorten the copy before exporting.");O.push(D.svg);const B=Ns([t.logoText,t.brandName||"Campaign Studio"].filter(Boolean).join(" · ")),U=((Qt=e.provenance)==null?void 0:Qt.mode)==="synthetic"?"SYNTHETIC DRAFT · REVIEW REQUIRED":"EDITORIAL DRAFT";return`<svg xmlns="http://www.w3.org/2000/svg" width="${i}" height="${s}" viewBox="0 0 ${i} ${s}" role="img" aria-label="${Ns(I)}"><title>${Ns(I)}</title><rect width="${i}" height="${s}" fill="${c}"/><g font-family="DejaVu Sans, Noto Sans Devanagari, sans-serif"><text data-preflight-text="true" x="80" y="${g?305:65}" fill="${v}" font-size="26" font-weight="700">${B}</text><path d="M80 ${m-55}h920" stroke="${u}" stroke-width="3"/>${O.join("")}<text data-preflight-text="true" x="80" y="${g?Math.floor(s*.8):s-35}" fill="${v}" font-size="19">${U}${r==="carousel"?` · ${n+1}/4`:""}</text></g></svg>`}const Eh=new Set(["infographic","carousel","story","reel"]);function Oo(t){if(typeof t!="string"||!/^#[0-9a-f]{6}$/i.test(t))return null;const[e,r,n]=t.slice(1).match(/.{2}/g).map(i=>{const s=parseInt(i,16)/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4});return .2126*e+.7152*r+.0722*n}function Sh({format:t,canvas:e,textBoxes:r=[],obstructionBoxes:n=[],foreground:i,background:s,caption:o="",captionLimit:c=125}){if(!Eh.has(t)||!e||!Number.isFinite(e.width)||!Number.isFinite(e.height)||e.width<=0||e.height<=0||e.width>1e4||e.height>1e4)throw new Error("Invalid preflight canvas or format");if(!Array.isArray(r)||r.length>2e3||r.some(B=>!B||["x","y","width","height"].some(U=>!Number.isFinite(B[U]))||B.width<0||B.height<0))throw new Error("Invalid preflight text rectangles");if(!Array.isArray(n)||n.length>40||n.some(B=>!B||["x","y","width","height"].some(U=>!Number.isFinite(B[U]))||B.width<0||B.height<0))throw new Error("Invalid preflight obstruction rectangles");if(typeof o!="string"||o.length>2e4||!Number.isInteger(c)||c<40||c>500)throw new Error("Invalid preflight caption settings");const{width:u,height:f}=e,v=t==="story"||t==="reel",g=v?[{x:0,y:0,width:u,height:f*.14},{x:0,y:f*.82,width:u,height:f*.18},...t==="reel"?[{x:u*.82,y:0,width:u*.18,height:f}]:[]]:[],b=r.filter(B=>[...g,...n].some(U=>B.x<U.x+U.width&&B.x+B.width>U.x&&B.y<U.y+U.height&&B.y+B.height>U.y)).length,m=r.filter(B=>B.x<-1||B.y<-1||B.x+B.width>u+1||B.y+B.height>f+1).length,I=Oo(s),R=r.map(B=>Oo(B.foreground||i)).filter(B=>B!==null).map(B=>I===null?null:(Math.max(B,I)+.05)/(Math.min(B,I)+.05)).filter(B=>B!==null),S=r.filter(B=>Oo(B.foreground||i)===null||I===null).length,N=R.length?Math.round(Math.min(...R)*100)/100:null,j=Math.min(c,o.length),M=/\$\d|\d%/.test(o.slice(0,c)),O=r.length>0,H=v?9/16:4/5,Q=u/f,D=Math.abs(Q-H)/H;return{simulation:!0,measurementMethod:"client-svg-text-rectangles",requiresReview:!0,metrics:{obstructionElementsCount:n.length,unmeasuredColorCount:S,expectedAspectRatio:v?"9:16":"4:5",actualAspectRatio:Math.round(Q*1e4)/1e4,aspectRatioDeviation:D,artworkWidth:u,artworkHeight:f,textElementsCount:r.length,occludedElementsCount:b,overflowElementsCount:m,contrastRatio:N,captionCharacters:o.length,firstLookCharacters:j,firstLookContainsHardNumber:M,safeZoneRegions:{top:v?.14:0,bottom:v?.18:0,right:t==="reel"?.18:0}},checks:[{id:"aspect-ratio",status:D<=.01?"pass":"warning",measured:Q,limit:H,message:"Rendered artwork ratio compared with the intended 4:5 or 9:16 export; 1% layout tolerance."},{id:"safe-zones",status:O?b?"warning":"pass":"unmeasured",measured:O?b:null,limit:0,message:"Text rectangles intersecting measured native chrome/stickers or approximate chrome zones; actual Instagram layout can vary."},{id:"artwork-overflow",status:O?m?"warning":"pass":"unmeasured",measured:O?m:null,limit:0,message:"Text rectangles outside the rendered artwork."},{id:"contrast",status:N===null||S>0?"unmeasured":N>=4.5?"pass":"warning",measured:N,limit:4.5,message:"Minimum text fill contrast against the supplied base background, without image/gradient analysis."},{id:"caption-fold",status:o.length>c?"warning":"pass",measured:o.length,limit:c,message:"Configurable approximate caption fold; not an official platform guarantee."}]}}var kh=C('<div class="statusbar"><span>9:41</span><span class="island"></span><span>▴ ▰ ▮</span></div>'),Th=C("<!><span> </span>",1),Ah=C('<span class="empty-cell">No scheduled or exported post</span>'),Ch=C("<div><!></div>"),Rh=C('<div class="profile-header"><b> </b><button aria-label="Profile options">☰</button></div> <div class="profile-summary"><span class="avatar large"> </span><span><b> </b> preview posts</span><span>Private<br/>preview</span></div> <div class="profile-bio"><b> </b> <p> </p> <small>Local preview · active first, weekly schedule Monday–Sunday, then newest exports. Not a live Instagram feed.</small></div> <div class="profile-grid"></div>',1),Ph=C('<header class="ig-header"><span class="avatar"> </span> <div><b> </b><small>Editorial draft</small></div> <button aria-label="Post options">•••</button></header>'),xh=C('<span class="slide-count"> </span><button class="previous" aria-label="Previous slide">‹</button><button class="next" aria-label="Next slide">›</button>',1),Nh=C("<span><i></i></span>"),Oh=C('<div class="story-chrome"><div class="timer-bars"></div> <div class="story-header"><span class="avatar"> </span><b> </b><span>Draft</span><button> </button><button aria-label="Close story preview">×</button></div></div> <div class="poll-sticker"><b> </b> <div><button> </button><button> </button></div> <small> </small></div> <div class="story-reply"><input aria-label="Story reply preview" placeholder="Send message…"/><button aria-label="Like story"> </button><button aria-label="Share story preview">➤</button></div>',1),Dh=C('<div class="reel-top"><b>Reels</b><span>Storyboard simulation</span></div> <div class="reel-rail"><button aria-label="Like reel"> <small> </small></button><button aria-label="Comment on reel">♧<small> </small></button><button aria-label="Share reel preview">➤</button><button aria-label="Reel options">•••</button><span>♫</span></div> <div class="reel-meta"><b> </b><button> </button> <p> </p> <div class="audio">♫ Original audio · storyboard, no audio playback</div></div>',1),Lh=C('<div class="danger right">18%</div>'),Mh=C('<div class="safe-mask" aria-label="Simulated safe-zone overlay"><div class="danger top">Top 14% · chrome risk</div> <div class="danger bottom">Bottom 18% · caption / reply risk</div> <!> <div class="clear-zone">Inspect text clearance</div></div>'),Uh=C('<span class="floating-heart">♥</span>'),Fh=C('<div class="reel-controls"><button> </button><input aria-label="Reel scrubber" type="range" min="0" max="30" step=".25"/><output data-testid="active-beat"> </output></div>'),$h=C("<button>●</button>"),Bh=C('<div class="dots"></div>'),Hh=C("<button> </button>"),Vh=C('<div class="engagement"><button aria-label="Like post"> </button><button aria-label="Comment on post">♧</button><button aria-label="Share post preview">➤</button><!><button class="bookmark" aria-label="Save post locally"> </button></div> <p class="local-count"> </p> <div class="caption"><b> </b> <!><small>LOCAL DRAFT · NO INSTAGRAM CONNECTION</small></div>',1),zh=C(`<div class="fold-ruler"><label>Approximate fold <input aria-label="Caption fold threshold" type="number" min="40" max="500"/> characters</label> <p><mark> </mark><span class="fold-line">│</span> </p> <small>Configurable simulation. Actual truncation varies by app, device
              and layout.</small></div>`),Wh=C('<!> <div role="group" aria-label="Artwork preview"><div class="artwork"></div> <!> <!> <!> <!> <!></div> <!> <!> <!>',1),jh=C("<p> </p>"),qh=C('<div class="comment-panel"><b>Local comments</b><!> <form><input aria-label="Local comment" placeholder="Write a preview comment"/><button>Add</button></form></div>'),Gh=C('<p class="local-notice" role="status"> </p>'),Kh=C(`<div class="measurements"><span><b> </b> text boxes in chrome zones</span><span><b> </b> text boxes outside artwork</span><span><b> </b> </span><span><b> </b> </span><span><b> </b> caption characters before simulated
          fold</span></div> <p class="small muted">Measured SVG text boxes and fill contrast against the base background;
        images, glyph shapes and all native app variations are not covered.
        Review required. No confidence score is inferred.</p>`,1),Jh=C('<p class="small muted">Open a design or Instagram surface to measure the rendered SVG.</p>'),Yh=C(`<section class="emulator" aria-label="Instagram preview simulator"><div class="preview-heading"><div><span class="eyebrow">PREVIEW LAB</span> <h3>See it in context.</h3></div> <span class="simulation">Local simulation</span></div> <div class="segmented" aria-label="Preview mode"><button>Design Mode</button> <button>In-Situ Instagram</button> <button>3×3 Profile Grid</button></div> <div class="preview-controls"><label>Phone width <select><option>375 px</option><option>390 px · generic</option><option>402 px · iPhone 16 Pro</option><option>430 px</option></select></label> <label>Zoom <input aria-label="Preview zoom" type="range" min="55" max="125" step="5"/><output> </output></label> <label><input type="checkbox"/>Safe zones</label> <label><input type="checkbox"/>Caption ruler</label></div> <p class="muted small">Approximate Instagram chrome. Local interactions only. Validate final assets
    in Instagram before publishing.</p> <div class="phone-well"><div aria-label="Simulated phone viewport"><!> <!> <!> <!></div></div> <div class="evidence"><div class="evidence-title"><b>Measured preflight</b><button>Measure again</button></div> <!></div></section>`);function Xh(t,e){fl(e,!0);let r=xo(e,"format",3,"infographic"),n=xo(e,"backlog",19,()=>[]),i=xo(e,"onpreflight",3,()=>{}),s=x("instagram"),o=x(85),c=x(402),u=x(!1),f=x(!0),v=x(125),g=x(0),b=x(!1),m=x(!1),I=x(!1),R=x(""),S=x(_r([])),N=x(!1),j=x(""),M=x(null),O=x(0),H=x(0),Q=x(!1),D=x(0),ne=x(!1),B=x(!1),U=0,he=x(void 0),de=x(null);function Pt(k){try{return Ih(k)}catch{return'<div class="artwork-error">Artwork exceeds its layout. Shorten the copy and save before export.</div>'}}let st=Ft(()=>{var k,Y;return(((k=e.brandProfile)==null?void 0:k.handle)||((Y=e.brandProfile)==null?void 0:Y.brandName)||"studio").replace(/[^a-zA-Z0-9_.]/g,"").toLowerCase()}),ot=Ft(()=>{var k,Y,Ve,Qe;return((Y=(k=e.campaign)==null?void 0:k.infographic)==null?void 0:Y.caption)||((Qe=(Ve=e.campaign)==null?void 0:Ve.story)==null?void 0:Qe.hookBanner)||""}),lt=Ft(()=>{var Y,Ve,Qe;const k=((Ve=(Y=e.campaign)==null?void 0:Y.reel)==null?void 0:Ve.beats)||[];for(let kt=k.length-1;kt>=0;kt--){const Fe=(Qe=k[kt].timecode)==null?void 0:Qe.match(/^(\d+):(\d+)/);if(Fe&&a(D)>=Number(Fe[1])*60+Number(Fe[2]))return kt}return 0}),Ae=Ft(()=>Pt({campaign:e.campaign,brandProfile:e.brandProfile,format:r(),slideIndex:r()==="reel"?a(lt):a(g)})),Ce=Ft(()=>{var k,Y;return((Y=(k=e.campaign)==null?void 0:k.carousel)==null?void 0:Y.slides)||[]});const tt=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];let Et=Ft(()=>[{id:"active",campaignDraft:e.campaign,title:"Active campaign",gridLabel:"Active"},...n().filter(k=>k.id!==e.activeStoryId&&k.campaignDraft&&["Scheduled","Exported"].includes(k.status)).sort((k,Y)=>k.status!==Y.status?k.status==="Scheduled"?-1:1:k.status==="Scheduled"?tt.indexOf(k.scheduledDay)-tt.indexOf(Y.scheduledDay):(Date.parse(Y.exportedAt)||0)-(Date.parse(k.exportedAt)||0)).slice(0,8).map(k=>({...k,gridLabel:k.status==="Scheduled"?`Scheduled · ${k.scheduledDay}`:`Exported${k.exportedAt?` · ${new Date(k.exportedAt).toLocaleString()}`:" · time unavailable"}`}))]);du(()=>{JSON.stringify(e.campaign),r(),a(s),a(c),a(o),a(g),a(v),a(lt),a(O),a(M),a(I),a(b),a(m),a(B),a(S).length;const k=setTimeout(()=>{hn()},160);return()=>clearTimeout(k)}),Pu(()=>{window.innerWidth<700&&d(o,75);const k=setInterval(()=>{a(ne)&&(d(D,Math.min(30,a(D)+.25),!0),a(D)>=30&&d(ne,!1)),a(Q)&&(d(H,a(H)+.25),a(H)>=5&&(d(H,0),d(O,(a(O)+1)%4)))},250);return document.fonts.addEventListener("loadingdone",hn),()=>{clearInterval(k),document.fonts.removeEventListener("loadingdone",hn)}});function Qt(k){d(s,k,!0),d(ne,!1),d(Q,!1)}function oe(k){r()==="carousel"&&d(g,Math.max(0,Math.min(a(Ce).length-1,a(g)+k)),!0),r()==="story"&&(d(O,(a(O)+k+4)%4),d(H,0))}function Ar(k){var Y;["INPUT","TEXTAREA","SELECT"].includes((Y=k.target)==null?void 0:Y.tagName)||(k.key==="ArrowRight"&&oe(1),k.key==="ArrowLeft"&&oe(-1))}function Bn(k){if(/^#[0-9a-f]{6}$/i.test(k))return k;const Y=k.match(/[\d.]+/g);return(Y==null?void 0:Y.length)>=3?"#"+Y.slice(0,3).map(Ve=>Math.round(Number(Ve)).toString(16).padStart(2,"0")).join(""):null}async function hn(){var Zt;if(await Eu(),await document.fonts.ready,!a(he)||a(s)==="grid"){d(de,null);return}const k=a(he).getBoundingClientRect();if(!k.width||!k.height)return;const Y=[...a(he).querySelectorAll("svg text")],Ve=Bn(((Zt=a(he).querySelector("svg rect"))==null?void 0:Zt.getAttribute("fill"))||"#141513"),Qe=Y.map(Ot=>{const _=Ot.getBoundingClientRect();return{x:_.x-k.x,y:_.y-k.y,width:_.width,height:_.height,foreground:Bn(getComputedStyle(Ot).fill)}}),kt=a(he).parentElement,Fe=a(s)==="instagram"?[...kt.querySelectorAll(".poll-sticker,.reel-rail,.reel-meta,.reel-top,.story-chrome,.story-reply,.slide-count,.previous,.next,.floating-heart")].map(Ot=>{const _=Ot.getBoundingClientRect(),w=Ot.classList.contains("reel-meta")?getComputedStyle(Ot,"::before"):null,A=nt=>w&&w.content!=="none"?Math.min(0,parseFloat(w[nt])||0):0,L=A("left"),ie=A("right"),we=A("top"),Oe=A("bottom");return{x:_.x-k.x+L,y:_.y-k.y+we,width:_.width-L-ie,height:_.height-we-Oe}}):[],xt={format:r(),obstructionBoxes:Fe,canvas:{width:k.width,height:k.height},textBoxes:Qe,background:Ve,caption:a(ot),captionLimit:Number(a(v)),viewContext:{mode:a(s),frameIndex:r()==="reel"?a(lt):a(g),storyFrame:a(O),pollVote:a(M),measuredAt:new Date().toISOString()}},Nt=Sh(xt);d(de,Nt.metrics,!0),i()(xt)}function Vi(){a(R).trim()&&(d(S,[...a(S),a(R).trim()],!0),d(R,""))}async function oi(){d(j,"Local share preview opened. Nothing was published.")}var gr=Yh();Si("keydown",Jo,Ar);var ya=l(h(gr),2),pn=h(ya);let Cr;var Ht=l(pn,2);let li;var Hn=l(Ht,2);let rt;var Ia=l(ya,2),ci=h(Ia),zi=l(h(ci)),Ea=h(zi);Ea.value=Ea.__value=375;var Sa=l(Ea);Sa.value=Sa.__value=390;var Vn=l(Sa);Vn.value=Vn.__value=402;var ka=l(Vn);ka.value=ka.__value=430,lr(zi);var Gr=l(ci,2),St=l(h(Gr)),Ta=l(St),ui=E(Ta),di=l(Gr,2),co=h(di),uo=l(di,2),fo=h(uo),fs=l(Ia,4),Kr=h(fs);let hs,ps;var Aa=h(Kr);{var Ca=k=>{var Y=kh();T(k,Y)};ce(Aa,k=>{a(s)!=="design"&&k(Ca)})}var mr=l(Aa,2);{var fi=k=>{var Y=Rh(),Ve=Ye(Y),Qe=h(Ve),kt=E(Qe,!0),Fe=l(Qe),xt=l(Ve,2),Nt=h(xt),Zt=E(Nt,!0),Ot=l(Nt),_=h(Ot),w=E(_,!0),A=l(xt,2),L=h(A),ie=E(L,!0),we=l(L,2),Oe=E(we,!0),nt=l(A,2);Ne(nt,20,()=>Array(9),Yi,(qe,Ee,Ge)=>{var Rr=Ch();cr(Rr,1,"grid-cell",null,{},{current:Ge===0});var Jr=h(Rr);{var hi=Dt=>{var er=Th(),q=Ye(er);Jl(q,()=>Pt({campaign:a(Et)[Ge].campaignDraft,brandProfile:e.brandProfile,format:"infographic"}));var ye=l(q),Re=E(ye,!0);$(()=>y(Re,a(Et)[Ge].gridLabel)),T(Dt,er)},zn=Dt=>{var er=Ah();T(Dt,er)};ce(Jr,Dt=>{a(Et)[Ge]?Dt(hi):Dt(zn,-1)})}$(()=>{var Dt;return wt(Rr,"title",((Dt=a(Et)[Ge])==null?void 0:Dt.title)||"Empty slot")}),T(qe,Rr)}),$(qe=>{var Ee,Ge;y(kt,a(st)),y(Zt,qe),y(w,a(Et).length),y(ie,(Ee=e.brandProfile)==null?void 0:Ee.brandName),y(Oe,(Ge=e.brandProfile)==null?void 0:Ge.tagline)},[()=>{var qe,Ee;return((Ee=(qe=e.brandProfile)==null?void 0:qe.logoText)==null?void 0:Ee.slice(0,2))||a(st).slice(0,2)}]),P("click",Fe,()=>d(j,"Profile options are a local simulation.")),T(k,Y)},Ra=k=>{var Y=Wh(),Ve=Ye(Y);{var Qe=q=>{var ye=Ph(),Re=h(ye),ze=E(Re,!0),We=l(Re,2),Ze=h(We),Vt=E(Ze,!0),ct=l(We,2);$(zt=>{y(ze,zt),y(Vt,a(st))},[()=>a(st).slice(0,2)]),P("click",ct,()=>d(j,"Post menu preview. Export to save an actual file.")),T(q,ye)},kt=Ft(()=>a(s)==="instagram"&&!["story","reel"].includes(r()));ce(Ve,q=>{a(kt)&&q(Qe)})}var Fe=l(Ve,2);let xt;var Nt=h(Fe);Jl(Nt,()=>a(Ae),!0),mh(Nt,q=>d(he,q),()=>a(he));var Zt=l(Nt,2);{var Ot=q=>{var ye=xh(),Re=Ye(ye),ze=E(Re),We=l(Re),Ze=l(We);$(()=>{y(ze,`${a(g)+1}/${a(Ce).length??""}`),We.disabled=a(g)===0,Ze.disabled=a(g)===a(Ce).length-1}),P("click",We,()=>oe(-1)),P("click",Ze,()=>oe(1)),T(q,ye)};ce(Zt,q=>{a(s)==="instagram"&&r()==="carousel"&&q(Ot)})}var _=l(Zt,2);{var w=q=>{var ye=Oh(),Re=Ye(ye),ze=h(Re);Ne(ze,20,()=>[0,1,2,3],G=>G,(G,K)=>{var _e=Nh(),Ke=h(_e);let Je;$(()=>Je=Ql(Ke,"",Je,{width:`${K<a(O)?100:K===a(O)?a(H)*20:0}%`})),T(G,_e)});var We=l(ze,2),Ze=h(We),Vt=E(Ze,!0),ct=l(Ze),zt=E(ct,!0),Wt=l(ct,2),_n=E(Wt,!0),gn=l(Wt),mn=l(Re,2),bn=h(mn),Wn=E(bn,!0),wn=l(bn,2),br=h(wn);let Pr;var jn=E(br),vt=l(br);let tr;var yn=E(vt),bs=l(wn,2),pi=E(bs,!0),qn=l(mn,2),In=l(h(qn)),go=E(In,!0),V=l(In);$(G=>{var K,_e;y(Vt,G),y(zt,a(st)),wt(Wt,"aria-label",a(Q)?"Pause story":"Play story"),y(_n,a(Q)?"Ⅱ":"▶"),y(Wn,(_e=(K=e.campaign)==null?void 0:K.story)==null?void 0:_e.interactiveStickerPrompt),Pr=cr(br,1,"",null,Pr,{voted:a(M)==="A"}),y(jn,`Investigate ${a(M)?a(M)==="A"?"✓ 100%":"0%":""}`),tr=cr(vt,1,"",null,tr,{voted:a(M)==="B"}),y(yn,`Read sources ${a(M)?a(M)==="B"?"✓ 100%":"0%":""}`),y(pi,a(M)?"Your one local vote · simulated result":"Try a local poll vote"),wt(In,"aria-pressed",a(b)),y(go,a(b)?"♥":"♡")},[()=>a(st).slice(0,2)]),P("click",Wt,()=>d(Q,!a(Q))),P("click",gn,()=>Qt("design")),P("click",br,()=>d(M,"A")),P("click",vt,()=>d(M,"B")),P("click",In,()=>d(b,!a(b))),P("click",V,oi),T(q,ye)};ce(_,q=>{a(s)==="instagram"&&r()==="story"&&q(w)})}var A=l(_,2);{var L=q=>{var ye=Dh(),Re=l(Ye(ye),2),ze=h(Re),We=h(ze),Ze=l(We),Vt=E(Ze,!0),ct=l(ze),zt=l(h(ct)),Wt=E(zt,!0),_n=l(ct),gn=l(_n),mn=l(gn);let bn;var Wn=l(Re,2),wn=h(Wn),br=E(wn,!0),Pr=l(wn),jn=E(Pr,!0),vt=l(Pr,2),tr=E(vt);$(yn=>{wt(ze,"aria-pressed",a(b)),y(We,a(b)?"♥":"♡"),y(Vt,a(b)?1:0),y(Wt,a(S).length),bn=cr(mn,1,"vinyl",null,bn,{spinning:a(ne)}),y(br,a(st)),wt(Pr,"aria-pressed",a(B)),y(jn,a(B)?"Following":"+ Follow"),y(tr,`${yn??""}${a(ot).length>a(v)?"…":""}`)},[()=>a(ot).slice(0,a(v))]),P("click",ze,()=>d(b,!a(b))),P("click",ct,()=>d(N,!a(N))),P("click",_n,oi),P("click",gn,()=>d(j,"Reel options preview; nothing is published.")),P("click",Pr,()=>d(B,!a(B))),T(q,ye)};ce(A,q=>{a(s)==="instagram"&&r()==="reel"&&q(L)})}var ie=l(A,2);{var we=q=>{var ye=Mh(),Re=l(h(ye),4);{var ze=We=>{var Ze=Lh();T(We,Ze)};ce(Re,We=>{r()==="reel"&&We(ze)})}T(q,ye)},Oe=Ft(()=>a(u)&&["story","reel"].includes(r()));ce(ie,q=>{a(Oe)&&q(we)})}var nt=l(ie,2);{var qe=q=>{var ye=Uh();T(q,ye)},Ee=Ft(()=>a(b)&&a(j).includes("Liked"));ce(nt,q=>{a(Ee)&&q(qe)})}var Ge=l(Fe,2);{var Rr=q=>{var ye=Fh(),Re=h(ye),ze=E(Re,!0),We=l(Re),Ze=l(We),Vt=E(Ze);$(ct=>{y(ze,a(ne)?"Pause reel":"Play reel"),y(Vt,`BEAT ${a(lt)+1} · ${ct??""} / 30s`)},[()=>Math.floor(a(D))]),P("click",Re,()=>d(ne,!a(ne))),He(We,()=>a(D),ct=>d(D,ct)),T(q,ye)};ce(Ge,q=>{r()==="reel"&&q(Rr)})}var Jr=l(Ge,2);{var hi=q=>{var ye=Vh(),Re=Ye(ye),ze=h(Re),We=E(ze,!0),Ze=l(ze),Vt=l(Ze),ct=l(Vt);{var zt=vt=>{var tr=Bh();Ne(tr,21,()=>a(Ce),Yi,(yn,bs,pi)=>{var qn=$h();wt(qn,"aria-label",`Go to slide ${pi+1}`);let In;$(()=>In=cr(qn,1,"",null,In,{active:a(g)===pi})),P("click",qn,()=>d(g,pi,!0)),T(yn,qn)}),T(vt,tr)};ce(ct,vt=>{r()==="carousel"&&vt(zt)})}var Wt=l(ct),_n=E(Wt,!0),gn=l(Re,2),mn=E(gn),bn=l(gn,2),Wn=h(bn),wn=E(Wn,!0),br=l(Wn),Pr=l(br);{var jn=vt=>{var tr=Hh(),yn=E(tr,!0);$(()=>y(yn,a(I)?"less":"… more")),P("click",tr,()=>d(I,!a(I))),T(vt,tr)};ce(Pr,vt=>{a(ot).length>a(v)&&vt(jn)})}$(vt=>{wt(ze,"aria-pressed",a(b)),y(We,a(b)?"♥":"♡"),wt(Wt,"aria-pressed",a(m)),y(_n,a(m)?"▣":"♧"),y(mn,`${a(b)?1:0} local likes · ${a(m)?"Saved in preview":"Preview only"}`),y(wn,a(st)),y(br,` ${vt??""}`)},[()=>a(I)?a(ot):a(ot).slice(0,a(v))]),P("click",ze,()=>d(b,!a(b))),P("click",Ze,()=>d(N,!a(N))),P("click",Vt,oi),P("click",Wt,()=>d(m,!a(m))),T(q,ye)},zn=Ft(()=>a(s)==="instagram"&&!["story","reel"].includes(r()));ce(Jr,q=>{a(zn)&&q(hi)})}var Dt=l(Jr,2);{var er=q=>{var ye=zh(),Re=h(ye),ze=l(h(Re)),We=l(Re,2),Ze=h(We),Vt=E(Ze,!0),ct=l(Ze,2,!0);$((zt,Wt)=>{y(Vt,zt),y(ct,Wt)},[()=>a(ot).slice(0,a(v)),()=>a(ot).slice(a(v))]),He(ze,()=>a(v),zt=>d(v,zt)),T(q,ye)};ce(Dt,q=>{a(f)&&q(er)})}$(q=>xt=cr(Fe,1,"asset-stage",null,xt,{vertical:q}),[()=>["story","reel"].includes(r())]),P("pointerdown",Fe,q=>U=q.clientX),P("pointerup",Fe,q=>{Math.abs(q.clientX-U)>40&&oe(q.clientX<U?1:-1)}),P("dblclick",Fe,()=>{d(b,!0),d(j,"Liked in this simulation")}),T(k,Y)};ce(mr,k=>{a(s)==="grid"?k(fi):k(Ra,-1)})}var vs=l(mr,2);{var _s=k=>{var Y=qh(),Ve=l(h(Y));Ne(Ve,17,()=>a(S),Yi,(Fe,xt)=>{var Nt=jh(),Zt=E(Nt,!0);$(()=>y(Zt,a(xt))),T(Fe,Nt)});var Qe=l(Ve,2),kt=h(Qe);Si("submit",Qe,Fe=>{Fe.preventDefault(),Vi()}),He(kt,()=>a(R),Fe=>d(R,Fe)),T(k,Y)};ce(vs,k=>{a(N)&&k(_s)})}var vn=l(vs,2);{var ho=k=>{var Y=Gh(),Ve=E(Y,!0);$(()=>y(Ve,a(j))),T(k,Y)};ce(vn,k=>{a(j)&&k(ho)})}var po=l(fs,2),Pa=h(po),gs=l(h(Pa)),ms=l(Pa,2);{var vo=k=>{var Y=Kh(),Ve=Ye(Y),Qe=h(Ve),kt=h(Qe),Fe=E(kt,!0),xt=l(Qe),Nt=h(xt),Zt=E(Nt,!0),Ot=l(xt),_=h(Ot),w=E(_),A=l(_),L=l(Ot),ie=h(L),we=E(ie,!0),Oe=l(ie),nt=l(L),qe=h(nt),Ee=E(qe,!0);$(()=>{y(Fe,a(de).occludedElementsCount),y(Zt,a(de).overflowElementsCount),y(w,`${a(de).contrastRatio??"Unmeasured"??""}${a(de).contrastRatio!==null?":1":""}`),y(A,` minimum text/background contrast${a(de).unmeasuredColorCount?` · ${a(de).unmeasuredColorCount} unmeasured`:""}`),y(we,a(de).expectedAspectRatio),y(Oe,` target ratio · ${a(de).aspectRatioDeviation<=.01?"matched":"check dimensions"}`),y(Ee,a(de).firstLookCharacters)}),T(k,Y)},_o=k=>{var Y=Jh();T(k,Y)};ce(ms,k=>{a(de)?k(vo):k(_o,-1)})}$(k=>{Cr=cr(pn,1,"",null,Cr,{active:a(s)==="design"}),li=cr(Ht,1,"",null,li,{active:a(s)==="instagram"}),rt=cr(Hn,1,"",null,rt,{active:a(s)==="grid"}),y(ui,`${a(o)??""}%`),hs=cr(Kr,1,"phone",null,hs,{raw:a(s)==="design"}),ps=Ql(Kr,"",ps,{width:`${a(c)??""}px`,height:k,zoom:a(o)/100})},[()=>a(s)==="design"?"auto":`${Math.round(a(c)*874/402)}px`]),P("click",pn,()=>Qt("design")),P("click",Ht,()=>Qt("instagram")),P("click",Hn,()=>Qt("grid")),Ur(zi,()=>a(c),k=>d(c,k)),He(St,()=>a(o),k=>d(o,k)),Ws(co,()=>a(u),k=>d(u,k)),Ws(fo,()=>a(f),k=>d(f,k)),P("click",gs,hn),T(t,gr),hl()}Au(["click","pointerdown","pointerup","dblclick"]);const Qh=()=>{};var tc={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xu=function(t){const e=[];let r=0;for(let n=0;n<t.length;n++){let i=t.charCodeAt(n);i<128?e[r++]=i:i<2048?(e[r++]=i>>6|192,e[r++]=i&63|128):(i&64512)===55296&&n+1<t.length&&(t.charCodeAt(n+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++n)&1023),e[r++]=i>>18|240,e[r++]=i>>12&63|128,e[r++]=i>>6&63|128,e[r++]=i&63|128):(e[r++]=i>>12|224,e[r++]=i>>6&63|128,e[r++]=i&63|128)}return e},Zh=function(t){const e=[];let r=0,n=0;for(;r<t.length;){const i=t[r++];if(i<128)e[n++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[r++];e[n++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[r++],o=t[r++],c=t[r++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const s=t[r++],o=t[r++];e[n++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},Nu={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const r=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,c=o?t[i+1]:0,u=i+2<t.length,f=u?t[i+2]:0,v=s>>2,g=(s&3)<<4|c>>4;let b=(c&15)<<2|f>>6,m=f&63;u||(m=64,o||(b=64)),n.push(r[v],r[g],r[b],r[m])}return n.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(xu(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Zh(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const r=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let i=0;i<t.length;){const s=r[t.charAt(i++)],c=i<t.length?r[t.charAt(i)]:0;++i;const f=i<t.length?r[t.charAt(i)]:64;++i;const g=i<t.length?r[t.charAt(i)]:64;if(++i,s==null||c==null||f==null||g==null)throw new ep;const b=s<<2|c>>4;if(n.push(b),f!==64){const m=c<<4&240|f>>2;if(n.push(m),g!==64){const I=f<<6&192|g;n.push(I)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class ep extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const tp=function(t){const e=xu(t);return Nu.encodeByteArray(e,!0)},Ou=function(t){return tp(t).replace(/\./g,"")},Du=function(t){try{return Nu.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const np=()=>rp().__FIREBASE_DEFAULTS__,ip=()=>{if(typeof process>"u"||typeof tc>"u")return;const t=tc.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},ap=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Du(t[1]);return e&&JSON.parse(e)},kl=()=>{try{return Qh()||np()||ip()||ap()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},sp=t=>{var e,r;return(r=(e=kl())==null?void 0:e.emulatorHosts)==null?void 0:r[t]},Lu=()=>{var t;return(t=kl())==null?void 0:t.config},Mu=t=>{var e;return(e=kl())==null?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class op{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,r)=>{this.resolve=e,this.reject=r})}wrapCallback(e){return(r,n)=>{r?this.reject(r):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(r):e(r,n))}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function lp(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Bt())}function cp(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function up(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function dp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function fp(){const t=Bt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function hp(){try{return typeof indexedDB=="object"}catch{return!1}}function pp(){return new Promise((t,e)=>{try{let r=!0;const n="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(n);i.onsuccess=()=>{i.result.close(),r||self.indexedDB.deleteDatabase(n),t(!0)},i.onupgradeneeded=()=>{r=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(r){e(r)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vp="FirebaseError";class ai extends Error{constructor(e,r,n){super(r),this.code=e,this.customData=n,this.name=vp,Object.setPrototypeOf(this,ai.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ss.prototype.create)}}class ss{constructor(e,r,n){this.service=e,this.serviceName=r,this.errors=n}create(e,...r){const n=r[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?_p(s,n):"Error",c=`${this.serviceName}: ${o} (${i}).`;return new ai(i,c,n)}}function _p(t,e){try{let r=0,n="";for(;r<t.length;){const i=t.indexOf("{$",r);if(i===-1){n+=t.substring(r);break}const s=t.indexOf("}",i+2);if(s===-1){n+=t.substring(r);break}const o=t.substring(i+2,s),c=e[o];n+=t.substring(r,i)+(c!=null?String(c):`<${o}?>`),r=s+1}return n}catch{return t}}function gp(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function ha(t,e){if(t===e)return!0;const r=Object.keys(t),n=Object.keys(e);for(const i of r){if(!n.includes(i))return!1;const s=t[i],o=e[i];if(rc(s)&&rc(o)){if(!ha(s,o))return!1}else if(s!==o)return!1}for(const i of n)if(!r.includes(i))return!1;return!0}function rc(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function os(t){const e=[];for(const[r,n]of Object.entries(t))Array.isArray(n)?n.forEach(i=>{e.push(encodeURIComponent(r)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(r)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function mp(t,e){const r=new bp(t,e);return r.subscribe.bind(r)}class bp{constructor(e,r){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=r,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(r=>{r.next(e)})}error(e){this.forEachObserver(r=>{r.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,r,n){let i;if(e===void 0&&r===void 0&&n===void 0)throw new Error("Missing Observer.");wp(e,["next","error","complete"])?i=e:i={next:e,error:r,complete:n},i.next===void 0&&(i.next=Do),i.error===void 0&&(i.error=Do),i.complete===void 0&&(i.complete=Do);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let r=0;r<this.observers.length;r++)this.sendOne(r,e)}sendOne(e,r){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{r(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function wp(t,e){if(typeof t!="object"||t===null)return!1;for(const r of e)if(r in t&&typeof t[r]=="function")return!0;return!1}function Do(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function si(t){return t&&t._delegate?t._delegate:t}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tl(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function yp(t){return(await fetch(t,{credentials:"include"})).ok}class pa{constructor(e,r,n){this.name=e,this.instanceFactory=r,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ii="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ip{constructor(e,r){this.name=e,this.container=r,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const r=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(r)){const n=new op;if(this.instancesDeferred.set(r,n),this.isInitialized(r)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:r});i&&n.resolve(i)}catch{}}return this.instancesDeferred.get(r).promise}getImmediate(e){const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(n)return null;throw i}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Sp(e))try{this.getOrInitializeService({instanceIdentifier:Ii})}catch{}for(const[r,n]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(r);try{const s=this.getOrInitializeService({instanceIdentifier:i});n.resolve(s)}catch{}}}}clearInstance(e=Ii){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(r=>"INTERNAL"in r).map(r=>r.INTERNAL.delete()),...e.filter(r=>"_delete"in r).map(r=>r._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Ii){return this.instances.has(e)}getOptions(e=Ii){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:r={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:n,options:r});for(const[s,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);n===c&&o.resolve(i)}return i}onInit(e,r){const n=this.normalizeInstanceIdentifier(r),i=this.onInitCallbacks.get(n)??new Set;i.add(e),this.onInitCallbacks.set(n,i);const s=this.instances.get(n);return s&&e(s,n),()=>{i.delete(e)}}invokeOnInitCallbacks(e,r){const n=this.onInitCallbacks.get(r);if(n)for(const i of n)try{i(e,r)}catch{}}getOrInitializeService({instanceIdentifier:e,options:r={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:Ep(e),options:r}),this.instances.set(e,n),this.instancesOptions.set(e,r),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=Ii){return this.component?this.component.multipleInstances?e:Ii:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Ep(t){return t===Ii?void 0:t}function Sp(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kp{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const r=this.getProvider(e.name);if(r.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);r.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const r=new Ip(e,this);return this.providers.set(e,r),r}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ue;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Ue||(Ue={}));const Tp={debug:Ue.DEBUG,verbose:Ue.VERBOSE,info:Ue.INFO,warn:Ue.WARN,error:Ue.ERROR,silent:Ue.SILENT},Ap=Ue.INFO,Cp={[Ue.DEBUG]:"log",[Ue.VERBOSE]:"log",[Ue.INFO]:"info",[Ue.WARN]:"warn",[Ue.ERROR]:"error"},Rp=(t,e,...r)=>{if(e<t.logLevel)return;const n=new Date().toISOString(),i=Cp[e];if(i)console[i](`[${n}]  ${t.name}:`,...r);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Uu{constructor(e){this.name=e,this._logLevel=Ap,this._logHandler=Rp,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Ue))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Tp[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Ue.DEBUG,...e),this._logHandler(this,Ue.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Ue.VERBOSE,...e),this._logHandler(this,Ue.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Ue.INFO,...e),this._logHandler(this,Ue.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Ue.WARN,...e),this._logHandler(this,Ue.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Ue.ERROR,...e),this._logHandler(this,Ue.ERROR,...e)}}const Pp=(t,e)=>e.some(r=>t instanceof r);let nc,ic;function xp(){return nc||(nc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Np(){return ic||(ic=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Fu=new WeakMap,nl=new WeakMap,$u=new WeakMap,Lo=new WeakMap,Al=new WeakMap;function Op(t){const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{r(ni(t.result)),i()},o=()=>{n(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(r=>{r instanceof IDBCursor&&Fu.set(r,t)}).catch(()=>{}),Al.set(e,t),e}function Dp(t){if(nl.has(t))return;const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{r(),i()},o=()=>{n(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});nl.set(t,e)}let il={get(t,e,r){if(t instanceof IDBTransaction){if(e==="done")return nl.get(t);if(e==="objectStoreNames")return t.objectStoreNames||$u.get(t);if(e==="store")return r.objectStoreNames[1]?void 0:r.objectStore(r.objectStoreNames[0])}return ni(t[e])},set(t,e,r){return t[e]=r,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Lp(t){il=t(il)}function Mp(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...r){const n=t.call(Mo(this),e,...r);return $u.set(n,e.sort?e.sort():[e]),ni(n)}:Np().includes(t)?function(...e){return t.apply(Mo(this),e),ni(Fu.get(this))}:function(...e){return ni(t.apply(Mo(this),e))}}function Up(t){return typeof t=="function"?Mp(t):(t instanceof IDBTransaction&&Dp(t),Pp(t,xp())?new Proxy(t,il):t)}function ni(t){if(t instanceof IDBRequest)return Op(t);if(Lo.has(t))return Lo.get(t);const e=Up(t);return e!==t&&(Lo.set(t,e),Al.set(e,t)),e}const Mo=t=>Al.get(t);function Fp(t,e,{blocked:r,upgrade:n,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),c=ni(o);return n&&o.addEventListener("upgradeneeded",u=>{n(ni(o.result),u.oldVersion,u.newVersion,ni(o.transaction),u)}),r&&o.addEventListener("blocked",u=>r(u.oldVersion,u.newVersion,u)),c.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",f=>i(f.oldVersion,f.newVersion,f))}).catch(()=>{}),c}const $p=["get","getKey","getAll","getAllKeys","count"],Bp=["put","add","delete","clear"],Uo=new Map;function ac(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Uo.get(e))return Uo.get(e);const r=e.replace(/FromIndex$/,""),n=e!==r,i=Bp.includes(r);if(!(r in(n?IDBIndex:IDBObjectStore).prototype)||!(i||$p.includes(r)))return;const s=async function(o,...c){const u=this.transaction(o,i?"readwrite":"readonly");let f=u.store;return n&&(f=f.index(c.shift())),(await Promise.all([f[r](...c),i&&u.done]))[0]};return Uo.set(e,s),s}Lp(t=>({...t,get:(e,r,n)=>ac(e,r)||t.get(e,r,n),has:(e,r)=>!!ac(e,r)||t.has(e,r)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hp{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(r=>{if(Vp(r)){const n=r.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(r=>r).join(" ")}}function Vp(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const al="@firebase/app",sc="0.16.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Un=new Uu("@firebase/app"),zp="@firebase/app-compat",Wp="@firebase/analytics-compat",jp="@firebase/analytics",qp="@firebase/app-check-compat",Gp="@firebase/app-check",Kp="@firebase/auth",Jp="@firebase/auth-compat",Yp="@firebase/database",Xp="@firebase/data-connect",Qp="@firebase/database-compat",Zp="@firebase/functions",ev="@firebase/functions-compat",tv="@firebase/installations",rv="@firebase/installations-compat",nv="@firebase/messaging",iv="@firebase/messaging-compat",av="@firebase/performance",sv="@firebase/performance-compat",ov="@firebase/remote-config",lv="@firebase/remote-config-compat",cv="@firebase/storage",uv="@firebase/storage-compat",dv="@firebase/firestore",fv="@firebase/ai",hv="@firebase/firestore-compat",pv="firebase",vv="12.19.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sl="[DEFAULT]",_v={[al]:"fire-core",[zp]:"fire-core-compat",[jp]:"fire-analytics",[Wp]:"fire-analytics-compat",[Gp]:"fire-app-check",[qp]:"fire-app-check-compat",[Kp]:"fire-auth",[Jp]:"fire-auth-compat",[Yp]:"fire-rtdb",[Xp]:"fire-data-connect",[Qp]:"fire-rtdb-compat",[Zp]:"fire-fn",[ev]:"fire-fn-compat",[tv]:"fire-iid",[rv]:"fire-iid-compat",[nv]:"fire-fcm",[iv]:"fire-fcm-compat",[av]:"fire-perf",[sv]:"fire-perf-compat",[ov]:"fire-rc",[lv]:"fire-rc-compat",[cv]:"fire-gcs",[uv]:"fire-gcs-compat",[dv]:"fire-fst",[hv]:"fire-fst-compat",[fv]:"fire-vertex","fire-js":"fire-js",[pv]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const js=new Map,gv=new Map,ol=new Map;function oc(t,e){try{t.container.addComponent(e)}catch(r){Un.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,r)}}function Ka(t){const e=t.name;if(ol.has(e))return Un.debug(`There were multiple attempts to register component ${e}.`),!1;ol.set(e,t);for(const r of js.values())oc(r,t);for(const r of gv.values())oc(r,t);return!0}function Bu(t,e){const r=t.container.getProvider("heartbeat").getImmediate({optional:!0});return r&&r.triggerHeartbeat(),t.container.getProvider(e)}function sn(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mv={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Nn=new ss("app","Firebase",mv);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bv{constructor(e,r,n){this._isDeleted=!1,this._options={...e},this._config={...r},this._name=r.name,this._automaticDataCollectionEnabled=r.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new pa("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Nn.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ls=vv;function Hu(t,e={}){let r=t;typeof e!="object"&&(e={name:e});const n={name:sl,automaticDataCollectionEnabled:!0,...e},i=n.name;if(typeof i!="string"||!i)throw Nn.create("bad-app-name",{appName:String(i)});if(r||(r=Lu()),!r)throw Nn.create("no-options");const s=js.get(i);if(s)if(ha(r,s.options)){if(ha(n,s.config))return s;throw Nn.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(s.config),newValue:JSON.stringify(n)})}else throw Nn.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(s.options),newValue:JSON.stringify(r)});const o=new kp(i);for(const u of ol.values())o.addComponent(u);const c=new bv(r,n,o);return js.set(i,c),c}function wv(t=sl){const e=js.get(t);if(!e&&t===sl&&Lu())return Hu();if(!e)throw Nn.create("no-app",{appName:t});return e}function Qi(t,e,r){let n=_v[t]??t;r&&(n+=`-${r}`);const i=n.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${n}" with version "${e}":`];i&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Un.warn(o.join(" "));return}Ka(new pa(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yv="firebase-heartbeat-database",Iv=1,Ja="firebase-heartbeat-store";let Fo=null;function Vu(){return Fo||(Fo=Fp(yv,Iv,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Ja)}catch(r){console.warn(r)}}}}).catch(t=>{throw Nn.create("idb-open",{originalErrorMessage:t.message})})),Fo}async function Ev(t){try{const r=(await Vu()).transaction(Ja),n=await r.objectStore(Ja).get(zu(t));return await r.done,n}catch(e){if(e instanceof ai)Un.warn(e.message);else{const r=Nn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Un.warn(r.message)}}}async function lc(t,e){try{const n=(await Vu()).transaction(Ja,"readwrite");await n.objectStore(Ja).put(e,zu(t)),await n.done}catch(r){if(r instanceof ai)Un.warn(r.message);else{const n=Nn.create("idb-set",{originalErrorMessage:r==null?void 0:r.message});Un.warn(n.message)}}}function zu(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sv=1024,kv=30;class Tv{constructor(e){this.container=e,this._heartbeatsCache=null;const r=this.container.getProvider("app").getImmediate();this._storage=new Cv(r),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,r;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=cc();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((r=this._heartbeatsCache)==null?void 0:r.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>kv){const o=Rv(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){Un.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const r=cc(),{heartbeatsToSend:n,unsentEntries:i}=Av(this._heartbeatsCache.heartbeats),s=Ou(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=r,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(r){return Un.warn(r),""}}}function cc(){return new Date().toISOString().substring(0,10)}function Av(t,e=Sv){const r=[];let n=t.slice();for(const i of t){const s=r.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),uc(r)>e){s.dates.pop();break}}else if(r.push({agent:i.agent,dates:[i.date]}),uc(r)>e){r.pop();break}n=n.slice(1)}return{heartbeatsToSend:r,unsentEntries:n}}class Cv{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return hp()?pp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const r=await Ev(this.app);return r!=null&&r.heartbeats?r:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return lc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return lc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function uc(t){return Ou(JSON.stringify({version:2,heartbeats:t})).length}function Rv(t){if(t.length===0)return-1;let e=0,r=t[0].date;for(let n=1;n<t.length;n++)t[n].date<r&&(r=t[n].date,e=n);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pv(t){Ka(new pa("platform-logger",e=>new Hp(e),"PRIVATE")),Ka(new pa("heartbeat",e=>new Tv(e),"PRIVATE")),Qi(al,sc,t),Qi(al,sc,"esm2020"),Qi("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Pv("");var xv="firebase",Nv="12.19.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Qi(xv,Nv,"app");function Wu(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Ov=Wu,ju=new ss("auth","Firebase",Wu());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qs=new Uu("@firebase/auth");function Os(t,...e){qs.logLevel<=Ue.WARN&&qs.warn(`Auth (${ls}): ${t}`,...e)}function Ds(t,...e){qs.logLevel<=Ue.ERROR&&qs.error(`Auth (${ls}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fn(t,...e){throw Cl(t,...e)}function jr(t,...e){return Cl(t,...e)}function ao(t,e,r){const n={...Ov(),[e]:r};return new ss("auth","Firebase",n).create(e,{appName:t.name})}function Ui(t){return ao(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Dv(t,e,r){const n=r;if(!(e instanceof n))throw n.name!==e.constructor.name&&fn(t,"argument-error"),ao(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Cl(t,...e){if(typeof t!="string"){const r=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=t.name),t._errorFactory.create(r,...n)}return ju.create(t,...e)}function J(t,e,...r){if(!t)throw Cl(e,...r)}function On(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ds(e),new Error(e)}function Fn(t,e){t||On(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ll(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function Lv(){return dc()==="http:"||dc()==="https:"}function dc(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mv(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Lv()||up()||"connection"in navigator)?navigator.onLine:!0}function Uv(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cs{constructor(e,r){this.shortDelay=e,this.longDelay=r,Fn(r>e,"Short delay should be less than long delay!"),this.isMobile=lp()||dp()}get(){return Mv()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rl(t,e){Fn(t.emulator,"Emulator should always be set here");const{url:r}=t.emulator;return e?`${r}${e.startsWith("/")?e.slice(1):e}`:r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qu{static initialize(e,r,n){this.fetchImpl=e,r&&(this.headersImpl=r),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;On("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;On("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;On("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fv={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $v=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Bv=new cs(3e4,6e4);function Pl(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function wa(t,e,r,n,i={}){return Gu(t,i,async()=>{let s={},o={};n&&(e==="GET"?o=n:s={body:JSON.stringify(n)});const c=os({...o,key:t.config.apiKey}).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const f={method:e,headers:u,...s};return cp()||(f.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&Tl(t.emulatorConfig.host)&&(f.credentials="include"),qu.fetch()(await Ku(t,t.config.apiHost,r,c),f)})}async function Gu(t,e,r){t._canInitEmulator=!1;const n={...Fv,...e};try{const i=new Vv(t),s=await Promise.race([r(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw As(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const c=s.ok?o.errorMessage:o.error.message,[u,f]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw As(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw As(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw As(t,"user-disabled",o);const v=n[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(f)throw ao(t,v,f);fn(t,v)}}catch(i){if(i instanceof ai)throw i;fn(t,"network-request-failed",{message:String(i)})}}async function Hv(t,e,r,n,i={}){const s=await wa(t,e,r,n,i);return"mfaPendingCredential"in s&&fn(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function Ku(t,e,r,n){const i=`${e}${r}?${n}`,s=t,o=s.config.emulator?Rl(t.config,i):`${t.config.apiScheme}://${i}`;return $v.includes(r)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class Vv{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((r,n)=>{this.timer=setTimeout(()=>n(jr(this.auth,"network-request-failed")),Bv.get())})}}function As(t,e,r){const n={appName:t.name};r.email&&(n.email=r.email),r.phoneNumber&&(n.phoneNumber=r.phoneNumber);const i=jr(t,e,n);return i.customData._tokenResponse=r,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zv(t,e){return wa(t,"POST","/v1/accounts:delete",e)}async function Gs(t,e){return wa(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Va(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Wv(t,e=!1){const r=si(t),n=await r.getIdToken(e),i=xl(n);J(i&&i.exp&&i.auth_time&&i.iat,r.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:n,authTime:Va($o(i.auth_time)),issuedAtTime:Va($o(i.iat)),expirationTime:Va($o(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function $o(t){return Number(t)*1e3}function xl(t){const[e,r,n]=t.split(".");if(e===void 0||r===void 0||n===void 0)return Ds("JWT malformed, contained fewer than 3 sections"),null;try{const i=Du(r);return i?JSON.parse(i):(Ds("Failed to decode base64 JWT payload"),null)}catch(i){return Ds("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function fc(t){const e=xl(t);return J(e,"internal-error"),J(typeof e.exp<"u","internal-error"),J(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ya(t,e,r=!1){if(r)return e;try{return await e}catch(n){throw n instanceof ai&&jv(n)&&t.auth.currentUser===t&&await t.auth.signOut(),n}}function jv({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qv{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const r=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},r)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cl{constructor(e,r){this.createdAt=e,this.lastLoginAt=r,this._initializeTime()}_initializeTime(){this.lastSignInTime=Va(this.lastLoginAt),this.creationTime=Va(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ks(t){var g;const e=t.auth,r=await t.getIdToken(),n=await Ya(t,Gs(e,{idToken:r}));J(n==null?void 0:n.users.length,e,"internal-error");const i=n.users[0];t._notifyReloadListener(i);const s=(g=i.providerUserInfo)!=null&&g.length?Ju(i.providerUserInfo):[],o=Kv(t.providerData,s),c=t.isAnonymous,u=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),f=c?u:!1,v={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new cl(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(t,v)}async function Gv(t){const e=si(t);await Ks(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Kv(t,e){return[...t.filter(n=>!e.some(i=>i.providerId===n.providerId)),...e]}function Ju(t){return t.map(({providerId:e,...r})=>({providerId:e,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jv(t,e){const r=await Gu(t,{},async()=>{const n=os({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await Ku(t,i,"/v1/token",`key=${s}`),c=await t._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:n};return t.emulatorConfig&&Tl(t.emulatorConfig.host)&&(u.credentials="include"),qu.fetch()(o,u)});return{accessToken:r.access_token,expiresIn:r.expires_in,refreshToken:r.refresh_token}}async function Yv(t,e){return wa(t,"POST","/v2/accounts:revokeToken",Pl(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){J(e.idToken,"internal-error"),J(typeof e.idToken<"u","internal-error"),J(typeof e.refreshToken<"u","internal-error");const r="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):fc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,r)}updateFromIdToken(e){J(e.length!==0,"internal-error");const r=fc(e);this.updateTokensAndExpiration(e,null,r)}async getToken(e,r=!1){return!r&&this.accessToken&&!this.isExpired?this.accessToken:(J(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,r){const{accessToken:n,refreshToken:i,expiresIn:s}=await Jv(e,r);this.updateTokensAndExpiration(n,i,Number(s))}updateTokensAndExpiration(e,r,n){this.refreshToken=r||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,r){const{refreshToken:n,accessToken:i,expirationTime:s}=r,o=new Zi;return n&&(J(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),i&&(J(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(J(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Zi,this.toJSON())}_performRefresh(){return On("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kn(t,e){J(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class zr{constructor({uid:e,auth:r,stsTokenManager:n,...i}){this.providerId="firebase",this.proactiveRefresh=new qv(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=r,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new cl(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const r=await Ya(this,this.stsTokenManager.getToken(this.auth,e));return J(r,this.auth,"internal-error"),this.accessToken!==r&&(this.accessToken=r,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),r}getIdTokenResult(e){return Wv(this,e)}reload(){return Gv(this)}_assign(e){this!==e&&(J(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(r=>({...r})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const r=new zr({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return r.metadata._copy(this.metadata),r}_onReload(e){J(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,r=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),r&&await Ks(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(sn(this.auth.app))return Promise.reject(Ui(this.auth));const e=await this.getIdToken();return await Ya(this,zv(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,r){const n=r.displayName??void 0,i=r.email??void 0,s=r.phoneNumber??void 0,o=r.photoURL??void 0,c=r.tenantId??void 0,u=r._redirectEventId??void 0,f=r.createdAt??void 0,v=r.lastLoginAt??void 0,{uid:g,emailVerified:b,isAnonymous:m,providerData:I,stsTokenManager:R}=r;J(g&&R,e,"internal-error");const S=Zi.fromJSON(this.name,R);J(typeof g=="string",e,"internal-error"),Kn(n,e.name),Kn(i,e.name),J(typeof b=="boolean",e,"internal-error"),J(typeof m=="boolean",e,"internal-error"),Kn(s,e.name),Kn(o,e.name),Kn(c,e.name),Kn(u,e.name),Kn(f,e.name),Kn(v,e.name);const N=new zr({uid:g,auth:e,email:i,emailVerified:b,displayName:n,isAnonymous:m,photoURL:o,phoneNumber:s,tenantId:c,stsTokenManager:S,createdAt:f,lastLoginAt:v});return I&&Array.isArray(I)&&(N.providerData=I.map(j=>({...j}))),u&&(N._redirectEventId=u),N}static async _fromIdTokenResponse(e,r,n=!1){const i=new Zi;i.updateFromServerResponse(r);const s=new zr({uid:r.localId,auth:e,stsTokenManager:i,isAnonymous:n});return await Ks(s),s}static async _fromGetAccountInfoResponse(e,r,n){const i=r.users[0];J(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?Ju(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new Zi;c.updateFromIdToken(n);const u=new zr({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:o}),f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new cl(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,f),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hc=new Map;function Dn(t){Fn(t instanceof Function,"Expected a class definition");let e=hc.get(t);return e?(Fn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,hc.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yu{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,r){this.storage[e]=r}async _get(e){const r=this.storage[e];return r===void 0?null:r}async _remove(e){delete this.storage[e]}_addListener(e,r){}_removeListener(e,r){}}Yu.type="NONE";const pc=Yu;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ls(t,e,r){return`firebase:${t}:${e}:${r}`}class Fi{constructor(e,r,n){this.persistence=e,this.auth=r,this.userKey=n;const{config:i,name:s}=this.auth;this.fullUserKey=Ls(this.userKey,i.apiKey,s),this.fullPersistenceKey=Ls("persistence",i.apiKey,s),this.boundEventHandler=r._onStorageEvent.bind(r);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const r=await Gs(this.auth,{idToken:e}).catch(()=>{});return r?zr._fromGetAccountInfoResponse(this.auth,r,e):null}return zr._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const r=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,r)return this.setCurrentUser(r)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,r,n="authUser"){if(!r.length)return new Fi(Dn(pc),e,n);const i=(await Promise.all(r.map(async f=>{try{if(await f._isAvailable())return f}catch{return}}))).filter(f=>f);let s=i[0]||Dn(pc);const o=Ls(n,e.config.apiKey,e.name);let c=null;for(const f of r)try{const v=await f._get(o);if(v){let g;if(typeof v=="string"){const b=await Gs(e,{idToken:v}).catch(()=>{});if(!b)break;g=await zr._fromGetAccountInfoResponse(e,b,v)}else g=zr._fromJSON(e,v);f!==s&&(c=g),s=f;break}}catch{}const u=i.filter(f=>f._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Fi(s,e,n):(s=u[0],c&&await s._set(o,c.toJSON()),await Promise.all(r.map(async f=>{if(f!==s)try{await f._remove(o)}catch{}})),new Fi(s,e,n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vc(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(ed(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Xu(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(rd(e))return"Blackberry";if(nd(e))return"Webos";if(Qu(e))return"Safari";if((e.includes("chrome/")||Zu(e))&&!e.includes("edge/"))return"Chrome";if(td(e))return"Android";{const r=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=t.match(r);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function Xu(t=Bt()){return/firefox\//i.test(t)}function Qu(t=Bt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Zu(t=Bt()){return/crios\//i.test(t)}function ed(t=Bt()){return/iemobile/i.test(t)}function td(t=Bt()){return/android/i.test(t)}function rd(t=Bt()){return/blackberry/i.test(t)}function nd(t=Bt()){return/webos/i.test(t)}function Nl(t=Bt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Xv(t=Bt()){var e;return Nl(t)&&!!((e=window.navigator)!=null&&e.standalone)}function Qv(){return fp()&&document.documentMode===10}function id(t=Bt()){return Nl(t)||td(t)||nd(t)||rd(t)||/windows phone/i.test(t)||ed(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ad(t,e=[]){let r;switch(t){case"Browser":r=vc(Bt());break;case"Worker":r=`${vc(Bt())}-${t}`;break;default:r=t}const n=e.length?e.join(","):"FirebaseCore-web";return`${r}/JsCore/${ls}/${n}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zv{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,r){const n=s=>new Promise((o,c)=>{try{const u=e(s);o(u)}catch(u){c(u)}});n.onAbort=r,this.queue.push(n);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const r=[];try{for(const n of this.queue)await n(e),n.onAbort&&r.push(n.onAbort)}catch(n){r.reverse();for(const i of r)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function e_(t,e={}){return wa(t,"GET","/v2/passwordPolicy",Pl(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const t_=6;class r_{constructor(e){var n;const r=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=r.minPasswordLength??t_,r.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=r.maxPasswordLength),r.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=r.containsLowercaseCharacter),r.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=r.containsUppercaseCharacter),r.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=r.containsNumericCharacter),r.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=r.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const r={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,r),this.validatePasswordCharacterOptions(e,r),r.isValid&&(r.isValid=r.meetsMinPasswordLength??!0),r.isValid&&(r.isValid=r.meetsMaxPasswordLength??!0),r.isValid&&(r.isValid=r.containsLowercaseLetter??!0),r.isValid&&(r.isValid=r.containsUppercaseLetter??!0),r.isValid&&(r.isValid=r.containsNumericCharacter??!0),r.isValid&&(r.isValid=r.containsNonAlphanumericCharacter??!0),r}validatePasswordLengthOptions(e,r){const n=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;n&&(r.meetsMinPasswordLength=e.length>=n),i&&(r.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,r){this.updatePasswordCharacterOptionsStatuses(r,!1,!1,!1,!1);let n;for(let i=0;i<e.length;i++)n=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(r,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,r,n,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=r)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n_{constructor(e,r,n,i){this.app=e,this.heartbeatServiceProvider=r,this.appCheckServiceProvider=n,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new _c(this),this.idTokenSubscription=new _c(this),this.beforeStateQueue=new Zv(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=ju,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,r){return r&&(this._popupRedirectResolver=Dn(r)),this._initializationPromise=this.queue(async()=>{var n,i,s;if(!this._deleted){try{this.persistenceManager=await Fi.create(this,e)}catch(o){Os(`Failed to initialize persistence: ${o}`),this.persistenceManager=await Fi.create(this,[])}finally{(n=this._resolvePersistenceManagerAvailable)==null||n.call(this)}if(!this._deleted){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(r)}catch(o){Os(`Failed to initialize current user: ${o}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const r=await Gs(this,{idToken:e}),n=await zr._fromGetAccountInfoResponse(this,r,e);await this.directlySetCurrentUser(n)}catch(r){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",r),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(sn(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let n=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=n==null?void 0:n._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(n=u.user,i=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return J(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let r=null;try{r=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return r}async reloadAndSetCurrentUserOrClear(e){try{await Ks(e)}catch(r){if((r==null?void 0:r.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Uv()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(sn(this.app))return Promise.reject(Ui(this));const r=e?si(e):null;return r&&J(r.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(r&&r._clone(this))}async _updateCurrentUser(e,r=!1){if(!this._deleted)return e&&J(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),r||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return sn(this.app)?Promise.reject(Ui(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return sn(this.app)?Promise.reject(Ui(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Dn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const r=this._getPasswordPolicyInternal();return r.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):r.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await e_(this),r=new r_(e);this.tenantId===null?this._projectPasswordPolicy=r:this._tenantPasswordPolicies[this.tenantId]=r}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ss("auth","Firebase",e())}onAuthStateChanged(e,r,n){return this.registerStateListener(this.authStateSubscription,e,r,n)}beforeAuthStateChanged(e,r){return this.beforeStateQueue.pushCallback(e,r)}onIdTokenChanged(e,r,n){return this.registerStateListener(this.idTokenSubscription,e,r,n)}authStateReady(){return new Promise((e,r)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},r)}})}async revokeAccessToken(e){if(this.currentUser){const r=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:r};this.tenantId!=null&&(n.tenantId=this.tenantId),await Yv(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,r){const n=await this.getOrInitRedirectPersistenceManager(r);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const r=e&&Dn(e)||this._popupRedirectResolver;J(r,this,"argument-error"),this.redirectPersistenceManager=await Fi.create(this,[Dn(r._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var r,n;return this._isInitialized&&await this.queue(async()=>{}),((r=this._currentUser)==null?void 0:r._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var r;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((r=this.currentUser)==null?void 0:r.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,r,n,i){if(this._deleted)return()=>{};const s=typeof r=="function"?r:r.next.bind(r);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(J(c,this,"internal-error"),c.then(()=>{o||s(this.currentUser)}).catch(u=>{if(!o)if(typeof r!="function"&&r.error)r.error(u);else if(n)n(u);else throw u}),typeof r=="function"){const u=e.addObserver(r,n,i);return()=>{o=!0,u()}}else{const u=e.addObserver(r);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(r){const n=(r==null?void 0:r.message)||String(r),i=ao(this,"internal-error",`An internal AuthError has occurred: ${n}`);throw i.customData={originalError:r},i}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return J(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ad(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const r=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());r&&(e["X-Firebase-Client"]=r);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var r;if(sn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((r=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getToken());return e!=null&&e.error&&Os(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function so(t){return si(t)}class _c{constructor(e){this.auth=e,this.observer=null,this.addObserver=mp(r=>this.observer=r)}get next(){return J(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ol={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function i_(t){Ol=t}function a_(t){return Ol.loadJS(t)}function s_(){return Ol.gapiScript}function o_(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function l_(t,e){const r=Bu(t,"auth");if(r.isInitialized()){const i=r.getImmediate(),s=r.getOptions();if(ha(s,e??{}))return i;fn(i,"already-initialized")}return r.initialize({options:e})}function c_(t,e){const r=(e==null?void 0:e.persistence)||[],n=(Array.isArray(r)?r:[r]).map(Dn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function sd(t,e,r){const n=so(t);J(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const i=!1,s=od(e),{host:o,port:c}=u_(e),u=c===null?"":`:${c}`,f={url:`${s}//${o}${u}/`},v=Object.freeze({host:o,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!n._canInitEmulator){J(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),J(ha(f,n.config.emulator)&&ha(v,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=f,n.emulatorConfig=v,n.settings.appVerificationDisabledForTesting=!0,Tl(o)?yp(`${s}//${o}${u}`):d_()}function od(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function u_(t){const e=od(t),r=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!r)return{host:"",port:null};const n=r[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(n);if(i){const s=i[1];return{host:s,port:gc(n.substr(s.length+1))}}else{const[s,o]=n.split(":");return{host:s,port:gc(o)}}}function gc(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function d_(){function t(){const e=document.createElement("p"),r=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",r.position="fixed",r.width="100%",r.backgroundColor="#ffffff",r.border=".1em solid #000000",r.color="#b50000",r.bottom="0px",r.left="0px",r.margin="0px",r.zIndex="10000",r.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ld{constructor(e,r){this.providerId=e,this.signInMethod=r}toJSON(){return On("not implemented")}_getIdTokenResponse(e){return On("not implemented")}_linkToIdToken(e,r){return On("not implemented")}_getReauthenticationResolver(e){return On("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ea(t,e){return Hv(t,"POST","/v1/accounts:signInWithIdp",Pl(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f_="http://localhost";class Hi extends ld{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const r=new Hi(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(r.idToken=e.idToken),e.accessToken&&(r.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(r.nonce=e.nonce),e.pendingToken&&(r.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(r.accessToken=e.oauthToken,r.secret=e.oauthTokenSecret):fn("argument-error"),r}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const r=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:i,...s}=r;if(!n||!i)return null;const o=new Hi(n,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const r=this.buildRequest();return ea(e,r)}_linkToIdToken(e,r){const n=this.buildRequest();return n.idToken=r,ea(e,n)}_getReauthenticationResolver(e){const r=this.buildRequest();return r.autoCreate=!1,ea(e,r)}buildRequest(){const e={requestUri:f_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const r={};this.idToken&&(r.id_token=this.idToken),this.accessToken&&(r.access_token=this.accessToken),this.secret&&(r.oauth_token_secret=this.secret),r.providerId=this.providerId,this.nonce&&!this.pendingToken&&(r.nonce=this.nonce),e.postBody=os(r)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dl{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us extends Dl{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yn extends us{constructor(){super("facebook.com")}static credential(e){return Hi._fromParams({providerId:Yn.PROVIDER_ID,signInMethod:Yn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Yn.credentialFromTaggedObject(e)}static credentialFromError(e){return Yn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Yn.credential(e.oauthAccessToken)}catch{return null}}}Yn.FACEBOOK_SIGN_IN_METHOD="facebook.com";Yn.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rn extends us{constructor(){super("google.com"),this.addScope("profile")}static credential(e,r){return Hi._fromParams({providerId:Rn.PROVIDER_ID,signInMethod:Rn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:r})}static credentialFromResult(e){return Rn.credentialFromTaggedObject(e)}static credentialFromError(e){return Rn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:r,oauthAccessToken:n}=e;if(!r&&!n)return null;try{return Rn.credential(r,n)}catch{return null}}}Rn.GOOGLE_SIGN_IN_METHOD="google.com";Rn.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn extends us{constructor(){super("github.com")}static credential(e){return Hi._fromParams({providerId:Xn.PROVIDER_ID,signInMethod:Xn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Xn.credentialFromTaggedObject(e)}static credentialFromError(e){return Xn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Xn.credential(e.oauthAccessToken)}catch{return null}}}Xn.GITHUB_SIGN_IN_METHOD="github.com";Xn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qn extends us{constructor(){super("twitter.com")}static credential(e,r){return Hi._fromParams({providerId:Qn.PROVIDER_ID,signInMethod:Qn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:r})}static credentialFromResult(e){return Qn.credentialFromTaggedObject(e)}static credentialFromError(e){return Qn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:r,oauthTokenSecret:n}=e;if(!r||!n)return null;try{return Qn.credential(r,n)}catch{return null}}}Qn.TWITTER_SIGN_IN_METHOD="twitter.com";Qn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class va{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,r,n,i=!1){const s=await zr._fromIdTokenResponse(e,n,i),o=mc(n);return new va({user:s,providerId:o,_tokenResponse:n,operationType:r})}static async _forOperation(e,r,n){await e._updateTokensIfNecessary(n,!0);const i=mc(n);return new va({user:e,providerId:i,_tokenResponse:n,operationType:r})}}function mc(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Js extends ai{constructor(e,r,n,i){super(r.code,r.message),this.operationType=n,this.user=i,Object.setPrototypeOf(this,Js.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:r.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,r,n,i){return new Js(e,r,n,i)}}function cd(t,e,r,n){return(e==="reauthenticate"?r._getReauthenticationResolver(t):r._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Js._fromErrorAndOperation(t,s,e,n):s})}async function h_(t,e,r=!1){const n=await Ya(t,e._linkToIdToken(t.auth,await t.getIdToken()),r);return va._forOperation(t,"link",n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function p_(t,e,r=!1){const{auth:n}=t;if(sn(n.app))return Promise.reject(Ui(n));const i="reauthenticate";try{const s=await Ya(t,cd(n,i,e,t),r);J(s.idToken,n,"internal-error");const o=xl(s.idToken);J(o,n,"internal-error");const{sub:c}=o;return J(t.uid===c,n,"user-mismatch"),va._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&fn(n,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function v_(t,e,r=!1){if(sn(t.app))return Promise.reject(Ui(t));const n="signIn",i=await cd(t,n,e),s=await va._fromIdTokenResponse(t,n,i);return r||await t._updateCurrentUser(s.user),s}function __(t,e,r,n){return si(t).onIdTokenChanged(e,r,n)}function g_(t,e,r){return si(t).beforeAuthStateChanged(e,r)}function m_(t,e,r,n){return si(t).onAuthStateChanged(e,r,n)}function b_(t){return si(t).signOut()}const Ys="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ud{constructor(e,r){this.storageRetriever=e,this.type=r}_isAvailable(){try{return this.storage?(this.storage.setItem(Ys,"1"),this.storage.removeItem(Ys),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,r){return this.storage.setItem(e,JSON.stringify(r)),Promise.resolve()}_get(e){const r=this.storage.getItem(e);return Promise.resolve(r?JSON.parse(r):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const w_=1e3,y_=10;class dd extends ud{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,r)=>this.onStorageEvent(e,r),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=id(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const r of Object.keys(this.listeners)){const n=this.storage.getItem(r),i=this.localCache[r];n!==i&&e(r,i,n)}}onStorageEvent(e,r=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const n=e.key;r?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(n);!r&&this.localCache[n]===o||this.notifyListeners(n,o)},s=this.storage.getItem(n);Qv()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,y_):i()}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r&&JSON.parse(r))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,r,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:r,newValue:n}),!0)})},w_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,r){await super._set(e,r),this.localCache[e]=JSON.stringify(r)}async _get(e){const r=await super._get(e);return this.localCache[e]=JSON.stringify(r),r}async _remove(e){await super._remove(e),delete this.localCache[e]}}dd.type="LOCAL";const I_=dd;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fd extends ud{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,r){}_removeListener(e,r){}}fd.type="SESSION";const hd=fd;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function E_(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(r){return{fulfilled:!1,reason:r}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const r=this.receivers.find(i=>i.isListeningto(e));if(r)return r;const n=new oo(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const r=e,{eventId:n,eventType:i,data:s}=r.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;r.ports[0].postMessage({status:"ack",eventId:n,eventType:i});const c=Array.from(o).map(async f=>f(r.origin,s)),u=await E_(c);r.ports[0].postMessage({status:"done",eventId:n,eventType:i,response:u})}_subscribe(e,r){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(r)}_unsubscribe(e,r){this.handlersMap[e]&&r&&this.handlersMap[e].delete(r),(!r||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}oo.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ll(t="",e=10){let r="";for(let n=0;n<e;n++)r+=Math.floor(Math.random()*10);return t+r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,r,n=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((c,u)=>{const f=Ll("",20);i.port1.start();const v=setTimeout(()=>{u(new Error("unsupported_event"))},n);o={messageChannel:i,onMessage(g){const b=g;if(b.data.eventId===f)switch(b.data.status){case"ack":clearTimeout(v),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(b.data.response);break;default:clearTimeout(v),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:f,data:r},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function un(){return window}function k_(t){un().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pd(){return typeof un().WorkerGlobalScope<"u"&&typeof un().importScripts=="function"}async function T_(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function A_(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function C_(){return pd()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vd="firebaseLocalStorageDb",R_=1,Xs="firebaseLocalStorage",_d="fbase_key";class ds{constructor(e){this.request=e}toPromise(){return new Promise((e,r)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{r(this.request.error)})})}}function lo(t,e){return t.transaction([Xs],e?"readwrite":"readonly").objectStore(Xs)}function P_(){const t=indexedDB.deleteDatabase(vd);return new ds(t).toPromise()}function gd(){const t=indexedDB.open(vd,R_);return new Promise((e,r)=>{t.addEventListener("error",()=>{r(t.error)}),t.addEventListener("upgradeneeded",()=>{const n=t.result;try{n.createObjectStore(Xs,{keyPath:_d})}catch(i){r(i)}}),t.addEventListener("success",async()=>{const n=t.result;n.objectStoreNames.contains(Xs)?e(n):(n.close(),await P_(),e(await gd()))})})}async function bc(t,e,r){const n=lo(t,!0).put({[_d]:e,value:r});return new ds(n).toPromise()}async function x_(t,e){const r=lo(t,!1).get(e),n=await new ds(r).toPromise();return n===void 0?null:n.value}function wc(t,e){const r=lo(t,!0).delete(e);return new ds(r).toPromise()}const N_=800,O_=3;class md{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=gd(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let r=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(r++>O_)throw n;if(this.dbPromise){const i=this.dbPromise;this.dbPromise=null;try{(await i).close()}catch{}}}}async initializeServiceWorkerMessaging(){return pd()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=oo._getInstance(C_()),this.receiver._subscribe("keyChanged",async(e,r)=>({keyProcessed:(await this._poll()).includes(r.key)})),this.receiver._subscribe("ping",async(e,r)=>["keyChanged"])}async initializeSender(){var r,n;if(this.activeServiceWorker=await T_(),!this.activeServiceWorker)return;this.sender=new S_(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(r=e[0])!=null&&r.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||A_()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await bc(e,Ys,"1"),await wc(e,Ys)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,r){return this._withPendingWrite(async()=>(await this._withRetries(n=>bc(n,e,r)),this.localCache[e]=r,this.notifyServiceWorker(e)))}async _get(e){const r=await this._withRetries(n=>x_(n,e));return this.localCache[e]=r,r}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(r=>wc(r,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(i=>{const s=lo(i,!1).getAll();return new ds(s).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const r=[],n=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)n.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),r.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!n.has(i)&&(this.notifyListeners(i,null),r.push(i));return r}catch(e){return this.isClosing||Os(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),N_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}md.type="LOCAL";const D_=md;new cs(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bd(t,e){return e?Dn(e):(J(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ml extends ld{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return ea(e,this._buildIdpRequest())}_linkToIdToken(e,r){return ea(e,this._buildIdpRequest(r))}_getReauthenticationResolver(e){return ea(e,this._buildIdpRequest())}_buildIdpRequest(e){const r={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(r.idToken=e),r}}function L_(t){return v_(t.auth,new Ml(t),t.bypassAuthState)}function M_(t){const{auth:e,user:r}=t;return J(r,e,"internal-error"),p_(r,new Ml(t),t.bypassAuthState)}async function U_(t){const{auth:e,user:r}=t;return J(r,e,"internal-error"),h_(r,new Ml(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wd{constructor(e,r,n,i,s=!1){this.auth=e,this.resolver=n,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(r)?r:[r]}execute(){return new Promise(async(e,r)=>{this.pendingPromise={resolve:e,reject:r};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:r,sessionId:n,postBody:i,tenantId:s,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:r,sessionId:n,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(f){this.reject(f)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return L_;case"linkViaPopup":case"linkViaRedirect":return U_;case"reauthViaPopup":case"reauthViaRedirect":return M_;default:fn(this.auth,"internal-error")}}resolve(e){Fn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Fn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F_=new cs(2e3,1e4);async function $_(t,e,r){if(sn(t.app))return Promise.reject(jr(t,"operation-not-supported-in-this-environment"));const n=so(t);Dv(t,e,Dl);const i=bd(n,r);return new Ci(n,"signInViaPopup",e,i).executeNotNull()}class Ci extends wd{constructor(e,r,n,i,s){super(e,r,i,s),this.provider=n,this.authWindow=null,this.pollId=null,Ci.currentPopupAction&&Ci.currentPopupAction.cancel(),Ci.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return J(e,this.auth,"internal-error"),e}async onExecution(){Fn(this.filter.length===1,"Popup operations only handle one event");const e=Ll();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(r=>{this.reject(r)}),this.resolver._isIframeWebStorageSupported(this.auth,r=>{r||this.reject(jr(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(jr(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ci.currentPopupAction=null}pollUserCancellation(){const e=()=>{var r,n;if((n=(r=this.authWindow)==null?void 0:r.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(jr(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,F_.get())};e()}}Ci.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B_="pendingRedirect",Ms=new Map;class H_ extends wd{constructor(e,r,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],r,void 0,n),this.eventId=null}async execute(){let e=Ms.get(this.auth._key());if(!e){try{const n=await V_(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(r){e=()=>Promise.reject(r)}Ms.set(this.auth._key(),e)}return this.bypassAuthState||Ms.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const r=await this.auth._redirectUserForId(e.eventId);if(r)return this.user=r,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function V_(t,e){const r=j_(e),n=W_(t);if(!await n._isAvailable())return!1;const i=await n._get(r)==="true";return await n._remove(r),i}function z_(t,e){Ms.set(t._key(),e)}function W_(t){return Dn(t._redirectPersistence)}function j_(t){return Ls(B_,t.config.apiKey,t.name)}async function q_(t,e,r=!1){if(sn(t.app))return Promise.reject(Ui(t));const n=so(t),i=bd(n,e),o=await new H_(n,i,r).execute();return o&&!r&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G_=600*1e3;class K_{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let r=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(r=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!J_(e)||(this.hasHandledPotentialRedirect=!0,r||(this.queuedRedirectEvent=e,r=!0)),r}sendToConsumer(e,r){var n;if(e.error&&!yd(e)){const i=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";r.onError(jr(this.auth,i))}else r.onAuthEvent(e)}isEventForConsumer(e,r){const n=r.eventId===null||!!e.eventId&&e.eventId===r.eventId;return r.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=G_&&this.cachedEventUids.clear(),this.cachedEventUids.has(yc(e))}saveEventToCache(e){this.cachedEventUids.add(yc(e)),this.lastProcessedEventTime=Date.now()}}function yc(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function yd({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function J_(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return yd(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Y_(t,e={}){return wa(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const X_=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Q_=/^https?/;async function Z_(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Y_(t);for(const r of e)try{if(eg(r))return}catch{}fn(t,"unauthorized-domain")}function eg(t){const e=ll(),{protocol:r,hostname:n}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&n===""?r==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):r==="chrome-extension:"&&o.hostname===n}if(!Q_.test(r))return!1;if(X_.test(t))return n===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(n)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tg=new cs(3e4,6e4);function Ic(){const t=un().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let r=0;r<t.CP.length;r++)t.CP[r]=null}}function rg(t){return new Promise((e,r)=>{var i,s,o;function n(){Ic(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Ic(),r(jr(t,"network-request-failed"))},timeout:tg.get()})}if((s=(i=un().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=un().gapi)!=null&&o.load)n();else{const c=o_("iframefcb");return un()[c]=()=>{gapi.load?n():r(jr(t,"network-request-failed"))},a_(`${s_()}?onload=${c}`).catch(u=>r(u))}}).catch(e=>{throw Us=null,e})}let Us=null;function ng(t){return Us=Us||rg(t),Us}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ig=new cs(5e3,15e3),ag="__/auth/iframe",sg="emulator/auth/iframe",og={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},lg=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function cg(t){const e=t.config;J(e.authDomain,t,"auth-domain-config-required");const r=e.emulator?Rl(e,sg):`https://${t.config.authDomain}/${ag}`,n={apiKey:e.apiKey,appName:t.name,v:ls},i=lg.get(t.config.apiHost);i&&(n.eid=i);const s=t._getFrameworks();return s.length&&(n.fw=s.join(",")),`${r}?${os(n).slice(1)}`}async function ug(t){const e=await ng(t),r=un().gapi;return J(r,t,"internal-error"),e.open({where:document.body,url:cg(t),messageHandlersFilter:r.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:og,dontclear:!0},n=>new Promise(async(i,s)=>{await n.restyle({setHideOnLeave:!1});const o=jr(t,"network-request-failed"),c=un().setTimeout(()=>{s(o)},ig.get());function u(){un().clearTimeout(c),i(n)}n.ping(u).then(u,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dg={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},fg=500,hg=600,pg="_blank",vg="http://localhost";class Ec{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function _g(t,e,r,n=fg,i=hg){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let c="";const u={...dg,width:n.toString(),height:i.toString(),top:s,left:o},f=Bt().toLowerCase();r&&(c=Zu(f)?pg:r),Xu(f)&&(e=e||vg,u.scrollbars="yes");const v=Object.entries(u).reduce((b,[m,I])=>`${b}${m}=${I},`,"");if(Xv(f)&&c!=="_self")return gg(e||"",c),new Ec(null);const g=window.open(e||"",c,v);J(g,t,"popup-blocked");try{g.focus()}catch{}return new Ec(g)}function gg(t,e){const r=document.createElement("a");r.href=t,r.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),r.dispatchEvent(n)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mg="__/auth/handler",bg="emulator/auth/handler",wg=encodeURIComponent("fac");async function Sc(t,e,r,n,i,s){J(t.config.authDomain,t,"auth-domain-config-required"),J(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:r,redirectUrl:n,v:ls,eventId:i};if(e instanceof Dl){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",gp(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[v,g]of Object.entries({}))o[v]=g}if(e instanceof us){const v=e.getScopes().filter(g=>g!=="");v.length>0&&(o.scopes=v.join(","))}t.tenantId&&(o.tid=t.tenantId);const c=o;for(const v of Object.keys(c))c[v]===void 0&&delete c[v];const u=await t._getAppCheckToken(),f=u?`#${wg}=${encodeURIComponent(u)}`:"";return`${yg(t)}?${os(c).slice(1)}${f}`}function yg({config:t}){return t.emulator?Rl(t,bg):`https://${t.authDomain}/${mg}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bo="webStorageSupport";class Ig{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=hd,this._completeRedirectFn=q_,this._overrideRedirectResult=z_}async _openPopup(e,r,n,i){var o;Fn((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await Sc(e,r,n,ll(),i);return _g(e,s,Ll())}async _openRedirect(e,r,n,i){await this._originValidation(e);const s=await Sc(e,r,n,ll(),i);return k_(s),new Promise(()=>{})}_initialize(e){const r=e._key();if(this.eventManagers[r]){const{manager:i,promise:s}=this.eventManagers[r];return i?Promise.resolve(i):(Fn(s,"If manager is not set, promise should be"),s)}const n=this.initAndGetManager(e);return this.eventManagers[r]={promise:n},n.catch(()=>{delete this.eventManagers[r]}),n}async initAndGetManager(e){const r=await ug(e),n=new K_(e);return r.register("authEvent",i=>(J(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:n.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=r,n}_isIframeWebStorageSupported(e,r){this.iframes[e._key()].send(Bo,{type:Bo},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[Bo];s!==void 0&&r(!!s),fn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const r=e._key();return this.originValidationPromises[r]||(this.originValidationPromises[r]=Z_(e)),this.originValidationPromises[r]}get _shouldInitProactively(){return id()||Qu()||Nl()}}const Eg=Ig;var kc="@firebase/auth",Tc="1.13.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sg{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const r=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,r),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const r=this.internalListeners.get(e);r&&(this.internalListeners.delete(e),r(),this.updateProactiveRefresh())}assertAuthConfigured(){J(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kg(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Tg(t){Ka(new pa("auth",(e,{options:r})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=n.options;J(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const u={apiKey:o,authDomain:c,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ad(t)},f=new n_(n,i,s,u);return c_(f,r),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,r,n)=>{e.getProvider("auth-internal").initialize()})),Ka(new pa("auth-internal",e=>{const r=so(e.getProvider("auth").getImmediate());return(n=>new Sg(n))(r)},"PRIVATE").setInstantiationMode("EXPLICIT")),Qi(kc,Tc,kg(t)),Qi(kc,Tc,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ag=300,Cg=Mu("authIdTokenMaxAge")||Ag;let Ac=null;const Rg=t=>async e=>{const r=e&&await e.getIdTokenResult(),n=r&&(new Date().getTime()-Date.parse(r.issuedAtTime))/1e3;if(n&&n>Cg)return;const i=r==null?void 0:r.token;Ac!==i&&(Ac=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function Pg(t=wv()){const e=Bu(t,"auth");if(e.isInitialized())return e.getImmediate();const r=l_(t,{popupRedirectResolver:Eg,persistence:[D_,I_,hd]}),n=Mu("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(n,location.origin);if(location.origin===s.origin){const o=Rg(s.toString());g_(r,o,()=>o(r.currentUser)),__(r,c=>o(c))}}const i=sp("auth");return i&&sd(r,`http://${i}`),r}function xg(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}i_({loadJS(t){return new Promise((e,r)=>{const n=document.createElement("script");n.setAttribute("src",t),n.onload=e,n.onerror=i=>{const s=jr("internal-error");s.customData=i,r(s)},n.type="text/javascript",n.charset="UTF-8",xg().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Tg("Browser");function Ng(t){var n,i,s,o;if(!((n=t.firebase)!=null&&n.apiKey)||!((i=t.firebase)!=null&&i.projectId)||!((s=t.firebase)!=null&&s.authDomain)||!((o=t.firebase)!=null&&o.appId))throw new Error("Google sign-in is not configured. Contact your studio operator.");const e=Pg(Hu(t.firebase,"liquidity-studio"));if(t.emulator){const c=new URL(t.emulator.url),u=f=>["localhost","127.0.0.1","[::1]"].includes(f);if(!u(location.hostname)||!u(c.hostname)||c.protocol!=="http:")throw new Error("Authentication emulator is restricted to local development.");sd(e,c.origin)}const r=new Rn;return r.setCustomParameters({prompt:"select_account"}),{watch:c=>m_(e,c),login:()=>$_(e,r),logout:()=>b_(e),getToken:async()=>{if(!e.currentUser)throw new Error("Sign in with Google to continue.");return e.currentUser.getIdToken()}}}var Og=C('<meta name="description" content="Private editorial workspace for brand campaigns, measured previews and source review."/>'),Dg=C('<main class="login-shell"><p role="status">Connecting to your studio…</p></main>'),Lg=C('<button class="primary"> </button>'),Mg=C('<form><label>Username<input name="username" autocomplete="username" required=""/></label><label>Password<input name="password" type="password" autocomplete="current-password" required=""/></label><button class="primary"> </button></form>'),Ug=C('<p class="error" role="alert"> </p>'),Fg=C(`<main class="login-shell"><div class="login-card"><span class="wordmark">◈ LIQUIDITY STUDIO</span> <h1>Good work starts<br/>with a clear view.</h1> <p>Sign in to your private brand workspace.</p> <!> <!> <p class="small muted">Accounts are provisioned by your studio operator. No public
        registration.</p></div> <div class="login-art"><span class="eyebrow">YOUR EDITORIAL WORKSPACE</span> <h2>From a good story.<br/>To a considered campaign.</h2> <div class="login-cards"><span>SOURCE</span><span>SHAPE</span><span>PREVIEW</span></div> <p>One place to edit, inspect and export.<br/>Every brand keeps its own
        context.</p></div></main>`),yi=C("<option> </option>"),$g=C('<button><span aria-hidden="true"> </span> </button>'),Bg=C('<button><span aria-hidden="true">⌘</span>Operations</button>'),Hg=C('<div class="error banner" role="alert"> <button aria-label="Dismiss error">×</button></div>'),Vg=C('<div class="notice banner" role="status"> <button aria-label="Dismiss notice">×</button></div>'),zg=C('<div class="panel" role="status"> </div>'),Wg=C('<article class="story-row"><div class="story-day"><b> </b><span> </span></div> <div class="story-copy"><span class="eyebrow"> </span> <h3> </h3> <p> </p> <span class="status-tag"> </span></div> <button class="secondary"> </button></article>'),jg=C('<div class="empty"><h3>No stories here yet.</h3> <p>Add supplied facts below. The studio will not invent them.</p></div>'),qg=C(`<div class="section-line"><div><h2>Story backlog <span class="count"> </span></h2> <p class="muted">Opening a saved story keeps your edits.</p></div> <div class="filters"><input aria-label="Search stories" placeholder="Search stories…"/><select aria-label="Filter by status"><option>All</option><!></select></div></div> <div class="story-list"></div> <details class="panel add-story"><summary>Add a story</summary> <form class="form-grid"><label class="full">Story title<input required=""/></label><label>Category<input/></label><label>Calendar day<select></select></label><label class="full">Supplied facts, one per line<textarea rows="4" required="" placeholder="Add the specific facts you want the draft to use."></textarea></label><label class="full">Source links, one per line<textarea rows="2" placeholder="https://…"></textarea></label> <p class="small muted full">Facts are editorial inputs, not independently verified claims.
              Clinical claims require source review.</p> <button class="primary">Add to backlog</button></form></details>`,1),Gg=C('<button class="calendar-story"><span class="eyebrow"> </span><b> </b><span class="status-tag"> </span></button>'),Kg=C('<p class="muted small">Room for a story</p>'),Jg=C('<section class="day-column"><h3> </h3> <!></section>'),Yg=C('<div class="section-line"><h2>Weekly editorial calendar</h2> <span class="muted small">Assignments only · no automatic publishing</span></div> <div class="calendar-grid"></div>',1),Xg=C('<p class="download"><a> </a><small>Actual exported artifact · scope authorization required</small></p>'),Qg=C("<button> <small> </small></button>"),Zg=C('<label> <textarea rows="3"></textarea></label>'),em=C('<label>Headline<textarea aria-label="Headline" rows="3"></textarea></label> <!> <label>Takeaway<textarea rows="3"></textarea></label> <label>Caption<textarea aria-label="Caption" rows="4"></textarea></label>',1),tm=C('<fieldset><legend></legend><label>Title<input/></label><label>Source detail<textarea rows="3"></textarea></label><label>Visual direction<input/></label></fieldset>'),rm=C("<label>Cover hook<input/></label> <!>",1),nm=C('<label>Story hook<textarea rows="3"></textarea></label><label>Source highlight<textarea rows="4"></textarea></label><label>Poll question<input aria-label="Poll question"/></label>',1),im=C("<label> <textarea></textarea></label>"),am=C("<fieldset><legend></legend><!></fieldset>"),sm=C('<label>Spoken hook<textarea rows="3"></textarea></label><!><label>Closing call to action<input/></label>',1),om=C(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and
                            want to record my review.</label>`),lm=C(`<p class="small muted">A founder clinical source review is required before
                            generation.</p>`),cm=C(`<p class="small error">Clinical review must be recorded by an authorized
                          reviewer.</p>`),um=C('<fieldset><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label><!></fieldset>'),dm=C('<p class="small error"> </p>'),fm=C(`<p class="small muted">Preflight recorded for this brand. Editorial review
                    required.</p>`),hm=C(`<div class="studio-grid"><section class="editor-panel"><div class="panel-heading"><h3>Make it yours.</h3> <span class="status-tag"> </span></div> <p class="small muted">Edit the wording, then save to update your preview and
                  exported artwork.</p> <div class="field-editor"><!></div> <details class="advanced-editor"><summary>Advanced format JSON</summary><label>Format content<textarea class="json-editor" aria-label="Format content" spellcheck="false"></textarea></label></details> <button class="primary">Save changes</button> <div class="schedule-box"><label>Assigned day<select aria-label="Assigned day"></select></label><button class="secondary">Assign to calendar</button> <p class="small muted">Assigning a day does not publish or export.</p></div> <details class="sources"><summary>Review source claims</summary> <p class="small muted">Approve a claim only after reviewing its linked source and
                    meaning. Clinical claims require a separate clinical review.</p> <!><button class="secondary">Add source claim</button><button class="secondary">Save source review</button></details> <!></section> <!></div>`),pm=C(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and want
                          to record my review.</label>`),vm=C(`<p class="small muted">A founder clinical source review is required before
                          generation.</p>`),_m=C('<fieldset><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label></fieldset>'),gm=C(`<section class="panel"><h3>Review sources before generation</h3> <p class="muted">Add a source link to each claim and choose its review status.
                Unreviewed claims cannot enter a campaign.</p> <div class="field-editor"></div> <button class="secondary">Add source claim</button> <button class="secondary">Save source review</button></section> <div class="empty"><span class="empty-symbol">◧</span> <h2>A story ready to take shape.</h2> <p>Generate a draft from the supplied facts, then review every
                format.</p> <button class="primary"> </button></div>`,1),mm=C('<div class="studio-toolbar"><div><span class="eyebrow">ACTIVE STORY</span> <h2> </h2> <span class="provenance"> </span></div> <div class="toolbar-actions"><button class="secondary"> </button><button class="primary"> </button></div></div> <!> <div class="format-tabs" aria-label="Campaign format"></div> <!>',1),bm=C('<div class="empty"><h2>Choose a story to begin.</h2> <p>Every campaign starts with supplied facts and a source review.</p> <button class="primary">Open story backlog</button></div>'),wm=C('<label> <div><input type="color"/><input/></div></label>'),ym=C('<p class="small muted"> </p> <p> </p>',1),Im=C('<article class="panel" style="margin-bottom:12px"><h3> </h3> <!></article>'),Em=C('<p class="muted">Audience groups need owner review.</p>'),Sm=C("<li><p> </p></li>"),km=C('<li class="muted">Editorial pillars need owner review.</li>'),Tm=C(`<p class="small error">Clinical claims remain quarantined until explicit source and
                clinical review are recorded.</p>`),Am=C(`<section class="panel" style="margin-top:24px" aria-label="Brand positioning reference"><span class="eyebrow">OWNER POSITIONING · READ-ONLY REFERENCE</span> <h2>Proposed editorial positioning</h2> <p class="muted">These audiences and pillars describe editorial intent. They are
              not verified factual or clinical claims. Source review is required
              for every campaign.</p> <span class="status-tag"> </span> <div class="admin-grid" style="margin-top:24px"><section><h3>Audience value groups</h3> <!></section> <section><h3>Editorial pillars</h3> <ol></ol></section></div> <!></section>`),Cm=C('<article class="story-row"><div class="story-copy"><h3> </h3> <span class="status-tag"> </span></div> <button class="secondary">Review sources</button></article>'),Rm=C('<p class="small muted">No research prompts in this brand.</p>'),Pm=C(`<form class="panel brand-form form-grid"><label>Brand name<input required=""/></label><label>Website<input/></label><label class="full">Tagline<input/></label><label class="full">Editorial mission<textarea rows="4"></textarea></label><label>Wordmark / monogram<input/></label><label>Heading font<select aria-label="Heading font"></select></label><label>Body font<select aria-label="Body font"></select></label> <div class="full color-list"></div> <button class="primary">Save Brand Kit</button></form> <!> <section class="panel" style="margin-top:24px" aria-label="Unreviewed research topics"><h2>Research queue · unreviewed</h2> <p class="muted">Research prompts are starting points, not approved claims. Open a
            topic to add sourced claims for review.</p> <!></section>`,1),xm=C('<button class="secondary"> </button>'),Nm=C('<li><strong> </strong> <p class="small muted"> </p> <!></li>'),Om=C('<li class="muted">No batch attempts for this brand.</li>'),Dm=C("<tr><td> </td><td> </td><td> </td><td> </td></tr>"),Lm=C('<tr><td colspan="4">No generation traces for this brand.</td></tr>'),Mm=C(`<div class="admin-grid"><section class="panel"><div class="panel-heading"><h2>Health & readiness</h2> <button class="secondary">Refresh</button></div> <p class="muted">Repository readiness does not establish provider connectivity.</p> <div class="ops-metrics"><div><b> </b><span>Service readiness</span></div> <div><b> </b><span>Repository check</span></div> <div><b> </b><span>Generation provider</span></div></div> <details><summary>Readiness details</summary> <pre> </pre></details></section> <section class="panel"><h2>Scoped operations</h2> <button class="secondary">Run this brand’s batch</button> <p><a>Download scoped feedback JSONL</a></p> <p class="small muted">Jobs use this organization and brand. Export is separate from
              publishing.</p> <h3>Recent batch attempts</h3> <ul aria-label="Recent batch attempts"></ul></section> <section class="panel"><h2>Organization management</h2> <form><label>New organization name<input required=""/></label><button class="secondary">Create organization</button></form> <form><label> <input required=""/></label><label>Brand preset<select aria-label="Brand preset"><option>The Liquidity Desk</option><option>Chai With Jai</option></select></label><button class="secondary">Create brand</button></form></section> <section class="panel"><h2>Telemetry & generation</h2> <div class="ops-metrics"><div><b> </b><span>Recent generation traces</span></div> <div><b> </b><span>Recorded usage events</span></div> <div><b> </b><span>Recent operational events</span></div></div> <p class="small muted">Usage records describe operations; they are not customer invoices
              or proof of factual accuracy.</p> <div class="trace-table"><table><thead><tr><th>Status</th><th>Provider</th><th>Model</th><th>Duration</th></tr></thead><tbody></tbody></table></div> <details><summary>Operational data</summary> <pre> </pre></details></section> <details class="panel"><summary>Architecture reference</summary> <pre> </pre></details></div>`),Um=C('<div class="app-shell"><aside class="sidebar"><a href="/" class="wordmark">◈<span>LIQUIDITY<br/>STUDIO</span></a> <div class="scope-selectors"><label>Organization<select aria-label="Organization"></select></label><label>Brand<select aria-label="Brand"></select></label></div> <nav aria-label="Main navigation"><!><!></nav> <div class="sidebar-bottom"><span class="avatar"> </span> <div><b> </b><small> </small></div> <button aria-label="Sign out">↪</button></div></aside> <main class="workspace"><header class="workspace-header"><div><span class="eyebrow"> </span> <h1> </h1> <p> </p></div> <span class="private-badge">● Private workspace</span></header> <!><!> <!></main></div>');function Fm(t,e){fl(e,!0);const r=["Mona Sans","Inter","Instrument Serif","DejaVu Sans"];function n(_){const w=typeof _=="string"?_.split("/")[0].trim():"";return r.includes(w)?w:"DejaVu Sans"}const i=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],s=[{id:"infographic",name:"Feed post",ratio:"4:5"},{id:"carousel",name:"Carousel",ratio:"4 slides"},{id:"story",name:"Story",ratio:"9:16"},{id:"reel",name:"Reel",ratio:"30s script"}];let o=x("unavailable"),c,u=0,f=0,v,g=x(null),b=x(_r([])),m=x(""),I=x(""),R=x(_r({})),S=x(""),N=x(""),j=x(!0),M=x(!1),O=x(""),H=x(""),Q=x("backlog"),D=x(null),ne=x(_r([])),B=x(_r([])),U=x(null),he=x(null),de=x("infographic"),Pt=x("Monday"),st=x(""),ot=x("All"),lt=x(""),Ae=x(_r({})),Ce=x(!1),tt=x(""),Et=x(""),Qt=x(""),oe=x(_r([])),Ar=x("Editorial"),Bn=x("Monday"),hn=x(""),Vi=x(""),oi=x("liquidity_desk"),gr=x(null),ya=x(null),pn=x(null),Cr=x(null),Ht=x(""),li=x(""),Hn=x(!1),rt=0,Ia=0,ci=Ft(()=>a(b).find(_=>_.id===a(m))),zi=Ft(()=>{var _,w;return(w=(_=a(ci))==null?void 0:_.brands)==null?void 0:w.find(A=>A.id===a(I))}),Ea=Ft(()=>a(ne).filter(_=>(!a(st)||(_.title+" "+_.category).toLowerCase().includes(a(st).toLowerCase()))&&(a(ot)==="All"||_.status===a(ot)))),Sa=Ft(()=>{var _,w,A,L;return((w=(_=a(he))==null?void 0:_.provenance)==null?void 0:w.mode)==="synthetic"?"Synthetic draft · source review required":((L=(A=a(he))==null?void 0:A.provenance)==null?void 0:L.mode)==="provider"?"Provider draft · source review required":"Source provenance unverified · review required"}),Vn=Ft(()=>{var _,w;return((_=a(R))==null?void 0:_.admin)===!0||((w=a(g))==null?void 0:w.role)==="founder"});function ka(){return new URLSearchParams({organizationId:a(m),brandId:a(I)}).toString()}async function Gr(_,w={},A=!0){const L=rt,ie=a(o)==="google"?{Authorization:`Bearer ${await c.getToken()}`}:{},we=await fetch(_+(A?(_.includes("?")?"&":"?")+ka():""),{...w,credentials:"same-origin",headers:{...w.body?{"Content-Type":"application/json"}:{},...w.headers,...ie}}),Oe=await we.json().catch(()=>({}));if(!we.ok)throw we.status===401&&di(),new Error(Oe.error||Oe.message||`Request failed (${we.status})`);if(A&&L!==rt)throw new Error("Workspace changed while the request was running; retry in the current brand");return Oe}function St(_,w={},A=!0){return Gr(_,{method:"POST",body:JSON.stringify(w)},A)}function Ta(_){var w,A,L,ie,we,Oe;d(g,_.user,!0),d(b,_.organizations||[],!0),d(R,_.permissions||{},!0),d(m,((w=_.activeScope)==null?void 0:w.organizationId)||((A=a(b)[0])==null?void 0:A.id)||"",!0),d(I,((L=_.activeScope)==null?void 0:L.brandId)||((Oe=(we=(ie=a(b).find(nt=>nt.id===a(m)))==null?void 0:ie.brands)==null?void 0:we[0])==null?void 0:Oe.id)||"",!0)}function ui(){f++,clearTimeout(v),v=void 0}function di(){rt++,d(Hn,!1),d(g,null),d(b,[],!0),d(R,{},!0),d(m,""),d(I,""),d(ne,[],!0),d(B,[],!0),d(U,null),d(he,null),d(D,null),d(gr,null),d(Cr,null),d(Ht,""),d(Ce,!1)}Pu(()=>{let _=!1,w;async function A(){try{const L=await fetch("/api/auth/config");if(!L.ok)throw new Error("Could not load sign-in configuration.");const ie=await L.json();if(_)return;if(!["google","password"].includes(ie.mode))throw new Error("Unsupported sign-in configuration.");if(d(o,ie.mode,!0),a(o)==="google")c=Ng(ie),w=c.watch(async we=>{ui();const Oe=++u;di(),d(j,!0);try{if(we){const nt=await Gr("/api/auth/session",{},!1);if(_||Oe!==u)return;Ta(nt),a(I)&&await Kr()}}catch(nt){!_&&Oe===u&&(di(),d(O,`Google sign-in could not open this workspace: ${nt.message}. Check your invited account or contact the studio operator.`))}finally{!_&&Oe===u&&(d(j,!1),d(M,!1))}});else{const we=await fetch("/api/auth/session",{credentials:"same-origin"});we.ok&&!_&&(Ta(await we.json()),a(I)&&await Kr()),_||d(j,!1)}}catch(L){_||(d(O,L.message,!0),d(j,!1))}}return A(),()=>{_=!0,u++,ui(),w==null||w()}});async function co(){if(a(M)||!c)return;ui();const _=f;d(M,!0),d(O,"");const w=setTimeout(()=>{_===f&&(ui(),d(M,!1),d(O,"Google sign-in has not completed. Finish the Google popup or try again."))},9e4);v=w;try{await c.login()}catch(A){if(_!==f)return;d(O,A.code==="auth/popup-closed-by-user"?"Google sign-in was closed. Select Continue with Google to try again.":A.code==="auth/popup-blocked"?"Allow the Google sign-in popup, then try again.":A.message||"Google sign-in failed. Try again.",!0)}finally{clearTimeout(w),_===f&&(v=void 0,d(M,!1))}}async function uo(_){_.preventDefault(),d(M,!0),d(O,"");try{const w=await St("/api/auth/login",{username:a(S),password:a(N)},!1);d(N,""),Ta(w),await Kr()}catch(w){d(O,w.message,!0)}finally{d(M,!1)}}async function fo(){try{a(o)==="google"?await c.logout():await St("/api/auth/logout",{},!1),u++,ui(),di(),d(j,!1)}catch(_){d(O,_.message,!0)}}async function fs(_){if(a(o)==="google"){_.preventDefault();try{const w=await fetch(a(Ht),{headers:{Authorization:`Bearer ${await c.getToken()}`}});if(!w.ok)throw new Error(`Download failed (${w.status}). Sign in again if access expired.`);const A=URL.createObjectURL(await w.blob()),L=document.createElement("a");L.href=A,L.download=a(li),L.click(),setTimeout(()=>URL.revokeObjectURL(A),1e3)}catch(w){d(O,w.message,!0)}}}async function Kr(){var w,A;const _=++rt;d(Hn,!0),d(ne,[],!0),d(B,[],!0),d(D,null),d(oe,[],!0),d(H,""),d(O,""),d(M,!0),d(U,null),d(he,null),d(gr,null),d(Cr,null),d(Ht,""),d(Ce,!1);try{const L=await Gr("/api/studio/bootstrap");if(_!==rt)return;d(D,L.brandProfile,!0),a(D)&&((w=a(D)).fonts||(w.fonts={heading:"DejaVu Sans",body:"DejaVu Sans"}),a(D).fonts.heading=n(a(D).fonts.heading),a(D).fonts.body=n(a(D).fonts.body),(A=a(D)).colors||(A.colors=[])),d(ne,L.backlog||[],!0),d(B,L.calendar||[],!0),L.organizations&&d(b,L.organizations,!0),L.permissions&&d(R,L.permissions,!0),a(ne).length&&Aa(a(ne)[0])}catch(L){_===rt&&(d(O,L.message,!0),d(ne,[],!0),d(B,[],!0),d(D,null))}finally{_===rt&&(d(M,!1),d(Hn,!1))}}async function hs(_){var w,A,L;a(Ce)&&!await vn()||(d(m,_.currentTarget.value,!0),d(I,((L=(A=(w=a(b).find(ie=>ie.id===a(m)))==null?void 0:w.brands)==null?void 0:A[0])==null?void 0:L.id)||"",!0),d(Q,"backlog"),await Kr())}async function ps(_){a(Ce)&&!await vn()||(d(I,_.currentTarget.value,!0),d(Q,"backlog"),await Kr())}function Aa(_){var w;d(U,_,!0),d(he,(_==null?void 0:_.campaignDraft)||null,!0),d(Pt,(_==null?void 0:_.scheduledDay)||"Monday",!0),d(oe,((_==null?void 0:_.sourceClaims)||((w=_==null?void 0:_.verifiedFacts)==null?void 0:w.map((A,L)=>({id:`claim_${L}`,text:A,sourceUrl:"",status:"unreviewed"})))||[]).map(A=>({...A})),!0),d(Ht,""),d(Cr,null),Ca()}function Ca(){var _,w;d(Ae,(_=a(he))!=null&&_[a(de)]?JSON.parse(JSON.stringify(a(he)[a(de)])):{},!0),d(lt,(w=a(he))!=null&&w[a(de)]?JSON.stringify(a(Ae),null,2):"",!0),d(Ce,!1)}function mr(_,w){a(Ae)[_]=w,d(lt,JSON.stringify(a(Ae),null,2),!0),d(Ce,!0)}function fi(_,w,A,L){A?a(Ae)[_][w][A]=L:a(Ae)[_][w]=L,d(lt,JSON.stringify(a(Ae),null,2),!0),d(Ce,!0)}async function Ra(_){a(Ce)&&!await vn()||(Aa(_),d(Q,"studio"))}async function vs(_){a(Ce)&&!await vn()||(d(de,_,!0),d(Ht,""),Ca())}async function _s(){var A,L;if(!a(U)||a(M)||a(Ce)&&!await vn())return;d(M,!0),d(O,"");const _=rt,w=a(U).id;try{const ie=await St("/api/studio/generate-campaign",{storyId:w});if(_!==rt||((A=a(U))==null?void 0:A.id)!==w)return;d(he,ie.campaign,!0),d(U,((L=ie.backlog)==null?void 0:L.find(we=>we.id===w))||ie.story,!0),d(ne,ie.backlog||a(ne),!0),d(B,ie.calendar||a(B),!0),Ca(),d(H,"Draft generated. Review the sources before export.")}catch(ie){_===rt&&d(O,`Generation failed: ${ie.message}. Your existing draft is preserved.`)}finally{_===rt&&d(M,!1)}}async function vn(){if(!a(he)||!a(U)||!a(Ce))return!0;d(O,"");try{const _=a(lt),w=JSON.parse(_);if(!w||typeof w!="object"||Array.isArray(w))throw new Error("Format content must be a JSON object");const A=await St("/api/studio/save-edit",{storyId:a(U).id,format:a(de),content:w,expectedRevision:a(U).revision});A.story?d(U,A.story,!0):A.revision!==void 0&&(a(U).revision=A.revision),a(he)[a(de)]=w,a(U).campaignDraft=a(he);const L=a(ne).find(ie=>ie.id===a(U).id);return L&&(L.campaignDraft=a(he)),d(Ce,a(lt)!==_),d(H,a(Ce)?"Saved the submitted edit. Newer changes remain unsaved.":"Changes saved.",!0),!a(Ce)}catch(_){return d(O,`Could not save: ${_.message}. Your editor text is still here.`),!1}}async function ho(){if(a(U))try{const _=await St("/api/studio/schedule",{storyId:a(U).id,status:"Scheduled",scheduledDay:a(Pt)});d(U,_.story||{...a(U),scheduledDay:a(Pt),status:"Scheduled"},!0),d(ne,_.backlog||a(ne),!0),d(B,_.calendar||a(B),!0),d(H,`Assigned to ${a(Pt)}. This does not publish to Instagram.`)}catch(_){d(O,_.message,!0)}}async function po(){var _,w;if(!(!await vn()||!a(U)||!a(he))){d(M,!0),d(O,""),d(Ht,"");try{const A=await St("/api/studio/export-asset",{storyId:a(U).id,format:a(de),content:a(he)[a(de)]});if(d(Ht,A.downloadUrl||((_=A.artifact)==null?void 0:_.downloadUrl)||"",!0),d(li,A.filename||((w=A.artifact)==null?void 0:w.filename)||"Download export",!0),!a(Ht))throw new Error("Server did not return a downloadable artifact");d(ne,A.backlog||a(ne),!0),d(B,A.calendar||a(B),!0),d(U,a(ne).find(L=>L.id===a(U).id)||a(U),!0),d(H,"Export created. Download the actual file below.")}catch(A){d(O,`Export failed: ${A.message}`)}finally{d(M,!1)}}}function Pa(){d(oe,[...a(oe),{id:crypto.randomUUID(),text:"",sourceUrl:"",kind:"",status:"unreviewed"}],!0)}function gs(_){d(oe,a(oe).filter(w=>w.id!==_),!0)}async function ms(){if(a(U)){if(!a(oe).length){d(O,"Add at least one sourced claim before saving the review.");return}d(O,"");try{const _=await St("/api/studio/source-claims",{storyId:a(U).id,sourceClaims:a(oe),expectedRevision:a(U).revision});if(_.story){d(U,_.story,!0);const w=a(ne).findIndex(A=>A.id===a(U).id);w>=0&&(a(ne)[w]=a(U))}d(H,"Source review saved. Only approved sourced claims can enter generation.")}catch(_){d(O,_.message,!0)}}}async function vo(_){_.preventDefault();try{const A=Object.fromEntries(["brandName","websiteUrl","tagline","mission","fonts","colors","logoText","strategy","valueGroups","pillars"].filter(ie=>a(D)[ie]!==void 0).map(ie=>[ie,a(D)[ie]]));A.fonts={heading:n(a(D).fonts.heading),body:n(a(D).fonts.body)};const L=await St("/api/studio/brand-profile",A);d(D,L.brandProfile||a(D),!0),d(H,"Brand profile saved for this brand.")}catch(w){d(O,w.message,!0)}}async function _o(_){_.preventDefault();const w=a(Et).split(`
`).map(A=>A.trim()).filter(Boolean);if(!w.length){d(O,"Add at least one supplied fact. The studio will not invent source facts.");return}try{const A=await St("/api/studio/backlog",{title:a(tt),category:a(Ar),scheduledDay:a(Bn),verifiedFacts:w,sourceClaims:w.map((L,ie)=>{var we;return{id:`claim_${ie}`,text:L,sourceUrl:((we=a(Qt).split(`
`)[ie])==null?void 0:we.trim())||"",status:"unreviewed"}}),sourceUrls:a(Qt).split(`
`).filter(Boolean),sourceStatus:"unreviewed"});d(ne,A.backlog||[A.story,...a(ne)],!0),d(B,A.calendar||a(B),!0),d(tt,""),d(Et,""),d(Qt,""),d(H,"Story added. Supplied facts still need source review.")}catch(A){d(O,A.message,!0)}}async function k(){d(Q,"admin"),d(O,"");try{await(async _=>{var w=Ud(_,3);d(gr,w[0],!0),d(ya,w[1],!0),d(pn,w[2],!0)})(await Promise.all([Gr("/api/admin/overview"),Gr("/api/admin/context-graph"),fetch("/readyz").then(_=>_.json())]))}catch(_){d(O,_.message,!0)}}async function Y(_){_.preventDefault();try{await St("/api/admin/organizations",{name:a(hn)});const w=await Gr("/api/auth/session",{},!1);d(b,w.organizations||a(b),!0),d(hn,""),d(H,"Organization created.")}catch(w){d(O,w.message,!0)}}async function Ve(_){_.preventDefault();try{await St("/api/admin/brands",{organizationId:a(m),name:a(Vi),preset:a(oi)});const w=await Gr("/api/auth/session",{},!1);d(b,w.organizations||a(b),!0),d(Vi,""),d(H,"Brand created.")}catch(w){d(O,w.message,!0)}}async function Qe(_=null){const w=rt;d(M,!0),d(O,"");try{if(await St("/api/admin/run-weekly-batch",{idempotencyKey:crypto.randomUUID(),maxStories:5,..._?{retryOfJobId:_}:{}}),w!==rt)return;await Kr(),await k(),d(H,_?"Retry completed. Previously completed drafts were preserved.":"Scoped batch completed. Review every generated draft.",!0)}catch(A){if(w!==rt)return;await k(),d(O,A.message,!0)}finally{d(M,!1)}}async function kt(_){if(!a(U)||!a(g))return;const w=++Ia,A=rt;try{const L=await St("/api/studio/preflight",{storyId:a(U).id,expectedRevision:a(U).revision,..._});w===Ia&&A===rt&&d(Cr,L,!0)}catch(L){A===rt&&d(Cr,{error:L.message},!0)}}var Fe=Es();lh("1n46o8q",_=>{var w=Og();Il(()=>{au.title="Liquidity Studio · Brand workspace"}),T(_,w)});var xt=Ye(Fe);{var Nt=_=>{var w=Dg();T(_,w)},Zt=_=>{var w=Fg(),A=h(w),L=l(h(A),6);{var ie=qe=>{var Ee=Lg(),Ge=E(Ee,!0);$(()=>{Ee.disabled=a(M),y(Ge,a(M)?"Signing in…":"Continue with Google")}),P("click",Ee,co),T(qe,Ee)},we=qe=>{var Ee=Mg(),Ge=h(Ee),Rr=l(h(Ge)),Jr=l(Ge),hi=l(h(Jr)),zn=l(Jr),Dt=E(zn,!0);$(()=>{zn.disabled=a(M),y(Dt,a(M)?"Signing in…":"Sign in →")}),Si("submit",Ee,uo),He(Rr,()=>a(S),er=>d(S,er)),He(hi,()=>a(N),er=>d(N,er)),T(qe,Ee)};ce(L,qe=>{a(o)==="google"?qe(ie):a(o)==="password"&&qe(we,1)})}var Oe=l(L,2);{var nt=qe=>{var Ee=Ug(),Ge=E(Ee,!0);$(()=>y(Ge,a(O))),T(qe,Ee)};ce(Oe,qe=>{a(O)&&qe(nt)})}T(_,w)},Ot=_=>{var w=Um(),A=h(w),L=h(A),ie=l(L,2),we=h(ie),Oe=l(h(we));Ne(Oe,21,()=>a(b),V=>V.id,(V,G)=>{var K=yi(),_e=E(K,!0),Ke={};$(()=>{y(_e,a(G).name),Ke!==(Ke=a(G).id)&&(K.value=(K.__value=Ke)??"")}),T(V,K)});var nt;lr(Oe);var qe=l(we),Ee=l(h(qe));Ne(Ee,21,()=>{var V;return((V=a(ci))==null?void 0:V.brands)||[]},V=>V.id,(V,G)=>{var K=yi(),_e=E(K,!0),Ke={};$(()=>{y(_e,a(G).name),Ke!==(Ke=a(G).id)&&(K.value=(K.__value=Ke)??"")}),T(V,K)});var Ge;lr(Ee);var Rr=l(ie,2),Jr=h(Rr);Ne(Jr,16,()=>[{id:"backlog",label:"Story backlog",icon:"▤"},{id:"calendar",label:"Content calendar",icon:"▦"},{id:"studio",label:"Campaign Studio",icon:"◧"},{id:"brand",label:"Brand Kit",icon:"◉"}],V=>V.id,(V,G)=>{var K=$g();let _e;var Ke=h(K),Je=E(Ke,!0),_t=l(Ke,1,!0);$(()=>{_e=cr(K,1,"",null,_e,{active:a(Q)===G.id}),y(Je,G.icon),y(_t,G.label)}),P("click",K,()=>d(Q,G.id,!0)),T(V,K)});var hi=l(Jr);{var zn=V=>{var G=Bg();let K;$(()=>{G.disabled=a(Hn),K=cr(G,1,"",null,K,{active:a(Q)==="admin"})}),P("click",G,k),T(V,G)};ce(hi,V=>{a(Vn)&&V(zn)})}var Dt=l(Rr,2),er=h(Dt),q=E(er,!0),ye=l(er,2),Re=h(ye),ze=E(Re,!0),We=l(Re),Ze=E(We,!0),Vt=l(ye,2),ct=l(A,2),zt=h(ct),Wt=h(zt),_n=h(Wt),gn=E(_n),mn=l(_n,2),bn=E(mn,!0),Wn=l(mn,2),wn=E(Wn,!0),br=l(zt,2);{var Pr=V=>{var G=Hg(),K=h(G),_e=l(K);$(()=>y(K,a(O))),P("click",_e,()=>d(O,"")),T(V,G)};ce(br,V=>{a(O)&&V(Pr)})}var jn=l(br);{var vt=V=>{var G=Vg(),K=h(G),_e=l(K);$(()=>y(K,a(H))),P("click",_e,()=>d(H,"")),T(V,G)};ce(jn,V=>{a(H)&&V(vt)})}var tr=l(jn,2);{var yn=V=>{var G=zg(),K=E(G);$(()=>{var _e;return y(K,`Loading ${(((_e=a(zi))==null?void 0:_e.name)||"brand")??""} workspace…`)}),T(V,G)},bs=V=>{var G=qg(),K=Ye(G),_e=h(K),Ke=h(_e),Je=l(h(Ke)),_t=E(Je,!0),rr=l(_e,2),xr=h(rr),it=l(xr),jt=l(h(it));Ne(jt,16,()=>[...new Set(a(ne).map(F=>F.status))],F=>F,(F,ee)=>{var Z=yi(),De=E(Z,!0),ke={};$(()=>{y(De,ee),ke!==(ke=ee)&&(Z.__value=ke)}),T(F,Z)}),lr(it);var nr=l(K,2);Ne(nr,21,()=>a(Ea),F=>F.id,(F,ee)=>{var Z=Wg(),De=h(Z),ke=h(De),gt=E(ke,!0),ht=l(ke),Lr=E(ht,!0),wr=l(De,2),Ie=h(wr),pe=E(Ie,!0),mt=l(Ie,2),Lt=E(mt,!0),Gt=l(mt,2),Zr=E(Gt,!0),Kt=l(Gt,2),ir=E(Kt,!0),ar=l(wr,2),yr=E(ar);$(sr=>{var Mr;y(gt,sr),y(Lr,a(ee).campaignDraft?"DRAFT":"SOURCE"),y(pe,a(ee).category),y(Lt,a(ee).title),y(Zr,((Mr=a(ee).verifiedFacts)==null?void 0:Mr[0])||"Add source facts before generating."),y(ir,a(ee).status),y(yr,`${a(ee).campaignDraft?"Open draft":"Open story"} ↗`)},[()=>{var sr;return((sr=a(ee).scheduledDay)==null?void 0:sr.slice(0,3))||"—"}]),P("click",ar,()=>Ra(a(ee))),T(F,Z)},F=>{var ee=jg();T(F,ee)});var Yr=l(nr,2),Nr=l(h(Yr),2),Tt=h(Nr),Xr=l(h(Tt)),qt=l(Tt),En=l(h(qt)),Or=l(qt),Dr=l(h(Or));Ne(Dr,20,()=>i,F=>F,(F,ee)=>{var Z=yi(),De=E(Z,!0),ke={};$(()=>{y(De,ee),ke!==(ke=ee)&&(Z.__value=ke)}),T(F,Z)}),lr(Dr);var Qr=l(Or),vi=l(h(Qr)),ae=l(Qr),Se=l(h(ae));$(()=>y(_t,a(ne).length)),He(xr,()=>a(st),F=>d(st,F)),Ur(it,()=>a(ot),F=>d(ot,F)),Si("submit",Nr,_o),He(Xr,()=>a(tt),F=>d(tt,F)),He(En,()=>a(Ar),F=>d(Ar,F)),Ur(Dr,()=>a(Bn),F=>d(Bn,F)),He(vi,()=>a(Et),F=>d(Et,F)),He(Se,()=>a(Qt),F=>d(Qt,F)),T(V,G)},pi=V=>{var G=Yg(),K=l(Ye(G),2);Ne(K,20,()=>i,_e=>_e,(_e,Ke)=>{var Je=Jg(),_t=h(Je),rr=E(_t,!0),xr=l(_t,2);Ne(xr,17,()=>a(ne).filter(it=>it.scheduledDay===Ke),it=>it.id,(it,jt)=>{var nr=Gg(),Yr=h(nr),Nr=E(Yr,!0),Tt=l(Yr),Xr=E(Tt,!0),qt=l(Tt),En=E(qt,!0);$(()=>{y(Nr,a(jt).category),y(Xr,a(jt).title),y(En,a(jt).status)}),P("click",nr,()=>Ra(a(jt))),T(it,nr)},it=>{var jt=Kg();T(it,jt)}),$(()=>y(rr,Ke)),T(_e,Je)}),T(V,G)},qn=V=>{var G=Es(),K=Ye(G);{var _e=Je=>{var _t=mm(),rr=Ye(_t),xr=h(rr),it=l(h(xr),2),jt=E(it,!0),nr=l(it,2),Yr=E(nr,!0),Nr=l(xr,2),Tt=h(Nr),Xr=E(Tt,!0),qt=l(Tt),En=E(qt),Or=l(rr,2);{var Dr=F=>{var ee=Xg(),Z=h(ee),De=E(Z);$(()=>{wt(Z,"href",a(Ht)),wt(Z,"download",a(li)),y(De,`↓ ${a(li)??""}`)}),P("click",Z,fs),T(F,ee)};ce(Or,F=>{a(Ht)&&F(Dr)})}var Qr=l(Or,2);Ne(Qr,21,()=>s,F=>F.id,(F,ee)=>{var Z=Qg();let De;var ke=h(Z),gt=l(ke),ht=E(gt,!0);$(()=>{De=cr(Z,1,"",null,De,{active:a(de)===a(ee).id}),y(ke,a(ee).name),y(ht,a(ee).ratio)}),P("click",Z,()=>vs(a(ee).id)),T(F,Z)});var vi=l(Qr,2);{var ae=F=>{var ee=hm(),Z=h(ee),De=h(Z),ke=l(h(De),2),gt=E(ke,!0),ht=l(De,4),Lr=h(ht);{var wr=ue=>{var le=em(),$e=Ye(le),X=l(h($e)),W=l($e,2);Ne(W,17,()=>a(Ae).statRows||[],Yi,(Be,at,ut)=>{var je=Zg(),Te=h(je);Te.nodeValue=`Fact ${ut+1}`;var Me=l(Te);$(()=>Jt(Me,a(at))),P("input",Me,pt=>fi("statRows",ut,null,pt.currentTarget.value)),T(Be,je)});var Pe=l(W,2),Le=l(h(Pe)),ve=l(Pe,2),xe=l(h(ve));$(()=>{Jt(X,a(Ae).headline||""),Jt(Le,a(Ae).bottomTakeaway||""),Jt(xe,a(Ae).caption||"")}),P("input",X,Be=>mr("headline",Be.currentTarget.value)),P("input",Le,Be=>mr("bottomTakeaway",Be.currentTarget.value)),P("input",xe,Be=>mr("caption",Be.currentTarget.value)),T(ue,le)},Ie=ue=>{var le=rm(),$e=Ye(le),X=l(h($e)),W=l($e,2);Ne(W,17,()=>a(Ae).slides||[],Yi,(Pe,Le,ve)=>{var xe=tm(),Be=h(xe);Be.textContent=`Slide ${ve+1}`;var at=l(Be),ut=l(h(at)),je=l(at),Te=l(h(je)),Me=l(je),pt=l(h(Me));$(()=>{Jt(ut,a(Le).title||""),Jt(Te,a(Le).bodyMetric||""),Jt(pt,a(Le).visualNote||"")}),P("input",ut,bt=>fi("slides",ve,"title",bt.currentTarget.value)),P("input",Te,bt=>fi("slides",ve,"bodyMetric",bt.currentTarget.value)),P("input",pt,bt=>fi("slides",ve,"visualNote",bt.currentTarget.value)),T(Pe,xe)}),$(()=>Jt(X,a(Ae).coverHook||"")),P("input",X,Pe=>mr("coverHook",Pe.currentTarget.value)),T(ue,le)},pe=ue=>{var le=nm(),$e=Ye(le),X=l(h($e)),W=l($e),Pe=l(h(W)),Le=l(W),ve=l(h(Le));$(()=>{Jt(X,a(Ae).hookBanner||""),Jt(Pe,a(Ae).keyStatHighlight||""),Jt(ve,a(Ae).interactiveStickerPrompt||"")}),P("input",X,xe=>mr("hookBanner",xe.currentTarget.value)),P("input",Pe,xe=>mr("keyStatHighlight",xe.currentTarget.value)),P("input",ve,xe=>mr("interactiveStickerPrompt",xe.currentTarget.value)),T(ue,le)},mt=ue=>{var le=sm(),$e=Ye(le),X=l(h($e)),W=l($e);Ne(W,17,()=>a(Ae).beats||[],Yi,(ve,xe,Be)=>{var at=am(),ut=h(at);ut.textContent=`Beat ${Be+1}`;var je=l(ut);Ne(je,16,()=>["timecode","voiceover","onScreenText","bRollDirection"],Te=>Te,(Te,Me)=>{var pt=im(),bt=h(pt),en=l(bt);$(()=>{y(bt,Me),Jt(en,a(xe)[Me]||""),wt(en,"rows",Me==="timecode"?1:3)}),P("input",en,wi=>fi("beats",Be,Me,wi.currentTarget.value)),T(Te,pt)}),T(ve,at)});var Pe=l(W),Le=l(h(Pe));$(()=>{Jt(X,a(Ae).spokenHook0to3s||""),Jt(Le,a(Ae).closingCta||"")}),P("input",X,ve=>mr("spokenHook0to3s",ve.currentTarget.value)),P("input",Le,ve=>mr("closingCta",ve.currentTarget.value)),T(ue,le)};ce(Lr,ue=>{a(de)==="infographic"?ue(wr):a(de)==="carousel"?ue(Ie,1):a(de)==="story"?ue(pe,2):ue(mt,-1)})}var Lt=l(ht,2),Gt=l(h(Lt)),Zr=l(h(Gt)),Kt=l(Lt,2),ir=l(Kt,2),ar=h(ir),yr=l(h(ar));Ne(yr,20,()=>i,ue=>ue,(ue,le)=>{var $e=yi(),X=E($e,!0),W={};$(()=>{y(X,le),W!==(W=le)&&($e.__value=W)}),T(ue,$e)}),lr(yr);var sr=l(ar),Mr=l(ir,2),Sn=l(h(Mr),4);Ne(Sn,19,()=>a(oe),ue=>ue.id,(ue,le,$e)=>{var X=um(),W=h(X),Pe=E(W),Le=l(W),ve=E(Le),xe=l(Le),Be=l(h(xe)),at=l(xe),ut=l(h(at)),je=l(at),Te=l(h(je)),Me=h(Te);Me.value=Me.__value="";var pt=l(Me);pt.value=pt.__value="general";var bt=l(pt);bt.value=bt.__value="financial";var en=l(bt);en.value=en.__value="cultural";var wi=l(en);wi.value=wi.__value="clinical",lr(Te);var xa=l(je);{var ws=Mt=>{var ys=Es(),Sd=Ye(ys);{var kd=ji=>{var Is=om(),Ad=h(Is);Ws(Ad,()=>a(le).clinicalReviewRequested,Cd=>a(le).clinicalReviewRequested=Cd),T(ji,Is)},Td=ji=>{var Is=lm();T(ji,Is)};ce(Sd,ji=>{a(Vn)?ji(kd):ji(Td,-1)})}T(Mt,ys)};ce(xa,Mt=>{a(le).kind==="clinical"&&Mt(ws)})}var Ul=l(xa),mo=l(h(Ul)),bo=h(mo);bo.value=bo.__value="unreviewed";var wo=l(bo);wo.value=wo.__value="approved";var Fl=l(wo);Fl.value=Fl.__value="rejected",lr(mo);var Id=l(Ul);{var Ed=Mt=>{var ys=cm();T(Mt,ys)};ce(Id,Mt=>{a(le).kind==="clinical"&&Mt(Ed)})}$(()=>{y(Pe,`Claim ${a($e)+1}`),wt(Le,"aria-label",`Remove claim ${a($e)+1}`),y(ve,`Remove claim ${a($e)+1}`)}),P("click",Le,()=>gs(a(le).id)),He(Be,()=>a(le).text,Mt=>a(le).text=Mt),He(ut,()=>a(le).sourceUrl,Mt=>a(le).sourceUrl=Mt),Ur(Te,()=>a(le).kind,Mt=>a(le).kind=Mt),Ur(mo,()=>a(le).status,Mt=>a(le).status=Mt),T(ue,X)});var kn=l(Sn),_i=l(kn),gi=l(Mr,2);{var mi=ue=>{var le=dm(),$e=E(le);$(()=>y($e,`Preflight could not be recorded: ${a(Cr).error??""}`)),T(ue,le)},bi=ue=>{var le=fm();T(ue,le)};ce(gi,ue=>{var le;(le=a(Cr))!=null&&le.error?ue(mi):a(Cr)&&ue(bi,1)})}var Wi=l(Z,2);ih(Wi,()=>a(m)+a(I)+a(U).id+a(de),ue=>{Xh(ue,{get campaign(){return a(he)},get brandProfile(){return a(D)},get format(){return a(de)},get backlog(){return a(ne)},get activeStoryId(){return a(U).id},onpreflight:kt})}),$(()=>{y(gt,a(Ce)?"Unsaved changes":"Saved draft"),Kt.disabled=!a(Ce)||a(M)}),P("input",Zr,()=>{d(Ce,!0);try{d(Ae,JSON.parse(a(lt)),!0)}catch{}}),He(Zr,()=>a(lt),ue=>d(lt,ue)),P("click",Kt,vn),Ur(yr,()=>a(Pt),ue=>d(Pt,ue)),P("click",sr,ho),P("click",kn,Pa),P("click",_i,ms),T(F,ee)},Se=F=>{var ee=gm(),Z=Ye(ee),De=l(h(Z),4);Ne(De,23,()=>a(oe),Ie=>Ie.id,(Ie,pe,mt)=>{var Lt=_m(),Gt=h(Lt),Zr=E(Gt),Kt=l(Gt),ir=E(Kt),ar=l(Kt),yr=l(h(ar)),sr=l(ar),Mr=l(h(sr)),Sn=l(sr),kn=l(h(Sn)),_i=h(kn);_i.value=_i.__value="";var gi=l(_i);gi.value=gi.__value="general";var mi=l(gi);mi.value=mi.__value="financial";var bi=l(mi);bi.value=bi.__value="cultural";var Wi=l(bi);Wi.value=Wi.__value="clinical",lr(kn);var ue=l(Sn);{var le=ve=>{var xe=Es(),Be=Ye(xe);{var at=je=>{var Te=pm(),Me=h(Te);Ws(Me,()=>a(pe).clinicalReviewRequested,pt=>a(pe).clinicalReviewRequested=pt),T(je,Te)},ut=je=>{var Te=vm();T(je,Te)};ce(Be,je=>{a(Vn)?je(at):je(ut,-1)})}T(ve,xe)};ce(ue,ve=>{a(pe).kind==="clinical"&&ve(le)})}var $e=l(ue),X=l(h($e)),W=h(X);W.value=W.__value="unreviewed";var Pe=l(W);Pe.value=Pe.__value="approved";var Le=l(Pe);Le.value=Le.__value="rejected",lr(X),$(()=>{y(Zr,`Claim ${a(mt)+1}`),wt(Kt,"aria-label",`Remove claim ${a(mt)+1}`),y(ir,`Remove claim ${a(mt)+1}`)}),P("click",Kt,()=>gs(a(pe).id)),He(yr,()=>a(pe).text,ve=>a(pe).text=ve),He(Mr,()=>a(pe).sourceUrl,ve=>a(pe).sourceUrl=ve),Ur(kn,()=>a(pe).kind,ve=>a(pe).kind=ve),Ur(X,()=>a(pe).status,ve=>a(pe).status=ve),T(Ie,Lt)});var ke=l(De,2),gt=l(ke,2),ht=l(Z,2),Lr=l(h(ht),6),wr=E(Lr,!0);$(()=>{Lr.disabled=a(M),y(wr,a(M)?"Generating…":"Generate four-format draft")}),P("click",ke,Pa),P("click",gt,ms),P("click",Lr,_s),T(F,ee)};ce(vi,F=>{a(he)?F(ae):F(Se,-1)})}$(()=>{y(jt,a(U).title),y(Yr,a(he)?a(Sa):"No generated draft yet"),Tt.disabled=a(M),y(Xr,a(M)?"Working…":a(he)?"Regenerate draft":"Generate draft"),qt.disabled=a(M)||!a(he),y(En,`Export ${a(de)==="carousel"?"ZIP":a(de)==="reel"?"script":"PNG"} ↗`)}),P("click",Tt,_s),P("click",qt,po),T(Je,_t)},Ke=Je=>{var _t=bm(),rr=l(h(_t),4);P("click",rr,()=>d(Q,"backlog")),T(Je,_t)};ce(K,Je=>{a(U)?Je(_e):Je(Ke,-1)})}T(V,G)},In=V=>{var G=Pm(),K=Ye(G),_e=h(K),Ke=l(h(_e)),Je=l(_e),_t=l(h(Je)),rr=l(Je),xr=l(h(rr)),it=l(rr),jt=l(h(it)),nr=l(it),Yr=l(h(nr)),Nr=l(nr),Tt=l(h(Nr));Ne(Tt,20,()=>r,ae=>ae,(ae,Se)=>{var F=yi(),ee=E(F,!0),Z={};$(()=>{y(ee,Se),Z!==(Z=Se)&&(F.value=(F.__value=Z)??"")}),T(ae,F)}),lr(Tt);var Xr=l(Nr),qt=l(h(Xr));Ne(qt,20,()=>r,ae=>ae,(ae,Se)=>{var F=yi(),ee=E(F,!0),Z={};$(()=>{y(ee,Se),Z!==(Z=Se)&&(F.value=(F.__value=Z)??"")}),T(ae,F)}),lr(qt);var En=l(Xr,2);Ne(En,21,()=>a(D).colors||[],ae=>ae.name,(ae,Se,F)=>{var ee=wm(),Z=h(ee),De=l(Z),ke=h(De),gt=l(ke);$(()=>{y(Z,`${a(Se).name??""} `),wt(ke,"aria-label",`${a(Se).name??""} color`),wt(gt,"aria-label",`${a(Se).name??""} hex`)}),He(ke,()=>a(Se).hex,ht=>a(Se).hex=ht),He(gt,()=>a(Se).hex,ht=>a(Se).hex=ht),T(ae,ee)});var Or=l(K,2);{var Dr=ae=>{var Se=Am(),F=l(h(Se),6),ee=E(F,!0),Z=l(F,2),De=h(Z),ke=l(h(De),2);Ne(ke,19,()=>a(D).strategy.valueGroups||[],(Ie,pe)=>typeof Ie=="string"?Ie:Ie.id||pe,(Ie,pe)=>{var mt=Im(),Lt=h(mt),Gt=E(Lt,!0),Zr=l(Lt,2);{var Kt=ir=>{var ar=ym(),yr=Ye(ar),sr=E(yr,!0),Mr=l(yr,2),Sn=E(Mr,!0);$(()=>{y(sr,a(pe).ageRange||""),y(Sn,a(pe).motivation||"")}),T(ir,ar)};ce(Zr,ir=>{typeof a(pe)=="object"&&ir(Kt)})}$(()=>y(Gt,typeof a(pe)=="string"?a(pe):a(pe).name)),T(Ie,mt)},Ie=>{var pe=Em();T(Ie,pe)});var gt=l(De,2),ht=l(h(gt),2);Ne(ht,20,()=>a(D).strategy.pillars||[],Ie=>Ie,(Ie,pe)=>{var mt=Sm(),Lt=h(mt),Gt=E(Lt,!0);$(()=>y(Gt,pe)),T(Ie,mt)},Ie=>{var pe=km();T(Ie,pe)});var Lr=l(Z,2);{var wr=Ie=>{var pe=Tm();T(Ie,pe)};ce(Lr,Ie=>{a(D).strategy.clinicalClaimsQuarantined&&Ie(wr)})}$(()=>y(ee,a(D).strategy.status||"Proposed positioning")),T(ae,Se)};ce(Or,ae=>{a(D).strategy&&ae(Dr)})}var Qr=l(Or,2),vi=l(h(Qr),4);Ne(vi,17,()=>a(ne).filter(ae=>ae.category==="Source research"),ae=>ae.id,(ae,Se)=>{var F=Cm(),ee=h(F),Z=h(ee),De=E(Z,!0),ke=l(Z,2),gt=E(ke,!0),ht=l(ee,2);$(()=>{y(De,a(Se).title),y(gt,a(Se).reviewStatus||"Unreviewed research")}),P("click",ht,()=>Ra(a(Se))),T(ae,F)},ae=>{var Se=Rm();T(ae,Se)}),Si("submit",K,vo),He(Ke,()=>a(D).brandName,ae=>a(D).brandName=ae),He(_t,()=>a(D).websiteUrl,ae=>a(D).websiteUrl=ae),He(xr,()=>a(D).tagline,ae=>a(D).tagline=ae),He(jt,()=>a(D).mission,ae=>a(D).mission=ae),He(Yr,()=>a(D).logoText,ae=>a(D).logoText=ae),Ur(Tt,()=>a(D).fonts.heading,ae=>a(D).fonts.heading=ae),Ur(qt,()=>a(D).fonts.body,ae=>a(D).fonts.body=ae),T(V,G)},go=V=>{var G=Mm(),K=h(G),_e=h(K),Ke=l(h(_e),2),Je=l(_e,4),_t=h(Je),rr=h(_t),xr=E(rr,!0),it=l(_t,2),jt=h(it),nr=E(jt,!0),Yr=l(it,2),Nr=h(Yr),Tt=E(Nr,!0),Xr=l(Je,2),qt=l(h(Xr),2),En=E(qt,!0),Or=l(K,2),Dr=l(h(Or),2),Qr=l(Dr,2),vi=E(Qr),ae=l(Qr,6);Ne(ae,21,()=>{var X,W,Pe;return((Pe=(W=(X=a(gr))==null?void 0:X.observability)==null?void 0:W.jobs)==null?void 0:Pe.slice(0,10))||[]},X=>X.jobId,(X,W)=>{var Pe=Nm(),Le=h(Pe),ve=E(Le,!0),xe=l(Le),Be=l(xe),at=E(Be),ut=l(Be,2);{var je=Te=>{var Me=xm(),pt=E(Me,!0);$(bt=>{Me.disabled=a(M),wt(Me,"aria-label",bt),y(pt,a(W).status==="FAILED"?"Retry failed batch":"Retry interrupted batch")},[()=>`${a(W).status==="FAILED"?"Retry failed batch":"Retry interrupted batch"} ${a(W).jobId.slice(0,8)}`]),P("click",Me,()=>Qe(a(W).jobId)),T(Te,Me)};ce(ut,Te=>{(a(W).status==="FAILED"||a(W).status==="INTERRUPTED")&&Te(je)})}$(Te=>{var Me;y(ve,a(W).status),y(xe,` · Attempt ${(a(W).attempt||1)??""} `),y(at,`${(((Me=a(W).completedStoryIds)==null?void 0:Me.length)||0)??""} completed stories
                    ${Te??""}`)},[()=>a(W).retryOfJobId?` · Retry of ${a(W).retryOfJobId.slice(0,8)}`:""]),T(X,Pe)},X=>{var W=Om();T(X,W)});var Se=l(Or,2),F=l(h(Se),2),ee=h(F),Z=l(h(ee)),De=l(F,2),ke=h(De),gt=h(ke),ht=l(gt),Lr=l(ke),wr=l(h(Lr)),Ie=h(wr);Ie.value=Ie.__value="liquidity_desk";var pe=l(Ie);pe.value=pe.__value="vedic_dharma",lr(wr);var mt=l(Se,2),Lt=l(h(mt),2),Gt=h(Lt),Zr=h(Gt),Kt=E(Zr,!0),ir=l(Gt,2),ar=h(ir),yr=E(ar,!0),sr=l(ir,2),Mr=h(sr),Sn=E(Mr,!0),kn=l(Lt,4),_i=h(kn),gi=l(h(_i));Ne(gi,21,()=>{var X,W;return((W=(X=a(gr))==null?void 0:X.observability)==null?void 0:W.traces)||[]},X=>X.traceId,(X,W)=>{var Pe=Dm(),Le=h(Pe),ve=E(Le,!0),xe=l(Le),Be=E(xe,!0),at=l(xe),ut=E(at,!0),je=l(at),Te=E(je);$(()=>{y(ve,a(W).status),y(Be,a(W).provider),y(ut,a(W).model),y(Te,`${a(W).latencyMs??""} ms`)}),T(X,Pe)},X=>{var W=Lm();T(X,W)});var mi=l(kn,2),bi=l(h(mi),2),Wi=E(bi,!0),ue=l(mt,2),le=l(h(ue),2),$e=E(le,!0);$((X,W,Pe,Le)=>{var ve,xe,Be,at,ut,je,Te,Me,pt,bt,en,wi,xa,ws;y(xr,((ve=a(pn))==null?void 0:ve.status)||"Unknown"),y(nr,((Be=(xe=a(pn))==null?void 0:xe.checks)==null?void 0:Be.repository)||"Unknown"),y(Tt,((ut=(at=a(pn))==null?void 0:at.checks)==null?void 0:ut.generationProvider)||"Not checked"),y(En,X),Dr.disabled=a(M),wt(vi,"href",W),y(gt,`New brand in ${((je=a(ci))==null?void 0:je.name)??""}`),y(Kt,((pt=(Me=(Te=a(gr))==null?void 0:Te.observability)==null?void 0:Me.traces)==null?void 0:pt.length)||0),y(yr,((en=(bt=a(gr))==null?void 0:bt.observability)==null?void 0:en.usageEvents)||0),y(Sn,((ws=(xa=(wi=a(gr))==null?void 0:wi.observability)==null?void 0:xa.operationalEvents)==null?void 0:ws.length)||0),y(Wi,Pe),y($e,Le)},[()=>JSON.stringify(a(pn),null,2),()=>"/api/admin/backprop-jsonl?"+ka(),()=>JSON.stringify(a(gr),null,2),()=>JSON.stringify(a(ya),null,2)]),P("click",Ke,k),P("click",Dr,()=>Qe()),Si("submit",F,Y),He(Z,()=>a(hn),X=>d(hn,X)),Si("submit",De,Ve),He(ht,()=>a(Vi),X=>d(Vi,X)),Ur(wr,()=>a(oi),X=>d(oi,X)),T(V,G)};ce(tr,V=>{a(Hn)?V(yn):a(Q)==="backlog"?V(bs,1):a(Q)==="calendar"?V(pi,2):a(Q)==="studio"?V(qn,3):a(Q)==="brand"&&a(D)?V(In,4):a(Q)==="admin"&&a(Vn)&&V(go,5)})}$(V=>{var G,K;nt!==(nt=a(m))&&(Oe.value=(Oe.__value=nt)??"",zs(Oe,nt)),Ge!==(Ge=a(I))&&(Ee.value=(Ee.__value=Ge)??"",zs(Ee,Ge)),y(q,V),y(ze,a(g).username),y(Ze,a(g).role),y(gn,`${(((G=a(ci))==null?void 0:G.name)||"ORGANIZATION")??""} / ${(((K=a(zi))==null?void 0:K.name)||"BRAND")??""}`),y(bn,a(Q)==="backlog"?"Good stories, next up.":a(Q)==="calendar"?"Make room for the week.":a(Q)==="studio"?"Campaign Studio":a(Q)==="brand"?"Your brand, clearly.":"Studio operations"),y(wn,a(Q)==="studio"?"Edit the substance. Inspect the surface. Export with context.":"A focused workspace for source-backed editorial work.")},[()=>{var V;return(V=a(g).username)==null?void 0:V.slice(0,2)}]),P("click",L,V=>{V.preventDefault(),d(Q,"backlog")}),P("change",Oe,hs),P("change",Ee,ps),P("click",Vt,fo),T(_,w)};ce(xt,_=>{a(j)?_(Nt):a(g)?_(Ot,-1):_(Zt,1)})}T(t,Fe),hl()}Au(["click","change","input"]);eh(Fm,{target:document.getElementById("app")});
