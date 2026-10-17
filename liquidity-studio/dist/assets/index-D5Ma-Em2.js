var Ad=Object.defineProperty;var Ul=t=>{throw TypeError(t)};var Cd=(t,e,r)=>e in t?Ad(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var sr=(t,e,r)=>Cd(t,typeof e!="symbol"?e+"":e,r),bo=(t,e,r)=>e.has(t)||Ul("Cannot "+r);var p=(t,e,r)=>(bo(t,e,"read from private field"),r?r.call(t):e.get(t)),ae=(t,e,r)=>e.has(t)?Ul("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),ee=(t,e,r,n)=>(bo(t,e,"write to private field"),n?n.call(t,r):e.set(t,r),r),te=(t,e,r)=>(bo(t,e,"access private method"),r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function r(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=r(i);fetch(i.href,s)}})();const Rc=!1;var Zs=Array.isArray,Rd=Array.prototype.indexOf,za=Array.prototype.includes,eo=Array.from,Pc=Object.defineProperty,Ji=Object.getOwnPropertyDescriptor,Pd=Object.getOwnPropertyDescriptors,xd=Object.prototype,Nd=Array.prototype,xc=Object.getPrototypeOf,Fl=Object.isExtensible;const Od=()=>{};function Dd(t){for(var e=0;e<t.length;e++)t[e]()}function Nc(){var t,e,r=new Promise((n,i)=>{t=n,e=i});return{promise:r,resolve:t,reject:e}}function Ld(t,e){if(Array.isArray(t))return t;if(!(Symbol.iterator in t))return Array.from(t);const r=[];for(const n of t)if(r.push(n),r.length===e)break;return r}const Nt=2,ca=4,to=8,Oc=1<<24,Br=16,jr=32,ri=64,$o=128,cl=256,zr=512,ht=1024,Qe=2048,Sr=4096,Ht=8192,St=16384,ga=32768,Wa=1<<25,ua=65536,Ms=1<<17,Dc=1<<18,ma=1<<19,Md=1<<20,sn=1<<25,Us=1<<21,Yi=1<<22,Zn=1<<23,xi=Symbol("$state"),Lc=Symbol("component"),Ud=Symbol("legacy props"),Fd=Symbol(""),Ts=Symbol("attributes"),Bo=Symbol("class"),Ho=Symbol("style"),Oa=Symbol("text"),As=Symbol("form reset"),rs=new class extends Error{constructor(){super(...arguments);sr(this,"name","StaleReactionError");sr(this,"message","The reaction that called `getAbortSignal()` was re-run or destroyed")}};var Tc;const $d=!!((Tc=globalThis.document)!=null&&Tc.contentType)&&globalThis.document.contentType.includes("xml"),Bd=1,Hd=2,Mc=4,Vd=8,zd=16,Wd=1,jd=4,qd=8,Gd=16,Kd=1,Jd=2,Uc={},ft=Symbol("uninitialized"),Fc="http://www.w3.org/1999/xhtml",Yd="http://www.w3.org/2000/svg",Xd="http://www.w3.org/1998/Math/MathML";function Qd(){console.warn("https://svelte.dev/e/derived_inert")}function Zd(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function ef(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}let $c=!1;function Bc(t){return t===this.v}function tf(t,e){return t!=t?e==e:t!==e||t!==null&&typeof t=="object"||typeof t=="function"}function Hc(t){return!tf(t,this.v)}function rf(t){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function nf(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function af(t,e,r){throw new Error("https://svelte.dev/e/each_key_duplicate")}function sf(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function of(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function lf(t){throw new Error("https://svelte.dev/e/effect_orphan")}function cf(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function uf(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function df(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function ff(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function hf(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function pf(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}let vf=!1,xt=null;function da(t){xt=t}function ul(t,e=!1,r){xt={p:xt,i:!1,c:null,e:null,s:t,x:null,r:ge,l:null}}function dl(t){var e=xt,r=e.e;if(r!==null){e.e=null;for(var n of r)uu(n)}return e.i=!0,xt=e.p,fl(t)}function fl(t={}){return Pc(t,Lc,{value:!0}),t}function Vc(){return!0}let Ii=[];function zc(){var t=Ii;Ii=[],Dd(t)}function kn(t){if(Ii.length===0&&!$a){var e=Ii;queueMicrotask(()=>{e===Ii&&zc()})}Ii.push(t)}function _f(){for(;Ii.length>0;)zc()}const gf=-7169;function Ye(t,e){t.f=t.f&gf|e}function hl(t){(t.f&zr)!==0||t.deps===null?Ye(t,ht):Ye(t,Sr)}function Wc(t,e,r){(t.f&Qe)!==0?e.add(t):(t.f&Sr)!==0&&r.add(t),Ye(t,ht)}let $l=!1;function mf(){$l||($l=!0,document.addEventListener("reset",t=>{Promise.resolve().then(()=>{var e;if(!t.defaultPrevented)for(const r of t.target.elements)(e=r[As])==null||e.call(r)})},{capture:!0}))}function ba(t){var e=fe,r=ge;kr(null),un(null);try{return t()}finally{kr(e),un(r)}}function pl(t,e,r,n=r){t.addEventListener(e,()=>ba(r));const i=t[As];i?t[As]=()=>{i(),n(!0)}:t[As]=()=>n(!0),mf()}function bf(t,e,r,n){const i=ja;var s=t.filter(b=>!b.settled),o=e.map(i);if(r.length===0&&s.length===0){n(o);return}var c=ge,u=wf(),f=s.length===1?s[0].promise:s.length>1?Promise.all(s.map(b=>b.promise)):null;function v(b){if((c.f&St)===0){u();try{n([...o,...b])}catch(I){nn(I,c)}Fs()}}var g=jc();if(r.length===0){f.then(()=>v([])).finally(g);return}function w(){Promise.all(r.map(b=>yf(b))).then(v).catch(b=>nn(b,c)).finally(g)}f?f.then(()=>{if((c.f&St)!==0){g();return}u(),w(),Fs()}):w()}function wf(){var t=ge,e=fe,r=xt,n=z;return function(s=!0){un(t),kr(e),da(r),s&&(t.f&St)===0&&(n==null||n.activate(),n==null||n.apply())}}function Fs(t=!0){un(null),kr(null),da(null),t&&(z==null||z.deactivate())}function jc(){var t=ge,e=t.b,r=z,n=!!(e!=null&&e.is_rendered());return e==null||e.update_pending_count(1,r),r.increment(n,t),()=>{e==null||e.update_pending_count(-1,r),r.decrement(n,t)}}function ja(t){var e=Nt|Qe;return ge!==null&&(ge.f|=ma),{ctx:xt,deps:null,effects:null,equals:Bc,f:e,fn:t,reactions:null,rv:0,v:ft,wv:0,parent:ge,ac:null}}const Da=Symbol("obsolete");function yf(t,e,r){let n=ge;n===null&&nf();var i=void 0,s=Ui(ft),o=!fe,c=new Set;return Mf(()=>{var b,I;var u=ge,f=Nc();i=f.promise;try{Promise.resolve(t()).then(f.resolve,R=>{R!==rs&&f.reject(R)}).finally(Fs)}catch(R){f.reject(R),Fs()}var v=z;if(o){if((u.f&ga)!==0)var g=jc();if((b=n.b)!=null&&b.is_rendered())(I=v.async_deriveds.get(u))==null||I.reject(Da);else for(const R of c.values())R.reject(Da);c.add(f),v.async_deriveds.set(u,f)}const w=(R,S=void 0)=>{g==null||g(),c.delete(f),S!==Da&&(v.activate(),S?(s.f|=Zn,fa(s,S)):((s.f&Zn)!==0&&(s.f^=Zn),fa(s,R)),v.deactivate())};f.promise.then(w,R=>w(null,R||"unknown"))}),bl(()=>{for(const u of c)u.reject(Da)}),new Promise(u=>{function f(v){function g(){v===i?u(s):f(i)}v.then(g,g)}f(i)})}function Bt(t){const e=ja(t);return _u(e),e}function qc(t){const e=ja(t);return e.equals=Hc,e}function If(t){var e=t.effects;if(e!==null){t.effects=null;for(var r=0;r<e.length;r+=1)Xt(e[r])}}function vl(t){var e,r=ge,n=t.parent;if(!xn&&n!==null&&t.v!==ft&&(n.f&(St|Ht))!==0)return Qd(),t.v;un(n);try{If(t),e=wu(t)}finally{un(r)}return e}function Gc(t){var e=vl(t);if(!t.equals(e)&&(t.wv=mu(),(!(z!=null&&z.is_fork)||t.deps===null)&&(z!==null?(z.capture(t,e,!0),ei==null||ei.capture(t,e,!0)):t.v=e,t.deps===null))){Ye(t,ht);return}xn||(Et!==null?(ml()||z!=null&&z.is_fork)&&Et.set(t,e):hl(t))}function Ef(t){var e;if(t.effects!==null)for(const r of t.effects)(r.teardown||r.ac)&&((e=r.teardown)==null||e.call(r),r.ac!==null&&ba(()=>{r.ac.abort(rs),r.ac=null}),r.fn!==null&&(r.teardown=Od),qa(r,0),yl(r))}function Kc(t){if(t.effects!==null)for(const e of t.effects)e.teardown&&e.fn!==null&&ha(e)}let wo=null,Gi=null,z=null,ei=null,Et=null,Vo=null,$a=!1,yo=!1,Ba=null,Cs=null;var Bl=0;let Sf=1;var ra,Xn,Ti,na,ia,aa,yn,sa,cr,Xa,In,Fr,en,oa,Ai,be,zo,Wo,La,jo,Jc,Yc,Ki,kf,Ma;const Ys=class Ys{constructor(){ae(this,be);sr(this,"id",Sf++);ae(this,ra,!1);sr(this,"linked",!0);ae(this,Xn,null);ae(this,Ti,null);sr(this,"async_deriveds",new Map);sr(this,"current",new Map);sr(this,"previous",new Map);ae(this,na,new Set);ae(this,ia,new Set);ae(this,aa,0);ae(this,yn,new Map);ae(this,sa,null);ae(this,cr,[]);ae(this,Xa,[]);ae(this,In,new Set);ae(this,Fr,new Set);ae(this,en,new Map);ae(this,oa,new Set);sr(this,"is_fork",!1);ae(this,Ai,!1);Gi===null?wo=Gi=this:(ee(Gi,Ti,this),ee(this,Xn,Gi)),Gi=this}skip_effect(e){p(this,en).has(e)||p(this,en).set(e,{d:[],m:[]}),p(this,oa).delete(e)}unskip_effect(e,r=n=>this.schedule(n)){var n=p(this,en).get(e);if(n){p(this,en).delete(e);for(var i of n.d)Ye(i,Qe),r(i);for(i of n.m)Ye(i,Sr),r(i)}p(this,oa).add(e)}capture(e,r,n=!1){e.v!==ft&&!this.previous.has(e)&&this.previous.set(e,e.v),(e.f&Zn)===0&&(this.current.set(e,[r,n]),Et==null||Et.set(e,r)),this.is_fork||(e.v=r)}activate(){z=this}deactivate(){z=null,Et=null}flush(){try{yo=!0,z=this,te(this,be,La).call(this)}finally{Bl=0,Vo=null,Ba=null,Cs=null,yo=!1,z=null,Et=null,on.clear()}}discard(){var e;for(const r of p(this,ia))r(this);p(this,ia).clear();for(const r of this.async_deriveds.values())r.reject(Da);te(this,be,Ma).call(this),(e=p(this,sa))==null||e.resolve()}register_created_effect(e){p(this,Xa).push(e)}increment(e,r){if(ee(this,aa,p(this,aa)+1),e){let n=p(this,yn).get(r)??0;p(this,yn).set(r,n+1)}}decrement(e,r){if(ee(this,aa,p(this,aa)-1),e){let n=p(this,yn).get(r)??0;n===1?p(this,yn).delete(r):p(this,yn).set(r,n-1)}p(this,Ai)||(ee(this,Ai,!0),kn(()=>{ee(this,Ai,!1),this.linked&&this.flush()}))}transfer_effects(e,r){for(const n of e)p(this,In).add(n);for(const n of r)p(this,Fr).add(n);e.clear(),r.clear()}oncommit(e){p(this,na).add(e)}ondiscard(e){p(this,ia).add(e)}settled(){return(p(this,sa)??ee(this,sa,Nc())).promise}static ensure(){if(z===null){const e=z=new Ys;!yo&&!$a&&kn(()=>{p(e,ra)||e.flush()})}return z}apply(){{Et=null;return}}schedule(e){var r;if(Vo=e,(r=e.b)!=null&&r.is_pending&&(e.f&(ca|to|Oc))!==0&&(e.f&ga)===0){e.b.defer_effect(e);return}p(this,cr).push(e)}};ra=new WeakMap,Xn=new WeakMap,Ti=new WeakMap,na=new WeakMap,ia=new WeakMap,aa=new WeakMap,yn=new WeakMap,sa=new WeakMap,cr=new WeakMap,Xa=new WeakMap,In=new WeakMap,Fr=new WeakMap,en=new WeakMap,oa=new WeakMap,Ai=new WeakMap,be=new WeakSet,zo=function(){if(this.is_fork)return!0;for(const n of p(this,yn).keys()){for(var e=n,r=!1;e.parent!==null;){if(p(this,en).has(e)){r=!0;break}e=e.parent}if(!r)return!0}return!1},Wo=function(){var e=[];for(const s of p(this,cr))if(!((s.f&St)!==0||(s.f&(Qe|Sr))===0)){for(var r=s,n=!1;r.parent!==null;){r=r.parent;var i=r.f;if((i&(ri|jr))!==0){if((i&ht)===0){n=!0;break}r.f^=ht}}n||e.push(r)}return ee(this,cr,[]),e},La=function(){var c,u,f,v;ee(this,ra,!0);for(const g of p(this,In))p(this,Fr).delete(g),Ye(g,Qe),this.schedule(g);for(const g of p(this,Fr))Ye(g,Sr),this.schedule(g);this.apply();for(var e=Ba=[],r=[],n=Cs=[];p(this,cr).length>0;){Bl++>1e3&&(te(this,be,Ma).call(this),Af());for(const g of te(this,be,Wo).call(this))try{te(this,be,jo).call(this,g,e,r)}catch(w){throw Zc(g),te(this,be,zo).call(this)||this.discard(),w}}if(z=null,n.length>0){var i=Ys.ensure();for(const g of n)i.schedule(g)}if(Ba=null,Cs=null,te(this,be,zo).call(this)){te(this,be,Ki).call(this,r),te(this,be,Ki).call(this,e);for(const[g,w]of p(this,en))Qc(g,w);n.length>0&&te(c=z,be,La).call(c);return}const s=te(this,be,Jc).call(this);if(s){te(this,be,Ki).call(this,r),te(this,be,Ki).call(this,e),te(u=s,be,Yc).call(u,this);return}p(this,In).clear(),p(this,Fr).clear();for(const g of p(this,na))g(this);p(this,na).clear(),ei=this,Hl(r),Hl(e),ei=null,(f=p(this,sa))==null||f.resolve();var o=z;if(p(this,aa)===0&&(p(this,cr).length===0||o!==null)&&te(this,be,Ma).call(this),p(this,cr).length>0)if(o!==null){for(const g of p(this,cr))p(o,cr).push(g);ee(this,cr,[])}else o=this;o!==null&&(on.clear(),te(v=o,be,La).call(v))},jo=function(e,r,n){e.f^=ht;for(var i=e.first;i!==null;){var s=i.f,o=(s&(jr|ri))!==0,c=o&&(s&ht)!==0,u=c||(s&Ht)!==0||p(this,en).has(i);if(!u&&i.fn!==null){o?i.f^=ht:(s&ca)!==0?r.push(i):as(i)&&((s&Br)!==0&&p(this,Fr).add(i),ha(i));var f=i.first;if(f!==null){i=f;continue}}for(;i!==null;){var v=i.next;if(v!==null){i=v;break}i=i.parent}}},Jc=function(){for(var e=p(this,Xn);e!==null;){if(!e.is_fork){for(const[r,[,n]]of this.current)if(e.current.has(r)&&!n)return e}e=p(e,Xn)}return null},Yc=function(e){var n;for(const[i,s]of e.current)!this.previous.has(i)&&e.previous.has(i)&&this.previous.set(i,e.previous.get(i)),this.current.set(i,s);for(const[i,s]of e.async_deriveds){const o=this.async_deriveds.get(i);o&&s.promise.then(o.resolve).catch(o.reject)}e.async_deriveds.clear(),this.transfer_effects(p(e,In),p(e,Fr));const r=i=>{var s=i.reactions;if(s!==null&&!((i.f&Nt)!==0&&(i.f&(Qe|Sr))===0))for(const u of s){var o=u.f;if((o&Nt)!==0)r(u);else{var c=u;o&(Yi|Br)&&!this.async_deriveds.has(c)&&(p(this,Fr).delete(c),Ye(c,Qe),this.schedule(c))}}};for(const i of this.current.keys())r(i);this.oncommit(()=>e.discard()),te(n=e,be,Ma).call(n),z=this,te(this,be,La).call(this)},Ki=function(e){for(var r=0;r<e.length;r+=1)Wc(e[r],p(this,In),p(this,Fr))},kf=function(){var g,w;for(let b=wo;b!==null;b=p(b,Ti)){var e=b.id<this.id,r=[];for(const[I,[R,S]]of this.current){if(b.current.has(I)){var n=b.current.get(I)[0];if(e&&R!==n)b.current.set(I,[R,S]);else continue}r.push(I)}if(e)for(const[I,R]of this.async_deriveds){const S=b.async_deriveds.get(I);S&&R.promise.then(S.resolve).catch(S.reject)}var i=[...b.current.keys()].filter(I=>!b.current.get(I)[1]);if(!(!p(b,ra)||i.length===0)){var s=i.filter(I=>!this.current.has(I));if(s.length===0)e&&b.discard();else if(r.length>0){if(e)for(const I of p(this,oa))b.unskip_effect(I,R=>{var S;(R.f&(Br|Yi))!==0?b.schedule(R):te(S=b,be,Ki).call(S,[R])});b.activate();var o=new Set,c=new Map;for(var u of r)Xc(u,s,o,c);c=new Map;var f=[...b.current].filter(([I,R])=>{const S=this.current.get(I);return S?S[0]!==R[0]||S[1]!==R[1]:!0}).map(([I])=>I);if(f.length>0)for(const I of p(this,Xa))(I.f&(St|Ht|Ms))===0&&_l(I,f,c)&&((I.f&(Yi|Br))!==0?(Ye(I,Qe),b.schedule(I)):p(b,In).add(I));if(p(b,cr).length>0&&!p(b,Ai)){b.apply();for(var v of te(g=b,be,Wo).call(g))te(w=b,be,jo).call(w,v,[],[])}b.deactivate()}}}},Ma=function(){if(this.linked){var e=p(this,Xn),r=p(this,Ti);e===null?wo=r:ee(e,Ti,r),r===null?Gi=e:ee(r,Xn,e),this.linked=!1}};let Mi=Ys;function Tf(t){var e=$a,r=ei;ei=null,$a=!0;try{for(var n;;){if(_f(),z===null)return n;z.flush()}}finally{$a=e,ei=r}}function Af(){try{cf()}catch(t){nn(t,Vo)}}let Ur=null;function Hl(t){var e=t.length;if(e!==0){for(var r=0;r<e;){var n=t[r++];if((n.f&(St|Ht))===0&&as(n)&&(Ur=new Set,ha(n),n.deps===null&&n.first===null&&n.nodes===null&&n.teardown===null&&n.ac===null&&hu(n),(Ur==null?void 0:Ur.size)>0)){on.clear();for(const i of Ur){if((i.f&(St|Ht))!==0)continue;const s=[i];let o=i.parent;for(;o!==null;)Ur.has(o)&&(Ur.delete(o),s.push(o)),o=o.parent;for(let c=s.length-1;c>=0;c--){const u=s[c];(u.f&(St|Ht))===0&&ha(u)}}Ur.clear()}}Ur=null}}function Xc(t,e,r,n){if(!r.has(t)&&(r.add(t),t.reactions!==null))for(const i of t.reactions){const s=i.f;(s&Nt)!==0?Xc(i,e,r,n):(s&(Yi|Br))!==0&&(s&Qe)===0&&_l(i,e,n)&&(Ye(i,Qe),gl(i))}}function _l(t,e,r){const n=r.get(t);if(n!==void 0)return n;if(t.deps!==null)for(const i of t.deps){if(za.call(e,i))return!0;if((i.f&Nt)!==0&&_l(i,e,r))return r.set(i,!0),!0}return r.set(t,!1),!1}function gl(t){z.schedule(t)}function Qc(t,e){if(!((t.f&jr)!==0&&(t.f&ht)!==0)){(t.f&Qe)!==0?e.d.push(t):(t.f&Sr)!==0&&e.m.push(t),Ye(t,ht);for(var r=t.first;r!==null;)Qc(r,e),r=r.next}}function Zc(t){Ye(t,ht);for(var e=t.first;e!==null;)Zc(e),e=e.next}let $s=new Set;const on=new Map;let eu=!1;function Ui(t,e){var r={f:0,v:t,reactions:null,equals:Bc,rv:0,wv:0};return r}function O(t,e){const r=Ui(t);return _u(r),r}function Cf(t,e=!1,r=!0){const n=Ui(t);return e||(n.equals=Hc),n}function d(t,e,r=!1){fe!==null&&(!Hr||(fe.f&Ms)!==0)&&Vc()&&(fe.f&(Nt|Br|Yi|Ms))!==0&&(ln===null||!ln.has(t))&&hf();let n=r?vr(e):e;return fa(t,n,Cs)}var wi=null,qo=0;function fa(t,e,r=null){if(!t.equals(e)){xn?on.set(t,e):on.has(t)||on.set(t,t.v);var n=Mi.ensure();if(n.capture(t,e),(t.f&Nt)!==0){const i=t;(t.f&Qe)!==0&&vl(i),Et===null&&hl(i)}t.wv=mu(),wi=null,qo=0,tu(t,Qe,r),wi=null,ge!==null&&(ge.f&ht)!==0&&(ge.f&(jr|ri))===0&&(yr===null?Ff([t]):yr.push(t)),!n.is_fork&&$s.size>0&&!eu&&Rf()}return e}function Rf(){eu=!1;for(const t of $s){(t.f&ht)!==0&&Ye(t,Sr);let e;try{e=as(t)}catch{e=!0}e&&ha(t)}$s.clear()}function Ha(t){d(t,t.v+1)}function tu(t,e,r){var n=t.reactions;if(n!==null){var i=n.length;if(qo+=i,qo>1e5&&wi===null&&(wi=new Set),wi!==null){if(wi.has(t))return;wi.add(t)}for(var s=0;s<i;s++){var o=n[s],c=o.f,u=(c&Qe)===0;if(u&&Ye(o,e),(c&Ms)!==0)$s.add(o);else if((c&Nt)!==0){var f=o;Et==null||Et.delete(f),tu(f,Sr,r)}else if(u){var v=o;(c&Br)!==0&&Ur!==null&&Ur.add(v),r!==null?r.push(v):gl(v)}}}}function vr(t){if(typeof t!="object"||t===null||xi in t||Lc in t)return t;const e=xc(t);if(e!==xd&&e!==Nd)return t;var r=new Map,n=Zs(t),i=O(0),s=Oi,o=c=>{if(Oi===s)return c();var u=fe,f=Oi;kr(null),Wl(s);var v=c();return kr(u),Wl(f),v};return n&&r.set("length",O(t.length)),new Proxy(t,{defineProperty(c,u,f){(!("value"in f)||f.configurable===!1||f.enumerable===!1||f.writable===!1)&&df();var v=r.get(u);return v===void 0?o(()=>{var g=O(f.value);return r.set(u,g),g}):d(v,f.value,!0),!0},deleteProperty(c,u){var f=r.get(u);if(f===void 0){if(u in c){const v=o(()=>O(ft));r.set(u,v),Ha(i)}}else d(f,ft),Ha(i);return!0},get(c,u,f){var b;if(u===xi)return t;var v=r.get(u),g=u in c;if(v===void 0&&(!g||(b=Ji(c,u))!=null&&b.writable)&&(v=o(()=>{var I=vr(g?c[u]:ft),R=O(I);return R}),r.set(u,v)),v!==void 0){var w=a(v);return w===ft?void 0:w}return Reflect.get(c,u,f)},getOwnPropertyDescriptor(c,u){var w;(w=this.has)==null||w.call(this,c,u);var f=Reflect.getOwnPropertyDescriptor(c,u),v=r.get(u);if(v!==void 0){var g=a(v);if(g===ft)return;if(f&&"value"in f)f.value=g;else return{enumerable:!0,configurable:!0,value:g,writable:!0}}return f},has(c,u){var w;if(u===xi)return!0;var f=r.get(u),v=f!==void 0&&f.v!==ft||Reflect.has(c,u);if(f!==void 0||ge!==null&&(!v||(w=Ji(c,u))!=null&&w.writable)){f===void 0&&(f=o(()=>{var b=v?vr(c[u]):ft,I=O(b);return I}),r.set(u,f));var g=a(f);if(g===ft)return!1}return v},set(c,u,f,v){var M;var g=r.get(u),w=u in c;if(n&&u==="length")for(var b=f;b<g.v;b+=1){var I=r.get(b+"");I!==void 0?d(I,ft):b in c&&(I=o(()=>O(ft)),r.set(b+"",I))}if(g===void 0)(!w||(M=Ji(c,u))!=null&&M.writable)&&(g=o(()=>O(void 0)),d(g,vr(f)),r.set(u,g));else{w=g.v!==ft;var R=o(()=>vr(f));d(g,R)}var S=Reflect.getOwnPropertyDescriptor(c,u);if(S!=null&&S.set&&S.set.call(v,f),!w){if(n&&typeof u=="string"){var x=r.get("length"),q=Number(u);Number.isInteger(q)&&q>=x.v&&d(x,q+1)}Ha(i)}return!0},ownKeys(c){a(i);var u=Reflect.ownKeys(c).filter(g=>{var w=r.get(g);return w===void 0||w.v!==ft});for(var[f,v]of r)v.v!==ft&&!(f in c)&&u.push(f);return u},setPrototypeOf(){ff()}})}function Vl(t){try{if(t!==null&&typeof t=="object"&&xi in t)return t[xi]}catch{}return t}function ru(t,e){return Object.is(Vl(t),Vl(e))}var Go,nu,iu,au,su;function Pf(){if(Go===void 0){Go=window,nu=document,iu=/Firefox/.test(navigator.userAgent);var t=Element.prototype,e=Node.prototype,r=Text.prototype;au=Ji(e,"firstChild").get,su=Ji(e,"nextSibling").get,Fl(t)&&(t[Bo]=void 0,t[Ts]=null,t[Ho]=void 0,t.__e=void 0),Fl(r)&&(r[Oa]=void 0)}}function Pn(t=""){return document.createTextNode(t)}function Tn(t){return au.call(t)}function ns(t){return su.call(t)}function h(t,e){return Tn(t)}function Je(t,e=!1){{var r=Tn(t);return r instanceof Comment&&r.data===""?ns(r):r}}function E(t,e=!1){return Tn(t)}function l(t,e=1,r=!1){let n=t;for(;e--;)n=ns(n);return n}function xf(t){t.textContent=""}function ou(){return!1}function lu(t,e,r){return e==null||e===Fc?r?document.createElement(t,{is:r}):document.createElement(t):r?document.createElementNS(e,t,{is:r}):document.createElementNS(e,t)}function Nf(t){var e=ge;if(e===null)return fe.f|=Zn,t;if((e.f&ga)===0&&(e.f&ca)===0)throw t;nn(t,e)}function nn(t,e){if(t===Uc)throw t;if(!(e!==null&&(e.f&St)!==0)){for(;e!==null;){if((e.f&$o)!==0&&(e.f&(St|Wa))===0){if((e.f&ga)===0)throw t;try{e.b.error(t);return}catch(r){t=r}}e=e.parent}throw t}}function Of(t){ge===null&&(fe===null&&lf(),of()),xn&&sf()}function Df(t,e){var r=e.last;r===null?e.last=e.first=t:(r.next=t,t.prev=r,e.last=t)}function Dn(t,e){var r=ge;r!==null&&(r.f&Ht)!==0&&(t|=Ht);var n={ctx:xt,deps:null,nodes:null,f:t|Qe|zr,first:null,fn:e,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,wv:0,ac:null};z==null||z.register_created_effect(n);var i=n;if((t&ca)!==0)Ba!==null?Ba.push(n):Mi.ensure().schedule(n);else if(e!==null){try{ha(n)}catch(o){throw Xt(n),o}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&ma)===0&&(i=i.first,(t&Br)!==0&&(t&ua)!==0&&i!==null&&(i.f|=ua))}if(i!==null&&(i.parent=r,r!==null&&Df(i,r),fe!==null&&(fe.f&Nt)!==0&&(t&ri)===0)){var s=fe;(s.effects??(s.effects=[])).push(i)}return n}function ml(){return fe!==null&&!Hr}function bl(t){const e=Dn(to,null);return Ye(e,ht),e.teardown=t,e}function cu(t){Of();var e=ge.f,r=!fe&&(e&jr)!==0&&xt!==null&&!xt.i;if(r){var n=xt;(n.e??(n.e=[])).push(t)}else return uu(t)}function uu(t){return Dn(ca|Md,t)}function Lf(t){Mi.ensure();const e=Dn(ri|ma,t);return(r={})=>new Promise(n=>{r.outro?Ni(e,()=>{Xt(e),n(void 0)}):(Xt(e),n(void 0))})}function wl(t){return Dn(ca,t)}function Mf(t){return Dn(Yi|ma,t)}function ro(t,e=0){return Dn(to|e,t)}function $(t,e=[],r=[],n=[]){bf(n,e,r,i=>{Dn(to,()=>{t(...i.map(a))})})}function is(t,e=0){var r=Dn(Br|e,t);return r}function pr(t){return Dn(jr|ma,t)}function du(t){var e=t.teardown;if(e!==null){const r=xn,n=fe;zl(!0),kr(null);try{e.call(null)}catch(i){nn(i,t.parent)}finally{zl(r),kr(n)}}}function yl(t,e=!1){var r=t.first;for(t.first=t.last=null;r!==null;){const i=r.ac;i!==null&&ba(()=>{i.abort(rs)});var n=r.next;(r.f&ri)!==0?r.parent=null:Xt(r,e),r=n}}function Uf(t){for(var e=t.first;e!==null;){var r=e.next;(e.f&jr)===0&&Xt(e),e=r}}function Xt(t,e=!0){var r=!1;(e||(t.f&Dc)!==0)&&t.nodes!==null&&t.nodes.end!==null&&(fu(t.nodes.start,t.nodes.end),r=!0),t.f|=Wa,yl(t,e&&!r),qa(t,0);var n=t.nodes&&t.nodes.t;if(n!==null)for(const s of n)s.stop();du(t),t.f^=Wa,t.f|=St;var i=t.parent;i!==null&&i.first!==null&&hu(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes=t.ac=t.b=null}function fu(t,e){for(;t!==null;){var r=t===e?null:ns(t);t.remove(),t=r}}function hu(t){var e=t.parent,r=t.prev,n=t.next;r!==null&&(r.next=n),n!==null&&(n.prev=r),e!==null&&(e.first===t&&(e.first=n),e.last===t&&(e.last=r))}function Ni(t,e,r=!0){var n=[];t.f|=cl,pu(t,n,!0);var i=()=>{r&&Xt(t),e&&e()},s=n.length;if(s>0){var o=()=>--s||i();for(var c of n)c.out(o)}else i()}function pu(t,e,r){if((t.f&Ht)===0){t.f^=Ht;var n=t.nodes&&t.nodes.t;if(n!==null)for(const c of n)(c.is_global||r)&&e.push(c);for(var i=t.first;i!==null;){var s=i.next;if((i.f&ri)===0){var o=(i.f&ua)!==0||(i.f&jr)!==0&&(t.f&Br)!==0;pu(i,e,o?r:!1)}i=s}}}function Bs(t){t.f&=~cl,vu(t,!0)}function vu(t,e){if((t.f&cl)===0&&(t.f&Ht)!==0){t.f^=Ht,(t.f&ht)===0&&(Ye(t,Qe),Mi.ensure().schedule(t));for(var r=t.first;r!==null;){var n=r.next,i=(r.f&ua)!==0||(r.f&jr)!==0;vu(r,i?e:!1),r=n}var s=t.nodes&&t.nodes.t;if(s!==null)for(const o of s)(o.is_global||e)&&o.in()}}function Il(t,e){if(t.nodes)for(var r=t.nodes.start,n=t.nodes.end;r!==null;){var i=r===n?null:ns(r);e.append(r),r=i}}let xn=!1;function zl(t){xn=t}let fe=null,Hr=!1;function kr(t){fe=t}let ge=null;function un(t){ge=t}let ln=null;function _u(t){fe!==null&&((fe.f&Us)!==0||(fe.f&Nt)!==0)&&(ln??(ln=new Set)).add(t)}let Yt=null,hr=0,yr=null;function Ff(t){yr=t}let gu=1,Ei=0,Oi=Ei;function Wl(t){Oi=t}function mu(){return++gu}function as(t){var e=t.f;if((e&Qe)!==0)return!0;if((e&Sr)!==0){for(var r=t.deps,n=r.length,i=0;i<n;i++){var s=r[i];if(as(s)&&Gc(s),s.wv>t.wv)return!0}(e&zr)!==0&&Et===null&&Ye(t,ht)}return!1}function bu(t,e,r=!0){var n=t.reactions;if(n!==null&&!(ln!==null&&ln.has(t)))for(var i=0;i<n.length;i++){var s=n[i];(s.f&Nt)!==0?bu(s,e,!1):e===s&&(r?Ye(s,Qe):(s.f&ht)!==0&&Ye(s,Sr),gl(s))}}function wu(t){var e=Yt,r=hr,n=yr,i=fe,s=ln,o=xt,c=Hr,u=Oi,f=t.f;Yt=null,hr=0,yr=null,fe=(f&(jr|ri))===0?t:null,ln=null,da(t.ctx),Hr=!1,Oi=++Ei,t.ac!==null&&(ba(()=>{t.ac.abort(rs)}),t.ac=null);try{t.f|=Us;var v=t.fn,g=v();t.f|=ga;var w=jl(t);if(Vc()&&yr!==null&&!Hr&&w!==null&&(t.f&(Nt|Sr|Qe))===0)for(var b=0;b<yr.length;b++)bu(yr[b],t);if(i!==null&&i!==t){if(Ei++,i.deps!==null)for(let I=0;I<r;I+=1)i.deps[I].rv=Ei;if(e!==null)for(const I of e)I.rv=Ei;yr!==null&&(n===null?n=yr:n.push(...yr))}return(t.f&Zn)!==0&&(t.f^=Zn),g}catch(I){return jl(t),Nf(I)}finally{t.f^=Us,Yt=e,hr=r,yr=n,fe=i,ln=s,da(o),Hr=c,Oi=u}}function jl(t){var i;var e=t.deps,r=z==null?void 0:z.is_fork;if(Yt!==null){var n;if(r||qa(t,hr),e!==null&&hr>0)for(e.length=hr+Yt.length,n=0;n<Yt.length;n++)e[hr+n]=Yt[n];else t.deps=e=Yt;if(ml()&&(t.f&zr)!==0)for(n=hr;n<e.length;n++)((i=e[n]).reactions??(i.reactions=[])).push(t)}else!r&&e!==null&&hr<e.length&&(qa(t,hr),e.length=hr);return e}function $f(t,e){let r=e.reactions;if(r!==null){var n=Rd.call(r,t);if(n!==-1){var i=r.length-1;i===0?r=e.reactions=null:(r[n]=r[i],r.pop())}}if(r===null&&(e.f&Nt)!==0&&(Yt===null||!za.call(Yt,e))){var s=e;(s.f&zr)!==0&&(s.f^=zr),s.v!==ft&&hl(s),s.ac!==null&&ba(()=>{s.ac.abort(rs),s.ac=null,Ye(s,Qe)}),Ef(s),qa(s,0)}}function qa(t,e){var r=t.deps;if(r!==null)for(var n=e;n<r.length;n++)$f(t,r[n])}function ha(t){var e=t.f;if((e&St)===0){Ye(t,ht);var r=ge;ge=t;try{(e&(Br|Oc))!==0?Uf(t):yl(t),du(t);var n=wu(t);t.teardown=typeof n=="function"?n:null,t.wv=gu;var i;Rc&&vf&&(t.f&Qe)!==0&&t.deps}finally{ge=r}}}async function yu(){await Promise.resolve(),Tf()}function a(t){var e=t.f,r=(e&Nt)!==0;if(fe!==null&&!Hr){var n=ge!==null&&(ge.f&St)!==0;if(!n&&(ln===null||!ln.has(t))){var i=fe.deps;if((fe.f&Us)!==0)t.rv<Ei&&(t.rv=Ei,Yt===null&&i!==null&&i[hr]===t?hr++:Yt===null?Yt=[t]:Yt.push(t));else{fe.deps??(fe.deps=[]),za.call(fe.deps,t)||fe.deps.push(t);var s=t.reactions;s===null?t.reactions=[fe]:za.call(s,fe)||s.push(fe)}}}if(xn&&on.has(t))return on.get(t);if(r){var o=t;if(xn){var c=o.v;return((o.f&ht)===0&&o.reactions!==null||Eu(o))&&(c=vl(o)),on.set(o,c),c}var u=(o.f&zr)===0&&!Hr&&fe!==null&&(fe.f&zr)!==0,f=(o.f&ga)===0;as(o)&&(u&&(o.f|=zr),Gc(o)),u&&!f&&(Kc(o),Iu(o))}if(Et!=null&&Et.has(t))return Et.get(t);if((t.f&Zn)!==0)throw t.v;return t.v}function Iu(t){if(t.f|=zr,t.deps!==null)for(const r of t.deps){var e=r.reactions;e===null?r.reactions=[t]:za.call(e,t)||e.push(t),(r.f&Nt)!==0&&(r.f&zr)===0&&(Kc(r),Iu(r))}}function Eu(t){if(t.v===ft)return!0;if(t.deps===null)return!1;for(const e of t.deps)if(on.has(e)||(e.f&Nt)!==0&&Eu(e))return!0;return!1}function wa(t){var e=Hr;try{return Hr=!0,t()}finally{Hr=e}}const Bf=["touchstart","touchmove"];function Hf(t){return Bf.includes(t)}const Si=Symbol("events"),Su=new Set,Ko=new Set;function Vf(t,e,r,n={}){function i(s){if(n.capture||Jo.call(e,s),!s.cancelBubble)return ba(()=>r==null?void 0:r.call(this,s))}return t.startsWith("pointer")||t.startsWith("touch")||t==="wheel"?(i.__removed=!1,kn(()=>{i.__removed||e.addEventListener(t,i,n)})):e.addEventListener(t,i,n),i}function yi(t,e,r,n,i){var s={capture:n,passive:i},o=Vf(t,e,r,s);(e===document.body||e===window||e===document||e instanceof HTMLMediaElement)&&bl(()=>{o.__removed=!0,e.removeEventListener(t,o,s)})}function P(t,e,r){(e[Si]??(e[Si]={}))[t]=r}function ku(t){for(var e=0;e<t.length;e++)Su.add(t[e]);for(var r of Ko)r(t)}let Io=null,Eo=!1;function Jo(t){var R,S;var e=this,r=e.ownerDocument,n=t.type,i=((R=t.composedPath)==null?void 0:R.call(t))||[],s=i[0]||t.target;Io=t,Eo||(Eo=!0,setTimeout(()=>{Eo=!1,Io=null}));var o=0,c=Io===t&&t[Si];if(c){var u=i.indexOf(c);if(u!==-1&&(e===document||e===window)){t[Si]=e;return}var f=i.indexOf(e);if(f===-1)return;u<=f&&(o=u)}if(s=i[o]||t.target,s!==e){Pc(t,"currentTarget",{configurable:!0,get(){return s||r}});var v=fe,g=ge;kr(null),un(null);try{for(var w,b=[];s!==null&&s!==e;){try{var I=(S=s[Si])==null?void 0:S[n];I!=null&&(!s.disabled||t.target===s)&&I.call(s,t)}catch(x){w?b.push(x):w=x}if(t.cancelBubble)break;o++,s=o<i.length?i[o]:null}if(w){for(let x of b)queueMicrotask(()=>{throw x});throw w}}finally{t[Si]=e,delete t.currentTarget,kr(v),un(g)}}}var Ac;const So=((Ac=globalThis==null?void 0:globalThis.window)==null?void 0:Ac.trustedTypes)&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:t=>t});function zf(t){return(So==null?void 0:So.createHTML(t))??t}function Wf(t){var e=lu("template");return e.innerHTML=zf(t.replaceAll("<!>","<!---->")),e.content}function Ga(t,e){var r=ge;r.nodes===null&&(r.nodes={start:t,end:e,a:null,t:null})}function A(t,e){var r=(e&Kd)!==0,n=(e&Jd)!==0,i,s=!t.startsWith("<!>");return()=>{i===void 0&&(i=Wf(s?t:"<!>"+t),r||(i=Tn(i)));var o=n||iu?document.importNode(i,!0):i.cloneNode(!0);if(r){var c=Tn(o),u=o.lastChild;Ga(c,u)}else Ga(o,o);return o}}function ys(){var t=document.createDocumentFragment(),e=document.createComment(""),r=Pn();return t.append(e,r),Ga(e,r),t}function k(t,e){t!==null&&t.before(e)}function jf(t){let e=0,r=Ui(0),n;return()=>{ml()&&(a(r),ro(()=>(e===0&&(n=wa(()=>t(()=>Ha(r)))),e+=1,()=>{kn(()=>{e-=1,e===0&&(n==null||n(),n=void 0,Ha(r))})})))}}var qf=ua|ma;function Gf(t,e,r,n){new Kf(t,e,r,n)}var Ir,ll,Er,Ci,Pt,ur,$t,dr,tn,Ri,Qn,la,Qa,Za,En,Xs,_e,Jf,Yf,Yo,Gn,Xf,Xo,Ua,Rs,Qo,Zo;class Kf{constructor(e,r,n,i){ae(this,_e);sr(this,"parent");sr(this,"is_pending",!1);sr(this,"transform_error");ae(this,Ir);ae(this,ll,null);ae(this,Er);ae(this,Ci);ae(this,Pt);ae(this,ur,null);ae(this,$t,null);ae(this,dr,null);ae(this,tn,null);ae(this,Ri,0);ae(this,Qn,0);ae(this,la,!1);ae(this,Qa,new Set);ae(this,Za,new Set);ae(this,En,null);ae(this,Xs,jf(()=>(ee(this,En,Ui(p(this,Ri))),()=>{ee(this,En,null)})));var s;ee(this,Ir,e),ee(this,Er,r),ee(this,Ci,o=>{var c=ge;c.b=this,c.f|=$o,n(o)}),this.parent=ge.b,this.transform_error=i??((s=this.parent)==null?void 0:s.transform_error)??(o=>o),ee(this,Pt,is(()=>{te(this,_e,Xo).call(this)},qf))}defer_effect(e){Wc(e,p(this,Qa),p(this,Za))}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!p(this,Er).pending}update_pending_count(e,r){te(this,_e,Qo).call(this,e,r),ee(this,Ri,p(this,Ri)+e),!(!p(this,En)||p(this,la))&&(ee(this,la,!0),kn(()=>{ee(this,la,!1),p(this,En)&&fa(p(this,En),p(this,Ri))}))}get_effect_pending(){return p(this,Xs).call(this),a(p(this,En))}error(e){if(e===Uc||!p(this,Er).onerror&&!p(this,Er).failed)throw e;z!=null&&z.is_fork?(p(this,ur)&&z.skip_effect(p(this,ur)),p(this,$t)&&z.skip_effect(p(this,$t)),p(this,dr)&&z.skip_effect(p(this,dr)),z.oncommit(()=>{te(this,_e,Gn).call(this)||te(this,_e,Zo).call(this,e)})):te(this,_e,Zo).call(this,e)}}Ir=new WeakMap,ll=new WeakMap,Er=new WeakMap,Ci=new WeakMap,Pt=new WeakMap,ur=new WeakMap,$t=new WeakMap,dr=new WeakMap,tn=new WeakMap,Ri=new WeakMap,Qn=new WeakMap,la=new WeakMap,Qa=new WeakMap,Za=new WeakMap,En=new WeakMap,Xs=new WeakMap,_e=new WeakSet,Jf=function(){try{ee(this,ur,pr(()=>p(this,Ci).call(this,p(this,Ir))))}catch(e){this.error(e)}},Yf=function(e){const r=p(this,Er).failed,{reset:n,invoke_onerror:i}=te(this,_e,Yo).call(this,e);kn(i),r&&ee(this,dr,pr(()=>{r(p(this,Ir),()=>e,()=>n)}))},Yo=function(e){var r=!1,n=!1;const i=()=>{if(!te(this,_e,Gn).call(this)){if(r){ef();return}r=!0,n&&pf(),p(this,dr)!==null&&Ni(p(this,dr),()=>{ee(this,dr,null)}),te(this,_e,Rs).call(this,()=>{te(this,_e,Xo).call(this)})}};return{reset:i,invoke_onerror:()=>{var o,c;if(!te(this,_e,Gn).call(this))try{n=!0,(c=(o=p(this,Er)).onerror)==null||c.call(o,e,i),n=!1}catch(u){nn(u,p(this,Pt)&&p(this,Pt).parent)}}}},Gn=function(){return(p(this,Pt).f&(St|Wa))!==0},Xf=function(){const e=p(this,Er).pending;e&&(this.is_pending=!0,ee(this,$t,pr(()=>e(p(this,Ir)))),kn(()=>{if(!te(this,_e,Gn).call(this)){var r=ee(this,tn,document.createDocumentFragment()),n=Pn(),i=!1;if(r.append(n),ee(this,ur,te(this,_e,Rs).call(this,()=>{try{return pr(()=>p(this,Ci).call(this,n))}catch(s){try{this.error(s),i=!0}catch(o){nn(o,p(this,Pt).parent)}return null}})),p(this,ur)===null){ee(this,tn,null),i&&te(this,_e,Ua).call(this,z);return}p(this,Qn)===0&&(p(this,Ir).before(r),ee(this,tn,null),Ni(p(this,$t),()=>{ee(this,$t,null)}),te(this,_e,Ua).call(this,z))}}))},Xo=function(){try{if(this.is_pending=this.has_pending_snippet(),ee(this,Qn,0),ee(this,Ri,0),ee(this,ur,pr(()=>{p(this,Ci).call(this,p(this,Ir))})),p(this,Qn)>0){var e=ee(this,tn,document.createDocumentFragment());Il(p(this,ur),e);const r=p(this,Er).pending;ee(this,$t,pr(()=>r(p(this,Ir))))}else te(this,_e,Ua).call(this,z)}catch(r){this.error(r)}},Ua=function(e){this.is_pending=!1,e.transfer_effects(p(this,Qa),p(this,Za))},Rs=function(e){var r=ge,n=fe,i=xt;un(p(this,Pt)),kr(p(this,Pt)),da(p(this,Pt).ctx);try{return Mi.ensure(),e()}finally{un(r),kr(n),da(i)}},Qo=function(e,r){var n;if(!this.has_pending_snippet()){this.parent&&te(n=this.parent,_e,Qo).call(n,e,r);return}ee(this,Qn,p(this,Qn)+e),p(this,Qn)===0&&(te(this,_e,Ua).call(this,r),p(this,$t)&&Ni(p(this,$t),()=>{ee(this,$t,null)}),p(this,tn)&&(p(this,Ir).before(p(this,tn)),ee(this,tn,null)))},Zo=function(e){p(this,ur)&&(Xt(p(this,ur)),ee(this,ur,null)),p(this,$t)&&(Xt(p(this,$t)),ee(this,$t,null)),p(this,dr)&&(Xt(p(this,dr)),ee(this,dr,null));let r=p(this,Er).failed;const n=i=>{if(te(this,_e,Gn).call(this))return;const{reset:s,invoke_onerror:o}=te(this,_e,Yo).call(this,i);o(),r&&!te(this,_e,Gn).call(this)&&ee(this,dr,te(this,_e,Rs).call(this,()=>{try{return pr(()=>{var c=ge;c.b=this,c.f|=$o,r(p(this,Ir),()=>i,()=>s)})}catch(c){return nn(c,p(this,Pt).parent),null}}))};kn(()=>{if(!te(this,_e,Gn).call(this)){var i;try{i=this.transform_error(e)}catch(s){nn(s,p(this,Pt)&&p(this,Pt).parent);return}i!==null&&typeof i=="object"&&typeof i.then=="function"?i.then(n,s=>nn(s,p(this,Pt)&&p(this,Pt).parent)):n(i)}})};function y(t,e){var r=e==null?"":typeof e=="object"?`${e}`:e;r!==(t[Oa]??(t[Oa]=t.nodeValue))&&(t[Oa]=r,t.nodeValue=`${r}`)}function Qf(t,e){return Zf(t,e)}const Is=new Map;function Zf(t,{target:e,anchor:r,props:n={},events:i,context:s,intro:o=!0,transformError:c}){Pf();var u=void 0,f=Lf(()=>{var v=r??e.appendChild(Pn());Gf(v,{pending:()=>{}},b=>{ul({});var I=xt;s&&(I.c=s),i&&(n.$$events=i),u=t(b,n)||fl(),dl()},c);var g=new Set,w=b=>{for(var I=0;I<b.length;I++){var R=b[I];if(!g.has(R)){g.add(R);var S=Hf(R);for(const M of[e,document]){var x=Is.get(M);x===void 0&&(x=new Map,Is.set(M,x));var q=x.get(R);q===void 0?(M.addEventListener(R,Jo,{passive:S}),x.set(R,1)):x.set(R,q+1)}}}};return w(eo(Su)),Ko.add(w),()=>{var S;for(var b of g)for(const x of[e,document]){var I=Is.get(x),R=I.get(b);--R==0?(x.removeEventListener(b,Jo),I.delete(b),I.size===0&&Is.delete(x)):I.set(b,R)}Ko.delete(w),v!==r&&((S=v.parentNode)==null||S.removeChild(v))}});return eh.set(u,f),u}let eh=new WeakMap;var $r,rn,fr,Pi,es,ts,Qs;class Tu{constructor(e,r=!0){sr(this,"anchor");ae(this,$r,new Map);ae(this,rn,new Map);ae(this,fr,new Map);ae(this,Pi,new Set);ae(this,es,!0);ae(this,ts,e=>{if(p(this,$r).has(e)){var r=p(this,$r).get(e),n=p(this,rn).get(r);if(n)Bs(n),p(this,Pi).delete(r);else{var i=p(this,fr).get(r);i&&(Bs(i.effect),p(this,rn).set(r,i.effect),p(this,fr).delete(r),i.fragment.lastChild.remove(),this.anchor.before(i.fragment),n=i.effect)}for(const[s,o]of p(this,$r)){if(p(this,$r).delete(s),s===e)break;const c=p(this,fr).get(o);c&&(Xt(c.effect),p(this,fr).delete(o))}for(const[s,o]of p(this,rn)){if(s===r||p(this,Pi).has(s))continue;const c=()=>{if(Array.from(p(this,$r).values()).includes(s)){var f=document.createDocumentFragment();Il(o,f),f.append(Pn()),p(this,fr).set(s,{effect:o,fragment:f})}else Xt(o);p(this,Pi).delete(s),p(this,rn).delete(s)};p(this,es)||!n?(p(this,Pi).add(s),Ni(o,c,!1)):c()}}});ae(this,Qs,e=>{p(this,$r).delete(e);const r=Array.from(p(this,$r).values());for(const[n,i]of p(this,fr))r.includes(n)||(Xt(i.effect),p(this,fr).delete(n))});this.anchor=e,ee(this,es,r)}ensure(e,r){var n=z,i=ou();if(r&&!p(this,rn).has(e)&&!p(this,fr).has(e))if(i){var s=document.createDocumentFragment(),o=Pn();s.append(o),p(this,fr).set(e,{effect:pr(()=>r(o)),fragment:s})}else p(this,rn).set(e,pr(()=>r(this.anchor)));if(p(this,$r).set(n,e),i){for(const[c,u]of p(this,rn))c===e?n.unskip_effect(u):n.skip_effect(u);for(const[c,u]of p(this,fr))c===e?n.unskip_effect(u.effect):n.skip_effect(u.effect);n.oncommit(p(this,ts)),n.ondiscard(p(this,Qs))}else p(this,ts).call(this,n)}}$r=new WeakMap,rn=new WeakMap,fr=new WeakMap,Pi=new WeakMap,es=new WeakMap,ts=new WeakMap,Qs=new WeakMap;function ce(t,e,r=!1){var n=new Tu(t),i=r?ua:0;function s(o,c){n.ensure(o,c)}is(()=>{var o=!1;e((c,u=0)=>{o=!0,s(u,c)}),o||s(-1,null)},i)}const th=Symbol("NaN");function rh(t,e,r){var n=new Tu(t);is(()=>{var i=e();i!==i&&(i=th),n.ensure(i,r)})}function Xi(t,e){return e}function nh(t,e,r){for(var n=[],i=e.length,s,o=e.length,c=0;c<i;c++){let g=e[c];Ni(g,()=>{if(s){if(s.pending.delete(g),s.done.add(g),s.pending.size===0){var w=t.outrogroups;el(t,eo(s.done)),w.delete(s),w.size===0&&(t.outrogroups=null)}}else o-=1},!1)}if(o===0){var u=n.length===0&&r!==null&&t.pending.size===0;if(u){var f=r,v=f.parentNode;xf(v),v.append(f),t.items.clear()}el(t,e,!u)}else s={pending:new Set(e),done:new Set},(t.outrogroups??(t.outrogroups=new Set)).add(s)}function el(t,e,r=!0){var n;if(t.pending.size>0){n=new Set;for(const o of t.pending.values())for(const c of o)n.add(t.items.get(c).e)}for(var i=0;i<e.length;i++){var s=e[i];if(n!=null&&n.has(s)){s.f|=sn;const o=document.createDocumentFragment();Il(s,o)}else Xt(e[i],r)}}var ql;function Ne(t,e,r,n,i,s=null){var o=t,c=new Map,u=(e&Mc)!==0;if(u){var f=t;o=f.appendChild(Pn())}var v=null,g=qc(()=>{var q=r();return Zs(q)?q:q==null?[]:eo(q)}),w=new Map,b=!0;function I(q){if((x.effect.f&St)===0){x.pending.delete(q);var M=a(g);x.fallback=v,ih(x,M,o,e,n),v!==null&&(M.length===0?(v.f&sn)===0?Bs(v):(v.f^=sn,Fa(v,null,o)):Ni(v,()=>{v=null}))}}function R(q){x.pending.delete(q)}var S=is(()=>{for(var q=a(g),M=q.length,N=new Set,V=z,Y=ou(),D=0;D<M;D+=1){var ne=q[D],B=n(ne,D),U=b?null:c.get(B);U?(U.v&&fa(U.v,ne),U.i&&fa(U.i,D),Y&&V.unskip_effect(U.e)):(U=ah(c,b?o:ql??(ql=Pn()),ne,B,D,i,e,r),b||(U.e.f|=sn),c.set(B,U)),N.add(B)}if(M===0&&s&&!v&&(b?v=pr(()=>s(o)):(v=pr(()=>s(ql??(ql=Pn()))),v.f|=sn)),M>N.size&&af(),!b)if(w.set(V,N),Y){for(const[he,de]of c)N.has(he)||V.skip_effect(de.e);V.oncommit(I),V.ondiscard(R)}else I(V);a(g)}),x={effect:S,items:c,pending:w,outrogroups:null,fallback:v};b=!1}function Na(t){for(;t!==null&&(t.f&jr)===0;)t=t.next;return t}function ih(t,e,r,n,i){var U,he,de,Ot,ot,lt,ct,Ae,Ce;var s=(n&Vd)!==0,o=e.length,c=t.items,u=Na(t.effect.first),f,v=null,g,w=[],b=[],I,R,S,x;if(s)for(x=0;x<o;x+=1)I=e[x],R=i(I,x),S=c.get(R).e,(S.f&sn)===0&&((he=(U=S.nodes)==null?void 0:U.a)==null||he.measure(),(g??(g=new Set)).add(S));for(x=0;x<o;x+=1){if(I=e[x],R=i(I,x),S=c.get(R).e,t.outrogroups!==null)for(const Ze of t.outrogroups)Ze.pending.delete(S),Ze.done.delete(S);if((S.f&Ht)!==0&&(Bs(S),s&&((Ot=(de=S.nodes)==null?void 0:de.a)==null||Ot.unfix(),(g??(g=new Set)).delete(S))),(S.f&sn)!==0)if(S.f^=sn,S===u)Fa(S,null,r);else{var q=v?v.next:u;S===t.effect.last&&(t.effect.last=S.prev),S.prev&&(S.prev.next=S.next),S.next&&(S.next.prev=S.prev),jn(t,v,S),jn(t,S,q),Fa(S,q,r),v=S,w=[],b=[],u=Na(v.next);continue}if(S!==u){if(f!==void 0&&f.has(S)){if(w.length<b.length){var M=b[0],N;v=M.prev;var V=w[0],Y=w[w.length-1];for(N=0;N<w.length;N+=1)Fa(w[N],M,r);for(N=0;N<b.length;N+=1)f.delete(b[N]);jn(t,V.prev,Y.next),jn(t,v,V),jn(t,Y,M),u=M,v=Y,x-=1,w=[],b=[]}else f.delete(S),Fa(S,u,r),jn(t,S.prev,S.next),jn(t,S,v===null?t.effect.first:v.next),jn(t,v,S),v=S;continue}for(w=[],b=[];u!==null&&u!==S;)(f??(f=new Set)).add(u),b.push(u),u=Na(u.next);if(u===null)continue}(S.f&sn)===0&&w.push(S),v=S,u=Na(S.next)}if(t.outrogroups!==null){for(const Ze of t.outrogroups)Ze.pending.size===0&&(el(t,eo(Ze.done)),(ot=t.outrogroups)==null||ot.delete(Ze));t.outrogroups.size===0&&(t.outrogroups=null)}if(u!==null||f!==void 0){var D=[];if(f!==void 0)for(S of f)(S.f&Ht)===0&&D.push(S);for(;u!==null;)(u.f&Ht)===0&&u!==t.fallback&&D.push(u),u=Na(u.next);var ne=D.length;if(ne>0){var B=(n&Mc)!==0&&o===0?r:null;if(s){for(x=0;x<ne;x+=1)(ct=(lt=D[x].nodes)==null?void 0:lt.a)==null||ct.measure();for(x=0;x<ne;x+=1)(Ce=(Ae=D[x].nodes)==null?void 0:Ae.a)==null||Ce.fix()}nh(t,D,B)}}s&&kn(()=>{var Ze,kt;if(g!==void 0)for(S of g)(kt=(Ze=S.nodes)==null?void 0:Ze.a)==null||kt.apply()})}function ah(t,e,r,n,i,s,o,c){var u=(o&Bd)!==0?(o&zd)===0?Cf(r,!1,!1):Ui(r):null,f=(o&Hd)!==0?Ui(i):null;return{v:u,i:f,e:pr(()=>(s(e,u??r,f??i,c),()=>{t.delete(n)}))}}function Fa(t,e,r){if(t.nodes)for(var n=t.nodes.start,i=t.nodes.end,s=e&&(e.f&sn)===0?e.nodes.start:r;n!==null;){var o=ns(n);if(s.before(n),n===i)return;n=o}}function jn(t,e,r){e===null?t.effect.first=r:e.next=r,r===null?t.effect.last=e:r.prev=e}function Gl(t,e,r=!1,n=!1,i=!1,s=!1){var o=t,c="";if(r)var u=t;$(()=>{var f=ge;if(c!==(c=e()??"")){if(r&&!$c){f.nodes=null,u.innerHTML=c,c!==""&&Ga(Tn(u),u.lastChild);return}if(f.nodes!==null&&(fu(f.nodes.start,f.nodes.end),f.nodes=null),c!==""){var v=n?Yd:i?Xd:void 0,g=lu(n?"svg":i?"math":"template",v);g.innerHTML=c;var w=n||i?g:g.content;if(Ga(Tn(w),w.lastChild),n||i)for(;Tn(w);)o.before(Tn(w));else o.before(w)}}})}function sh(t,e){var r;r=document.head.appendChild(Pn());try{is(()=>{var n=pr(()=>e(r));n.f|=Dc,$c||(n.nodes===null?n.nodes={start:r,end:r,a:null,t:null}:n.nodes.end=r)})}finally{}}const Kl=[...` 	
\r\f \v\uFEFF`];function oh(t,e,r){var n=t==null?"":""+t;if(r){for(var i of Object.keys(r))if(r[i])n=n?n+" "+i:i;else if(n.length)for(var s=i.length,o=0;(o=n.indexOf(i,o))>=0;){var c=o+s;(o===0||Kl.includes(n[o-1]))&&(c===n.length||Kl.includes(n[c]))?n=(o===0?"":n.substring(0,o))+n.substring(c+1):o=c}}return n===""?null:n}function Jl(t,e=!1){var r=e?" !important;":";",n="";for(var i of Object.keys(t)){var s=t[i];s!=null&&s!==""&&(n+=" "+i+": "+s+r)}return n}function lh(t,e){if(e){var r="",n,i;return Array.isArray(e)?(n=e[0],i=e[1]):n=e,n&&(r+=Jl(n)),i&&(r+=Jl(i,!0)),r=r.trim(),r===""?null:r}return String(t)}function lr(t,e,r,n,i,s){var o=t[Bo];if(o!==r||o===void 0){var c=oh(r,n,s);c==null?t.removeAttribute("class"):t.className=c,t[Bo]=r}else if(s&&i!==s)for(var u in s){var f=!!s[u];(i==null||f!==!!i[u])&&t.classList.toggle(u,f)}return s}function ko(t,e={},r,n){for(var i in r){var s=r[i];e[i]!==s&&(r[i]==null?t.style.removeProperty(i):t.style.setProperty(i,s,n))}}function Yl(t,e,r,n){var i=t[Ho];if(i!==e){var s=lh(e,n);s==null?t.removeAttribute("style"):t.style.cssText=s,t[Ho]=e}else n&&(Array.isArray(n)?(ko(t,r==null?void 0:r[0],n[0]),ko(t,r==null?void 0:r[1],n[1],"important")):ko(t,r,n));return n}function ch(t,e){e?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function uh(t,e){var r=t.__defaultValue,n=t.multiple,i=n?r??[]:null;if(!(n&&!Zs(i))){t.selectedIndex;for(var s of t.options){var o=Qi(s);ch(s,n?i.includes(o):ru(o,r))}}}function Hs(t,e,r=!1){if(t.multiple){if(e==null)return;if(!Zs(e))return Zd();for(var n of t.options)n.selected=e.includes(Qi(n));return}for(n of t.options){var i=Qi(n);if(ru(i,e)){n.selected=!0;return}}(!r||e!==void 0)&&(t.selectedIndex=-1)}function or(t){var e=new MutationObserver(r=>{r.every(dh)||("__defaultValue"in t&&uh(t),"__value"in t&&Hs(t,t.__value))});e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),bl(()=>{e.disconnect()})}function Mr(t,e,r=e){var n=new WeakSet,i=!0;pl(t,"change",s=>{var o=s?"[selected]":":checked",c;if(t.multiple)c=[].map.call(t.querySelectorAll(o),Qi);else{var u=t.querySelector(o)??t.querySelector("option:not([disabled])");c=u&&Qi(u)}r(c),t.__value=c,z!==null&&n.add(z)}),wl(()=>{var s=e();if(t===document.activeElement){var o=z;if(n.has(o))return}if(Hs(t,s,i),i&&s===void 0){var c=t.querySelector(":checked");c!==null&&(s=Qi(c),r(s))}t.__value=s,i=!1})}function Qi(t){return"__value"in t?t.__value:t.value}function dh(t){if(t.target.closest("selectedcontent")!==null)return!0;if(t.type==="childList"){var e=[...t.addedNodes,...t.removedNodes];return e.length>0&&e.every(r=>r.nodeName==="SELECTEDCONTENT")}return!1}const fh=Symbol("is custom element"),hh=Symbol("is html"),ph=$d?"progress":"PROGRESS";function Jt(t,e){var r=Au(t);r.value===(r.value=e??void 0)||t.value===e&&(e!==0||t.nodeName!==ph)||(t.value=e??"")}function It(t,e,r,n){var i=Au(t);i[e]!==(i[e]=r)&&(e==="loading"&&(t[Fd]=r),r==null?t.removeAttribute(e):typeof r!="string"&&vh(t).has(e)?t[e]=r:t.setAttribute(e,r))}function Au(t){return t[Ts]??(t[Ts]={[fh]:t.nodeName.includes("-"),[hh]:t.namespaceURI===Fc})}var Xl=new Map;function vh(t){var e=t.getAttribute("is")||t.nodeName,r=Xl.get(e);if(r)return r;Xl.set(e,r=new Set);for(var n,i=t,s=Element.prototype;s!==i;){n=Pd(i);for(var o in n)n[o].set&&o!=="innerHTML"&&o!=="textContent"&&o!=="innerText"&&r.add(o);i=xc(i)}return r}function ze(t,e,r=e){var n=new WeakSet;pl(t,"input",async i=>{var s=i?t.defaultValue:t.value;if(s=To(t)?Ao(s):s,r(s),z!==null&&n.add(z),await yu(),s!==(s=e())){var o=t.selectionStart,c=t.selectionEnd,u=t.value.length;if(t.value=s??"",c!==null){var f=t.value.length;o===c&&c===u&&f>u?(t.selectionStart=f,t.selectionEnd=f):(t.selectionStart=o,t.selectionEnd=Math.min(c,f))}}}),wa(e)==null&&t.value&&(r(To(t)?Ao(t.value):t.value),z!==null&&n.add(z)),ro(()=>{var i=e();if(t===document.activeElement){var s=z;if(n.has(s))return}To(t)&&i===Ao(t.value)||t.type==="date"&&!i&&!t.value||i!==t.value&&(t.value=i??"")})}function Vs(t,e,r=e){pl(t,"change",n=>{var i=n?t.defaultChecked:t.checked;r(i)}),wa(e)==null&&r(t.checked),ro(()=>{var n=e();t.checked=!!n})}function To(t){var e=t.type;return e==="number"||e==="range"}function Ao(t){return t===""?null:+t}function Co(t,e){return t===e||(t==null?void 0:t[xi])===e}function _h(t=fl(),e,r,n){var i=xt.r,s=ge;return wl(()=>{var o,c;return ro(()=>{o=c,c=[],wa(()=>{Co(r(...c),t)||(e(t,...c),o&&Co(r(...o),t)&&e(null,...o))})}),()=>{let u=s;for(;u!==i&&u.parent!==null&&u.parent.f&Wa;)u=u.parent;const f=()=>{c&&Co(r(...c),t)&&e(null,...c)},v=u.teardown;u.teardown=()=>{f(),v==null||v()}}}),t}let Es=!1;function gh(t){var e=Es;try{return Es=!1,[t(),Es]}finally{Es=e}}function Ro(t,e,r,n){var N;var i=!0,s=(r&qd)!==0,o=(r&Gd)!==0,c=n,u=!0,f=void 0,v=()=>o&&i?(f??(f=ja(n)),a(f)):(u&&(u=!1,c=o?wa(n):n),c);let g;if(s){var w=xi in t||Ud in t;g=((N=Ji(t,e))==null?void 0:N.set)??(w&&e in t?V=>t[e]=V:void 0)}var b,I=!1;s?[b,I]=gh(()=>t[e]):b=t[e],b===void 0&&n!==void 0&&(b=v(),g&&(uf(),g(b)));var R;if(R=()=>{var V=t[e];return V===void 0?v():(u=!0,V)},(r&jd)===0)return R;if(g){var S=t.$$legacy;return(function(V,Y){return arguments.length>0?((!Y||S||I)&&g(Y?R():V),V):R()})}var x=!1,q=((r&Wd)!==0?ja:qc)(()=>(x=!1,R()));s&&a(q);var M=ge;return(function(V,Y){if(arguments.length>0){const D=Y?a(q):s?vr(V):V;return d(q,D),x=!0,c!==void 0&&(c=D),V}return xn&&x||(M.f&St)!==0?q.v:a(q)})}function Cu(t){xt===null&&rf(),cu(()=>{const e=wa(t);if(typeof e=="function")return e})}const mh="5";var Cc;typeof window<"u"&&((Cc=window.__svelte??(window.__svelte={})).v??(Cc.v=new Set)).add(mh);const Ql=Object.freeze({infographic:[1080,1350],carousel:[1080,1350],story:[1080,1920],reel:[1080,1920]});function Ps(t=""){return String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[e])}function Ss(t,e){return/^#[0-9a-f]{6}$/i.test(t||"")?t:e}function bh(t,e,r){const n=String(t??"").slice(0,12e3).split(/\s+/).filter(Boolean),i=[];let s="";for(const o of n){const c=o.match(new RegExp(`.{1,${e}}`,"gu"))||[];for(const u of c)s&&[...`${s} ${u}`].length>e&&(i.push(s),s=""),s=s?`${s} ${u}`:u}if(s&&i.push(s),i.length>r)throw new Error(`Content exceeds artwork capacity (${r} lines). Shorten the text before exporting.`);return i}function Po(t,e,r,n,i,s,o,c=400,u="DejaVu Sans"){const f=bh(t,Math.max(8,Math.floor(i/(n*.63))),s);return{height:Math.max(1,f.length)*n*1.3,svg:`<text data-preflight-text="true" x="${e}" y="${r}" fill="${o}" font-family="${u}, Noto Sans Devanagari, sans-serif" font-size="${n}" font-weight="${c}">${f.map((v,g)=>`<tspan x="${e}" dy="${g?n*1.3:0}">${Ps(v)}</tspan>`).join("")}</text>`}}function wh({brandProfile:t={},campaign:e,format:r="infographic",slideIndex:n=0}){var he,de,Ot,ot,lt,ct,Ae,Ce,Ze,kt,Qt;if(!e||!Ql[r])throw new Error("A campaign and supported format are required");const[i,s]=Ql[r],o=t.colors||[],c=Ss((he=o[0])==null?void 0:he.hex,"#141513"),u=Ss((de=o[2])==null?void 0:de.hex,"#C5D86D"),f=Ss((Ot=o[3])==null?void 0:Ot.hex,"#F4F1EA"),v=Ss((ot=o[1])==null?void 0:ot.hex,"#A8C5A0"),g=s===1920,w=r==="reel"?740:900,b=g?400:140;let I,R,S;if(r==="infographic"){const le=e.infographic;if(!le||!Array.isArray(le.statRows))throw new Error("Infographic content missing");I=le.headline,R=le.statRows,S=le.bottomTakeaway}else if(r==="carousel"){const le=(ct=(lt=e.carousel)==null?void 0:lt.slides)==null?void 0:ct[n];if(!le)throw new Error("Carousel slide missing");I=le.title,R=[le.bodyMetric],S=le.visualNote}else if(r==="story"){const le=e.story;if(!le)throw new Error("Story content missing");I=le.hookBanner,R=[le.keyStatHighlight],S=le.interactiveStickerPrompt}else{const le=(Ce=(Ae=e.reel)==null?void 0:Ae.beats)==null?void 0:Ce[n];if(!le)throw new Error("Reel beat missing");I=le.onScreenText||e.reel.spokenHook0to3s,R=[le.voiceover],S=e.reel.closingCta}const x=(le,Tr)=>["Mona Sans","Inter","Instrument Serif","DejaVu Sans"].find(Ln=>String(le||"").split("/")[0].trim()===Ln)||Tr,q=x((Ze=t.fonts)==null?void 0:Ze.heading,"DejaVu Sans"),M=x((kt=t.fonts)==null?void 0:kt.body,"DejaVu Sans"),N=[];let V=b;const Y=Po(I,80,V,52,w,5,f,700,q);N.push(Y.svg),V+=Y.height+72;for(const le of R){const Tr=Po(le,106,V,34,w-60,5,f,400,M);N.push(`<path d="M80 ${V-30}v${Tr.height+10}" stroke="${u}" stroke-width="6"/>`,Tr.svg),V+=Tr.height+50}const D=Po(S,80,V+10,29,w,4,v,400,M),ne=g?s*.82-35:s-80;if(V+D.height>ne)throw new Error("Content exceeds the safe artwork area. Shorten the copy before exporting.");N.push(D.svg);const B=Ps([t.logoText,t.brandName||"Campaign Studio"].filter(Boolean).join(" · ")),U=((Qt=e.provenance)==null?void 0:Qt.mode)==="synthetic"?"SYNTHETIC DRAFT · REVIEW REQUIRED":"EDITORIAL DRAFT";return`<svg xmlns="http://www.w3.org/2000/svg" width="${i}" height="${s}" viewBox="0 0 ${i} ${s}" role="img" aria-label="${Ps(I)}"><title>${Ps(I)}</title><rect width="${i}" height="${s}" fill="${c}"/><g font-family="DejaVu Sans, Noto Sans Devanagari, sans-serif"><text data-preflight-text="true" x="80" y="${g?305:65}" fill="${v}" font-size="26" font-weight="700">${B}</text><path d="M80 ${b-55}h920" stroke="${u}" stroke-width="3"/>${N.join("")}<text data-preflight-text="true" x="80" y="${g?Math.floor(s*.8):s-35}" fill="${v}" font-size="19">${U}${r==="carousel"?` · ${n+1}/4`:""}</text></g></svg>`}const yh=new Set(["infographic","carousel","story","reel"]);function xo(t){if(typeof t!="string"||!/^#[0-9a-f]{6}$/i.test(t))return null;const[e,r,n]=t.slice(1).match(/.{2}/g).map(i=>{const s=parseInt(i,16)/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4});return .2126*e+.7152*r+.0722*n}function Ih({format:t,canvas:e,textBoxes:r=[],obstructionBoxes:n=[],foreground:i,background:s,caption:o="",captionLimit:c=125}){if(!yh.has(t)||!e||!Number.isFinite(e.width)||!Number.isFinite(e.height)||e.width<=0||e.height<=0||e.width>1e4||e.height>1e4)throw new Error("Invalid preflight canvas or format");if(!Array.isArray(r)||r.length>2e3||r.some(B=>!B||["x","y","width","height"].some(U=>!Number.isFinite(B[U]))||B.width<0||B.height<0))throw new Error("Invalid preflight text rectangles");if(!Array.isArray(n)||n.length>40||n.some(B=>!B||["x","y","width","height"].some(U=>!Number.isFinite(B[U]))||B.width<0||B.height<0))throw new Error("Invalid preflight obstruction rectangles");if(typeof o!="string"||o.length>2e4||!Number.isInteger(c)||c<40||c>500)throw new Error("Invalid preflight caption settings");const{width:u,height:f}=e,v=t==="story"||t==="reel",g=v?[{x:0,y:0,width:u,height:f*.14},{x:0,y:f*.82,width:u,height:f*.18},...t==="reel"?[{x:u*.82,y:0,width:u*.18,height:f}]:[]]:[],w=r.filter(B=>[...g,...n].some(U=>B.x<U.x+U.width&&B.x+B.width>U.x&&B.y<U.y+U.height&&B.y+B.height>U.y)).length,b=r.filter(B=>B.x<-1||B.y<-1||B.x+B.width>u+1||B.y+B.height>f+1).length,I=xo(s),R=r.map(B=>xo(B.foreground||i)).filter(B=>B!==null).map(B=>I===null?null:(Math.max(B,I)+.05)/(Math.min(B,I)+.05)).filter(B=>B!==null),S=r.filter(B=>xo(B.foreground||i)===null||I===null).length,x=R.length?Math.round(Math.min(...R)*100)/100:null,q=Math.min(c,o.length),M=/\$\d|\d%/.test(o.slice(0,c)),N=r.length>0,V=v?9/16:4/5,Y=u/f,D=Math.abs(Y-V)/V;return{simulation:!0,measurementMethod:"client-svg-text-rectangles",requiresReview:!0,metrics:{obstructionElementsCount:n.length,unmeasuredColorCount:S,expectedAspectRatio:v?"9:16":"4:5",actualAspectRatio:Math.round(Y*1e4)/1e4,aspectRatioDeviation:D,artworkWidth:u,artworkHeight:f,textElementsCount:r.length,occludedElementsCount:w,overflowElementsCount:b,contrastRatio:x,captionCharacters:o.length,firstLookCharacters:q,firstLookContainsHardNumber:M,safeZoneRegions:{top:v?.14:0,bottom:v?.18:0,right:t==="reel"?.18:0}},checks:[{id:"aspect-ratio",status:D<=.01?"pass":"warning",measured:Y,limit:V,message:"Rendered artwork ratio compared with the intended 4:5 or 9:16 export; 1% layout tolerance."},{id:"safe-zones",status:N?w?"warning":"pass":"unmeasured",measured:N?w:null,limit:0,message:"Text rectangles intersecting measured native chrome/stickers or approximate chrome zones; actual Instagram layout can vary."},{id:"artwork-overflow",status:N?b?"warning":"pass":"unmeasured",measured:N?b:null,limit:0,message:"Text rectangles outside the rendered artwork."},{id:"contrast",status:x===null||S>0?"unmeasured":x>=4.5?"pass":"warning",measured:x,limit:4.5,message:"Minimum text fill contrast against the supplied base background, without image/gradient analysis."},{id:"caption-fold",status:o.length>c?"warning":"pass",measured:o.length,limit:c,message:"Configurable approximate caption fold; not an official platform guarantee."}]}}var Eh=A('<div class="statusbar"><span>9:41</span><span class="island"></span><span>▴ ▰ ▮</span></div>'),Sh=A("<!><span> </span>",1),kh=A('<span class="empty-cell">No scheduled or exported post</span>'),Th=A("<div><!></div>"),Ah=A('<div class="profile-header"><b> </b><button aria-label="Profile options">☰</button></div> <div class="profile-summary"><span class="avatar large"> </span><span><b> </b> preview posts</span><span>Private<br/>preview</span></div> <div class="profile-bio"><b> </b> <p> </p> <small>Local preview · active first, weekly schedule Monday–Sunday, then newest exports. Not a live Instagram feed.</small></div> <div class="profile-grid"></div>',1),Ch=A('<header class="ig-header"><span class="avatar"> </span> <div><b> </b><small>Editorial draft</small></div> <button aria-label="Post options">•••</button></header>'),Rh=A('<span class="slide-count"> </span><button class="previous" aria-label="Previous slide">‹</button><button class="next" aria-label="Next slide">›</button>',1),Ph=A("<span><i></i></span>"),xh=A('<div class="story-chrome"><div class="timer-bars"></div> <div class="story-header"><span class="avatar"> </span><b> </b><span>Draft</span><button> </button><button aria-label="Close story preview">×</button></div></div> <div class="poll-sticker"><b> </b> <div><button> </button><button> </button></div> <small> </small></div> <div class="story-reply"><input aria-label="Story reply preview" placeholder="Send message…"/><button aria-label="Like story"> </button><button aria-label="Share story preview">➤</button></div>',1),Nh=A('<div class="reel-top"><b>Reels</b><span>Storyboard simulation</span></div> <div class="reel-rail"><button aria-label="Like reel"> <small> </small></button><button aria-label="Comment on reel">♧<small> </small></button><button aria-label="Share reel preview">➤</button><button aria-label="Reel options">•••</button><span>♫</span></div> <div class="reel-meta"><b> </b><button> </button> <p> </p> <div class="audio">♫ Original audio · storyboard, no audio playback</div></div>',1),Oh=A('<div class="danger right">18%</div>'),Dh=A('<div class="safe-mask" aria-label="Simulated safe-zone overlay"><div class="danger top">Top 14% · chrome risk</div> <div class="danger bottom">Bottom 18% · caption / reply risk</div> <!> <div class="clear-zone">Inspect text clearance</div></div>'),Lh=A('<span class="floating-heart">♥</span>'),Mh=A('<div class="reel-controls"><button> </button><input aria-label="Reel scrubber" type="range" min="0" max="30" step=".25"/><output data-testid="active-beat"> </output></div>'),Uh=A("<button>●</button>"),Fh=A('<div class="dots"></div>'),$h=A("<button> </button>"),Bh=A('<div class="engagement"><button aria-label="Like post"> </button><button aria-label="Comment on post">♧</button><button aria-label="Share post preview">➤</button><!><button class="bookmark" aria-label="Save post locally"> </button></div> <p class="local-count"> </p> <div class="caption"><b> </b> <!><small>LOCAL DRAFT · NO INSTAGRAM CONNECTION</small></div>',1),Hh=A(`<div class="fold-ruler"><label>Approximate fold <input aria-label="Caption fold threshold" type="number" min="40" max="500"/> characters</label> <p><mark> </mark><span class="fold-line">│</span> </p> <small>Configurable simulation. Actual truncation varies by app, device
              and layout.</small></div>`),Vh=A('<!> <div role="group" aria-label="Artwork preview"><div class="artwork"></div> <!> <!> <!> <!> <!></div> <!> <!> <!>',1),zh=A("<p> </p>"),Wh=A('<div class="comment-panel"><b>Local comments</b><!> <form><input aria-label="Local comment" placeholder="Write a preview comment"/><button>Add</button></form></div>'),jh=A('<p class="local-notice" role="status"> </p>'),qh=A(`<div class="measurements"><span><b> </b> text boxes in chrome zones</span><span><b> </b> text boxes outside artwork</span><span><b> </b> </span><span><b> </b> </span><span><b> </b> caption characters before simulated
          fold</span></div> <p class="small muted">Measured SVG text boxes and fill contrast against the base background;
        images, glyph shapes and all native app variations are not covered.
        Review required. No confidence score is inferred.</p>`,1),Gh=A('<p class="small muted">Open a design or Instagram surface to measure the rendered SVG.</p>'),Kh=A(`<section class="emulator" aria-label="Instagram preview simulator"><div class="preview-heading"><div><span class="eyebrow">PREVIEW LAB</span> <h3>See it in context.</h3></div> <span class="simulation">Local simulation</span></div> <div class="segmented" aria-label="Preview mode"><button>Design Mode</button> <button>In-Situ Instagram</button> <button>3×3 Profile Grid</button></div> <div class="preview-controls"><label>Phone width <select><option>375 px</option><option>390 px · generic</option><option>402 px · iPhone 16 Pro</option><option>430 px</option></select></label> <label>Zoom <input aria-label="Preview zoom" type="range" min="55" max="125" step="5"/><output> </output></label> <label><input type="checkbox"/>Safe zones</label> <label><input type="checkbox"/>Caption ruler</label></div> <p class="muted small">Approximate Instagram chrome. Local interactions only. Validate final assets
    in Instagram before publishing.</p> <div class="phone-well"><div aria-label="Simulated phone viewport"><!> <!> <!> <!></div></div> <div class="evidence"><div class="evidence-title"><b>Measured preflight</b><button>Measure again</button></div> <!></div></section>`);function Jh(t,e){ul(e,!0);let r=Ro(e,"format",3,"infographic"),n=Ro(e,"backlog",19,()=>[]),i=Ro(e,"onpreflight",3,()=>{}),s=O("instagram"),o=O(85),c=O(402),u=O(!1),f=O(!0),v=O(125),g=O(0),w=O(!1),b=O(!1),I=O(!1),R=O(""),S=O(vr([])),x=O(!1),q=O(""),M=O(null),N=O(0),V=O(0),Y=O(!1),D=O(0),ne=O(!1),B=O(!1),U=0,he=O(void 0),de=O(null);function Ot(T){try{return wh(T)}catch{return'<div class="artwork-error">Artwork exceeds its layout. Shorten the copy and save before export.</div>'}}let ot=Bt(()=>{var T,K;return(((T=e.brandProfile)==null?void 0:T.handle)||((K=e.brandProfile)==null?void 0:K.brandName)||"studio").replace(/[^a-zA-Z0-9_.]/g,"").toLowerCase()}),lt=Bt(()=>{var T,K,$e,tt;return((K=(T=e.campaign)==null?void 0:T.infographic)==null?void 0:K.caption)||((tt=($e=e.campaign)==null?void 0:$e.story)==null?void 0:tt.hookBanner)||""}),ct=Bt(()=>{var K,$e,tt;const T=(($e=(K=e.campaign)==null?void 0:K.reel)==null?void 0:$e.beats)||[];for(let gt=T.length-1;gt>=0;gt--){const We=(tt=T[gt].timecode)==null?void 0:tt.match(/^(\d+):(\d+)/);if(We&&a(D)>=Number(We[1])*60+Number(We[2]))return gt}return 0}),Ae=Bt(()=>Ot({campaign:e.campaign,brandProfile:e.brandProfile,format:r(),slideIndex:r()==="reel"?a(ct):a(g)})),Ce=Bt(()=>{var T,K;return((K=(T=e.campaign)==null?void 0:T.carousel)==null?void 0:K.slides)||[]});const Ze=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];let kt=Bt(()=>[{id:"active",campaignDraft:e.campaign,title:"Active campaign",gridLabel:"Active"},...n().filter(T=>T.id!==e.activeStoryId&&T.campaignDraft&&["Scheduled","Exported"].includes(T.status)).sort((T,K)=>T.status!==K.status?T.status==="Scheduled"?-1:1:T.status==="Scheduled"?Ze.indexOf(T.scheduledDay)-Ze.indexOf(K.scheduledDay):(Date.parse(K.exportedAt)||0)-(Date.parse(T.exportedAt)||0)).slice(0,8).map(T=>({...T,gridLabel:T.status==="Scheduled"?`Scheduled · ${T.scheduledDay}`:`Exported${T.exportedAt?` · ${new Date(T.exportedAt).toLocaleString()}`:" · time unavailable"}`}))]);cu(()=>{JSON.stringify(e.campaign),r(),a(s),a(c),a(o),a(g),a(v),a(ct),a(N),a(M),a(I),a(w),a(b),a(B),a(S).length;const T=setTimeout(()=>{fn()},160);return()=>clearTimeout(T)}),Cu(()=>{window.innerWidth<700&&d(o,75);const T=setInterval(()=>{a(ne)&&(d(D,Math.min(30,a(D)+.25),!0),a(D)>=30&&d(ne,!1)),a(Y)&&(d(V,a(V)+.25),a(V)>=5&&(d(V,0),d(N,(a(N)+1)%4)))},250);return document.fonts.addEventListener("loadingdone",fn),()=>{clearInterval(T),document.fonts.removeEventListener("loadingdone",fn)}});function Qt(T){d(s,T,!0),d(ne,!1),d(Y,!1)}function le(T){r()==="carousel"&&d(g,Math.max(0,Math.min(a(Ce).length-1,a(g)+T)),!0),r()==="story"&&(d(N,(a(N)+T+4)%4),d(V,0))}function Tr(T){var K;["INPUT","TEXTAREA","SELECT"].includes((K=T.target)==null?void 0:K.tagName)||(T.key==="ArrowRight"&&le(1),T.key==="ArrowLeft"&&le(-1))}function Ln(T){if(/^#[0-9a-f]{6}$/i.test(T))return T;const K=T.match(/[\d.]+/g);return(K==null?void 0:K.length)>=3?"#"+K.slice(0,3).map($e=>Math.round(Number($e)).toString(16).padStart(2,"0")).join(""):null}async function fn(){var Zt;if(await yu(),await document.fonts.ready,!a(he)||a(s)==="grid"){d(de,null);return}const T=a(he).getBoundingClientRect();if(!T.width||!T.height)return;const K=[...a(he).querySelectorAll("svg text")],$e=Ln(((Zt=a(he).querySelector("svg rect"))==null?void 0:Zt.getAttribute("fill"))||"#141513"),tt=K.map(_=>{const m=_.getBoundingClientRect();return{x:m.x-T.x,y:m.y-T.y,width:m.width,height:m.height,foreground:Ln(getComputedStyle(_).fill)}}),gt=a(he).parentElement,We=a(s)==="instagram"?[...gt.querySelectorAll(".poll-sticker,.reel-rail,.reel-meta,.reel-top,.story-chrome,.story-reply,.slide-count,.previous,.next,.floating-heart")].map(_=>{const m=_.getBoundingClientRect(),C=_.classList.contains("reel-meta")?getComputedStyle(_,"::before"):null,L=nt=>C&&C.content!=="none"?Math.min(0,parseFloat(C[nt])||0):0,Q=L("left"),me=L("right"),Re=L("top"),rt=L("bottom");return{x:m.x-T.x+Q,y:m.y-T.y+Re,width:m.width-Q-me,height:m.height-Re-rt}}):[],Dt={format:r(),obstructionBoxes:We,canvas:{width:T.width,height:T.height},textBoxes:tt,background:$e,caption:a(lt),captionLimit:Number(a(v)),viewContext:{mode:a(s),frameIndex:r()==="reel"?a(ct):a(g),storyFrame:a(N),pollVote:a(M),measuredAt:new Date().toISOString()}},Lt=Ih(Dt);d(de,Lt.metrics,!0),i()(Dt)}function $i(){a(R).trim()&&(d(S,[...a(S),a(R).trim()],!0),d(R,""))}async function ai(){d(q,"Local share preview opened. Nothing was published.")}var _r=Kh();yi("keydown",Go,Tr);var Ia=l(h(_r),2),hn=h(Ia);let Ar;var zt=l(hn,2);let si;var et=l(zt,2);let Ea;var oi=l(Ia,2),fs=h(oi),Sa=l(h(fs)),ka=h(Sa);ka.value=ka.__value=375;var Mn=l(ka);Mn.value=Mn.__value=390;var Bi=l(Mn);Bi.value=Bi.__value=402;var qr=l(Bi);qr.value=qr.__value=430,or(Sa);var Tt=l(fs,2),Hi=l(h(Tt)),li=l(Hi),Vi=E(li),hs=l(Tt,2),oo=h(hs),lo=l(hs,2),co=h(lo),pn=l(oi,4),Ta=h(pn);let ps,Aa;var zi=h(Ta);{var Cr=T=>{var K=Eh();k(T,K)};ce(zi,T=>{a(s)!=="design"&&T(Cr)})}var Un=l(zi,2);{var Ca=T=>{var K=Ah(),$e=Je(K),tt=h($e),gt=E(tt,!0),We=l(tt),Dt=l($e,2),Lt=h(Dt),Zt=E(Lt,!0),_=l(Lt),m=h(_),C=E(m,!0),L=l(Dt,2),Q=h(L),me=E(Q,!0),Re=l(Q,2),rt=E(Re,!0),nt=l(L,2);Ne(nt,20,()=>Array(9),Xi,(Ee,Ke,At)=>{var gr=Th();lr(gr,1,"grid-cell",null,{},{current:At===0});var Fn=h(gr);{var $n=pt=>{var Bn=Sh(),W=Je(Bn);Gl(W,()=>Ot({campaign:a(kt)[At].campaignDraft,brandProfile:e.brandProfile,format:"infographic"}));var ye=l(W),Oe=E(ye,!0);$(()=>y(Oe,a(kt)[At].gridLabel)),k(pt,Bn)},ci=pt=>{var Bn=kh();k(pt,Bn)};ce(Fn,pt=>{a(kt)[At]?pt($n):pt(ci,-1)})}$(()=>{var pt;return It(gr,"title",((pt=a(kt)[At])==null?void 0:pt.title)||"Empty slot")}),k(Ee,gr)}),$(Ee=>{var Ke,At;y(gt,a(ot)),y(Zt,Ee),y(C,a(kt).length),y(me,(Ke=e.brandProfile)==null?void 0:Ke.brandName),y(rt,(At=e.brandProfile)==null?void 0:At.tagline)},[()=>{var Ee,Ke;return((Ke=(Ee=e.brandProfile)==null?void 0:Ee.logoText)==null?void 0:Ke.slice(0,2))||a(ot).slice(0,2)}]),P("click",We,()=>d(q,"Profile options are a local simulation.")),k(T,K)},uo=T=>{var K=Vh(),$e=Je(K);{var tt=W=>{var ye=Ch(),Oe=h(ye),je=E(Oe,!0),qe=l(Oe,2),Xe=h(qe),Wt=E(Xe,!0),it=l(qe,2);$(er=>{y(je,er),y(Wt,a(ot))},[()=>a(ot).slice(0,2)]),P("click",it,()=>d(q,"Post menu preview. Export to save an actual file.")),k(W,ye)},gt=Bt(()=>a(s)==="instagram"&&!["story","reel"].includes(r()));ce($e,W=>{a(gt)&&W(tt)})}var We=l($e,2);let Dt;var Lt=h(We);Gl(Lt,()=>a(Ae),!0),_h(Lt,W=>d(he,W),()=>a(he));var Zt=l(Lt,2);{var _=W=>{var ye=Rh(),Oe=Je(ye),je=E(Oe),qe=l(Oe),Xe=l(qe);$(()=>{y(je,`${a(g)+1}/${a(Ce).length??""}`),qe.disabled=a(g)===0,Xe.disabled=a(g)===a(Ce).length-1}),P("click",qe,()=>le(-1)),P("click",Xe,()=>le(1)),k(W,ye)};ce(Zt,W=>{a(s)==="instagram"&&r()==="carousel"&&W(_)})}var m=l(Zt,2);{var C=W=>{var ye=xh(),Oe=Je(ye),je=h(Oe);Ne(je,20,()=>[0,1,2,3],we=>we,(we,De)=>{var Be=Ph(),ut=h(Be);let Ct;$(()=>Ct=Yl(ut,"",Ct,{width:`${De<a(N)?100:De===a(N)?a(V)*20:0}%`})),k(we,Be)});var qe=l(je,2),Xe=h(qe),Wt=E(Xe,!0),it=l(Xe),er=E(it,!0),Mt=l(it,2),Hn=E(Mt,!0),Gr=l(Mt),Vn=l(Oe,2),_n=h(Vn),zn=E(_n,!0),Kr=l(_n,2),Rr=h(Kr);let mr;var ui=E(Rr),mt=l(Rr);let tr;var gn=E(mt),gs=l(Kr,2),di=E(gs,!0),Wn=l(Vn,2),H=l(h(Wn)),se=E(H,!0),ie=l(H);$(we=>{var De,Be;y(Wt,we),y(er,a(ot)),It(Mt,"aria-label",a(Y)?"Pause story":"Play story"),y(Hn,a(Y)?"Ⅱ":"▶"),y(zn,(Be=(De=e.campaign)==null?void 0:De.story)==null?void 0:Be.interactiveStickerPrompt),mr=lr(Rr,1,"",null,mr,{voted:a(M)==="A"}),y(ui,`Investigate ${a(M)?a(M)==="A"?"✓ 100%":"0%":""}`),tr=lr(mt,1,"",null,tr,{voted:a(M)==="B"}),y(gn,`Read sources ${a(M)?a(M)==="B"?"✓ 100%":"0%":""}`),y(di,a(M)?"Your one local vote · simulated result":"Try a local poll vote"),It(H,"aria-pressed",a(w)),y(se,a(w)?"♥":"♡")},[()=>a(ot).slice(0,2)]),P("click",Mt,()=>d(Y,!a(Y))),P("click",Gr,()=>Qt("design")),P("click",Rr,()=>d(M,"A")),P("click",mt,()=>d(M,"B")),P("click",H,()=>d(w,!a(w))),P("click",ie,ai),k(W,ye)};ce(m,W=>{a(s)==="instagram"&&r()==="story"&&W(C)})}var L=l(m,2);{var Q=W=>{var ye=Nh(),Oe=l(Je(ye),2),je=h(Oe),qe=h(je),Xe=l(qe),Wt=E(Xe,!0),it=l(je),er=l(h(it)),Mt=E(er,!0),Hn=l(it),Gr=l(Hn),Vn=l(Gr);let _n;var zn=l(Oe,2),Kr=h(zn),Rr=E(Kr,!0),mr=l(Kr),ui=E(mr,!0),mt=l(mr,2),tr=E(mt);$(gn=>{It(je,"aria-pressed",a(w)),y(qe,a(w)?"♥":"♡"),y(Wt,a(w)?1:0),y(Mt,a(S).length),_n=lr(Vn,1,"vinyl",null,_n,{spinning:a(ne)}),y(Rr,a(ot)),It(mr,"aria-pressed",a(B)),y(ui,a(B)?"Following":"+ Follow"),y(tr,`${gn??""}${a(lt).length>a(v)?"…":""}`)},[()=>a(lt).slice(0,a(v))]),P("click",je,()=>d(w,!a(w))),P("click",it,()=>d(x,!a(x))),P("click",Hn,ai),P("click",Gr,()=>d(q,"Reel options preview; nothing is published.")),P("click",mr,()=>d(B,!a(B))),k(W,ye)};ce(L,W=>{a(s)==="instagram"&&r()==="reel"&&W(Q)})}var me=l(L,2);{var Re=W=>{var ye=Dh(),Oe=l(h(ye),4);{var je=qe=>{var Xe=Oh();k(qe,Xe)};ce(Oe,qe=>{r()==="reel"&&qe(je)})}k(W,ye)},rt=Bt(()=>a(u)&&["story","reel"].includes(r()));ce(me,W=>{a(rt)&&W(Re)})}var nt=l(me,2);{var Ee=W=>{var ye=Lh();k(W,ye)},Ke=Bt(()=>a(w)&&a(q).includes("Liked"));ce(nt,W=>{a(Ke)&&W(Ee)})}var At=l(We,2);{var gr=W=>{var ye=Mh(),Oe=h(ye),je=E(Oe,!0),qe=l(Oe),Xe=l(qe),Wt=E(Xe);$(it=>{y(je,a(ne)?"Pause reel":"Play reel"),y(Wt,`BEAT ${a(ct)+1} · ${it??""} / 30s`)},[()=>Math.floor(a(D))]),P("click",Oe,()=>d(ne,!a(ne))),ze(qe,()=>a(D),it=>d(D,it)),k(W,ye)};ce(At,W=>{r()==="reel"&&W(gr)})}var Fn=l(At,2);{var $n=W=>{var ye=Bh(),Oe=Je(ye),je=h(Oe),qe=E(je,!0),Xe=l(je),Wt=l(Xe),it=l(Wt);{var er=mt=>{var tr=Fh();Ne(tr,21,()=>a(Ce),Xi,(gn,gs,di)=>{var Wn=Uh();It(Wn,"aria-label",`Go to slide ${di+1}`);let H;$(()=>H=lr(Wn,1,"",null,H,{active:a(g)===di})),P("click",Wn,()=>d(g,di,!0)),k(gn,Wn)}),k(mt,tr)};ce(it,mt=>{r()==="carousel"&&mt(er)})}var Mt=l(it),Hn=E(Mt,!0),Gr=l(Oe,2),Vn=E(Gr),_n=l(Gr,2),zn=h(_n),Kr=E(zn,!0),Rr=l(zn),mr=l(Rr);{var ui=mt=>{var tr=$h(),gn=E(tr,!0);$(()=>y(gn,a(I)?"less":"… more")),P("click",tr,()=>d(I,!a(I))),k(mt,tr)};ce(mr,mt=>{a(lt).length>a(v)&&mt(ui)})}$(mt=>{It(je,"aria-pressed",a(w)),y(qe,a(w)?"♥":"♡"),It(Mt,"aria-pressed",a(b)),y(Hn,a(b)?"▣":"♧"),y(Vn,`${a(w)?1:0} local likes · ${a(b)?"Saved in preview":"Preview only"}`),y(Kr,a(ot)),y(Rr,` ${mt??""}`)},[()=>a(I)?a(lt):a(lt).slice(0,a(v))]),P("click",je,()=>d(w,!a(w))),P("click",Xe,()=>d(x,!a(x))),P("click",Wt,ai),P("click",Mt,()=>d(b,!a(b))),k(W,ye)},ci=Bt(()=>a(s)==="instagram"&&!["story","reel"].includes(r()));ce(Fn,W=>{a(ci)&&W($n)})}var pt=l(Fn,2);{var Bn=W=>{var ye=Hh(),Oe=h(ye),je=l(h(Oe)),qe=l(Oe,2),Xe=h(qe),Wt=E(Xe,!0),it=l(Xe,2,!0);$((er,Mt)=>{y(Wt,er),y(it,Mt)},[()=>a(lt).slice(0,a(v)),()=>a(lt).slice(a(v))]),ze(je,()=>a(v),er=>d(v,er)),k(W,ye)};ce(pt,W=>{a(f)&&W(Bn)})}$(W=>Dt=lr(We,1,"asset-stage",null,Dt,{vertical:W}),[()=>["story","reel"].includes(r())]),P("pointerdown",We,W=>U=W.clientX),P("pointerup",We,W=>{Math.abs(W.clientX-U)>40&&le(W.clientX<U?1:-1)}),P("dblclick",We,()=>{d(w,!0),d(q,"Liked in this simulation")}),k(T,K)};ce(Un,T=>{a(s)==="grid"?T(Ca):T(uo,-1)})}var Ra=l(Un,2);{var vn=T=>{var K=Wh(),$e=l(h(K));Ne($e,17,()=>a(S),Xi,(We,Dt)=>{var Lt=zh(),Zt=E(Lt,!0);$(()=>y(Zt,a(Dt))),k(We,Lt)});var tt=l($e,2),gt=h(tt);yi("submit",tt,We=>{We.preventDefault(),$i()}),ze(gt,()=>a(R),We=>d(R,We)),k(T,K)};ce(Ra,T=>{a(x)&&T(vn)})}var fo=l(Ra,2);{var ho=T=>{var K=jh(),$e=E(K,!0);$(()=>y($e,a(q))),k(T,K)};ce(fo,T=>{a(q)&&T(ho)})}var vs=l(pn,2),Pa=h(vs),_s=l(h(Pa)),po=l(Pa,2);{var vo=T=>{var K=qh(),$e=Je(K),tt=h($e),gt=h(tt),We=E(gt,!0),Dt=l(tt),Lt=h(Dt),Zt=E(Lt,!0),_=l(Dt),m=h(_),C=E(m),L=l(m),Q=l(_),me=h(Q),Re=E(me,!0),rt=l(me),nt=l(Q),Ee=h(nt),Ke=E(Ee,!0);$(()=>{y(We,a(de).occludedElementsCount),y(Zt,a(de).overflowElementsCount),y(C,`${a(de).contrastRatio??"Unmeasured"??""}${a(de).contrastRatio!==null?":1":""}`),y(L,` minimum text/background contrast${a(de).unmeasuredColorCount?` · ${a(de).unmeasuredColorCount} unmeasured`:""}`),y(Re,a(de).expectedAspectRatio),y(rt,` target ratio · ${a(de).aspectRatioDeviation<=.01?"matched":"check dimensions"}`),y(Ke,a(de).firstLookCharacters)}),k(T,K)},Wi=T=>{var K=Gh();k(T,K)};ce(po,T=>{a(de)?T(vo):T(Wi,-1)})}$(T=>{Ar=lr(hn,1,"",null,Ar,{active:a(s)==="design"}),si=lr(zt,1,"",null,si,{active:a(s)==="instagram"}),Ea=lr(et,1,"",null,Ea,{active:a(s)==="grid"}),y(Vi,`${a(o)??""}%`),ps=lr(Ta,1,"phone",null,ps,{raw:a(s)==="design"}),Aa=Yl(Ta,"",Aa,{width:`${a(c)??""}px`,height:T,zoom:a(o)/100})},[()=>a(s)==="design"?"auto":`${Math.round(a(c)*874/402)}px`]),P("click",hn,()=>Qt("design")),P("click",zt,()=>Qt("instagram")),P("click",et,()=>Qt("grid")),Mr(Sa,()=>a(c),T=>d(c,T)),ze(Hi,()=>a(o),T=>d(o,T)),Vs(oo,()=>a(u),T=>d(u,T)),Vs(co,()=>a(f),T=>d(f,T)),P("click",_s,fn),k(t,_r),dl()}ku(["click","pointerdown","pointerup","dblclick"]);const Yh=()=>{};var Zl={};/**
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
 */const Ru=function(t){const e=[];let r=0;for(let n=0;n<t.length;n++){let i=t.charCodeAt(n);i<128?e[r++]=i:i<2048?(e[r++]=i>>6|192,e[r++]=i&63|128):(i&64512)===55296&&n+1<t.length&&(t.charCodeAt(n+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++n)&1023),e[r++]=i>>18|240,e[r++]=i>>12&63|128,e[r++]=i>>6&63|128,e[r++]=i&63|128):(e[r++]=i>>12|224,e[r++]=i>>6&63|128,e[r++]=i&63|128)}return e},Xh=function(t){const e=[];let r=0,n=0;for(;r<t.length;){const i=t[r++];if(i<128)e[n++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[r++];e[n++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[r++],o=t[r++],c=t[r++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const s=t[r++],o=t[r++];e[n++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},Pu={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const r=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,c=o?t[i+1]:0,u=i+2<t.length,f=u?t[i+2]:0,v=s>>2,g=(s&3)<<4|c>>4;let w=(c&15)<<2|f>>6,b=f&63;u||(b=64,o||(w=64)),n.push(r[v],r[g],r[w],r[b])}return n.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Ru(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Xh(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const r=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let i=0;i<t.length;){const s=r[t.charAt(i++)],c=i<t.length?r[t.charAt(i)]:0;++i;const f=i<t.length?r[t.charAt(i)]:64;++i;const g=i<t.length?r[t.charAt(i)]:64;if(++i,s==null||c==null||f==null||g==null)throw new Qh;const w=s<<2|c>>4;if(n.push(w),f!==64){const b=c<<4&240|f>>2;if(n.push(b),g!==64){const I=f<<6&192|g;n.push(I)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Qh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Zh=function(t){const e=Ru(t);return Pu.encodeByteArray(e,!0)},xu=function(t){return Zh(t).replace(/\./g,"")},Nu=function(t){try{return Pu.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function ep(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const tp=()=>ep().__FIREBASE_DEFAULTS__,rp=()=>{if(typeof process>"u"||typeof Zl>"u")return;const t=Zl.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},np=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Nu(t[1]);return e&&JSON.parse(e)},El=()=>{try{return Yh()||tp()||rp()||np()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},ip=t=>{var e,r;return(r=(e=El())==null?void 0:e.emulatorHosts)==null?void 0:r[t]},Ou=()=>{var t;return(t=El())==null?void 0:t.config},Du=t=>{var e;return(e=El())==null?void 0:e[`_${t}`]};/**
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
 */class ap{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,r)=>{this.resolve=e,this.reject=r})}wrapCallback(e){return(r,n)=>{r?this.reject(r):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(r):e(r,n))}}}/**
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
 */function Vt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function sp(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Vt())}function op(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function lp(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function cp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function up(){const t=Vt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function dp(){try{return typeof indexedDB=="object"}catch{return!1}}function fp(){return new Promise((t,e)=>{try{let r=!0;const n="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(n);i.onsuccess=()=>{i.result.close(),r||self.indexedDB.deleteDatabase(n),t(!0)},i.onupgradeneeded=()=>{r=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(r){e(r)}})}/**
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
 */const hp="FirebaseError";class ni extends Error{constructor(e,r,n){super(r),this.code=e,this.customData=n,this.name=hp,Object.setPrototypeOf(this,ni.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ss.prototype.create)}}class ss{constructor(e,r,n){this.service=e,this.serviceName=r,this.errors=n}create(e,...r){const n=r[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?pp(s,n):"Error",c=`${this.serviceName}: ${o} (${i}).`;return new ni(i,c,n)}}function pp(t,e){try{let r=0,n="";for(;r<t.length;){const i=t.indexOf("{$",r);if(i===-1){n+=t.substring(r);break}const s=t.indexOf("}",i+2);if(s===-1){n+=t.substring(r);break}const o=t.substring(i+2,s),c=e[o];n+=t.substring(r,i)+(c!=null?String(c):`<${o}?>`),r=s+1}return n}catch{return t}}function vp(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function pa(t,e){if(t===e)return!0;const r=Object.keys(t),n=Object.keys(e);for(const i of r){if(!n.includes(i))return!1;const s=t[i],o=e[i];if(ec(s)&&ec(o)){if(!pa(s,o))return!1}else if(s!==o)return!1}for(const i of n)if(!r.includes(i))return!1;return!0}function ec(t){return t!==null&&typeof t=="object"}/**
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
 */function os(t){const e=[];for(const[r,n]of Object.entries(t))Array.isArray(n)?n.forEach(i=>{e.push(encodeURIComponent(r)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(r)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function _p(t,e){const r=new gp(t,e);return r.subscribe.bind(r)}class gp{constructor(e,r){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=r,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(r=>{r.next(e)})}error(e){this.forEachObserver(r=>{r.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,r,n){let i;if(e===void 0&&r===void 0&&n===void 0)throw new Error("Missing Observer.");mp(e,["next","error","complete"])?i=e:i={next:e,error:r,complete:n},i.next===void 0&&(i.next=No),i.error===void 0&&(i.error=No),i.complete===void 0&&(i.complete=No);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let r=0;r<this.observers.length;r++)this.sendOne(r,e)}sendOne(e,r){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{r(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function mp(t,e){if(typeof t!="object"||t===null)return!1;for(const r of e)if(r in t&&typeof t[r]=="function")return!0;return!1}function No(){}/**
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
 */function ii(t){return t&&t._delegate?t._delegate:t}/**
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
 */function Sl(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function bp(t){return(await fetch(t,{credentials:"include"})).ok}class va{constructor(e,r,n){this.name=e,this.instanceFactory=r,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const bi="[DEFAULT]";/**
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
 */class wp{constructor(e,r){this.name=e,this.container=r,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const r=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(r)){const n=new ap;if(this.instancesDeferred.set(r,n),this.isInitialized(r)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:r});i&&n.resolve(i)}catch{}}return this.instancesDeferred.get(r).promise}getImmediate(e){const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(n)return null;throw i}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Ip(e))try{this.getOrInitializeService({instanceIdentifier:bi})}catch{}for(const[r,n]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(r);try{const s=this.getOrInitializeService({instanceIdentifier:i});n.resolve(s)}catch{}}}}clearInstance(e=bi){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(r=>"INTERNAL"in r).map(r=>r.INTERNAL.delete()),...e.filter(r=>"_delete"in r).map(r=>r._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=bi){return this.instances.has(e)}getOptions(e=bi){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:r={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:n,options:r});for(const[s,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);n===c&&o.resolve(i)}return i}onInit(e,r){const n=this.normalizeInstanceIdentifier(r),i=this.onInitCallbacks.get(n)??new Set;i.add(e),this.onInitCallbacks.set(n,i);const s=this.instances.get(n);return s&&e(s,n),()=>{i.delete(e)}}invokeOnInitCallbacks(e,r){const n=this.onInitCallbacks.get(r);if(n)for(const i of n)try{i(e,r)}catch{}}getOrInitializeService({instanceIdentifier:e,options:r={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:yp(e),options:r}),this.instances.set(e,n),this.instancesOptions.set(e,r),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=bi){return this.component?this.component.multipleInstances?e:bi:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function yp(t){return t===bi?void 0:t}function Ip(t){return t.instantiationMode==="EAGER"}/**
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
 */class Ep{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const r=this.getProvider(e.name);if(r.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);r.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const r=new wp(e,this);return this.providers.set(e,r),r}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var Fe;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Fe||(Fe={}));const Sp={debug:Fe.DEBUG,verbose:Fe.VERBOSE,info:Fe.INFO,warn:Fe.WARN,error:Fe.ERROR,silent:Fe.SILENT},kp=Fe.INFO,Tp={[Fe.DEBUG]:"log",[Fe.VERBOSE]:"log",[Fe.INFO]:"info",[Fe.WARN]:"warn",[Fe.ERROR]:"error"},Ap=(t,e,...r)=>{if(e<t.logLevel)return;const n=new Date().toISOString(),i=Tp[e];if(i)console[i](`[${n}]  ${t.name}:`,...r);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Lu{constructor(e){this.name=e,this._logLevel=kp,this._logHandler=Ap,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Fe))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Sp[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Fe.DEBUG,...e),this._logHandler(this,Fe.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Fe.VERBOSE,...e),this._logHandler(this,Fe.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Fe.INFO,...e),this._logHandler(this,Fe.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Fe.WARN,...e),this._logHandler(this,Fe.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Fe.ERROR,...e),this._logHandler(this,Fe.ERROR,...e)}}const Cp=(t,e)=>e.some(r=>t instanceof r);let tc,rc;function Rp(){return tc||(tc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Pp(){return rc||(rc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Mu=new WeakMap,tl=new WeakMap,Uu=new WeakMap,Oo=new WeakMap,kl=new WeakMap;function xp(t){const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{r(ti(t.result)),i()},o=()=>{n(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(r=>{r instanceof IDBCursor&&Mu.set(r,t)}).catch(()=>{}),kl.set(e,t),e}function Np(t){if(tl.has(t))return;const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{r(),i()},o=()=>{n(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});tl.set(t,e)}let rl={get(t,e,r){if(t instanceof IDBTransaction){if(e==="done")return tl.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Uu.get(t);if(e==="store")return r.objectStoreNames[1]?void 0:r.objectStore(r.objectStoreNames[0])}return ti(t[e])},set(t,e,r){return t[e]=r,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Op(t){rl=t(rl)}function Dp(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...r){const n=t.call(Do(this),e,...r);return Uu.set(n,e.sort?e.sort():[e]),ti(n)}:Pp().includes(t)?function(...e){return t.apply(Do(this),e),ti(Mu.get(this))}:function(...e){return ti(t.apply(Do(this),e))}}function Lp(t){return typeof t=="function"?Dp(t):(t instanceof IDBTransaction&&Np(t),Cp(t,Rp())?new Proxy(t,rl):t)}function ti(t){if(t instanceof IDBRequest)return xp(t);if(Oo.has(t))return Oo.get(t);const e=Lp(t);return e!==t&&(Oo.set(t,e),kl.set(e,t)),e}const Do=t=>kl.get(t);function Mp(t,e,{blocked:r,upgrade:n,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),c=ti(o);return n&&o.addEventListener("upgradeneeded",u=>{n(ti(o.result),u.oldVersion,u.newVersion,ti(o.transaction),u)}),r&&o.addEventListener("blocked",u=>r(u.oldVersion,u.newVersion,u)),c.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",f=>i(f.oldVersion,f.newVersion,f))}).catch(()=>{}),c}const Up=["get","getKey","getAll","getAllKeys","count"],Fp=["put","add","delete","clear"],Lo=new Map;function nc(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Lo.get(e))return Lo.get(e);const r=e.replace(/FromIndex$/,""),n=e!==r,i=Fp.includes(r);if(!(r in(n?IDBIndex:IDBObjectStore).prototype)||!(i||Up.includes(r)))return;const s=async function(o,...c){const u=this.transaction(o,i?"readwrite":"readonly");let f=u.store;return n&&(f=f.index(c.shift())),(await Promise.all([f[r](...c),i&&u.done]))[0]};return Lo.set(e,s),s}Op(t=>({...t,get:(e,r,n)=>nc(e,r)||t.get(e,r,n),has:(e,r)=>!!nc(e,r)||t.has(e,r)}));/**
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
 */class $p{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(r=>{if(Bp(r)){const n=r.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(r=>r).join(" ")}}function Bp(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const nl="@firebase/app",ic="0.16.2";/**
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
 */const Nn=new Lu("@firebase/app"),Hp="@firebase/app-compat",Vp="@firebase/analytics-compat",zp="@firebase/analytics",Wp="@firebase/app-check-compat",jp="@firebase/app-check",qp="@firebase/auth",Gp="@firebase/auth-compat",Kp="@firebase/database",Jp="@firebase/data-connect",Yp="@firebase/database-compat",Xp="@firebase/functions",Qp="@firebase/functions-compat",Zp="@firebase/installations",ev="@firebase/installations-compat",tv="@firebase/messaging",rv="@firebase/messaging-compat",nv="@firebase/performance",iv="@firebase/performance-compat",av="@firebase/remote-config",sv="@firebase/remote-config-compat",ov="@firebase/storage",lv="@firebase/storage-compat",cv="@firebase/firestore",uv="@firebase/ai",dv="@firebase/firestore-compat",fv="firebase",hv="12.19.0";/**
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
 */const il="[DEFAULT]",pv={[nl]:"fire-core",[Hp]:"fire-core-compat",[zp]:"fire-analytics",[Vp]:"fire-analytics-compat",[jp]:"fire-app-check",[Wp]:"fire-app-check-compat",[qp]:"fire-auth",[Gp]:"fire-auth-compat",[Kp]:"fire-rtdb",[Jp]:"fire-data-connect",[Yp]:"fire-rtdb-compat",[Xp]:"fire-fn",[Qp]:"fire-fn-compat",[Zp]:"fire-iid",[ev]:"fire-iid-compat",[tv]:"fire-fcm",[rv]:"fire-fcm-compat",[nv]:"fire-perf",[iv]:"fire-perf-compat",[av]:"fire-rc",[sv]:"fire-rc-compat",[ov]:"fire-gcs",[lv]:"fire-gcs-compat",[cv]:"fire-fst",[dv]:"fire-fst-compat",[uv]:"fire-vertex","fire-js":"fire-js",[fv]:"fire-js-all"};/**
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
 */const zs=new Map,vv=new Map,al=new Map;function ac(t,e){try{t.container.addComponent(e)}catch(r){Nn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,r)}}function Ka(t){const e=t.name;if(al.has(e))return Nn.debug(`There were multiple attempts to register component ${e}.`),!1;al.set(e,t);for(const r of zs.values())ac(r,t);for(const r of vv.values())ac(r,t);return!0}function Fu(t,e){const r=t.container.getProvider("heartbeat").getImmediate({optional:!0});return r&&r.triggerHeartbeat(),t.container.getProvider(e)}function an(t){return t==null?!1:t.settings!==void 0}/**
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
 */const _v={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},An=new ss("app","Firebase",_v);/**
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
 */class gv{constructor(e,r,n){this._isDeleted=!1,this._options={...e},this._config={...r},this._name=r.name,this._automaticDataCollectionEnabled=r.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new va("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw An.create("app-deleted",{appName:this._name})}}/**
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
 */const ls=hv;function $u(t,e={}){let r=t;typeof e!="object"&&(e={name:e});const n={name:il,automaticDataCollectionEnabled:!0,...e},i=n.name;if(typeof i!="string"||!i)throw An.create("bad-app-name",{appName:String(i)});if(r||(r=Ou()),!r)throw An.create("no-options");const s=zs.get(i);if(s)if(pa(r,s.options)){if(pa(n,s.config))return s;throw An.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(s.config),newValue:JSON.stringify(n)})}else throw An.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(s.options),newValue:JSON.stringify(r)});const o=new Ep(i);for(const u of al.values())o.addComponent(u);const c=new gv(r,n,o);return zs.set(i,c),c}function mv(t=il){const e=zs.get(t);if(!e&&t===il&&Ou())return $u();if(!e)throw An.create("no-app",{appName:t});return e}function Zi(t,e,r){let n=pv[t]??t;r&&(n+=`-${r}`);const i=n.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${n}" with version "${e}":`];i&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Nn.warn(o.join(" "));return}Ka(new va(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
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
 */const bv="firebase-heartbeat-database",wv=1,Ja="firebase-heartbeat-store";let Mo=null;function Bu(){return Mo||(Mo=Mp(bv,wv,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Ja)}catch(r){console.warn(r)}}}}).catch(t=>{throw An.create("idb-open",{originalErrorMessage:t.message})})),Mo}async function yv(t){try{const r=(await Bu()).transaction(Ja),n=await r.objectStore(Ja).get(Hu(t));return await r.done,n}catch(e){if(e instanceof ni)Nn.warn(e.message);else{const r=An.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Nn.warn(r.message)}}}async function sc(t,e){try{const n=(await Bu()).transaction(Ja,"readwrite");await n.objectStore(Ja).put(e,Hu(t)),await n.done}catch(r){if(r instanceof ni)Nn.warn(r.message);else{const n=An.create("idb-set",{originalErrorMessage:r==null?void 0:r.message});Nn.warn(n.message)}}}function Hu(t){return`${t.name}!${t.options.appId}`}/**
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
 */const Iv=1024,Ev=30;class Sv{constructor(e){this.container=e,this._heartbeatsCache=null;const r=this.container.getProvider("app").getImmediate();this._storage=new Tv(r),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,r;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=oc();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((r=this._heartbeatsCache)==null?void 0:r.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>Ev){const o=Av(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){Nn.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const r=oc(),{heartbeatsToSend:n,unsentEntries:i}=kv(this._heartbeatsCache.heartbeats),s=xu(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=r,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(r){return Nn.warn(r),""}}}function oc(){return new Date().toISOString().substring(0,10)}function kv(t,e=Iv){const r=[];let n=t.slice();for(const i of t){const s=r.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),lc(r)>e){s.dates.pop();break}}else if(r.push({agent:i.agent,dates:[i.date]}),lc(r)>e){r.pop();break}n=n.slice(1)}return{heartbeatsToSend:r,unsentEntries:n}}class Tv{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return dp()?fp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const r=await yv(this.app);return r!=null&&r.heartbeats?r:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return sc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return sc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function lc(t){return xu(JSON.stringify({version:2,heartbeats:t})).length}function Av(t){if(t.length===0)return-1;let e=0,r=t[0].date;for(let n=1;n<t.length;n++)t[n].date<r&&(r=t[n].date,e=n);return e}/**
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
 */function Cv(t){Ka(new va("platform-logger",e=>new $p(e),"PRIVATE")),Ka(new va("heartbeat",e=>new Sv(e),"PRIVATE")),Zi(nl,ic,t),Zi(nl,ic,"esm2020"),Zi("fire-js","")}/**
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
 */Cv("");var Rv="firebase",Pv="12.19.0";/**
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
 */Zi(Rv,Pv,"app");function Vu(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const xv=Vu,zu=new ss("auth","Firebase",Vu());/**
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
 */const Ws=new Lu("@firebase/auth");function xs(t,...e){Ws.logLevel<=Fe.WARN&&Ws.warn(`Auth (${ls}): ${t}`,...e)}function Ns(t,...e){Ws.logLevel<=Fe.ERROR&&Ws.error(`Auth (${ls}): ${t}`,...e)}/**
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
 */function dn(t,...e){throw Tl(t,...e)}function Wr(t,...e){return Tl(t,...e)}function no(t,e,r){const n={...xv(),[e]:r};return new ss("auth","Firebase",n).create(e,{appName:t.name})}function Di(t){return no(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Nv(t,e,r){const n=r;if(!(e instanceof n))throw n.name!==e.constructor.name&&dn(t,"argument-error"),no(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Tl(t,...e){if(typeof t!="string"){const r=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=t.name),t._errorFactory.create(r,...n)}return zu.create(t,...e)}function G(t,e,...r){if(!t)throw Tl(e,...r)}function Cn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ns(e),new Error(e)}function On(t,e){t||Cn(e)}/**
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
 */function sl(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function Ov(){return cc()==="http:"||cc()==="https:"}function cc(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function Dv(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Ov()||lp()||"connection"in navigator)?navigator.onLine:!0}function Lv(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class cs{constructor(e,r){this.shortDelay=e,this.longDelay=r,On(r>e,"Short delay should be less than long delay!"),this.isMobile=sp()||cp()}get(){return Dv()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Al(t,e){On(t.emulator,"Emulator should always be set here");const{url:r}=t.emulator;return e?`${r}${e.startsWith("/")?e.slice(1):e}`:r}/**
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
 */class Wu{static initialize(e,r,n){this.fetchImpl=e,r&&(this.headersImpl=r),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Cn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Cn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Cn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Mv={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Uv=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Fv=new cs(3e4,6e4);function Cl(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function ya(t,e,r,n,i={}){return ju(t,i,async()=>{let s={},o={};n&&(e==="GET"?o=n:s={body:JSON.stringify(n)});const c=os({...o,key:t.config.apiKey}).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const f={method:e,headers:u,...s};return op()||(f.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&Sl(t.emulatorConfig.host)&&(f.credentials="include"),Wu.fetch()(await qu(t,t.config.apiHost,r,c),f)})}async function ju(t,e,r){t._canInitEmulator=!1;const n={...Mv,...e};try{const i=new Bv(t),s=await Promise.race([r(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw ks(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const c=s.ok?o.errorMessage:o.error.message,[u,f]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw ks(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw ks(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw ks(t,"user-disabled",o);const v=n[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(f)throw no(t,v,f);dn(t,v)}}catch(i){if(i instanceof ni)throw i;dn(t,"network-request-failed",{message:String(i)})}}async function $v(t,e,r,n,i={}){const s=await ya(t,e,r,n,i);return"mfaPendingCredential"in s&&dn(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function qu(t,e,r,n){const i=`${e}${r}?${n}`,s=t,o=s.config.emulator?Al(t.config,i):`${t.config.apiScheme}://${i}`;return Uv.includes(r)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class Bv{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((r,n)=>{this.timer=setTimeout(()=>n(Wr(this.auth,"network-request-failed")),Fv.get())})}}function ks(t,e,r){const n={appName:t.name};r.email&&(n.email=r.email),r.phoneNumber&&(n.phoneNumber=r.phoneNumber);const i=Wr(t,e,n);return i.customData._tokenResponse=r,i}/**
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
 */async function Hv(t,e){return ya(t,"POST","/v1/accounts:delete",e)}async function js(t,e){return ya(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function Va(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Vv(t,e=!1){const r=ii(t),n=await r.getIdToken(e),i=Rl(n);G(i&&i.exp&&i.auth_time&&i.iat,r.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:n,authTime:Va(Uo(i.auth_time)),issuedAtTime:Va(Uo(i.iat)),expirationTime:Va(Uo(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Uo(t){return Number(t)*1e3}function Rl(t){const[e,r,n]=t.split(".");if(e===void 0||r===void 0||n===void 0)return Ns("JWT malformed, contained fewer than 3 sections"),null;try{const i=Nu(r);return i?JSON.parse(i):(Ns("Failed to decode base64 JWT payload"),null)}catch(i){return Ns("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function uc(t){const e=Rl(t);return G(e,"internal-error"),G(typeof e.exp<"u","internal-error"),G(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Ya(t,e,r=!1){if(r)return e;try{return await e}catch(n){throw n instanceof ni&&zv(n)&&t.auth.currentUser===t&&await t.auth.signOut(),n}}function zv({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class Wv{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const r=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},r)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class ol{constructor(e,r){this.createdAt=e,this.lastLoginAt=r,this._initializeTime()}_initializeTime(){this.lastSignInTime=Va(this.lastLoginAt),this.creationTime=Va(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function qs(t){var g;const e=t.auth,r=await t.getIdToken(),n=await Ya(t,js(e,{idToken:r}));G(n==null?void 0:n.users.length,e,"internal-error");const i=n.users[0];t._notifyReloadListener(i);const s=(g=i.providerUserInfo)!=null&&g.length?Gu(i.providerUserInfo):[],o=qv(t.providerData,s),c=t.isAnonymous,u=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),f=c?u:!1,v={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new ol(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(t,v)}async function jv(t){const e=ii(t);await qs(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function qv(t,e){return[...t.filter(n=>!e.some(i=>i.providerId===n.providerId)),...e]}function Gu(t){return t.map(({providerId:e,...r})=>({providerId:e,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}))}/**
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
 */async function Gv(t,e){const r=await ju(t,{},async()=>{const n=os({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await qu(t,i,"/v1/token",`key=${s}`),c=await t._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:n};return t.emulatorConfig&&Sl(t.emulatorConfig.host)&&(u.credentials="include"),Wu.fetch()(o,u)});return{accessToken:r.access_token,expiresIn:r.expires_in,refreshToken:r.refresh_token}}async function Kv(t,e){return ya(t,"POST","/v2/accounts:revokeToken",Cl(t,e))}/**
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
 */class ea{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){G(e.idToken,"internal-error"),G(typeof e.idToken<"u","internal-error"),G(typeof e.refreshToken<"u","internal-error");const r="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):uc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,r)}updateFromIdToken(e){G(e.length!==0,"internal-error");const r=uc(e);this.updateTokensAndExpiration(e,null,r)}async getToken(e,r=!1){return!r&&this.accessToken&&!this.isExpired?this.accessToken:(G(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,r){const{accessToken:n,refreshToken:i,expiresIn:s}=await Gv(e,r);this.updateTokensAndExpiration(n,i,Number(s))}updateTokensAndExpiration(e,r,n){this.refreshToken=r||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,r){const{refreshToken:n,accessToken:i,expirationTime:s}=r,o=new ea;return n&&(G(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),i&&(G(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(G(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ea,this.toJSON())}_performRefresh(){return Cn("not implemented")}}/**
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
 */function qn(t,e){G(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Vr{constructor({uid:e,auth:r,stsTokenManager:n,...i}){this.providerId="firebase",this.proactiveRefresh=new Wv(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=r,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new ol(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const r=await Ya(this,this.stsTokenManager.getToken(this.auth,e));return G(r,this.auth,"internal-error"),this.accessToken!==r&&(this.accessToken=r,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),r}getIdTokenResult(e){return Vv(this,e)}reload(){return jv(this)}_assign(e){this!==e&&(G(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(r=>({...r})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const r=new Vr({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return r.metadata._copy(this.metadata),r}_onReload(e){G(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,r=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),r&&await qs(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(an(this.auth.app))return Promise.reject(Di(this.auth));const e=await this.getIdToken();return await Ya(this,Hv(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,r){const n=r.displayName??void 0,i=r.email??void 0,s=r.phoneNumber??void 0,o=r.photoURL??void 0,c=r.tenantId??void 0,u=r._redirectEventId??void 0,f=r.createdAt??void 0,v=r.lastLoginAt??void 0,{uid:g,emailVerified:w,isAnonymous:b,providerData:I,stsTokenManager:R}=r;G(g&&R,e,"internal-error");const S=ea.fromJSON(this.name,R);G(typeof g=="string",e,"internal-error"),qn(n,e.name),qn(i,e.name),G(typeof w=="boolean",e,"internal-error"),G(typeof b=="boolean",e,"internal-error"),qn(s,e.name),qn(o,e.name),qn(c,e.name),qn(u,e.name),qn(f,e.name),qn(v,e.name);const x=new Vr({uid:g,auth:e,email:i,emailVerified:w,displayName:n,isAnonymous:b,photoURL:o,phoneNumber:s,tenantId:c,stsTokenManager:S,createdAt:f,lastLoginAt:v});return I&&Array.isArray(I)&&(x.providerData=I.map(q=>({...q}))),u&&(x._redirectEventId=u),x}static async _fromIdTokenResponse(e,r,n=!1){const i=new ea;i.updateFromServerResponse(r);const s=new Vr({uid:r.localId,auth:e,stsTokenManager:i,isAnonymous:n});return await qs(s),s}static async _fromGetAccountInfoResponse(e,r,n){const i=r.users[0];G(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?Gu(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new ea;c.updateFromIdToken(n);const u=new Vr({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:o}),f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new ol(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,f),u}}/**
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
 */const dc=new Map;function Rn(t){On(t instanceof Function,"Expected a class definition");let e=dc.get(t);return e?(On(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,dc.set(t,e),e)}/**
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
 */class Ku{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,r){this.storage[e]=r}async _get(e){const r=this.storage[e];return r===void 0?null:r}async _remove(e){delete this.storage[e]}_addListener(e,r){}_removeListener(e,r){}}Ku.type="NONE";const fc=Ku;/**
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
 */function Os(t,e,r){return`firebase:${t}:${e}:${r}`}class Li{constructor(e,r,n){this.persistence=e,this.auth=r,this.userKey=n;const{config:i,name:s}=this.auth;this.fullUserKey=Os(this.userKey,i.apiKey,s),this.fullPersistenceKey=Os("persistence",i.apiKey,s),this.boundEventHandler=r._onStorageEvent.bind(r);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const r=await js(this.auth,{idToken:e}).catch(()=>{});return r?Vr._fromGetAccountInfoResponse(this.auth,r,e):null}return Vr._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const r=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,r)return this.setCurrentUser(r)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,r,n="authUser"){if(!r.length)return new Li(Rn(fc),e,n);const i=(await Promise.all(r.map(async f=>{try{if(await f._isAvailable())return f}catch{return}}))).filter(f=>f);let s=i[0]||Rn(fc);const o=Os(n,e.config.apiKey,e.name);let c=null;for(const f of r)try{const v=await f._get(o);if(v){let g;if(typeof v=="string"){const w=await js(e,{idToken:v}).catch(()=>{});if(!w)break;g=await Vr._fromGetAccountInfoResponse(e,w,v)}else g=Vr._fromJSON(e,v);f!==s&&(c=g),s=f;break}}catch{}const u=i.filter(f=>f._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Li(s,e,n):(s=u[0],c&&await s._set(o,c.toJSON()),await Promise.all(r.map(async f=>{if(f!==s)try{await f._remove(o)}catch{}})),new Li(s,e,n))}}/**
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
 */function hc(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Qu(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Ju(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(ed(e))return"Blackberry";if(td(e))return"Webos";if(Yu(e))return"Safari";if((e.includes("chrome/")||Xu(e))&&!e.includes("edge/"))return"Chrome";if(Zu(e))return"Android";{const r=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=t.match(r);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function Ju(t=Vt()){return/firefox\//i.test(t)}function Yu(t=Vt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Xu(t=Vt()){return/crios\//i.test(t)}function Qu(t=Vt()){return/iemobile/i.test(t)}function Zu(t=Vt()){return/android/i.test(t)}function ed(t=Vt()){return/blackberry/i.test(t)}function td(t=Vt()){return/webos/i.test(t)}function Pl(t=Vt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Jv(t=Vt()){var e;return Pl(t)&&!!((e=window.navigator)!=null&&e.standalone)}function Yv(){return up()&&document.documentMode===10}function rd(t=Vt()){return Pl(t)||Zu(t)||td(t)||ed(t)||/windows phone/i.test(t)||Qu(t)}/**
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
 */function nd(t,e=[]){let r;switch(t){case"Browser":r=hc(Vt());break;case"Worker":r=`${hc(Vt())}-${t}`;break;default:r=t}const n=e.length?e.join(","):"FirebaseCore-web";return`${r}/JsCore/${ls}/${n}`}/**
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
 */class Xv{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,r){const n=s=>new Promise((o,c)=>{try{const u=e(s);o(u)}catch(u){c(u)}});n.onAbort=r,this.queue.push(n);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const r=[];try{for(const n of this.queue)await n(e),n.onAbort&&r.push(n.onAbort)}catch(n){r.reverse();for(const i of r)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
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
 */async function Qv(t,e={}){return ya(t,"GET","/v2/passwordPolicy",Cl(t,e))}/**
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
 */const Zv=6;class e_{constructor(e){var n;const r=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=r.minPasswordLength??Zv,r.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=r.maxPasswordLength),r.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=r.containsLowercaseCharacter),r.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=r.containsUppercaseCharacter),r.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=r.containsNumericCharacter),r.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=r.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const r={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,r),this.validatePasswordCharacterOptions(e,r),r.isValid&&(r.isValid=r.meetsMinPasswordLength??!0),r.isValid&&(r.isValid=r.meetsMaxPasswordLength??!0),r.isValid&&(r.isValid=r.containsLowercaseLetter??!0),r.isValid&&(r.isValid=r.containsUppercaseLetter??!0),r.isValid&&(r.isValid=r.containsNumericCharacter??!0),r.isValid&&(r.isValid=r.containsNonAlphanumericCharacter??!0),r}validatePasswordLengthOptions(e,r){const n=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;n&&(r.meetsMinPasswordLength=e.length>=n),i&&(r.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,r){this.updatePasswordCharacterOptionsStatuses(r,!1,!1,!1,!1);let n;for(let i=0;i<e.length;i++)n=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(r,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,r,n,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=r)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class t_{constructor(e,r,n,i){this.app=e,this.heartbeatServiceProvider=r,this.appCheckServiceProvider=n,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new pc(this),this.idTokenSubscription=new pc(this),this.beforeStateQueue=new Xv(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=zu,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,r){return r&&(this._popupRedirectResolver=Rn(r)),this._initializationPromise=this.queue(async()=>{var n,i,s;if(!this._deleted){try{this.persistenceManager=await Li.create(this,e)}catch(o){xs(`Failed to initialize persistence: ${o}`),this.persistenceManager=await Li.create(this,[])}finally{(n=this._resolvePersistenceManagerAvailable)==null||n.call(this)}if(!this._deleted){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(r)}catch(o){xs(`Failed to initialize current user: ${o}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const r=await js(this,{idToken:e}),n=await Vr._fromGetAccountInfoResponse(this,r,e);await this.directlySetCurrentUser(n)}catch(r){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",r),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(an(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let n=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=n==null?void 0:n._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(n=u.user,i=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return G(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let r=null;try{r=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return r}async reloadAndSetCurrentUserOrClear(e){try{await qs(e)}catch(r){if((r==null?void 0:r.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Lv()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(an(this.app))return Promise.reject(Di(this));const r=e?ii(e):null;return r&&G(r.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(r&&r._clone(this))}async _updateCurrentUser(e,r=!1){if(!this._deleted)return e&&G(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),r||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return an(this.app)?Promise.reject(Di(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return an(this.app)?Promise.reject(Di(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Rn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const r=this._getPasswordPolicyInternal();return r.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):r.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Qv(this),r=new e_(e);this.tenantId===null?this._projectPasswordPolicy=r:this._tenantPasswordPolicies[this.tenantId]=r}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ss("auth","Firebase",e())}onAuthStateChanged(e,r,n){return this.registerStateListener(this.authStateSubscription,e,r,n)}beforeAuthStateChanged(e,r){return this.beforeStateQueue.pushCallback(e,r)}onIdTokenChanged(e,r,n){return this.registerStateListener(this.idTokenSubscription,e,r,n)}authStateReady(){return new Promise((e,r)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},r)}})}async revokeAccessToken(e){if(this.currentUser){const r=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:r};this.tenantId!=null&&(n.tenantId=this.tenantId),await Kv(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,r){const n=await this.getOrInitRedirectPersistenceManager(r);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const r=e&&Rn(e)||this._popupRedirectResolver;G(r,this,"argument-error"),this.redirectPersistenceManager=await Li.create(this,[Rn(r._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var r,n;return this._isInitialized&&await this.queue(async()=>{}),((r=this._currentUser)==null?void 0:r._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var r;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((r=this.currentUser)==null?void 0:r.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,r,n,i){if(this._deleted)return()=>{};const s=typeof r=="function"?r:r.next.bind(r);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(G(c,this,"internal-error"),c.then(()=>{o||s(this.currentUser)}).catch(u=>{if(!o)if(typeof r!="function"&&r.error)r.error(u);else if(n)n(u);else throw u}),typeof r=="function"){const u=e.addObserver(r,n,i);return()=>{o=!0,u()}}else{const u=e.addObserver(r);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(r){const n=(r==null?void 0:r.message)||String(r),i=no(this,"internal-error",`An internal AuthError has occurred: ${n}`);throw i.customData={originalError:r},i}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return G(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=nd(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const r=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());r&&(e["X-Firebase-Client"]=r);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var r;if(an(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((r=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getToken());return e!=null&&e.error&&xs(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function io(t){return ii(t)}class pc{constructor(e){this.auth=e,this.observer=null,this.addObserver=_p(r=>this.observer=r)}get next(){return G(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let xl={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function r_(t){xl=t}function n_(t){return xl.loadJS(t)}function i_(){return xl.gapiScript}function a_(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function s_(t,e){const r=Fu(t,"auth");if(r.isInitialized()){const i=r.getImmediate(),s=r.getOptions();if(pa(s,e??{}))return i;dn(i,"already-initialized")}return r.initialize({options:e})}function o_(t,e){const r=(e==null?void 0:e.persistence)||[],n=(Array.isArray(r)?r:[r]).map(Rn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function id(t,e,r){const n=io(t);G(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const i=!1,s=ad(e),{host:o,port:c}=l_(e),u=c===null?"":`:${c}`,f={url:`${s}//${o}${u}/`},v=Object.freeze({host:o,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!n._canInitEmulator){G(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),G(pa(f,n.config.emulator)&&pa(v,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=f,n.emulatorConfig=v,n.settings.appVerificationDisabledForTesting=!0,Sl(o)?bp(`${s}//${o}${u}`):c_()}function ad(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function l_(t){const e=ad(t),r=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!r)return{host:"",port:null};const n=r[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(n);if(i){const s=i[1];return{host:s,port:vc(n.substr(s.length+1))}}else{const[s,o]=n.split(":");return{host:s,port:vc(o)}}}function vc(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function c_(){function t(){const e=document.createElement("p"),r=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",r.position="fixed",r.width="100%",r.backgroundColor="#ffffff",r.border=".1em solid #000000",r.color="#b50000",r.bottom="0px",r.left="0px",r.margin="0px",r.zIndex="10000",r.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class sd{constructor(e,r){this.providerId=e,this.signInMethod=r}toJSON(){return Cn("not implemented")}_getIdTokenResponse(e){return Cn("not implemented")}_linkToIdToken(e,r){return Cn("not implemented")}_getReauthenticationResolver(e){return Cn("not implemented")}}/**
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
 */async function ta(t,e){return $v(t,"POST","/v1/accounts:signInWithIdp",Cl(t,e))}/**
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
 */const u_="http://localhost";class Fi extends sd{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const r=new Fi(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(r.idToken=e.idToken),e.accessToken&&(r.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(r.nonce=e.nonce),e.pendingToken&&(r.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(r.accessToken=e.oauthToken,r.secret=e.oauthTokenSecret):dn("argument-error"),r}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const r=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:i,...s}=r;if(!n||!i)return null;const o=new Fi(n,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const r=this.buildRequest();return ta(e,r)}_linkToIdToken(e,r){const n=this.buildRequest();return n.idToken=r,ta(e,n)}_getReauthenticationResolver(e){const r=this.buildRequest();return r.autoCreate=!1,ta(e,r)}buildRequest(){const e={requestUri:u_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const r={};this.idToken&&(r.id_token=this.idToken),this.accessToken&&(r.access_token=this.accessToken),this.secret&&(r.oauth_token_secret=this.secret),r.providerId=this.providerId,this.nonce&&!this.pendingToken&&(r.nonce=this.nonce),e.postBody=os(r)}return e}}/**
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
 */class Nl{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class us extends Nl{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Kn extends us{constructor(){super("facebook.com")}static credential(e){return Fi._fromParams({providerId:Kn.PROVIDER_ID,signInMethod:Kn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Kn.credentialFromTaggedObject(e)}static credentialFromError(e){return Kn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Kn.credential(e.oauthAccessToken)}catch{return null}}}Kn.FACEBOOK_SIGN_IN_METHOD="facebook.com";Kn.PROVIDER_ID="facebook.com";/**
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
 */class Sn extends us{constructor(){super("google.com"),this.addScope("profile")}static credential(e,r){return Fi._fromParams({providerId:Sn.PROVIDER_ID,signInMethod:Sn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:r})}static credentialFromResult(e){return Sn.credentialFromTaggedObject(e)}static credentialFromError(e){return Sn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:r,oauthAccessToken:n}=e;if(!r&&!n)return null;try{return Sn.credential(r,n)}catch{return null}}}Sn.GOOGLE_SIGN_IN_METHOD="google.com";Sn.PROVIDER_ID="google.com";/**
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
 */class Jn extends us{constructor(){super("github.com")}static credential(e){return Fi._fromParams({providerId:Jn.PROVIDER_ID,signInMethod:Jn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Jn.credentialFromTaggedObject(e)}static credentialFromError(e){return Jn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Jn.credential(e.oauthAccessToken)}catch{return null}}}Jn.GITHUB_SIGN_IN_METHOD="github.com";Jn.PROVIDER_ID="github.com";/**
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
 */class Yn extends us{constructor(){super("twitter.com")}static credential(e,r){return Fi._fromParams({providerId:Yn.PROVIDER_ID,signInMethod:Yn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:r})}static credentialFromResult(e){return Yn.credentialFromTaggedObject(e)}static credentialFromError(e){return Yn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:r,oauthTokenSecret:n}=e;if(!r||!n)return null;try{return Yn.credential(r,n)}catch{return null}}}Yn.TWITTER_SIGN_IN_METHOD="twitter.com";Yn.PROVIDER_ID="twitter.com";/**
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
 */class _a{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,r,n,i=!1){const s=await Vr._fromIdTokenResponse(e,n,i),o=_c(n);return new _a({user:s,providerId:o,_tokenResponse:n,operationType:r})}static async _forOperation(e,r,n){await e._updateTokensIfNecessary(n,!0);const i=_c(n);return new _a({user:e,providerId:i,_tokenResponse:n,operationType:r})}}function _c(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class Gs extends ni{constructor(e,r,n,i){super(r.code,r.message),this.operationType=n,this.user=i,Object.setPrototypeOf(this,Gs.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:r.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,r,n,i){return new Gs(e,r,n,i)}}function od(t,e,r,n){return(e==="reauthenticate"?r._getReauthenticationResolver(t):r._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Gs._fromErrorAndOperation(t,s,e,n):s})}async function d_(t,e,r=!1){const n=await Ya(t,e._linkToIdToken(t.auth,await t.getIdToken()),r);return _a._forOperation(t,"link",n)}/**
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
 */async function f_(t,e,r=!1){const{auth:n}=t;if(an(n.app))return Promise.reject(Di(n));const i="reauthenticate";try{const s=await Ya(t,od(n,i,e,t),r);G(s.idToken,n,"internal-error");const o=Rl(s.idToken);G(o,n,"internal-error");const{sub:c}=o;return G(t.uid===c,n,"user-mismatch"),_a._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&dn(n,"user-mismatch"),s}}/**
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
 */async function h_(t,e,r=!1){if(an(t.app))return Promise.reject(Di(t));const n="signIn",i=await od(t,n,e),s=await _a._fromIdTokenResponse(t,n,i);return r||await t._updateCurrentUser(s.user),s}function p_(t,e,r,n){return ii(t).onIdTokenChanged(e,r,n)}function v_(t,e,r){return ii(t).beforeAuthStateChanged(e,r)}function __(t,e,r,n){return ii(t).onAuthStateChanged(e,r,n)}function g_(t){return ii(t).signOut()}const Ks="__sak";/**
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
 */class ld{constructor(e,r){this.storageRetriever=e,this.type=r}_isAvailable(){try{return this.storage?(this.storage.setItem(Ks,"1"),this.storage.removeItem(Ks),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,r){return this.storage.setItem(e,JSON.stringify(r)),Promise.resolve()}_get(e){const r=this.storage.getItem(e);return Promise.resolve(r?JSON.parse(r):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const m_=1e3,b_=10;class cd extends ld{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,r)=>this.onStorageEvent(e,r),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=rd(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const r of Object.keys(this.listeners)){const n=this.storage.getItem(r),i=this.localCache[r];n!==i&&e(r,i,n)}}onStorageEvent(e,r=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const n=e.key;r?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(n);!r&&this.localCache[n]===o||this.notifyListeners(n,o)},s=this.storage.getItem(n);Yv()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,b_):i()}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r&&JSON.parse(r))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,r,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:r,newValue:n}),!0)})},m_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,r){await super._set(e,r),this.localCache[e]=JSON.stringify(r)}async _get(e){const r=await super._get(e);return this.localCache[e]=JSON.stringify(r),r}async _remove(e){await super._remove(e),delete this.localCache[e]}}cd.type="LOCAL";const w_=cd;/**
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
 */class ud extends ld{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,r){}_removeListener(e,r){}}ud.type="SESSION";const dd=ud;/**
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
 */function y_(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(r){return{fulfilled:!1,reason:r}}}))}/**
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
 */class ao{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const r=this.receivers.find(i=>i.isListeningto(e));if(r)return r;const n=new ao(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const r=e,{eventId:n,eventType:i,data:s}=r.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;r.ports[0].postMessage({status:"ack",eventId:n,eventType:i});const c=Array.from(o).map(async f=>f(r.origin,s)),u=await y_(c);r.ports[0].postMessage({status:"done",eventId:n,eventType:i,response:u})}_subscribe(e,r){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(r)}_unsubscribe(e,r){this.handlersMap[e]&&r&&this.handlersMap[e].delete(r),(!r||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ao.receivers=[];/**
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
 */function Ol(t="",e=10){let r="";for(let n=0;n<e;n++)r+=Math.floor(Math.random()*10);return t+r}/**
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
 */class I_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,r,n=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((c,u)=>{const f=Ol("",20);i.port1.start();const v=setTimeout(()=>{u(new Error("unsupported_event"))},n);o={messageChannel:i,onMessage(g){const w=g;if(w.data.eventId===f)switch(w.data.status){case"ack":clearTimeout(v),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(w.data.response);break;default:clearTimeout(v),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:f,data:r},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function cn(){return window}function E_(t){cn().location.href=t}/**
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
 */function fd(){return typeof cn().WorkerGlobalScope<"u"&&typeof cn().importScripts=="function"}async function S_(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function k_(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function T_(){return fd()?self:null}/**
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
 */const hd="firebaseLocalStorageDb",A_=1,Js="firebaseLocalStorage",pd="fbase_key";class ds{constructor(e){this.request=e}toPromise(){return new Promise((e,r)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{r(this.request.error)})})}}function so(t,e){return t.transaction([Js],e?"readwrite":"readonly").objectStore(Js)}function C_(){const t=indexedDB.deleteDatabase(hd);return new ds(t).toPromise()}function vd(){const t=indexedDB.open(hd,A_);return new Promise((e,r)=>{t.addEventListener("error",()=>{r(t.error)}),t.addEventListener("upgradeneeded",()=>{const n=t.result;try{n.createObjectStore(Js,{keyPath:pd})}catch(i){r(i)}}),t.addEventListener("success",async()=>{const n=t.result;n.objectStoreNames.contains(Js)?e(n):(n.close(),await C_(),e(await vd()))})})}async function gc(t,e,r){const n=so(t,!0).put({[pd]:e,value:r});return new ds(n).toPromise()}async function R_(t,e){const r=so(t,!1).get(e),n=await new ds(r).toPromise();return n===void 0?null:n.value}function mc(t,e){const r=so(t,!0).delete(e);return new ds(r).toPromise()}const P_=800,x_=3;class _d{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=vd(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let r=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(r++>x_)throw n;if(this.dbPromise){const i=this.dbPromise;this.dbPromise=null;try{(await i).close()}catch{}}}}async initializeServiceWorkerMessaging(){return fd()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ao._getInstance(T_()),this.receiver._subscribe("keyChanged",async(e,r)=>({keyProcessed:(await this._poll()).includes(r.key)})),this.receiver._subscribe("ping",async(e,r)=>["keyChanged"])}async initializeSender(){var r,n;if(this.activeServiceWorker=await S_(),!this.activeServiceWorker)return;this.sender=new I_(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(r=e[0])!=null&&r.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||k_()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await gc(e,Ks,"1"),await mc(e,Ks)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,r){return this._withPendingWrite(async()=>(await this._withRetries(n=>gc(n,e,r)),this.localCache[e]=r,this.notifyServiceWorker(e)))}async _get(e){const r=await this._withRetries(n=>R_(n,e));return this.localCache[e]=r,r}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(r=>mc(r,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(i=>{const s=so(i,!1).getAll();return new ds(s).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const r=[],n=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)n.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),r.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!n.has(i)&&(this.notifyListeners(i,null),r.push(i));return r}catch(e){return this.isClosing||xs(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),P_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}_d.type="LOCAL";const N_=_d;new cs(3e4,6e4);/**
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
 */function gd(t,e){return e?Rn(e):(G(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Dl extends sd{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return ta(e,this._buildIdpRequest())}_linkToIdToken(e,r){return ta(e,this._buildIdpRequest(r))}_getReauthenticationResolver(e){return ta(e,this._buildIdpRequest())}_buildIdpRequest(e){const r={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(r.idToken=e),r}}function O_(t){return h_(t.auth,new Dl(t),t.bypassAuthState)}function D_(t){const{auth:e,user:r}=t;return G(r,e,"internal-error"),f_(r,new Dl(t),t.bypassAuthState)}async function L_(t){const{auth:e,user:r}=t;return G(r,e,"internal-error"),d_(r,new Dl(t),t.bypassAuthState)}/**
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
 */class md{constructor(e,r,n,i,s=!1){this.auth=e,this.resolver=n,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(r)?r:[r]}execute(){return new Promise(async(e,r)=>{this.pendingPromise={resolve:e,reject:r};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:r,sessionId:n,postBody:i,tenantId:s,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:r,sessionId:n,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(f){this.reject(f)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return O_;case"linkViaPopup":case"linkViaRedirect":return L_;case"reauthViaPopup":case"reauthViaRedirect":return D_;default:dn(this.auth,"internal-error")}}resolve(e){On(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){On(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const M_=new cs(2e3,1e4);async function U_(t,e,r){if(an(t.app))return Promise.reject(Wr(t,"operation-not-supported-in-this-environment"));const n=io(t);Nv(t,e,Nl);const i=gd(n,r);return new ki(n,"signInViaPopup",e,i).executeNotNull()}class ki extends md{constructor(e,r,n,i,s){super(e,r,i,s),this.provider=n,this.authWindow=null,this.pollId=null,ki.currentPopupAction&&ki.currentPopupAction.cancel(),ki.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return G(e,this.auth,"internal-error"),e}async onExecution(){On(this.filter.length===1,"Popup operations only handle one event");const e=Ol();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(r=>{this.reject(r)}),this.resolver._isIframeWebStorageSupported(this.auth,r=>{r||this.reject(Wr(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(Wr(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,ki.currentPopupAction=null}pollUserCancellation(){const e=()=>{var r,n;if((n=(r=this.authWindow)==null?void 0:r.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Wr(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,M_.get())};e()}}ki.currentPopupAction=null;/**
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
 */const F_="pendingRedirect",Ds=new Map;class $_ extends md{constructor(e,r,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],r,void 0,n),this.eventId=null}async execute(){let e=Ds.get(this.auth._key());if(!e){try{const n=await B_(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(r){e=()=>Promise.reject(r)}Ds.set(this.auth._key(),e)}return this.bypassAuthState||Ds.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const r=await this.auth._redirectUserForId(e.eventId);if(r)return this.user=r,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function B_(t,e){const r=z_(e),n=V_(t);if(!await n._isAvailable())return!1;const i=await n._get(r)==="true";return await n._remove(r),i}function H_(t,e){Ds.set(t._key(),e)}function V_(t){return Rn(t._redirectPersistence)}function z_(t){return Os(F_,t.config.apiKey,t.name)}async function W_(t,e,r=!1){if(an(t.app))return Promise.reject(Di(t));const n=io(t),i=gd(n,e),o=await new $_(n,i,r).execute();return o&&!r&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}/**
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
 */const j_=600*1e3;class q_{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let r=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(r=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!G_(e)||(this.hasHandledPotentialRedirect=!0,r||(this.queuedRedirectEvent=e,r=!0)),r}sendToConsumer(e,r){var n;if(e.error&&!bd(e)){const i=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";r.onError(Wr(this.auth,i))}else r.onAuthEvent(e)}isEventForConsumer(e,r){const n=r.eventId===null||!!e.eventId&&e.eventId===r.eventId;return r.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=j_&&this.cachedEventUids.clear(),this.cachedEventUids.has(bc(e))}saveEventToCache(e){this.cachedEventUids.add(bc(e)),this.lastProcessedEventTime=Date.now()}}function bc(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function bd({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function G_(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return bd(t);default:return!1}}/**
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
 */async function K_(t,e={}){return ya(t,"GET","/v1/projects",e)}/**
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
 */const J_=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Y_=/^https?/;async function X_(t){if(t.config.emulator)return;const{authorizedDomains:e}=await K_(t);for(const r of e)try{if(Q_(r))return}catch{}dn(t,"unauthorized-domain")}function Q_(t){const e=sl(),{protocol:r,hostname:n}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&n===""?r==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):r==="chrome-extension:"&&o.hostname===n}if(!Y_.test(r))return!1;if(J_.test(t))return n===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(n)}/**
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
 */const Z_=new cs(3e4,6e4);function wc(){const t=cn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let r=0;r<t.CP.length;r++)t.CP[r]=null}}function eg(t){return new Promise((e,r)=>{var i,s,o;function n(){wc(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{wc(),r(Wr(t,"network-request-failed"))},timeout:Z_.get()})}if((s=(i=cn().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=cn().gapi)!=null&&o.load)n();else{const c=a_("iframefcb");return cn()[c]=()=>{gapi.load?n():r(Wr(t,"network-request-failed"))},n_(`${i_()}?onload=${c}`).catch(u=>r(u))}}).catch(e=>{throw Ls=null,e})}let Ls=null;function tg(t){return Ls=Ls||eg(t),Ls}/**
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
 */const rg=new cs(5e3,15e3),ng="__/auth/iframe",ig="emulator/auth/iframe",ag={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},sg=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function og(t){const e=t.config;G(e.authDomain,t,"auth-domain-config-required");const r=e.emulator?Al(e,ig):`https://${t.config.authDomain}/${ng}`,n={apiKey:e.apiKey,appName:t.name,v:ls},i=sg.get(t.config.apiHost);i&&(n.eid=i);const s=t._getFrameworks();return s.length&&(n.fw=s.join(",")),`${r}?${os(n).slice(1)}`}async function lg(t){const e=await tg(t),r=cn().gapi;return G(r,t,"internal-error"),e.open({where:document.body,url:og(t),messageHandlersFilter:r.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:ag,dontclear:!0},n=>new Promise(async(i,s)=>{await n.restyle({setHideOnLeave:!1});const o=Wr(t,"network-request-failed"),c=cn().setTimeout(()=>{s(o)},rg.get());function u(){cn().clearTimeout(c),i(n)}n.ping(u).then(u,()=>{s(o)})}))}/**
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
 */const cg={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},ug=500,dg=600,fg="_blank",hg="http://localhost";class yc{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function pg(t,e,r,n=ug,i=dg){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let c="";const u={...cg,width:n.toString(),height:i.toString(),top:s,left:o},f=Vt().toLowerCase();r&&(c=Xu(f)?fg:r),Ju(f)&&(e=e||hg,u.scrollbars="yes");const v=Object.entries(u).reduce((w,[b,I])=>`${w}${b}=${I},`,"");if(Jv(f)&&c!=="_self")return vg(e||"",c),new yc(null);const g=window.open(e||"",c,v);G(g,t,"popup-blocked");try{g.focus()}catch{}return new yc(g)}function vg(t,e){const r=document.createElement("a");r.href=t,r.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),r.dispatchEvent(n)}/**
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
 */const _g="__/auth/handler",gg="emulator/auth/handler",mg=encodeURIComponent("fac");async function Ic(t,e,r,n,i,s){G(t.config.authDomain,t,"auth-domain-config-required"),G(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:r,redirectUrl:n,v:ls,eventId:i};if(e instanceof Nl){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",vp(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[v,g]of Object.entries({}))o[v]=g}if(e instanceof us){const v=e.getScopes().filter(g=>g!=="");v.length>0&&(o.scopes=v.join(","))}t.tenantId&&(o.tid=t.tenantId);const c=o;for(const v of Object.keys(c))c[v]===void 0&&delete c[v];const u=await t._getAppCheckToken(),f=u?`#${mg}=${encodeURIComponent(u)}`:"";return`${bg(t)}?${os(c).slice(1)}${f}`}function bg({config:t}){return t.emulator?Al(t,gg):`https://${t.authDomain}/${_g}`}/**
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
 */const Fo="webStorageSupport";class wg{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=dd,this._completeRedirectFn=W_,this._overrideRedirectResult=H_}async _openPopup(e,r,n,i){var o;On((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await Ic(e,r,n,sl(),i);return pg(e,s,Ol())}async _openRedirect(e,r,n,i){await this._originValidation(e);const s=await Ic(e,r,n,sl(),i);return E_(s),new Promise(()=>{})}_initialize(e){const r=e._key();if(this.eventManagers[r]){const{manager:i,promise:s}=this.eventManagers[r];return i?Promise.resolve(i):(On(s,"If manager is not set, promise should be"),s)}const n=this.initAndGetManager(e);return this.eventManagers[r]={promise:n},n.catch(()=>{delete this.eventManagers[r]}),n}async initAndGetManager(e){const r=await lg(e),n=new q_(e);return r.register("authEvent",i=>(G(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:n.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=r,n}_isIframeWebStorageSupported(e,r){this.iframes[e._key()].send(Fo,{type:Fo},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[Fo];s!==void 0&&r(!!s),dn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const r=e._key();return this.originValidationPromises[r]||(this.originValidationPromises[r]=X_(e)),this.originValidationPromises[r]}get _shouldInitProactively(){return rd()||Yu()||Pl()}}const yg=wg;var Ec="@firebase/auth",Sc="1.13.6";/**
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
 */class Ig{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const r=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,r),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const r=this.internalListeners.get(e);r&&(this.internalListeners.delete(e),r(),this.updateProactiveRefresh())}assertAuthConfigured(){G(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Eg(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Sg(t){Ka(new va("auth",(e,{options:r})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=n.options;G(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const u={apiKey:o,authDomain:c,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:nd(t)},f=new t_(n,i,s,u);return o_(f,r),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,r,n)=>{e.getProvider("auth-internal").initialize()})),Ka(new va("auth-internal",e=>{const r=io(e.getProvider("auth").getImmediate());return(n=>new Ig(n))(r)},"PRIVATE").setInstantiationMode("EXPLICIT")),Zi(Ec,Sc,Eg(t)),Zi(Ec,Sc,"esm2020")}/**
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
 */const kg=300,Tg=Du("authIdTokenMaxAge")||kg;let kc=null;const Ag=t=>async e=>{const r=e&&await e.getIdTokenResult(),n=r&&(new Date().getTime()-Date.parse(r.issuedAtTime))/1e3;if(n&&n>Tg)return;const i=r==null?void 0:r.token;kc!==i&&(kc=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function Cg(t=mv()){const e=Fu(t,"auth");if(e.isInitialized())return e.getImmediate();const r=s_(t,{popupRedirectResolver:yg,persistence:[N_,w_,dd]}),n=Du("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(n,location.origin);if(location.origin===s.origin){const o=Ag(s.toString());v_(r,o,()=>o(r.currentUser)),p_(r,c=>o(c))}}const i=ip("auth");return i&&id(r,`http://${i}`),r}function Rg(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}r_({loadJS(t){return new Promise((e,r)=>{const n=document.createElement("script");n.setAttribute("src",t),n.onload=e,n.onerror=i=>{const s=Wr("internal-error");s.customData=i,r(s)},n.type="text/javascript",n.charset="UTF-8",Rg().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Sg("Browser");function Pg(t){var n,i,s,o;if(!((n=t.firebase)!=null&&n.apiKey)||!((i=t.firebase)!=null&&i.projectId)||!((s=t.firebase)!=null&&s.authDomain)||!((o=t.firebase)!=null&&o.appId))throw new Error("Google sign-in is not configured. Contact your studio operator.");const e=Cg($u(t.firebase,"liquidity-studio"));if(t.emulator){const c=new URL(t.emulator.url),u=f=>["localhost","127.0.0.1","[::1]"].includes(f);if(!u(location.hostname)||!u(c.hostname)||c.protocol!=="http:")throw new Error("Authentication emulator is restricted to local development.");id(e,c.origin)}const r=new Sn;return r.setCustomParameters({prompt:"select_account"}),{watch:c=>__(e,c),login:()=>U_(e,r),logout:()=>g_(e),getToken:async()=>{if(!e.currentUser)throw new Error("Sign in with Google to continue.");return e.currentUser.getIdToken()}}}var xg=A('<meta name="description" content="Private editorial workspace for brand campaigns, measured previews and source review."/>'),Ng=A('<main class="login-shell"><p role="status">Connecting to your studio…</p></main>'),Og=A('<button class="primary"> </button>'),Dg=A('<form><label>Username<input name="username" autocomplete="username" required=""/></label><label>Password<input name="password" type="password" autocomplete="current-password" required=""/></label><button class="primary"> </button></form>'),Lg=A('<p class="error" role="alert"> </p>'),Mg=A(`<main class="login-shell"><div class="login-card"><span class="wordmark">◈ LIQUIDITY STUDIO</span> <h1>Good work starts<br/>with a clear view.</h1> <p>Sign in to your private brand workspace.</p> <!> <!> <p class="small muted">Accounts are provisioned by your studio operator. No public
        registration.</p></div> <div class="login-art"><span class="eyebrow">YOUR EDITORIAL WORKSPACE</span> <h2>From a good story.<br/>To a considered campaign.</h2> <div class="login-cards"><span>SOURCE</span><span>SHAPE</span><span>PREVIEW</span></div> <p>One place to edit, inspect and export.<br/>Every brand keeps its own
        context.</p></div></main>`),mi=A("<option> </option>"),Ug=A('<button><span aria-hidden="true"> </span> </button>'),Fg=A('<button><span aria-hidden="true">⌘</span>Operations</button>'),$g=A('<div class="error banner" role="alert"> <button aria-label="Dismiss error">×</button></div>'),Bg=A('<div class="notice banner" role="status"> <button aria-label="Dismiss notice">×</button></div>'),Hg=A('<article class="story-row"><div class="story-day"><b> </b><span> </span></div> <div class="story-copy"><span class="eyebrow"> </span> <h3> </h3> <p> </p> <span class="status-tag"> </span></div> <button class="secondary"> </button></article>'),Vg=A('<div class="empty"><h3>No stories here yet.</h3> <p>Add supplied facts below. The studio will not invent them.</p></div>'),zg=A(`<div class="section-line"><div><h2>Story backlog <span class="count"> </span></h2> <p class="muted">Opening a saved story keeps your edits.</p></div> <div class="filters"><input aria-label="Search stories" placeholder="Search stories…"/><select aria-label="Filter by status"><option>All</option><!></select></div></div> <div class="story-list"></div> <details class="panel add-story"><summary>Add a story</summary> <form class="form-grid"><label class="full">Story title<input required=""/></label><label>Category<input/></label><label>Calendar day<select></select></label><label class="full">Supplied facts, one per line<textarea rows="4" required="" placeholder="Add the specific facts you want the draft to use."></textarea></label><label class="full">Source links, one per line<textarea rows="2" placeholder="https://…"></textarea></label> <p class="small muted full">Facts are editorial inputs, not independently verified claims.
              Clinical claims require source review.</p> <button class="primary">Add to backlog</button></form></details>`,1),Wg=A('<button class="calendar-story"><span class="eyebrow"> </span><b> </b><span class="status-tag"> </span></button>'),jg=A('<p class="muted small">Room for a story</p>'),qg=A('<section class="day-column"><h3> </h3> <!></section>'),Gg=A('<div class="section-line"><h2>Weekly editorial calendar</h2> <span class="muted small">Assignments only · no automatic publishing</span></div> <div class="calendar-grid"></div>',1),Kg=A('<p class="download"><a> </a><small>Actual exported artifact · scope authorization required</small></p>'),Jg=A("<button> <small> </small></button>"),Yg=A('<label> <textarea rows="3"></textarea></label>'),Xg=A('<label>Headline<textarea aria-label="Headline" rows="3"></textarea></label> <!> <label>Takeaway<textarea rows="3"></textarea></label> <label>Caption<textarea aria-label="Caption" rows="4"></textarea></label>',1),Qg=A('<fieldset><legend></legend><label>Title<input/></label><label>Source detail<textarea rows="3"></textarea></label><label>Visual direction<input/></label></fieldset>'),Zg=A("<label>Cover hook<input/></label> <!>",1),em=A('<label>Story hook<textarea rows="3"></textarea></label><label>Source highlight<textarea rows="4"></textarea></label><label>Poll question<input aria-label="Poll question"/></label>',1),tm=A("<label> <textarea></textarea></label>"),rm=A("<fieldset><legend></legend><!></fieldset>"),nm=A('<label>Spoken hook<textarea rows="3"></textarea></label><!><label>Closing call to action<input/></label>',1),im=A(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and
                            want to record my review.</label>`),am=A(`<p class="small muted">A founder clinical source review is required before
                            generation.</p>`),sm=A(`<p class="small error">Clinical review must be recorded by an authorized
                          reviewer.</p>`),om=A('<fieldset><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label><!></fieldset>'),lm=A('<p class="small error"> </p>'),cm=A(`<p class="small muted">Preflight recorded for this brand. Editorial review
                    required.</p>`),um=A(`<div class="studio-grid"><section class="editor-panel"><div class="panel-heading"><h3>Make it yours.</h3> <span class="status-tag"> </span></div> <p class="small muted">Edit the wording, then save to update your preview and
                  exported artwork.</p> <div class="field-editor"><!></div> <details class="advanced-editor"><summary>Advanced format JSON</summary><label>Format content<textarea class="json-editor" aria-label="Format content" spellcheck="false"></textarea></label></details> <button class="primary">Save changes</button> <div class="schedule-box"><label>Assigned day<select aria-label="Assigned day"></select></label><button class="secondary">Assign to calendar</button> <p class="small muted">Assigning a day does not publish or export.</p></div> <details class="sources"><summary>Review source claims</summary> <p class="small muted">Approve a claim only after reviewing its linked source and
                    meaning. Clinical claims require a separate clinical review.</p> <!><button class="secondary">Add source claim</button><button class="secondary">Save source review</button></details> <!></section> <!></div>`),dm=A(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and want
                          to record my review.</label>`),fm=A(`<p class="small muted">A founder clinical source review is required before
                          generation.</p>`),hm=A('<fieldset><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label></fieldset>'),pm=A(`<section class="panel"><h3>Review sources before generation</h3> <p class="muted">Add a source link to each claim and choose its review status.
                Unreviewed claims cannot enter a campaign.</p> <div class="field-editor"></div> <button class="secondary">Add source claim</button> <button class="secondary">Save source review</button></section> <div class="empty"><span class="empty-symbol">◧</span> <h2>A story ready to take shape.</h2> <p>Generate a draft from the supplied facts, then review every
                format.</p> <button class="primary"> </button></div>`,1),vm=A('<div class="studio-toolbar"><div><span class="eyebrow">ACTIVE STORY</span> <h2> </h2> <span class="provenance"> </span></div> <div class="toolbar-actions"><button class="secondary"> </button><button class="primary"> </button></div></div> <!> <div class="format-tabs" aria-label="Campaign format"></div> <!>',1),_m=A('<div class="empty"><h2>Choose a story to begin.</h2> <p>Every campaign starts with supplied facts and a source review.</p> <button class="primary">Open story backlog</button></div>'),gm=A('<label> <div><input type="color"/><input/></div></label>'),mm=A('<p class="small muted"> </p> <p> </p>',1),bm=A('<article class="panel" style="margin-bottom:12px"><h3> </h3> <!></article>'),wm=A('<p class="muted">Audience groups need owner review.</p>'),ym=A("<li><p> </p></li>"),Im=A('<li class="muted">Editorial pillars need owner review.</li>'),Em=A(`<p class="small error">Clinical claims remain quarantined until explicit source and
                clinical review are recorded.</p>`),Sm=A(`<section class="panel" style="margin-top:24px" aria-label="Brand positioning reference"><span class="eyebrow">OWNER POSITIONING · READ-ONLY REFERENCE</span> <h2>Proposed editorial positioning</h2> <p class="muted">These audiences and pillars describe editorial intent. They are
              not verified factual or clinical claims. Source review is required
              for every campaign.</p> <span class="status-tag"> </span> <div class="admin-grid" style="margin-top:24px"><section><h3>Audience value groups</h3> <!></section> <section><h3>Editorial pillars</h3> <ol></ol></section></div> <!></section>`),km=A('<article class="story-row"><div class="story-copy"><h3> </h3> <span class="status-tag"> </span></div> <button class="secondary">Review sources</button></article>'),Tm=A('<p class="small muted">No research prompts in this brand.</p>'),Am=A(`<form class="panel brand-form form-grid"><label>Brand name<input required=""/></label><label>Website<input/></label><label class="full">Tagline<input/></label><label class="full">Editorial mission<textarea rows="4"></textarea></label><label>Wordmark / monogram<input/></label><label>Heading font<select aria-label="Heading font"></select></label><label>Body font<select aria-label="Body font"></select></label> <div class="full color-list"></div> <button class="primary">Save Brand Kit</button></form> <!> <section class="panel" style="margin-top:24px" aria-label="Unreviewed research topics"><h2>Research queue · unreviewed</h2> <p class="muted">Research prompts are starting points, not approved claims. Open a
            topic to add sourced claims for review.</p> <!></section>`,1),Cm=A('<button class="secondary"> </button>'),Rm=A('<li><strong> </strong> <p class="small muted"> </p> <!></li>'),Pm=A('<li class="muted">No batch attempts for this brand.</li>'),xm=A("<tr><td> </td><td> </td><td> </td><td> </td></tr>"),Nm=A('<tr><td colspan="4">No generation traces for this brand.</td></tr>'),Om=A(`<div class="admin-grid"><section class="panel"><div class="panel-heading"><h2>Health & readiness</h2> <button class="secondary">Refresh</button></div> <p class="muted">Repository readiness does not establish provider connectivity.</p> <div class="ops-metrics"><div><b> </b><span>Service readiness</span></div> <div><b> </b><span>Repository check</span></div> <div><b> </b><span>Generation provider</span></div></div> <details><summary>Readiness details</summary> <pre> </pre></details></section> <section class="panel"><h2>Scoped operations</h2> <button class="secondary">Run this brand’s batch</button> <p><a>Download scoped feedback JSONL</a></p> <p class="small muted">Jobs use this organization and brand. Export is separate from
              publishing.</p> <h3>Recent batch attempts</h3> <ul aria-label="Recent batch attempts"></ul></section> <section class="panel"><h2>Organization management</h2> <form><label>New organization name<input required=""/></label><button class="secondary">Create organization</button></form> <form><label> <input required=""/></label><label>Brand preset<select aria-label="Brand preset"><option>The Liquidity Desk</option><option>Chai With Jai</option></select></label><button class="secondary">Create brand</button></form></section> <section class="panel"><h2>Telemetry & generation</h2> <div class="ops-metrics"><div><b> </b><span>Recent generation traces</span></div> <div><b> </b><span>Recorded usage events</span></div> <div><b> </b><span>Recent operational events</span></div></div> <p class="small muted">Usage records describe operations; they are not customer invoices
              or proof of factual accuracy.</p> <div class="trace-table"><table><thead><tr><th>Status</th><th>Provider</th><th>Model</th><th>Duration</th></tr></thead><tbody></tbody></table></div> <details><summary>Operational data</summary> <pre> </pre></details></section> <details class="panel"><summary>Architecture reference</summary> <pre> </pre></details></div>`),Dm=A('<div class="app-shell"><aside class="sidebar"><a href="/" class="wordmark">◈<span>LIQUIDITY<br/>STUDIO</span></a> <div class="scope-selectors"><label>Organization<select aria-label="Organization"></select></label><label>Brand<select aria-label="Brand"></select></label></div> <nav aria-label="Main navigation"><!><!></nav> <div class="sidebar-bottom"><span class="avatar"> </span> <div><b> </b><small> </small></div> <button aria-label="Sign out">↪</button></div></aside> <main class="workspace"><header class="workspace-header"><div><span class="eyebrow"> </span> <h1> </h1> <p> </p></div> <span class="private-badge">● Private workspace</span></header> <!><!> <!></main></div>');function Lm(t,e){ul(e,!0);const r=["Mona Sans","Inter","Instrument Serif","DejaVu Sans"];function n(_){const m=typeof _=="string"?_.split("/")[0].trim():"";return r.includes(m)?m:"DejaVu Sans"}const i=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],s=[{id:"infographic",name:"Feed post",ratio:"4:5"},{id:"carousel",name:"Carousel",ratio:"4 slides"},{id:"story",name:"Story",ratio:"9:16"},{id:"reel",name:"Reel",ratio:"30s script"}];let o=O("unavailable"),c,u=0,f=0,v,g=O(null),w=O(vr([])),b=O(""),I=O(""),R=O(vr({})),S=O(""),x=O(""),q=O(!0),M=O(!1),N=O(""),V=O(""),Y=O("backlog"),D=O(null),ne=O(vr([])),B=O(vr([])),U=O(null),he=O(null),de=O("infographic"),Ot=O("Monday"),ot=O(""),lt=O("All"),ct=O(""),Ae=O(vr({})),Ce=O(!1),Ze=O(""),kt=O(""),Qt=O(""),le=O(vr([])),Tr=O("Editorial"),Ln=O("Monday"),fn=O(""),$i=O(""),ai=O("liquidity_desk"),_r=O(null),Ia=O(null),hn=O(null),Ar=O(null),zt=O(""),si=O(""),et=0,Ea=0,oi=Bt(()=>a(w).find(_=>_.id===a(b))),fs=Bt(()=>{var _,m;return(m=(_=a(oi))==null?void 0:_.brands)==null?void 0:m.find(C=>C.id===a(I))}),Sa=Bt(()=>a(ne).filter(_=>(!a(ot)||(_.title+" "+_.category).toLowerCase().includes(a(ot).toLowerCase()))&&(a(lt)==="All"||_.status===a(lt)))),ka=Bt(()=>{var _,m,C,L;return((m=(_=a(he))==null?void 0:_.provenance)==null?void 0:m.mode)==="synthetic"?"Synthetic draft · source review required":((L=(C=a(he))==null?void 0:C.provenance)==null?void 0:L.mode)==="provider"?"Provider draft · source review required":"Source provenance unverified · review required"}),Mn=Bt(()=>{var _,m;return((_=a(R))==null?void 0:_.admin)===!0||((m=a(g))==null?void 0:m.role)==="founder"});function Bi(){return new URLSearchParams({organizationId:a(b),brandId:a(I)}).toString()}async function qr(_,m={},C=!0){const L=et,Q=a(o)==="google"?{Authorization:`Bearer ${await c.getToken()}`}:{},me=await fetch(_+(C?(_.includes("?")?"&":"?")+Bi():""),{...m,credentials:"same-origin",headers:{...m.body?{"Content-Type":"application/json"}:{},...m.headers,...Q}}),Re=await me.json().catch(()=>({}));if(!me.ok)throw me.status===401&&Vi(),new Error(Re.error||Re.message||`Request failed (${me.status})`);if(C&&L!==et)throw new Error("Workspace changed while the request was running; retry in the current brand");return Re}function Tt(_,m={},C=!0){return qr(_,{method:"POST",body:JSON.stringify(m)},C)}function Hi(_){var m,C,L,Q,me,Re;d(g,_.user,!0),d(w,_.organizations||[],!0),d(R,_.permissions||{},!0),d(b,((m=_.activeScope)==null?void 0:m.organizationId)||((C=a(w)[0])==null?void 0:C.id)||"",!0),d(I,((L=_.activeScope)==null?void 0:L.brandId)||((Re=(me=(Q=a(w).find(rt=>rt.id===a(b)))==null?void 0:Q.brands)==null?void 0:me[0])==null?void 0:Re.id)||"",!0)}function li(){f++,clearTimeout(v),v=void 0}function Vi(){et++,d(g,null),d(w,[],!0),d(R,{},!0),d(b,""),d(I,""),d(ne,[],!0),d(B,[],!0),d(U,null),d(he,null),d(D,null),d(_r,null),d(Ar,null),d(zt,""),d(Ce,!1)}Cu(()=>{let _=!1,m;async function C(){try{const L=await fetch("/api/auth/config");if(!L.ok)throw new Error("Could not load sign-in configuration.");const Q=await L.json();if(_)return;if(!["google","password"].includes(Q.mode))throw new Error("Unsupported sign-in configuration.");if(d(o,Q.mode,!0),a(o)==="google")c=Pg(Q),m=c.watch(async me=>{li();const Re=++u;Vi(),d(q,!0);try{if(me){const rt=await qr("/api/auth/session",{},!1);if(_||Re!==u)return;Hi(rt),a(I)&&await pn()}}catch(rt){!_&&Re===u&&(Vi(),d(N,`Google sign-in could not open this workspace: ${rt.message}. Check your invited account or contact the studio operator.`))}finally{!_&&Re===u&&(d(q,!1),d(M,!1))}});else{const me=await fetch("/api/auth/session",{credentials:"same-origin"});me.ok&&!_&&(Hi(await me.json()),a(I)&&await pn()),_||d(q,!1)}}catch(L){_||(d(N,L.message,!0),d(q,!1))}}return C(),()=>{_=!0,u++,li(),m==null||m()}});async function hs(){if(a(M)||!c)return;li();const _=f;d(M,!0),d(N,"");const m=setTimeout(()=>{_===f&&(li(),d(M,!1),d(N,"Google sign-in has not completed. Finish the Google popup or try again."))},9e4);v=m;try{await c.login()}catch(C){if(_!==f)return;d(N,C.code==="auth/popup-closed-by-user"?"Google sign-in was closed. Select Continue with Google to try again.":C.code==="auth/popup-blocked"?"Allow the Google sign-in popup, then try again.":C.message||"Google sign-in failed. Try again.",!0)}finally{clearTimeout(m),_===f&&(v=void 0,d(M,!1))}}async function oo(_){_.preventDefault(),d(M,!0),d(N,"");try{const m=await Tt("/api/auth/login",{username:a(S),password:a(x)},!1);d(x,""),Hi(m),await pn()}catch(m){d(N,m.message,!0)}finally{d(M,!1)}}async function lo(){try{a(o)==="google"?await c.logout():await Tt("/api/auth/logout",{},!1),u++,li(),Vi(),d(q,!1)}catch(_){d(N,_.message,!0)}}async function co(_){if(a(o)==="google"){_.preventDefault();try{const m=await fetch(a(zt),{headers:{Authorization:`Bearer ${await c.getToken()}`}});if(!m.ok)throw new Error(`Download failed (${m.status}). Sign in again if access expired.`);const C=URL.createObjectURL(await m.blob()),L=document.createElement("a");L.href=C,L.download=a(si),L.click(),setTimeout(()=>URL.revokeObjectURL(C),1e3)}catch(m){d(N,m.message,!0)}}}async function pn(){var m,C;const _=++et;d(N,""),d(M,!0),d(U,null),d(he,null),d(_r,null),d(Ar,null),d(zt,""),d(Ce,!1);try{const L=await qr("/api/studio/bootstrap");if(_!==et)return;d(D,L.brandProfile,!0),a(D)&&((m=a(D)).fonts||(m.fonts={heading:"DejaVu Sans",body:"DejaVu Sans"}),a(D).fonts.heading=n(a(D).fonts.heading),a(D).fonts.body=n(a(D).fonts.body),(C=a(D)).colors||(C.colors=[])),d(ne,L.backlog||[],!0),d(B,L.calendar||[],!0),L.organizations&&d(w,L.organizations,!0),L.permissions&&d(R,L.permissions,!0),a(ne).length&&Aa(a(ne)[0])}catch(L){_===et&&(d(N,L.message,!0),d(ne,[],!0),d(B,[],!0),d(D,null))}finally{_===et&&d(M,!1)}}async function Ta(_){var m,C,L;a(Ce)&&!await vn()||(d(b,_.currentTarget.value,!0),d(I,((L=(C=(m=a(w).find(Q=>Q.id===a(b)))==null?void 0:m.brands)==null?void 0:C[0])==null?void 0:L.id)||"",!0),d(Y,"backlog"),await pn())}async function ps(_){a(Ce)&&!await vn()||(d(I,_.currentTarget.value,!0),d(Y,"backlog"),await pn())}function Aa(_){var m;d(U,_,!0),d(he,(_==null?void 0:_.campaignDraft)||null,!0),d(Ot,(_==null?void 0:_.scheduledDay)||"Monday",!0),d(le,((_==null?void 0:_.sourceClaims)||((m=_==null?void 0:_.verifiedFacts)==null?void 0:m.map((C,L)=>({id:`claim_${L}`,text:C,sourceUrl:"",status:"unreviewed"})))||[]).map(C=>({...C})),!0),d(zt,""),d(Ar,null),zi()}function zi(){var _,m;d(Ae,(_=a(he))!=null&&_[a(de)]?JSON.parse(JSON.stringify(a(he)[a(de)])):{},!0),d(ct,(m=a(he))!=null&&m[a(de)]?JSON.stringify(a(Ae),null,2):"",!0),d(Ce,!1)}function Cr(_,m){a(Ae)[_]=m,d(ct,JSON.stringify(a(Ae),null,2),!0),d(Ce,!0)}function Un(_,m,C,L){C?a(Ae)[_][m][C]=L:a(Ae)[_][m]=L,d(ct,JSON.stringify(a(Ae),null,2),!0),d(Ce,!0)}async function Ca(_){a(Ce)&&!await vn()||(Aa(_),d(Y,"studio"))}async function uo(_){a(Ce)&&!await vn()||(d(de,_,!0),d(zt,""),zi())}async function Ra(){var C,L;if(!a(U)||a(M)||a(Ce)&&!await vn())return;d(M,!0),d(N,"");const _=et,m=a(U).id;try{const Q=await Tt("/api/studio/generate-campaign",{storyId:m});if(_!==et||((C=a(U))==null?void 0:C.id)!==m)return;d(he,Q.campaign,!0),d(U,((L=Q.backlog)==null?void 0:L.find(me=>me.id===m))||Q.story,!0),d(ne,Q.backlog||a(ne),!0),d(B,Q.calendar||a(B),!0),zi(),d(V,"Draft generated. Review the sources before export.")}catch(Q){_===et&&d(N,`Generation failed: ${Q.message}. Your existing draft is preserved.`)}finally{_===et&&d(M,!1)}}async function vn(){if(!a(he)||!a(U)||!a(Ce))return!0;d(N,"");try{const _=a(ct),m=JSON.parse(_);if(!m||typeof m!="object"||Array.isArray(m))throw new Error("Format content must be a JSON object");const C=await Tt("/api/studio/save-edit",{storyId:a(U).id,format:a(de),content:m,expectedRevision:a(U).revision});C.story?d(U,C.story,!0):C.revision!==void 0&&(a(U).revision=C.revision),a(he)[a(de)]=m,a(U).campaignDraft=a(he);const L=a(ne).find(Q=>Q.id===a(U).id);return L&&(L.campaignDraft=a(he)),d(Ce,a(ct)!==_),d(V,a(Ce)?"Saved the submitted edit. Newer changes remain unsaved.":"Changes saved.",!0),!a(Ce)}catch(_){return d(N,`Could not save: ${_.message}. Your editor text is still here.`),!1}}async function fo(){if(a(U))try{const _=await Tt("/api/studio/schedule",{storyId:a(U).id,status:"Scheduled",scheduledDay:a(Ot)});d(U,_.story||{...a(U),scheduledDay:a(Ot),status:"Scheduled"},!0),d(ne,_.backlog||a(ne),!0),d(B,_.calendar||a(B),!0),d(V,`Assigned to ${a(Ot)}. This does not publish to Instagram.`)}catch(_){d(N,_.message,!0)}}async function ho(){var _,m;if(!(!await vn()||!a(U)||!a(he))){d(M,!0),d(N,""),d(zt,"");try{const C=await Tt("/api/studio/export-asset",{storyId:a(U).id,format:a(de),content:a(he)[a(de)]});if(d(zt,C.downloadUrl||((_=C.artifact)==null?void 0:_.downloadUrl)||"",!0),d(si,C.filename||((m=C.artifact)==null?void 0:m.filename)||"Download export",!0),!a(zt))throw new Error("Server did not return a downloadable artifact");d(ne,C.backlog||a(ne),!0),d(B,C.calendar||a(B),!0),d(U,a(ne).find(L=>L.id===a(U).id)||a(U),!0),d(V,"Export created. Download the actual file below.")}catch(C){d(N,`Export failed: ${C.message}`)}finally{d(M,!1)}}}function vs(){d(le,[...a(le),{id:crypto.randomUUID(),text:"",sourceUrl:"",kind:"",status:"unreviewed"}],!0)}function Pa(_){d(le,a(le).filter(m=>m.id!==_),!0)}async function _s(){if(a(U)){if(!a(le).length){d(N,"Add at least one sourced claim before saving the review.");return}d(N,"");try{const _=await Tt("/api/studio/source-claims",{storyId:a(U).id,sourceClaims:a(le),expectedRevision:a(U).revision});if(_.story){d(U,_.story,!0);const m=a(ne).findIndex(C=>C.id===a(U).id);m>=0&&(a(ne)[m]=a(U))}d(V,"Source review saved. Only approved sourced claims can enter generation.")}catch(_){d(N,_.message,!0)}}}async function po(_){_.preventDefault();try{const C=Object.fromEntries(["brandName","websiteUrl","tagline","mission","fonts","colors","logoText","strategy","valueGroups","pillars"].filter(Q=>a(D)[Q]!==void 0).map(Q=>[Q,a(D)[Q]]));C.fonts={heading:n(a(D).fonts.heading),body:n(a(D).fonts.body)};const L=await Tt("/api/studio/brand-profile",C);d(D,L.brandProfile||a(D),!0),d(V,"Brand profile saved for this brand.")}catch(m){d(N,m.message,!0)}}async function vo(_){_.preventDefault();const m=a(kt).split(`
`).map(C=>C.trim()).filter(Boolean);if(!m.length){d(N,"Add at least one supplied fact. The studio will not invent source facts.");return}try{const C=await Tt("/api/studio/backlog",{title:a(Ze),category:a(Tr),scheduledDay:a(Ln),verifiedFacts:m,sourceClaims:m.map((L,Q)=>{var me;return{id:`claim_${Q}`,text:L,sourceUrl:((me=a(Qt).split(`
`)[Q])==null?void 0:me.trim())||"",status:"unreviewed"}}),sourceUrls:a(Qt).split(`
`).filter(Boolean),sourceStatus:"unreviewed"});d(ne,C.backlog||[C.story,...a(ne)],!0),d(B,C.calendar||a(B),!0),d(Ze,""),d(kt,""),d(Qt,""),d(V,"Story added. Supplied facts still need source review.")}catch(C){d(N,C.message,!0)}}async function Wi(){d(Y,"admin"),d(N,"");try{await(async _=>{var m=Ld(_,3);d(_r,m[0],!0),d(Ia,m[1],!0),d(hn,m[2],!0)})(await Promise.all([qr("/api/admin/overview"),qr("/api/admin/context-graph"),fetch("/readyz").then(_=>_.json())]))}catch(_){d(N,_.message,!0)}}async function T(_){_.preventDefault();try{await Tt("/api/admin/organizations",{name:a(fn)});const m=await qr("/api/auth/session",{},!1);d(w,m.organizations||a(w),!0),d(fn,""),d(V,"Organization created.")}catch(m){d(N,m.message,!0)}}async function K(_){_.preventDefault();try{await Tt("/api/admin/brands",{organizationId:a(b),name:a($i),preset:a(ai)});const m=await qr("/api/auth/session",{},!1);d(w,m.organizations||a(w),!0),d($i,""),d(V,"Brand created.")}catch(m){d(N,m.message,!0)}}async function $e(_=null){const m=et;d(M,!0),d(N,"");try{if(await Tt("/api/admin/run-weekly-batch",{idempotencyKey:crypto.randomUUID(),maxStories:5,..._?{retryOfJobId:_}:{}}),m!==et)return;await pn(),await Wi(),d(V,_?"Retry completed. Previously completed drafts were preserved.":"Scoped batch completed. Review every generated draft.",!0)}catch(C){if(m!==et)return;await Wi(),d(N,C.message,!0)}finally{d(M,!1)}}async function tt(_){if(!a(U)||!a(g))return;const m=++Ea,C=et;try{const L=await Tt("/api/studio/preflight",{storyId:a(U).id,expectedRevision:a(U).revision,..._});m===Ea&&C===et&&d(Ar,L,!0)}catch(L){C===et&&d(Ar,{error:L.message},!0)}}var gt=ys();sh("1n46o8q",_=>{var m=xg();wl(()=>{nu.title="Liquidity Studio · Brand workspace"}),k(_,m)});var We=Je(gt);{var Dt=_=>{var m=Ng();k(_,m)},Lt=_=>{var m=Mg(),C=h(m),L=l(h(C),6);{var Q=nt=>{var Ee=Og(),Ke=E(Ee,!0);$(()=>{Ee.disabled=a(M),y(Ke,a(M)?"Signing in…":"Continue with Google")}),P("click",Ee,hs),k(nt,Ee)},me=nt=>{var Ee=Dg(),Ke=h(Ee),At=l(h(Ke)),gr=l(Ke),Fn=l(h(gr)),$n=l(gr),ci=E($n,!0);$(()=>{$n.disabled=a(M),y(ci,a(M)?"Signing in…":"Sign in →")}),yi("submit",Ee,oo),ze(At,()=>a(S),pt=>d(S,pt)),ze(Fn,()=>a(x),pt=>d(x,pt)),k(nt,Ee)};ce(L,nt=>{a(o)==="google"?nt(Q):a(o)==="password"&&nt(me,1)})}var Re=l(L,2);{var rt=nt=>{var Ee=Lg(),Ke=E(Ee,!0);$(()=>y(Ke,a(N))),k(nt,Ee)};ce(Re,nt=>{a(N)&&nt(rt)})}k(_,m)},Zt=_=>{var m=Dm(),C=h(m),L=h(C),Q=l(L,2),me=h(Q),Re=l(h(me));Ne(Re,21,()=>a(w),H=>H.id,(H,se)=>{var ie=mi(),we=E(ie,!0),De={};$(()=>{y(we,a(se).name),De!==(De=a(se).id)&&(ie.value=(ie.__value=De)??"")}),k(H,ie)});var rt;or(Re);var nt=l(me),Ee=l(h(nt));Ne(Ee,21,()=>{var H;return((H=a(oi))==null?void 0:H.brands)||[]},H=>H.id,(H,se)=>{var ie=mi(),we=E(ie,!0),De={};$(()=>{y(we,a(se).name),De!==(De=a(se).id)&&(ie.value=(ie.__value=De)??"")}),k(H,ie)});var Ke;or(Ee);var At=l(Q,2),gr=h(At);Ne(gr,16,()=>[{id:"backlog",label:"Story backlog",icon:"▤"},{id:"calendar",label:"Content calendar",icon:"▦"},{id:"studio",label:"Campaign Studio",icon:"◧"},{id:"brand",label:"Brand Kit",icon:"◉"}],H=>H.id,(H,se)=>{var ie=Ug();let we;var De=h(ie),Be=E(De,!0),ut=l(De,1,!0);$(()=>{we=lr(ie,1,"",null,we,{active:a(Y)===se.id}),y(Be,se.icon),y(ut,se.label)}),P("click",ie,()=>d(Y,se.id,!0)),k(H,ie)});var Fn=l(gr);{var $n=H=>{var se=Fg();let ie;$(()=>ie=lr(se,1,"",null,ie,{active:a(Y)==="admin"})),P("click",se,Wi),k(H,se)};ce(Fn,H=>{a(Mn)&&H($n)})}var ci=l(At,2),pt=h(ci),Bn=E(pt,!0),W=l(pt,2),ye=h(W),Oe=E(ye,!0),je=l(ye),qe=E(je,!0),Xe=l(W,2),Wt=l(C,2),it=h(Wt),er=h(it),Mt=h(er),Hn=E(Mt),Gr=l(Mt,2),Vn=E(Gr,!0),_n=l(Gr,2),zn=E(_n,!0),Kr=l(it,2);{var Rr=H=>{var se=$g(),ie=h(se),we=l(ie);$(()=>y(ie,a(N))),P("click",we,()=>d(N,"")),k(H,se)};ce(Kr,H=>{a(N)&&H(Rr)})}var mr=l(Kr);{var ui=H=>{var se=Bg(),ie=h(se),we=l(ie);$(()=>y(ie,a(V))),P("click",we,()=>d(V,"")),k(H,se)};ce(mr,H=>{a(V)&&H(ui)})}var mt=l(mr,2);{var tr=H=>{var se=zg(),ie=Je(se),we=h(ie),De=h(we),Be=l(h(De)),ut=E(Be,!0),Ct=l(we,2),Pr=h(Ct),at=l(Pr),jt=l(h(at));Ne(jt,16,()=>[...new Set(a(ne).map(F=>F.status))],F=>F,(F,Z)=>{var X=mi(),Le=E(X,!0),ke={};$(()=>{y(Le,Z),ke!==(ke=Z)&&(X.__value=ke)}),k(F,X)}),or(at);var rr=l(ie,2);Ne(rr,21,()=>a(Sa),F=>F.id,(F,Z)=>{var X=Hg(),Le=h(X),ke=h(Le),bt=E(ke,!0),vt=l(ke),Dr=E(vt,!0),br=l(Le,2),Ie=h(br),pe=E(Ie,!0),wt=l(Ie,2),Ut=E(wt,!0),Gt=l(wt,2),Qr=E(Gt,!0),Kt=l(Gt,2),nr=E(Kt,!0),ir=l(br,2),wr=E(ir);$(ar=>{var Lr;y(bt,ar),y(Dr,a(Z).campaignDraft?"DRAFT":"SOURCE"),y(pe,a(Z).category),y(Ut,a(Z).title),y(Qr,((Lr=a(Z).verifiedFacts)==null?void 0:Lr[0])||"Add source facts before generating."),y(nr,a(Z).status),y(wr,`${a(Z).campaignDraft?"Open draft":"Open story"} ↗`)},[()=>{var ar;return((ar=a(Z).scheduledDay)==null?void 0:ar.slice(0,3))||"—"}]),P("click",ir,()=>Ca(a(Z))),k(F,X)},F=>{var Z=Vg();k(F,Z)});var Jr=l(rr,2),xr=l(h(Jr),2),Rt=h(xr),Yr=l(h(Rt)),qt=l(Rt),mn=l(h(qt)),Nr=l(qt),Or=l(h(Nr));Ne(Or,20,()=>i,F=>F,(F,Z)=>{var X=mi(),Le=E(X,!0),ke={};$(()=>{y(Le,Z),ke!==(ke=Z)&&(X.__value=ke)}),k(F,X)}),or(Or);var Xr=l(Nr),fi=l(h(Xr)),re=l(Xr),Se=l(h(re));$(()=>y(ut,a(ne).length)),ze(Pr,()=>a(ot),F=>d(ot,F)),Mr(at,()=>a(lt),F=>d(lt,F)),yi("submit",xr,vo),ze(Yr,()=>a(Ze),F=>d(Ze,F)),ze(mn,()=>a(Tr),F=>d(Tr,F)),Mr(Or,()=>a(Ln),F=>d(Ln,F)),ze(fi,()=>a(kt),F=>d(kt,F)),ze(Se,()=>a(Qt),F=>d(Qt,F)),k(H,se)},gn=H=>{var se=Gg(),ie=l(Je(se),2);Ne(ie,20,()=>i,we=>we,(we,De)=>{var Be=qg(),ut=h(Be),Ct=E(ut,!0),Pr=l(ut,2);Ne(Pr,17,()=>a(ne).filter(at=>at.scheduledDay===De),at=>at.id,(at,jt)=>{var rr=Wg(),Jr=h(rr),xr=E(Jr,!0),Rt=l(Jr),Yr=E(Rt,!0),qt=l(Rt),mn=E(qt,!0);$(()=>{y(xr,a(jt).category),y(Yr,a(jt).title),y(mn,a(jt).status)}),P("click",rr,()=>Ca(a(jt))),k(at,rr)},at=>{var jt=jg();k(at,jt)}),$(()=>y(Ct,De)),k(we,Be)}),k(H,se)},gs=H=>{var se=ys(),ie=Je(se);{var we=Be=>{var ut=vm(),Ct=Je(ut),Pr=h(Ct),at=l(h(Pr),2),jt=E(at,!0),rr=l(at,2),Jr=E(rr,!0),xr=l(Pr,2),Rt=h(xr),Yr=E(Rt,!0),qt=l(Rt),mn=E(qt),Nr=l(Ct,2);{var Or=F=>{var Z=Kg(),X=h(Z),Le=E(X);$(()=>{It(X,"href",a(zt)),It(X,"download",a(si)),y(Le,`↓ ${a(si)??""}`)}),P("click",X,co),k(F,Z)};ce(Nr,F=>{a(zt)&&F(Or)})}var Xr=l(Nr,2);Ne(Xr,21,()=>s,F=>F.id,(F,Z)=>{var X=Jg();let Le;var ke=h(X),bt=l(ke),vt=E(bt,!0);$(()=>{Le=lr(X,1,"",null,Le,{active:a(de)===a(Z).id}),y(ke,a(Z).name),y(vt,a(Z).ratio)}),P("click",X,()=>uo(a(Z).id)),k(F,X)});var fi=l(Xr,2);{var re=F=>{var Z=um(),X=h(Z),Le=h(X),ke=l(h(Le),2),bt=E(ke,!0),vt=l(Le,4),Dr=h(vt);{var br=ue=>{var oe=Xg(),He=Je(oe),J=l(h(He)),j=l(He,2);Ne(j,17,()=>a(Ae).statRows||[],Xi,(Ve,st,dt)=>{var Ge=Yg(),Te=h(Ge);Te.nodeValue=`Fact ${dt+1}`;var Ue=l(Te);$(()=>Jt(Ue,a(st))),P("input",Ue,_t=>Un("statRows",dt,null,_t.currentTarget.value)),k(Ve,Ge)});var Pe=l(j,2),Me=l(h(Pe)),ve=l(Pe,2),xe=l(h(ve));$(()=>{Jt(J,a(Ae).headline||""),Jt(Me,a(Ae).bottomTakeaway||""),Jt(xe,a(Ae).caption||"")}),P("input",J,Ve=>Cr("headline",Ve.currentTarget.value)),P("input",Me,Ve=>Cr("bottomTakeaway",Ve.currentTarget.value)),P("input",xe,Ve=>Cr("caption",Ve.currentTarget.value)),k(ue,oe)},Ie=ue=>{var oe=Zg(),He=Je(oe),J=l(h(He)),j=l(He,2);Ne(j,17,()=>a(Ae).slides||[],Xi,(Pe,Me,ve)=>{var xe=Qg(),Ve=h(xe);Ve.textContent=`Slide ${ve+1}`;var st=l(Ve),dt=l(h(st)),Ge=l(st),Te=l(h(Ge)),Ue=l(Ge),_t=l(h(Ue));$(()=>{Jt(dt,a(Me).title||""),Jt(Te,a(Me).bodyMetric||""),Jt(_t,a(Me).visualNote||"")}),P("input",dt,yt=>Un("slides",ve,"title",yt.currentTarget.value)),P("input",Te,yt=>Un("slides",ve,"bodyMetric",yt.currentTarget.value)),P("input",_t,yt=>Un("slides",ve,"visualNote",yt.currentTarget.value)),k(Pe,xe)}),$(()=>Jt(J,a(Ae).coverHook||"")),P("input",J,Pe=>Cr("coverHook",Pe.currentTarget.value)),k(ue,oe)},pe=ue=>{var oe=em(),He=Je(oe),J=l(h(He)),j=l(He),Pe=l(h(j)),Me=l(j),ve=l(h(Me));$(()=>{Jt(J,a(Ae).hookBanner||""),Jt(Pe,a(Ae).keyStatHighlight||""),Jt(ve,a(Ae).interactiveStickerPrompt||"")}),P("input",J,xe=>Cr("hookBanner",xe.currentTarget.value)),P("input",Pe,xe=>Cr("keyStatHighlight",xe.currentTarget.value)),P("input",ve,xe=>Cr("interactiveStickerPrompt",xe.currentTarget.value)),k(ue,oe)},wt=ue=>{var oe=nm(),He=Je(oe),J=l(h(He)),j=l(He);Ne(j,17,()=>a(Ae).beats||[],Xi,(ve,xe,Ve)=>{var st=rm(),dt=h(st);dt.textContent=`Beat ${Ve+1}`;var Ge=l(dt);Ne(Ge,16,()=>["timecode","voiceover","onScreenText","bRollDirection"],Te=>Te,(Te,Ue)=>{var _t=tm(),yt=h(_t),Zr=l(yt);$(()=>{y(yt,Ue),Jt(Zr,a(xe)[Ue]||""),It(Zr,"rows",Ue==="timecode"?1:3)}),P("input",Zr,gi=>Un("beats",Ve,Ue,gi.currentTarget.value)),k(Te,_t)}),k(ve,st)});var Pe=l(j),Me=l(h(Pe));$(()=>{Jt(J,a(Ae).spokenHook0to3s||""),Jt(Me,a(Ae).closingCta||"")}),P("input",J,ve=>Cr("spokenHook0to3s",ve.currentTarget.value)),P("input",Me,ve=>Cr("closingCta",ve.currentTarget.value)),k(ue,oe)};ce(Dr,ue=>{a(de)==="infographic"?ue(br):a(de)==="carousel"?ue(Ie,1):a(de)==="story"?ue(pe,2):ue(wt,-1)})}var Ut=l(vt,2),Gt=l(h(Ut)),Qr=l(h(Gt)),Kt=l(Ut,2),nr=l(Kt,2),ir=h(nr),wr=l(h(ir));Ne(wr,20,()=>i,ue=>ue,(ue,oe)=>{var He=mi(),J=E(He,!0),j={};$(()=>{y(J,oe),j!==(j=oe)&&(He.__value=j)}),k(ue,He)}),or(wr);var ar=l(ir),Lr=l(nr,2),bn=l(h(Lr),4);Ne(bn,19,()=>a(le),ue=>ue.id,(ue,oe,He)=>{var J=om(),j=h(J),Pe=E(j),Me=l(j),ve=E(Me),xe=l(Me),Ve=l(h(xe)),st=l(xe),dt=l(h(st)),Ge=l(st),Te=l(h(Ge)),Ue=h(Te);Ue.value=Ue.__value="";var _t=l(Ue);_t.value=_t.__value="general";var yt=l(_t);yt.value=yt.__value="financial";var Zr=l(yt);Zr.value=Zr.__value="cultural";var gi=l(Zr);gi.value=gi.__value="clinical",or(Te);var xa=l(Ge);{var ms=Ft=>{var bs=ys(),Id=Je(bs);{var Ed=qi=>{var ws=im(),kd=h(ws);Vs(kd,()=>a(oe).clinicalReviewRequested,Td=>a(oe).clinicalReviewRequested=Td),k(qi,ws)},Sd=qi=>{var ws=am();k(qi,ws)};ce(Id,qi=>{a(Mn)?qi(Ed):qi(Sd,-1)})}k(Ft,bs)};ce(xa,Ft=>{a(oe).kind==="clinical"&&Ft(ms)})}var Ll=l(xa),_o=l(h(Ll)),go=h(_o);go.value=go.__value="unreviewed";var mo=l(go);mo.value=mo.__value="approved";var Ml=l(mo);Ml.value=Ml.__value="rejected",or(_o);var wd=l(Ll);{var yd=Ft=>{var bs=sm();k(Ft,bs)};ce(wd,Ft=>{a(oe).kind==="clinical"&&Ft(yd)})}$(()=>{y(Pe,`Claim ${a(He)+1}`),It(Me,"aria-label",`Remove claim ${a(He)+1}`),y(ve,`Remove claim ${a(He)+1}`)}),P("click",Me,()=>Pa(a(oe).id)),ze(Ve,()=>a(oe).text,Ft=>a(oe).text=Ft),ze(dt,()=>a(oe).sourceUrl,Ft=>a(oe).sourceUrl=Ft),Mr(Te,()=>a(oe).kind,Ft=>a(oe).kind=Ft),Mr(_o,()=>a(oe).status,Ft=>a(oe).status=Ft),k(ue,J)});var wn=l(bn),hi=l(wn),pi=l(Lr,2);{var vi=ue=>{var oe=lm(),He=E(oe);$(()=>y(He,`Preflight could not be recorded: ${a(Ar).error??""}`)),k(ue,oe)},_i=ue=>{var oe=cm();k(ue,oe)};ce(pi,ue=>{var oe;(oe=a(Ar))!=null&&oe.error?ue(vi):a(Ar)&&ue(_i,1)})}var ji=l(X,2);rh(ji,()=>a(b)+a(I)+a(U).id+a(de),ue=>{Jh(ue,{get campaign(){return a(he)},get brandProfile(){return a(D)},get format(){return a(de)},get backlog(){return a(ne)},get activeStoryId(){return a(U).id},onpreflight:tt})}),$(()=>{y(bt,a(Ce)?"Unsaved changes":"Saved draft"),Kt.disabled=!a(Ce)||a(M)}),P("input",Qr,()=>{d(Ce,!0);try{d(Ae,JSON.parse(a(ct)),!0)}catch{}}),ze(Qr,()=>a(ct),ue=>d(ct,ue)),P("click",Kt,vn),Mr(wr,()=>a(Ot),ue=>d(Ot,ue)),P("click",ar,fo),P("click",wn,vs),P("click",hi,_s),k(F,Z)},Se=F=>{var Z=pm(),X=Je(Z),Le=l(h(X),4);Ne(Le,23,()=>a(le),Ie=>Ie.id,(Ie,pe,wt)=>{var Ut=hm(),Gt=h(Ut),Qr=E(Gt),Kt=l(Gt),nr=E(Kt),ir=l(Kt),wr=l(h(ir)),ar=l(ir),Lr=l(h(ar)),bn=l(ar),wn=l(h(bn)),hi=h(wn);hi.value=hi.__value="";var pi=l(hi);pi.value=pi.__value="general";var vi=l(pi);vi.value=vi.__value="financial";var _i=l(vi);_i.value=_i.__value="cultural";var ji=l(_i);ji.value=ji.__value="clinical",or(wn);var ue=l(bn);{var oe=ve=>{var xe=ys(),Ve=Je(xe);{var st=Ge=>{var Te=dm(),Ue=h(Te);Vs(Ue,()=>a(pe).clinicalReviewRequested,_t=>a(pe).clinicalReviewRequested=_t),k(Ge,Te)},dt=Ge=>{var Te=fm();k(Ge,Te)};ce(Ve,Ge=>{a(Mn)?Ge(st):Ge(dt,-1)})}k(ve,xe)};ce(ue,ve=>{a(pe).kind==="clinical"&&ve(oe)})}var He=l(ue),J=l(h(He)),j=h(J);j.value=j.__value="unreviewed";var Pe=l(j);Pe.value=Pe.__value="approved";var Me=l(Pe);Me.value=Me.__value="rejected",or(J),$(()=>{y(Qr,`Claim ${a(wt)+1}`),It(Kt,"aria-label",`Remove claim ${a(wt)+1}`),y(nr,`Remove claim ${a(wt)+1}`)}),P("click",Kt,()=>Pa(a(pe).id)),ze(wr,()=>a(pe).text,ve=>a(pe).text=ve),ze(Lr,()=>a(pe).sourceUrl,ve=>a(pe).sourceUrl=ve),Mr(wn,()=>a(pe).kind,ve=>a(pe).kind=ve),Mr(J,()=>a(pe).status,ve=>a(pe).status=ve),k(Ie,Ut)});var ke=l(Le,2),bt=l(ke,2),vt=l(X,2),Dr=l(h(vt),6),br=E(Dr,!0);$(()=>{Dr.disabled=a(M),y(br,a(M)?"Generating…":"Generate four-format draft")}),P("click",ke,vs),P("click",bt,_s),P("click",Dr,Ra),k(F,Z)};ce(fi,F=>{a(he)?F(re):F(Se,-1)})}$(()=>{y(jt,a(U).title),y(Jr,a(he)?a(ka):"No generated draft yet"),Rt.disabled=a(M),y(Yr,a(M)?"Working…":a(he)?"Regenerate draft":"Generate draft"),qt.disabled=a(M)||!a(he),y(mn,`Export ${a(de)==="carousel"?"ZIP":a(de)==="reel"?"script":"PNG"} ↗`)}),P("click",Rt,Ra),P("click",qt,ho),k(Be,ut)},De=Be=>{var ut=_m(),Ct=l(h(ut),4);P("click",Ct,()=>d(Y,"backlog")),k(Be,ut)};ce(ie,Be=>{a(U)?Be(we):Be(De,-1)})}k(H,se)},di=H=>{var se=Am(),ie=Je(se),we=h(ie),De=l(h(we)),Be=l(we),ut=l(h(Be)),Ct=l(Be),Pr=l(h(Ct)),at=l(Ct),jt=l(h(at)),rr=l(at),Jr=l(h(rr)),xr=l(rr),Rt=l(h(xr));Ne(Rt,20,()=>r,re=>re,(re,Se)=>{var F=mi(),Z=E(F,!0),X={};$(()=>{y(Z,Se),X!==(X=Se)&&(F.value=(F.__value=X)??"")}),k(re,F)}),or(Rt);var Yr=l(xr),qt=l(h(Yr));Ne(qt,20,()=>r,re=>re,(re,Se)=>{var F=mi(),Z=E(F,!0),X={};$(()=>{y(Z,Se),X!==(X=Se)&&(F.value=(F.__value=X)??"")}),k(re,F)}),or(qt);var mn=l(Yr,2);Ne(mn,21,()=>a(D).colors||[],re=>re.name,(re,Se,F)=>{var Z=gm(),X=h(Z),Le=l(X),ke=h(Le),bt=l(ke);$(()=>{y(X,`${a(Se).name??""} `),It(ke,"aria-label",`${a(Se).name??""} color`),It(bt,"aria-label",`${a(Se).name??""} hex`)}),ze(ke,()=>a(Se).hex,vt=>a(Se).hex=vt),ze(bt,()=>a(Se).hex,vt=>a(Se).hex=vt),k(re,Z)});var Nr=l(ie,2);{var Or=re=>{var Se=Sm(),F=l(h(Se),6),Z=E(F,!0),X=l(F,2),Le=h(X),ke=l(h(Le),2);Ne(ke,19,()=>a(D).strategy.valueGroups||[],(Ie,pe)=>typeof Ie=="string"?Ie:Ie.id||pe,(Ie,pe)=>{var wt=bm(),Ut=h(wt),Gt=E(Ut,!0),Qr=l(Ut,2);{var Kt=nr=>{var ir=mm(),wr=Je(ir),ar=E(wr,!0),Lr=l(wr,2),bn=E(Lr,!0);$(()=>{y(ar,a(pe).ageRange||""),y(bn,a(pe).motivation||"")}),k(nr,ir)};ce(Qr,nr=>{typeof a(pe)=="object"&&nr(Kt)})}$(()=>y(Gt,typeof a(pe)=="string"?a(pe):a(pe).name)),k(Ie,wt)},Ie=>{var pe=wm();k(Ie,pe)});var bt=l(Le,2),vt=l(h(bt),2);Ne(vt,20,()=>a(D).strategy.pillars||[],Ie=>Ie,(Ie,pe)=>{var wt=ym(),Ut=h(wt),Gt=E(Ut,!0);$(()=>y(Gt,pe)),k(Ie,wt)},Ie=>{var pe=Im();k(Ie,pe)});var Dr=l(X,2);{var br=Ie=>{var pe=Em();k(Ie,pe)};ce(Dr,Ie=>{a(D).strategy.clinicalClaimsQuarantined&&Ie(br)})}$(()=>y(Z,a(D).strategy.status||"Proposed positioning")),k(re,Se)};ce(Nr,re=>{a(D).strategy&&re(Or)})}var Xr=l(Nr,2),fi=l(h(Xr),4);Ne(fi,17,()=>a(ne).filter(re=>re.category==="Source research"),re=>re.id,(re,Se)=>{var F=km(),Z=h(F),X=h(Z),Le=E(X,!0),ke=l(X,2),bt=E(ke,!0),vt=l(Z,2);$(()=>{y(Le,a(Se).title),y(bt,a(Se).reviewStatus||"Unreviewed research")}),P("click",vt,()=>Ca(a(Se))),k(re,F)},re=>{var Se=Tm();k(re,Se)}),yi("submit",ie,po),ze(De,()=>a(D).brandName,re=>a(D).brandName=re),ze(ut,()=>a(D).websiteUrl,re=>a(D).websiteUrl=re),ze(Pr,()=>a(D).tagline,re=>a(D).tagline=re),ze(jt,()=>a(D).mission,re=>a(D).mission=re),ze(Jr,()=>a(D).logoText,re=>a(D).logoText=re),Mr(Rt,()=>a(D).fonts.heading,re=>a(D).fonts.heading=re),Mr(qt,()=>a(D).fonts.body,re=>a(D).fonts.body=re),k(H,se)},Wn=H=>{var se=Om(),ie=h(se),we=h(ie),De=l(h(we),2),Be=l(we,4),ut=h(Be),Ct=h(ut),Pr=E(Ct,!0),at=l(ut,2),jt=h(at),rr=E(jt,!0),Jr=l(at,2),xr=h(Jr),Rt=E(xr,!0),Yr=l(Be,2),qt=l(h(Yr),2),mn=E(qt,!0),Nr=l(ie,2),Or=l(h(Nr),2),Xr=l(Or,2),fi=E(Xr),re=l(Xr,6);Ne(re,21,()=>{var J,j,Pe;return((Pe=(j=(J=a(_r))==null?void 0:J.observability)==null?void 0:j.jobs)==null?void 0:Pe.slice(0,10))||[]},J=>J.jobId,(J,j)=>{var Pe=Rm(),Me=h(Pe),ve=E(Me,!0),xe=l(Me),Ve=l(xe),st=E(Ve),dt=l(Ve,2);{var Ge=Te=>{var Ue=Cm(),_t=E(Ue,!0);$(yt=>{Ue.disabled=a(M),It(Ue,"aria-label",yt),y(_t,a(j).status==="FAILED"?"Retry failed batch":"Retry interrupted batch")},[()=>`${a(j).status==="FAILED"?"Retry failed batch":"Retry interrupted batch"} ${a(j).jobId.slice(0,8)}`]),P("click",Ue,()=>$e(a(j).jobId)),k(Te,Ue)};ce(dt,Te=>{(a(j).status==="FAILED"||a(j).status==="INTERRUPTED")&&Te(Ge)})}$(Te=>{var Ue;y(ve,a(j).status),y(xe,` · Attempt ${(a(j).attempt||1)??""} `),y(st,`${(((Ue=a(j).completedStoryIds)==null?void 0:Ue.length)||0)??""} completed stories
                    ${Te??""}`)},[()=>a(j).retryOfJobId?` · Retry of ${a(j).retryOfJobId.slice(0,8)}`:""]),k(J,Pe)},J=>{var j=Pm();k(J,j)});var Se=l(Nr,2),F=l(h(Se),2),Z=h(F),X=l(h(Z)),Le=l(F,2),ke=h(Le),bt=h(ke),vt=l(bt),Dr=l(ke),br=l(h(Dr)),Ie=h(br);Ie.value=Ie.__value="liquidity_desk";var pe=l(Ie);pe.value=pe.__value="vedic_dharma",or(br);var wt=l(Se,2),Ut=l(h(wt),2),Gt=h(Ut),Qr=h(Gt),Kt=E(Qr,!0),nr=l(Gt,2),ir=h(nr),wr=E(ir,!0),ar=l(nr,2),Lr=h(ar),bn=E(Lr,!0),wn=l(Ut,4),hi=h(wn),pi=l(h(hi));Ne(pi,21,()=>{var J,j;return((j=(J=a(_r))==null?void 0:J.observability)==null?void 0:j.traces)||[]},J=>J.traceId,(J,j)=>{var Pe=xm(),Me=h(Pe),ve=E(Me,!0),xe=l(Me),Ve=E(xe,!0),st=l(xe),dt=E(st,!0),Ge=l(st),Te=E(Ge);$(()=>{y(ve,a(j).status),y(Ve,a(j).provider),y(dt,a(j).model),y(Te,`${a(j).latencyMs??""} ms`)}),k(J,Pe)},J=>{var j=Nm();k(J,j)});var vi=l(wn,2),_i=l(h(vi),2),ji=E(_i,!0),ue=l(wt,2),oe=l(h(ue),2),He=E(oe,!0);$((J,j,Pe,Me)=>{var ve,xe,Ve,st,dt,Ge,Te,Ue,_t,yt,Zr,gi,xa,ms;y(Pr,((ve=a(hn))==null?void 0:ve.status)||"Unknown"),y(rr,((Ve=(xe=a(hn))==null?void 0:xe.checks)==null?void 0:Ve.repository)||"Unknown"),y(Rt,((dt=(st=a(hn))==null?void 0:st.checks)==null?void 0:dt.generationProvider)||"Not checked"),y(mn,J),Or.disabled=a(M),It(fi,"href",j),y(bt,`New brand in ${((Ge=a(oi))==null?void 0:Ge.name)??""}`),y(Kt,((_t=(Ue=(Te=a(_r))==null?void 0:Te.observability)==null?void 0:Ue.traces)==null?void 0:_t.length)||0),y(wr,((Zr=(yt=a(_r))==null?void 0:yt.observability)==null?void 0:Zr.usageEvents)||0),y(bn,((ms=(xa=(gi=a(_r))==null?void 0:gi.observability)==null?void 0:xa.operationalEvents)==null?void 0:ms.length)||0),y(ji,Pe),y(He,Me)},[()=>JSON.stringify(a(hn),null,2),()=>"/api/admin/backprop-jsonl?"+Bi(),()=>JSON.stringify(a(_r),null,2),()=>JSON.stringify(a(Ia),null,2)]),P("click",De,Wi),P("click",Or,()=>$e()),yi("submit",F,T),ze(X,()=>a(fn),J=>d(fn,J)),yi("submit",Le,K),ze(vt,()=>a($i),J=>d($i,J)),Mr(br,()=>a(ai),J=>d(ai,J)),k(H,se)};ce(mt,H=>{a(Y)==="backlog"?H(tr):a(Y)==="calendar"?H(gn,1):a(Y)==="studio"?H(gs,2):a(Y)==="brand"&&a(D)?H(di,3):a(Y)==="admin"&&a(Mn)&&H(Wn,4)})}$(H=>{var se,ie;rt!==(rt=a(b))&&(Re.value=(Re.__value=rt)??"",Hs(Re,rt)),Ke!==(Ke=a(I))&&(Ee.value=(Ee.__value=Ke)??"",Hs(Ee,Ke)),y(Bn,H),y(Oe,a(g).username),y(qe,a(g).role),y(Hn,`${(((se=a(oi))==null?void 0:se.name)||"ORGANIZATION")??""} / ${(((ie=a(fs))==null?void 0:ie.name)||"BRAND")??""}`),y(Vn,a(Y)==="backlog"?"Good stories, next up.":a(Y)==="calendar"?"Make room for the week.":a(Y)==="studio"?"Campaign Studio":a(Y)==="brand"?"Your brand, clearly.":"Studio operations"),y(zn,a(Y)==="studio"?"Edit the substance. Inspect the surface. Export with context.":"A focused workspace for source-backed editorial work.")},[()=>{var H;return(H=a(g).username)==null?void 0:H.slice(0,2)}]),P("click",L,H=>{H.preventDefault(),d(Y,"backlog")}),P("change",Re,Ta),P("change",Ee,ps),P("click",Xe,lo),k(_,m)};ce(We,_=>{a(q)?_(Dt):a(g)?_(Zt,-1):_(Lt,1)})}k(t,gt),dl()}ku(["click","change","input"]);Qf(Lm,{target:document.getElementById("app")});
