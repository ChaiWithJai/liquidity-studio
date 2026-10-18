var Qd=Object.defineProperty;var Zd=Object.getPrototypeOf;var ef=Reflect.get;var tc=t=>{throw TypeError(t)};var tf=(t,e,r)=>e in t?Qd(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var or=(t,e,r)=>tf(t,typeof e!="symbol"?e+"":e,r),Lo=(t,e,r)=>e.has(t)||tc("Cannot "+r);var h=(t,e,r)=>(Lo(t,e,"read from private field"),r?r.call(t):e.get(t)),Z=(t,e,r)=>e.has(t)?tc("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),ie=(t,e,r,n)=>(Lo(t,e,"write to private field"),n?n.call(t,r):e.set(t,r),r),j=(t,e,r)=>(Lo(t,e,"access private method"),r);var rc=(t,e,r)=>ef(Zd(t),r,e);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function r(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(i){if(i.ep)return;i.ep=!0;const a=r(i);fetch(i.href,a)}})();const Jc=!1;var go=Array.isArray,rf=Array.prototype.indexOf,ia=Array.prototype.includes,mo=Array.from,Yc=Object.defineProperty,ls=Object.getOwnPropertyDescriptor,nf=Object.getOwnPropertyDescriptors,sf=Object.prototype,af=Array.prototype,Xc=Object.getPrototypeOf,nc=Object.isExtensible;const of=()=>{};function lf(t){for(var e=0;e<t.length;e++)t[e]()}function Qc(){var t,e,r=new Promise((n,i)=>{t=n,e=i});return{promise:r,resolve:t,reject:e}}function cf(t,e){if(Array.isArray(t))return t;if(!(Symbol.iterator in t))return Array.from(t);const r=[];for(const n of t)if(r.push(n),r.length===e)break;return r}const Ot=2,Is=4,bo=8,Zc=1<<24,Wr=16,Yr=32,mi=64,tl=128,Tl=256,Kr=512,vt=1024,at=2048,Tr=4096,Vt=8192,kt=16384,Ps=32768,sa=1<<25,Es=65536,Qa=1<<17,eu=1<<18,xs=1<<19,uf=1<<20,_n=1<<25,Za=1<<21,cs=1<<22,vi=1<<23,Ki=Symbol("$state"),tu=Symbol("component"),df=Symbol("legacy props"),ff=Symbol(""),Ha=Symbol("attributes"),rl=Symbol("class"),nl=Symbol("style"),Gs=Symbol("text"),Va=Symbol("form reset"),ga=new class extends Error{constructor(){super(...arguments);or(this,"name","StaleReactionError");or(this,"message","The reaction that called `getAbortSignal()` was re-run or destroyed")}};var qc;const hf=!!((qc=globalThis.document)!=null&&qc.contentType)&&globalThis.document.contentType.includes("xml"),pf=1,vf=2,ru=4,_f=8,gf=16,mf=1,bf=4,wf=8,yf=16,If=1,Ef=2,nu={},pt=Symbol("uninitialized"),iu="http://www.w3.org/1999/xhtml",Sf="http://www.w3.org/2000/svg",kf="http://www.w3.org/1998/Math/MathML";function Tf(){console.warn("https://svelte.dev/e/derived_inert")}function Af(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function Cf(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}let su=!1;function au(t){return t===this.v}function Rf(t,e){return t!=t?e==e:t!==e||t!==null&&typeof t=="object"||typeof t=="function"}function ou(t){return!Rf(t,this.v)}function Pf(t){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function xf(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function Nf(t,e,r){throw new Error("https://svelte.dev/e/each_key_duplicate")}function Of(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function Df(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function Lf(t){throw new Error("https://svelte.dev/e/effect_orphan")}function Mf(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function Uf(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function Ff(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function $f(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function Bf(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function Hf(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}let Vf=!1,Nt=null;function Ss(t){Nt=t}function Al(t,e=!1,r){Nt={p:Nt,i:!1,c:null,e:null,s:t,x:null,r:Ee,l:null}}function Cl(t){var e=Nt,r=e.e;if(r!==null){e.e=null;for(var n of r)Pu(n)}return e.i=!0,Nt=e.p,Rl(t)}function Rl(t={}){return Yc(t,tu,{value:!0}),t}function lu(){return!0}let $i=[];function cu(){var t=$i;$i=[],lf(t)}function Vn(t){if($i.length===0&&!ea){var e=$i;queueMicrotask(()=>{e===$i&&cu()})}$i.push(t)}function zf(){for(;$i.length>0;)cu()}const Wf=-7169;function st(t,e){t.f=t.f&Wf|e}function Pl(t){(t.f&Kr)!==0||t.deps===null?st(t,vt):st(t,Tr)}function uu(t,e,r){(t.f&at)!==0?e.add(t):(t.f&Tr)!==0&&r.add(t),st(t,vt)}let ic=!1;function jf(){ic||(ic=!0,document.addEventListener("reset",t=>{Promise.resolve().then(()=>{var e;if(!t.defaultPrevented)for(const r of t.target.elements)(e=r[Va])==null||e.call(r)})},{capture:!0}))}function Ns(t){var e=_e,r=Ee;Ar(null),wn(null);try{return t()}finally{Ar(e),wn(r)}}function xl(t,e,r,n=r){t.addEventListener(e,()=>Ns(r));const i=t[Va];i?t[Va]=()=>{i(),n(!0)}:t[Va]=()=>n(!0),jf()}function qf(t,e,r,n){const i=aa;var a=t.filter(b=>!b.settled),o=e.map(i);if(r.length===0&&a.length===0){n(o);return}var c=Ee,u=Gf(),f=a.length===1?a[0].promise:a.length>1?Promise.all(a.map(b=>b.promise)):null;function _(b){if((c.f&kt)===0){u();try{n([...o,...b])}catch(I){pn(I,c)}eo()}}var g=du();if(r.length===0){f.then(()=>_([])).finally(g);return}function w(){Promise.all(r.map(b=>Kf(b))).then(_).catch(b=>pn(b,c)).finally(g)}f?f.then(()=>{if((c.f&kt)!==0){g();return}u(),w(),eo()}):w()}function Gf(){var t=Ee,e=_e,r=Nt,n=W;return function(a=!0){wn(t),Ar(e),Ss(r),a&&(t.f&kt)===0&&(n==null||n.activate(),n==null||n.apply())}}function eo(t=!0){wn(null),Ar(null),Ss(null),t&&(W==null||W.deactivate())}function du(){var t=Ee,e=t.b,r=W,n=!!(e!=null&&e.is_rendered());return e==null||e.update_pending_count(1,r),r.increment(n,t),()=>{e==null||e.update_pending_count(-1,r),r.decrement(n,t)}}function aa(t){var e=Ot|at;return Ee!==null&&(Ee.f|=xs),{ctx:Nt,deps:null,effects:null,equals:au,f:e,fn:t,reactions:null,rv:0,v:pt,wv:0,parent:Ee,ac:null}}const Ks=Symbol("obsolete");function Kf(t,e,r){let n=Ee;n===null&&xf();var i=void 0,a=bi(pt),o=!_e,c=new Set;return ch(()=>{var b,I;var u=Ee,f=Qc();i=f.promise;try{Promise.resolve(t()).then(f.resolve,P=>{P!==ga&&f.reject(P)}).finally(eo)}catch(P){f.reject(P),eo()}var _=W;if(o){if((u.f&Ps)!==0)var g=du();if((b=n.b)!=null&&b.is_rendered())(I=_.async_deriveds.get(u))==null||I.reject(Ks);else for(const P of c.values())P.reject(Ks);c.add(f),_.async_deriveds.set(u,f)}const w=(P,k=void 0)=>{g==null||g(),c.delete(f),k!==Ks&&(_.activate(),k?(a.f|=vi,ks(a,k)):((a.f&vi)!==0&&(a.f^=vi),ks(a,P)),_.deactivate())};f.promise.then(w,P=>w(null,P||"unknown"))}),Ml(()=>{for(const u of c)u.reject(Ks)}),new Promise(u=>{function f(_){function g(){_===i?u(a):f(i)}_.then(g,g)}f(i)})}function It(t){const e=aa(t);return Mu(e),e}function fu(t){const e=aa(t);return e.equals=ou,e}function Jf(t){var e=t.effects;if(e!==null){t.effects=null;for(var r=0;r<e.length;r+=1)Qt(e[r])}}function Nl(t){var e,r=Ee,n=t.parent;if(!Jn&&n!==null&&t.v!==pt&&(n.f&(kt|Vt))!==0)return Tf(),t.v;wn(n);try{Jf(t),e=Bu(t)}finally{wn(r)}return e}function hu(t){var e=Nl(t);if(!t.equals(e)&&(t.wv=Fu(),(!(W!=null&&W.is_fork)||t.deps===null)&&(W!==null?(W.capture(t,e,!0),_i==null||_i.capture(t,e,!0)):t.v=e,t.deps===null))){st(t,vt);return}Jn||(St!==null?(Ll()||W!=null&&W.is_fork)&&St.set(t,e):Pl(t))}function Yf(t){var e;if(t.effects!==null)for(const r of t.effects)(r.teardown||r.ac)&&((e=r.teardown)==null||e.call(r),r.ac!==null&&Ns(()=>{r.ac.abort(ga),r.ac=null}),r.fn!==null&&(r.teardown=of),oa(r,0),Fl(r))}function pu(t){if(t.effects!==null)for(const e of t.effects)e.teardown&&e.fn!==null&&Ts(e)}let Mo=null,as=null,W=null,_i=null,St=null,il=null,ea=!1,Uo=!1,ta=null,za=null;var sc=0;let Xf=1;var vs,hi,zi,_s,gs,ms,Un,bs,ur,fa,Fn,Vr,ln,ws,Wi,ke,sl,al,Js,ol,vu,_u,os,Qf,Ys;const ho=class ho{constructor(){Z(this,ke);or(this,"id",Xf++);Z(this,vs,!1);or(this,"linked",!0);Z(this,hi,null);Z(this,zi,null);or(this,"async_deriveds",new Map);or(this,"current",new Map);or(this,"previous",new Map);Z(this,_s,new Set);Z(this,gs,new Set);Z(this,ms,0);Z(this,Un,new Map);Z(this,bs,null);Z(this,ur,[]);Z(this,fa,[]);Z(this,Fn,new Set);Z(this,Vr,new Set);Z(this,ln,new Map);Z(this,ws,new Set);or(this,"is_fork",!1);Z(this,Wi,!1);as===null?Mo=as=this:(ie(as,zi,this),ie(this,hi,as)),as=this}skip_effect(e){h(this,ln).has(e)||h(this,ln).set(e,{d:[],m:[]}),h(this,ws).delete(e)}unskip_effect(e,r=n=>this.schedule(n)){var n=h(this,ln).get(e);if(n){h(this,ln).delete(e);for(var i of n.d)st(i,at),r(i);for(i of n.m)st(i,Tr),r(i)}h(this,ws).add(e)}capture(e,r,n=!1){e.v!==pt&&!this.previous.has(e)&&this.previous.set(e,e.v),(e.f&vi)===0&&(this.current.set(e,[r,n]),St==null||St.set(e,r)),this.is_fork||(e.v=r)}activate(){W=this}deactivate(){W=null,St=null}flush(){try{Uo=!0,W=this,j(this,ke,Js).call(this)}finally{sc=0,il=null,ta=null,za=null,Uo=!1,W=null,St=null,gn.clear()}}discard(){var e;for(const r of h(this,gs))r(this);h(this,gs).clear();for(const r of this.async_deriveds.values())r.reject(Ks);j(this,ke,Ys).call(this),(e=h(this,bs))==null||e.resolve()}register_created_effect(e){h(this,fa).push(e)}increment(e,r){if(ie(this,ms,h(this,ms)+1),e){let n=h(this,Un).get(r)??0;h(this,Un).set(r,n+1)}}decrement(e,r){if(ie(this,ms,h(this,ms)-1),e){let n=h(this,Un).get(r)??0;n===1?h(this,Un).delete(r):h(this,Un).set(r,n-1)}h(this,Wi)||(ie(this,Wi,!0),Vn(()=>{ie(this,Wi,!1),this.linked&&this.flush()}))}transfer_effects(e,r){for(const n of e)h(this,Fn).add(n);for(const n of r)h(this,Vr).add(n);e.clear(),r.clear()}oncommit(e){h(this,_s).add(e)}ondiscard(e){h(this,gs).add(e)}settled(){return(h(this,bs)??ie(this,bs,Qc())).promise}static ensure(){if(W===null){const e=W=new ho;!Uo&&!ea&&Vn(()=>{h(e,vs)||e.flush()})}return W}apply(){{St=null;return}}schedule(e){var r;if(il=e,(r=e.b)!=null&&r.is_pending&&(e.f&(Is|bo|Zc))!==0&&(e.f&Ps)===0){e.b.defer_effect(e);return}h(this,ur).push(e)}};vs=new WeakMap,hi=new WeakMap,zi=new WeakMap,_s=new WeakMap,gs=new WeakMap,ms=new WeakMap,Un=new WeakMap,bs=new WeakMap,ur=new WeakMap,fa=new WeakMap,Fn=new WeakMap,Vr=new WeakMap,ln=new WeakMap,ws=new WeakMap,Wi=new WeakMap,ke=new WeakSet,sl=function(){if(this.is_fork)return!0;for(const n of h(this,Un).keys()){for(var e=n,r=!1;e.parent!==null;){if(h(this,ln).has(e)){r=!0;break}e=e.parent}if(!r)return!0}return!1},al=function(){var e=[];for(const a of h(this,ur))if(!((a.f&kt)!==0||(a.f&(at|Tr))===0)){for(var r=a,n=!1;r.parent!==null;){r=r.parent;var i=r.f;if((i&(mi|Yr))!==0){if((i&vt)===0){n=!0;break}r.f^=vt}}n||e.push(r)}return ie(this,ur,[]),e},Js=function(){var c,u,f,_;ie(this,vs,!0);for(const g of h(this,Fn))h(this,Vr).delete(g),st(g,at),this.schedule(g);for(const g of h(this,Vr))st(g,Tr),this.schedule(g);this.apply();for(var e=ta=[],r=[],n=za=[];h(this,ur).length>0;){sc++>1e3&&(j(this,ke,Ys).call(this),eh());for(const g of j(this,ke,al).call(this))try{j(this,ke,ol).call(this,g,e,r)}catch(w){throw bu(g),j(this,ke,sl).call(this)||this.discard(),w}}if(W=null,n.length>0){var i=ho.ensure();for(const g of n)i.schedule(g)}if(ta=null,za=null,j(this,ke,sl).call(this)){j(this,ke,os).call(this,r),j(this,ke,os).call(this,e);for(const[g,w]of h(this,ln))mu(g,w);n.length>0&&j(c=W,ke,Js).call(c);return}const a=j(this,ke,vu).call(this);if(a){j(this,ke,os).call(this,r),j(this,ke,os).call(this,e),j(u=a,ke,_u).call(u,this);return}h(this,Fn).clear(),h(this,Vr).clear();for(const g of h(this,_s))g(this);h(this,_s).clear(),_i=this,ac(r),ac(e),_i=null,(f=h(this,bs))==null||f.resolve();var o=W;if(h(this,ms)===0&&(h(this,ur).length===0||o!==null)&&j(this,ke,Ys).call(this),h(this,ur).length>0)if(o!==null){for(const g of h(this,ur))h(o,ur).push(g);ie(this,ur,[])}else o=this;o!==null&&(gn.clear(),j(_=o,ke,Js).call(_))},ol=function(e,r,n){e.f^=vt;for(var i=e.first;i!==null;){var a=i.f,o=(a&(Yr|mi))!==0,c=o&&(a&vt)!==0,u=c||(a&Vt)!==0||h(this,ln).has(i);if(!u&&i.fn!==null){o?i.f^=vt:(a&Is)!==0?r.push(i):wa(i)&&((a&Wr)!==0&&h(this,Vr).add(i),Ts(i));var f=i.first;if(f!==null){i=f;continue}}for(;i!==null;){var _=i.next;if(_!==null){i=_;break}i=i.parent}}},vu=function(){for(var e=h(this,hi);e!==null;){if(!e.is_fork){for(const[r,[,n]]of this.current)if(e.current.has(r)&&!n)return e}e=h(e,hi)}return null},_u=function(e){var n;for(const[i,a]of e.current)!this.previous.has(i)&&e.previous.has(i)&&this.previous.set(i,e.previous.get(i)),this.current.set(i,a);for(const[i,a]of e.async_deriveds){const o=this.async_deriveds.get(i);o&&a.promise.then(o.resolve).catch(o.reject)}e.async_deriveds.clear(),this.transfer_effects(h(e,Fn),h(e,Vr));const r=i=>{var a=i.reactions;if(a!==null&&!((i.f&Ot)!==0&&(i.f&(at|Tr))===0))for(const u of a){var o=u.f;if((o&Ot)!==0)r(u);else{var c=u;o&(cs|Wr)&&!this.async_deriveds.has(c)&&(h(this,Vr).delete(c),st(c,at),this.schedule(c))}}};for(const i of this.current.keys())r(i);this.oncommit(()=>e.discard()),j(n=e,ke,Ys).call(n),W=this,j(this,ke,Js).call(this)},os=function(e){for(var r=0;r<e.length;r+=1)uu(e[r],h(this,Fn),h(this,Vr))},Qf=function(){var g,w;for(let b=Mo;b!==null;b=h(b,zi)){var e=b.id<this.id,r=[];for(const[I,[P,k]]of this.current){if(b.current.has(I)){var n=b.current.get(I)[0];if(e&&P!==n)b.current.set(I,[P,k]);else continue}r.push(I)}if(e)for(const[I,P]of this.async_deriveds){const k=b.async_deriveds.get(I);k&&P.promise.then(k.resolve).catch(k.reject)}var i=[...b.current.keys()].filter(I=>!b.current.get(I)[1]);if(!(!h(b,vs)||i.length===0)){var a=i.filter(I=>!this.current.has(I));if(a.length===0)e&&b.discard();else if(r.length>0){if(e)for(const I of h(this,ws))b.unskip_effect(I,P=>{var k;(P.f&(Wr|cs))!==0?b.schedule(P):j(k=b,ke,os).call(k,[P])});b.activate();var o=new Set,c=new Map;for(var u of r)gu(u,a,o,c);c=new Map;var f=[...b.current].filter(([I,P])=>{const k=this.current.get(I);return k?k[0]!==P[0]||k[1]!==P[1]:!0}).map(([I])=>I);if(f.length>0)for(const I of h(this,fa))(I.f&(kt|Vt|Qa))===0&&Ol(I,f,c)&&((I.f&(cs|Wr))!==0?(st(I,at),b.schedule(I)):h(b,Fn).add(I));if(h(b,ur).length>0&&!h(b,Wi)){b.apply();for(var _ of j(g=b,ke,al).call(g))j(w=b,ke,ol).call(w,_,[],[])}b.deactivate()}}}},Ys=function(){if(this.linked){var e=h(this,hi),r=h(this,zi);e===null?Mo=r:ie(e,zi,r),r===null?as=e:ie(r,hi,e),this.linked=!1}};let Qi=ho;function Zf(t){var e=ea,r=_i;_i=null,ea=!0;try{for(var n;;){if(zf(),W===null)return n;W.flush()}}finally{ea=e,_i=r}}function eh(){try{Mf()}catch(t){pn(t,il)}}let Hr=null;function ac(t){var e=t.length;if(e!==0){for(var r=0;r<e;){var n=t[r++];if((n.f&(kt|Vt))===0&&wa(n)&&(Hr=new Set,Ts(n),n.deps===null&&n.first===null&&n.nodes===null&&n.teardown===null&&n.ac===null&&Ou(n),(Hr==null?void 0:Hr.size)>0)){gn.clear();for(const i of Hr){if((i.f&(kt|Vt))!==0)continue;const a=[i];let o=i.parent;for(;o!==null;)Hr.has(o)&&(Hr.delete(o),a.push(o)),o=o.parent;for(let c=a.length-1;c>=0;c--){const u=a[c];(u.f&(kt|Vt))===0&&Ts(u)}}Hr.clear()}}Hr=null}}function gu(t,e,r,n){if(!r.has(t)&&(r.add(t),t.reactions!==null))for(const i of t.reactions){const a=i.f;(a&Ot)!==0?gu(i,e,r,n):(a&(cs|Wr))!==0&&(a&at)===0&&Ol(i,e,n)&&(st(i,at),Dl(i))}}function Ol(t,e,r){const n=r.get(t);if(n!==void 0)return n;if(t.deps!==null)for(const i of t.deps){if(ia.call(e,i))return!0;if((i.f&Ot)!==0&&Ol(i,e,r))return r.set(i,!0),!0}return r.set(t,!1),!1}function Dl(t){W.schedule(t)}function mu(t,e){if(!((t.f&Yr)!==0&&(t.f&vt)!==0)){(t.f&at)!==0?e.d.push(t):(t.f&Tr)!==0&&e.m.push(t),st(t,vt);for(var r=t.first;r!==null;)mu(r,e),r=r.next}}function bu(t){st(t,vt);for(var e=t.first;e!==null;)bu(e),e=e.next}let to=new Set;const gn=new Map;let wu=!1;function bi(t,e){var r={f:0,v:t,reactions:null,equals:au,rv:0,wv:0};return r}function R(t,e){const r=bi(t);return Mu(r),r}function th(t,e=!1,r=!0){const n=bi(t);return e||(n.equals=ou),n}function d(t,e,r=!1){_e!==null&&(!jr||(_e.f&Qa)!==0)&&lu()&&(_e.f&(Ot|Wr|cs|Qa))!==0&&(mn===null||!mn.has(t))&&Bf();let n=r?_r(e):e;return ks(t,n,za)}var Ui=null,ll=0;function ks(t,e,r=null){if(!t.equals(e)){Jn?gn.set(t,e):gn.has(t)||gn.set(t,t.v);var n=Qi.ensure();if(n.capture(t,e),(t.f&Ot)!==0){const i=t;(t.f&at)!==0&&Nl(i),St===null&&Pl(i)}t.wv=Fu(),Ui=null,ll=0,yu(t,at,r),Ui=null,Ee!==null&&(Ee.f&vt)!==0&&(Ee.f&(Yr|mi))===0&&(Er===null?dh([t]):Er.push(t)),!n.is_fork&&to.size>0&&!wu&&rh()}return e}function rh(){wu=!1;for(const t of to){(t.f&vt)!==0&&st(t,Tr);let e;try{e=wa(t)}catch{e=!0}e&&Ts(t)}to.clear()}function hn(t){d(t,t.v+1)}function yu(t,e,r){var n=t.reactions;if(n!==null){var i=n.length;if(ll+=i,ll>1e5&&Ui===null&&(Ui=new Set),Ui!==null){if(Ui.has(t))return;Ui.add(t)}for(var a=0;a<i;a++){var o=n[a],c=o.f,u=(c&at)===0;if(u&&st(o,e),(c&Qa)!==0)to.add(o);else if((c&Ot)!==0){var f=o;St==null||St.delete(f),yu(f,Tr,r)}else if(u){var _=o;(c&Wr)!==0&&Hr!==null&&Hr.add(_),r!==null?r.push(_):Dl(_)}}}}function _r(t){if(typeof t!="object"||t===null||Ki in t||tu in t)return t;const e=Xc(t);if(e!==sf&&e!==af)return t;var r=new Map,n=go(t),i=R(0),a=Kn,o=c=>{if(Kn===a)return c();var u=_e,f=Kn;Ar(null),cc(a);var _=c();return Ar(u),cc(f),_};return n&&r.set("length",R(t.length)),new Proxy(t,{defineProperty(c,u,f){(!("value"in f)||f.configurable===!1||f.enumerable===!1||f.writable===!1)&&Ff();var _=r.get(u);return _===void 0?o(()=>{var g=R(f.value);return r.set(u,g),g}):d(_,f.value,!0),!0},deleteProperty(c,u){var f=r.get(u);if(f===void 0){if(u in c){const _=o(()=>R(pt));r.set(u,_),hn(i)}}else d(f,pt),hn(i);return!0},get(c,u,f){var b;if(u===Ki)return t;var _=r.get(u),g=u in c;if(_===void 0&&(!g||(b=ls(c,u))!=null&&b.writable)&&(_=o(()=>{var I=_r(g?c[u]:pt),P=R(I);return P}),r.set(u,_)),_!==void 0){var w=s(_);return w===pt?void 0:w}return Reflect.get(c,u,f)},getOwnPropertyDescriptor(c,u){var w;(w=this.has)==null||w.call(this,c,u);var f=Reflect.getOwnPropertyDescriptor(c,u),_=r.get(u);if(_!==void 0){var g=s(_);if(g===pt)return;if(f&&"value"in f)f.value=g;else return{enumerable:!0,configurable:!0,value:g,writable:!0}}return f},has(c,u){var w;if(u===Ki)return!0;var f=r.get(u),_=f!==void 0&&f.v!==pt||Reflect.has(c,u);if(f!==void 0||Ee!==null&&(!_||(w=ls(c,u))!=null&&w.writable)){f===void 0&&(f=o(()=>{var b=_?_r(c[u]):pt,I=R(b);return I}),r.set(u,f));var g=s(f);if(g===pt)return!1}return _},set(c,u,f,_){var U;var g=r.get(u),w=u in c;if(n&&u==="length")for(var b=f;b<g.v;b+=1){var I=r.get(b+"");I!==void 0?d(I,pt):b in c&&(I=o(()=>R(pt)),r.set(b+"",I))}if(g===void 0)(!w||(U=ls(c,u))!=null&&U.writable)&&(g=o(()=>R(void 0)),d(g,_r(f)),r.set(u,g));else{w=g.v!==pt;var P=o(()=>_r(f));d(g,P)}var k=Reflect.getOwnPropertyDescriptor(c,u);if(k!=null&&k.set&&k.set.call(_,f),!w){if(n&&typeof u=="string"){var N=r.get("length"),G=Number(u);Number.isInteger(G)&&G>=N.v&&d(N,G+1)}hn(i)}return!0},ownKeys(c){s(i);var u=Reflect.ownKeys(c).filter(g=>{var w=r.get(g);return w===void 0||w.v!==pt});for(var[f,_]of r)_.v!==pt&&!(f in c)&&u.push(f);return u},setPrototypeOf(){$f()}})}function oc(t){try{if(t!==null&&typeof t=="object"&&Ki in t)return t[Ki]}catch{}return t}function Iu(t,e){return Object.is(oc(t),oc(e))}var cl,Eu,Su,ku,Tu;function nh(){if(cl===void 0){cl=window,Eu=document,Su=/Firefox/.test(navigator.userAgent);var t=Element.prototype,e=Node.prototype,r=Text.prototype;ku=ls(e,"firstChild").get,Tu=ls(e,"nextSibling").get,nc(t)&&(t[rl]=void 0,t[Ha]=null,t[nl]=void 0,t.__e=void 0),nc(r)&&(r[Gs]=void 0)}}function Gn(t=""){return document.createTextNode(t)}function zn(t){return ku.call(t)}function ma(t){return Tu.call(t)}function p(t,e){return zn(t)}function it(t,e=!1){{var r=zn(t);return r instanceof Comment&&r.data===""?ma(r):r}}function E(t,e=!1){return zn(t)}function l(t,e=1,r=!1){let n=t;for(;e--;)n=ma(n);return n}function ih(t){t.textContent=""}function Au(){return!1}function Cu(t,e,r){return e==null||e===iu?r?document.createElement(t,{is:r}):document.createElement(t):r?document.createElementNS(e,t,{is:r}):document.createElementNS(e,t)}function sh(t){var e=Ee;if(e===null)return _e.f|=vi,t;if((e.f&Ps)===0&&(e.f&Is)===0)throw t;pn(t,e)}function pn(t,e){if(t===nu)throw t;if(!(e!==null&&(e.f&kt)!==0)){for(;e!==null;){if((e.f&tl)!==0&&(e.f&(kt|sa))===0){if((e.f&Ps)===0)throw t;try{e.b.error(t);return}catch(r){t=r}}e=e.parent}throw t}}function ah(t){Ee===null&&(_e===null&&Lf(),Df()),Jn&&Of()}function oh(t,e){var r=e.last;r===null?e.last=e.first=t:(r.next=t,t.prev=r,e.last=t)}function Qn(t,e){var r=Ee;r!==null&&(r.f&Vt)!==0&&(t|=Vt);var n={ctx:Nt,deps:null,nodes:null,f:t|at|Kr,first:null,fn:e,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,wv:0,ac:null};W==null||W.register_created_effect(n);var i=n;if((t&Is)!==0)ta!==null?ta.push(n):Qi.ensure().schedule(n);else if(e!==null){try{Ts(n)}catch(o){throw Qt(n),o}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&xs)===0&&(i=i.first,(t&Wr)!==0&&(t&Es)!==0&&i!==null&&(i.f|=Es))}if(i!==null&&(i.parent=r,r!==null&&oh(i,r),_e!==null&&(_e.f&Ot)!==0&&(t&mi)===0)){var a=_e;(a.effects??(a.effects=[])).push(i)}return n}function Ll(){return _e!==null&&!jr}function Ml(t){const e=Qn(bo,null);return st(e,vt),e.teardown=t,e}function Ru(t){ah();var e=Ee.f,r=!_e&&(e&Yr)!==0&&Nt!==null&&!Nt.i;if(r){var n=Nt;(n.e??(n.e=[])).push(t)}else return Pu(t)}function Pu(t){return Qn(Is|uf,t)}function lh(t){Qi.ensure();const e=Qn(mi|xs,t);return(r={})=>new Promise(n=>{r.outro?Ji(e,()=>{Qt(e),n(void 0)}):(Qt(e),n(void 0))})}function Ul(t){return Qn(Is,t)}function ch(t){return Qn(cs|xs,t)}function wo(t,e=0){return Qn(bo|e,t)}function F(t,e=[],r=[],n=[]){qf(n,e,r,i=>{Qn(bo,()=>{t(...i.map(s))})})}function ba(t,e=0){var r=Qn(Wr|e,t);return r}function vr(t){return Qn(Yr|xs,t)}function xu(t){var e=t.teardown;if(e!==null){const r=Jn,n=_e;lc(!0),Ar(null);try{e.call(null)}catch(i){pn(i,t.parent)}finally{lc(r),Ar(n)}}}function Fl(t,e=!1){var r=t.first;for(t.first=t.last=null;r!==null;){const i=r.ac;i!==null&&Ns(()=>{i.abort(ga)});var n=r.next;(r.f&mi)!==0?r.parent=null:Qt(r,e),r=n}}function uh(t){for(var e=t.first;e!==null;){var r=e.next;(e.f&Yr)===0&&Qt(e),e=r}}function Qt(t,e=!0){var r=!1;(e||(t.f&eu)!==0)&&t.nodes!==null&&t.nodes.end!==null&&(Nu(t.nodes.start,t.nodes.end),r=!0),t.f|=sa,Fl(t,e&&!r),oa(t,0);var n=t.nodes&&t.nodes.t;if(n!==null)for(const a of n)a.stop();xu(t),t.f^=sa,t.f|=kt;var i=t.parent;i!==null&&i.first!==null&&Ou(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes=t.ac=t.b=null}function Nu(t,e){for(;t!==null;){var r=t===e?null:ma(t);t.remove(),t=r}}function Ou(t){var e=t.parent,r=t.prev,n=t.next;r!==null&&(r.next=n),n!==null&&(n.prev=r),e!==null&&(e.first===t&&(e.first=n),e.last===t&&(e.last=r))}function Ji(t,e,r=!0){var n=[];t.f|=Tl,Du(t,n,!0);var i=()=>{r&&Qt(t),e&&e()},a=n.length;if(a>0){var o=()=>--a||i();for(var c of n)c.out(o)}else i()}function Du(t,e,r){if((t.f&Vt)===0){t.f^=Vt;var n=t.nodes&&t.nodes.t;if(n!==null)for(const c of n)(c.is_global||r)&&e.push(c);for(var i=t.first;i!==null;){var a=i.next;if((i.f&mi)===0){var o=(i.f&Es)!==0||(i.f&Yr)!==0&&(t.f&Wr)!==0;Du(i,e,o?r:!1)}i=a}}}function ro(t){t.f&=~Tl,Lu(t,!0)}function Lu(t,e){if((t.f&Tl)===0&&(t.f&Vt)!==0){t.f^=Vt,(t.f&vt)===0&&(st(t,at),Qi.ensure().schedule(t));for(var r=t.first;r!==null;){var n=r.next,i=(r.f&Es)!==0||(r.f&Yr)!==0;Lu(r,i?e:!1),r=n}var a=t.nodes&&t.nodes.t;if(a!==null)for(const o of a)(o.is_global||e)&&o.in()}}function $l(t,e){if(t.nodes)for(var r=t.nodes.start,n=t.nodes.end;r!==null;){var i=r===n?null:ma(r);e.append(r),r=i}}let Jn=!1;function lc(t){Jn=t}let _e=null,jr=!1;function Ar(t){_e=t}let Ee=null;function wn(t){Ee=t}let mn=null;function Mu(t){_e!==null&&((_e.f&Za)!==0||(_e.f&Ot)!==0)&&(mn??(mn=new Set)).add(t)}let Xt=null,pr=0,Er=null;function dh(t){Er=t}let Uu=1,Bi=0,Kn=Bi;function cc(t){Kn=t}function Fu(){return++Uu}function wa(t){var e=t.f;if((e&at)!==0)return!0;if((e&Tr)!==0){for(var r=t.deps,n=r.length,i=0;i<n;i++){var a=r[i];if(wa(a)&&hu(a),a.wv>t.wv)return!0}(e&Kr)!==0&&St===null&&st(t,vt)}return!1}function $u(t,e,r=!0){var n=t.reactions;if(n!==null&&!(mn!==null&&mn.has(t)))for(var i=0;i<n.length;i++){var a=n[i];(a.f&Ot)!==0?$u(a,e,!1):e===a&&(r?st(a,at):(a.f&vt)!==0&&st(a,Tr),Dl(a))}}function Bu(t){var e=Xt,r=pr,n=Er,i=_e,a=mn,o=Nt,c=jr,u=Kn,f=t.f;Xt=null,pr=0,Er=null,_e=(f&(Yr|mi))===0?t:null,mn=null,Ss(t.ctx),jr=!1,Kn=++Bi,t.ac!==null&&(Ns(()=>{t.ac.abort(ga)}),t.ac=null);try{t.f|=Za;var _=t.fn,g=_();t.f|=Ps;var w=uc(t);if(lu()&&Er!==null&&!jr&&w!==null&&(t.f&(Ot|Tr|at))===0)for(var b=0;b<Er.length;b++)$u(Er[b],t);if(i!==null&&i!==t){if(Bi++,i.deps!==null)for(let I=0;I<r;I+=1)i.deps[I].rv=Bi;if(e!==null)for(const I of e)I.rv=Bi;Er!==null&&(n===null?n=Er:n.push(...Er))}return(t.f&vi)!==0&&(t.f^=vi),g}catch(I){return uc(t),sh(I)}finally{t.f^=Za,Xt=e,pr=r,Er=n,_e=i,mn=a,Ss(o),jr=c,Kn=u}}function uc(t){var i;var e=t.deps,r=W==null?void 0:W.is_fork;if(Xt!==null){var n;if(r||oa(t,pr),e!==null&&pr>0)for(e.length=pr+Xt.length,n=0;n<Xt.length;n++)e[pr+n]=Xt[n];else t.deps=e=Xt;if(Ll()&&(t.f&Kr)!==0)for(n=pr;n<e.length;n++)((i=e[n]).reactions??(i.reactions=[])).push(t)}else!r&&e!==null&&pr<e.length&&(oa(t,pr),e.length=pr);return e}function fh(t,e){let r=e.reactions;if(r!==null){var n=rf.call(r,t);if(n!==-1){var i=r.length-1;i===0?r=e.reactions=null:(r[n]=r[i],r.pop())}}if(r===null&&(e.f&Ot)!==0&&(Xt===null||!ia.call(Xt,e))){var a=e;(a.f&Kr)!==0&&(a.f^=Kr),a.v!==pt&&Pl(a),a.ac!==null&&Ns(()=>{a.ac.abort(ga),a.ac=null,st(a,at)}),Yf(a),oa(a,0)}}function oa(t,e){var r=t.deps;if(r!==null)for(var n=e;n<r.length;n++)fh(t,r[n])}function Ts(t){var e=t.f;if((e&kt)===0){st(t,vt);var r=Ee;Ee=t;try{(e&(Wr|Zc))!==0?uh(t):Fl(t),xu(t);var n=Bu(t);t.teardown=typeof n=="function"?n:null,t.wv=Uu;var i;Jc&&Vf&&(t.f&at)!==0&&t.deps}finally{Ee=r}}}async function ra(){await Promise.resolve(),Zf()}function s(t){var e=t.f,r=(e&Ot)!==0;if(_e!==null&&!jr){var n=Ee!==null&&(Ee.f&kt)!==0;if(!n&&(mn===null||!mn.has(t))){var i=_e.deps;if((_e.f&Za)!==0)t.rv<Bi&&(t.rv=Bi,Xt===null&&i!==null&&i[pr]===t?pr++:Xt===null?Xt=[t]:Xt.push(t));else{_e.deps??(_e.deps=[]),ia.call(_e.deps,t)||_e.deps.push(t);var a=t.reactions;a===null?t.reactions=[_e]:ia.call(a,_e)||a.push(_e)}}}if(Jn&&gn.has(t))return gn.get(t);if(r){var o=t;if(Jn){var c=o.v;return((o.f&vt)===0&&o.reactions!==null||Vu(o))&&(c=Nl(o)),gn.set(o,c),c}var u=(o.f&Kr)===0&&!jr&&_e!==null&&(_e.f&Kr)!==0,f=(o.f&Ps)===0;wa(o)&&(u&&(o.f|=Kr),hu(o)),u&&!f&&(pu(o),Hu(o))}if(St!=null&&St.has(t))return St.get(t);if((t.f&vi)!==0)throw t.v;return t.v}function Hu(t){if(t.f|=Kr,t.deps!==null)for(const r of t.deps){var e=r.reactions;e===null?r.reactions=[t]:ia.call(e,t)||e.push(t),(r.f&Ot)!==0&&(r.f&Kr)===0&&(pu(r),Hu(r))}}function Vu(t){if(t.v===pt)return!0;if(t.deps===null)return!1;for(const e of t.deps)if(gn.has(e)||(e.f&Ot)!==0&&Vu(e))return!0;return!1}function Os(t){var e=jr;try{return jr=!0,t()}finally{jr=e}}const hh=["touchstart","touchmove"];function ph(t){return hh.includes(t)}const Hi=Symbol("events"),zu=new Set,ul=new Set;function vh(t,e,r,n={}){function i(a){if(n.capture||dl.call(e,a),!a.cancelBubble)return Ns(()=>r==null?void 0:r.call(this,a))}return t.startsWith("pointer")||t.startsWith("touch")||t==="wheel"?(i.__removed=!1,Vn(()=>{i.__removed||e.addEventListener(t,i,n)})):e.addEventListener(t,i,n),i}function Fi(t,e,r,n,i){var a={capture:n,passive:i},o=vh(t,e,r,a);(e===document.body||e===window||e===document||e instanceof HTMLMediaElement)&&Ml(()=>{o.__removed=!0,e.removeEventListener(t,o,a)})}function x(t,e,r){(e[Hi]??(e[Hi]={}))[t]=r}function Wu(t){for(var e=0;e<t.length;e++)zu.add(t[e]);for(var r of ul)r(t)}let Fo=null,$o=!1;function dl(t){var P,k;var e=this,r=e.ownerDocument,n=t.type,i=((P=t.composedPath)==null?void 0:P.call(t))||[],a=i[0]||t.target;Fo=t,$o||($o=!0,setTimeout(()=>{$o=!1,Fo=null}));var o=0,c=Fo===t&&t[Hi];if(c){var u=i.indexOf(c);if(u!==-1&&(e===document||e===window)){t[Hi]=e;return}var f=i.indexOf(e);if(f===-1)return;u<=f&&(o=u)}if(a=i[o]||t.target,a!==e){Yc(t,"currentTarget",{configurable:!0,get(){return a||r}});var _=_e,g=Ee;Ar(null),wn(null);try{for(var w,b=[];a!==null&&a!==e;){try{var I=(k=a[Hi])==null?void 0:k[n];I!=null&&(!a.disabled||t.target===a)&&I.call(a,t)}catch(N){w?b.push(N):w=N}if(t.cancelBubble)break;o++,a=o<i.length?i[o]:null}if(w){for(let N of b)queueMicrotask(()=>{throw N});throw w}}finally{t[Hi]=e,delete t.currentTarget,Ar(_),wn(g)}}}var Gc;const Bo=((Gc=globalThis==null?void 0:globalThis.window)==null?void 0:Gc.trustedTypes)&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:t=>t});function _h(t){return(Bo==null?void 0:Bo.createHTML(t))??t}function gh(t){var e=Cu("template");return e.innerHTML=_h(t.replaceAll("<!>","<!---->")),e.content}function la(t,e){var r=Ee;r.nodes===null&&(r.nodes={start:t,end:e,a:null,t:null})}function C(t,e){var r=(e&If)!==0,n=(e&Ef)!==0,i,a=!t.startsWith("<!>");return()=>{i===void 0&&(i=gh(a?t:"<!>"+t),r||(i=zn(i)));var o=n||Su?document.importNode(i,!0):i.cloneNode(!0);if(r){var c=zn(o),u=o.lastChild;la(c,u)}else la(o,o);return o}}function Ma(){var t=document.createDocumentFragment(),e=document.createComment(""),r=Gn();return t.append(e,r),la(e,r),t}function S(t,e){t!==null&&t.before(e)}function mh(t){let e=0,r=bi(0),n;return()=>{Ll()&&(s(r),wo(()=>(e===0&&(n=Os(()=>t(()=>hn(r)))),e+=1,()=>{Vn(()=>{e-=1,e===0&&(n==null||n(),n=void 0,hn(r))})})))}}var bh=Es|xs;function wh(t,e,r,n){new yh(t,e,r,n)}var Sr,kl,kr,ji,xt,dr,Ht,fr,cn,qi,pi,ys,ha,pa,$n,po,Ie,Ih,Eh,fl,ci,Sh,hl,Xs,Wa,pl,vl;class yh{constructor(e,r,n,i){Z(this,Ie);or(this,"parent");or(this,"is_pending",!1);or(this,"transform_error");Z(this,Sr);Z(this,kl,null);Z(this,kr);Z(this,ji);Z(this,xt);Z(this,dr,null);Z(this,Ht,null);Z(this,fr,null);Z(this,cn,null);Z(this,qi,0);Z(this,pi,0);Z(this,ys,!1);Z(this,ha,new Set);Z(this,pa,new Set);Z(this,$n,null);Z(this,po,mh(()=>(ie(this,$n,bi(h(this,qi))),()=>{ie(this,$n,null)})));var a;ie(this,Sr,e),ie(this,kr,r),ie(this,ji,o=>{var c=Ee;c.b=this,c.f|=tl,n(o)}),this.parent=Ee.b,this.transform_error=i??((a=this.parent)==null?void 0:a.transform_error)??(o=>o),ie(this,xt,ba(()=>{j(this,Ie,hl).call(this)},bh))}defer_effect(e){uu(e,h(this,ha),h(this,pa))}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!h(this,kr).pending}update_pending_count(e,r){j(this,Ie,pl).call(this,e,r),ie(this,qi,h(this,qi)+e),!(!h(this,$n)||h(this,ys))&&(ie(this,ys,!0),Vn(()=>{ie(this,ys,!1),h(this,$n)&&ks(h(this,$n),h(this,qi))}))}get_effect_pending(){return h(this,po).call(this),s(h(this,$n))}error(e){if(e===nu||!h(this,kr).onerror&&!h(this,kr).failed)throw e;W!=null&&W.is_fork?(h(this,dr)&&W.skip_effect(h(this,dr)),h(this,Ht)&&W.skip_effect(h(this,Ht)),h(this,fr)&&W.skip_effect(h(this,fr)),W.oncommit(()=>{j(this,Ie,ci).call(this)||j(this,Ie,vl).call(this,e)})):j(this,Ie,vl).call(this,e)}}Sr=new WeakMap,kl=new WeakMap,kr=new WeakMap,ji=new WeakMap,xt=new WeakMap,dr=new WeakMap,Ht=new WeakMap,fr=new WeakMap,cn=new WeakMap,qi=new WeakMap,pi=new WeakMap,ys=new WeakMap,ha=new WeakMap,pa=new WeakMap,$n=new WeakMap,po=new WeakMap,Ie=new WeakSet,Ih=function(){try{ie(this,dr,vr(()=>h(this,ji).call(this,h(this,Sr))))}catch(e){this.error(e)}},Eh=function(e){const r=h(this,kr).failed,{reset:n,invoke_onerror:i}=j(this,Ie,fl).call(this,e);Vn(i),r&&ie(this,fr,vr(()=>{r(h(this,Sr),()=>e,()=>n)}))},fl=function(e){var r=!1,n=!1;const i=()=>{if(!j(this,Ie,ci).call(this)){if(r){Cf();return}r=!0,n&&Hf(),h(this,fr)!==null&&Ji(h(this,fr),()=>{ie(this,fr,null)}),j(this,Ie,Wa).call(this,()=>{j(this,Ie,hl).call(this)})}};return{reset:i,invoke_onerror:()=>{var o,c;if(!j(this,Ie,ci).call(this))try{n=!0,(c=(o=h(this,kr)).onerror)==null||c.call(o,e,i),n=!1}catch(u){pn(u,h(this,xt)&&h(this,xt).parent)}}}},ci=function(){return(h(this,xt).f&(kt|sa))!==0},Sh=function(){const e=h(this,kr).pending;e&&(this.is_pending=!0,ie(this,Ht,vr(()=>e(h(this,Sr)))),Vn(()=>{if(!j(this,Ie,ci).call(this)){var r=ie(this,cn,document.createDocumentFragment()),n=Gn(),i=!1;if(r.append(n),ie(this,dr,j(this,Ie,Wa).call(this,()=>{try{return vr(()=>h(this,ji).call(this,n))}catch(a){try{this.error(a),i=!0}catch(o){pn(o,h(this,xt).parent)}return null}})),h(this,dr)===null){ie(this,cn,null),i&&j(this,Ie,Xs).call(this,W);return}h(this,pi)===0&&(h(this,Sr).before(r),ie(this,cn,null),Ji(h(this,Ht),()=>{ie(this,Ht,null)}),j(this,Ie,Xs).call(this,W))}}))},hl=function(){try{if(this.is_pending=this.has_pending_snippet(),ie(this,pi,0),ie(this,qi,0),ie(this,dr,vr(()=>{h(this,ji).call(this,h(this,Sr))})),h(this,pi)>0){var e=ie(this,cn,document.createDocumentFragment());$l(h(this,dr),e);const r=h(this,kr).pending;ie(this,Ht,vr(()=>r(h(this,Sr))))}else j(this,Ie,Xs).call(this,W)}catch(r){this.error(r)}},Xs=function(e){this.is_pending=!1,e.transfer_effects(h(this,ha),h(this,pa))},Wa=function(e){var r=Ee,n=_e,i=Nt;wn(h(this,xt)),Ar(h(this,xt)),Ss(h(this,xt).ctx);try{return Qi.ensure(),e()}finally{wn(r),Ar(n),Ss(i)}},pl=function(e,r){var n;if(!this.has_pending_snippet()){this.parent&&j(n=this.parent,Ie,pl).call(n,e,r);return}ie(this,pi,h(this,pi)+e),h(this,pi)===0&&(j(this,Ie,Xs).call(this,r),h(this,Ht)&&Ji(h(this,Ht),()=>{ie(this,Ht,null)}),h(this,cn)&&(h(this,Sr).before(h(this,cn)),ie(this,cn,null)))},vl=function(e){h(this,dr)&&(Qt(h(this,dr)),ie(this,dr,null)),h(this,Ht)&&(Qt(h(this,Ht)),ie(this,Ht,null)),h(this,fr)&&(Qt(h(this,fr)),ie(this,fr,null));let r=h(this,kr).failed;const n=i=>{if(j(this,Ie,ci).call(this))return;const{reset:a,invoke_onerror:o}=j(this,Ie,fl).call(this,i);o(),r&&!j(this,Ie,ci).call(this)&&ie(this,fr,j(this,Ie,Wa).call(this,()=>{try{return vr(()=>{var c=Ee;c.b=this,c.f|=tl,r(h(this,Sr),()=>i,()=>a)})}catch(c){return pn(c,h(this,xt).parent),null}}))};Vn(()=>{if(!j(this,Ie,ci).call(this)){var i;try{i=this.transform_error(e)}catch(a){pn(a,h(this,xt)&&h(this,xt).parent);return}i!==null&&typeof i=="object"&&typeof i.then=="function"?i.then(n,a=>pn(a,h(this,xt)&&h(this,xt).parent)):n(i)}})};function y(t,e){var r=e==null?"":typeof e=="object"?`${e}`:e;r!==(t[Gs]??(t[Gs]=t.nodeValue))&&(t[Gs]=r,t.nodeValue=`${r}`)}function kh(t,e){return Th(t,e)}const Ua=new Map;function Th(t,{target:e,anchor:r,props:n={},events:i,context:a,intro:o=!0,transformError:c}){nh();var u=void 0,f=lh(()=>{var _=r??e.appendChild(Gn());wh(_,{pending:()=>{}},b=>{Al({});var I=Nt;a&&(I.c=a),i&&(n.$$events=i),u=t(b,n)||Rl(),Cl()},c);var g=new Set,w=b=>{for(var I=0;I<b.length;I++){var P=b[I];if(!g.has(P)){g.add(P);var k=ph(P);for(const U of[e,document]){var N=Ua.get(U);N===void 0&&(N=new Map,Ua.set(U,N));var G=N.get(P);G===void 0?(U.addEventListener(P,dl,{passive:k}),N.set(P,1)):N.set(P,G+1)}}}};return w(mo(zu)),ul.add(w),()=>{var k;for(var b of g)for(const N of[e,document]){var I=Ua.get(N),P=I.get(b);--P==0?(N.removeEventListener(b,dl),I.delete(b),I.size===0&&Ua.delete(N)):I.set(b,P)}ul.delete(w),_!==r&&((k=_.parentNode)==null||k.removeChild(_))}});return Ah.set(u,f),u}let Ah=new WeakMap;var zr,un,hr,Gi,va,_a,vo;class ju{constructor(e,r=!0){or(this,"anchor");Z(this,zr,new Map);Z(this,un,new Map);Z(this,hr,new Map);Z(this,Gi,new Set);Z(this,va,!0);Z(this,_a,e=>{if(h(this,zr).has(e)){var r=h(this,zr).get(e),n=h(this,un).get(r);if(n)ro(n),h(this,Gi).delete(r);else{var i=h(this,hr).get(r);i&&(ro(i.effect),h(this,un).set(r,i.effect),h(this,hr).delete(r),i.fragment.lastChild.remove(),this.anchor.before(i.fragment),n=i.effect)}for(const[a,o]of h(this,zr)){if(h(this,zr).delete(a),a===e)break;const c=h(this,hr).get(o);c&&(Qt(c.effect),h(this,hr).delete(o))}for(const[a,o]of h(this,un)){if(a===r||h(this,Gi).has(a))continue;const c=()=>{if(Array.from(h(this,zr).values()).includes(a)){var f=document.createDocumentFragment();$l(o,f),f.append(Gn()),h(this,hr).set(a,{effect:o,fragment:f})}else Qt(o);h(this,Gi).delete(a),h(this,un).delete(a)};h(this,va)||!n?(h(this,Gi).add(a),Ji(o,c,!1)):c()}}});Z(this,vo,e=>{h(this,zr).delete(e);const r=Array.from(h(this,zr).values());for(const[n,i]of h(this,hr))r.includes(n)||(Qt(i.effect),h(this,hr).delete(n))});this.anchor=e,ie(this,va,r)}ensure(e,r){var n=W,i=Au();if(r&&!h(this,un).has(e)&&!h(this,hr).has(e))if(i){var a=document.createDocumentFragment(),o=Gn();a.append(o),h(this,hr).set(e,{effect:vr(()=>r(o)),fragment:a})}else h(this,un).set(e,vr(()=>r(this.anchor)));if(h(this,zr).set(n,e),i){for(const[c,u]of h(this,un))c===e?n.unskip_effect(u):n.skip_effect(u);for(const[c,u]of h(this,hr))c===e?n.unskip_effect(u.effect):n.skip_effect(u.effect);n.oncommit(h(this,_a)),n.ondiscard(h(this,vo))}else h(this,_a).call(this,n)}}zr=new WeakMap,un=new WeakMap,hr=new WeakMap,Gi=new WeakMap,va=new WeakMap,_a=new WeakMap,vo=new WeakMap;function se(t,e,r=!1){var n=new ju(t),i=r?Es:0;function a(o,c){n.ensure(o,c)}ba(()=>{var o=!1;e((c,u=0)=>{o=!0,a(u,c)}),o||a(-1,null)},i)}const Ch=Symbol("NaN");function Rh(t,e,r){var n=new ju(t);ba(()=>{var i=e();i!==i&&(i=Ch),n.ensure(i,r)})}function us(t,e){return e}function Ph(t,e,r){for(var n=[],i=e.length,a,o=e.length,c=0;c<i;c++){let g=e[c];Ji(g,()=>{if(a){if(a.pending.delete(g),a.done.add(g),a.pending.size===0){var w=t.outrogroups;_l(t,mo(a.done)),w.delete(a),w.size===0&&(t.outrogroups=null)}}else o-=1},!1)}if(o===0){var u=n.length===0&&r!==null&&t.pending.size===0;if(u){var f=r,_=f.parentNode;ih(_),_.append(f),t.items.clear()}_l(t,e,!u)}else a={pending:new Set(e),done:new Set},(t.outrogroups??(t.outrogroups=new Set)).add(a)}function _l(t,e,r=!0){var n;if(t.pending.size>0){n=new Set;for(const o of t.pending.values())for(const c of o)n.add(t.items.get(c).e)}for(var i=0;i<e.length;i++){var a=e[i];if(n!=null&&n.has(a)){a.f|=_n;const o=document.createDocumentFragment();$l(a,o)}else Qt(e[i],r)}}var dc;function Me(t,e,r,n,i,a=null){var o=t,c=new Map,u=(e&ru)!==0;if(u){var f=t;o=f.appendChild(Gn())}var _=null,g=fu(()=>{var G=r();return go(G)?G:G==null?[]:mo(G)}),w=new Map,b=!0;function I(G){if((N.effect.f&kt)===0){N.pending.delete(G);var U=s(g);N.fallback=_,xh(N,U,o,e,n),_!==null&&(U.length===0?(_.f&_n)===0?ro(_):(_.f^=_n,Qs(_,null,o)):Ji(_,()=>{_=null}))}}function P(G){N.pending.delete(G)}var k=ba(()=>{for(var G=s(g),U=G.length,O=new Set,H=W,K=Au(),L=0;L<U;L+=1){var X=G[L],$=n(X,L),M=b?null:c.get($);M?(M.v&&ks(M.v,X),M.i&&ks(M.i,L),K&&H.unskip_effect(M.e)):(M=Nh(c,b?o:dc??(dc=Gn()),X,$,L,i,e,r),b||(M.e.f|=_n),c.set($,M)),O.add($)}if(U===0&&a&&!_&&(b?_=vr(()=>a(o)):(_=vr(()=>a(dc??(dc=Gn()))),_.f|=_n)),U>O.size&&Nf(),!b)if(w.set(H,O),K){for(const[ge,pe]of c)O.has(ge)||H.skip_effect(pe.e);H.oncommit(I),H.ondiscard(P)}else I(H);s(g)}),N={effect:k,items:c,pending:w,outrogroups:null,fallback:_};b=!1}function qs(t){for(;t!==null&&(t.f&Yr)===0;)t=t.next;return t}function xh(t,e,r,n,i){var M,ge,pe,Dt,Ye,Ae,Wt,Zt,jt;var a=(n&_f)!==0,o=e.length,c=t.items,u=qs(t.effect.first),f,_=null,g,w=[],b=[],I,P,k,N;if(a)for(N=0;N<o;N+=1)I=e[N],P=i(I,N),k=c.get(P).e,(k.f&_n)===0&&((ge=(M=k.nodes)==null?void 0:M.a)==null||ge.measure(),(g??(g=new Set)).add(k));for(N=0;N<o;N+=1){if(I=e[N],P=i(I,N),k=c.get(P).e,t.outrogroups!==null)for(const Xe of t.outrogroups)Xe.pending.delete(k),Xe.done.delete(k);if((k.f&Vt)!==0&&(ro(k),a&&((Dt=(pe=k.nodes)==null?void 0:pe.a)==null||Dt.unfix(),(g??(g=new Set)).delete(k))),(k.f&_n)!==0)if(k.f^=_n,k===u)Qs(k,null,r);else{var G=_?_.next:u;k===t.effect.last&&(t.effect.last=k.prev),k.prev&&(k.prev.next=k.next),k.next&&(k.next.prev=k.prev),oi(t,_,k),oi(t,k,G),Qs(k,G,r),_=k,w=[],b=[],u=qs(_.next);continue}if(k!==u){if(f!==void 0&&f.has(k)){if(w.length<b.length){var U=b[0],O;_=U.prev;var H=w[0],K=w[w.length-1];for(O=0;O<w.length;O+=1)Qs(w[O],U,r);for(O=0;O<b.length;O+=1)f.delete(b[O]);oi(t,H.prev,K.next),oi(t,_,H),oi(t,K,U),u=U,_=K,N-=1,w=[],b=[]}else f.delete(k),Qs(k,u,r),oi(t,k.prev,k.next),oi(t,k,_===null?t.effect.first:_.next),oi(t,_,k),_=k;continue}for(w=[],b=[];u!==null&&u!==k;)(f??(f=new Set)).add(u),b.push(u),u=qs(u.next);if(u===null)continue}(k.f&_n)===0&&w.push(k),_=k,u=qs(k.next)}if(t.outrogroups!==null){for(const Xe of t.outrogroups)Xe.pending.size===0&&(_l(t,mo(Xe.done)),(Ye=t.outrogroups)==null||Ye.delete(Xe));t.outrogroups.size===0&&(t.outrogroups=null)}if(u!==null||f!==void 0){var L=[];if(f!==void 0)for(k of f)(k.f&Vt)===0&&L.push(k);for(;u!==null;)(u.f&Vt)===0&&u!==t.fallback&&L.push(u),u=qs(u.next);var X=L.length;if(X>0){var $=(n&ru)!==0&&o===0?r:null;if(a){for(N=0;N<X;N+=1)(Wt=(Ae=L[N].nodes)==null?void 0:Ae.a)==null||Wt.measure();for(N=0;N<X;N+=1)(jt=(Zt=L[N].nodes)==null?void 0:Zt.a)==null||jt.fix()}Ph(t,L,$)}}a&&Vn(()=>{var Xe,ut;if(g!==void 0)for(k of g)(ut=(Xe=k.nodes)==null?void 0:Xe.a)==null||ut.apply()})}function Nh(t,e,r,n,i,a,o,c){var u=(o&pf)!==0?(o&gf)===0?th(r,!1,!1):bi(r):null,f=(o&vf)!==0?bi(i):null;return{v:u,i:f,e:vr(()=>(a(e,u??r,f??i,c),()=>{t.delete(n)}))}}function Qs(t,e,r){if(t.nodes)for(var n=t.nodes.start,i=t.nodes.end,a=e&&(e.f&_n)===0?e.nodes.start:r;n!==null;){var o=ma(n);if(a.before(n),n===i)return;n=o}}function oi(t,e,r){e===null?t.effect.first=r:e.next=r,r===null?t.effect.last=e:r.prev=e}function fc(t,e,r=!1,n=!1,i=!1,a=!1){var o=t,c="";if(r)var u=t;F(()=>{var f=Ee;if(c!==(c=e()??"")){if(r&&!su){f.nodes=null,u.innerHTML=c,c!==""&&la(zn(u),u.lastChild);return}if(f.nodes!==null&&(Nu(f.nodes.start,f.nodes.end),f.nodes=null),c!==""){var _=n?Sf:i?kf:void 0,g=Cu(n?"svg":i?"math":"template",_);g.innerHTML=c;var w=n||i?g:g.content;if(la(zn(w),w.lastChild),n||i)for(;zn(w);)o.before(zn(w));else o.before(w)}}})}function Oh(t,e){var r;r=document.head.appendChild(Gn());try{ba(()=>{var n=vr(()=>e(r));n.f|=eu,su||(n.nodes===null?n.nodes={start:r,end:r,a:null,t:null}:n.nodes.end=r)})}finally{}}const hc=[...` 	
\r\f \v\uFEFF`];function Dh(t,e,r){var n=t==null?"":""+t;if(r){for(var i of Object.keys(r))if(r[i])n=n?n+" "+i:i;else if(n.length)for(var a=i.length,o=0;(o=n.indexOf(i,o))>=0;){var c=o+a;(o===0||hc.includes(n[o-1]))&&(c===n.length||hc.includes(n[c]))?n=(o===0?"":n.substring(0,o))+n.substring(c+1):o=c}}return n===""?null:n}function pc(t,e=!1){var r=e?" !important;":";",n="";for(var i of Object.keys(t)){var a=t[i];a!=null&&a!==""&&(n+=" "+i+": "+a+r)}return n}function Lh(t,e){if(e){var r="",n,i;return Array.isArray(e)?(n=e[0],i=e[1]):n=e,n&&(r+=pc(n)),i&&(r+=pc(i,!0)),r=r.trim(),r===""?null:r}return String(t)}function cr(t,e,r,n,i,a){var o=t[rl];if(o!==r||o===void 0){var c=Dh(r,n,a);c==null?t.removeAttribute("class"):t.className=c,t[rl]=r}else if(a&&i!==a)for(var u in a){var f=!!a[u];(i==null||f!==!!i[u])&&t.classList.toggle(u,f)}return a}function Ho(t,e={},r,n){for(var i in r){var a=r[i];e[i]!==a&&(r[i]==null?t.style.removeProperty(i):t.style.setProperty(i,a,n))}}function vc(t,e,r,n){var i=t[nl];if(i!==e){var a=Lh(e,n);a==null?t.removeAttribute("style"):t.style.cssText=a,t[nl]=e}else n&&(Array.isArray(n)?(Ho(t,r==null?void 0:r[0],n[0]),Ho(t,r==null?void 0:r[1],n[1],"important")):Ho(t,r,n));return n}function Mh(t,e){e?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function Uh(t,e){var r=t.__defaultValue,n=t.multiple,i=n?r??[]:null;if(!(n&&!go(i))){t.selectedIndex;for(var a of t.options){var o=ds(a);Mh(a,n?i.includes(o):Iu(o,r))}}}function no(t,e,r=!1){if(t.multiple){if(e==null)return;if(!go(e))return Af();for(var n of t.options)n.selected=e.includes(ds(n));return}for(n of t.options){var i=ds(n);if(Iu(i,e)){n.selected=!0;return}}(!r||e!==void 0)&&(t.selectedIndex=-1)}function lr(t){var e=new MutationObserver(r=>{r.every(Fh)||("__defaultValue"in t&&Uh(t),"__value"in t&&no(t,t.__value))});e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),Ml(()=>{e.disconnect()})}function Br(t,e,r=e){var n=new WeakSet,i=!0;xl(t,"change",a=>{var o=a?"[selected]":":checked",c;if(t.multiple)c=[].map.call(t.querySelectorAll(o),ds);else{var u=t.querySelector(o)??t.querySelector("option:not([disabled])");c=u&&ds(u)}r(c),t.__value=c,W!==null&&n.add(W)}),Ul(()=>{var a=e();if(t===document.activeElement){var o=W;if(n.has(o))return}if(no(t,a,i),i&&a===void 0){var c=t.querySelector(":checked");c!==null&&(a=ds(c),r(a))}t.__value=a,i=!1})}function ds(t){return"__value"in t?t.__value:t.value}function Fh(t){if(t.target.closest("selectedcontent")!==null)return!0;if(t.type==="childList"){var e=[...t.addedNodes,...t.removedNodes];return e.length>0&&e.every(r=>r.nodeName==="SELECTEDCONTENT")}return!1}const $h=Symbol("is custom element"),Bh=Symbol("is html"),Hh=hf?"progress":"PROGRESS";function Yt(t,e){var r=qu(t);r.value===(r.value=e??void 0)||t.value===e&&(e!==0||t.nodeName!==Hh)||(t.value=e??"")}function Et(t,e,r,n){var i=qu(t);i[e]!==(i[e]=r)&&(e==="loading"&&(t[ff]=r),r==null?t.removeAttribute(e):typeof r!="string"&&Vh(t).has(e)?t[e]=r:t.setAttribute(e,r))}function qu(t){return t[Ha]??(t[Ha]={[$h]:t.nodeName.includes("-"),[Bh]:t.namespaceURI===iu})}var _c=new Map;function Vh(t){var e=t.getAttribute("is")||t.nodeName,r=_c.get(e);if(r)return r;_c.set(e,r=new Set);for(var n,i=t,a=Element.prototype;a!==i;){n=nf(i);for(var o in n)n[o].set&&o!=="innerHTML"&&o!=="textContent"&&o!=="innerText"&&r.add(o);i=Xc(i)}return r}function qe(t,e,r=e){var n=new WeakSet;xl(t,"input",async i=>{var a=i?t.defaultValue:t.value;if(a=Vo(t)?zo(a):a,r(a),W!==null&&n.add(W),await ra(),a!==(a=e())){var o=t.selectionStart,c=t.selectionEnd,u=t.value.length;if(t.value=a??"",c!==null){var f=t.value.length;o===c&&c===u&&f>u?(t.selectionStart=f,t.selectionEnd=f):(t.selectionStart=o,t.selectionEnd=Math.min(c,f))}}}),Os(e)==null&&t.value&&(r(Vo(t)?zo(t.value):t.value),W!==null&&n.add(W)),wo(()=>{var i=e();if(t===document.activeElement){var a=W;if(n.has(a))return}Vo(t)&&i===zo(t.value)||t.type==="date"&&!i&&!t.value||i!==t.value&&(t.value=i??"")})}function io(t,e,r=e){xl(t,"change",n=>{var i=n?t.defaultChecked:t.checked;r(i)}),Os(e)==null&&r(t.checked),wo(()=>{var n=e();t.checked=!!n})}function Vo(t){var e=t.type;return e==="number"||e==="range"}function zo(t){return t===""?null:+t}function Wo(t,e){return t===e||(t==null?void 0:t[Ki])===e}function Gu(t=Rl(),e,r,n){var i=Nt.r,a=Ee;return Ul(()=>{var o,c;return wo(()=>{o=c,c=[],Os(()=>{Wo(r(...c),t)||(e(t,...c),o&&Wo(r(...o),t)&&e(null,...o))})}),()=>{let u=a;for(;u!==i&&u.parent!==null&&u.parent.f&sa;)u=u.parent;const f=()=>{c&&Wo(r(...c),t)&&e(null,...c)},_=u.teardown;u.teardown=()=>{f(),_==null||_()}}}),t}let Fa=!1;function zh(t){var e=Fa;try{return Fa=!1,[t(),Fa]}finally{Fa=e}}function jo(t,e,r,n){var O;var i=!0,a=(r&wf)!==0,o=(r&yf)!==0,c=n,u=!0,f=void 0,_=()=>o&&i?(f??(f=aa(n)),s(f)):(u&&(u=!1,c=o?Os(n):n),c);let g;if(a){var w=Ki in t||df in t;g=((O=ls(t,e))==null?void 0:O.set)??(w&&e in t?H=>t[e]=H:void 0)}var b,I=!1;a?[b,I]=zh(()=>t[e]):b=t[e],b===void 0&&n!==void 0&&(b=_(),g&&(Uf(),g(b)));var P;if(P=()=>{var H=t[e];return H===void 0?_():(u=!0,H)},(r&bf)===0)return P;if(g){var k=t.$$legacy;return(function(H,K){return arguments.length>0?((!K||k||I)&&g(K?P():H),H):P()})}var N=!1,G=((r&mf)!==0?aa:fu)(()=>(N=!1,P()));a&&s(G);var U=Ee;return(function(H,K){if(arguments.length>0){const L=K?s(G):a?_r(H):H;return d(G,L),N=!0,c!==void 0&&(c=L),H}return Jn&&N||(U.f&kt)!==0?G.v:s(G)})}function Ku(t){Nt===null&&Pf(),Ru(()=>{const e=Os(t);if(typeof e=="function")return e})}const Wh="5";var Kc;typeof window<"u"&&((Kc=window.__svelte??(window.__svelte={})).v??(Kc.v=new Set)).add(Wh);var dn,fn,Bn,_o,Gr,Zs,ja;const Ql=class Ql extends Map{constructor(r){super();Z(this,Gr);Z(this,dn,new Map);Z(this,fn,R(0));Z(this,Bn,R(0));Z(this,_o,Kn||-1);if(r){for(var[n,i]of r)super.set(n,i);h(this,Bn).v=super.size}}has(r){var n=h(this,dn),i=n.get(r);if(i===void 0)if(super.has(r))i=j(this,Gr,Zs).call(this,0),n.set(r,i);else return s(h(this,fn)),!1;return s(i),!0}forEach(r,n){j(this,Gr,ja).call(this),super.forEach(r,n)}get(r){var n=h(this,dn),i=n.get(r);if(i===void 0)if(super.has(r))i=j(this,Gr,Zs).call(this,0),n.set(r,i);else{s(h(this,fn));return}return s(i),super.get(r)}getOrInsert(r,n){return super.has(r)||this.set(r,n),this.get(r)}getOrInsertComputed(r,n){return super.has(r)||this.set(r,n(r)),this.get(r)}set(r,n){var g;var i=h(this,dn),a=i.get(r),o=super.get(r),c=super.set(r,n),u=h(this,fn);if(a===void 0)a=j(this,Gr,Zs).call(this,0),i.set(r,a),d(h(this,Bn),super.size),hn(u);else if(o!==n){hn(a);var f=u.reactions===null?null:new Set(u.reactions),_=f===null||!((g=a.reactions)!=null&&g.every(w=>f.has(w)));_&&hn(u)}return c}delete(r){var n=h(this,dn),i=n.get(r),a=super.delete(r);return i!==void 0&&(n.delete(r),d(i,-1)),a&&(d(h(this,Bn),super.size),hn(h(this,fn))),a}clear(){if(super.size!==0){super.clear();var r=h(this,dn);d(h(this,Bn),0);for(var n of r.values())d(n,-1);hn(h(this,fn)),r.clear()}}keys(){return s(h(this,fn)),super.keys()}values(){return j(this,Gr,ja).call(this),super.values()}entries(){return j(this,Gr,ja).call(this),super.entries()}[Symbol.iterator](){return this.entries()}get size(){return s(h(this,Bn)),super.size}};dn=new WeakMap,fn=new WeakMap,Bn=new WeakMap,_o=new WeakMap,Gr=new WeakSet,Zs=function(r){return Kn===h(this,_o)?R(r):bi(r)},ja=function(){s(h(this,fn));var r=h(this,dn);if(h(this,Bn).v!==r.size){for(var n of rc(Ql.prototype,this,"keys").call(this))if(!r.has(n)){var i=j(this,Gr,Zs).call(this,0);r.set(n,i)}}for([,i]of h(this,dn))s(i)};let gl=Ql;const gc=Object.freeze({infographic:[1080,1350],carousel:[1080,1350],story:[1080,1920],reel:[1080,1920]});function qa(t=""){return String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[e])}function $a(t,e){return/^#[0-9a-f]{6}$/i.test(t||"")?t:e}function jh(t,e,r){const n=String(t??"").slice(0,12e3).split(/\s+/).filter(Boolean),i=[];let a="";for(const o of n){const c=o.match(new RegExp(`.{1,${e}}`,"gu"))||[];for(const u of c)a&&[...`${a} ${u}`].length>e&&(i.push(a),a=""),a=a?`${a} ${u}`:u}if(a&&i.push(a),i.length>r)throw new Error(`Content exceeds artwork capacity (${r} lines). Shorten the text before exporting.`);return i}function qo(t,e,r,n,i,a,o,c=400,u="DejaVu Sans"){const f=jh(t,Math.max(8,Math.floor(i/(n*.63))),a);return{height:Math.max(1,f.length)*n*1.3,svg:`<text data-preflight-text="true" x="${e}" y="${r}" fill="${o}" font-family="${u}, Noto Sans Devanagari, sans-serif" font-size="${n}" font-weight="${c}">${f.map((_,g)=>`<tspan x="${e}" dy="${g?n*1.3:0}">${qa(_)}</tspan>`).join("")}</text>`}}function qh({brandProfile:t={},campaign:e,format:r="infographic",slideIndex:n=0}){var ge,pe,Dt,Ye,Ae,Wt,Zt,jt,Xe,ut,In;if(!e||!gc[r])throw new Error("A campaign and supported format are required");const[i,a]=gc[r],o=t.colors||[],c=$a((ge=o[0])==null?void 0:ge.hex,"#141513"),u=$a((pe=o[2])==null?void 0:pe.hex,"#C5D86D"),f=$a((Dt=o[3])==null?void 0:Dt.hex,"#F4F1EA"),_=$a((Ye=o[1])==null?void 0:Ye.hex,"#A8C5A0"),g=a===1920,w=r==="reel"?740:900,b=g?400:140;let I,P,k;if(r==="infographic"){const ue=e.infographic;if(!ue||!Array.isArray(ue.statRows))throw new Error("Infographic content missing");I=ue.headline,P=ue.statRows,k=ue.bottomTakeaway}else if(r==="carousel"){const ue=(Wt=(Ae=e.carousel)==null?void 0:Ae.slides)==null?void 0:Wt[n];if(!ue)throw new Error("Carousel slide missing");I=ue.title,P=[ue.bodyMetric],k=ue.visualNote}else if(r==="story"){const ue=e.story;if(!ue)throw new Error("Story content missing");I=ue.hookBanner,P=[ue.keyStatHighlight],k=ue.interactiveStickerPrompt}else{const ue=(jt=(Zt=e.reel)==null?void 0:Zt.beats)==null?void 0:jt[n];if(!ue)throw new Error("Reel beat missing");I=ue.onScreenText||e.reel.spokenHook0to3s,P=[ue.voiceover],k=e.reel.closingCta}const N=(ue,Ne)=>["Mona Sans","Inter","Instrument Serif","DejaVu Sans"].find(Qe=>String(ue||"").split("/")[0].trim()===Qe)||Ne,G=N((Xe=t.fonts)==null?void 0:Xe.heading,"DejaVu Sans"),U=N((ut=t.fonts)==null?void 0:ut.body,"DejaVu Sans"),O=[];let H=b;const K=qo(I,80,H,52,w,5,f,700,G);O.push(K.svg),H+=K.height+72;for(const ue of P){const Ne=qo(ue,106,H,34,w-60,5,f,400,U);O.push(`<path d="M80 ${H-30}v${Ne.height+10}" stroke="${u}" stroke-width="6"/>`,Ne.svg),H+=Ne.height+50}const L=qo(k,80,H+10,29,w,4,_,400,U),X=g?a*.82-35:a-80;if(H+L.height>X)throw new Error("Content exceeds the safe artwork area. Shorten the copy before exporting.");O.push(L.svg);const $=qa([t.logoText,t.brandName||"Campaign Studio"].filter(Boolean).join(" · ")),M=((In=e.provenance)==null?void 0:In.mode)==="synthetic"?"SYNTHETIC DRAFT · REVIEW REQUIRED":"EDITORIAL DRAFT";return`<svg xmlns="http://www.w3.org/2000/svg" width="${i}" height="${a}" viewBox="0 0 ${i} ${a}" role="img" aria-label="${qa(I)}"><title>${qa(I)}</title><rect width="${i}" height="${a}" fill="${c}"/><g font-family="DejaVu Sans, Noto Sans Devanagari, sans-serif"><text data-preflight-text="true" x="80" y="${g?305:65}" fill="${_}" font-size="26" font-weight="700">${$}</text><path d="M80 ${b-55}h920" stroke="${u}" stroke-width="3"/>${O.join("")}<text data-preflight-text="true" x="80" y="${g?Math.floor(a*.8):a-35}" fill="${_}" font-size="19">${M}${r==="carousel"?` · ${n+1}/4`:""}</text></g></svg>`}const Gh=new Set(["infographic","carousel","story","reel"]);function Go(t){if(typeof t!="string"||!/^#[0-9a-f]{6}$/i.test(t))return null;const[e,r,n]=t.slice(1).match(/.{2}/g).map(i=>{const a=parseInt(i,16)/255;return a<=.04045?a/12.92:((a+.055)/1.055)**2.4});return .2126*e+.7152*r+.0722*n}function Kh({format:t,canvas:e,textBoxes:r=[],obstructionBoxes:n=[],foreground:i,background:a,caption:o="",captionLimit:c=125}){if(!Gh.has(t)||!e||!Number.isFinite(e.width)||!Number.isFinite(e.height)||e.width<=0||e.height<=0||e.width>1e4||e.height>1e4)throw new Error("Invalid preflight canvas or format");if(!Array.isArray(r)||r.length>2e3||r.some($=>!$||["x","y","width","height"].some(M=>!Number.isFinite($[M]))||$.width<0||$.height<0))throw new Error("Invalid preflight text rectangles");if(!Array.isArray(n)||n.length>40||n.some($=>!$||["x","y","width","height"].some(M=>!Number.isFinite($[M]))||$.width<0||$.height<0))throw new Error("Invalid preflight obstruction rectangles");if(typeof o!="string"||o.length>2e4||!Number.isInteger(c)||c<40||c>500)throw new Error("Invalid preflight caption settings");const{width:u,height:f}=e,_=t==="story"||t==="reel",g=_?[{x:0,y:0,width:u,height:f*.14},{x:0,y:f*.82,width:u,height:f*.18},...t==="reel"?[{x:u*.82,y:0,width:u*.18,height:f}]:[]]:[],w=r.filter($=>[...g,...n].some(M=>$.x<M.x+M.width&&$.x+$.width>M.x&&$.y<M.y+M.height&&$.y+$.height>M.y)).length,b=r.filter($=>$.x<-1||$.y<-1||$.x+$.width>u+1||$.y+$.height>f+1).length,I=Go(a),P=r.map($=>Go($.foreground||i)).filter($=>$!==null).map($=>I===null?null:(Math.max($,I)+.05)/(Math.min($,I)+.05)).filter($=>$!==null),k=r.filter($=>Go($.foreground||i)===null||I===null).length,N=P.length?Math.round(Math.min(...P)*100)/100:null,G=Math.min(c,o.length),U=/\$\d|\d%/.test(o.slice(0,c)),O=r.length>0,H=_?9/16:4/5,K=u/f,L=Math.abs(K-H)/H;return{simulation:!0,measurementMethod:"client-svg-text-rectangles",requiresReview:!0,metrics:{obstructionElementsCount:n.length,unmeasuredColorCount:k,expectedAspectRatio:_?"9:16":"4:5",actualAspectRatio:Math.round(K*1e4)/1e4,aspectRatioDeviation:L,artworkWidth:u,artworkHeight:f,textElementsCount:r.length,occludedElementsCount:w,overflowElementsCount:b,contrastRatio:N,captionCharacters:o.length,firstLookCharacters:G,firstLookContainsHardNumber:U,safeZoneRegions:{top:_?.14:0,bottom:_?.18:0,right:t==="reel"?.18:0}},checks:[{id:"aspect-ratio",status:L<=.01?"pass":"warning",measured:K,limit:H,message:"Rendered artwork ratio compared with the intended 4:5 or 9:16 export; 1% layout tolerance."},{id:"safe-zones",status:O?w?"warning":"pass":"unmeasured",measured:O?w:null,limit:0,message:"Text rectangles intersecting measured native chrome/stickers or approximate chrome zones; actual Instagram layout can vary."},{id:"artwork-overflow",status:O?b?"warning":"pass":"unmeasured",measured:O?b:null,limit:0,message:"Text rectangles outside the rendered artwork."},{id:"contrast",status:N===null||k>0?"unmeasured":N>=4.5?"pass":"warning",measured:N,limit:4.5,message:"Minimum text fill contrast against the supplied base background, without image/gradient analysis."},{id:"caption-fold",status:o.length>c?"warning":"pass",measured:o.length,limit:c,message:"Configurable approximate caption fold; not an official platform guarantee."}]}}var Jh=C('<div class="statusbar"><span>9:41</span><span class="island"></span><span>▴ ▰ ▮</span></div>'),Yh=C("<!><span> </span>",1),Xh=C('<span class="empty-cell">No scheduled or exported post</span>'),Qh=C("<div><!></div>"),Zh=C('<div class="profile-header"><b> </b><button aria-label="Profile options">☰</button></div> <div class="profile-summary"><span class="avatar large"> </span><span><b> </b> preview posts</span><span>Private<br/>preview</span></div> <div class="profile-bio"><b> </b> <p> </p> <small>Local preview · active first, weekly schedule Monday–Sunday, then newest exports. Not a live Instagram feed.</small></div> <div class="profile-grid"></div>',1),ep=C('<header class="ig-header"><span class="avatar"> </span> <div><b> </b><small>Editorial draft</small></div> <button aria-label="Post options">•••</button></header>'),tp=C('<span class="slide-count"> </span><button class="previous" aria-label="Previous slide">‹</button><button class="next" aria-label="Next slide">›</button>',1),rp=C("<span><i></i></span>"),np=C('<div class="story-chrome"><div class="timer-bars"></div> <div class="story-header"><span class="avatar"> </span><b> </b><span>Draft</span><button> </button><button aria-label="Close story preview">×</button></div></div> <div class="poll-sticker"><b> </b> <div><button> </button><button> </button></div> <small> </small></div> <div class="story-reply"><input aria-label="Story reply preview" placeholder="Send message…"/><button aria-label="Like story"> </button><button aria-label="Share story preview">➤</button></div>',1),ip=C('<div class="reel-top"><b>Reels</b><span>Storyboard simulation</span></div> <div class="reel-rail"><button aria-label="Like reel"> <small> </small></button><button aria-label="Comment on reel">♧<small> </small></button><button aria-label="Share reel preview">➤</button><button aria-label="Reel options">•••</button><span>♫</span></div> <div class="reel-meta"><b> </b><button> </button> <p> </p> <div class="audio">♫ Original audio · storyboard, no audio playback</div></div>',1),sp=C('<div class="danger right">18%</div>'),ap=C('<div class="safe-mask" aria-label="Simulated safe-zone overlay"><div class="danger top">Top 14% · chrome risk</div> <div class="danger bottom">Bottom 18% · caption / reply risk</div> <!> <div class="clear-zone">Inspect text clearance</div></div>'),op=C('<span class="floating-heart">♥</span>'),lp=C('<div class="reel-controls"><button> </button><input aria-label="Reel scrubber" type="range" min="0" max="30" step=".25"/><output data-testid="active-beat"> </output></div>'),cp=C("<button>●</button>"),up=C('<div class="dots"></div>'),dp=C("<button> </button>"),fp=C('<div class="engagement"><button aria-label="Like post"> </button><button aria-label="Comment on post">♧</button><button aria-label="Share post preview">➤</button><!><button class="bookmark" aria-label="Save post locally"> </button></div> <p class="local-count"> </p> <div class="caption"><b> </b> <!><small>LOCAL DRAFT · NO INSTAGRAM CONNECTION</small></div>',1),hp=C(`<div class="fold-ruler"><label>Approximate fold <input aria-label="Caption fold threshold" type="number" min="40" max="500"/> characters</label> <p><mark> </mark><span class="fold-line">│</span> </p> <small>Configurable simulation. Actual truncation varies by app, device
              and layout.</small></div>`),pp=C('<!> <div role="group" aria-label="Artwork preview"><div class="artwork"></div> <!> <!> <!> <!> <!></div> <!> <!> <!>',1),vp=C("<p> </p>"),_p=C('<div class="comment-panel"><b>Local comments</b><!> <form><input aria-label="Local comment" placeholder="Write a preview comment"/><button>Add</button></form></div>'),gp=C('<p class="local-notice" role="status"> </p>'),mp=C(`<div class="measurements"><span><b> </b> text boxes in chrome zones</span><span><b> </b> text boxes outside artwork</span><span><b> </b> </span><span><b> </b> </span><span><b> </b> caption characters before simulated
          fold</span></div> <p class="small muted">Measured SVG text boxes and fill contrast against the base background;
        images, glyph shapes and all native app variations are not covered.
        Review required. No confidence score is inferred.</p>`,1),bp=C('<p class="small muted">Open a design or Instagram surface to measure the rendered SVG.</p>'),wp=C(`<section class="emulator" aria-label="Instagram preview simulator"><div class="preview-heading"><div><span class="eyebrow">PREVIEW LAB</span> <h3>See it in context.</h3></div> <span class="simulation">Local simulation</span></div> <div class="segmented" aria-label="Preview mode"><button>Design Mode</button> <button>In-Situ Instagram</button> <button>3×3 Profile Grid</button></div> <div class="preview-controls"><label>Phone width <select><option>375 px</option><option>390 px · generic</option><option>402 px · iPhone 16 Pro</option><option>430 px</option></select></label> <label>Zoom <input aria-label="Preview zoom" type="range" min="55" max="125" step="5"/><output> </output></label> <label><input type="checkbox"/>Safe zones</label> <label><input type="checkbox"/>Caption ruler</label></div> <p class="muted small">Approximate Instagram chrome. Local interactions only. Validate final assets
    in Instagram before publishing.</p> <div class="phone-well"><div aria-label="Simulated phone viewport"><!> <!> <!> <!></div></div> <div class="evidence"><div class="evidence-title"><b>Measured preflight</b><button>Measure again</button></div> <!></div></section>`);function yp(t,e){Al(e,!0);let r=jo(e,"format",3,"infographic"),n=jo(e,"backlog",19,()=>[]),i=jo(e,"onpreflight",3,()=>{}),a=R("instagram"),o=R(85),c=R(402),u=R(!1),f=R(!0),_=R(125),g=R(0),w=R(!1),b=R(!1),I=R(!1),P=R(""),k=R(_r([])),N=R(!1),G=R(""),U=R(null),O=R(0),H=R(0),K=R(!1),L=R(0),X=R(!1),$=R(!1),M=0,ge=R(void 0),pe=R(null);function Dt(A){try{return qh(A)}catch{return'<div class="artwork-error">Artwork exceeds its layout. Shorten the copy and save before export.</div>'}}let Ye=It(()=>{var A,J;return(((A=e.brandProfile)==null?void 0:A.handle)||((J=e.brandProfile)==null?void 0:J.brandName)||"studio").replace(/[^a-zA-Z0-9_.]/g,"").toLowerCase()}),Ae=It(()=>{var A,J,Ce,ot;return((J=(A=e.campaign)==null?void 0:A.infographic)==null?void 0:J.caption)||((ot=(Ce=e.campaign)==null?void 0:Ce.story)==null?void 0:ot.hookBanner)||""}),Wt=It(()=>{var J,Ce,ot;const A=((Ce=(J=e.campaign)==null?void 0:J.reel)==null?void 0:Ce.beats)||[];for(let Tt=A.length-1;Tt>=0;Tt--){const He=(ot=A[Tt].timecode)==null?void 0:ot.match(/^(\d+):(\d+)/);if(He&&s(L)>=Number(He[1])*60+Number(He[2]))return Tt}return 0}),Zt=It(()=>Dt({campaign:e.campaign,brandProfile:e.brandProfile,format:r(),slideIndex:r()==="reel"?s(Wt):s(g)})),jt=It(()=>{var A,J;return((J=(A=e.campaign)==null?void 0:A.carousel)==null?void 0:J.slides)||[]});const Xe=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];let ut=It(()=>[{id:"active",campaignDraft:e.campaign,title:"Active campaign",gridLabel:"Active"},...n().filter(A=>A.id!==e.activeStoryId&&A.campaignDraft&&["Scheduled","Exported"].includes(A.status)).sort((A,J)=>A.status!==J.status?A.status==="Scheduled"?-1:1:A.status==="Scheduled"?Xe.indexOf(A.scheduledDay)-Xe.indexOf(J.scheduledDay):(Date.parse(J.exportedAt)||0)-(Date.parse(A.exportedAt)||0)).slice(0,8).map(A=>({...A,gridLabel:A.status==="Scheduled"?`Scheduled · ${A.scheduledDay}`:`Exported${A.exportedAt?` · ${new Date(A.exportedAt).toLocaleString()}`:" · time unavailable"}`}))]);Ru(()=>{JSON.stringify(e.campaign),r(),s(a),s(c),s(o),s(g),s(_),s(Wt),s(O),s(U),s(I),s(w),s(b),s($),s(k).length;const A=setTimeout(()=>{En()},160);return()=>clearTimeout(A)}),Ku(()=>{window.innerWidth<700&&d(o,75);const A=setInterval(()=>{s(X)&&(d(L,Math.min(30,s(L)+.25),!0),s(L)>=30&&d(X,!1)),s(K)&&(d(H,s(H)+.25),s(H)>=5&&(d(H,0),d(O,(s(O)+1)%4)))},250);return document.fonts.addEventListener("loadingdone",En),()=>{clearInterval(A),document.fonts.removeEventListener("loadingdone",En)}});function In(A){d(a,A,!0),d(X,!1),d(K,!1)}function ue(A){r()==="carousel"&&d(g,Math.max(0,Math.min(s(jt).length-1,s(g)+A)),!0),r()==="story"&&(d(O,(s(O)+A+4)%4),d(H,0))}function Ne(A){var J;["INPUT","TEXTAREA","SELECT"].includes((J=A.target)==null?void 0:J.tagName)||(A.key==="ArrowRight"&&ue(1),A.key==="ArrowLeft"&&ue(-1))}function Qe(A){if(/^#[0-9a-f]{6}$/i.test(A))return A;const J=A.match(/[\d.]+/g);return(J==null?void 0:J.length)>=3?"#"+J.slice(0,3).map(Ce=>Math.round(Number(Ce)).toString(16).padStart(2,"0")).join(""):null}async function En(){var tr;if(await ra(),await document.fonts.ready,!s(ge)||s(a)==="grid"){d(pe,null);return}const A=s(ge).getBoundingClientRect();if(!A.width||!A.height)return;const J=[...s(ge).querySelectorAll("svg text")],Ce=Qe(((tr=s(ge).querySelector("svg rect"))==null?void 0:tr.getAttribute("fill"))||"#141513"),ot=J.map(Mt=>{const Ze=Mt.getBoundingClientRect();return{x:Ze.x-A.x,y:Ze.y-A.y,width:Ze.width,height:Ze.height,foreground:Qe(getComputedStyle(Mt).fill)}}),Tt=s(ge).parentElement,He=s(a)==="instagram"?[...Tt.querySelectorAll(".poll-sticker,.reel-rail,.reel-meta,.reel-top,.story-chrome,.story-reply,.slide-count,.previous,.next,.floating-heart")].map(Mt=>{const Ze=Mt.getBoundingClientRect(),xr=Mt.classList.contains("reel-meta")?getComputedStyle(Mt,"::before"):null,Gt=Pn=>xr&&xr.content!=="none"?Math.min(0,parseFloat(xr[Pn])||0):0,rr=Gt("left"),Nr=Gt("right"),Or=Gt("top"),Rn=Gt("bottom");return{x:Ze.x-A.x+rr,y:Ze.y-A.y+Or,width:Ze.width-rr-Nr,height:Ze.height-Or-Rn}}):[],At={format:r(),obstructionBoxes:He,canvas:{width:A.width,height:A.height},textBoxes:ot,background:Ce,caption:s(Ae),captionLimit:Number(s(_)),viewContext:{mode:s(a),frameIndex:r()==="reel"?s(Wt):s(g),storyFrame:s(O),pollVote:s(U),measuredAt:new Date().toISOString()}},Ct=Kh(At);d(pe,Ct.metrics,!0),i()(At)}function es(){s(P).trim()&&(d(k,[...s(k),s(P).trim()],!0),d(P,""))}async function Sn(){d(G,"Local share preview opened. Nothing was published.")}var er=wp();Fi("keydown",cl,Ne);var ts=l(p(er),2),Ii=p(ts);let Ei;var Zn=l(Ii,2);let rs;var gr=l(Zn,2);let Ls;var ei=l(ts,2),Cr=p(ei),qt=l(p(Cr)),ti=p(qt);ti.value=ti.__value=375;var Rr=l(ti);Rr.value=Rr.__value=390;var Ge=l(Rr);Ge.value=Ge.__value=402;var Ms=l(Ge);Ms.value=Ms.__value=430,lr(qt);var Si=l(Cr,2),Us=l(p(Si)),Fs=l(Us),ko=E(Fs),ki=l(Si,2),Aa=p(ki),kn=l(ki,2),Lt=p(kn),ns=l(ei,4),Tn=p(ns);let Ti,Ca;var Ra=p(Tn);{var To=A=>{var J=Jh();S(A,J)};se(Ra,A=>{s(a)!=="design"&&A(To)})}var Pa=l(Ra,2);{var $s=A=>{var J=Zh(),Ce=it(J),ot=p(Ce),Tt=E(ot,!0),He=l(ot),At=l(Ce,2),Ct=p(At),tr=E(Ct,!0),Mt=l(Ct),Ze=p(Mt),xr=E(Ze,!0),Gt=l(At,2),rr=p(Gt),Nr=E(rr,!0),Or=l(rr,2),Rn=E(Or,!0),Pn=l(Gt,2);Me(Pn,20,()=>Array(9),us,(mr,br,v)=>{var m=Qh();cr(m,1,"grid-cell",null,{},{current:v===0});var T=p(m);{var V=ve=>{var Re=Yh(),D=it(Re);fc(D,()=>Dt({campaign:s(ut)[v].campaignDraft,brandProfile:e.brandProfile,format:"infographic"}));var ae=l(D),te=E(ae,!0);F(()=>y(te,s(ut)[v].gridLabel)),S(ve,Re)},le=ve=>{var Re=Xh();S(ve,Re)};se(T,ve=>{s(ut)[v]?ve(V):ve(le,-1)})}F(()=>{var ve;return Et(m,"title",((ve=s(ut)[v])==null?void 0:ve.title)||"Empty slot")}),S(mr,m)}),F(mr=>{var br,v;y(Tt,s(Ye)),y(tr,mr),y(xr,s(ut).length),y(Nr,(br=e.brandProfile)==null?void 0:br.brandName),y(Rn,(v=e.brandProfile)==null?void 0:v.tagline)},[()=>{var mr,br;return((br=(mr=e.brandProfile)==null?void 0:mr.logoText)==null?void 0:br.slice(0,2))||s(Ye).slice(0,2)}]),x("click",He,()=>d(G,"Profile options are a local simulation.")),S(A,J)},An=A=>{var J=pp(),Ce=it(J);{var ot=D=>{var ae=ep(),te=p(ae),ye=E(te,!0),Ue=l(te,2),Ve=p(Ue),Rt=E(Ve,!0),et=l(Ue,2);F(Ut=>{y(ye,Ut),y(Rt,s(Ye))},[()=>s(Ye).slice(0,2)]),x("click",et,()=>d(G,"Post menu preview. Export to save an actual file.")),S(D,ae)},Tt=It(()=>s(a)==="instagram"&&!["story","reel"].includes(r()));se(Ce,D=>{s(Tt)&&D(ot)})}var He=l(Ce,2);let At;var Ct=p(He);fc(Ct,()=>s(Zt),!0),Gu(Ct,D=>d(ge,D),()=>s(ge));var tr=l(Ct,2);{var Mt=D=>{var ae=tp(),te=it(ae),ye=E(te),Ue=l(te),Ve=l(Ue);F(()=>{y(ye,`${s(g)+1}/${s(jt).length??""}`),Ue.disabled=s(g)===0,Ve.disabled=s(g)===s(jt).length-1}),x("click",Ue,()=>ue(-1)),x("click",Ve,()=>ue(1)),S(D,ae)};se(tr,D=>{s(a)==="instagram"&&r()==="carousel"&&D(Mt)})}var Ze=l(tr,2);{var xr=D=>{var ae=np(),te=it(ae),ye=p(te);Me(ye,20,()=>[0,1,2,3],ai=>ai,(ai,Ri)=>{var Pi=rp(),xo=p(Pi);let Na;F(()=>Na=vc(xo,"",Na,{width:`${Ri<s(O)?100:Ri===s(O)?s(H)*20:0}%`})),S(ai,Pi)});var Ue=l(ye,2),Ve=p(Ue),Rt=E(Ve,!0),et=l(Ve),Ut=E(et,!0),dt=l(et,2),ri=E(dt,!0),Xr=l(dt),xn=l(te,2),Nn=p(xn),ni=E(Nn,!0),On=l(Nn,2),Dr=p(On);let Lr;var ii=E(Dr),bt=l(Dr);let Kt;var Dn=E(bt),Ws=l(On,2),Ci=E(Ws,!0),si=l(xn,2),Ln=l(p(si)),xa=E(Ln,!0),Po=l(Ln);F(ai=>{var Ri,Pi;y(Rt,ai),y(Ut,s(Ye)),Et(dt,"aria-label",s(K)?"Pause story":"Play story"),y(ri,s(K)?"Ⅱ":"▶"),y(ni,(Pi=(Ri=e.campaign)==null?void 0:Ri.story)==null?void 0:Pi.interactiveStickerPrompt),Lr=cr(Dr,1,"",null,Lr,{voted:s(U)==="A"}),y(ii,`Investigate ${s(U)?s(U)==="A"?"✓ 100%":"0%":""}`),Kt=cr(bt,1,"",null,Kt,{voted:s(U)==="B"}),y(Dn,`Read sources ${s(U)?s(U)==="B"?"✓ 100%":"0%":""}`),y(Ci,s(U)?"Your one local vote · simulated result":"Try a local poll vote"),Et(Ln,"aria-pressed",s(w)),y(xa,s(w)?"♥":"♡")},[()=>s(Ye).slice(0,2)]),x("click",dt,()=>d(K,!s(K))),x("click",Xr,()=>In("design")),x("click",Dr,()=>d(U,"A")),x("click",bt,()=>d(U,"B")),x("click",Ln,()=>d(w,!s(w))),x("click",Po,Sn),S(D,ae)};se(Ze,D=>{s(a)==="instagram"&&r()==="story"&&D(xr)})}var Gt=l(Ze,2);{var rr=D=>{var ae=ip(),te=l(it(ae),2),ye=p(te),Ue=p(ye),Ve=l(Ue),Rt=E(Ve,!0),et=l(ye),Ut=l(p(et)),dt=E(Ut,!0),ri=l(et),Xr=l(ri),xn=l(Xr);let Nn;var ni=l(te,2),On=p(ni),Dr=E(On,!0),Lr=l(On),ii=E(Lr,!0),bt=l(Lr,2),Kt=E(bt);F(Dn=>{Et(ye,"aria-pressed",s(w)),y(Ue,s(w)?"♥":"♡"),y(Rt,s(w)?1:0),y(dt,s(k).length),Nn=cr(xn,1,"vinyl",null,Nn,{spinning:s(X)}),y(Dr,s(Ye)),Et(Lr,"aria-pressed",s($)),y(ii,s($)?"Following":"+ Follow"),y(Kt,`${Dn??""}${s(Ae).length>s(_)?"…":""}`)},[()=>s(Ae).slice(0,s(_))]),x("click",ye,()=>d(w,!s(w))),x("click",et,()=>d(N,!s(N))),x("click",ri,Sn),x("click",Xr,()=>d(G,"Reel options preview; nothing is published.")),x("click",Lr,()=>d($,!s($))),S(D,ae)};se(Gt,D=>{s(a)==="instagram"&&r()==="reel"&&D(rr)})}var Nr=l(Gt,2);{var Or=D=>{var ae=ap(),te=l(p(ae),4);{var ye=Ue=>{var Ve=sp();S(Ue,Ve)};se(te,Ue=>{r()==="reel"&&Ue(ye)})}S(D,ae)},Rn=It(()=>s(u)&&["story","reel"].includes(r()));se(Nr,D=>{s(Rn)&&D(Or)})}var Pn=l(Nr,2);{var mr=D=>{var ae=op();S(D,ae)},br=It(()=>s(w)&&s(G).includes("Liked"));se(Pn,D=>{s(br)&&D(mr)})}var v=l(He,2);{var m=D=>{var ae=lp(),te=p(ae),ye=E(te,!0),Ue=l(te),Ve=l(Ue),Rt=E(Ve);F(et=>{y(ye,s(X)?"Pause reel":"Play reel"),y(Rt,`BEAT ${s(Wt)+1} · ${et??""} / 30s`)},[()=>Math.floor(s(L))]),x("click",te,()=>d(X,!s(X))),qe(Ue,()=>s(L),et=>d(L,et)),S(D,ae)};se(v,D=>{r()==="reel"&&D(m)})}var T=l(v,2);{var V=D=>{var ae=fp(),te=it(ae),ye=p(te),Ue=E(ye,!0),Ve=l(ye),Rt=l(Ve),et=l(Rt);{var Ut=bt=>{var Kt=up();Me(Kt,21,()=>s(jt),us,(Dn,Ws,Ci)=>{var si=cp();Et(si,"aria-label",`Go to slide ${Ci+1}`);let Ln;F(()=>Ln=cr(si,1,"",null,Ln,{active:s(g)===Ci})),x("click",si,()=>d(g,Ci,!0)),S(Dn,si)}),S(bt,Kt)};se(et,bt=>{r()==="carousel"&&bt(Ut)})}var dt=l(et),ri=E(dt,!0),Xr=l(te,2),xn=E(Xr),Nn=l(Xr,2),ni=p(Nn),On=E(ni,!0),Dr=l(ni),Lr=l(Dr);{var ii=bt=>{var Kt=dp(),Dn=E(Kt,!0);F(()=>y(Dn,s(I)?"less":"… more")),x("click",Kt,()=>d(I,!s(I))),S(bt,Kt)};se(Lr,bt=>{s(Ae).length>s(_)&&bt(ii)})}F(bt=>{Et(ye,"aria-pressed",s(w)),y(Ue,s(w)?"♥":"♡"),Et(dt,"aria-pressed",s(b)),y(ri,s(b)?"▣":"♧"),y(xn,`${s(w)?1:0} local likes · ${s(b)?"Saved in preview":"Preview only"}`),y(On,s(Ye)),y(Dr,` ${bt??""}`)},[()=>s(I)?s(Ae):s(Ae).slice(0,s(_))]),x("click",ye,()=>d(w,!s(w))),x("click",Ve,()=>d(N,!s(N))),x("click",Rt,Sn),x("click",dt,()=>d(b,!s(b))),S(D,ae)},le=It(()=>s(a)==="instagram"&&!["story","reel"].includes(r()));se(T,D=>{s(le)&&D(V)})}var ve=l(T,2);{var Re=D=>{var ae=hp(),te=p(ae),ye=l(p(te)),Ue=l(te,2),Ve=p(Ue),Rt=E(Ve,!0),et=l(Ve,2,!0);F((Ut,dt)=>{y(Rt,Ut),y(et,dt)},[()=>s(Ae).slice(0,s(_)),()=>s(Ae).slice(s(_))]),qe(ye,()=>s(_),Ut=>d(_,Ut)),S(D,ae)};se(ve,D=>{s(f)&&D(Re)})}F(D=>At=cr(He,1,"asset-stage",null,At,{vertical:D}),[()=>["story","reel"].includes(r())]),x("pointerdown",He,D=>M=D.clientX),x("pointerup",He,D=>{Math.abs(D.clientX-M)>40&&ue(D.clientX<M?1:-1)}),x("dblclick",He,()=>{d(w,!0),d(G,"Liked in this simulation")}),S(A,J)};se(Pa,A=>{s(a)==="grid"?A($s):A(An,-1)})}var Bs=l(Pa,2);{var Ao=A=>{var J=_p(),Ce=l(p(J));Me(Ce,17,()=>s(k),us,(He,At)=>{var Ct=vp(),tr=E(Ct,!0);F(()=>y(tr,s(At))),S(He,Ct)});var ot=l(Ce,2),Tt=p(ot);Fi("submit",ot,He=>{He.preventDefault(),es()}),qe(Tt,()=>s(P),He=>d(P,He)),S(A,J)};se(Bs,A=>{s(N)&&A(Ao)})}var Cn=l(Bs,2);{var Co=A=>{var J=gp(),Ce=E(J,!0);F(()=>y(Ce,s(G))),S(A,J)};se(Cn,A=>{s(G)&&A(Co)})}var Ro=l(ns,2),Hs=p(Ro),Vs=l(p(Hs)),Pr=l(Hs,2);{var Ai=A=>{var J=mp(),Ce=it(J),ot=p(Ce),Tt=p(ot),He=E(Tt,!0),At=l(ot),Ct=p(At),tr=E(Ct,!0),Mt=l(At),Ze=p(Mt),xr=E(Ze),Gt=l(Ze),rr=l(Mt),Nr=p(rr),Or=E(Nr,!0),Rn=l(Nr),Pn=l(rr),mr=p(Pn),br=E(mr,!0);F(()=>{y(He,s(pe).occludedElementsCount),y(tr,s(pe).overflowElementsCount),y(xr,`${s(pe).contrastRatio??"Unmeasured"??""}${s(pe).contrastRatio!==null?":1":""}`),y(Gt,` minimum text/background contrast${s(pe).unmeasuredColorCount?` · ${s(pe).unmeasuredColorCount} unmeasured`:""}`),y(Or,s(pe).expectedAspectRatio),y(Rn,` target ratio · ${s(pe).aspectRatioDeviation<=.01?"matched":"check dimensions"}`),y(br,s(pe).firstLookCharacters)}),S(A,J)},zs=A=>{var J=bp();S(A,J)};se(Pr,A=>{s(pe)?A(Ai):A(zs,-1)})}F(A=>{Ei=cr(Ii,1,"",null,Ei,{active:s(a)==="design"}),rs=cr(Zn,1,"",null,rs,{active:s(a)==="instagram"}),Ls=cr(gr,1,"",null,Ls,{active:s(a)==="grid"}),y(ko,`${s(o)??""}%`),Ti=cr(Tn,1,"phone",null,Ti,{raw:s(a)==="design"}),Ca=vc(Tn,"",Ca,{width:`${s(c)??""}px`,height:A,zoom:s(o)/100})},[()=>s(a)==="design"?"auto":`${Math.round(s(c)*874/402)}px`]),x("click",Ii,()=>In("design")),x("click",Zn,()=>In("instagram")),x("click",gr,()=>In("grid")),Br(qt,()=>s(c),A=>d(c,A)),qe(Us,()=>s(o),A=>d(o,A)),io(Aa,()=>s(u),A=>d(u,A)),io(Lt,()=>s(f),A=>d(f,A)),x("click",Vs,En),S(t,er),Cl()}Wu(["click","pointerdown","pointerup","dblclick"]);const Ip=()=>{};var mc={};/**
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
 */const Ju=function(t){const e=[];let r=0;for(let n=0;n<t.length;n++){let i=t.charCodeAt(n);i<128?e[r++]=i:i<2048?(e[r++]=i>>6|192,e[r++]=i&63|128):(i&64512)===55296&&n+1<t.length&&(t.charCodeAt(n+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++n)&1023),e[r++]=i>>18|240,e[r++]=i>>12&63|128,e[r++]=i>>6&63|128,e[r++]=i&63|128):(e[r++]=i>>12|224,e[r++]=i>>6&63|128,e[r++]=i&63|128)}return e},Ep=function(t){const e=[];let r=0,n=0;for(;r<t.length;){const i=t[r++];if(i<128)e[n++]=String.fromCharCode(i);else if(i>191&&i<224){const a=t[r++];e[n++]=String.fromCharCode((i&31)<<6|a&63)}else if(i>239&&i<365){const a=t[r++],o=t[r++],c=t[r++],u=((i&7)<<18|(a&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const a=t[r++],o=t[r++];e[n++]=String.fromCharCode((i&15)<<12|(a&63)<<6|o&63)}}return e.join("")},Yu={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const r=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let i=0;i<t.length;i+=3){const a=t[i],o=i+1<t.length,c=o?t[i+1]:0,u=i+2<t.length,f=u?t[i+2]:0,_=a>>2,g=(a&3)<<4|c>>4;let w=(c&15)<<2|f>>6,b=f&63;u||(b=64,o||(w=64)),n.push(r[_],r[g],r[w],r[b])}return n.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Ju(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Ep(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const r=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let i=0;i<t.length;){const a=r[t.charAt(i++)],c=i<t.length?r[t.charAt(i)]:0;++i;const f=i<t.length?r[t.charAt(i)]:64;++i;const g=i<t.length?r[t.charAt(i)]:64;if(++i,a==null||c==null||f==null||g==null)throw new Sp;const w=a<<2|c>>4;if(n.push(w),f!==64){const b=c<<4&240|f>>2;if(n.push(b),g!==64){const I=f<<6&192|g;n.push(I)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Sp extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const kp=function(t){const e=Ju(t);return Yu.encodeByteArray(e,!0)},Xu=function(t){return kp(t).replace(/\./g,"")},Qu=function(t){try{return Yu.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Tp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Ap=()=>Tp().__FIREBASE_DEFAULTS__,Cp=()=>{if(typeof process>"u"||typeof mc>"u")return;const t=mc.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Rp=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Qu(t[1]);return e&&JSON.parse(e)},Bl=()=>{try{return Ip()||Ap()||Cp()||Rp()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Pp=t=>{var e,r;return(r=(e=Bl())==null?void 0:e.emulatorHosts)==null?void 0:r[t]},Zu=()=>{var t;return(t=Bl())==null?void 0:t.config},ed=t=>{var e;return(e=Bl())==null?void 0:e[`_${t}`]};/**
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
 */class xp{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,r)=>{this.resolve=e,this.reject=r})}wrapCallback(e){return(r,n)=>{r?this.reject(r):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(r):e(r,n))}}}/**
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
 */function zt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Np(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(zt())}function Op(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Dp(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Lp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Mp(){const t=zt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Up(){try{return typeof indexedDB=="object"}catch{return!1}}function Fp(){return new Promise((t,e)=>{try{let r=!0;const n="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(n);i.onsuccess=()=>{i.result.close(),r||self.indexedDB.deleteDatabase(n),t(!0)},i.onupgradeneeded=()=>{r=!1},i.onerror=()=>{var a;e(((a=i.error)==null?void 0:a.message)||"")}}catch(r){e(r)}})}/**
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
 */const $p="FirebaseError";class wi extends Error{constructor(e,r,n){super(r),this.code=e,this.customData=n,this.name=$p,Object.setPrototypeOf(this,wi.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ya.prototype.create)}}class ya{constructor(e,r,n){this.service=e,this.serviceName=r,this.errors=n}create(e,...r){const n=r[0]||{},i=`${this.service}/${e}`,a=this.errors[e],o=a?Bp(a,n):"Error",c=`${this.serviceName}: ${o} (${i}).`;return new wi(i,c,n)}}function Bp(t,e){try{let r=0,n="";for(;r<t.length;){const i=t.indexOf("{$",r);if(i===-1){n+=t.substring(r);break}const a=t.indexOf("}",i+2);if(a===-1){n+=t.substring(r);break}const o=t.substring(i+2,a),c=e[o];n+=t.substring(r,i)+(c!=null?String(c):`<${o}?>`),r=a+1}return n}catch{return t}}function Hp(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function As(t,e){if(t===e)return!0;const r=Object.keys(t),n=Object.keys(e);for(const i of r){if(!n.includes(i))return!1;const a=t[i],o=e[i];if(bc(a)&&bc(o)){if(!As(a,o))return!1}else if(a!==o)return!1}for(const i of n)if(!r.includes(i))return!1;return!0}function bc(t){return t!==null&&typeof t=="object"}/**
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
 */function Ia(t){const e=[];for(const[r,n]of Object.entries(t))Array.isArray(n)?n.forEach(i=>{e.push(encodeURIComponent(r)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(r)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function Vp(t,e){const r=new zp(t,e);return r.subscribe.bind(r)}class zp{constructor(e,r){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=r,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(r=>{r.next(e)})}error(e){this.forEachObserver(r=>{r.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,r,n){let i;if(e===void 0&&r===void 0&&n===void 0)throw new Error("Missing Observer.");Wp(e,["next","error","complete"])?i=e:i={next:e,error:r,complete:n},i.next===void 0&&(i.next=Ko),i.error===void 0&&(i.error=Ko),i.complete===void 0&&(i.complete=Ko);const a=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),a}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let r=0;r<this.observers.length;r++)this.sendOne(r,e)}sendOne(e,r){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{r(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Wp(t,e){if(typeof t!="object"||t===null)return!1;for(const r of e)if(r in t&&typeof t[r]=="function")return!0;return!1}function Ko(){}/**
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
 */function yi(t){return t&&t._delegate?t._delegate:t}/**
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
 */function Hl(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function jp(t){return(await fetch(t,{credentials:"include"})).ok}class Cs{constructor(e,r,n){this.name=e,this.instanceFactory=r,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Mi="[DEFAULT]";/**
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
 */class qp{constructor(e,r){this.name=e,this.container=r,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const r=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(r)){const n=new xp;if(this.instancesDeferred.set(r,n),this.isInitialized(r)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:r});i&&n.resolve(i)}catch{}}return this.instancesDeferred.get(r).promise}getImmediate(e){const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(n)return null;throw i}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Kp(e))try{this.getOrInitializeService({instanceIdentifier:Mi})}catch{}for(const[r,n]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(r);try{const a=this.getOrInitializeService({instanceIdentifier:i});n.resolve(a)}catch{}}}}clearInstance(e=Mi){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(r=>"INTERNAL"in r).map(r=>r.INTERNAL.delete()),...e.filter(r=>"_delete"in r).map(r=>r._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Mi){return this.instances.has(e)}getOptions(e=Mi){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:r={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:n,options:r});for(const[a,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(a);n===c&&o.resolve(i)}return i}onInit(e,r){const n=this.normalizeInstanceIdentifier(r),i=this.onInitCallbacks.get(n)??new Set;i.add(e),this.onInitCallbacks.set(n,i);const a=this.instances.get(n);return a&&e(a,n),()=>{i.delete(e)}}invokeOnInitCallbacks(e,r){const n=this.onInitCallbacks.get(r);if(n)for(const i of n)try{i(e,r)}catch{}}getOrInitializeService({instanceIdentifier:e,options:r={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:Gp(e),options:r}),this.instances.set(e,n),this.instancesOptions.set(e,r),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=Mi){return this.component?this.component.multipleInstances?e:Mi:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Gp(t){return t===Mi?void 0:t}function Kp(t){return t.instantiationMode==="EAGER"}/**
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
 */class Jp{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const r=this.getProvider(e.name);if(r.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);r.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const r=new qp(e,this);return this.providers.set(e,r),r}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var Be;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Be||(Be={}));const Yp={debug:Be.DEBUG,verbose:Be.VERBOSE,info:Be.INFO,warn:Be.WARN,error:Be.ERROR,silent:Be.SILENT},Xp=Be.INFO,Qp={[Be.DEBUG]:"log",[Be.VERBOSE]:"log",[Be.INFO]:"info",[Be.WARN]:"warn",[Be.ERROR]:"error"},Zp=(t,e,...r)=>{if(e<t.logLevel)return;const n=new Date().toISOString(),i=Qp[e];if(i)console[i](`[${n}]  ${t.name}:`,...r);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class td{constructor(e){this.name=e,this._logLevel=Xp,this._logHandler=Zp,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Be))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Yp[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Be.DEBUG,...e),this._logHandler(this,Be.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Be.VERBOSE,...e),this._logHandler(this,Be.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Be.INFO,...e),this._logHandler(this,Be.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Be.WARN,...e),this._logHandler(this,Be.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Be.ERROR,...e),this._logHandler(this,Be.ERROR,...e)}}const ev=(t,e)=>e.some(r=>t instanceof r);let wc,yc;function tv(){return wc||(wc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function rv(){return yc||(yc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const rd=new WeakMap,ml=new WeakMap,nd=new WeakMap,Jo=new WeakMap,Vl=new WeakMap;function nv(t){const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("success",a),t.removeEventListener("error",o)},a=()=>{r(gi(t.result)),i()},o=()=>{n(t.error),i()};t.addEventListener("success",a),t.addEventListener("error",o)});return e.then(r=>{r instanceof IDBCursor&&rd.set(r,t)}).catch(()=>{}),Vl.set(e,t),e}function iv(t){if(ml.has(t))return;const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("complete",a),t.removeEventListener("error",o),t.removeEventListener("abort",o)},a=()=>{r(),i()},o=()=>{n(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",a),t.addEventListener("error",o),t.addEventListener("abort",o)});ml.set(t,e)}let bl={get(t,e,r){if(t instanceof IDBTransaction){if(e==="done")return ml.get(t);if(e==="objectStoreNames")return t.objectStoreNames||nd.get(t);if(e==="store")return r.objectStoreNames[1]?void 0:r.objectStore(r.objectStoreNames[0])}return gi(t[e])},set(t,e,r){return t[e]=r,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function sv(t){bl=t(bl)}function av(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...r){const n=t.call(Yo(this),e,...r);return nd.set(n,e.sort?e.sort():[e]),gi(n)}:rv().includes(t)?function(...e){return t.apply(Yo(this),e),gi(rd.get(this))}:function(...e){return gi(t.apply(Yo(this),e))}}function ov(t){return typeof t=="function"?av(t):(t instanceof IDBTransaction&&iv(t),ev(t,tv())?new Proxy(t,bl):t)}function gi(t){if(t instanceof IDBRequest)return nv(t);if(Jo.has(t))return Jo.get(t);const e=ov(t);return e!==t&&(Jo.set(t,e),Vl.set(e,t)),e}const Yo=t=>Vl.get(t);function lv(t,e,{blocked:r,upgrade:n,blocking:i,terminated:a}={}){const o=indexedDB.open(t,e),c=gi(o);return n&&o.addEventListener("upgradeneeded",u=>{n(gi(o.result),u.oldVersion,u.newVersion,gi(o.transaction),u)}),r&&o.addEventListener("blocked",u=>r(u.oldVersion,u.newVersion,u)),c.then(u=>{a&&u.addEventListener("close",()=>a()),i&&u.addEventListener("versionchange",f=>i(f.oldVersion,f.newVersion,f))}).catch(()=>{}),c}const cv=["get","getKey","getAll","getAllKeys","count"],uv=["put","add","delete","clear"],Xo=new Map;function Ic(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Xo.get(e))return Xo.get(e);const r=e.replace(/FromIndex$/,""),n=e!==r,i=uv.includes(r);if(!(r in(n?IDBIndex:IDBObjectStore).prototype)||!(i||cv.includes(r)))return;const a=async function(o,...c){const u=this.transaction(o,i?"readwrite":"readonly");let f=u.store;return n&&(f=f.index(c.shift())),(await Promise.all([f[r](...c),i&&u.done]))[0]};return Xo.set(e,a),a}sv(t=>({...t,get:(e,r,n)=>Ic(e,r)||t.get(e,r,n),has:(e,r)=>!!Ic(e,r)||t.has(e,r)}));/**
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
 */class dv{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(r=>{if(fv(r)){const n=r.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(r=>r).join(" ")}}function fv(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const wl="@firebase/app",Ec="0.16.2";/**
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
 */const Yn=new td("@firebase/app"),hv="@firebase/app-compat",pv="@firebase/analytics-compat",vv="@firebase/analytics",_v="@firebase/app-check-compat",gv="@firebase/app-check",mv="@firebase/auth",bv="@firebase/auth-compat",wv="@firebase/database",yv="@firebase/data-connect",Iv="@firebase/database-compat",Ev="@firebase/functions",Sv="@firebase/functions-compat",kv="@firebase/installations",Tv="@firebase/installations-compat",Av="@firebase/messaging",Cv="@firebase/messaging-compat",Rv="@firebase/performance",Pv="@firebase/performance-compat",xv="@firebase/remote-config",Nv="@firebase/remote-config-compat",Ov="@firebase/storage",Dv="@firebase/storage-compat",Lv="@firebase/firestore",Mv="@firebase/ai",Uv="@firebase/firestore-compat",Fv="firebase",$v="12.19.0";/**
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
 */const yl="[DEFAULT]",Bv={[wl]:"fire-core",[hv]:"fire-core-compat",[vv]:"fire-analytics",[pv]:"fire-analytics-compat",[gv]:"fire-app-check",[_v]:"fire-app-check-compat",[mv]:"fire-auth",[bv]:"fire-auth-compat",[wv]:"fire-rtdb",[yv]:"fire-data-connect",[Iv]:"fire-rtdb-compat",[Ev]:"fire-fn",[Sv]:"fire-fn-compat",[kv]:"fire-iid",[Tv]:"fire-iid-compat",[Av]:"fire-fcm",[Cv]:"fire-fcm-compat",[Rv]:"fire-perf",[Pv]:"fire-perf-compat",[xv]:"fire-rc",[Nv]:"fire-rc-compat",[Ov]:"fire-gcs",[Dv]:"fire-gcs-compat",[Lv]:"fire-fst",[Uv]:"fire-fst-compat",[Mv]:"fire-vertex","fire-js":"fire-js",[Fv]:"fire-js-all"};/**
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
 */const so=new Map,Hv=new Map,Il=new Map;function Sc(t,e){try{t.container.addComponent(e)}catch(r){Yn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,r)}}function ca(t){const e=t.name;if(Il.has(e))return Yn.debug(`There were multiple attempts to register component ${e}.`),!1;Il.set(e,t);for(const r of so.values())Sc(r,t);for(const r of Hv.values())Sc(r,t);return!0}function id(t,e){const r=t.container.getProvider("heartbeat").getImmediate({optional:!0});return r&&r.triggerHeartbeat(),t.container.getProvider(e)}function vn(t){return t==null?!1:t.settings!==void 0}/**
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
 */const Vv={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Wn=new ya("app","Firebase",Vv);/**
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
 */class zv{constructor(e,r,n){this._isDeleted=!1,this._options={...e},this._config={...r},this._name=r.name,this._automaticDataCollectionEnabled=r.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new Cs("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Wn.create("app-deleted",{appName:this._name})}}/**
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
 */const Ea=$v;function sd(t,e={}){let r=t;typeof e!="object"&&(e={name:e});const n={name:yl,automaticDataCollectionEnabled:!0,...e},i=n.name;if(typeof i!="string"||!i)throw Wn.create("bad-app-name",{appName:String(i)});if(r||(r=Zu()),!r)throw Wn.create("no-options");const a=so.get(i);if(a)if(As(r,a.options)){if(As(n,a.config))return a;throw Wn.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(a.config),newValue:JSON.stringify(n)})}else throw Wn.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(a.options),newValue:JSON.stringify(r)});const o=new Jp(i);for(const u of Il.values())o.addComponent(u);const c=new zv(r,n,o);return so.set(i,c),c}function Wv(t=yl){const e=so.get(t);if(!e&&t===yl&&Zu())return sd();if(!e)throw Wn.create("no-app",{appName:t});return e}function fs(t,e,r){let n=Bv[t]??t;r&&(n+=`-${r}`);const i=n.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const o=[`Unable to register library "${n}" with version "${e}":`];i&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),i&&a&&o.push("and"),a&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Yn.warn(o.join(" "));return}ca(new Cs(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
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
 */const jv="firebase-heartbeat-database",qv=1,ua="firebase-heartbeat-store";let Qo=null;function ad(){return Qo||(Qo=lv(jv,qv,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(ua)}catch(r){console.warn(r)}}}}).catch(t=>{throw Wn.create("idb-open",{originalErrorMessage:t.message})})),Qo}async function Gv(t){try{const r=(await ad()).transaction(ua),n=await r.objectStore(ua).get(od(t));return await r.done,n}catch(e){if(e instanceof wi)Yn.warn(e.message);else{const r=Wn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Yn.warn(r.message)}}}async function kc(t,e){try{const n=(await ad()).transaction(ua,"readwrite");await n.objectStore(ua).put(e,od(t)),await n.done}catch(r){if(r instanceof wi)Yn.warn(r.message);else{const n=Wn.create("idb-set",{originalErrorMessage:r==null?void 0:r.message});Yn.warn(n.message)}}}function od(t){return`${t.name}!${t.options.appId}`}/**
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
 */const Kv=1024,Jv=30;class Yv{constructor(e){this.container=e,this._heartbeatsCache=null;const r=this.container.getProvider("app").getImmediate();this._storage=new Qv(r),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,r;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=Tc();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((r=this._heartbeatsCache)==null?void 0:r.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(o=>o.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:i}),this._heartbeatsCache.heartbeats.length>Jv){const o=Zv(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){Yn.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const r=Tc(),{heartbeatsToSend:n,unsentEntries:i}=Xv(this._heartbeatsCache.heartbeats),a=Xu(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=r,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),a}catch(r){return Yn.warn(r),""}}}function Tc(){return new Date().toISOString().substring(0,10)}function Xv(t,e=Kv){const r=[];let n=t.slice();for(const i of t){const a=r.find(o=>o.agent===i.agent);if(a){if(a.dates.push(i.date),Ac(r)>e){a.dates.pop();break}}else if(r.push({agent:i.agent,dates:[i.date]}),Ac(r)>e){r.pop();break}n=n.slice(1)}return{heartbeatsToSend:r,unsentEntries:n}}class Qv{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Up()?Fp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const r=await Gv(this.app);return r!=null&&r.heartbeats?r:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return kc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return kc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function Ac(t){return Xu(JSON.stringify({version:2,heartbeats:t})).length}function Zv(t){if(t.length===0)return-1;let e=0,r=t[0].date;for(let n=1;n<t.length;n++)t[n].date<r&&(r=t[n].date,e=n);return e}/**
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
 */function e_(t){ca(new Cs("platform-logger",e=>new dv(e),"PRIVATE")),ca(new Cs("heartbeat",e=>new Yv(e),"PRIVATE")),fs(wl,Ec,t),fs(wl,Ec,"esm2020"),fs("fire-js","")}/**
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
 */e_("");var t_="firebase",r_="12.19.0";/**
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
 */fs(t_,r_,"app");function ld(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const n_=ld,cd=new ya("auth","Firebase",ld());/**
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
 */const ao=new td("@firebase/auth");function Ga(t,...e){ao.logLevel<=Be.WARN&&ao.warn(`Auth (${Ea}): ${t}`,...e)}function Ka(t,...e){ao.logLevel<=Be.ERROR&&ao.error(`Auth (${Ea}): ${t}`,...e)}/**
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
 */function yn(t,...e){throw zl(t,...e)}function Jr(t,...e){return zl(t,...e)}function yo(t,e,r){const n={...n_(),[e]:r};return new ya("auth","Firebase",n).create(e,{appName:t.name})}function Yi(t){return yo(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function i_(t,e,r){const n=r;if(!(e instanceof n))throw n.name!==e.constructor.name&&yn(t,"argument-error"),yo(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function zl(t,...e){if(typeof t!="string"){const r=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=t.name),t._errorFactory.create(r,...n)}return cd.create(t,...e)}function Y(t,e,...r){if(!t)throw zl(e,...r)}function jn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ka(e),new Error(e)}function Xn(t,e){t||jn(e)}/**
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
 */function El(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function s_(){return Cc()==="http:"||Cc()==="https:"}function Cc(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function a_(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(s_()||Dp()||"connection"in navigator)?navigator.onLine:!0}function o_(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class Sa{constructor(e,r){this.shortDelay=e,this.longDelay=r,Xn(r>e,"Short delay should be less than long delay!"),this.isMobile=Np()||Lp()}get(){return a_()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Wl(t,e){Xn(t.emulator,"Emulator should always be set here");const{url:r}=t.emulator;return e?`${r}${e.startsWith("/")?e.slice(1):e}`:r}/**
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
 */class ud{static initialize(e,r,n){this.fetchImpl=e,r&&(this.headersImpl=r),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;jn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;jn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;jn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const l_={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const c_=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],u_=new Sa(3e4,6e4);function jl(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function Ds(t,e,r,n,i={}){return dd(t,i,async()=>{let a={},o={};n&&(e==="GET"?o=n:a={body:JSON.stringify(n)});const c=Ia({...o,key:t.config.apiKey}).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const f={method:e,headers:u,...a};return Op()||(f.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&Hl(t.emulatorConfig.host)&&(f.credentials="include"),ud.fetch()(await fd(t,t.config.apiHost,r,c),f)})}async function dd(t,e,r){t._canInitEmulator=!1;const n={...l_,...e};try{const i=new f_(t),a=await Promise.race([r(),i.promise]);i.clearNetworkTimeout();const o=await a.json();if("needConfirmation"in o)throw Ba(t,"account-exists-with-different-credential",o);if(a.ok&&!("errorMessage"in o))return o;{const c=a.ok?o.errorMessage:o.error.message,[u,f]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ba(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Ba(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw Ba(t,"user-disabled",o);const _=n[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(f)throw yo(t,_,f);yn(t,_)}}catch(i){if(i instanceof wi)throw i;yn(t,"network-request-failed",{message:String(i)})}}async function d_(t,e,r,n,i={}){const a=await Ds(t,e,r,n,i);return"mfaPendingCredential"in a&&yn(t,"multi-factor-auth-required",{_serverResponse:a}),a}async function fd(t,e,r,n){const i=`${e}${r}?${n}`,a=t,o=a.config.emulator?Wl(t.config,i):`${t.config.apiScheme}://${i}`;return c_.includes(r)&&(await a._persistenceManagerAvailable,a._getPersistenceType()==="COOKIE")?a._getPersistence()._getFinalTarget(o).toString():o}class f_{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((r,n)=>{this.timer=setTimeout(()=>n(Jr(this.auth,"network-request-failed")),u_.get())})}}function Ba(t,e,r){const n={appName:t.name};r.email&&(n.email=r.email),r.phoneNumber&&(n.phoneNumber=r.phoneNumber);const i=Jr(t,e,n);return i.customData._tokenResponse=r,i}/**
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
 */async function h_(t,e){return Ds(t,"POST","/v1/accounts:delete",e)}async function oo(t,e){return Ds(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function na(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function p_(t,e=!1){const r=yi(t),n=await r.getIdToken(e),i=ql(n);Y(i&&i.exp&&i.auth_time&&i.iat,r.auth,"internal-error");const a=typeof i.firebase=="object"?i.firebase:void 0,o=a==null?void 0:a.sign_in_provider;return{claims:i,token:n,authTime:na(Zo(i.auth_time)),issuedAtTime:na(Zo(i.iat)),expirationTime:na(Zo(i.exp)),signInProvider:o||null,signInSecondFactor:(a==null?void 0:a.sign_in_second_factor)||null}}function Zo(t){return Number(t)*1e3}function ql(t){const[e,r,n]=t.split(".");if(e===void 0||r===void 0||n===void 0)return Ka("JWT malformed, contained fewer than 3 sections"),null;try{const i=Qu(r);return i?JSON.parse(i):(Ka("Failed to decode base64 JWT payload"),null)}catch(i){return Ka("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Rc(t){const e=ql(t);return Y(e,"internal-error"),Y(typeof e.exp<"u","internal-error"),Y(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function da(t,e,r=!1){if(r)return e;try{return await e}catch(n){throw n instanceof wi&&v_(n)&&t.auth.currentUser===t&&await t.auth.signOut(),n}}function v_({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class __{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const r=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},r)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Sl{constructor(e,r){this.createdAt=e,this.lastLoginAt=r,this._initializeTime()}_initializeTime(){this.lastSignInTime=na(this.lastLoginAt),this.creationTime=na(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function lo(t){var g;const e=t.auth,r=await t.getIdToken(),n=await da(t,oo(e,{idToken:r}));Y(n==null?void 0:n.users.length,e,"internal-error");const i=n.users[0];t._notifyReloadListener(i);const a=(g=i.providerUserInfo)!=null&&g.length?hd(i.providerUserInfo):[],o=m_(t.providerData,a),c=t.isAnonymous,u=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),f=c?u:!1,_={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new Sl(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(t,_)}async function g_(t){const e=yi(t);await lo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function m_(t,e){return[...t.filter(n=>!e.some(i=>i.providerId===n.providerId)),...e]}function hd(t){return t.map(({providerId:e,...r})=>({providerId:e,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}))}/**
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
 */async function b_(t,e){const r=await dd(t,{},async()=>{const n=Ia({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:a}=t.config,o=await fd(t,i,"/v1/token",`key=${a}`),c=await t._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:n};return t.emulatorConfig&&Hl(t.emulatorConfig.host)&&(u.credentials="include"),ud.fetch()(o,u)});return{accessToken:r.access_token,expiresIn:r.expires_in,refreshToken:r.refresh_token}}async function w_(t,e){return Ds(t,"POST","/v2/accounts:revokeToken",jl(t,e))}/**
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
 */class hs{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){Y(e.idToken,"internal-error"),Y(typeof e.idToken<"u","internal-error"),Y(typeof e.refreshToken<"u","internal-error");const r="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Rc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,r)}updateFromIdToken(e){Y(e.length!==0,"internal-error");const r=Rc(e);this.updateTokensAndExpiration(e,null,r)}async getToken(e,r=!1){return!r&&this.accessToken&&!this.isExpired?this.accessToken:(Y(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,r){const{accessToken:n,refreshToken:i,expiresIn:a}=await b_(e,r);this.updateTokensAndExpiration(n,i,Number(a))}updateTokensAndExpiration(e,r,n){this.refreshToken=r||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,r){const{refreshToken:n,accessToken:i,expirationTime:a}=r,o=new hs;return n&&(Y(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),i&&(Y(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),a&&(Y(typeof a=="number","internal-error",{appName:e}),o.expirationTime=a),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new hs,this.toJSON())}_performRefresh(){return jn("not implemented")}}/**
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
 */function li(t,e){Y(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class qr{constructor({uid:e,auth:r,stsTokenManager:n,...i}){this.providerId="firebase",this.proactiveRefresh=new __(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=r,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Sl(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const r=await da(this,this.stsTokenManager.getToken(this.auth,e));return Y(r,this.auth,"internal-error"),this.accessToken!==r&&(this.accessToken=r,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),r}getIdTokenResult(e){return p_(this,e)}reload(){return g_(this)}_assign(e){this!==e&&(Y(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(r=>({...r})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const r=new qr({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return r.metadata._copy(this.metadata),r}_onReload(e){Y(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,r=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),r&&await lo(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(vn(this.auth.app))return Promise.reject(Yi(this.auth));const e=await this.getIdToken();return await da(this,h_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,r){const n=r.displayName??void 0,i=r.email??void 0,a=r.phoneNumber??void 0,o=r.photoURL??void 0,c=r.tenantId??void 0,u=r._redirectEventId??void 0,f=r.createdAt??void 0,_=r.lastLoginAt??void 0,{uid:g,emailVerified:w,isAnonymous:b,providerData:I,stsTokenManager:P}=r;Y(g&&P,e,"internal-error");const k=hs.fromJSON(this.name,P);Y(typeof g=="string",e,"internal-error"),li(n,e.name),li(i,e.name),Y(typeof w=="boolean",e,"internal-error"),Y(typeof b=="boolean",e,"internal-error"),li(a,e.name),li(o,e.name),li(c,e.name),li(u,e.name),li(f,e.name),li(_,e.name);const N=new qr({uid:g,auth:e,email:i,emailVerified:w,displayName:n,isAnonymous:b,photoURL:o,phoneNumber:a,tenantId:c,stsTokenManager:k,createdAt:f,lastLoginAt:_});return I&&Array.isArray(I)&&(N.providerData=I.map(G=>({...G}))),u&&(N._redirectEventId=u),N}static async _fromIdTokenResponse(e,r,n=!1){const i=new hs;i.updateFromServerResponse(r);const a=new qr({uid:r.localId,auth:e,stsTokenManager:i,isAnonymous:n});return await lo(a),a}static async _fromGetAccountInfoResponse(e,r,n){const i=r.users[0];Y(i.localId!==void 0,"internal-error");const a=i.providerUserInfo!==void 0?hd(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(a!=null&&a.length),c=new hs;c.updateFromIdToken(n);const u=new qr({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:o}),f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new Sl(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(a!=null&&a.length)};return Object.assign(u,f),u}}/**
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
 */const Pc=new Map;function qn(t){Xn(t instanceof Function,"Expected a class definition");let e=Pc.get(t);return e?(Xn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Pc.set(t,e),e)}/**
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
 */class pd{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,r){this.storage[e]=r}async _get(e){const r=this.storage[e];return r===void 0?null:r}async _remove(e){delete this.storage[e]}_addListener(e,r){}_removeListener(e,r){}}pd.type="NONE";const xc=pd;/**
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
 */function Ja(t,e,r){return`firebase:${t}:${e}:${r}`}class Xi{constructor(e,r,n){this.persistence=e,this.auth=r,this.userKey=n;const{config:i,name:a}=this.auth;this.fullUserKey=Ja(this.userKey,i.apiKey,a),this.fullPersistenceKey=Ja("persistence",i.apiKey,a),this.boundEventHandler=r._onStorageEvent.bind(r);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const r=await oo(this.auth,{idToken:e}).catch(()=>{});return r?qr._fromGetAccountInfoResponse(this.auth,r,e):null}return qr._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const r=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,r)return this.setCurrentUser(r)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,r,n="authUser"){if(!r.length)return new Xi(qn(xc),e,n);const i=(await Promise.all(r.map(async f=>{try{if(await f._isAvailable())return f}catch{return}}))).filter(f=>f);let a=i[0]||qn(xc);const o=Ja(n,e.config.apiKey,e.name);let c=null;for(const f of r)try{const _=await f._get(o);if(_){let g;if(typeof _=="string"){const w=await oo(e,{idToken:_}).catch(()=>{});if(!w)break;g=await qr._fromGetAccountInfoResponse(e,w,_)}else g=qr._fromJSON(e,_);f!==a&&(c=g),a=f;break}}catch{}const u=i.filter(f=>f._shouldAllowMigration);return!a._shouldAllowMigration||!u.length?new Xi(a,e,n):(a=u[0],c&&await a._set(o,c.toJSON()),await Promise.all(r.map(async f=>{if(f!==a)try{await f._remove(o)}catch{}})),new Xi(a,e,n))}}/**
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
 */function Nc(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(md(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(vd(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(wd(e))return"Blackberry";if(yd(e))return"Webos";if(_d(e))return"Safari";if((e.includes("chrome/")||gd(e))&&!e.includes("edge/"))return"Chrome";if(bd(e))return"Android";{const r=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=t.match(r);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function vd(t=zt()){return/firefox\//i.test(t)}function _d(t=zt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function gd(t=zt()){return/crios\//i.test(t)}function md(t=zt()){return/iemobile/i.test(t)}function bd(t=zt()){return/android/i.test(t)}function wd(t=zt()){return/blackberry/i.test(t)}function yd(t=zt()){return/webos/i.test(t)}function Gl(t=zt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function y_(t=zt()){var e;return Gl(t)&&!!((e=window.navigator)!=null&&e.standalone)}function I_(){return Mp()&&document.documentMode===10}function Id(t=zt()){return Gl(t)||bd(t)||yd(t)||wd(t)||/windows phone/i.test(t)||md(t)}/**
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
 */function Ed(t,e=[]){let r;switch(t){case"Browser":r=Nc(zt());break;case"Worker":r=`${Nc(zt())}-${t}`;break;default:r=t}const n=e.length?e.join(","):"FirebaseCore-web";return`${r}/JsCore/${Ea}/${n}`}/**
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
 */class E_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,r){const n=a=>new Promise((o,c)=>{try{const u=e(a);o(u)}catch(u){c(u)}});n.onAbort=r,this.queue.push(n);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const r=[];try{for(const n of this.queue)await n(e),n.onAbort&&r.push(n.onAbort)}catch(n){r.reverse();for(const i of r)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
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
 */async function S_(t,e={}){return Ds(t,"GET","/v2/passwordPolicy",jl(t,e))}/**
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
 */const k_=6;class T_{constructor(e){var n;const r=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=r.minPasswordLength??k_,r.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=r.maxPasswordLength),r.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=r.containsLowercaseCharacter),r.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=r.containsUppercaseCharacter),r.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=r.containsNumericCharacter),r.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=r.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const r={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,r),this.validatePasswordCharacterOptions(e,r),r.isValid&&(r.isValid=r.meetsMinPasswordLength??!0),r.isValid&&(r.isValid=r.meetsMaxPasswordLength??!0),r.isValid&&(r.isValid=r.containsLowercaseLetter??!0),r.isValid&&(r.isValid=r.containsUppercaseLetter??!0),r.isValid&&(r.isValid=r.containsNumericCharacter??!0),r.isValid&&(r.isValid=r.containsNonAlphanumericCharacter??!0),r}validatePasswordLengthOptions(e,r){const n=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;n&&(r.meetsMinPasswordLength=e.length>=n),i&&(r.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,r){this.updatePasswordCharacterOptionsStatuses(r,!1,!1,!1,!1);let n;for(let i=0;i<e.length;i++)n=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(r,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,r,n,i,a){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=r)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=a))}}/**
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
 */class A_{constructor(e,r,n,i){this.app=e,this.heartbeatServiceProvider=r,this.appCheckServiceProvider=n,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Oc(this),this.idTokenSubscription=new Oc(this),this.beforeStateQueue=new E_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=cd,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(a=>this._resolvePersistenceManagerAvailable=a)}_initializeWithPersistence(e,r){return r&&(this._popupRedirectResolver=qn(r)),this._initializationPromise=this.queue(async()=>{var n,i,a;if(!this._deleted){try{this.persistenceManager=await Xi.create(this,e)}catch(o){Ga(`Failed to initialize persistence: ${o}`),this.persistenceManager=await Xi.create(this,[])}finally{(n=this._resolvePersistenceManagerAvailable)==null||n.call(this)}if(!this._deleted){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(r)}catch(o){Ga(`Failed to initialize current user: ${o}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((a=this.currentUser)==null?void 0:a.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const r=await oo(this,{idToken:e}),n=await qr._fromGetAccountInfoResponse(this,r,e);await this.directlySetCurrentUser(n)}catch(r){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",r),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var a;if(vn(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let n=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(a=this.redirectUser)==null?void 0:a._redirectEventId,c=n==null?void 0:n._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(n=u.user,i=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return Y(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let r=null;try{r=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return r}async reloadAndSetCurrentUserOrClear(e){try{await lo(e)}catch(r){if((r==null?void 0:r.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=o_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(vn(this.app))return Promise.reject(Yi(this));const r=e?yi(e):null;return r&&Y(r.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(r&&r._clone(this))}async _updateCurrentUser(e,r=!1){if(!this._deleted)return e&&Y(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),r||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return vn(this.app)?Promise.reject(Yi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return vn(this.app)?Promise.reject(Yi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(qn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const r=this._getPasswordPolicyInternal();return r.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):r.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await S_(this),r=new T_(e);this.tenantId===null?this._projectPasswordPolicy=r:this._tenantPasswordPolicies[this.tenantId]=r}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ya("auth","Firebase",e())}onAuthStateChanged(e,r,n){return this.registerStateListener(this.authStateSubscription,e,r,n)}beforeAuthStateChanged(e,r){return this.beforeStateQueue.pushCallback(e,r)}onIdTokenChanged(e,r,n){return this.registerStateListener(this.idTokenSubscription,e,r,n)}authStateReady(){return new Promise((e,r)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},r)}})}async revokeAccessToken(e){if(this.currentUser){const r=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:r};this.tenantId!=null&&(n.tenantId=this.tenantId),await w_(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,r){const n=await this.getOrInitRedirectPersistenceManager(r);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const r=e&&qn(e)||this._popupRedirectResolver;Y(r,this,"argument-error"),this.redirectPersistenceManager=await Xi.create(this,[qn(r._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var r,n;return this._isInitialized&&await this.queue(async()=>{}),((r=this._currentUser)==null?void 0:r._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var r;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((r=this.currentUser)==null?void 0:r.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,r,n,i){if(this._deleted)return()=>{};const a=typeof r=="function"?r:r.next.bind(r);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(Y(c,this,"internal-error"),c.then(()=>{o||a(this.currentUser)}).catch(u=>{if(!o)if(typeof r!="function"&&r.error)r.error(u);else if(n)n(u);else throw u}),typeof r=="function"){const u=e.addObserver(r,n,i);return()=>{o=!0,u()}}else{const u=e.addObserver(r);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(r){const n=(r==null?void 0:r.message)||String(r),i=yo(this,"internal-error",`An internal AuthError has occurred: ${n}`);throw i.customData={originalError:r},i}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return Y(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Ed(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const r=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());r&&(e["X-Firebase-Client"]=r);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var r;if(vn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((r=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getToken());return e!=null&&e.error&&Ga(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Io(t){return yi(t)}class Oc{constructor(e){this.auth=e,this.observer=null,this.addObserver=Vp(r=>this.observer=r)}get next(){return Y(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Kl={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function C_(t){Kl=t}function R_(t){return Kl.loadJS(t)}function P_(){return Kl.gapiScript}function x_(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function N_(t,e){const r=id(t,"auth");if(r.isInitialized()){const i=r.getImmediate(),a=r.getOptions();if(As(a,e??{}))return i;yn(i,"already-initialized")}return r.initialize({options:e})}function O_(t,e){const r=(e==null?void 0:e.persistence)||[],n=(Array.isArray(r)?r:[r]).map(qn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function Sd(t,e,r){const n=Io(t);Y(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const i=!1,a=kd(e),{host:o,port:c}=D_(e),u=c===null?"":`:${c}`,f={url:`${a}//${o}${u}/`},_=Object.freeze({host:o,port:c,protocol:a.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!n._canInitEmulator){Y(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),Y(As(f,n.config.emulator)&&As(_,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=f,n.emulatorConfig=_,n.settings.appVerificationDisabledForTesting=!0,Hl(o)?jp(`${a}//${o}${u}`):L_()}function kd(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function D_(t){const e=kd(t),r=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!r)return{host:"",port:null};const n=r[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(n);if(i){const a=i[1];return{host:a,port:Dc(n.substr(a.length+1))}}else{const[a,o]=n.split(":");return{host:a,port:Dc(o)}}}function Dc(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function L_(){function t(){const e=document.createElement("p"),r=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",r.position="fixed",r.width="100%",r.backgroundColor="#ffffff",r.border=".1em solid #000000",r.color="#b50000",r.bottom="0px",r.left="0px",r.margin="0px",r.zIndex="10000",r.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class Td{constructor(e,r){this.providerId=e,this.signInMethod=r}toJSON(){return jn("not implemented")}_getIdTokenResponse(e){return jn("not implemented")}_linkToIdToken(e,r){return jn("not implemented")}_getReauthenticationResolver(e){return jn("not implemented")}}/**
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
 */async function ps(t,e){return d_(t,"POST","/v1/accounts:signInWithIdp",jl(t,e))}/**
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
 */const M_="http://localhost";class Zi extends Td{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const r=new Zi(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(r.idToken=e.idToken),e.accessToken&&(r.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(r.nonce=e.nonce),e.pendingToken&&(r.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(r.accessToken=e.oauthToken,r.secret=e.oauthTokenSecret):yn("argument-error"),r}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const r=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:i,...a}=r;if(!n||!i)return null;const o=new Zi(n,i);return o.idToken=a.idToken||void 0,o.accessToken=a.accessToken||void 0,o.secret=a.secret,o.nonce=a.nonce,o.pendingToken=a.pendingToken||null,o}_getIdTokenResponse(e){const r=this.buildRequest();return ps(e,r)}_linkToIdToken(e,r){const n=this.buildRequest();return n.idToken=r,ps(e,n)}_getReauthenticationResolver(e){const r=this.buildRequest();return r.autoCreate=!1,ps(e,r)}buildRequest(){const e={requestUri:M_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const r={};this.idToken&&(r.id_token=this.idToken),this.accessToken&&(r.access_token=this.accessToken),this.secret&&(r.oauth_token_secret=this.secret),r.providerId=this.providerId,this.nonce&&!this.pendingToken&&(r.nonce=this.nonce),e.postBody=Ia(r)}return e}}/**
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
 */class Jl{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class ka extends Jl{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class ui extends ka{constructor(){super("facebook.com")}static credential(e){return Zi._fromParams({providerId:ui.PROVIDER_ID,signInMethod:ui.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ui.credentialFromTaggedObject(e)}static credentialFromError(e){return ui.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ui.credential(e.oauthAccessToken)}catch{return null}}}ui.FACEBOOK_SIGN_IN_METHOD="facebook.com";ui.PROVIDER_ID="facebook.com";/**
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
 */class Hn extends ka{constructor(){super("google.com"),this.addScope("profile")}static credential(e,r){return Zi._fromParams({providerId:Hn.PROVIDER_ID,signInMethod:Hn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:r})}static credentialFromResult(e){return Hn.credentialFromTaggedObject(e)}static credentialFromError(e){return Hn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:r,oauthAccessToken:n}=e;if(!r&&!n)return null;try{return Hn.credential(r,n)}catch{return null}}}Hn.GOOGLE_SIGN_IN_METHOD="google.com";Hn.PROVIDER_ID="google.com";/**
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
 */class di extends ka{constructor(){super("github.com")}static credential(e){return Zi._fromParams({providerId:di.PROVIDER_ID,signInMethod:di.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return di.credentialFromTaggedObject(e)}static credentialFromError(e){return di.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return di.credential(e.oauthAccessToken)}catch{return null}}}di.GITHUB_SIGN_IN_METHOD="github.com";di.PROVIDER_ID="github.com";/**
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
 */class fi extends ka{constructor(){super("twitter.com")}static credential(e,r){return Zi._fromParams({providerId:fi.PROVIDER_ID,signInMethod:fi.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:r})}static credentialFromResult(e){return fi.credentialFromTaggedObject(e)}static credentialFromError(e){return fi.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:r,oauthTokenSecret:n}=e;if(!r||!n)return null;try{return fi.credential(r,n)}catch{return null}}}fi.TWITTER_SIGN_IN_METHOD="twitter.com";fi.PROVIDER_ID="twitter.com";/**
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
 */class Rs{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,r,n,i=!1){const a=await qr._fromIdTokenResponse(e,n,i),o=Lc(n);return new Rs({user:a,providerId:o,_tokenResponse:n,operationType:r})}static async _forOperation(e,r,n){await e._updateTokensIfNecessary(n,!0);const i=Lc(n);return new Rs({user:e,providerId:i,_tokenResponse:n,operationType:r})}}function Lc(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class co extends wi{constructor(e,r,n,i){super(r.code,r.message),this.operationType=n,this.user=i,Object.setPrototypeOf(this,co.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:r.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,r,n,i){return new co(e,r,n,i)}}function Ad(t,e,r,n){return(e==="reauthenticate"?r._getReauthenticationResolver(t):r._getIdTokenResponse(t)).catch(a=>{throw a.code==="auth/multi-factor-auth-required"?co._fromErrorAndOperation(t,a,e,n):a})}async function U_(t,e,r=!1){const n=await da(t,e._linkToIdToken(t.auth,await t.getIdToken()),r);return Rs._forOperation(t,"link",n)}/**
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
 */async function F_(t,e,r=!1){const{auth:n}=t;if(vn(n.app))return Promise.reject(Yi(n));const i="reauthenticate";try{const a=await da(t,Ad(n,i,e,t),r);Y(a.idToken,n,"internal-error");const o=ql(a.idToken);Y(o,n,"internal-error");const{sub:c}=o;return Y(t.uid===c,n,"user-mismatch"),Rs._forOperation(t,i,a)}catch(a){throw(a==null?void 0:a.code)==="auth/user-not-found"&&yn(n,"user-mismatch"),a}}/**
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
 */async function $_(t,e,r=!1){if(vn(t.app))return Promise.reject(Yi(t));const n="signIn",i=await Ad(t,n,e),a=await Rs._fromIdTokenResponse(t,n,i);return r||await t._updateCurrentUser(a.user),a}function B_(t,e,r,n){return yi(t).onIdTokenChanged(e,r,n)}function H_(t,e,r){return yi(t).beforeAuthStateChanged(e,r)}function V_(t,e,r,n){return yi(t).onAuthStateChanged(e,r,n)}function z_(t){return yi(t).signOut()}const uo="__sak";/**
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
 */class Cd{constructor(e,r){this.storageRetriever=e,this.type=r}_isAvailable(){try{return this.storage?(this.storage.setItem(uo,"1"),this.storage.removeItem(uo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,r){return this.storage.setItem(e,JSON.stringify(r)),Promise.resolve()}_get(e){const r=this.storage.getItem(e);return Promise.resolve(r?JSON.parse(r):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const W_=1e3,j_=10;class Rd extends Cd{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,r)=>this.onStorageEvent(e,r),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Id(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const r of Object.keys(this.listeners)){const n=this.storage.getItem(r),i=this.localCache[r];n!==i&&e(r,i,n)}}onStorageEvent(e,r=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const n=e.key;r?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(n);!r&&this.localCache[n]===o||this.notifyListeners(n,o)},a=this.storage.getItem(n);I_()&&a!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,j_):i()}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r&&JSON.parse(r))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,r,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:r,newValue:n}),!0)})},W_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,r){await super._set(e,r),this.localCache[e]=JSON.stringify(r)}async _get(e){const r=await super._get(e);return this.localCache[e]=JSON.stringify(r),r}async _remove(e){await super._remove(e),delete this.localCache[e]}}Rd.type="LOCAL";const q_=Rd;/**
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
 */class Pd extends Cd{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,r){}_removeListener(e,r){}}Pd.type="SESSION";const xd=Pd;/**
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
 */function G_(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(r){return{fulfilled:!1,reason:r}}}))}/**
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
 */class Eo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const r=this.receivers.find(i=>i.isListeningto(e));if(r)return r;const n=new Eo(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const r=e,{eventId:n,eventType:i,data:a}=r.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;r.ports[0].postMessage({status:"ack",eventId:n,eventType:i});const c=Array.from(o).map(async f=>f(r.origin,a)),u=await G_(c);r.ports[0].postMessage({status:"done",eventId:n,eventType:i,response:u})}_subscribe(e,r){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(r)}_unsubscribe(e,r){this.handlersMap[e]&&r&&this.handlersMap[e].delete(r),(!r||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Eo.receivers=[];/**
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
 */function Yl(t="",e=10){let r="";for(let n=0;n<e;n++)r+=Math.floor(Math.random()*10);return t+r}/**
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
 */class K_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,r,n=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let a,o;return new Promise((c,u)=>{const f=Yl("",20);i.port1.start();const _=setTimeout(()=>{u(new Error("unsupported_event"))},n);o={messageChannel:i,onMessage(g){const w=g;if(w.data.eventId===f)switch(w.data.status){case"ack":clearTimeout(_),a=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(a),c(w.data.response);break;default:clearTimeout(_),clearTimeout(a),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:f,data:r},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function bn(){return window}function J_(t){bn().location.href=t}/**
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
 */function Nd(){return typeof bn().WorkerGlobalScope<"u"&&typeof bn().importScripts=="function"}async function Y_(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function X_(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function Q_(){return Nd()?self:null}/**
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
 */const Od="firebaseLocalStorageDb",Z_=1,fo="firebaseLocalStorage",Dd="fbase_key";class Ta{constructor(e){this.request=e}toPromise(){return new Promise((e,r)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{r(this.request.error)})})}}function So(t,e){return t.transaction([fo],e?"readwrite":"readonly").objectStore(fo)}function eg(){const t=indexedDB.deleteDatabase(Od);return new Ta(t).toPromise()}function Ld(){const t=indexedDB.open(Od,Z_);return new Promise((e,r)=>{t.addEventListener("error",()=>{r(t.error)}),t.addEventListener("upgradeneeded",()=>{const n=t.result;try{n.createObjectStore(fo,{keyPath:Dd})}catch(i){r(i)}}),t.addEventListener("success",async()=>{const n=t.result;n.objectStoreNames.contains(fo)?e(n):(n.close(),await eg(),e(await Ld()))})})}async function Mc(t,e,r){const n=So(t,!0).put({[Dd]:e,value:r});return new Ta(n).toPromise()}async function tg(t,e){const r=So(t,!1).get(e),n=await new Ta(r).toPromise();return n===void 0?null:n.value}function Uc(t,e){const r=So(t,!0).delete(e);return new Ta(r).toPromise()}const rg=800,ng=3;class Md{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Ld(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let r=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(r++>ng)throw n;if(this.dbPromise){const i=this.dbPromise;this.dbPromise=null;try{(await i).close()}catch{}}}}async initializeServiceWorkerMessaging(){return Nd()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Eo._getInstance(Q_()),this.receiver._subscribe("keyChanged",async(e,r)=>({keyProcessed:(await this._poll()).includes(r.key)})),this.receiver._subscribe("ping",async(e,r)=>["keyChanged"])}async initializeSender(){var r,n;if(this.activeServiceWorker=await Y_(),!this.activeServiceWorker)return;this.sender=new K_(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(r=e[0])!=null&&r.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||X_()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Mc(e,uo,"1"),await Uc(e,uo)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,r){return this._withPendingWrite(async()=>(await this._withRetries(n=>Mc(n,e,r)),this.localCache[e]=r,this.notifyServiceWorker(e)))}async _get(e){const r=await this._withRetries(n=>tg(n,e));return this.localCache[e]=r,r}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(r=>Uc(r,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(i=>{const a=So(i,!1).getAll();return new Ta(a).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const r=[],n=new Set;if(e.length!==0)for(const{fbase_key:i,value:a}of e)n.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(a)&&(this.notifyListeners(i,a),r.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!n.has(i)&&(this.notifyListeners(i,null),r.push(i));return r}catch(e){return this.isClosing||Ga(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),rg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Md.type="LOCAL";const ig=Md;new Sa(3e4,6e4);/**
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
 */function Ud(t,e){return e?qn(e):(Y(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Xl extends Td{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return ps(e,this._buildIdpRequest())}_linkToIdToken(e,r){return ps(e,this._buildIdpRequest(r))}_getReauthenticationResolver(e){return ps(e,this._buildIdpRequest())}_buildIdpRequest(e){const r={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(r.idToken=e),r}}function sg(t){return $_(t.auth,new Xl(t),t.bypassAuthState)}function ag(t){const{auth:e,user:r}=t;return Y(r,e,"internal-error"),F_(r,new Xl(t),t.bypassAuthState)}async function og(t){const{auth:e,user:r}=t;return Y(r,e,"internal-error"),U_(r,new Xl(t),t.bypassAuthState)}/**
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
 */class Fd{constructor(e,r,n,i,a=!1){this.auth=e,this.resolver=n,this.user=i,this.bypassAuthState=a,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(r)?r:[r]}execute(){return new Promise(async(e,r)=>{this.pendingPromise={resolve:e,reject:r};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:r,sessionId:n,postBody:i,tenantId:a,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:r,sessionId:n,tenantId:a||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(f){this.reject(f)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return sg;case"linkViaPopup":case"linkViaRedirect":return og;case"reauthViaPopup":case"reauthViaRedirect":return ag;default:yn(this.auth,"internal-error")}}resolve(e){Xn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Xn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const lg=new Sa(2e3,1e4);async function cg(t,e,r){if(vn(t.app))return Promise.reject(Jr(t,"operation-not-supported-in-this-environment"));const n=Io(t);i_(t,e,Jl);const i=Ud(n,r);return new Vi(n,"signInViaPopup",e,i).executeNotNull()}class Vi extends Fd{constructor(e,r,n,i,a){super(e,r,i,a),this.provider=n,this.authWindow=null,this.pollId=null,Vi.currentPopupAction&&Vi.currentPopupAction.cancel(),Vi.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return Y(e,this.auth,"internal-error"),e}async onExecution(){Xn(this.filter.length===1,"Popup operations only handle one event");const e=Yl();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(r=>{this.reject(r)}),this.resolver._isIframeWebStorageSupported(this.auth,r=>{r||this.reject(Jr(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(Jr(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Vi.currentPopupAction=null}pollUserCancellation(){const e=()=>{var r,n;if((n=(r=this.authWindow)==null?void 0:r.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Jr(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,lg.get())};e()}}Vi.currentPopupAction=null;/**
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
 */const ug="pendingRedirect",Ya=new Map;class dg extends Fd{constructor(e,r,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],r,void 0,n),this.eventId=null}async execute(){let e=Ya.get(this.auth._key());if(!e){try{const n=await fg(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(r){e=()=>Promise.reject(r)}Ya.set(this.auth._key(),e)}return this.bypassAuthState||Ya.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const r=await this.auth._redirectUserForId(e.eventId);if(r)return this.user=r,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function fg(t,e){const r=vg(e),n=pg(t);if(!await n._isAvailable())return!1;const i=await n._get(r)==="true";return await n._remove(r),i}function hg(t,e){Ya.set(t._key(),e)}function pg(t){return qn(t._redirectPersistence)}function vg(t){return Ja(ug,t.config.apiKey,t.name)}async function _g(t,e,r=!1){if(vn(t.app))return Promise.reject(Yi(t));const n=Io(t),i=Ud(n,e),o=await new dg(n,i,r).execute();return o&&!r&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}/**
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
 */const gg=600*1e3;class mg{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let r=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(r=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!bg(e)||(this.hasHandledPotentialRedirect=!0,r||(this.queuedRedirectEvent=e,r=!0)),r}sendToConsumer(e,r){var n;if(e.error&&!$d(e)){const i=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";r.onError(Jr(this.auth,i))}else r.onAuthEvent(e)}isEventForConsumer(e,r){const n=r.eventId===null||!!e.eventId&&e.eventId===r.eventId;return r.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=gg&&this.cachedEventUids.clear(),this.cachedEventUids.has(Fc(e))}saveEventToCache(e){this.cachedEventUids.add(Fc(e)),this.lastProcessedEventTime=Date.now()}}function Fc(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function $d({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function bg(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return $d(t);default:return!1}}/**
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
 */async function wg(t,e={}){return Ds(t,"GET","/v1/projects",e)}/**
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
 */const yg=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ig=/^https?/;async function Eg(t){if(t.config.emulator)return;const{authorizedDomains:e}=await wg(t);for(const r of e)try{if(Sg(r))return}catch{}yn(t,"unauthorized-domain")}function Sg(t){const e=El(),{protocol:r,hostname:n}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&n===""?r==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):r==="chrome-extension:"&&o.hostname===n}if(!Ig.test(r))return!1;if(yg.test(t))return n===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(n)}/**
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
 */const kg=new Sa(3e4,6e4);function $c(){const t=bn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let r=0;r<t.CP.length;r++)t.CP[r]=null}}function Tg(t){return new Promise((e,r)=>{var i,a,o;function n(){$c(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{$c(),r(Jr(t,"network-request-failed"))},timeout:kg.get()})}if((a=(i=bn().gapi)==null?void 0:i.iframes)!=null&&a.Iframe)e(gapi.iframes.getContext());else if((o=bn().gapi)!=null&&o.load)n();else{const c=x_("iframefcb");return bn()[c]=()=>{gapi.load?n():r(Jr(t,"network-request-failed"))},R_(`${P_()}?onload=${c}`).catch(u=>r(u))}}).catch(e=>{throw Xa=null,e})}let Xa=null;function Ag(t){return Xa=Xa||Tg(t),Xa}/**
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
 */const Cg=new Sa(5e3,15e3),Rg="__/auth/iframe",Pg="emulator/auth/iframe",xg={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Ng=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Og(t){const e=t.config;Y(e.authDomain,t,"auth-domain-config-required");const r=e.emulator?Wl(e,Pg):`https://${t.config.authDomain}/${Rg}`,n={apiKey:e.apiKey,appName:t.name,v:Ea},i=Ng.get(t.config.apiHost);i&&(n.eid=i);const a=t._getFrameworks();return a.length&&(n.fw=a.join(",")),`${r}?${Ia(n).slice(1)}`}async function Dg(t){const e=await Ag(t),r=bn().gapi;return Y(r,t,"internal-error"),e.open({where:document.body,url:Og(t),messageHandlersFilter:r.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:xg,dontclear:!0},n=>new Promise(async(i,a)=>{await n.restyle({setHideOnLeave:!1});const o=Jr(t,"network-request-failed"),c=bn().setTimeout(()=>{a(o)},Cg.get());function u(){bn().clearTimeout(c),i(n)}n.ping(u).then(u,()=>{a(o)})}))}/**
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
 */const Lg={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Mg=500,Ug=600,Fg="_blank",$g="http://localhost";class Bc{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Bg(t,e,r,n=Mg,i=Ug){const a=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let c="";const u={...Lg,width:n.toString(),height:i.toString(),top:a,left:o},f=zt().toLowerCase();r&&(c=gd(f)?Fg:r),vd(f)&&(e=e||$g,u.scrollbars="yes");const _=Object.entries(u).reduce((w,[b,I])=>`${w}${b}=${I},`,"");if(y_(f)&&c!=="_self")return Hg(e||"",c),new Bc(null);const g=window.open(e||"",c,_);Y(g,t,"popup-blocked");try{g.focus()}catch{}return new Bc(g)}function Hg(t,e){const r=document.createElement("a");r.href=t,r.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),r.dispatchEvent(n)}/**
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
 */const Vg="__/auth/handler",zg="emulator/auth/handler",Wg=encodeURIComponent("fac");async function Hc(t,e,r,n,i,a){Y(t.config.authDomain,t,"auth-domain-config-required"),Y(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:r,redirectUrl:n,v:Ea,eventId:i};if(e instanceof Jl){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Hp(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[_,g]of Object.entries({}))o[_]=g}if(e instanceof ka){const _=e.getScopes().filter(g=>g!=="");_.length>0&&(o.scopes=_.join(","))}t.tenantId&&(o.tid=t.tenantId);const c=o;for(const _ of Object.keys(c))c[_]===void 0&&delete c[_];const u=await t._getAppCheckToken(),f=u?`#${Wg}=${encodeURIComponent(u)}`:"";return`${jg(t)}?${Ia(c).slice(1)}${f}`}function jg({config:t}){return t.emulator?Wl(t,zg):`https://${t.authDomain}/${Vg}`}/**
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
 */const el="webStorageSupport";class qg{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=xd,this._completeRedirectFn=_g,this._overrideRedirectResult=hg}async _openPopup(e,r,n,i){var o;Xn((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const a=await Hc(e,r,n,El(),i);return Bg(e,a,Yl())}async _openRedirect(e,r,n,i){await this._originValidation(e);const a=await Hc(e,r,n,El(),i);return J_(a),new Promise(()=>{})}_initialize(e){const r=e._key();if(this.eventManagers[r]){const{manager:i,promise:a}=this.eventManagers[r];return i?Promise.resolve(i):(Xn(a,"If manager is not set, promise should be"),a)}const n=this.initAndGetManager(e);return this.eventManagers[r]={promise:n},n.catch(()=>{delete this.eventManagers[r]}),n}async initAndGetManager(e){const r=await Dg(e),n=new mg(e);return r.register("authEvent",i=>(Y(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:n.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=r,n}_isIframeWebStorageSupported(e,r){this.iframes[e._key()].send(el,{type:el},i=>{var o;const a=(o=i==null?void 0:i[0])==null?void 0:o[el];a!==void 0&&r(!!a),yn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const r=e._key();return this.originValidationPromises[r]||(this.originValidationPromises[r]=Eg(e)),this.originValidationPromises[r]}get _shouldInitProactively(){return Id()||_d()||Gl()}}const Gg=qg;var Vc="@firebase/auth",zc="1.13.6";/**
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
 */class Kg{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const r=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,r),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const r=this.internalListeners.get(e);r&&(this.internalListeners.delete(e),r(),this.updateProactiveRefresh())}assertAuthConfigured(){Y(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Jg(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Yg(t){ca(new Cs("auth",(e,{options:r})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),a=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=n.options;Y(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const u={apiKey:o,authDomain:c,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Ed(t)},f=new A_(n,i,a,u);return O_(f,r),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,r,n)=>{e.getProvider("auth-internal").initialize()})),ca(new Cs("auth-internal",e=>{const r=Io(e.getProvider("auth").getImmediate());return(n=>new Kg(n))(r)},"PRIVATE").setInstantiationMode("EXPLICIT")),fs(Vc,zc,Jg(t)),fs(Vc,zc,"esm2020")}/**
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
 */const Xg=300,Qg=ed("authIdTokenMaxAge")||Xg;let Wc=null;const Zg=t=>async e=>{const r=e&&await e.getIdTokenResult(),n=r&&(new Date().getTime()-Date.parse(r.issuedAtTime))/1e3;if(n&&n>Qg)return;const i=r==null?void 0:r.token;Wc!==i&&(Wc=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function em(t=Wv()){const e=id(t,"auth");if(e.isInitialized())return e.getImmediate();const r=N_(t,{popupRedirectResolver:Gg,persistence:[ig,q_,xd]}),n=ed("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const a=new URL(n,location.origin);if(location.origin===a.origin){const o=Zg(a.toString());H_(r,o,()=>o(r.currentUser)),B_(r,c=>o(c))}}const i=Pp("auth");return i&&Sd(r,`http://${i}`),r}function tm(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}C_({loadJS(t){return new Promise((e,r)=>{const n=document.createElement("script");n.setAttribute("src",t),n.onload=e,n.onerror=i=>{const a=Jr("internal-error");a.customData=i,r(a)},n.type="text/javascript",n.charset="UTF-8",tm().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Yg("Browser");function rm(t){var n,i,a,o;if(!((n=t.firebase)!=null&&n.apiKey)||!((i=t.firebase)!=null&&i.projectId)||!((a=t.firebase)!=null&&a.authDomain)||!((o=t.firebase)!=null&&o.appId))throw new Error("Google sign-in is not configured. Contact your studio operator.");const e=em(sd(t.firebase,"liquidity-studio"));if(t.emulator){const c=new URL(t.emulator.url),u=f=>["localhost","127.0.0.1","[::1]"].includes(f);if(!u(location.hostname)||!u(c.hostname)||c.protocol!=="http:")throw new Error("Authentication emulator is restricted to local development.");Sd(e,c.origin)}const r=new Hn;return r.setCustomParameters({prompt:"select_account"}),{watch:c=>V_(e,c),login:()=>cg(e,r),logout:()=>z_(e),getToken:async()=>{if(!e.currentUser)throw new Error("Sign in with Google to continue.");return e.currentUser.getIdToken()}}}var nm=C('<meta name="description" content="Private editorial workspace for brand campaigns, measured previews and source review."/>'),im=C('<main class="login-shell"><p role="status">Connecting to your studio…</p></main>'),sm=C('<button class="primary"> </button>'),am=C('<form><label>Username<input name="username" autocomplete="username" required=""/></label><label>Password<input name="password" type="password" autocomplete="current-password" required=""/></label><button class="primary"> </button></form>'),om=C('<p class="error" role="alert"> </p>'),lm=C(`<main class="login-shell"><div class="login-card"><span class="wordmark">◈ LIQUIDITY STUDIO</span> <h1>Good work starts<br/>with a clear view.</h1> <p>Sign in to your private brand workspace.</p> <!> <!> <p class="small muted">Accounts are provisioned by your studio operator. No public
        registration.</p></div> <div class="login-art"><span class="eyebrow">YOUR EDITORIAL WORKSPACE</span> <h2>From a good story.<br/>To a considered campaign.</h2> <div class="login-cards"><span>SOURCE</span><span>SHAPE</span><span>PREVIEW</span></div> <p>One place to edit, inspect and export.<br/>Every brand keeps its own
        context.</p></div></main>`),Li=C("<option> </option>"),cm=C('<button><span aria-hidden="true"> </span> </button>'),um=C('<button><span aria-hidden="true">⌘</span>Operations</button>'),dm=C('<div class="error banner" role="alert"> <button aria-label="Dismiss error">×</button></div>'),fm=C('<div class="notice banner" role="status"> <button aria-label="Dismiss notice">×</button></div>'),hm=C('<div class="panel" role="status"> </div>'),pm=C('<div class="panel"><h2>Workspace could not load.</h2> <p>Retry loading this brand before opening or adding stories.</p> <button class="secondary">Retry workspace</button></div>'),jc=C('<span class="status-tag"> </span>'),vm=C('<div class="active-filters" role="group" aria-label="Active filters"><!> <!> <button class="secondary">Clear filters</button></div>'),_m=C('<article class="story-row"><div class="story-day"><b> </b><span> </span></div> <div class="story-copy"><span class="eyebrow"> </span> <h3> </h3> <p> </p> <span class="status-tag"> </span></div> <button class="secondary"> </button></article>'),gm=C("<h3>No stories match these filters.</h3> <p>Your stories are still in this brand. Clear filters to show them.</p>",1),mm=C("<h3>No stories here yet.</h3> <p>Add supplied facts below. The studio will not invent them.</p>",1),bm=C('<div class="empty"><!></div>'),wm=C(`<div class="section-line"><div><h2>Story backlog <span class="count"> </span></h2> <p id="backlog-results" class="muted" role="status" aria-live="polite" aria-atomic="true"> </p> <p class="muted">Opening a saved story keeps your edits.</p></div> <div class="filters"><input aria-label="Search stories" aria-describedby="backlog-results" placeholder="Search stories…"/><select aria-label="Filter by status"><option>All</option><!></select></div></div> <!> <div class="story-list"></div> <details class="panel add-story"><summary>Add a story</summary> <form class="form-grid"><label class="full">Story title<input required=""/></label><label>Category<input/></label><label>Calendar day<select></select></label><label class="full">Supplied facts, one per line<textarea rows="4" required="" placeholder="Add the specific facts you want the draft to use."></textarea></label><label class="full">Source links, one per line<textarea rows="2" placeholder="https://…"></textarea></label> <p class="small muted full">Facts are editorial inputs, not independently verified claims.
              Clinical claims require source review.</p> <button class="primary">Add to backlog</button></form></details>`,1),ym=C('<button class="calendar-story"><span class="eyebrow"> </span><b> </b><span class="status-tag"> </span></button>'),Im=C('<p class="muted small">Room for a story</p>'),Em=C('<section class="day-column"><h3> </h3> <!></section>'),Sm=C('<div class="section-line"><h2>Weekly editorial calendar</h2> <span class="muted small">Assignments only · no automatic publishing</span></div> <div class="calendar-grid"></div>',1),km=C('<p class="download"><a> </a><small>Actual exported artifact · scope authorization required</small></p>'),Tm=C("<button> <small> </small></button>"),Am=C('<label> <textarea rows="3"></textarea></label>'),Cm=C('<label>Headline<textarea aria-label="Headline" rows="3"></textarea></label> <!> <label>Takeaway<textarea rows="3"></textarea></label> <label>Caption<textarea aria-label="Caption" rows="4"></textarea></label>',1),Rm=C('<fieldset><legend></legend><label>Title<input/></label><label>Source detail<textarea rows="3"></textarea></label><label>Visual direction<input/></label></fieldset>'),Pm=C("<label>Cover hook<input/></label> <!>",1),xm=C('<label>Story hook<textarea rows="3"></textarea></label><label>Source highlight<textarea rows="4"></textarea></label><label>Poll question<input aria-label="Poll question"/></label>',1),Nm=C("<label> <textarea></textarea></label>"),Om=C("<fieldset><legend></legend><!></fieldset>"),Dm=C('<label>Spoken hook<textarea rows="3"></textarea></label><!><label>Closing call to action<input/></label>',1),Lm=C(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and
                            want to record my review.</label>`),Mm=C(`<p class="small muted">A founder clinical source review is required before
                            generation.</p>`),Um=C(`<p class="small error">Clinical review must be recorded by an authorized
                          reviewer.</p>`),Fm=C('<fieldset><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label><!></fieldset>'),$m=C('<p class="small error"> </p>'),Bm=C(`<p class="small muted">Preflight recorded for this brand. Editorial review
                    required.</p>`),Hm=C(`<div class="studio-grid"><section class="editor-panel"><div class="panel-heading"><h3>Make it yours.</h3> <span class="status-tag"> </span></div> <p class="small muted">Edit the wording, then save to update your preview and
                  exported artwork.</p> <div class="field-editor"><!></div> <details class="advanced-editor"><summary>Advanced format JSON</summary><label>Format content<textarea class="json-editor" aria-label="Format content" spellcheck="false"></textarea></label></details> <button class="primary">Save changes</button> <div class="schedule-box"><label>Assigned day<select aria-label="Assigned day"></select></label><button class="secondary">Assign to calendar</button> <p class="small muted">Assigning a day does not publish or export.</p></div> <details class="sources"><summary>Review source claims</summary> <p class="small muted">Approve a claim only after reviewing its linked source and
                    meaning. Clinical claims require a separate clinical review.</p> <!><button class="secondary">Add source claim</button><button class="secondary">Save source review</button></details> <!></section> <!></div>`),Vm=C(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and want
                          to record my review.</label>`),zm=C(`<p class="small muted">A founder clinical source review is required before
                          generation.</p>`),Wm=C('<fieldset><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label></fieldset>'),jm=C(`<section class="panel"><h3>Review sources before generation</h3> <p class="muted">Add a source link to each claim and choose its review status.
                Unreviewed claims cannot enter a campaign.</p> <div class="field-editor"></div> <button class="secondary">Add source claim</button> <button class="secondary">Save source review</button></section> <div class="empty"><span class="empty-symbol">◧</span> <h2>A story ready to take shape.</h2> <p>Generate a draft from the supplied facts, then review every
                format.</p> <button class="primary"> </button></div>`,1),qm=C('<div class="studio-toolbar"><div><span class="eyebrow">ACTIVE STORY</span> <h2> </h2> <span class="provenance"> </span></div> <div class="toolbar-actions"><button class="secondary"> </button><button class="primary"> </button></div></div> <!> <div class="format-tabs" aria-label="Campaign format"></div> <!>',1),Gm=C('<div class="empty"><h2>Choose a story to begin.</h2> <p>Every campaign starts with supplied facts and a source review.</p> <button class="primary">Open story backlog</button></div>'),Km=C('<label> <div><input type="color"/><input/></div></label>'),Jm=C('<p class="small muted"> </p> <p> </p>',1),Ym=C('<article class="panel" style="margin-bottom:12px"><h3> </h3> <!></article>'),Xm=C('<p class="muted">Audience groups need owner review.</p>'),Qm=C("<li><p> </p></li>"),Zm=C('<li class="muted">Editorial pillars need owner review.</li>'),eb=C(`<p class="small error">Clinical claims remain quarantined until explicit source and
                clinical review are recorded.</p>`),tb=C(`<section class="panel" style="margin-top:24px" aria-label="Brand positioning reference"><span class="eyebrow">OWNER POSITIONING · READ-ONLY REFERENCE</span> <h2>Proposed editorial positioning</h2> <p class="muted">These audiences and pillars describe editorial intent. They are
              not verified factual or clinical claims. Source review is required
              for every campaign.</p> <span class="status-tag"> </span> <div class="admin-grid" style="margin-top:24px"><section><h3>Audience value groups</h3> <!></section> <section><h3>Editorial pillars</h3> <ol></ol></section></div> <!></section>`),rb=C('<article class="story-row"><div class="story-copy"><h3> </h3> <span class="status-tag"> </span></div> <button class="secondary">Review sources</button></article>'),nb=C('<p class="small muted">No research prompts in this brand.</p>'),ib=C(`<form class="panel brand-form form-grid"><label>Brand name<input required=""/></label><label>Website<input/></label><label class="full">Tagline<input/></label><label class="full">Editorial mission<textarea rows="4"></textarea></label><label>Wordmark / monogram<input/></label><label>Heading font<select aria-label="Heading font"></select></label><label>Body font<select aria-label="Body font"></select></label> <div class="full color-list"></div> <button class="primary">Save Brand Kit</button></form> <!> <section class="panel" style="margin-top:24px" aria-label="Unreviewed research topics"><h2>Research queue · unreviewed</h2> <p class="muted">Research prompts are starting points, not approved claims. Open a
            topic to add sourced claims for review.</p> <!></section>`,1),sb=C('<button class="secondary"> </button>'),ab=C('<li><strong> </strong> <p class="small muted"> </p> <!></li>'),ob=C('<li class="muted">No batch attempts for this brand.</li>'),lb=C("<tr><td> </td><td> </td><td> </td><td> </td></tr>"),cb=C('<tr><td colspan="4">No generation traces for this brand.</td></tr>'),ub=C(`<div class="admin-grid"><section class="panel"><div class="panel-heading"><h2>Health & readiness</h2> <button class="secondary">Refresh</button></div> <p class="muted">Repository readiness does not establish provider connectivity.</p> <div class="ops-metrics"><div><b> </b><span>Service readiness</span></div> <div><b> </b><span>Repository check</span></div> <div><b> </b><span>Generation provider</span></div></div> <details><summary>Readiness details</summary> <pre> </pre></details></section> <section class="panel"><h2>Scoped operations</h2> <button class="secondary">Run this brand’s batch</button> <p><a>Download scoped feedback JSONL</a></p> <p class="small muted">Jobs use this organization and brand. Export is separate from
              publishing.</p> <h3>Recent batch attempts</h3> <ul aria-label="Recent batch attempts"></ul></section> <section class="panel"><h2>Organization management</h2> <form><label>New organization name<input required=""/></label><button class="secondary">Create organization</button></form> <form><label> <input required=""/></label><label>Brand preset<select aria-label="Brand preset"><option>The Liquidity Desk</option><option>Chai With Jai</option></select></label><button class="secondary">Create brand</button></form></section> <section class="panel"><h2>Telemetry & generation</h2> <div class="ops-metrics"><div><b> </b><span>Recent generation traces</span></div> <div><b> </b><span>Recorded usage events</span></div> <div><b> </b><span>Recent operational events</span></div></div> <p class="small muted">Usage records describe operations; they are not customer invoices
              or proof of factual accuracy.</p> <div class="trace-table"><table><thead><tr><th>Status</th><th>Provider</th><th>Model</th><th>Duration</th></tr></thead><tbody></tbody></table></div> <details><summary>Operational data</summary> <pre> </pre></details></section> <details class="panel"><summary>Architecture reference</summary> <pre> </pre></details></div>`),db=C('<div class="app-shell"><aside class="sidebar"><a href="/" class="wordmark">◈<span>LIQUIDITY<br/>STUDIO</span></a> <div class="scope-selectors"><label>Organization<select aria-label="Organization"></select></label><label>Brand<select aria-label="Brand"></select></label></div> <nav aria-label="Main navigation"><!><!></nav> <div class="sidebar-bottom"><span class="avatar"> </span> <div><b> </b><small> </small></div> <button aria-label="Sign out">↪</button></div></aside> <main class="workspace"><header class="workspace-header"><div><span class="eyebrow"> </span> <h1> </h1> <p> </p></div> <span class="private-badge">● Private workspace</span></header> <!><!> <!></main></div>');function fb(t,e){Al(e,!0);const r=["Mona Sans","Inter","Instrument Serif","DejaVu Sans"];function n(v){const m=typeof v=="string"?v.split("/")[0].trim():"";return r.includes(m)?m:"DejaVu Sans"}const i=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],a=[{id:"infographic",name:"Feed post",ratio:"4:5"},{id:"carousel",name:"Carousel",ratio:"4 slides"},{id:"story",name:"Story",ratio:"9:16"},{id:"reel",name:"Reel",ratio:"30s script"}];let o=R("unavailable"),c,u=0,f=0,_,g=R(null),w=R(_r([])),b=R(""),I=R(""),P=R(_r({})),k=R(""),N=R(""),G=R(!0),U=R(!1),O=R(""),H=R(""),K=R("backlog"),L=R(null),X=R(_r([])),$=R(_r([])),M=R(null),ge=R(null),pe=R("infographic"),Dt=R("Monday"),Ye=R(""),Ae=R("All"),Wt=R(null);const Zt=new gl;let jt="",Xe=R(""),ut=It(()=>s(Ye).trim()),In=It(()=>!!(s(ut)||s(Ae)!=="All")),ue=R(""),Ne=R(_r({})),Qe=R(!1),En=R(""),es=R(""),Sn=R(""),er=R(_r([])),ts=R("Editorial"),Ii=R("Monday"),Ei=R(""),Zn=R(""),rs=R("liquidity_desk"),gr=R(null),Ls=R(null),ei=R(null),Cr=R(null),qt=R(""),ti=R(""),Rr=R(!1),Ge=0,Ms=0,Si=It(()=>s(w).find(v=>v.id===s(b))),Us=It(()=>{var v,m;return(m=(v=s(Si))==null?void 0:v.brands)==null?void 0:m.find(T=>T.id===s(I))}),Fs=It(()=>s(X).filter(v=>(!s(ut)||(v.title+" "+v.category).toLowerCase().includes(s(ut).toLowerCase()))&&(s(Ae)==="All"||v.status===s(Ae)))),ko=It(()=>{var v,m,T,V;return((m=(v=s(ge))==null?void 0:v.provenance)==null?void 0:m.mode)==="synthetic"?"Synthetic draft · source review required":((V=(T=s(ge))==null?void 0:T.provenance)==null?void 0:V.mode)==="provider"?"Provider draft · source review required":"Source provenance unverified · review required"}),ki=It(()=>{var v,m;return((v=s(P))==null?void 0:v.admin)===!0||((m=s(g))==null?void 0:m.role)==="founder"});function Aa(){return new URLSearchParams({organizationId:s(b),brandId:s(I)}).toString()}async function kn(v,m={},T=!0){const V=Ge,le=s(o)==="google"?{Authorization:`Bearer ${await c.getToken()}`}:{},ve=await fetch(v+(T?(v.includes("?")?"&":"?")+Aa():""),{...m,credentials:"same-origin",headers:{...m.body?{"Content-Type":"application/json"}:{},...m.headers,...le}}),Re=await ve.json().catch(()=>({}));if(!ve.ok)throw ve.status===401&&Ti(),new Error(Re.error||Re.message||`Request failed (${ve.status})`);if(T&&V!==Ge)throw new Error("Workspace changed while the request was running; retry in the current brand");return Re}function Lt(v,m={},T=!0){return kn(v,{method:"POST",body:JSON.stringify(m)},T)}function ns(v){var m,T,V,le,ve,Re;d(g,v.user,!0),d(w,v.organizations||[],!0),d(P,v.permissions||{},!0),d(b,((m=v.activeScope)==null?void 0:m.organizationId)||((T=s(w)[0])==null?void 0:T.id)||"",!0),d(I,((V=v.activeScope)==null?void 0:V.brandId)||((Re=(ve=(le=s(w).find(D=>D.id===s(b)))==null?void 0:le.brands)==null?void 0:ve[0])==null?void 0:Re.id)||"",!0)}function Tn(){f++,clearTimeout(_),_=void 0}function Ti(){Ge++,d(Rr,!1),d(Xe,""),Zt.clear(),jt="",d(Ye,""),d(Ae,"All"),d(g,null),d(w,[],!0),d(P,{},!0),d(b,""),d(I,""),d(X,[],!0),d($,[],!0),d(M,null),d(ge,null),d(L,null),d(gr,null),d(Cr,null),d(qt,""),d(Qe,!1)}Ku(()=>{let v=!1,m;async function T(){try{const V=await fetch("/api/auth/config");if(!V.ok)throw new Error("Could not load sign-in configuration.");const le=await V.json();if(v)return;if(!["google","password"].includes(le.mode))throw new Error("Unsupported sign-in configuration.");if(d(o,le.mode,!0),s(o)==="google")c=rm(le),m=c.watch(async ve=>{Tn();const Re=++u;Ti(),d(G,!0);try{if(ve){const D=await kn("/api/auth/session",{},!1);if(v||Re!==u)return;ns(D),s(I)&&await Cn()}}catch(D){!v&&Re===u&&(Ti(),d(O,`Google sign-in could not open this workspace: ${D.message}. Check your invited account or contact the studio operator.`))}finally{!v&&Re===u&&(d(G,!1),d(U,!1))}});else{const ve=await fetch("/api/auth/session",{credentials:"same-origin"});ve.ok&&!v&&(ns(await ve.json()),s(I)&&await Cn()),v||d(G,!1)}}catch(V){v||(d(O,V.message,!0),d(G,!1))}}return T(),()=>{v=!0,u++,Tn(),m==null||m()}});async function Ca(){if(s(U)||!c)return;Tn();const v=f;d(U,!0),d(O,"");const m=setTimeout(()=>{v===f&&(Tn(),d(U,!1),d(O,"Google sign-in has not completed. Finish the Google popup or try again."))},9e4);_=m;try{await c.login()}catch(T){if(v!==f)return;d(O,T.code==="auth/popup-closed-by-user"?"Google sign-in was closed. Select Continue with Google to try again.":T.code==="auth/popup-blocked"?"Allow the Google sign-in popup, then try again.":T.message||"Google sign-in failed. Try again.",!0)}finally{clearTimeout(m),v===f&&(_=void 0,d(U,!1))}}async function Ra(v){v.preventDefault(),d(U,!0),d(O,"");try{const m=await Lt("/api/auth/login",{username:s(k),password:s(N)},!1);d(N,""),ns(m),await Cn()}catch(m){d(O,m.message,!0)}finally{d(U,!1)}}async function To(){try{s(o)==="google"?await c.logout():await Lt("/api/auth/logout",{},!1),u++,Tn(),Ti(),d(G,!1)}catch(v){d(O,v.message,!0)}}async function Pa(v){if(s(o)==="google"){v.preventDefault();try{const m=await fetch(s(qt),{headers:{Authorization:`Bearer ${await c.getToken()}`}});if(!m.ok)throw new Error(`Download failed (${m.status}). Sign in again if access expired.`);const T=URL.createObjectURL(await m.blob()),V=document.createElement("a");V.href=T,V.download=s(ti),V.click(),setTimeout(()=>URL.revokeObjectURL(T),1e3)}catch(m){d(O,m.message,!0)}}}function $s(){var v;return JSON.stringify([(v=s(g))==null?void 0:v.id,s(b),s(I)])}function An(){var T;if(!s(g)||s(Rr)||s(Xe))return;const v=$s(),m=Zt.get(v);Zt.set(v,{search:s(Ye),statusFilter:s(Ae),selectedStoryId:(T=s(M))==null?void 0:T.id,scrollY:s(K)==="backlog"?window.scrollY:(m==null?void 0:m.scrollY)||0})}async function Bs(v){var m;if(s(K)==="backlog"&&An(),d(K,v,!0),v==="backlog"){const T=Ge;await ra(),T===Ge&&!s(Rr)&&window.scrollTo(0,((m=Zt.get($s()))==null?void 0:m.scrollY)||0)}}async function Ao(){var v;d(Ye,""),d(Ae,"All"),An(),await ra(),(v=s(Wt))==null||v.focus()}async function Cn(){var le,ve,Re;const v=$s(),m=Zt.get(v),T=v===jt?{search:s(Ye),statusFilter:s(Ae),selectedStoryId:((le=s(M))==null?void 0:le.id)||(m==null?void 0:m.selectedStoryId),scrollY:(m==null?void 0:m.scrollY)||0}:m;jt=v,d(Ye,(T==null?void 0:T.search)||"",!0),d(Ae,(T==null?void 0:T.statusFilter)||"All",!0),d(Xe,"");const V=++Ge;d(Rr,!0),d(X,[],!0),d($,[],!0),d(L,null),d(er,[],!0),d(H,""),d(O,""),d(U,!0),d(M,null),d(ge,null),d(gr,null),d(Cr,null),d(qt,""),d(Qe,!1);try{const D=await kn("/api/studio/bootstrap");if(V!==Ge)return;d(L,D.brandProfile,!0),s(L)&&((ve=s(L)).fonts||(ve.fonts={heading:"DejaVu Sans",body:"DejaVu Sans"}),s(L).fonts.heading=n(s(L).fonts.heading),s(L).fonts.body=n(s(L).fonts.body),(Re=s(L)).colors||(Re.colors=[])),d(X,D.backlog||[],!0),d($,D.calendar||[],!0),D.organizations&&d(w,D.organizations,!0),D.permissions&&d(P,D.permissions,!0),s(X).length&&Hs(s(X).find(ae=>ae.id===(T==null?void 0:T.selectedStoryId))||s(X)[0])}catch(D){V===Ge&&(d(O,D.message,!0),d(Xe,D.message,!0),d(X,[],!0),d($,[],!0),d(L,null))}finally{V===Ge&&(d(U,!1),d(Rr,!1),await ra(),V===Ge&&s(K)==="backlog"&&!s(Xe)&&window.scrollTo(0,(T==null?void 0:T.scrollY)||0))}}async function Co(v){var m,T,V;s(Qe)&&!await Ce()||(An(),d(b,v.currentTarget.value,!0),d(I,((V=(T=(m=s(w).find(le=>le.id===s(b)))==null?void 0:m.brands)==null?void 0:T[0])==null?void 0:V.id)||"",!0),d(K,"backlog"),await Cn())}async function Ro(v){s(Qe)&&!await Ce()||(An(),d(I,v.currentTarget.value,!0),d(K,"backlog"),await Cn())}function Hs(v){var m;d(M,v,!0),d(ge,(v==null?void 0:v.campaignDraft)||null,!0),d(Dt,(v==null?void 0:v.scheduledDay)||"Monday",!0),d(er,((v==null?void 0:v.sourceClaims)||((m=v==null?void 0:v.verifiedFacts)==null?void 0:m.map((T,V)=>({id:`claim_${V}`,text:T,sourceUrl:"",status:"unreviewed"})))||[]).map(T=>({...T})),!0),d(qt,""),d(Cr,null),Vs()}function Vs(){var v,m;d(Ne,(v=s(ge))!=null&&v[s(pe)]?JSON.parse(JSON.stringify(s(ge)[s(pe)])):{},!0),d(ue,(m=s(ge))!=null&&m[s(pe)]?JSON.stringify(s(Ne),null,2):"",!0),d(Qe,!1)}function Pr(v,m){s(Ne)[v]=m,d(ue,JSON.stringify(s(Ne),null,2),!0),d(Qe,!0)}function Ai(v,m,T,V){T?s(Ne)[v][m][T]=V:s(Ne)[v][m]=V,d(ue,JSON.stringify(s(Ne),null,2),!0),d(Qe,!0)}async function zs(v){s(Qe)&&!await Ce()||(An(),Hs(v),An(),d(K,"studio"))}async function A(v){s(Qe)&&!await Ce()||(d(pe,v,!0),d(qt,""),Vs())}async function J(){var T,V;if(!s(M)||s(U)||s(Qe)&&!await Ce())return;d(U,!0),d(O,"");const v=Ge,m=s(M).id;try{const le=await Lt("/api/studio/generate-campaign",{storyId:m});if(v!==Ge||((T=s(M))==null?void 0:T.id)!==m)return;d(ge,le.campaign,!0),d(M,((V=le.backlog)==null?void 0:V.find(ve=>ve.id===m))||le.story,!0),d(X,le.backlog||s(X),!0),d($,le.calendar||s($),!0),Vs(),d(H,"Draft generated. Review the sources before export.")}catch(le){v===Ge&&d(O,`Generation failed: ${le.message}. Your existing draft is preserved.`)}finally{v===Ge&&d(U,!1)}}async function Ce(){if(!s(ge)||!s(M)||!s(Qe))return!0;d(O,"");try{const v=s(ue),m=JSON.parse(v);if(!m||typeof m!="object"||Array.isArray(m))throw new Error("Format content must be a JSON object");const T=await Lt("/api/studio/save-edit",{storyId:s(M).id,format:s(pe),content:m,expectedRevision:s(M).revision});T.story?d(M,T.story,!0):T.revision!==void 0&&(s(M).revision=T.revision),s(ge)[s(pe)]=m,s(M).campaignDraft=s(ge);const V=s(X).find(le=>le.id===s(M).id);return V&&(V.campaignDraft=s(ge)),d(Qe,s(ue)!==v),d(H,s(Qe)?"Saved the submitted edit. Newer changes remain unsaved.":"Changes saved.",!0),!s(Qe)}catch(v){return d(O,`Could not save: ${v.message}. Your editor text is still here.`),!1}}async function ot(){if(s(M))try{const v=await Lt("/api/studio/schedule",{storyId:s(M).id,status:"Scheduled",scheduledDay:s(Dt)});d(M,v.story||{...s(M),scheduledDay:s(Dt),status:"Scheduled"},!0),d(X,v.backlog||s(X),!0),d($,v.calendar||s($),!0),d(H,`Assigned to ${s(Dt)}. This does not publish to Instagram.`)}catch(v){d(O,v.message,!0)}}async function Tt(){var v,m;if(!(!await Ce()||!s(M)||!s(ge))){d(U,!0),d(O,""),d(qt,"");try{const T=await Lt("/api/studio/export-asset",{storyId:s(M).id,format:s(pe),content:s(ge)[s(pe)]});if(d(qt,T.downloadUrl||((v=T.artifact)==null?void 0:v.downloadUrl)||"",!0),d(ti,T.filename||((m=T.artifact)==null?void 0:m.filename)||"Download export",!0),!s(qt))throw new Error("Server did not return a downloadable artifact");d(X,T.backlog||s(X),!0),d($,T.calendar||s($),!0),d(M,s(X).find(V=>V.id===s(M).id)||s(M),!0),d(H,"Export created. Download the actual file below.")}catch(T){d(O,`Export failed: ${T.message}`)}finally{d(U,!1)}}}function He(){d(er,[...s(er),{id:crypto.randomUUID(),text:"",sourceUrl:"",kind:"",status:"unreviewed"}],!0)}function At(v){d(er,s(er).filter(m=>m.id!==v),!0)}async function Ct(){if(s(M)){if(!s(er).length){d(O,"Add at least one sourced claim before saving the review.");return}d(O,"");try{const v=await Lt("/api/studio/source-claims",{storyId:s(M).id,sourceClaims:s(er),expectedRevision:s(M).revision});if(v.story){d(M,v.story,!0);const m=s(X).findIndex(T=>T.id===s(M).id);m>=0&&(s(X)[m]=s(M))}d(H,"Source review saved. Only approved sourced claims can enter generation.")}catch(v){d(O,v.message,!0)}}}async function tr(v){v.preventDefault();try{const T=Object.fromEntries(["brandName","websiteUrl","tagline","mission","fonts","colors","logoText","strategy","valueGroups","pillars"].filter(le=>s(L)[le]!==void 0).map(le=>[le,s(L)[le]]));T.fonts={heading:n(s(L).fonts.heading),body:n(s(L).fonts.body)};const V=await Lt("/api/studio/brand-profile",T);d(L,V.brandProfile||s(L),!0),d(H,"Brand profile saved for this brand.")}catch(m){d(O,m.message,!0)}}async function Mt(v){v.preventDefault();const m=s(es).split(`
`).map(T=>T.trim()).filter(Boolean);if(!m.length){d(O,"Add at least one supplied fact. The studio will not invent source facts.");return}try{const T=await Lt("/api/studio/backlog",{title:s(En),category:s(ts),scheduledDay:s(Ii),verifiedFacts:m,sourceClaims:m.map((V,le)=>{var ve;return{id:`claim_${le}`,text:V,sourceUrl:((ve=s(Sn).split(`
`)[le])==null?void 0:ve.trim())||"",status:"unreviewed"}}),sourceUrls:s(Sn).split(`
`).filter(Boolean),sourceStatus:"unreviewed"});d(X,T.backlog||[T.story,...s(X)],!0),d($,T.calendar||s($),!0),d(En,""),d(es,""),d(Sn,""),d(H,"Story added. Supplied facts still need source review.")}catch(T){d(O,T.message,!0)}}async function Ze(){s(K)==="backlog"&&An(),d(K,"admin"),d(O,"");try{await(async v=>{var m=cf(v,3);d(gr,m[0],!0),d(Ls,m[1],!0),d(ei,m[2],!0)})(await Promise.all([kn("/api/admin/overview"),kn("/api/admin/context-graph"),fetch("/readyz").then(v=>v.json())]))}catch(v){d(O,v.message,!0)}}async function xr(v){v.preventDefault();try{await Lt("/api/admin/organizations",{name:s(Ei)});const m=await kn("/api/auth/session",{},!1);d(w,m.organizations||s(w),!0),d(Ei,""),d(H,"Organization created.")}catch(m){d(O,m.message,!0)}}async function Gt(v){v.preventDefault();try{await Lt("/api/admin/brands",{organizationId:s(b),name:s(Zn),preset:s(rs)});const m=await kn("/api/auth/session",{},!1);d(w,m.organizations||s(w),!0),d(Zn,""),d(H,"Brand created.")}catch(m){d(O,m.message,!0)}}async function rr(v=null){const m=Ge;d(U,!0),d(O,"");try{if(await Lt("/api/admin/run-weekly-batch",{idempotencyKey:crypto.randomUUID(),maxStories:5,...v?{retryOfJobId:v}:{}}),m!==Ge)return;await Cn(),await Ze(),d(H,v?"Retry completed. Previously completed drafts were preserved.":"Scoped batch completed. Review every generated draft.",!0)}catch(T){if(m!==Ge)return;await Ze(),d(O,T.message,!0)}finally{d(U,!1)}}async function Nr(v){if(!s(M)||!s(g))return;const m=++Ms,T=Ge;try{const V=await Lt("/api/studio/preflight",{storyId:s(M).id,expectedRevision:s(M).revision,...v});m===Ms&&T===Ge&&d(Cr,V,!0)}catch(V){T===Ge&&d(Cr,{error:V.message},!0)}}var Or=Ma();Oh("1n46o8q",v=>{var m=nm();Ul(()=>{Eu.title="Liquidity Studio · Brand workspace"}),S(v,m)});var Rn=it(Or);{var Pn=v=>{var m=im();S(v,m)},mr=v=>{var m=lm(),T=p(m),V=l(p(T),6);{var le=ae=>{var te=sm(),ye=E(te,!0);F(()=>{te.disabled=s(U),y(ye,s(U)?"Signing in…":"Continue with Google")}),x("click",te,Ca),S(ae,te)},ve=ae=>{var te=am(),ye=p(te),Ue=l(p(ye)),Ve=l(ye),Rt=l(p(Ve)),et=l(Ve),Ut=E(et,!0);F(()=>{et.disabled=s(U),y(Ut,s(U)?"Signing in…":"Sign in →")}),Fi("submit",te,Ra),qe(Ue,()=>s(k),dt=>d(k,dt)),qe(Rt,()=>s(N),dt=>d(N,dt)),S(ae,te)};se(V,ae=>{s(o)==="google"?ae(le):s(o)==="password"&&ae(ve,1)})}var Re=l(V,2);{var D=ae=>{var te=om(),ye=E(te,!0);F(()=>y(ye,s(O))),S(ae,te)};se(Re,ae=>{s(O)&&ae(D)})}S(v,m)},br=v=>{var m=db(),T=p(m),V=p(T),le=l(V,2),ve=p(le),Re=l(p(ve));Me(Re,21,()=>s(w),z=>z.id,(z,ee)=>{var re=Li(),Oe=E(re,!0),tt={};F(()=>{y(Oe,s(ee).name),tt!==(tt=s(ee).id)&&(re.value=(re.__value=tt)??"")}),S(z,re)});var D;lr(Re);var ae=l(ve),te=l(p(ae));Me(te,21,()=>{var z;return((z=s(Si))==null?void 0:z.brands)||[]},z=>z.id,(z,ee)=>{var re=Li(),Oe=E(re,!0),tt={};F(()=>{y(Oe,s(ee).name),tt!==(tt=s(ee).id)&&(re.value=(re.__value=tt)??"")}),S(z,re)});var ye;lr(te);var Ue=l(le,2),Ve=p(Ue);Me(Ve,16,()=>[{id:"backlog",label:"Story backlog",icon:"▤"},{id:"calendar",label:"Content calendar",icon:"▦"},{id:"studio",label:"Campaign Studio",icon:"◧"},{id:"brand",label:"Brand Kit",icon:"◉"}],z=>z.id,(z,ee)=>{var re=cm();let Oe;var tt=p(re),ft=E(tt,!0),wt=l(tt,1,!0);F(()=>{Oe=cr(re,1,"",null,Oe,{active:s(K)===ee.id}),y(ft,ee.icon),y(wt,ee.label)}),x("click",re,()=>Bs(ee.id)),S(z,re)});var Rt=l(Ve);{var et=z=>{var ee=um();let re;F(()=>{ee.disabled=s(Rr),re=cr(ee,1,"",null,re,{active:s(K)==="admin"})}),x("click",ee,Ze),S(z,ee)};se(Rt,z=>{s(ki)&&z(et)})}var Ut=l(Ue,2),dt=p(Ut),ri=E(dt,!0),Xr=l(dt,2),xn=p(Xr),Nn=E(xn,!0),ni=l(xn),On=E(ni,!0),Dr=l(Xr,2),Lr=l(T,2),ii=p(Lr),bt=p(ii),Kt=p(bt),Dn=E(Kt),Ws=l(Kt,2),Ci=E(Ws,!0),si=l(Ws,2),Ln=E(si,!0),xa=l(ii,2);{var Po=z=>{var ee=dm(),re=p(ee),Oe=l(re);F(()=>y(re,s(O))),x("click",Oe,()=>d(O,"")),S(z,ee)};se(xa,z=>{s(O)&&z(Po)})}var ai=l(xa);{var Ri=z=>{var ee=fm(),re=p(ee),Oe=l(re);F(()=>y(re,s(H))),x("click",Oe,()=>d(H,"")),S(z,ee)};se(ai,z=>{s(H)&&z(Ri)})}var Pi=l(ai,2);{var xo=z=>{var ee=hm(),re=E(ee);F(()=>{var Oe;return y(re,`Loading ${(((Oe=s(Us))==null?void 0:Oe.name)||"brand")??""} workspace…`)}),S(z,ee)},Na=z=>{var ee=pm(),re=l(p(ee),4);x("click",re,Cn),S(z,ee)},Bd=z=>{var ee=wm(),re=it(ee),Oe=p(re),tt=p(Oe),ft=l(p(tt)),wt=E(ft),nr=l(tt,2),Qr=E(nr),_t=l(Oe,2),Pt=p(_t);Gu(Pt,B=>d(Wt,B),()=>s(Wt));var Jt=l(Pt),Zr=l(p(Jt));Me(Zr,16,()=>[...new Set([...s(X).map(B=>B.status),s(Ae)].filter(B=>B!=="All"))],B=>B,(B,be)=>{var Se=Li(),lt=E(Se,!0),ze={};F(()=>{y(lt,be),ze!==(ze=be)&&(Se.__value=ze)}),S(B,Se)}),lr(Jt);var Mr=l(re,2);{var Ft=B=>{var be=vm(),Se=p(be);{var lt=Ke=>{var nt=jc(),gt=E(nt);F(()=>y(gt,`Search: ${s(ut)??""}`)),S(Ke,nt)};se(Se,Ke=>{s(ut)&&Ke(lt)})}var ze=l(Se,2);{var fe=Ke=>{var nt=jc(),gt=E(nt);F(()=>y(gt,`Status: ${s(Ae)??""}`)),S(Ke,nt)};se(ze,Ke=>{s(Ae)!=="All"&&Ke(fe)})}var oe=l(ze,2);x("click",oe,Ao),S(B,be)};se(Mr,B=>{s(In)&&B(Ft)})}var Ur=l(Mr,2);Me(Ur,21,()=>s(Fs),B=>B.id,(B,be)=>{var Se=_m(),lt=p(Se),ze=p(lt),fe=E(ze,!0),oe=l(ze),Ke=E(oe,!0),nt=l(lt,2),gt=p(nt),rn=E(gt,!0),$t=l(gt,2),sr=E($t,!0),ar=l($t,2),wr=E(ar,!0),nn=l(ar,2),sn=E(nn,!0),yr=l(nt,2),$r=E(yr);F(Ir=>{var an;y(fe,Ir),y(Ke,s(be).campaignDraft?"DRAFT":"SOURCE"),y(rn,s(be).category),y(sr,s(be).title),y(wr,((an=s(be).verifiedFacts)==null?void 0:an[0])||"Add source facts before generating."),y(sn,s(be).status),y($r,`${s(be).campaignDraft?"Open draft":"Open story"} ↗`)},[()=>{var Ir;return((Ir=s(be).scheduledDay)==null?void 0:Ir.slice(0,3))||"—"}]),x("click",yr,()=>zs(s(be))),S(B,Se)},B=>{var be=bm(),Se=p(be);{var lt=fe=>{var oe=gm();S(fe,oe)},ze=fe=>{var oe=mm();S(fe,oe)};se(Se,fe=>{s(X).length?fe(lt):fe(ze,-1)})}S(B,be)});var ir=l(Ur,2),en=l(p(ir),2),Fr=p(en),Mn=l(p(Fr)),tn=l(Fr),xi=l(p(tn)),ne=l(tn),Te=l(p(ne));Me(Te,20,()=>i,B=>B,(B,be)=>{var Se=Li(),lt=E(Se,!0),ze={};F(()=>{y(lt,be),ze!==(ze=be)&&(Se.__value=ze)}),S(B,Se)}),lr(Te);var de=l(ne),Pe=l(p(de)),me=l(de),rt=l(p(me));F(()=>{y(wt,`${s(Fs).length??""} of ${s(X).length??""}`),y(Qr,`Showing ${s(Fs).length??""} of ${s(X).length??""} stories.${s(ut)?` Search: ${s(ut)}.`:""}${s(Ae)!=="All"?` Status: ${s(Ae)}.`:""}`)}),qe(Pt,()=>s(Ye),B=>d(Ye,B)),Br(Jt,()=>s(Ae),B=>d(Ae,B)),Fi("submit",en,Mt),qe(Mn,()=>s(En),B=>d(En,B)),qe(xi,()=>s(ts),B=>d(ts,B)),Br(Te,()=>s(Ii),B=>d(Ii,B)),qe(Pe,()=>s(es),B=>d(es,B)),qe(rt,()=>s(Sn),B=>d(Sn,B)),S(z,ee)},Hd=z=>{var ee=Sm(),re=l(it(ee),2);Me(re,20,()=>i,Oe=>Oe,(Oe,tt)=>{var ft=Em(),wt=p(ft),nr=E(wt,!0),Qr=l(wt,2);Me(Qr,17,()=>s(X).filter(_t=>_t.scheduledDay===tt),_t=>_t.id,(_t,Pt)=>{var Jt=ym(),Zr=p(Jt),Mr=E(Zr,!0),Ft=l(Zr),Ur=E(Ft,!0),ir=l(Ft),en=E(ir,!0);F(()=>{y(Mr,s(Pt).category),y(Ur,s(Pt).title),y(en,s(Pt).status)}),x("click",Jt,()=>zs(s(Pt))),S(_t,Jt)},_t=>{var Pt=Im();S(_t,Pt)}),F(()=>y(nr,tt)),S(Oe,ft)}),S(z,ee)},Vd=z=>{var ee=Ma(),re=it(ee);{var Oe=ft=>{var wt=qm(),nr=it(wt),Qr=p(nr),_t=l(p(Qr),2),Pt=E(_t,!0),Jt=l(_t,2),Zr=E(Jt,!0),Mr=l(Qr,2),Ft=p(Mr),Ur=E(Ft,!0),ir=l(Ft),en=E(ir),Fr=l(nr,2);{var Mn=de=>{var Pe=km(),me=p(Pe),rt=E(me);F(()=>{Et(me,"href",s(qt)),Et(me,"download",s(ti)),y(rt,`↓ ${s(ti)??""}`)}),x("click",me,Pa),S(de,Pe)};se(Fr,de=>{s(qt)&&de(Mn)})}var tn=l(Fr,2);Me(tn,21,()=>a,de=>de.id,(de,Pe)=>{var me=Tm();let rt;var B=p(me),be=l(B),Se=E(be,!0);F(()=>{rt=cr(me,1,"",null,rt,{active:s(pe)===s(Pe).id}),y(B,s(Pe).name),y(Se,s(Pe).ratio)}),x("click",me,()=>A(s(Pe).id)),S(de,me)});var xi=l(tn,2);{var ne=de=>{var Pe=Hm(),me=p(Pe),rt=p(me),B=l(p(rt),2),be=E(B,!0),Se=l(rt,4),lt=p(Se);{var ze=he=>{var ce=Cm(),We=it(ce),Q=l(p(We)),q=l(We,2);Me(q,17,()=>s(Ne).statRows||[],us,(je,ct,ht)=>{var Je=Am(),xe=p(Je);xe.nodeValue=`Fact ${ht+1}`;var $e=l(xe);F(()=>Yt($e,s(ct))),x("input",$e,mt=>Ai("statRows",ht,null,mt.currentTarget.value)),S(je,Je)});var De=l(q,2),Fe=l(p(De)),we=l(De,2),Le=l(p(we));F(()=>{Yt(Q,s(Ne).headline||""),Yt(Fe,s(Ne).bottomTakeaway||""),Yt(Le,s(Ne).caption||"")}),x("input",Q,je=>Pr("headline",je.currentTarget.value)),x("input",Fe,je=>Pr("bottomTakeaway",je.currentTarget.value)),x("input",Le,je=>Pr("caption",je.currentTarget.value)),S(he,ce)},fe=he=>{var ce=Pm(),We=it(ce),Q=l(p(We)),q=l(We,2);Me(q,17,()=>s(Ne).slides||[],us,(De,Fe,we)=>{var Le=Rm(),je=p(Le);je.textContent=`Slide ${we+1}`;var ct=l(je),ht=l(p(ct)),Je=l(ct),xe=l(p(Je)),$e=l(Je),mt=l(p($e));F(()=>{Yt(ht,s(Fe).title||""),Yt(xe,s(Fe).bodyMetric||""),Yt(mt,s(Fe).visualNote||"")}),x("input",ht,yt=>Ai("slides",we,"title",yt.currentTarget.value)),x("input",xe,yt=>Ai("slides",we,"bodyMetric",yt.currentTarget.value)),x("input",mt,yt=>Ai("slides",we,"visualNote",yt.currentTarget.value)),S(De,Le)}),F(()=>Yt(Q,s(Ne).coverHook||"")),x("input",Q,De=>Pr("coverHook",De.currentTarget.value)),S(he,ce)},oe=he=>{var ce=xm(),We=it(ce),Q=l(p(We)),q=l(We),De=l(p(q)),Fe=l(q),we=l(p(Fe));F(()=>{Yt(Q,s(Ne).hookBanner||""),Yt(De,s(Ne).keyStatHighlight||""),Yt(we,s(Ne).interactiveStickerPrompt||"")}),x("input",Q,Le=>Pr("hookBanner",Le.currentTarget.value)),x("input",De,Le=>Pr("keyStatHighlight",Le.currentTarget.value)),x("input",we,Le=>Pr("interactiveStickerPrompt",Le.currentTarget.value)),S(he,ce)},Ke=he=>{var ce=Dm(),We=it(ce),Q=l(p(We)),q=l(We);Me(q,17,()=>s(Ne).beats||[],us,(we,Le,je)=>{var ct=Om(),ht=p(ct);ht.textContent=`Beat ${je+1}`;var Je=l(ht);Me(Je,16,()=>["timecode","voiceover","onScreenText","bRollDirection"],xe=>xe,(xe,$e)=>{var mt=Nm(),yt=p(mt),on=l(yt);F(()=>{y(yt,$e),Yt(on,s(Le)[$e]||""),Et(on,"rows",$e==="timecode"?1:3)}),x("input",on,Di=>Ai("beats",je,$e,Di.currentTarget.value)),S(xe,mt)}),S(we,ct)});var De=l(q),Fe=l(p(De));F(()=>{Yt(Q,s(Ne).spokenHook0to3s||""),Yt(Fe,s(Ne).closingCta||"")}),x("input",Q,we=>Pr("spokenHook0to3s",we.currentTarget.value)),x("input",Fe,we=>Pr("closingCta",we.currentTarget.value)),S(he,ce)};se(lt,he=>{s(pe)==="infographic"?he(ze):s(pe)==="carousel"?he(fe,1):s(pe)==="story"?he(oe,2):he(Ke,-1)})}var nt=l(Se,2),gt=l(p(nt)),rn=l(p(gt)),$t=l(nt,2),sr=l($t,2),ar=p(sr),wr=l(p(ar));Me(wr,20,()=>i,he=>he,(he,ce)=>{var We=Li(),Q=E(We,!0),q={};F(()=>{y(Q,ce),q!==(q=ce)&&(We.__value=q)}),S(he,We)}),lr(wr);var nn=l(ar),sn=l(sr,2),yr=l(p(sn),4);Me(yr,19,()=>s(er),he=>he.id,(he,ce,We)=>{var Q=Fm(),q=p(Q),De=E(q),Fe=l(q),we=E(Fe),Le=l(Fe),je=l(p(Le)),ct=l(Le),ht=l(p(ct)),Je=l(ct),xe=l(p(Je)),$e=p(xe);$e.value=$e.__value="";var mt=l($e);mt.value=mt.__value="general";var yt=l(mt);yt.value=yt.__value="financial";var on=l(yt);on.value=on.__value="cultural";var Di=l(on);Di.value=Di.__value="clinical",lr(xe);var js=l(Je);{var Oa=Bt=>{var Da=Ma(),Gd=it(Da);{var Kd=ss=>{var La=Lm(),Yd=p(La);io(Yd,()=>s(ce).clinicalReviewRequested,Xd=>s(ce).clinicalReviewRequested=Xd),S(ss,La)},Jd=ss=>{var La=Mm();S(ss,La)};se(Gd,ss=>{s(ki)?ss(Kd):ss(Jd,-1)})}S(Bt,Da)};se(js,Bt=>{s(ce).kind==="clinical"&&Bt(Oa)})}var Zl=l(js),No=l(p(Zl)),Oo=p(No);Oo.value=Oo.__value="unreviewed";var Do=l(Oo);Do.value=Do.__value="approved";var ec=l(Do);ec.value=ec.__value="rejected",lr(No);var jd=l(Zl);{var qd=Bt=>{var Da=Um();S(Bt,Da)};se(jd,Bt=>{s(ce).kind==="clinical"&&Bt(qd)})}F(()=>{y(De,`Claim ${s(We)+1}`),Et(Fe,"aria-label",`Remove claim ${s(We)+1}`),y(we,`Remove claim ${s(We)+1}`)}),x("click",Fe,()=>At(s(ce).id)),qe(je,()=>s(ce).text,Bt=>s(ce).text=Bt),qe(ht,()=>s(ce).sourceUrl,Bt=>s(ce).sourceUrl=Bt),Br(xe,()=>s(ce).kind,Bt=>s(ce).kind=Bt),Br(No,()=>s(ce).status,Bt=>s(ce).status=Bt),S(he,Q)});var $r=l(yr),Ir=l($r),an=l(sn,2);{var Ni=he=>{var ce=$m(),We=E(ce);F(()=>y(We,`Preflight could not be recorded: ${s(Cr).error??""}`)),S(he,ce)},Oi=he=>{var ce=Bm();S(he,ce)};se(an,he=>{var ce;(ce=s(Cr))!=null&&ce.error?he(Ni):s(Cr)&&he(Oi,1)})}var is=l(me,2);Rh(is,()=>s(b)+s(I)+s(M).id+s(pe),he=>{yp(he,{get campaign(){return s(ge)},get brandProfile(){return s(L)},get format(){return s(pe)},get backlog(){return s(X)},get activeStoryId(){return s(M).id},onpreflight:Nr})}),F(()=>{y(be,s(Qe)?"Unsaved changes":"Saved draft"),$t.disabled=!s(Qe)||s(U)}),x("input",rn,()=>{d(Qe,!0);try{d(Ne,JSON.parse(s(ue)),!0)}catch{}}),qe(rn,()=>s(ue),he=>d(ue,he)),x("click",$t,Ce),Br(wr,()=>s(Dt),he=>d(Dt,he)),x("click",nn,ot),x("click",$r,He),x("click",Ir,Ct),S(de,Pe)},Te=de=>{var Pe=jm(),me=it(Pe),rt=l(p(me),4);Me(rt,23,()=>s(er),fe=>fe.id,(fe,oe,Ke)=>{var nt=Wm(),gt=p(nt),rn=E(gt),$t=l(gt),sr=E($t),ar=l($t),wr=l(p(ar)),nn=l(ar),sn=l(p(nn)),yr=l(nn),$r=l(p(yr)),Ir=p($r);Ir.value=Ir.__value="";var an=l(Ir);an.value=an.__value="general";var Ni=l(an);Ni.value=Ni.__value="financial";var Oi=l(Ni);Oi.value=Oi.__value="cultural";var is=l(Oi);is.value=is.__value="clinical",lr($r);var he=l(yr);{var ce=we=>{var Le=Ma(),je=it(Le);{var ct=Je=>{var xe=Vm(),$e=p(xe);io($e,()=>s(oe).clinicalReviewRequested,mt=>s(oe).clinicalReviewRequested=mt),S(Je,xe)},ht=Je=>{var xe=zm();S(Je,xe)};se(je,Je=>{s(ki)?Je(ct):Je(ht,-1)})}S(we,Le)};se(he,we=>{s(oe).kind==="clinical"&&we(ce)})}var We=l(he),Q=l(p(We)),q=p(Q);q.value=q.__value="unreviewed";var De=l(q);De.value=De.__value="approved";var Fe=l(De);Fe.value=Fe.__value="rejected",lr(Q),F(()=>{y(rn,`Claim ${s(Ke)+1}`),Et($t,"aria-label",`Remove claim ${s(Ke)+1}`),y(sr,`Remove claim ${s(Ke)+1}`)}),x("click",$t,()=>At(s(oe).id)),qe(wr,()=>s(oe).text,we=>s(oe).text=we),qe(sn,()=>s(oe).sourceUrl,we=>s(oe).sourceUrl=we),Br($r,()=>s(oe).kind,we=>s(oe).kind=we),Br(Q,()=>s(oe).status,we=>s(oe).status=we),S(fe,nt)});var B=l(rt,2),be=l(B,2),Se=l(me,2),lt=l(p(Se),6),ze=E(lt,!0);F(()=>{lt.disabled=s(U),y(ze,s(U)?"Generating…":"Generate four-format draft")}),x("click",B,He),x("click",be,Ct),x("click",lt,J),S(de,Pe)};se(xi,de=>{s(ge)?de(ne):de(Te,-1)})}F(()=>{y(Pt,s(M).title),y(Zr,s(ge)?s(ko):"No generated draft yet"),Ft.disabled=s(U),y(Ur,s(U)?"Working…":s(ge)?"Regenerate draft":"Generate draft"),ir.disabled=s(U)||!s(ge),y(en,`Export ${s(pe)==="carousel"?"ZIP":s(pe)==="reel"?"script":"PNG"} ↗`)}),x("click",Ft,J),x("click",ir,Tt),S(ft,wt)},tt=ft=>{var wt=Gm(),nr=l(p(wt),4);x("click",nr,()=>d(K,"backlog")),S(ft,wt)};se(re,ft=>{s(M)?ft(Oe):ft(tt,-1)})}S(z,ee)},zd=z=>{var ee=ib(),re=it(ee),Oe=p(re),tt=l(p(Oe)),ft=l(Oe),wt=l(p(ft)),nr=l(ft),Qr=l(p(nr)),_t=l(nr),Pt=l(p(_t)),Jt=l(_t),Zr=l(p(Jt)),Mr=l(Jt),Ft=l(p(Mr));Me(Ft,20,()=>r,ne=>ne,(ne,Te)=>{var de=Li(),Pe=E(de,!0),me={};F(()=>{y(Pe,Te),me!==(me=Te)&&(de.value=(de.__value=me)??"")}),S(ne,de)}),lr(Ft);var Ur=l(Mr),ir=l(p(Ur));Me(ir,20,()=>r,ne=>ne,(ne,Te)=>{var de=Li(),Pe=E(de,!0),me={};F(()=>{y(Pe,Te),me!==(me=Te)&&(de.value=(de.__value=me)??"")}),S(ne,de)}),lr(ir);var en=l(Ur,2);Me(en,21,()=>s(L).colors||[],ne=>ne.name,(ne,Te,de)=>{var Pe=Km(),me=p(Pe),rt=l(me),B=p(rt),be=l(B);F(()=>{y(me,`${s(Te).name??""} `),Et(B,"aria-label",`${s(Te).name??""} color`),Et(be,"aria-label",`${s(Te).name??""} hex`)}),qe(B,()=>s(Te).hex,Se=>s(Te).hex=Se),qe(be,()=>s(Te).hex,Se=>s(Te).hex=Se),S(ne,Pe)});var Fr=l(re,2);{var Mn=ne=>{var Te=tb(),de=l(p(Te),6),Pe=E(de,!0),me=l(de,2),rt=p(me),B=l(p(rt),2);Me(B,19,()=>s(L).strategy.valueGroups||[],(fe,oe)=>typeof fe=="string"?fe:fe.id||oe,(fe,oe)=>{var Ke=Ym(),nt=p(Ke),gt=E(nt,!0),rn=l(nt,2);{var $t=sr=>{var ar=Jm(),wr=it(ar),nn=E(wr,!0),sn=l(wr,2),yr=E(sn,!0);F(()=>{y(nn,s(oe).ageRange||""),y(yr,s(oe).motivation||"")}),S(sr,ar)};se(rn,sr=>{typeof s(oe)=="object"&&sr($t)})}F(()=>y(gt,typeof s(oe)=="string"?s(oe):s(oe).name)),S(fe,Ke)},fe=>{var oe=Xm();S(fe,oe)});var be=l(rt,2),Se=l(p(be),2);Me(Se,20,()=>s(L).strategy.pillars||[],fe=>fe,(fe,oe)=>{var Ke=Qm(),nt=p(Ke),gt=E(nt,!0);F(()=>y(gt,oe)),S(fe,Ke)},fe=>{var oe=Zm();S(fe,oe)});var lt=l(me,2);{var ze=fe=>{var oe=eb();S(fe,oe)};se(lt,fe=>{s(L).strategy.clinicalClaimsQuarantined&&fe(ze)})}F(()=>y(Pe,s(L).strategy.status||"Proposed positioning")),S(ne,Te)};se(Fr,ne=>{s(L).strategy&&ne(Mn)})}var tn=l(Fr,2),xi=l(p(tn),4);Me(xi,17,()=>s(X).filter(ne=>ne.category==="Source research"),ne=>ne.id,(ne,Te)=>{var de=rb(),Pe=p(de),me=p(Pe),rt=E(me,!0),B=l(me,2),be=E(B,!0),Se=l(Pe,2);F(()=>{y(rt,s(Te).title),y(be,s(Te).reviewStatus||"Unreviewed research")}),x("click",Se,()=>zs(s(Te))),S(ne,de)},ne=>{var Te=nb();S(ne,Te)}),Fi("submit",re,tr),qe(tt,()=>s(L).brandName,ne=>s(L).brandName=ne),qe(wt,()=>s(L).websiteUrl,ne=>s(L).websiteUrl=ne),qe(Qr,()=>s(L).tagline,ne=>s(L).tagline=ne),qe(Pt,()=>s(L).mission,ne=>s(L).mission=ne),qe(Zr,()=>s(L).logoText,ne=>s(L).logoText=ne),Br(Ft,()=>s(L).fonts.heading,ne=>s(L).fonts.heading=ne),Br(ir,()=>s(L).fonts.body,ne=>s(L).fonts.body=ne),S(z,ee)},Wd=z=>{var ee=ub(),re=p(ee),Oe=p(re),tt=l(p(Oe),2),ft=l(Oe,4),wt=p(ft),nr=p(wt),Qr=E(nr,!0),_t=l(wt,2),Pt=p(_t),Jt=E(Pt,!0),Zr=l(_t,2),Mr=p(Zr),Ft=E(Mr,!0),Ur=l(ft,2),ir=l(p(Ur),2),en=E(ir,!0),Fr=l(re,2),Mn=l(p(Fr),2),tn=l(Mn,2),xi=E(tn),ne=l(tn,6);Me(ne,21,()=>{var Q,q,De;return((De=(q=(Q=s(gr))==null?void 0:Q.observability)==null?void 0:q.jobs)==null?void 0:De.slice(0,10))||[]},Q=>Q.jobId,(Q,q)=>{var De=ab(),Fe=p(De),we=E(Fe,!0),Le=l(Fe),je=l(Le),ct=E(je),ht=l(je,2);{var Je=xe=>{var $e=sb(),mt=E($e,!0);F(yt=>{$e.disabled=s(U),Et($e,"aria-label",yt),y(mt,s(q).status==="FAILED"?"Retry failed batch":"Retry interrupted batch")},[()=>`${s(q).status==="FAILED"?"Retry failed batch":"Retry interrupted batch"} ${s(q).jobId.slice(0,8)}`]),x("click",$e,()=>rr(s(q).jobId)),S(xe,$e)};se(ht,xe=>{(s(q).status==="FAILED"||s(q).status==="INTERRUPTED")&&xe(Je)})}F(xe=>{var $e;y(we,s(q).status),y(Le,` · Attempt ${(s(q).attempt||1)??""} `),y(ct,`${((($e=s(q).completedStoryIds)==null?void 0:$e.length)||0)??""} completed stories
                    ${xe??""}`)},[()=>s(q).retryOfJobId?` · Retry of ${s(q).retryOfJobId.slice(0,8)}`:""]),S(Q,De)},Q=>{var q=ob();S(Q,q)});var Te=l(Fr,2),de=l(p(Te),2),Pe=p(de),me=l(p(Pe)),rt=l(de,2),B=p(rt),be=p(B),Se=l(be),lt=l(B),ze=l(p(lt)),fe=p(ze);fe.value=fe.__value="liquidity_desk";var oe=l(fe);oe.value=oe.__value="vedic_dharma",lr(ze);var Ke=l(Te,2),nt=l(p(Ke),2),gt=p(nt),rn=p(gt),$t=E(rn,!0),sr=l(gt,2),ar=p(sr),wr=E(ar,!0),nn=l(sr,2),sn=p(nn),yr=E(sn,!0),$r=l(nt,4),Ir=p($r),an=l(p(Ir));Me(an,21,()=>{var Q,q;return((q=(Q=s(gr))==null?void 0:Q.observability)==null?void 0:q.traces)||[]},Q=>Q.traceId,(Q,q)=>{var De=lb(),Fe=p(De),we=E(Fe,!0),Le=l(Fe),je=E(Le,!0),ct=l(Le),ht=E(ct,!0),Je=l(ct),xe=E(Je);F(()=>{y(we,s(q).status),y(je,s(q).provider),y(ht,s(q).model),y(xe,`${s(q).latencyMs??""} ms`)}),S(Q,De)},Q=>{var q=cb();S(Q,q)});var Ni=l($r,2),Oi=l(p(Ni),2),is=E(Oi,!0),he=l(Ke,2),ce=l(p(he),2),We=E(ce,!0);F((Q,q,De,Fe)=>{var we,Le,je,ct,ht,Je,xe,$e,mt,yt,on,Di,js,Oa;y(Qr,((we=s(ei))==null?void 0:we.status)||"Unknown"),y(Jt,((je=(Le=s(ei))==null?void 0:Le.checks)==null?void 0:je.repository)||"Unknown"),y(Ft,((ht=(ct=s(ei))==null?void 0:ct.checks)==null?void 0:ht.generationProvider)||"Not checked"),y(en,Q),Mn.disabled=s(U),Et(xi,"href",q),y(be,`New brand in ${((Je=s(Si))==null?void 0:Je.name)??""}`),y($t,((mt=($e=(xe=s(gr))==null?void 0:xe.observability)==null?void 0:$e.traces)==null?void 0:mt.length)||0),y(wr,((on=(yt=s(gr))==null?void 0:yt.observability)==null?void 0:on.usageEvents)||0),y(yr,((Oa=(js=(Di=s(gr))==null?void 0:Di.observability)==null?void 0:js.operationalEvents)==null?void 0:Oa.length)||0),y(is,De),y(We,Fe)},[()=>JSON.stringify(s(ei),null,2),()=>"/api/admin/backprop-jsonl?"+Aa(),()=>JSON.stringify(s(gr),null,2),()=>JSON.stringify(s(Ls),null,2)]),x("click",tt,Ze),x("click",Mn,()=>rr()),Fi("submit",de,xr),qe(me,()=>s(Ei),Q=>d(Ei,Q)),Fi("submit",rt,Gt),qe(Se,()=>s(Zn),Q=>d(Zn,Q)),Br(ze,()=>s(rs),Q=>d(rs,Q)),S(z,ee)};se(Pi,z=>{s(Rr)?z(xo):s(Xe)?z(Na,1):s(K)==="backlog"?z(Bd,2):s(K)==="calendar"?z(Hd,3):s(K)==="studio"?z(Vd,4):s(K)==="brand"&&s(L)?z(zd,5):s(K)==="admin"&&s(ki)&&z(Wd,6)})}F(z=>{var ee,re;D!==(D=s(b))&&(Re.value=(Re.__value=D)??"",no(Re,D)),ye!==(ye=s(I))&&(te.value=(te.__value=ye)??"",no(te,ye)),y(ri,z),y(Nn,s(g).username),y(On,s(g).role),y(Dn,`${(((ee=s(Si))==null?void 0:ee.name)||"ORGANIZATION")??""} / ${(((re=s(Us))==null?void 0:re.name)||"BRAND")??""}`),y(Ci,s(K)==="backlog"?"Good stories, next up.":s(K)==="calendar"?"Make room for the week.":s(K)==="studio"?"Campaign Studio":s(K)==="brand"?"Your brand, clearly.":"Studio operations"),y(Ln,s(K)==="studio"?"Edit the substance. Inspect the surface. Export with context.":"A focused workspace for source-backed editorial work.")},[()=>{var z;return(z=s(g).username)==null?void 0:z.slice(0,2)}]),x("click",V,z=>{z.preventDefault(),Bs("backlog")}),x("change",Re,Co),x("change",te,Ro),x("click",Dr,To),S(v,m)};se(Rn,v=>{s(G)?v(Pn):s(g)?v(br,-1):v(mr,1)})}S(t,Or),Cl()}Wu(["click","change","input"]);kh(fb,{target:document.getElementById("app")});
