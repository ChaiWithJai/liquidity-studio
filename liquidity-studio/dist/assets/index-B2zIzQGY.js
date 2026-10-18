var lf=Object.defineProperty;var cf=Object.getPrototypeOf;var uf=Reflect.get;var ac=t=>{throw TypeError(t)};var df=(t,e,r)=>e in t?lf(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var or=(t,e,r)=>df(t,typeof e!="symbol"?e+"":e,r),$o=(t,e,r)=>e.has(t)||ac("Cannot "+r);var h=(t,e,r)=>($o(t,e,"read from private field"),r?r.call(t):e.get(t)),re=(t,e,r)=>e.has(t)?ac("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),oe=(t,e,r,n)=>($o(t,e,"write to private field"),n?n.call(t,r):e.set(t,r),r),Y=(t,e,r)=>($o(t,e,"access private method"),r);var sc=(t,e,r)=>uf(cf(t),r,e);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function r(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=r(i);fetch(i.href,s)}})();const eu=!1;var mo=Array.isArray,ff=Array.prototype.indexOf,os=Array.prototype.includes,bo=Array.from,tu=Object.defineProperty,ua=Object.getOwnPropertyDescriptor,hf=Object.getOwnPropertyDescriptors,pf=Object.prototype,vf=Array.prototype,ru=Object.getPrototypeOf,oc=Object.isExtensible;const _f=()=>{};function gf(t){for(var e=0;e<t.length;e++)t[e]()}function nu(){var t,e,r=new Promise((n,i)=>{t=n,e=i});return{promise:r,resolve:t,reject:e}}function mf(t,e){if(Array.isArray(t))return t;if(!(Symbol.iterator in t))return Array.from(t);const r=[];for(const n of t)if(r.push(n),r.length===e)break;return r}const Ot=2,Sa=4,wo=8,iu=1<<24,zr=16,Jr=32,pi=64,al=128,Pl=256,Gr=512,ht=1024,nt=2048,Pr=4096,Bt=8192,kt=16384,Oa=32768,ls=1<<25,ka=65536,Zs=1<<17,au=1<<18,Da=1<<19,bf=1<<20,gn=1<<25,eo=1<<21,da=1<<22,di=1<<23,Wi=Symbol("$state"),su=Symbol("component"),wf=Symbol("legacy props"),yf=Symbol(""),Vs=Symbol("attributes"),sl=Symbol("class"),ol=Symbol("style"),Ya=Symbol("text"),zs=Symbol("form reset"),bs=new class extends Error{constructor(){super(...arguments);or(this,"name","StaleReactionError");or(this,"message","The reaction that called `getAbortSignal()` was re-run or destroyed")}};var Xc;const If=!!((Xc=globalThis.document)!=null&&Xc.contentType)&&globalThis.document.contentType.includes("xml"),Ef=1,Sf=2,ou=4,kf=8,Tf=16,Af=1,Cf=4,Rf=8,Pf=16,xf=1,Nf=2,lu={},dt=Symbol("uninitialized"),cu="http://www.w3.org/1999/xhtml",Of="http://www.w3.org/2000/svg",Df="http://www.w3.org/1998/Math/MathML";function Lf(){console.warn("https://svelte.dev/e/derived_inert")}function Mf(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function Uf(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}let uu=!1;function du(t){return t===this.v}function Ff(t,e){return t!=t?e==e:t!==e||t!==null&&typeof t=="object"||typeof t=="function"}function fu(t){return!Ff(t,this.v)}function $f(t){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function Bf(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function Hf(t,e,r){throw new Error("https://svelte.dev/e/each_key_duplicate")}function Vf(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function zf(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function jf(t){throw new Error("https://svelte.dev/e/effect_orphan")}function Wf(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function qf(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function Gf(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function Kf(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function Jf(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function Yf(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}let Xf=!1,Nt=null;function Ta(t){Nt=t}function yo(t,e=!1,r){Nt={p:Nt,i:!1,c:null,e:null,s:t,x:null,r:we,l:null}}function Io(t){var e=Nt,r=e.e;if(r!==null){e.e=null;for(var n of r)Lu(n)}return e.i=!0,Nt=e.p,xl(t)}function xl(t={}){return tu(t,su,{value:!0}),t}function hu(){return!0}let Mi=[];function pu(){var t=Mi;Mi=[],gf(t)}function Vn(t){if(Mi.length===0&&!ns){var e=Mi;queueMicrotask(()=>{e===Mi&&pu()})}Mi.push(t)}function Qf(){for(;Mi.length>0;)pu()}const Zf=-7169;function et(t,e){t.f=t.f&Zf|e}function Nl(t){(t.f&Gr)!==0||t.deps===null?et(t,ht):et(t,Pr)}function vu(t,e,r){(t.f&nt)!==0?e.add(t):(t.f&Pr)!==0&&r.add(t),et(t,ht)}let lc=!1;function eh(){lc||(lc=!0,document.addEventListener("reset",t=>{Promise.resolve().then(()=>{var e;if(!t.defaultPrevented)for(const r of t.target.elements)(e=r[zs])==null||e.call(r)})},{capture:!0}))}function La(t){var e=he,r=we;xr(null),In(null);try{return t()}finally{xr(e),In(r)}}function Ol(t,e,r,n=r){t.addEventListener(e,()=>La(r));const i=t[zs];i?t[zs]=()=>{i(),n(!0)}:t[zs]=()=>n(!0),eh()}function th(t,e,r,n){const i=cs;var s=t.filter(w=>!w.settled),o=e.map(i);if(r.length===0&&s.length===0){n(o);return}var c=we,u=rh(),f=s.length===1?s[0].promise:s.length>1?Promise.all(s.map(w=>w.promise)):null;function v(w){if((c.f&kt)===0){u();try{n([...o,...w])}catch(I){vn(I,c)}to()}}var _=_u();if(r.length===0){f.then(()=>v([])).finally(_);return}function b(){Promise.all(r.map(w=>nh(w))).then(v).catch(w=>vn(w,c)).finally(_)}f?f.then(()=>{if((c.f&kt)!==0){_();return}u(),b(),to()}):b()}function rh(){var t=we,e=he,r=Nt,n=K;return function(s=!0){In(t),xr(e),Ta(r),s&&(t.f&kt)===0&&(n==null||n.activate(),n==null||n.apply())}}function to(t=!0){In(null),xr(null),Ta(null),t&&(K==null||K.deactivate())}function _u(){var t=we,e=t.b,r=K,n=!!(e!=null&&e.is_rendered());return e==null||e.update_pending_count(1,r),r.increment(n,t),()=>{e==null||e.update_pending_count(-1,r),r.decrement(n,t)}}function cs(t){var e=Ot|nt;return we!==null&&(we.f|=Da),{ctx:Nt,deps:null,effects:null,equals:du,f:e,fn:t,reactions:null,rv:0,v:dt,wv:0,parent:we,ac:null}}const Xa=Symbol("obsolete");function nh(t,e,r){let n=we;n===null&&Bf();var i=void 0,s=vi(dt),o=!he,c=new Set;return mh(()=>{var w,I;var u=we,f=nu();i=f.promise;try{Promise.resolve(t()).then(f.resolve,P=>{P!==bs&&f.reject(P)}).finally(to)}catch(P){f.reject(P),to()}var v=K;if(o){if((u.f&Oa)!==0)var _=_u();if((w=n.b)!=null&&w.is_rendered())(I=v.async_deriveds.get(u))==null||I.reject(Xa);else for(const P of c.values())P.reject(Xa);c.add(f),v.async_deriveds.set(u,f)}const b=(P,T=void 0)=>{_==null||_(),c.delete(f),T!==Xa&&(v.activate(),T?(s.f|=di,Aa(s,T)):((s.f&di)!==0&&(s.f^=di),Aa(s,P)),v.deactivate())};f.promise.then(b,P=>b(null,P||"unknown"))}),Fl(()=>{for(const u of c)u.reject(Xa)}),new Promise(u=>{function f(v){function _(){v===i?u(s):f(i)}v.then(_,_)}f(i)})}function _t(t){const e=cs(t);return Hu(e),e}function gu(t){const e=cs(t);return e.equals=fu,e}function ih(t){var e=t.effects;if(e!==null){t.effects=null;for(var r=0;r<e.length;r+=1)Zt(e[r])}}function Dl(t){var e,r=we,n=t.parent;if(!Kn&&n!==null&&t.v!==dt&&(n.f&(kt|Bt))!==0)return Lf(),t.v;In(n);try{ih(t),e=Wu(t)}finally{In(r)}return e}function mu(t){var e=Dl(t);if(!t.equals(e)&&(t.wv=zu(),(!(K!=null&&K.is_fork)||t.deps===null)&&(K!==null?(K.capture(t,e,!0),fi==null||fi.capture(t,e,!0)):t.v=e,t.deps===null))){et(t,ht);return}Kn||(St!==null?(Ul()||K!=null&&K.is_fork)&&St.set(t,e):Nl(t))}function ah(t){var e;if(t.effects!==null)for(const r of t.effects)(r.teardown||r.ac)&&((e=r.teardown)==null||e.call(r),r.ac!==null&&La(()=>{r.ac.abort(bs),r.ac=null}),r.fn!==null&&(r.teardown=_f),us(r,0),Bl(r))}function bu(t){if(t.effects!==null)for(const e of t.effects)e.teardown&&e.fn!==null&&Ca(e)}let Bo=null,la=null,K=null,fi=null,St=null,ll=null,ns=!1,Ho=!1,is=null,js=null;var cc=0;let sh=1;var ga,ci,Bi,ma,ba,wa,Un,ya,ur,ps,Fn,Hr,cn,Ia,Hi,Ee,cl,ul,Qa,dl,wu,yu,ca,oh,Za;const po=class po{constructor(){re(this,Ee);or(this,"id",sh++);re(this,ga,!1);or(this,"linked",!0);re(this,ci,null);re(this,Bi,null);or(this,"async_deriveds",new Map);or(this,"current",new Map);or(this,"previous",new Map);re(this,ma,new Set);re(this,ba,new Set);re(this,wa,0);re(this,Un,new Map);re(this,ya,null);re(this,ur,[]);re(this,ps,[]);re(this,Fn,new Set);re(this,Hr,new Set);re(this,cn,new Map);re(this,Ia,new Set);or(this,"is_fork",!1);re(this,Hi,!1);la===null?Bo=la=this:(oe(la,Bi,this),oe(this,ci,la)),la=this}skip_effect(e){h(this,cn).has(e)||h(this,cn).set(e,{d:[],m:[]}),h(this,Ia).delete(e)}unskip_effect(e,r=n=>this.schedule(n)){var n=h(this,cn).get(e);if(n){h(this,cn).delete(e);for(var i of n.d)et(i,nt),r(i);for(i of n.m)et(i,Pr),r(i)}h(this,Ia).add(e)}capture(e,r,n=!1){e.v!==dt&&!this.previous.has(e)&&this.previous.set(e,e.v),(e.f&di)===0&&(this.current.set(e,[r,n]),St==null||St.set(e,r)),this.is_fork||(e.v=r)}activate(){K=this}deactivate(){K=null,St=null}flush(){try{Ho=!0,K=this,Y(this,Ee,Qa).call(this)}finally{cc=0,ll=null,is=null,js=null,Ho=!1,K=null,St=null,mn.clear()}}discard(){var e;for(const r of h(this,ba))r(this);h(this,ba).clear();for(const r of this.async_deriveds.values())r.reject(Xa);Y(this,Ee,Za).call(this),(e=h(this,ya))==null||e.resolve()}register_created_effect(e){h(this,ps).push(e)}increment(e,r){if(oe(this,wa,h(this,wa)+1),e){let n=h(this,Un).get(r)??0;h(this,Un).set(r,n+1)}}decrement(e,r){if(oe(this,wa,h(this,wa)-1),e){let n=h(this,Un).get(r)??0;n===1?h(this,Un).delete(r):h(this,Un).set(r,n-1)}h(this,Hi)||(oe(this,Hi,!0),Vn(()=>{oe(this,Hi,!1),this.linked&&this.flush()}))}transfer_effects(e,r){for(const n of e)h(this,Fn).add(n);for(const n of r)h(this,Hr).add(n);e.clear(),r.clear()}oncommit(e){h(this,ma).add(e)}ondiscard(e){h(this,ba).add(e)}settled(){return(h(this,ya)??oe(this,ya,nu())).promise}static ensure(){if(K===null){const e=K=new po;!Ho&&!ns&&Vn(()=>{h(e,ga)||e.flush()})}return K}apply(){{St=null;return}}schedule(e){var r;if(ll=e,(r=e.b)!=null&&r.is_pending&&(e.f&(Sa|wo|iu))!==0&&(e.f&Oa)===0){e.b.defer_effect(e);return}h(this,ur).push(e)}};ga=new WeakMap,ci=new WeakMap,Bi=new WeakMap,ma=new WeakMap,ba=new WeakMap,wa=new WeakMap,Un=new WeakMap,ya=new WeakMap,ur=new WeakMap,ps=new WeakMap,Fn=new WeakMap,Hr=new WeakMap,cn=new WeakMap,Ia=new WeakMap,Hi=new WeakMap,Ee=new WeakSet,cl=function(){if(this.is_fork)return!0;for(const n of h(this,Un).keys()){for(var e=n,r=!1;e.parent!==null;){if(h(this,cn).has(e)){r=!0;break}e=e.parent}if(!r)return!0}return!1},ul=function(){var e=[];for(const s of h(this,ur))if(!((s.f&kt)!==0||(s.f&(nt|Pr))===0)){for(var r=s,n=!1;r.parent!==null;){r=r.parent;var i=r.f;if((i&(pi|Jr))!==0){if((i&ht)===0){n=!0;break}r.f^=ht}}n||e.push(r)}return oe(this,ur,[]),e},Qa=function(){var c,u,f,v;oe(this,ga,!0);for(const _ of h(this,Fn))h(this,Hr).delete(_),et(_,nt),this.schedule(_);for(const _ of h(this,Hr))et(_,Pr),this.schedule(_);this.apply();for(var e=is=[],r=[],n=js=[];h(this,ur).length>0;){cc++>1e3&&(Y(this,Ee,Za).call(this),ch());for(const _ of Y(this,Ee,ul).call(this))try{Y(this,Ee,dl).call(this,_,e,r)}catch(b){throw Su(_),Y(this,Ee,cl).call(this)||this.discard(),b}}if(K=null,n.length>0){var i=po.ensure();for(const _ of n)i.schedule(_)}if(is=null,js=null,Y(this,Ee,cl).call(this)){Y(this,Ee,ca).call(this,r),Y(this,Ee,ca).call(this,e);for(const[_,b]of h(this,cn))Eu(_,b);n.length>0&&Y(c=K,Ee,Qa).call(c);return}const s=Y(this,Ee,wu).call(this);if(s){Y(this,Ee,ca).call(this,r),Y(this,Ee,ca).call(this,e),Y(u=s,Ee,yu).call(u,this);return}h(this,Fn).clear(),h(this,Hr).clear();for(const _ of h(this,ma))_(this);h(this,ma).clear(),fi=this,uc(r),uc(e),fi=null,(f=h(this,ya))==null||f.resolve();var o=K;if(h(this,wa)===0&&(h(this,ur).length===0||o!==null)&&Y(this,Ee,Za).call(this),h(this,ur).length>0)if(o!==null){for(const _ of h(this,ur))h(o,ur).push(_);oe(this,ur,[])}else o=this;o!==null&&(mn.clear(),Y(v=o,Ee,Qa).call(v))},dl=function(e,r,n){e.f^=ht;for(var i=e.first;i!==null;){var s=i.f,o=(s&(Jr|pi))!==0,c=o&&(s&ht)!==0,u=c||(s&Bt)!==0||h(this,cn).has(i);if(!u&&i.fn!==null){o?i.f^=ht:(s&Sa)!==0?r.push(i):Is(i)&&((s&zr)!==0&&h(this,Hr).add(i),Ca(i));var f=i.first;if(f!==null){i=f;continue}}for(;i!==null;){var v=i.next;if(v!==null){i=v;break}i=i.parent}}},wu=function(){for(var e=h(this,ci);e!==null;){if(!e.is_fork){for(const[r,[,n]]of this.current)if(e.current.has(r)&&!n)return e}e=h(e,ci)}return null},yu=function(e){var n;for(const[i,s]of e.current)!this.previous.has(i)&&e.previous.has(i)&&this.previous.set(i,e.previous.get(i)),this.current.set(i,s);for(const[i,s]of e.async_deriveds){const o=this.async_deriveds.get(i);o&&s.promise.then(o.resolve).catch(o.reject)}e.async_deriveds.clear(),this.transfer_effects(h(e,Fn),h(e,Hr));const r=i=>{var s=i.reactions;if(s!==null&&!((i.f&Ot)!==0&&(i.f&(nt|Pr))===0))for(const u of s){var o=u.f;if((o&Ot)!==0)r(u);else{var c=u;o&(da|zr)&&!this.async_deriveds.has(c)&&(h(this,Hr).delete(c),et(c,nt),this.schedule(c))}}};for(const i of this.current.keys())r(i);this.oncommit(()=>e.discard()),Y(n=e,Ee,Za).call(n),K=this,Y(this,Ee,Qa).call(this)},ca=function(e){for(var r=0;r<e.length;r+=1)vu(e[r],h(this,Fn),h(this,Hr))},oh=function(){var _,b;for(let w=Bo;w!==null;w=h(w,Bi)){var e=w.id<this.id,r=[];for(const[I,[P,T]]of this.current){if(w.current.has(I)){var n=w.current.get(I)[0];if(e&&P!==n)w.current.set(I,[P,T]);else continue}r.push(I)}if(e)for(const[I,P]of this.async_deriveds){const T=w.async_deriveds.get(I);T&&P.promise.then(T.resolve).catch(T.reject)}var i=[...w.current.keys()].filter(I=>!w.current.get(I)[1]);if(!(!h(w,ga)||i.length===0)){var s=i.filter(I=>!this.current.has(I));if(s.length===0)e&&w.discard();else if(r.length>0){if(e)for(const I of h(this,Ia))w.unskip_effect(I,P=>{var T;(P.f&(zr|da))!==0?w.schedule(P):Y(T=w,Ee,ca).call(T,[P])});w.activate();var o=new Set,c=new Map;for(var u of r)Iu(u,s,o,c);c=new Map;var f=[...w.current].filter(([I,P])=>{const T=this.current.get(I);return T?T[0]!==P[0]||T[1]!==P[1]:!0}).map(([I])=>I);if(f.length>0)for(const I of h(this,ps))(I.f&(kt|Bt|Zs))===0&&Ll(I,f,c)&&((I.f&(da|zr))!==0?(et(I,nt),w.schedule(I)):h(w,Fn).add(I));if(h(w,ur).length>0&&!h(w,Hi)){w.apply();for(var v of Y(_=w,Ee,ul).call(_))Y(b=w,Ee,dl).call(b,v,[],[])}w.deactivate()}}}},Za=function(){if(this.linked){var e=h(this,ci),r=h(this,Bi);e===null?Bo=r:oe(e,Bi,r),r===null?la=e:oe(r,ci,e),this.linked=!1}};let Ji=po;function lh(t){var e=ns,r=fi;fi=null,ns=!0;try{for(var n;;){if(Qf(),K===null)return n;K.flush()}}finally{ns=e,fi=r}}function ch(){try{Wf()}catch(t){vn(t,ll)}}let Br=null;function uc(t){var e=t.length;if(e!==0){for(var r=0;r<e;){var n=t[r++];if((n.f&(kt|Bt))===0&&Is(n)&&(Br=new Set,Ca(n),n.deps===null&&n.first===null&&n.nodes===null&&n.teardown===null&&n.ac===null&&Fu(n),(Br==null?void 0:Br.size)>0)){mn.clear();for(const i of Br){if((i.f&(kt|Bt))!==0)continue;const s=[i];let o=i.parent;for(;o!==null;)Br.has(o)&&(Br.delete(o),s.push(o)),o=o.parent;for(let c=s.length-1;c>=0;c--){const u=s[c];(u.f&(kt|Bt))===0&&Ca(u)}}Br.clear()}}Br=null}}function Iu(t,e,r,n){if(!r.has(t)&&(r.add(t),t.reactions!==null))for(const i of t.reactions){const s=i.f;(s&Ot)!==0?Iu(i,e,r,n):(s&(da|zr))!==0&&(s&nt)===0&&Ll(i,e,n)&&(et(i,nt),Ml(i))}}function Ll(t,e,r){const n=r.get(t);if(n!==void 0)return n;if(t.deps!==null)for(const i of t.deps){if(os.call(e,i))return!0;if((i.f&Ot)!==0&&Ll(i,e,r))return r.set(i,!0),!0}return r.set(t,!1),!1}function Ml(t){K.schedule(t)}function Eu(t,e){if(!((t.f&Jr)!==0&&(t.f&ht)!==0)){(t.f&nt)!==0?e.d.push(t):(t.f&Pr)!==0&&e.m.push(t),et(t,ht);for(var r=t.first;r!==null;)Eu(r,e),r=r.next}}function Su(t){et(t,ht);for(var e=t.first;e!==null;)Su(e),e=e.next}let ro=new Set;const mn=new Map;let ku=!1;function vi(t,e){var r={f:0,v:t,reactions:null,equals:du,rv:0,wv:0};return r}function O(t,e){const r=vi(t);return Hu(r),r}function uh(t,e=!1,r=!0){const n=vi(t);return e||(n.equals=fu),n}function d(t,e,r=!1){he!==null&&(!jr||(he.f&Zs)!==0)&&hu()&&(he.f&(Ot|zr|da|Zs))!==0&&(wn===null||!wn.has(t))&&Jf();let n=r?_r(e):e;return Aa(t,n,js)}var Di=null,fl=0;function Aa(t,e,r=null){if(!t.equals(e)){Kn?mn.set(t,e):mn.has(t)||mn.set(t,t.v);var n=Ji.ensure();if(n.capture(t,e),(t.f&Ot)!==0){const i=t;(t.f&nt)!==0&&Dl(i),St===null&&Nl(i)}t.wv=zu(),Di=null,fl=0,Tu(t,nt,r),Di=null,we!==null&&(we.f&ht)!==0&&(we.f&(Jr|pi))===0&&(Ar===null?wh([t]):Ar.push(t)),!n.is_fork&&ro.size>0&&!ku&&dh()}return e}function dh(){ku=!1;for(const t of ro){(t.f&ht)!==0&&et(t,Pr);let e;try{e=Is(t)}catch{e=!0}e&&Ca(t)}ro.clear()}function pn(t){d(t,t.v+1)}function Tu(t,e,r){var n=t.reactions;if(n!==null){var i=n.length;if(fl+=i,fl>1e5&&Di===null&&(Di=new Set),Di!==null){if(Di.has(t))return;Di.add(t)}for(var s=0;s<i;s++){var o=n[s],c=o.f,u=(c&nt)===0;if(u&&et(o,e),(c&Zs)!==0)ro.add(o);else if((c&Ot)!==0){var f=o;St==null||St.delete(f),Tu(f,Pr,r)}else if(u){var v=o;(c&zr)!==0&&Br!==null&&Br.add(v),r!==null?r.push(v):Ml(v)}}}}function _r(t){if(typeof t!="object"||t===null||Wi in t||su in t)return t;const e=ru(t);if(e!==pf&&e!==vf)return t;var r=new Map,n=mo(t),i=O(0),s=Gn,o=c=>{if(Gn===s)return c();var u=he,f=Gn;xr(null),hc(s);var v=c();return xr(u),hc(f),v};return n&&r.set("length",O(t.length)),new Proxy(t,{defineProperty(c,u,f){(!("value"in f)||f.configurable===!1||f.enumerable===!1||f.writable===!1)&&Gf();var v=r.get(u);return v===void 0?o(()=>{var _=O(f.value);return r.set(u,_),_}):d(v,f.value,!0),!0},deleteProperty(c,u){var f=r.get(u);if(f===void 0){if(u in c){const v=o(()=>O(dt));r.set(u,v),pn(i)}}else d(f,dt),pn(i);return!0},get(c,u,f){var w;if(u===Wi)return t;var v=r.get(u),_=u in c;if(v===void 0&&(!_||(w=ua(c,u))!=null&&w.writable)&&(v=o(()=>{var I=_r(_?c[u]:dt),P=O(I);return P}),r.set(u,v)),v!==void 0){var b=a(v);return b===dt?void 0:b}return Reflect.get(c,u,f)},getOwnPropertyDescriptor(c,u){var b;(b=this.has)==null||b.call(this,c,u);var f=Reflect.getOwnPropertyDescriptor(c,u),v=r.get(u);if(v!==void 0){var _=a(v);if(_===dt)return;if(f&&"value"in f)f.value=_;else return{enumerable:!0,configurable:!0,value:_,writable:!0}}return f},has(c,u){var b;if(u===Wi)return!0;var f=r.get(u),v=f!==void 0&&f.v!==dt||Reflect.has(c,u);if(f!==void 0||we!==null&&(!v||(b=ua(c,u))!=null&&b.writable)){f===void 0&&(f=o(()=>{var w=v?_r(c[u]):dt,I=O(w);return I}),r.set(u,f));var _=a(f);if(_===dt)return!1}return v},set(c,u,f,v){var U;var _=r.get(u),b=u in c;if(n&&u==="length")for(var w=f;w<_.v;w+=1){var I=r.get(w+"");I!==void 0?d(I,dt):w in c&&(I=o(()=>O(dt)),r.set(w+"",I))}if(_===void 0)(!b||(U=ua(c,u))!=null&&U.writable)&&(_=o(()=>O(void 0)),d(_,_r(f)),r.set(u,_));else{b=_.v!==dt;var P=o(()=>_r(f));d(_,P)}var T=Reflect.getOwnPropertyDescriptor(c,u);if(T!=null&&T.set&&T.set.call(v,f),!b){if(n&&typeof u=="string"){var x=r.get("length"),W=Number(u);Number.isInteger(W)&&W>=x.v&&d(x,W+1)}pn(i)}return!0},ownKeys(c){a(i);var u=Reflect.ownKeys(c).filter(_=>{var b=r.get(_);return b===void 0||b.v!==dt});for(var[f,v]of r)v.v!==dt&&!(f in c)&&u.push(f);return u},setPrototypeOf(){Kf()}})}function dc(t){try{if(t!==null&&typeof t=="object"&&Wi in t)return t[Wi]}catch{}return t}function Au(t,e){return Object.is(dc(t),dc(e))}var hl,Cu,Ru,Pu,xu;function fh(){if(hl===void 0){hl=window,Cu=document,Ru=/Firefox/.test(navigator.userAgent);var t=Element.prototype,e=Node.prototype,r=Text.prototype;Pu=ua(e,"firstChild").get,xu=ua(e,"nextSibling").get,oc(t)&&(t[sl]=void 0,t[Vs]=null,t[ol]=void 0,t.__e=void 0),oc(r)&&(r[Ya]=void 0)}}function bn(t=""){return document.createTextNode(t)}function zn(t){return Pu.call(t)}function ws(t){return xu.call(t)}function p(t,e){return zn(t)}function Ze(t,e=!1){{var r=zn(t);return r instanceof Comment&&r.data===""?ws(r):r}}function E(t,e=!1){return zn(t)}function l(t,e=1,r=!1){let n=t;for(;e--;)n=ws(n);return n}function hh(t){t.textContent=""}function Nu(){return!1}function Ou(t,e,r){return e==null||e===cu?r?document.createElement(t,{is:r}):document.createElement(t):r?document.createElementNS(e,t,{is:r}):document.createElementNS(e,t)}function ph(t){var e=we;if(e===null)return he.f|=di,t;if((e.f&Oa)===0&&(e.f&Sa)===0)throw t;vn(t,e)}function vn(t,e){if(t===lu)throw t;if(!(e!==null&&(e.f&kt)!==0)){for(;e!==null;){if((e.f&al)!==0&&(e.f&(kt|ls))===0){if((e.f&Oa)===0)throw t;try{e.b.error(t);return}catch(r){t=r}}e=e.parent}throw t}}function vh(t){we===null&&(he===null&&jf(),zf()),Kn&&Vf()}function _h(t,e){var r=e.last;r===null?e.last=e.first=t:(r.next=t,t.prev=r,e.last=t)}function Xn(t,e){var r=we;r!==null&&(r.f&Bt)!==0&&(t|=Bt);var n={ctx:Nt,deps:null,nodes:null,f:t|nt|Gr,first:null,fn:e,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,wv:0,ac:null};K==null||K.register_created_effect(n);var i=n;if((t&Sa)!==0)is!==null?is.push(n):Ji.ensure().schedule(n);else if(e!==null){try{Ca(n)}catch(o){throw Zt(n),o}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&Da)===0&&(i=i.first,(t&zr)!==0&&(t&ka)!==0&&i!==null&&(i.f|=ka))}if(i!==null&&(i.parent=r,r!==null&&_h(i,r),he!==null&&(he.f&Ot)!==0&&(t&pi)===0)){var s=he;(s.effects??(s.effects=[])).push(i)}return n}function Ul(){return he!==null&&!jr}function Fl(t){const e=Xn(wo,null);return et(e,ht),e.teardown=t,e}function Du(t){vh();var e=we.f,r=!he&&(e&Jr)!==0&&Nt!==null&&!Nt.i;if(r){var n=Nt;(n.e??(n.e=[])).push(t)}else return Lu(t)}function Lu(t){return Xn(Sa|bf,t)}function gh(t){Ji.ensure();const e=Xn(pi|Da,t);return(r={})=>new Promise(n=>{r.outro?qi(e,()=>{Zt(e),n(void 0)}):(Zt(e),n(void 0))})}function $l(t){return Xn(Sa,t)}function mh(t){return Xn(da|Da,t)}function Eo(t,e=0){return Xn(wo|e,t)}function B(t,e=[],r=[],n=[]){th(n,e,r,i=>{Xn(wo,()=>{t(...i.map(a))})})}function ys(t,e=0){var r=Xn(zr|e,t);return r}function vr(t){return Xn(Jr|Da,t)}function Mu(t){var e=t.teardown;if(e!==null){const r=Kn,n=he;fc(!0),xr(null);try{e.call(null)}catch(i){vn(i,t.parent)}finally{fc(r),xr(n)}}}function Bl(t,e=!1){var r=t.first;for(t.first=t.last=null;r!==null;){const i=r.ac;i!==null&&La(()=>{i.abort(bs)});var n=r.next;(r.f&pi)!==0?r.parent=null:Zt(r,e),r=n}}function bh(t){for(var e=t.first;e!==null;){var r=e.next;(e.f&Jr)===0&&Zt(e),e=r}}function Zt(t,e=!0){var r=!1;(e||(t.f&au)!==0)&&t.nodes!==null&&t.nodes.end!==null&&(Uu(t.nodes.start,t.nodes.end),r=!0),t.f|=ls,Bl(t,e&&!r),us(t,0);var n=t.nodes&&t.nodes.t;if(n!==null)for(const s of n)s.stop();Mu(t),t.f^=ls,t.f|=kt;var i=t.parent;i!==null&&i.first!==null&&Fu(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes=t.ac=t.b=null}function Uu(t,e){for(;t!==null;){var r=t===e?null:ws(t);t.remove(),t=r}}function Fu(t){var e=t.parent,r=t.prev,n=t.next;r!==null&&(r.next=n),n!==null&&(n.prev=r),e!==null&&(e.first===t&&(e.first=n),e.last===t&&(e.last=r))}function qi(t,e,r=!0){var n=[];t.f|=Pl,$u(t,n,!0);var i=()=>{r&&Zt(t),e&&e()},s=n.length;if(s>0){var o=()=>--s||i();for(var c of n)c.out(o)}else i()}function $u(t,e,r){if((t.f&Bt)===0){t.f^=Bt;var n=t.nodes&&t.nodes.t;if(n!==null)for(const c of n)(c.is_global||r)&&e.push(c);for(var i=t.first;i!==null;){var s=i.next;if((i.f&pi)===0){var o=(i.f&ka)!==0||(i.f&Jr)!==0&&(t.f&zr)!==0;$u(i,e,o?r:!1)}i=s}}}function no(t){t.f&=~Pl,Bu(t,!0)}function Bu(t,e){if((t.f&Pl)===0&&(t.f&Bt)!==0){t.f^=Bt,(t.f&ht)===0&&(et(t,nt),Ji.ensure().schedule(t));for(var r=t.first;r!==null;){var n=r.next,i=(r.f&ka)!==0||(r.f&Jr)!==0;Bu(r,i?e:!1),r=n}var s=t.nodes&&t.nodes.t;if(s!==null)for(const o of s)(o.is_global||e)&&o.in()}}function Hl(t,e){if(t.nodes)for(var r=t.nodes.start,n=t.nodes.end;r!==null;){var i=r===n?null:ws(r);e.append(r),r=i}}let Kn=!1;function fc(t){Kn=t}let he=null,jr=!1;function xr(t){he=t}let we=null;function In(t){we=t}let wn=null;function Hu(t){he!==null&&((he.f&eo)!==0||(he.f&Ot)!==0)&&(wn??(wn=new Set)).add(t)}let Qt=null,pr=0,Ar=null;function wh(t){Ar=t}let Vu=1,Ui=0,Gn=Ui;function hc(t){Gn=t}function zu(){return++Vu}function Is(t){var e=t.f;if((e&nt)!==0)return!0;if((e&Pr)!==0){for(var r=t.deps,n=r.length,i=0;i<n;i++){var s=r[i];if(Is(s)&&mu(s),s.wv>t.wv)return!0}(e&Gr)!==0&&St===null&&et(t,ht)}return!1}function ju(t,e,r=!0){var n=t.reactions;if(n!==null&&!(wn!==null&&wn.has(t)))for(var i=0;i<n.length;i++){var s=n[i];(s.f&Ot)!==0?ju(s,e,!1):e===s&&(r?et(s,nt):(s.f&ht)!==0&&et(s,Pr),Ml(s))}}function Wu(t){var e=Qt,r=pr,n=Ar,i=he,s=wn,o=Nt,c=jr,u=Gn,f=t.f;Qt=null,pr=0,Ar=null,he=(f&(Jr|pi))===0?t:null,wn=null,Ta(t.ctx),jr=!1,Gn=++Ui,t.ac!==null&&(La(()=>{t.ac.abort(bs)}),t.ac=null);try{t.f|=eo;var v=t.fn,_=v();t.f|=Oa;var b=pc(t);if(hu()&&Ar!==null&&!jr&&b!==null&&(t.f&(Ot|Pr|nt))===0)for(var w=0;w<Ar.length;w++)ju(Ar[w],t);if(i!==null&&i!==t){if(Ui++,i.deps!==null)for(let I=0;I<r;I+=1)i.deps[I].rv=Ui;if(e!==null)for(const I of e)I.rv=Ui;Ar!==null&&(n===null?n=Ar:n.push(...Ar))}return(t.f&di)!==0&&(t.f^=di),_}catch(I){return pc(t),ph(I)}finally{t.f^=eo,Qt=e,pr=r,Ar=n,he=i,wn=s,Ta(o),jr=c,Gn=u}}function pc(t){var i;var e=t.deps,r=K==null?void 0:K.is_fork;if(Qt!==null){var n;if(r||us(t,pr),e!==null&&pr>0)for(e.length=pr+Qt.length,n=0;n<Qt.length;n++)e[pr+n]=Qt[n];else t.deps=e=Qt;if(Ul()&&(t.f&Gr)!==0)for(n=pr;n<e.length;n++)((i=e[n]).reactions??(i.reactions=[])).push(t)}else!r&&e!==null&&pr<e.length&&(us(t,pr),e.length=pr);return e}function yh(t,e){let r=e.reactions;if(r!==null){var n=ff.call(r,t);if(n!==-1){var i=r.length-1;i===0?r=e.reactions=null:(r[n]=r[i],r.pop())}}if(r===null&&(e.f&Ot)!==0&&(Qt===null||!os.call(Qt,e))){var s=e;(s.f&Gr)!==0&&(s.f^=Gr),s.v!==dt&&Nl(s),s.ac!==null&&La(()=>{s.ac.abort(bs),s.ac=null,et(s,nt)}),ah(s),us(s,0)}}function us(t,e){var r=t.deps;if(r!==null)for(var n=e;n<r.length;n++)yh(t,r[n])}function Ca(t){var e=t.f;if((e&kt)===0){et(t,ht);var r=we;we=t;try{(e&(zr|iu))!==0?bh(t):Bl(t),Mu(t);var n=Wu(t);t.teardown=typeof n=="function"?n:null,t.wv=Vu;var i;eu&&Xf&&(t.f&nt)!==0&&t.deps}finally{we=r}}}async function as(){await Promise.resolve(),lh()}function a(t){var e=t.f,r=(e&Ot)!==0;if(he!==null&&!jr){var n=we!==null&&(we.f&kt)!==0;if(!n&&(wn===null||!wn.has(t))){var i=he.deps;if((he.f&eo)!==0)t.rv<Ui&&(t.rv=Ui,Qt===null&&i!==null&&i[pr]===t?pr++:Qt===null?Qt=[t]:Qt.push(t));else{he.deps??(he.deps=[]),os.call(he.deps,t)||he.deps.push(t);var s=t.reactions;s===null?t.reactions=[he]:os.call(s,he)||s.push(he)}}}if(Kn&&mn.has(t))return mn.get(t);if(r){var o=t;if(Kn){var c=o.v;return((o.f&ht)===0&&o.reactions!==null||Gu(o))&&(c=Dl(o)),mn.set(o,c),c}var u=(o.f&Gr)===0&&!jr&&he!==null&&(he.f&Gr)!==0,f=(o.f&Oa)===0;Is(o)&&(u&&(o.f|=Gr),mu(o)),u&&!f&&(bu(o),qu(o))}if(St!=null&&St.has(t))return St.get(t);if((t.f&di)!==0)throw t.v;return t.v}function qu(t){if(t.f|=Gr,t.deps!==null)for(const r of t.deps){var e=r.reactions;e===null?r.reactions=[t]:os.call(e,t)||e.push(t),(r.f&Ot)!==0&&(r.f&Gr)===0&&(bu(r),qu(r))}}function Gu(t){if(t.v===dt)return!0;if(t.deps===null)return!1;for(const e of t.deps)if(mn.has(e)||(e.f&Ot)!==0&&Gu(e))return!0;return!1}function Ma(t){var e=jr;try{return jr=!0,t()}finally{jr=e}}const Ih=["touchstart","touchmove"];function Eh(t){return Ih.includes(t)}const Fi=Symbol("events"),Ku=new Set,pl=new Set;function Sh(t,e,r,n={}){function i(s){if(n.capture||vl.call(e,s),!s.cancelBubble)return La(()=>r==null?void 0:r.call(this,s))}return t.startsWith("pointer")||t.startsWith("touch")||t==="wheel"?(i.__removed=!1,Vn(()=>{i.__removed||e.addEventListener(t,i,n)})):e.addEventListener(t,i,n),i}function Li(t,e,r,n,i){var s={capture:n,passive:i},o=Sh(t,e,r,s);(e===document.body||e===window||e===document||e instanceof HTMLMediaElement)&&Fl(()=>{o.__removed=!0,e.removeEventListener(t,o,s)})}function N(t,e,r){(e[Fi]??(e[Fi]={}))[t]=r}function Vl(t){for(var e=0;e<t.length;e++)Ku.add(t[e]);for(var r of pl)r(t)}let Vo=null,zo=!1;function vl(t){var P,T;var e=this,r=e.ownerDocument,n=t.type,i=((P=t.composedPath)==null?void 0:P.call(t))||[],s=i[0]||t.target;Vo=t,zo||(zo=!0,setTimeout(()=>{zo=!1,Vo=null}));var o=0,c=Vo===t&&t[Fi];if(c){var u=i.indexOf(c);if(u!==-1&&(e===document||e===window)){t[Fi]=e;return}var f=i.indexOf(e);if(f===-1)return;u<=f&&(o=u)}if(s=i[o]||t.target,s!==e){tu(t,"currentTarget",{configurable:!0,get(){return s||r}});var v=he,_=we;xr(null),In(null);try{for(var b,w=[];s!==null&&s!==e;){try{var I=(T=s[Fi])==null?void 0:T[n];I!=null&&(!s.disabled||t.target===s)&&I.call(s,t)}catch(x){b?w.push(x):b=x}if(t.cancelBubble)break;o++,s=o<i.length?i[o]:null}if(b){for(let x of w)queueMicrotask(()=>{throw x});throw b}}finally{t[Fi]=e,delete t.currentTarget,xr(v),In(_)}}}var Qc;const jo=((Qc=globalThis==null?void 0:globalThis.window)==null?void 0:Qc.trustedTypes)&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:t=>t});function kh(t){return(jo==null?void 0:jo.createHTML(t))??t}function Th(t){var e=Ou("template");return e.innerHTML=kh(t.replaceAll("<!>","<!---->")),e.content}function Ra(t,e){var r=we;r.nodes===null&&(r.nodes={start:t,end:e,a:null,t:null})}function R(t,e){var r=(e&xf)!==0,n=(e&Nf)!==0,i,s=!t.startsWith("<!>");return()=>{i===void 0&&(i=Th(s?t:"<!>"+t),r||(i=zn(i)));var o=n||Ru?document.importNode(i,!0):i.cloneNode(!0);if(r){var c=zn(o),u=o.lastChild;Ra(c,u)}else Ra(o,o);return o}}function Ah(t=""){{var e=bn(t+"");return Ra(e,e),e}}function Us(){var t=document.createDocumentFragment(),e=document.createComment(""),r=bn();return t.append(e,r),Ra(e,r),t}function k(t,e){t!==null&&t.before(e)}function Ch(t){let e=0,r=vi(0),n;return()=>{Ul()&&(a(r),Eo(()=>(e===0&&(n=Ma(()=>t(()=>pn(r)))),e+=1,()=>{Vn(()=>{e-=1,e===0&&(n==null||n(),n=void 0,pn(r))})})))}}var Rh=ka|Da;function Ph(t,e,r,n){new xh(t,e,r,n)}var Cr,Rl,Rr,Vi,xt,dr,$t,fr,un,zi,ui,Ea,vs,_s,$n,vo,be,Nh,Oh,_l,ai,Dh,gl,es,Ws,ml,bl;class xh{constructor(e,r,n,i){re(this,be);or(this,"parent");or(this,"is_pending",!1);or(this,"transform_error");re(this,Cr);re(this,Rl,null);re(this,Rr);re(this,Vi);re(this,xt);re(this,dr,null);re(this,$t,null);re(this,fr,null);re(this,un,null);re(this,zi,0);re(this,ui,0);re(this,Ea,!1);re(this,vs,new Set);re(this,_s,new Set);re(this,$n,null);re(this,vo,Ch(()=>(oe(this,$n,vi(h(this,zi))),()=>{oe(this,$n,null)})));var s;oe(this,Cr,e),oe(this,Rr,r),oe(this,Vi,o=>{var c=we;c.b=this,c.f|=al,n(o)}),this.parent=we.b,this.transform_error=i??((s=this.parent)==null?void 0:s.transform_error)??(o=>o),oe(this,xt,ys(()=>{Y(this,be,gl).call(this)},Rh))}defer_effect(e){vu(e,h(this,vs),h(this,_s))}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!h(this,Rr).pending}update_pending_count(e,r){Y(this,be,ml).call(this,e,r),oe(this,zi,h(this,zi)+e),!(!h(this,$n)||h(this,Ea))&&(oe(this,Ea,!0),Vn(()=>{oe(this,Ea,!1),h(this,$n)&&Aa(h(this,$n),h(this,zi))}))}get_effect_pending(){return h(this,vo).call(this),a(h(this,$n))}error(e){if(e===lu||!h(this,Rr).onerror&&!h(this,Rr).failed)throw e;K!=null&&K.is_fork?(h(this,dr)&&K.skip_effect(h(this,dr)),h(this,$t)&&K.skip_effect(h(this,$t)),h(this,fr)&&K.skip_effect(h(this,fr)),K.oncommit(()=>{Y(this,be,ai).call(this)||Y(this,be,bl).call(this,e)})):Y(this,be,bl).call(this,e)}}Cr=new WeakMap,Rl=new WeakMap,Rr=new WeakMap,Vi=new WeakMap,xt=new WeakMap,dr=new WeakMap,$t=new WeakMap,fr=new WeakMap,un=new WeakMap,zi=new WeakMap,ui=new WeakMap,Ea=new WeakMap,vs=new WeakMap,_s=new WeakMap,$n=new WeakMap,vo=new WeakMap,be=new WeakSet,Nh=function(){try{oe(this,dr,vr(()=>h(this,Vi).call(this,h(this,Cr))))}catch(e){this.error(e)}},Oh=function(e){const r=h(this,Rr).failed,{reset:n,invoke_onerror:i}=Y(this,be,_l).call(this,e);Vn(i),r&&oe(this,fr,vr(()=>{r(h(this,Cr),()=>e,()=>n)}))},_l=function(e){var r=!1,n=!1;const i=()=>{if(!Y(this,be,ai).call(this)){if(r){Uf();return}r=!0,n&&Yf(),h(this,fr)!==null&&qi(h(this,fr),()=>{oe(this,fr,null)}),Y(this,be,Ws).call(this,()=>{Y(this,be,gl).call(this)})}};return{reset:i,invoke_onerror:()=>{var o,c;if(!Y(this,be,ai).call(this))try{n=!0,(c=(o=h(this,Rr)).onerror)==null||c.call(o,e,i),n=!1}catch(u){vn(u,h(this,xt)&&h(this,xt).parent)}}}},ai=function(){return(h(this,xt).f&(kt|ls))!==0},Dh=function(){const e=h(this,Rr).pending;e&&(this.is_pending=!0,oe(this,$t,vr(()=>e(h(this,Cr)))),Vn(()=>{if(!Y(this,be,ai).call(this)){var r=oe(this,un,document.createDocumentFragment()),n=bn(),i=!1;if(r.append(n),oe(this,dr,Y(this,be,Ws).call(this,()=>{try{return vr(()=>h(this,Vi).call(this,n))}catch(s){try{this.error(s),i=!0}catch(o){vn(o,h(this,xt).parent)}return null}})),h(this,dr)===null){oe(this,un,null),i&&Y(this,be,es).call(this,K);return}h(this,ui)===0&&(h(this,Cr).before(r),oe(this,un,null),qi(h(this,$t),()=>{oe(this,$t,null)}),Y(this,be,es).call(this,K))}}))},gl=function(){try{if(this.is_pending=this.has_pending_snippet(),oe(this,ui,0),oe(this,zi,0),oe(this,dr,vr(()=>{h(this,Vi).call(this,h(this,Cr))})),h(this,ui)>0){var e=oe(this,un,document.createDocumentFragment());Hl(h(this,dr),e);const r=h(this,Rr).pending;oe(this,$t,vr(()=>r(h(this,Cr))))}else Y(this,be,es).call(this,K)}catch(r){this.error(r)}},es=function(e){this.is_pending=!1,e.transfer_effects(h(this,vs),h(this,_s))},Ws=function(e){var r=we,n=he,i=Nt;In(h(this,xt)),xr(h(this,xt)),Ta(h(this,xt).ctx);try{return Ji.ensure(),e()}finally{In(r),xr(n),Ta(i)}},ml=function(e,r){var n;if(!this.has_pending_snippet()){this.parent&&Y(n=this.parent,be,ml).call(n,e,r);return}oe(this,ui,h(this,ui)+e),h(this,ui)===0&&(Y(this,be,es).call(this,r),h(this,$t)&&qi(h(this,$t),()=>{oe(this,$t,null)}),h(this,un)&&(h(this,Cr).before(h(this,un)),oe(this,un,null)))},bl=function(e){h(this,dr)&&(Zt(h(this,dr)),oe(this,dr,null)),h(this,$t)&&(Zt(h(this,$t)),oe(this,$t,null)),h(this,fr)&&(Zt(h(this,fr)),oe(this,fr,null));let r=h(this,Rr).failed;const n=i=>{if(Y(this,be,ai).call(this))return;const{reset:s,invoke_onerror:o}=Y(this,be,_l).call(this,i);o(),r&&!Y(this,be,ai).call(this)&&oe(this,fr,Y(this,be,Ws).call(this,()=>{try{return vr(()=>{var c=we;c.b=this,c.f|=al,r(h(this,Cr),()=>i,()=>s)})}catch(c){return vn(c,h(this,xt).parent),null}}))};Vn(()=>{if(!Y(this,be,ai).call(this)){var i;try{i=this.transform_error(e)}catch(s){vn(s,h(this,xt)&&h(this,xt).parent);return}i!==null&&typeof i=="object"&&typeof i.then=="function"?i.then(n,s=>vn(s,h(this,xt)&&h(this,xt).parent)):n(i)}})};function y(t,e){var r=e==null?"":typeof e=="object"?`${e}`:e;r!==(t[Ya]??(t[Ya]=t.nodeValue))&&(t[Ya]=r,t.nodeValue=`${r}`)}function Lh(t,e){return Mh(t,e)}const Fs=new Map;function Mh(t,{target:e,anchor:r,props:n={},events:i,context:s,intro:o=!0,transformError:c}){fh();var u=void 0,f=gh(()=>{var v=r??e.appendChild(bn());Ph(v,{pending:()=>{}},w=>{yo({});var I=Nt;s&&(I.c=s),i&&(n.$$events=i),u=t(w,n)||xl(),Io()},c);var _=new Set,b=w=>{for(var I=0;I<w.length;I++){var P=w[I];if(!_.has(P)){_.add(P);var T=Eh(P);for(const U of[e,document]){var x=Fs.get(U);x===void 0&&(x=new Map,Fs.set(U,x));var W=x.get(P);W===void 0?(U.addEventListener(P,vl,{passive:T}),x.set(P,1)):x.set(P,W+1)}}}};return b(bo(Ku)),pl.add(b),()=>{var T;for(var w of _)for(const x of[e,document]){var I=Fs.get(x),P=I.get(w);--P==0?(x.removeEventListener(w,vl),I.delete(w),I.size===0&&Fs.delete(x)):I.set(w,P)}pl.delete(b),v!==r&&((T=v.parentNode)==null||T.removeChild(v))}});return Uh.set(u,f),u}let Uh=new WeakMap;var Vr,dn,hr,ji,gs,ms,_o;class Ju{constructor(e,r=!0){or(this,"anchor");re(this,Vr,new Map);re(this,dn,new Map);re(this,hr,new Map);re(this,ji,new Set);re(this,gs,!0);re(this,ms,e=>{if(h(this,Vr).has(e)){var r=h(this,Vr).get(e),n=h(this,dn).get(r);if(n)no(n),h(this,ji).delete(r);else{var i=h(this,hr).get(r);i&&(no(i.effect),h(this,dn).set(r,i.effect),h(this,hr).delete(r),i.fragment.lastChild.remove(),this.anchor.before(i.fragment),n=i.effect)}for(const[s,o]of h(this,Vr)){if(h(this,Vr).delete(s),s===e)break;const c=h(this,hr).get(o);c&&(Zt(c.effect),h(this,hr).delete(o))}for(const[s,o]of h(this,dn)){if(s===r||h(this,ji).has(s))continue;const c=()=>{if(Array.from(h(this,Vr).values()).includes(s)){var f=document.createDocumentFragment();Hl(o,f),f.append(bn()),h(this,hr).set(s,{effect:o,fragment:f})}else Zt(o);h(this,ji).delete(s),h(this,dn).delete(s)};h(this,gs)||!n?(h(this,ji).add(s),qi(o,c,!1)):c()}}});re(this,_o,e=>{h(this,Vr).delete(e);const r=Array.from(h(this,Vr).values());for(const[n,i]of h(this,hr))r.includes(n)||(Zt(i.effect),h(this,hr).delete(n))});this.anchor=e,oe(this,gs,r)}ensure(e,r){var n=K,i=Nu();if(r&&!h(this,dn).has(e)&&!h(this,hr).has(e))if(i){var s=document.createDocumentFragment(),o=bn();s.append(o),h(this,hr).set(e,{effect:vr(()=>r(o)),fragment:s})}else h(this,dn).set(e,vr(()=>r(this.anchor)));if(h(this,Vr).set(n,e),i){for(const[c,u]of h(this,dn))c===e?n.unskip_effect(u):n.skip_effect(u);for(const[c,u]of h(this,hr))c===e?n.unskip_effect(u.effect):n.skip_effect(u.effect);n.oncommit(h(this,ms)),n.ondiscard(h(this,_o))}else h(this,ms).call(this,n)}}Vr=new WeakMap,dn=new WeakMap,hr=new WeakMap,ji=new WeakMap,gs=new WeakMap,ms=new WeakMap,_o=new WeakMap;function ae(t,e,r=!1){var n=new Ju(t),i=r?ka:0;function s(o,c){n.ensure(o,c)}ys(()=>{var o=!1;e((c,u=0)=>{o=!0,s(u,c)}),o||s(-1,null)},i)}const Fh=Symbol("NaN");function $h(t,e,r){var n=new Ju(t);ys(()=>{var i=e();i!==i&&(i=Fh),n.ensure(i,r)})}function fa(t,e){return e}function Bh(t,e,r){for(var n=[],i=e.length,s,o=e.length,c=0;c<i;c++){let _=e[c];qi(_,()=>{if(s){if(s.pending.delete(_),s.done.add(_),s.pending.size===0){var b=t.outrogroups;wl(t,bo(s.done)),b.delete(s),b.size===0&&(t.outrogroups=null)}}else o-=1},!1)}if(o===0){var u=n.length===0&&r!==null&&t.pending.size===0;if(u){var f=r,v=f.parentNode;hh(v),v.append(f),t.items.clear()}wl(t,e,!u)}else s={pending:new Set(e),done:new Set},(t.outrogroups??(t.outrogroups=new Set)).add(s)}function wl(t,e,r=!0){var n;if(t.pending.size>0){n=new Set;for(const o of t.pending.values())for(const c of o)n.add(t.items.get(c).e)}for(var i=0;i<e.length;i++){var s=e[i];if(n!=null&&n.has(s)){s.f|=gn;const o=document.createDocumentFragment();Hl(s,o)}else Zt(e[i],r)}}var vc;function Pe(t,e,r,n,i,s=null){var o=t,c=new Map,u=(e&ou)!==0;if(u){var f=t;o=f.appendChild(bn())}var v=null,_=gu(()=>{var W=r();return mo(W)?W:W==null?[]:bo(W)}),b=new Map,w=!0;function I(W){if((x.effect.f&kt)===0){x.pending.delete(W);var U=a(_);x.fallback=v,Hh(x,U,o,e,n),v!==null&&(U.length===0?(v.f&gn)===0?no(v):(v.f^=gn,ts(v,null,o)):qi(v,()=>{v=null}))}}function P(W){x.pending.delete(W)}var T=ys(()=>{for(var W=a(_),U=W.length,D=new Set,q=K,Q=Nu(),F=0;F<U;F+=1){var Z=W[F],z=n(Z,F),L=w?null:c.get(z);L?(L.v&&Aa(L.v,Z),L.i&&Aa(L.i,F),Q&&q.unskip_effect(L.e)):(L=Vh(c,w?o:vc??(vc=bn()),Z,z,F,i,e,r),w||(L.e.f|=gn),c.set(z,L)),D.add(z)}if(U===0&&s&&!v&&(w?v=vr(()=>s(o)):(v=vr(()=>s(vc??(vc=bn()))),v.f|=gn)),U>D.size&&Hf(),!w)if(b.set(q,D),Q){for(const[pe,ue]of c)D.has(pe)||q.skip_effect(ue.e);q.oncommit(I),q.ondiscard(P)}else I(q);a(_)}),x={effect:T,items:c,pending:b,outrogroups:null,fallback:v};w=!1}function Ka(t){for(;t!==null&&(t.f&Jr)===0;)t=t.next;return t}function Hh(t,e,r,n,i){var L,pe,ue,Dt,Ke,ke,Vt,er,zt;var s=(n&kf)!==0,o=e.length,c=t.items,u=Ka(t.effect.first),f,v=null,_,b=[],w=[],I,P,T,x;if(s)for(x=0;x<o;x+=1)I=e[x],P=i(I,x),T=c.get(P).e,(T.f&gn)===0&&((pe=(L=T.nodes)==null?void 0:L.a)==null||pe.measure(),(_??(_=new Set)).add(T));for(x=0;x<o;x+=1){if(I=e[x],P=i(I,x),T=c.get(P).e,t.outrogroups!==null)for(const Ye of t.outrogroups)Ye.pending.delete(T),Ye.done.delete(T);if((T.f&Bt)!==0&&(no(T),s&&((Dt=(ue=T.nodes)==null?void 0:ue.a)==null||Dt.unfix(),(_??(_=new Set)).delete(T))),(T.f&gn)!==0)if(T.f^=gn,T===u)ts(T,null,r);else{var W=v?v.next:u;T===t.effect.last&&(t.effect.last=T.prev),T.prev&&(T.prev.next=T.next),T.next&&(T.next.prev=T.prev),ni(t,v,T),ni(t,T,W),ts(T,W,r),v=T,b=[],w=[],u=Ka(v.next);continue}if(T!==u){if(f!==void 0&&f.has(T)){if(b.length<w.length){var U=w[0],D;v=U.prev;var q=b[0],Q=b[b.length-1];for(D=0;D<b.length;D+=1)ts(b[D],U,r);for(D=0;D<w.length;D+=1)f.delete(w[D]);ni(t,q.prev,Q.next),ni(t,v,q),ni(t,Q,U),u=U,v=Q,x-=1,b=[],w=[]}else f.delete(T),ts(T,u,r),ni(t,T.prev,T.next),ni(t,T,v===null?t.effect.first:v.next),ni(t,v,T),v=T;continue}for(b=[],w=[];u!==null&&u!==T;)(f??(f=new Set)).add(u),w.push(u),u=Ka(u.next);if(u===null)continue}(T.f&gn)===0&&b.push(T),v=T,u=Ka(T.next)}if(t.outrogroups!==null){for(const Ye of t.outrogroups)Ye.pending.size===0&&(wl(t,bo(Ye.done)),(Ke=t.outrogroups)==null||Ke.delete(Ye));t.outrogroups.size===0&&(t.outrogroups=null)}if(u!==null||f!==void 0){var F=[];if(f!==void 0)for(T of f)(T.f&Bt)===0&&F.push(T);for(;u!==null;)(u.f&Bt)===0&&u!==t.fallback&&F.push(u),u=Ka(u.next);var Z=F.length;if(Z>0){var z=(n&ou)!==0&&o===0?r:null;if(s){for(x=0;x<Z;x+=1)(Vt=(ke=F[x].nodes)==null?void 0:ke.a)==null||Vt.measure();for(x=0;x<Z;x+=1)(zt=(er=F[x].nodes)==null?void 0:er.a)==null||zt.fix()}Bh(t,F,z)}}s&&Vn(()=>{var Ye,ot;if(_!==void 0)for(T of _)(ot=(Ye=T.nodes)==null?void 0:Ye.a)==null||ot.apply()})}function Vh(t,e,r,n,i,s,o,c){var u=(o&Ef)!==0?(o&Tf)===0?uh(r,!1,!1):vi(r):null,f=(o&Sf)!==0?vi(i):null;return{v:u,i:f,e:vr(()=>(s(e,u??r,f??i,c),()=>{t.delete(n)}))}}function ts(t,e,r){if(t.nodes)for(var n=t.nodes.start,i=t.nodes.end,s=e&&(e.f&gn)===0?e.nodes.start:r;n!==null;){var o=ws(n);if(s.before(n),n===i)return;n=o}}function ni(t,e,r){e===null?t.effect.first=r:e.next=r,r===null?t.effect.last=e:r.prev=e}function _c(t,e,r=!1,n=!1,i=!1,s=!1){var o=t,c="";if(r)var u=t;B(()=>{var f=we;if(c!==(c=e()??"")){if(r&&!uu){f.nodes=null,u.innerHTML=c,c!==""&&Ra(zn(u),u.lastChild);return}if(f.nodes!==null&&(Uu(f.nodes.start,f.nodes.end),f.nodes=null),c!==""){var v=n?Of:i?Df:void 0,_=Ou(n?"svg":i?"math":"template",v);_.innerHTML=c;var b=n||i?_:_.content;if(Ra(zn(b),b.lastChild),n||i)for(;zn(b);)o.before(zn(b));else o.before(b)}}})}function zh(t,e){var r;r=document.head.appendChild(bn());try{ys(()=>{var n=vr(()=>e(r));n.f|=au,uu||(n.nodes===null?n.nodes={start:r,end:r,a:null,t:null}:n.nodes.end=r)})}finally{}}const gc=[...` 	
\r\f \v\uFEFF`];function jh(t,e,r){var n=t==null?"":""+t;if(r){for(var i of Object.keys(r))if(r[i])n=n?n+" "+i:i;else if(n.length)for(var s=i.length,o=0;(o=n.indexOf(i,o))>=0;){var c=o+s;(o===0||gc.includes(n[o-1]))&&(c===n.length||gc.includes(n[c]))?n=(o===0?"":n.substring(0,o))+n.substring(c+1):o=c}}return n===""?null:n}function mc(t,e=!1){var r=e?" !important;":";",n="";for(var i of Object.keys(t)){var s=t[i];s!=null&&s!==""&&(n+=" "+i+": "+s+r)}return n}function Wh(t,e){if(e){var r="",n,i;return Array.isArray(e)?(n=e[0],i=e[1]):n=e,n&&(r+=mc(n)),i&&(r+=mc(i,!0)),r=r.trim(),r===""?null:r}return String(t)}function cr(t,e,r,n,i,s){var o=t[sl];if(o!==r||o===void 0){var c=jh(r,n,s);c==null?t.removeAttribute("class"):t.className=c,t[sl]=r}else if(s&&i!==s)for(var u in s){var f=!!s[u];(i==null||f!==!!i[u])&&t.classList.toggle(u,f)}return s}function Wo(t,e={},r,n){for(var i in r){var s=r[i];e[i]!==s&&(r[i]==null?t.style.removeProperty(i):t.style.setProperty(i,s,n))}}function bc(t,e,r,n){var i=t[ol];if(i!==e){var s=Wh(e,n);s==null?t.removeAttribute("style"):t.style.cssText=s,t[ol]=e}else n&&(Array.isArray(n)?(Wo(t,r==null?void 0:r[0],n[0]),Wo(t,r==null?void 0:r[1],n[1],"important")):Wo(t,r,n));return n}function qh(t,e){e?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function Gh(t,e){var r=t.__defaultValue,n=t.multiple,i=n?r??[]:null;if(!(n&&!mo(i))){t.selectedIndex;for(var s of t.options){var o=ha(s);qh(s,n?i.includes(o):Au(o,r))}}}function io(t,e,r=!1){if(t.multiple){if(e==null)return;if(!mo(e))return Mf();for(var n of t.options)n.selected=e.includes(ha(n));return}for(n of t.options){var i=ha(n);if(Au(i,e)){n.selected=!0;return}}(!r||e!==void 0)&&(t.selectedIndex=-1)}function lr(t){var e=new MutationObserver(r=>{r.every(Kh)||("__defaultValue"in t&&Gh(t),"__value"in t&&io(t,t.__value))});e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),Fl(()=>{e.disconnect()})}function $r(t,e,r=e){var n=new WeakSet,i=!0;Ol(t,"change",s=>{var o=s?"[selected]":":checked",c;if(t.multiple)c=[].map.call(t.querySelectorAll(o),ha);else{var u=t.querySelector(o)??t.querySelector("option:not([disabled])");c=u&&ha(u)}r(c),t.__value=c,K!==null&&n.add(K)}),$l(()=>{var s=e();if(t===document.activeElement){var o=K;if(n.has(o))return}if(io(t,s,i),i&&s===void 0){var c=t.querySelector(":checked");c!==null&&(s=ha(c),r(s))}t.__value=s,i=!1})}function ha(t){return"__value"in t?t.__value:t.value}function Kh(t){if(t.target.closest("selectedcontent")!==null)return!0;if(t.type==="childList"){var e=[...t.addedNodes,...t.removedNodes];return e.length>0&&e.every(r=>r.nodeName==="SELECTEDCONTENT")}return!1}const Jh=Symbol("is custom element"),Yh=Symbol("is html"),Xh=If?"progress":"PROGRESS";function Xt(t,e){var r=Yu(t);r.value===(r.value=e??void 0)||t.value===e&&(e!==0||t.nodeName!==Xh)||(t.value=e??"")}function ft(t,e,r,n){var i=Yu(t);i[e]!==(i[e]=r)&&(e==="loading"&&(t[yf]=r),r==null?t.removeAttribute(e):typeof r!="string"&&Qh(t).has(e)?t[e]=r:t.setAttribute(e,r))}function Yu(t){return t[Vs]??(t[Vs]={[Jh]:t.nodeName.includes("-"),[Yh]:t.namespaceURI===cu})}var wc=new Map;function Qh(t){var e=t.getAttribute("is")||t.nodeName,r=wc.get(e);if(r)return r;wc.set(e,r=new Set);for(var n,i=t,s=Element.prototype;s!==i;){n=hf(i);for(var o in n)n[o].set&&o!=="innerHTML"&&o!=="textContent"&&o!=="innerText"&&r.add(o);i=ru(i)}return r}function We(t,e,r=e){var n=new WeakSet;Ol(t,"input",async i=>{var s=i?t.defaultValue:t.value;if(s=qo(t)?Go(s):s,r(s),K!==null&&n.add(K),await as(),s!==(s=e())){var o=t.selectionStart,c=t.selectionEnd,u=t.value.length;if(t.value=s??"",c!==null){var f=t.value.length;o===c&&c===u&&f>u?(t.selectionStart=f,t.selectionEnd=f):(t.selectionStart=o,t.selectionEnd=Math.min(c,f))}}}),Ma(e)==null&&t.value&&(r(qo(t)?Go(t.value):t.value),K!==null&&n.add(K)),Eo(()=>{var i=e();if(t===document.activeElement){var s=K;if(n.has(s))return}qo(t)&&i===Go(t.value)||t.type==="date"&&!i&&!t.value||i!==t.value&&(t.value=i??"")})}function ao(t,e,r=e){Ol(t,"change",n=>{var i=n?t.defaultChecked:t.checked;r(i)}),Ma(e)==null&&r(t.checked),Eo(()=>{var n=e();t.checked=!!n})}function qo(t){var e=t.type;return e==="number"||e==="range"}function Go(t){return t===""?null:+t}function Ko(t,e){return t===e||(t==null?void 0:t[Wi])===e}function Xu(t=xl(),e,r,n){var i=Nt.r,s=we;return $l(()=>{var o,c;return Eo(()=>{o=c,c=[],Ma(()=>{Ko(r(...c),t)||(e(t,...c),o&&Ko(r(...o),t)&&e(null,...o))})}),()=>{let u=s;for(;u!==i&&u.parent!==null&&u.parent.f&ls;)u=u.parent;const f=()=>{c&&Ko(r(...c),t)&&e(null,...c)},v=u.teardown;u.teardown=()=>{f(),v==null||v()}}}),t}let $s=!1;function Zh(t){var e=$s;try{return $s=!1,[t(),$s]}finally{$s=e}}function Jo(t,e,r,n){var D;var i=!0,s=(r&Rf)!==0,o=(r&Pf)!==0,c=n,u=!0,f=void 0,v=()=>o&&i?(f??(f=cs(n)),a(f)):(u&&(u=!1,c=o?Ma(n):n),c);let _;if(s){var b=Wi in t||wf in t;_=((D=ua(t,e))==null?void 0:D.set)??(b&&e in t?q=>t[e]=q:void 0)}var w,I=!1;s?[w,I]=Zh(()=>t[e]):w=t[e],w===void 0&&n!==void 0&&(w=v(),_&&(qf(),_(w)));var P;if(P=()=>{var q=t[e];return q===void 0?v():(u=!0,q)},(r&Cf)===0)return P;if(_){var T=t.$$legacy;return(function(q,Q){return arguments.length>0?((!Q||T||I)&&_(Q?P():q),q):P()})}var x=!1,W=((r&Af)!==0?cs:gu)(()=>(x=!1,P()));s&&a(W);var U=we;return(function(q,Q){if(arguments.length>0){const F=Q?a(W):s?_r(q):q;return d(W,F),x=!0,c!==void 0&&(c=F),q}return Kn&&x||(U.f&kt)!==0?W.v:a(W)})}function Qu(t){Nt===null&&$f(),Du(()=>{const e=Ma(t);if(typeof e=="function")return e})}const ep="5";var Zc;typeof window<"u"&&((Zc=window.__svelte??(window.__svelte={})).v??(Zc.v=new Set)).add(ep);var fn,hn,Bn,go,qr,rs,qs;const tc=class tc extends Map{constructor(r){super();re(this,qr);re(this,fn,new Map);re(this,hn,O(0));re(this,Bn,O(0));re(this,go,Gn||-1);if(r){for(var[n,i]of r)super.set(n,i);h(this,Bn).v=super.size}}has(r){var n=h(this,fn),i=n.get(r);if(i===void 0)if(super.has(r))i=Y(this,qr,rs).call(this,0),n.set(r,i);else return a(h(this,hn)),!1;return a(i),!0}forEach(r,n){Y(this,qr,qs).call(this),super.forEach(r,n)}get(r){var n=h(this,fn),i=n.get(r);if(i===void 0)if(super.has(r))i=Y(this,qr,rs).call(this,0),n.set(r,i);else{a(h(this,hn));return}return a(i),super.get(r)}getOrInsert(r,n){return super.has(r)||this.set(r,n),this.get(r)}getOrInsertComputed(r,n){return super.has(r)||this.set(r,n(r)),this.get(r)}set(r,n){var _;var i=h(this,fn),s=i.get(r),o=super.get(r),c=super.set(r,n),u=h(this,hn);if(s===void 0)s=Y(this,qr,rs).call(this,0),i.set(r,s),d(h(this,Bn),super.size),pn(u);else if(o!==n){pn(s);var f=u.reactions===null?null:new Set(u.reactions),v=f===null||!((_=s.reactions)!=null&&_.every(b=>f.has(b)));v&&pn(u)}return c}delete(r){var n=h(this,fn),i=n.get(r),s=super.delete(r);return i!==void 0&&(n.delete(r),d(i,-1)),s&&(d(h(this,Bn),super.size),pn(h(this,hn))),s}clear(){if(super.size!==0){super.clear();var r=h(this,fn);d(h(this,Bn),0);for(var n of r.values())d(n,-1);pn(h(this,hn)),r.clear()}}keys(){return a(h(this,hn)),super.keys()}values(){return Y(this,qr,qs).call(this),super.values()}entries(){return Y(this,qr,qs).call(this),super.entries()}[Symbol.iterator](){return this.entries()}get size(){return a(h(this,Bn)),super.size}};fn=new WeakMap,hn=new WeakMap,Bn=new WeakMap,go=new WeakMap,qr=new WeakSet,rs=function(r){return Gn===h(this,go)?O(r):vi(r)},qs=function(){a(h(this,hn));var r=h(this,fn);if(h(this,Bn).v!==r.size){for(var n of sc(tc.prototype,this,"keys").call(this))if(!r.has(n)){var i=Y(this,qr,rs).call(this,0);r.set(n,i)}}for([,i]of h(this,fn))a(i)};let yl=tc;const yc=Object.freeze({infographic:[1080,1350],carousel:[1080,1350],story:[1080,1920],reel:[1080,1920]});function Gs(t=""){return String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[e])}function Bs(t,e){return/^#[0-9a-f]{6}$/i.test(t||"")?t:e}function tp(t,e,r){const n=String(t??"").slice(0,12e3).split(/\s+/).filter(Boolean),i=[];let s="";for(const o of n){const c=o.match(new RegExp(`.{1,${e}}`,"gu"))||[];for(const u of c)s&&[...`${s} ${u}`].length>e&&(i.push(s),s=""),s=s?`${s} ${u}`:u}if(s&&i.push(s),i.length>r)throw new Error(`Content exceeds artwork capacity (${r} lines). Shorten the text before exporting.`);return i}function Yo(t,e,r,n,i,s,o,c=400,u="DejaVu Sans"){const f=tp(t,Math.max(8,Math.floor(i/(n*.63))),s);return{height:Math.max(1,f.length)*n*1.3,svg:`<text data-preflight-text="true" x="${e}" y="${r}" fill="${o}" font-family="${u}, Noto Sans Devanagari, sans-serif" font-size="${n}" font-weight="${c}">${f.map((v,_)=>`<tspan x="${e}" dy="${_?n*1.3:0}">${Gs(v)}</tspan>`).join("")}</text>`}}function rp({brandProfile:t={},campaign:e,format:r="infographic",slideIndex:n=0}){var pe,ue,Dt,Ke,ke,Vt,er,zt,Ye,ot,Sn;if(!e||!yc[r])throw new Error("A campaign and supported format are required");const[i,s]=yc[r],o=t.colors||[],c=Bs((pe=o[0])==null?void 0:pe.hex,"#141513"),u=Bs((ue=o[2])==null?void 0:ue.hex,"#C5D86D"),f=Bs((Dt=o[3])==null?void 0:Dt.hex,"#F4F1EA"),v=Bs((Ke=o[1])==null?void 0:Ke.hex,"#A8C5A0"),_=s===1920,b=r==="reel"?740:900,w=_?400:140;let I,P,T;if(r==="infographic"){const ce=e.infographic;if(!ce||!Array.isArray(ce.statRows))throw new Error("Infographic content missing");I=ce.headline,P=ce.statRows,T=ce.bottomTakeaway}else if(r==="carousel"){const ce=(Vt=(ke=e.carousel)==null?void 0:ke.slides)==null?void 0:Vt[n];if(!ce)throw new Error("Carousel slide missing");I=ce.title,P=[ce.bodyMetric],T=ce.visualNote}else if(r==="story"){const ce=e.story;if(!ce)throw new Error("Story content missing");I=ce.hookBanner,P=[ce.keyStatHighlight],T=ce.interactiveStickerPrompt}else{const ce=(zt=(er=e.reel)==null?void 0:er.beats)==null?void 0:zt[n];if(!ce)throw new Error("Reel beat missing");I=ce.onScreenText||e.reel.spokenHook0to3s,P=[ce.voiceover],T=e.reel.closingCta}const x=(ce,xe)=>["Mona Sans","Inter","Instrument Serif","DejaVu Sans"].find(Be=>String(ce||"").split("/")[0].trim()===Be)||xe,W=x((Ye=t.fonts)==null?void 0:Ye.heading,"DejaVu Sans"),U=x((ot=t.fonts)==null?void 0:ot.body,"DejaVu Sans"),D=[];let q=w;const Q=Yo(I,80,q,52,b,5,f,700,W);D.push(Q.svg),q+=Q.height+72;for(const ce of P){const xe=Yo(ce,106,q,34,b-60,5,f,400,U);D.push(`<path d="M80 ${q-30}v${xe.height+10}" stroke="${u}" stroke-width="6"/>`,xe.svg),q+=xe.height+50}const F=Yo(T,80,q+10,29,b,4,v,400,U),Z=_?s*.82-35:s-80;if(q+F.height>Z)throw new Error("Content exceeds the safe artwork area. Shorten the copy before exporting.");D.push(F.svg);const z=Gs([t.logoText,t.brandName||"Campaign Studio"].filter(Boolean).join(" · ")),L=((Sn=e.provenance)==null?void 0:Sn.mode)==="synthetic"?"SYNTHETIC DRAFT · REVIEW REQUIRED":"EDITORIAL DRAFT";return`<svg xmlns="http://www.w3.org/2000/svg" width="${i}" height="${s}" viewBox="0 0 ${i} ${s}" role="img" aria-label="${Gs(I)}"><title>${Gs(I)}</title><rect width="${i}" height="${s}" fill="${c}"/><g font-family="DejaVu Sans, Noto Sans Devanagari, sans-serif"><text data-preflight-text="true" x="80" y="${_?305:65}" fill="${v}" font-size="26" font-weight="700">${z}</text><path d="M80 ${w-55}h920" stroke="${u}" stroke-width="3"/>${D.join("")}<text data-preflight-text="true" x="80" y="${_?Math.floor(s*.8):s-35}" fill="${v}" font-size="19">${L}${r==="carousel"?` · ${n+1}/4`:""}</text></g></svg>`}const np=new Set(["infographic","carousel","story","reel"]);function Xo(t){if(typeof t!="string"||!/^#[0-9a-f]{6}$/i.test(t))return null;const[e,r,n]=t.slice(1).match(/.{2}/g).map(i=>{const s=parseInt(i,16)/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4});return .2126*e+.7152*r+.0722*n}function ip({format:t,canvas:e,textBoxes:r=[],obstructionBoxes:n=[],foreground:i,background:s,caption:o="",captionLimit:c=125}){if(!np.has(t)||!e||!Number.isFinite(e.width)||!Number.isFinite(e.height)||e.width<=0||e.height<=0||e.width>1e4||e.height>1e4)throw new Error("Invalid preflight canvas or format");if(!Array.isArray(r)||r.length>2e3||r.some(z=>!z||["x","y","width","height"].some(L=>!Number.isFinite(z[L]))||z.width<0||z.height<0))throw new Error("Invalid preflight text rectangles");if(!Array.isArray(n)||n.length>40||n.some(z=>!z||["x","y","width","height"].some(L=>!Number.isFinite(z[L]))||z.width<0||z.height<0))throw new Error("Invalid preflight obstruction rectangles");if(typeof o!="string"||o.length>2e4||!Number.isInteger(c)||c<40||c>500)throw new Error("Invalid preflight caption settings");const{width:u,height:f}=e,v=t==="story"||t==="reel",_=v?[{x:0,y:0,width:u,height:f*.14},{x:0,y:f*.82,width:u,height:f*.18},...t==="reel"?[{x:u*.82,y:0,width:u*.18,height:f}]:[]]:[],b=r.filter(z=>[..._,...n].some(L=>z.x<L.x+L.width&&z.x+z.width>L.x&&z.y<L.y+L.height&&z.y+z.height>L.y)).length,w=r.filter(z=>z.x<-1||z.y<-1||z.x+z.width>u+1||z.y+z.height>f+1).length,I=Xo(s),P=r.map(z=>Xo(z.foreground||i)).filter(z=>z!==null).map(z=>I===null?null:(Math.max(z,I)+.05)/(Math.min(z,I)+.05)).filter(z=>z!==null),T=r.filter(z=>Xo(z.foreground||i)===null||I===null).length,x=P.length?Math.round(Math.min(...P)*100)/100:null,W=Math.min(c,o.length),U=/\$\d|\d%/.test(o.slice(0,c)),D=r.length>0,q=v?9/16:4/5,Q=u/f,F=Math.abs(Q-q)/q;return{simulation:!0,measurementMethod:"client-svg-text-rectangles",requiresReview:!0,metrics:{obstructionElementsCount:n.length,unmeasuredColorCount:T,expectedAspectRatio:v?"9:16":"4:5",actualAspectRatio:Math.round(Q*1e4)/1e4,aspectRatioDeviation:F,artworkWidth:u,artworkHeight:f,textElementsCount:r.length,occludedElementsCount:b,overflowElementsCount:w,contrastRatio:x,captionCharacters:o.length,firstLookCharacters:W,firstLookContainsHardNumber:U,safeZoneRegions:{top:v?.14:0,bottom:v?.18:0,right:t==="reel"?.18:0}},checks:[{id:"aspect-ratio",status:F<=.01?"pass":"warning",measured:Q,limit:q,message:"Rendered artwork ratio compared with the intended 4:5 or 9:16 export; 1% layout tolerance."},{id:"safe-zones",status:D?b?"warning":"pass":"unmeasured",measured:D?b:null,limit:0,message:"Text rectangles intersecting measured native chrome/stickers or approximate chrome zones; actual Instagram layout can vary."},{id:"artwork-overflow",status:D?w?"warning":"pass":"unmeasured",measured:D?w:null,limit:0,message:"Text rectangles outside the rendered artwork."},{id:"contrast",status:x===null||T>0?"unmeasured":x>=4.5?"pass":"warning",measured:x,limit:4.5,message:"Minimum text fill contrast against the supplied base background, without image/gradient analysis."},{id:"caption-fold",status:o.length>c?"warning":"pass",measured:o.length,limit:c,message:"Configurable approximate caption fold; not an official platform guarantee."}]}}var ap=R('<div class="statusbar"><span>9:41</span><span class="island"></span><span>▴ ▰ ▮</span></div>'),sp=R("<!><span> </span>",1),op=R('<span class="empty-cell">No scheduled or exported post</span>'),lp=R("<div><!></div>"),cp=R('<div class="profile-header"><b> </b><button aria-label="Profile options">☰</button></div> <div class="profile-summary"><span class="avatar large"> </span><span><b> </b> preview posts</span><span>Private<br/>preview</span></div> <div class="profile-bio"><b> </b> <p> </p> <small>Local preview · active first, weekly schedule Monday–Sunday, then newest exports. Not a live Instagram feed.</small></div> <div class="profile-grid"></div>',1),up=R('<header class="ig-header"><span class="avatar"> </span> <div><b> </b><small>Editorial draft</small></div> <button aria-label="Post options">•••</button></header>'),dp=R('<span class="slide-count"> </span><button class="previous" aria-label="Previous slide">‹</button><button class="next" aria-label="Next slide">›</button>',1),fp=R("<span><i></i></span>"),hp=R('<div class="story-chrome"><div class="timer-bars"></div> <div class="story-header"><span class="avatar"> </span><b> </b><span>Draft</span><button> </button><button aria-label="Close story preview">×</button></div></div> <div class="poll-sticker"><b> </b> <div><button> </button><button> </button></div> <small> </small></div> <div class="story-reply"><input aria-label="Story reply preview" placeholder="Send message…"/><button aria-label="Like story"> </button><button aria-label="Share story preview">➤</button></div>',1),pp=R('<div class="reel-top"><b>Reels</b><span>Storyboard simulation</span></div> <div class="reel-rail"><button aria-label="Like reel"> <small> </small></button><button aria-label="Comment on reel">♧<small> </small></button><button aria-label="Share reel preview">➤</button><button aria-label="Reel options">•••</button><span>♫</span></div> <div class="reel-meta"><b> </b><button> </button> <p> </p> <div class="audio">♫ Original audio · storyboard, no audio playback</div></div>',1),vp=R('<div class="danger right">18%</div>'),_p=R('<div class="safe-mask" aria-label="Simulated safe-zone overlay"><div class="danger top">Top 14% · chrome risk</div> <div class="danger bottom">Bottom 18% · caption / reply risk</div> <!> <div class="clear-zone">Inspect text clearance</div></div>'),gp=R('<span class="floating-heart">♥</span>'),mp=R('<div class="reel-controls"><button> </button><input aria-label="Reel scrubber" type="range" min="0" max="30" step=".25"/><output data-testid="active-beat"> </output></div>'),bp=R("<button>●</button>"),wp=R('<div class="dots"></div>'),yp=R("<button> </button>"),Ip=R('<div class="engagement"><button aria-label="Like post"> </button><button aria-label="Comment on post">♧</button><button aria-label="Share post preview">➤</button><!><button class="bookmark" aria-label="Save post locally"> </button></div> <p class="local-count"> </p> <div class="caption"><b> </b> <!><small>LOCAL DRAFT · NO INSTAGRAM CONNECTION</small></div>',1),Ep=R(`<div class="fold-ruler"><label>Approximate fold <input aria-label="Caption fold threshold" type="number" min="40" max="500"/> characters</label> <p><mark> </mark><span class="fold-line">│</span> </p> <small>Configurable simulation. Actual truncation varies by app, device
              and layout.</small></div>`),Sp=R('<!> <div role="group" aria-label="Artwork preview"><div class="artwork"></div> <!> <!> <!> <!> <!></div> <!> <!> <!>',1),kp=R("<p> </p>"),Tp=R('<div class="comment-panel"><b>Local comments</b><!> <form><input aria-label="Local comment" placeholder="Write a preview comment"/><button>Add</button></form></div>'),Ap=R('<p class="local-notice" role="status"> </p>'),Cp=R(`<div class="measurements"><span><b> </b> text boxes in chrome zones</span><span><b> </b> text boxes outside artwork</span><span><b> </b> </span><span><b> </b> </span><span><b> </b> caption characters before simulated
          fold</span></div> <p class="small muted">Measured SVG text boxes and fill contrast against the base background;
        images, glyph shapes and all native app variations are not covered.
        Review required. No confidence score is inferred.</p>`,1),Rp=R('<p class="small muted">Open a design or Instagram surface to measure the rendered SVG.</p>'),Pp=R(`<section class="emulator" aria-label="Instagram preview simulator"><div class="preview-heading"><div><span class="eyebrow">PREVIEW LAB</span> <h3>See it in context.</h3></div> <span class="simulation">Local simulation</span></div> <div class="segmented" aria-label="Preview mode"><button>Design Mode</button> <button>In-Situ Instagram</button> <button>3×3 Profile Grid</button></div> <div class="preview-controls"><label>Phone width <select><option>375 px</option><option>390 px · generic</option><option>402 px · iPhone 16 Pro</option><option>430 px</option></select></label> <label>Zoom <input aria-label="Preview zoom" type="range" min="55" max="125" step="5"/><output> </output></label> <label><input type="checkbox"/>Safe zones</label> <label><input type="checkbox"/>Caption ruler</label></div> <p class="muted small">Approximate Instagram chrome. Local interactions only. Validate final assets
    in Instagram before publishing.</p> <div class="phone-well"><div aria-label="Simulated phone viewport"><!> <!> <!> <!></div></div> <div class="evidence"><div class="evidence-title"><b>Measured preflight</b><button>Measure again</button></div> <!></div></section>`);function xp(t,e){yo(e,!0);let r=Jo(e,"format",3,"infographic"),n=Jo(e,"backlog",19,()=>[]),i=Jo(e,"onpreflight",3,()=>{}),s=O("instagram"),o=O(85),c=O(402),u=O(!1),f=O(!0),v=O(125),_=O(0),b=O(!1),w=O(!1),I=O(!1),P=O(""),T=O(_r([])),x=O(!1),W=O(""),U=O(null),D=O(0),q=O(0),Q=O(!1),F=O(0),Z=O(!1),z=O(!1),L=0,pe=O(void 0),ue=O(null);function Dt(C){try{return rp(C)}catch{return'<div class="artwork-error">Artwork exceeds its layout. Shorten the copy and save before export.</div>'}}let Ke=_t(()=>{var C,X;return(((C=e.brandProfile)==null?void 0:C.handle)||((X=e.brandProfile)==null?void 0:X.brandName)||"studio").replace(/[^a-zA-Z0-9_.]/g,"").toLowerCase()}),ke=_t(()=>{var C,X,Fe,it;return((X=(C=e.campaign)==null?void 0:C.infographic)==null?void 0:X.caption)||((it=(Fe=e.campaign)==null?void 0:Fe.story)==null?void 0:it.hookBanner)||""}),Vt=_t(()=>{var X,Fe,it;const C=((Fe=(X=e.campaign)==null?void 0:X.reel)==null?void 0:Fe.beats)||[];for(let gt=C.length-1;gt>=0;gt--){const Te=(it=C[gt].timecode)==null?void 0:it.match(/^(\d+):(\d+)/);if(Te&&a(F)>=Number(Te[1])*60+Number(Te[2]))return gt}return 0}),er=_t(()=>Dt({campaign:e.campaign,brandProfile:e.brandProfile,format:r(),slideIndex:r()==="reel"?a(Vt):a(_)})),zt=_t(()=>{var C,X;return((X=(C=e.campaign)==null?void 0:C.carousel)==null?void 0:X.slides)||[]});const Ye=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];let ot=_t(()=>[{id:"active",campaignDraft:e.campaign,title:"Active campaign",gridLabel:"Active"},...n().filter(C=>C.id!==e.activeStoryId&&C.campaignDraft&&["Scheduled","Exported"].includes(C.status)).sort((C,X)=>C.status!==X.status?C.status==="Scheduled"?-1:1:C.status==="Scheduled"?Ye.indexOf(C.scheduledDay)-Ye.indexOf(X.scheduledDay):(Date.parse(X.exportedAt)||0)-(Date.parse(C.exportedAt)||0)).slice(0,8).map(C=>({...C,gridLabel:C.status==="Scheduled"?`Scheduled · ${C.scheduledDay}`:`Exported${C.exportedAt?` · ${new Date(C.exportedAt).toLocaleString()}`:" · time unavailable"}`}))]);Du(()=>{JSON.stringify(e.campaign),r(),a(s),a(c),a(o),a(_),a(v),a(Vt),a(D),a(U),a(I),a(b),a(w),a(z),a(T).length;const C=setTimeout(()=>{kn()},160);return()=>clearTimeout(C)}),Qu(()=>{window.innerWidth<700&&d(o,75);const C=setInterval(()=>{a(Z)&&(d(F,Math.min(30,a(F)+.25),!0),a(F)>=30&&d(Z,!1)),a(Q)&&(d(q,a(q)+.25),a(q)>=5&&(d(q,0),d(D,(a(D)+1)%4)))},250);return document.fonts.addEventListener("loadingdone",kn),()=>{clearInterval(C),document.fonts.removeEventListener("loadingdone",kn)}});function Sn(C){d(s,C,!0),d(Z,!1),d(Q,!1)}function ce(C){r()==="carousel"&&d(_,Math.max(0,Math.min(a(zt).length-1,a(_)+C)),!0),r()==="story"&&(d(D,(a(D)+C+4)%4),d(q,0))}function xe(C){var X;["INPUT","TEXTAREA","SELECT"].includes((X=C.target)==null?void 0:X.tagName)||(C.key==="ArrowRight"&&ce(1),C.key==="ArrowLeft"&&ce(-1))}function Be(C){if(/^#[0-9a-f]{6}$/i.test(C))return C;const X=C.match(/[\d.]+/g);return(X==null?void 0:X.length)>=3?"#"+X.slice(0,3).map(Fe=>Math.round(Number(Fe)).toString(16).padStart(2,"0")).join(""):null}async function kn(){var Wt;if(await as(),await document.fonts.ready,!a(pe)||a(s)==="grid"){d(ue,null);return}const C=a(pe).getBoundingClientRect();if(!C.width||!C.height)return;const X=[...a(pe).querySelectorAll("svg text")],Fe=Be(((Wt=a(pe).querySelector("svg rect"))==null?void 0:Wt.getAttribute("fill"))||"#141513"),it=X.map(At=>{const at=At.getBoundingClientRect();return{x:at.x-C.x,y:at.y-C.y,width:at.width,height:at.height,foreground:Be(getComputedStyle(At).fill)}}),gt=a(pe).parentElement,Te=a(s)==="instagram"?[...gt.querySelectorAll(".poll-sticker,.reel-rail,.reel-meta,.reel-top,.story-chrome,.story-reply,.slide-count,.previous,.next,.floating-heart")].map(At=>{const at=At.getBoundingClientRect(),wr=At.classList.contains("reel-meta")?getComputedStyle(At,"::before"):null,qt=Zr=>wr&&wr.content!=="none"?Math.min(0,parseFloat(wr[Zr])||0):0,yr=qt("left"),Gt=qt("right"),Qr=qt("top"),Pn=qt("bottom");return{x:at.x-C.x+yr,y:at.y-C.y+Qr,width:at.width-yr-Gt,height:at.height-Qr-Pn}}):[],Lt={format:r(),obstructionBoxes:Te,canvas:{width:C.width,height:C.height},textBoxes:it,background:Fe,caption:a(ke),captionLimit:Number(a(v)),viewContext:{mode:a(s),frameIndex:r()==="reel"?a(Vt):a(_),storyFrame:a(D),pollVote:a(U),measuredAt:new Date().toISOString()}},Mt=ip(Lt);d(ue,Mt.metrics,!0),i()(Lt)}function Xi(){a(P).trim()&&(d(T,[...a(T),a(P).trim()],!0),d(P,""))}async function Tn(){d(W,"Local share preview opened. Nothing was published.")}var lt=Pp();Li("keydown",hl,xe);var Qi=l(p(lt),2),An=p(Qi);let Fa;var mi=l(An,2);let Zi;var bi=l(mi,2);let wi;var ea=l(Qi,2),gr=p(ea),ta=l(p(gr)),Cn=p(ta);Cn.value=Cn.__value=375;var mr=l(Cn);mr.value=mr.__value=390;var jt=l(mr);jt.value=jt.__value=402;var yi=l(jt);yi.value=yi.__value=430,lr(ta);var Yr=l(gr,2),Ae=l(p(Yr)),Rs=l(Ae),ra=E(Rs),$a=l(Yr,2),Ba=p($a),Co=l($a,2),na=p(Co),Ha=l(ea,4),br=p(Ha);let Tt,ia;var Qn=p(br);{var aa=C=>{var X=ap();k(C,X)};ae(Qn,C=>{a(s)!=="design"&&C(aa)})}var Ps=l(Qn,2);{var Ro=C=>{var X=cp(),Fe=Ze(X),it=p(Fe),gt=E(it,!0),Te=l(it),Lt=l(Fe,2),Mt=p(Lt),Wt=E(Mt,!0),At=l(Mt),at=p(At),wr=E(at,!0),qt=l(Lt,2),yr=p(qt),Gt=E(yr,!0),Qr=l(yr,2),Pn=E(Qr,!0),Zr=l(qt,2);Pe(Zr,20,()=>Array(9),fa,(Ir,tr,rr)=>{var Zn=lp();cr(Zn,1,"grid-cell",null,{},{current:rr===0});var sa=p(Zn);{var Wa=m=>{var A=sp(),S=Ze(A);_c(S,()=>Dt({campaign:a(ot)[rr].campaignDraft,brandProfile:e.brandProfile,format:"infographic"}));var M=l(S),V=E(M,!0);B(()=>y(V,a(ot)[rr].gridLabel)),k(m,A)},g=m=>{var A=op();k(m,A)};ae(sa,m=>{a(ot)[rr]?m(Wa):m(g,-1)})}B(()=>{var m;return ft(Zn,"title",((m=a(ot)[rr])==null?void 0:m.title)||"Empty slot")}),k(Ir,Zn)}),B(Ir=>{var tr,rr;y(gt,a(Ke)),y(Wt,Ir),y(wr,a(ot).length),y(Gt,(tr=e.brandProfile)==null?void 0:tr.brandName),y(Pn,(rr=e.brandProfile)==null?void 0:rr.tagline)},[()=>{var Ir,tr;return((tr=(Ir=e.brandProfile)==null?void 0:Ir.logoText)==null?void 0:tr.slice(0,2))||a(Ke).slice(0,2)}]),N("click",Te,()=>d(W,"Profile options are a local simulation.")),k(C,X)},Po=C=>{var X=Sp(),Fe=Ze(X);{var it=S=>{var M=up(),V=p(M),J=E(V,!0),ee=l(V,2),de=p(ee),_e=E(de,!0),Ce=l(ee,2);B(Ct=>{y(J,Ct),y(_e,a(Ke))},[()=>a(Ke).slice(0,2)]),N("click",Ce,()=>d(W,"Post menu preview. Export to save an actual file.")),k(S,M)},gt=_t(()=>a(s)==="instagram"&&!["story","reel"].includes(r()));ae(Fe,S=>{a(gt)&&S(it)})}var Te=l(Fe,2);let Lt;var Mt=p(Te);_c(Mt,()=>a(er),!0),Xu(Mt,S=>d(pe,S),()=>a(pe));var Wt=l(Mt,2);{var At=S=>{var M=dp(),V=Ze(M),J=E(V),ee=l(V),de=l(ee);B(()=>{y(J,`${a(_)+1}/${a(zt).length??""}`),ee.disabled=a(_)===0,de.disabled=a(_)===a(zt).length-1}),N("click",ee,()=>ce(-1)),N("click",de,()=>ce(1)),k(S,M)};ae(Wt,S=>{a(s)==="instagram"&&r()==="carousel"&&S(At)})}var at=l(Wt,2);{var wr=S=>{var M=hp(),V=Ze(M),J=p(V);Pe(J,20,()=>[0,1,2,3],Si=>Si,(Si,ki)=>{var ti=fp(),Lo=p(ti);let Ga;B(()=>Ga=bc(Lo,"",Ga,{width:`${ki<a(D)?100:ki===a(D)?a(q)*20:0}%`})),k(Si,ti)});var ee=l(J,2),de=p(ee),_e=E(de,!0),Ce=l(de),Ct=E(Ce,!0),pt=l(Ce,2),en=E(pt,!0),Er=l(pt),tn=l(V,2),Kt=p(tn),ei=E(Kt,!0),rn=l(Kt,2),Sr=p(rn);let Nr;var Ii=E(Sr),mt=l(Sr);let nr;var xn=E(mt),qa=l(rn,2),Ei=E(qa,!0),Nn=l(tn,2),On=l(p(Nn)),Os=E(On,!0),Do=l(On);B(Si=>{var ki,ti;y(_e,Si),y(Ct,a(Ke)),ft(pt,"aria-label",a(Q)?"Pause story":"Play story"),y(en,a(Q)?"Ⅱ":"▶"),y(ei,(ti=(ki=e.campaign)==null?void 0:ki.story)==null?void 0:ti.interactiveStickerPrompt),Nr=cr(Sr,1,"",null,Nr,{voted:a(U)==="A"}),y(Ii,`Investigate ${a(U)?a(U)==="A"?"✓ 100%":"0%":""}`),nr=cr(mt,1,"",null,nr,{voted:a(U)==="B"}),y(xn,`Read sources ${a(U)?a(U)==="B"?"✓ 100%":"0%":""}`),y(Ei,a(U)?"Your one local vote · simulated result":"Try a local poll vote"),ft(On,"aria-pressed",a(b)),y(Os,a(b)?"♥":"♡")},[()=>a(Ke).slice(0,2)]),N("click",pt,()=>d(Q,!a(Q))),N("click",Er,()=>Sn("design")),N("click",Sr,()=>d(U,"A")),N("click",mt,()=>d(U,"B")),N("click",On,()=>d(b,!a(b))),N("click",Do,Tn),k(S,M)};ae(at,S=>{a(s)==="instagram"&&r()==="story"&&S(wr)})}var qt=l(at,2);{var yr=S=>{var M=pp(),V=l(Ze(M),2),J=p(V),ee=p(J),de=l(ee),_e=E(de,!0),Ce=l(J),Ct=l(p(Ce)),pt=E(Ct,!0),en=l(Ce),Er=l(en),tn=l(Er);let Kt;var ei=l(V,2),rn=p(ei),Sr=E(rn,!0),Nr=l(rn),Ii=E(Nr,!0),mt=l(Nr,2),nr=E(mt);B(xn=>{ft(J,"aria-pressed",a(b)),y(ee,a(b)?"♥":"♡"),y(_e,a(b)?1:0),y(pt,a(T).length),Kt=cr(tn,1,"vinyl",null,Kt,{spinning:a(Z)}),y(Sr,a(Ke)),ft(Nr,"aria-pressed",a(z)),y(Ii,a(z)?"Following":"+ Follow"),y(nr,`${xn??""}${a(ke).length>a(v)?"…":""}`)},[()=>a(ke).slice(0,a(v))]),N("click",J,()=>d(b,!a(b))),N("click",Ce,()=>d(x,!a(x))),N("click",en,Tn),N("click",Er,()=>d(W,"Reel options preview; nothing is published.")),N("click",Nr,()=>d(z,!a(z))),k(S,M)};ae(qt,S=>{a(s)==="instagram"&&r()==="reel"&&S(yr)})}var Gt=l(qt,2);{var Qr=S=>{var M=_p(),V=l(p(M),4);{var J=ee=>{var de=vp();k(ee,de)};ae(V,ee=>{r()==="reel"&&ee(J)})}k(S,M)},Pn=_t(()=>a(u)&&["story","reel"].includes(r()));ae(Gt,S=>{a(Pn)&&S(Qr)})}var Zr=l(Gt,2);{var Ir=S=>{var M=gp();k(S,M)},tr=_t(()=>a(b)&&a(W).includes("Liked"));ae(Zr,S=>{a(tr)&&S(Ir)})}var rr=l(Te,2);{var Zn=S=>{var M=mp(),V=p(M),J=E(V,!0),ee=l(V),de=l(ee),_e=E(de);B(Ce=>{y(J,a(Z)?"Pause reel":"Play reel"),y(_e,`BEAT ${a(Vt)+1} · ${Ce??""} / 30s`)},[()=>Math.floor(a(F))]),N("click",V,()=>d(Z,!a(Z))),We(ee,()=>a(F),Ce=>d(F,Ce)),k(S,M)};ae(rr,S=>{r()==="reel"&&S(Zn)})}var sa=l(rr,2);{var Wa=S=>{var M=Ip(),V=Ze(M),J=p(V),ee=E(J,!0),de=l(J),_e=l(de),Ce=l(_e);{var Ct=mt=>{var nr=wp();Pe(nr,21,()=>a(zt),fa,(xn,qa,Ei)=>{var Nn=bp();ft(Nn,"aria-label",`Go to slide ${Ei+1}`);let On;B(()=>On=cr(Nn,1,"",null,On,{active:a(_)===Ei})),N("click",Nn,()=>d(_,Ei,!0)),k(xn,Nn)}),k(mt,nr)};ae(Ce,mt=>{r()==="carousel"&&mt(Ct)})}var pt=l(Ce),en=E(pt,!0),Er=l(V,2),tn=E(Er),Kt=l(Er,2),ei=p(Kt),rn=E(ei,!0),Sr=l(ei),Nr=l(Sr);{var Ii=mt=>{var nr=yp(),xn=E(nr,!0);B(()=>y(xn,a(I)?"less":"… more")),N("click",nr,()=>d(I,!a(I))),k(mt,nr)};ae(Nr,mt=>{a(ke).length>a(v)&&mt(Ii)})}B(mt=>{ft(J,"aria-pressed",a(b)),y(ee,a(b)?"♥":"♡"),ft(pt,"aria-pressed",a(w)),y(en,a(w)?"▣":"♧"),y(tn,`${a(b)?1:0} local likes · ${a(w)?"Saved in preview":"Preview only"}`),y(rn,a(Ke)),y(Sr,` ${mt??""}`)},[()=>a(I)?a(ke):a(ke).slice(0,a(v))]),N("click",J,()=>d(b,!a(b))),N("click",de,()=>d(x,!a(x))),N("click",_e,Tn),N("click",pt,()=>d(w,!a(w))),k(S,M)},g=_t(()=>a(s)==="instagram"&&!["story","reel"].includes(r()));ae(sa,S=>{a(g)&&S(Wa)})}var m=l(sa,2);{var A=S=>{var M=Ep(),V=p(M),J=l(p(V)),ee=l(V,2),de=p(ee),_e=E(de,!0),Ce=l(de,2,!0);B((Ct,pt)=>{y(_e,Ct),y(Ce,pt)},[()=>a(ke).slice(0,a(v)),()=>a(ke).slice(a(v))]),We(J,()=>a(v),Ct=>d(v,Ct)),k(S,M)};ae(m,S=>{a(f)&&S(A)})}B(S=>Lt=cr(Te,1,"asset-stage",null,Lt,{vertical:S}),[()=>["story","reel"].includes(r())]),N("pointerdown",Te,S=>L=S.clientX),N("pointerup",Te,S=>{Math.abs(S.clientX-L)>40&&ce(S.clientX<L?1:-1)}),N("dblclick",Te,()=>{d(b,!0),d(W,"Liked in this simulation")}),k(C,X)};ae(Ps,C=>{a(s)==="grid"?C(Ro):C(Po,-1)})}var xs=l(Ps,2);{var Va=C=>{var X=Tp(),Fe=l(p(X));Pe(Fe,17,()=>a(T),fa,(Te,Lt)=>{var Mt=kp(),Wt=E(Mt,!0);B(()=>y(Wt,a(Lt))),k(Te,Mt)});var it=l(Fe,2),gt=p(it);Li("submit",it,Te=>{Te.preventDefault(),Xi()}),We(gt,()=>a(P),Te=>d(P,Te)),k(C,X)};ae(xs,C=>{a(x)&&C(Va)})}var Rn=l(xs,2);{var Ns=C=>{var X=Ap(),Fe=E(X,!0);B(()=>y(Fe,a(W))),k(C,X)};ae(Rn,C=>{a(W)&&C(Ns)})}var xo=l(Ha,2),Xr=p(xo),No=l(p(Xr)),Oo=l(Xr,2);{var za=C=>{var X=Cp(),Fe=Ze(X),it=p(Fe),gt=p(it),Te=E(gt,!0),Lt=l(it),Mt=p(Lt),Wt=E(Mt,!0),At=l(Lt),at=p(At),wr=E(at),qt=l(at),yr=l(At),Gt=p(yr),Qr=E(Gt,!0),Pn=l(Gt),Zr=l(yr),Ir=p(Zr),tr=E(Ir,!0);B(()=>{y(Te,a(ue).occludedElementsCount),y(Wt,a(ue).overflowElementsCount),y(wr,`${a(ue).contrastRatio??"Unmeasured"??""}${a(ue).contrastRatio!==null?":1":""}`),y(qt,` minimum text/background contrast${a(ue).unmeasuredColorCount?` · ${a(ue).unmeasuredColorCount} unmeasured`:""}`),y(Qr,a(ue).expectedAspectRatio),y(Pn,` target ratio · ${a(ue).aspectRatioDeviation<=.01?"matched":"check dimensions"}`),y(tr,a(ue).firstLookCharacters)}),k(C,X)},ja=C=>{var X=Rp();k(C,X)};ae(Oo,C=>{a(ue)?C(za):C(ja,-1)})}B(C=>{Fa=cr(An,1,"",null,Fa,{active:a(s)==="design"}),Zi=cr(mi,1,"",null,Zi,{active:a(s)==="instagram"}),wi=cr(bi,1,"",null,wi,{active:a(s)==="grid"}),y(ra,`${a(o)??""}%`),Tt=cr(br,1,"phone",null,Tt,{raw:a(s)==="design"}),ia=bc(br,"",ia,{width:`${a(c)??""}px`,height:C,zoom:a(o)/100})},[()=>a(s)==="design"?"auto":`${Math.round(a(c)*874/402)}px`]),N("click",An,()=>Sn("design")),N("click",mi,()=>Sn("instagram")),N("click",bi,()=>Sn("grid")),$r(ta,()=>a(c),C=>d(c,C)),We(Ae,()=>a(o),C=>d(o,C)),ao(Ba,()=>a(u),C=>d(u,C)),ao(na,()=>a(f),C=>d(f,C)),N("click",No,kn),k(t,lt),Io()}Vl(["click","pointerdown","pointerup","dblclick"]);var Np=R('<button class="secondary svelte-jvfx7i"> </button>'),Op=R("<li><!></li>"),Dp=R('<ul class="svelte-jvfx7i"></ul>'),Lp=R('<section class="source-review-summary svelte-jvfx7i" aria-label="Generation prerequisites" aria-live="polite"><strong> </strong> <p class="svelte-jvfx7i"> </p> <!></section>');function Ic(t,e){yo(e,!0);var r=Lp(),n=p(r),i=E(n,!0),s=l(n,2),o=E(s),c=l(s,2);{var u=f=>{var v=Dp();Pe(v,23,()=>e.summary.blockers,(_,b)=>`${_.claimId||"review"}:${b}`,(_,b)=>{var w=Op(),I=p(w);{var P=x=>{var W=Np(),U=E(W,!0);B(()=>y(U,a(b).message)),N("click",W,()=>e.onclaim(a(b).claimId)),k(x,W)},T=x=>{var W=Ah();B(()=>y(W,a(b).message)),k(x,W)};ae(I,x=>{a(b).claimId?x(P):x(T,-1)})}k(_,w)}),k(f,v)};ae(c,f=>{e.summary.blockers.length&&f(u)})}B(()=>{y(i,e.summary.ready?"Sources ready for generation":"Source review required"),y(o,`${e.summary.approved??""} of ${e.summary.total??""} claims approved · ${e.summary.excluded??""} excluded. Approval records editorial review, not verified factual or clinical accuracy.`)}),k(t,r),Io()}Vl(["click"]);const Ja=t=>JSON.stringify(t);function Mp(t=[],e=!1){var s,o,c,u;const r=[],n=t.filter(f=>f.status==="approved");n.length||r.push({message:"Approve at least one sourced claim. Unreviewed and rejected claims are excluded.",claimId:(s=t[0])==null?void 0:s.id});const i=new Set;for(const f of n){let v;try{v=new URL(f.sourceUrl)}catch{}const _=[];(!f.id||i.has(f.id))&&_.push("use a unique claim ID"),i.add(f.id),(!((o=f.text)!=null&&o.trim())||f.text.length>2e3)&&_.push("add claim text of at most 2,000 characters"),(!v||v.protocol!=="https:"||v.username||v.password)&&_.push("add an HTTPS source URL without credentials"),["financial","cultural","clinical","general"].includes(f.kind)||_.push("choose a classification"),f.kind==="clinical"&&(!((c=f.clinicalReview)!=null&&c.reviewerId)||!Number.isFinite(Date.parse((u=f.clinicalReview)==null?void 0:u.reviewedAt)))&&_.push("save an authorized clinical source review"),_.length&&r.push({claimId:f.id,message:_.join("; ")+"."})}return t.length>50&&r.push({message:"Keep at most 50 source claims."}),e&&r.push({message:"Save source review changes before generating."}),{approved:n.length,total:t.length,excluded:t.length-n.length,blockers:r,ready:r.length===0}}const Up=()=>{};var Ec={};/**
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
 */const Zu=function(t){const e=[];let r=0;for(let n=0;n<t.length;n++){let i=t.charCodeAt(n);i<128?e[r++]=i:i<2048?(e[r++]=i>>6|192,e[r++]=i&63|128):(i&64512)===55296&&n+1<t.length&&(t.charCodeAt(n+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++n)&1023),e[r++]=i>>18|240,e[r++]=i>>12&63|128,e[r++]=i>>6&63|128,e[r++]=i&63|128):(e[r++]=i>>12|224,e[r++]=i>>6&63|128,e[r++]=i&63|128)}return e},Fp=function(t){const e=[];let r=0,n=0;for(;r<t.length;){const i=t[r++];if(i<128)e[n++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[r++];e[n++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[r++],o=t[r++],c=t[r++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const s=t[r++],o=t[r++];e[n++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},ed={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const r=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,c=o?t[i+1]:0,u=i+2<t.length,f=u?t[i+2]:0,v=s>>2,_=(s&3)<<4|c>>4;let b=(c&15)<<2|f>>6,w=f&63;u||(w=64,o||(b=64)),n.push(r[v],r[_],r[b],r[w])}return n.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Zu(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Fp(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const r=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let i=0;i<t.length;){const s=r[t.charAt(i++)],c=i<t.length?r[t.charAt(i)]:0;++i;const f=i<t.length?r[t.charAt(i)]:64;++i;const _=i<t.length?r[t.charAt(i)]:64;if(++i,s==null||c==null||f==null||_==null)throw new $p;const b=s<<2|c>>4;if(n.push(b),f!==64){const w=c<<4&240|f>>2;if(n.push(w),_!==64){const I=f<<6&192|_;n.push(I)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class $p extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Bp=function(t){const e=Zu(t);return ed.encodeByteArray(e,!0)},td=function(t){return Bp(t).replace(/\./g,"")},rd=function(t){try{return ed.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Hp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Vp=()=>Hp().__FIREBASE_DEFAULTS__,zp=()=>{if(typeof process>"u"||typeof Ec>"u")return;const t=Ec.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},jp=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&rd(t[1]);return e&&JSON.parse(e)},zl=()=>{try{return Up()||Vp()||zp()||jp()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Wp=t=>{var e,r;return(r=(e=zl())==null?void 0:e.emulatorHosts)==null?void 0:r[t]},nd=()=>{var t;return(t=zl())==null?void 0:t.config},id=t=>{var e;return(e=zl())==null?void 0:e[`_${t}`]};/**
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
 */class qp{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,r)=>{this.resolve=e,this.reject=r})}wrapCallback(e){return(r,n)=>{r?this.reject(r):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(r):e(r,n))}}}/**
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
 */function Ht(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Gp(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ht())}function Kp(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Jp(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Yp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Xp(){const t=Ht();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Qp(){try{return typeof indexedDB=="object"}catch{return!1}}function Zp(){return new Promise((t,e)=>{try{let r=!0;const n="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(n);i.onsuccess=()=>{i.result.close(),r||self.indexedDB.deleteDatabase(n),t(!0)},i.onupgradeneeded=()=>{r=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(r){e(r)}})}/**
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
 */const ev="FirebaseError";class _i extends Error{constructor(e,r,n){super(r),this.code=e,this.customData=n,this.name=ev,Object.setPrototypeOf(this,_i.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Es.prototype.create)}}class Es{constructor(e,r,n){this.service=e,this.serviceName=r,this.errors=n}create(e,...r){const n=r[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?tv(s,n):"Error",c=`${this.serviceName}: ${o} (${i}).`;return new _i(i,c,n)}}function tv(t,e){try{let r=0,n="";for(;r<t.length;){const i=t.indexOf("{$",r);if(i===-1){n+=t.substring(r);break}const s=t.indexOf("}",i+2);if(s===-1){n+=t.substring(r);break}const o=t.substring(i+2,s),c=e[o];n+=t.substring(r,i)+(c!=null?String(c):`<${o}?>`),r=s+1}return n}catch{return t}}function rv(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Pa(t,e){if(t===e)return!0;const r=Object.keys(t),n=Object.keys(e);for(const i of r){if(!n.includes(i))return!1;const s=t[i],o=e[i];if(Sc(s)&&Sc(o)){if(!Pa(s,o))return!1}else if(s!==o)return!1}for(const i of n)if(!r.includes(i))return!1;return!0}function Sc(t){return t!==null&&typeof t=="object"}/**
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
 */function Ss(t){const e=[];for(const[r,n]of Object.entries(t))Array.isArray(n)?n.forEach(i=>{e.push(encodeURIComponent(r)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(r)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function nv(t,e){const r=new iv(t,e);return r.subscribe.bind(r)}class iv{constructor(e,r){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=r,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(r=>{r.next(e)})}error(e){this.forEachObserver(r=>{r.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,r,n){let i;if(e===void 0&&r===void 0&&n===void 0)throw new Error("Missing Observer.");av(e,["next","error","complete"])?i=e:i={next:e,error:r,complete:n},i.next===void 0&&(i.next=Qo),i.error===void 0&&(i.error=Qo),i.complete===void 0&&(i.complete=Qo);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let r=0;r<this.observers.length;r++)this.sendOne(r,e)}sendOne(e,r){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{r(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function av(t,e){if(typeof t!="object"||t===null)return!1;for(const r of e)if(r in t&&typeof t[r]=="function")return!0;return!1}function Qo(){}/**
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
 */function gi(t){return t&&t._delegate?t._delegate:t}/**
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
 */function jl(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function sv(t){return(await fetch(t,{credentials:"include"})).ok}class xa{constructor(e,r,n){this.name=e,this.instanceFactory=r,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Oi="[DEFAULT]";/**
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
 */class ov{constructor(e,r){this.name=e,this.container=r,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const r=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(r)){const n=new qp;if(this.instancesDeferred.set(r,n),this.isInitialized(r)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:r});i&&n.resolve(i)}catch{}}return this.instancesDeferred.get(r).promise}getImmediate(e){const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(n)return null;throw i}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(cv(e))try{this.getOrInitializeService({instanceIdentifier:Oi})}catch{}for(const[r,n]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(r);try{const s=this.getOrInitializeService({instanceIdentifier:i});n.resolve(s)}catch{}}}}clearInstance(e=Oi){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(r=>"INTERNAL"in r).map(r=>r.INTERNAL.delete()),...e.filter(r=>"_delete"in r).map(r=>r._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Oi){return this.instances.has(e)}getOptions(e=Oi){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:r={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:n,options:r});for(const[s,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);n===c&&o.resolve(i)}return i}onInit(e,r){const n=this.normalizeInstanceIdentifier(r),i=this.onInitCallbacks.get(n)??new Set;i.add(e),this.onInitCallbacks.set(n,i);const s=this.instances.get(n);return s&&e(s,n),()=>{i.delete(e)}}invokeOnInitCallbacks(e,r){const n=this.onInitCallbacks.get(r);if(n)for(const i of n)try{i(e,r)}catch{}}getOrInitializeService({instanceIdentifier:e,options:r={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:lv(e),options:r}),this.instances.set(e,n),this.instancesOptions.set(e,r),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=Oi){return this.component?this.component.multipleInstances?e:Oi:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function lv(t){return t===Oi?void 0:t}function cv(t){return t.instantiationMode==="EAGER"}/**
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
 */class uv{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const r=this.getProvider(e.name);if(r.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);r.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const r=new ov(e,this);return this.providers.set(e,r),r}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var Ue;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Ue||(Ue={}));const dv={debug:Ue.DEBUG,verbose:Ue.VERBOSE,info:Ue.INFO,warn:Ue.WARN,error:Ue.ERROR,silent:Ue.SILENT},fv=Ue.INFO,hv={[Ue.DEBUG]:"log",[Ue.VERBOSE]:"log",[Ue.INFO]:"info",[Ue.WARN]:"warn",[Ue.ERROR]:"error"},pv=(t,e,...r)=>{if(e<t.logLevel)return;const n=new Date().toISOString(),i=hv[e];if(i)console[i](`[${n}]  ${t.name}:`,...r);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ad{constructor(e){this.name=e,this._logLevel=fv,this._logHandler=pv,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Ue))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?dv[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Ue.DEBUG,...e),this._logHandler(this,Ue.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Ue.VERBOSE,...e),this._logHandler(this,Ue.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Ue.INFO,...e),this._logHandler(this,Ue.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Ue.WARN,...e),this._logHandler(this,Ue.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Ue.ERROR,...e),this._logHandler(this,Ue.ERROR,...e)}}const vv=(t,e)=>e.some(r=>t instanceof r);let kc,Tc;function _v(){return kc||(kc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function gv(){return Tc||(Tc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const sd=new WeakMap,Il=new WeakMap,od=new WeakMap,Zo=new WeakMap,Wl=new WeakMap;function mv(t){const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{r(hi(t.result)),i()},o=()=>{n(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(r=>{r instanceof IDBCursor&&sd.set(r,t)}).catch(()=>{}),Wl.set(e,t),e}function bv(t){if(Il.has(t))return;const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{r(),i()},o=()=>{n(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});Il.set(t,e)}let El={get(t,e,r){if(t instanceof IDBTransaction){if(e==="done")return Il.get(t);if(e==="objectStoreNames")return t.objectStoreNames||od.get(t);if(e==="store")return r.objectStoreNames[1]?void 0:r.objectStore(r.objectStoreNames[0])}return hi(t[e])},set(t,e,r){return t[e]=r,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function wv(t){El=t(El)}function yv(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...r){const n=t.call(el(this),e,...r);return od.set(n,e.sort?e.sort():[e]),hi(n)}:gv().includes(t)?function(...e){return t.apply(el(this),e),hi(sd.get(this))}:function(...e){return hi(t.apply(el(this),e))}}function Iv(t){return typeof t=="function"?yv(t):(t instanceof IDBTransaction&&bv(t),vv(t,_v())?new Proxy(t,El):t)}function hi(t){if(t instanceof IDBRequest)return mv(t);if(Zo.has(t))return Zo.get(t);const e=Iv(t);return e!==t&&(Zo.set(t,e),Wl.set(e,t)),e}const el=t=>Wl.get(t);function Ev(t,e,{blocked:r,upgrade:n,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),c=hi(o);return n&&o.addEventListener("upgradeneeded",u=>{n(hi(o.result),u.oldVersion,u.newVersion,hi(o.transaction),u)}),r&&o.addEventListener("blocked",u=>r(u.oldVersion,u.newVersion,u)),c.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",f=>i(f.oldVersion,f.newVersion,f))}).catch(()=>{}),c}const Sv=["get","getKey","getAll","getAllKeys","count"],kv=["put","add","delete","clear"],tl=new Map;function Ac(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(tl.get(e))return tl.get(e);const r=e.replace(/FromIndex$/,""),n=e!==r,i=kv.includes(r);if(!(r in(n?IDBIndex:IDBObjectStore).prototype)||!(i||Sv.includes(r)))return;const s=async function(o,...c){const u=this.transaction(o,i?"readwrite":"readonly");let f=u.store;return n&&(f=f.index(c.shift())),(await Promise.all([f[r](...c),i&&u.done]))[0]};return tl.set(e,s),s}wv(t=>({...t,get:(e,r,n)=>Ac(e,r)||t.get(e,r,n),has:(e,r)=>!!Ac(e,r)||t.has(e,r)}));/**
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
 */class Tv{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(r=>{if(Av(r)){const n=r.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(r=>r).join(" ")}}function Av(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Sl="@firebase/app",Cc="0.16.2";/**
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
 */const Jn=new ad("@firebase/app"),Cv="@firebase/app-compat",Rv="@firebase/analytics-compat",Pv="@firebase/analytics",xv="@firebase/app-check-compat",Nv="@firebase/app-check",Ov="@firebase/auth",Dv="@firebase/auth-compat",Lv="@firebase/database",Mv="@firebase/data-connect",Uv="@firebase/database-compat",Fv="@firebase/functions",$v="@firebase/functions-compat",Bv="@firebase/installations",Hv="@firebase/installations-compat",Vv="@firebase/messaging",zv="@firebase/messaging-compat",jv="@firebase/performance",Wv="@firebase/performance-compat",qv="@firebase/remote-config",Gv="@firebase/remote-config-compat",Kv="@firebase/storage",Jv="@firebase/storage-compat",Yv="@firebase/firestore",Xv="@firebase/ai",Qv="@firebase/firestore-compat",Zv="firebase",e_="12.19.0";/**
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
 */const kl="[DEFAULT]",t_={[Sl]:"fire-core",[Cv]:"fire-core-compat",[Pv]:"fire-analytics",[Rv]:"fire-analytics-compat",[Nv]:"fire-app-check",[xv]:"fire-app-check-compat",[Ov]:"fire-auth",[Dv]:"fire-auth-compat",[Lv]:"fire-rtdb",[Mv]:"fire-data-connect",[Uv]:"fire-rtdb-compat",[Fv]:"fire-fn",[$v]:"fire-fn-compat",[Bv]:"fire-iid",[Hv]:"fire-iid-compat",[Vv]:"fire-fcm",[zv]:"fire-fcm-compat",[jv]:"fire-perf",[Wv]:"fire-perf-compat",[qv]:"fire-rc",[Gv]:"fire-rc-compat",[Kv]:"fire-gcs",[Jv]:"fire-gcs-compat",[Yv]:"fire-fst",[Qv]:"fire-fst-compat",[Xv]:"fire-vertex","fire-js":"fire-js",[Zv]:"fire-js-all"};/**
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
 */const so=new Map,r_=new Map,Tl=new Map;function Rc(t,e){try{t.container.addComponent(e)}catch(r){Jn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,r)}}function ds(t){const e=t.name;if(Tl.has(e))return Jn.debug(`There were multiple attempts to register component ${e}.`),!1;Tl.set(e,t);for(const r of so.values())Rc(r,t);for(const r of r_.values())Rc(r,t);return!0}function ld(t,e){const r=t.container.getProvider("heartbeat").getImmediate({optional:!0});return r&&r.triggerHeartbeat(),t.container.getProvider(e)}function _n(t){return t==null?!1:t.settings!==void 0}/**
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
 */const n_={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},jn=new Es("app","Firebase",n_);/**
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
 */class i_{constructor(e,r,n){this._isDeleted=!1,this._options={...e},this._config={...r},this._name=r.name,this._automaticDataCollectionEnabled=r.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new xa("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw jn.create("app-deleted",{appName:this._name})}}/**
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
 */const ks=e_;function cd(t,e={}){let r=t;typeof e!="object"&&(e={name:e});const n={name:kl,automaticDataCollectionEnabled:!0,...e},i=n.name;if(typeof i!="string"||!i)throw jn.create("bad-app-name",{appName:String(i)});if(r||(r=nd()),!r)throw jn.create("no-options");const s=so.get(i);if(s)if(Pa(r,s.options)){if(Pa(n,s.config))return s;throw jn.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(s.config),newValue:JSON.stringify(n)})}else throw jn.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(s.options),newValue:JSON.stringify(r)});const o=new uv(i);for(const u of Tl.values())o.addComponent(u);const c=new i_(r,n,o);return so.set(i,c),c}function a_(t=kl){const e=so.get(t);if(!e&&t===kl&&nd())return cd();if(!e)throw jn.create("no-app",{appName:t});return e}function pa(t,e,r){let n=t_[t]??t;r&&(n+=`-${r}`);const i=n.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${n}" with version "${e}":`];i&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Jn.warn(o.join(" "));return}ds(new xa(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
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
 */const s_="firebase-heartbeat-database",o_=1,fs="firebase-heartbeat-store";let rl=null;function ud(){return rl||(rl=Ev(s_,o_,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(fs)}catch(r){console.warn(r)}}}}).catch(t=>{throw jn.create("idb-open",{originalErrorMessage:t.message})})),rl}async function l_(t){try{const r=(await ud()).transaction(fs),n=await r.objectStore(fs).get(dd(t));return await r.done,n}catch(e){if(e instanceof _i)Jn.warn(e.message);else{const r=jn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Jn.warn(r.message)}}}async function Pc(t,e){try{const n=(await ud()).transaction(fs,"readwrite");await n.objectStore(fs).put(e,dd(t)),await n.done}catch(r){if(r instanceof _i)Jn.warn(r.message);else{const n=jn.create("idb-set",{originalErrorMessage:r==null?void 0:r.message});Jn.warn(n.message)}}}function dd(t){return`${t.name}!${t.options.appId}`}/**
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
 */const c_=1024,u_=30;class d_{constructor(e){this.container=e,this._heartbeatsCache=null;const r=this.container.getProvider("app").getImmediate();this._storage=new h_(r),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,r;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=xc();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((r=this._heartbeatsCache)==null?void 0:r.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>u_){const o=p_(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){Jn.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const r=xc(),{heartbeatsToSend:n,unsentEntries:i}=f_(this._heartbeatsCache.heartbeats),s=td(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=r,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(r){return Jn.warn(r),""}}}function xc(){return new Date().toISOString().substring(0,10)}function f_(t,e=c_){const r=[];let n=t.slice();for(const i of t){const s=r.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),Nc(r)>e){s.dates.pop();break}}else if(r.push({agent:i.agent,dates:[i.date]}),Nc(r)>e){r.pop();break}n=n.slice(1)}return{heartbeatsToSend:r,unsentEntries:n}}class h_{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Qp()?Zp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const r=await l_(this.app);return r!=null&&r.heartbeats?r:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Pc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Pc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function Nc(t){return td(JSON.stringify({version:2,heartbeats:t})).length}function p_(t){if(t.length===0)return-1;let e=0,r=t[0].date;for(let n=1;n<t.length;n++)t[n].date<r&&(r=t[n].date,e=n);return e}/**
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
 */function v_(t){ds(new xa("platform-logger",e=>new Tv(e),"PRIVATE")),ds(new xa("heartbeat",e=>new d_(e),"PRIVATE")),pa(Sl,Cc,t),pa(Sl,Cc,"esm2020"),pa("fire-js","")}/**
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
 */v_("");var __="firebase",g_="12.19.0";/**
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
 */pa(__,g_,"app");function fd(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const m_=fd,hd=new Es("auth","Firebase",fd());/**
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
 */const oo=new ad("@firebase/auth");function Ks(t,...e){oo.logLevel<=Ue.WARN&&oo.warn(`Auth (${ks}): ${t}`,...e)}function Js(t,...e){oo.logLevel<=Ue.ERROR&&oo.error(`Auth (${ks}): ${t}`,...e)}/**
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
 */function En(t,...e){throw ql(t,...e)}function Kr(t,...e){return ql(t,...e)}function So(t,e,r){const n={...m_(),[e]:r};return new Es("auth","Firebase",n).create(e,{appName:t.name})}function Gi(t){return So(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function b_(t,e,r){const n=r;if(!(e instanceof n))throw n.name!==e.constructor.name&&En(t,"argument-error"),So(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function ql(t,...e){if(typeof t!="string"){const r=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=t.name),t._errorFactory.create(r,...n)}return hd.create(t,...e)}function te(t,e,...r){if(!t)throw ql(e,...r)}function Wn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Js(e),new Error(e)}function Yn(t,e){t||Wn(e)}/**
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
 */function Al(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function w_(){return Oc()==="http:"||Oc()==="https:"}function Oc(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function y_(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(w_()||Jp()||"connection"in navigator)?navigator.onLine:!0}function I_(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class Ts{constructor(e,r){this.shortDelay=e,this.longDelay=r,Yn(r>e,"Short delay should be less than long delay!"),this.isMobile=Gp()||Yp()}get(){return y_()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Gl(t,e){Yn(t.emulator,"Emulator should always be set here");const{url:r}=t.emulator;return e?`${r}${e.startsWith("/")?e.slice(1):e}`:r}/**
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
 */class pd{static initialize(e,r,n){this.fetchImpl=e,r&&(this.headersImpl=r),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Wn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Wn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Wn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const E_={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const S_=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],k_=new Ts(3e4,6e4);function Kl(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function Ua(t,e,r,n,i={}){return vd(t,i,async()=>{let s={},o={};n&&(e==="GET"?o=n:s={body:JSON.stringify(n)});const c=Ss({...o,key:t.config.apiKey}).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const f={method:e,headers:u,...s};return Kp()||(f.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&jl(t.emulatorConfig.host)&&(f.credentials="include"),pd.fetch()(await _d(t,t.config.apiHost,r,c),f)})}async function vd(t,e,r){t._canInitEmulator=!1;const n={...E_,...e};try{const i=new A_(t),s=await Promise.race([r(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Hs(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const c=s.ok?o.errorMessage:o.error.message,[u,f]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Hs(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Hs(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw Hs(t,"user-disabled",o);const v=n[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(f)throw So(t,v,f);En(t,v)}}catch(i){if(i instanceof _i)throw i;En(t,"network-request-failed",{message:String(i)})}}async function T_(t,e,r,n,i={}){const s=await Ua(t,e,r,n,i);return"mfaPendingCredential"in s&&En(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function _d(t,e,r,n){const i=`${e}${r}?${n}`,s=t,o=s.config.emulator?Gl(t.config,i):`${t.config.apiScheme}://${i}`;return S_.includes(r)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class A_{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((r,n)=>{this.timer=setTimeout(()=>n(Kr(this.auth,"network-request-failed")),k_.get())})}}function Hs(t,e,r){const n={appName:t.name};r.email&&(n.email=r.email),r.phoneNumber&&(n.phoneNumber=r.phoneNumber);const i=Kr(t,e,n);return i.customData._tokenResponse=r,i}/**
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
 */async function C_(t,e){return Ua(t,"POST","/v1/accounts:delete",e)}async function lo(t,e){return Ua(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function ss(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function R_(t,e=!1){const r=gi(t),n=await r.getIdToken(e),i=Jl(n);te(i&&i.exp&&i.auth_time&&i.iat,r.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:n,authTime:ss(nl(i.auth_time)),issuedAtTime:ss(nl(i.iat)),expirationTime:ss(nl(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function nl(t){return Number(t)*1e3}function Jl(t){const[e,r,n]=t.split(".");if(e===void 0||r===void 0||n===void 0)return Js("JWT malformed, contained fewer than 3 sections"),null;try{const i=rd(r);return i?JSON.parse(i):(Js("Failed to decode base64 JWT payload"),null)}catch(i){return Js("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Dc(t){const e=Jl(t);return te(e,"internal-error"),te(typeof e.exp<"u","internal-error"),te(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function hs(t,e,r=!1){if(r)return e;try{return await e}catch(n){throw n instanceof _i&&P_(n)&&t.auth.currentUser===t&&await t.auth.signOut(),n}}function P_({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class x_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const r=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},r)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Cl{constructor(e,r){this.createdAt=e,this.lastLoginAt=r,this._initializeTime()}_initializeTime(){this.lastSignInTime=ss(this.lastLoginAt),this.creationTime=ss(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function co(t){var _;const e=t.auth,r=await t.getIdToken(),n=await hs(t,lo(e,{idToken:r}));te(n==null?void 0:n.users.length,e,"internal-error");const i=n.users[0];t._notifyReloadListener(i);const s=(_=i.providerUserInfo)!=null&&_.length?gd(i.providerUserInfo):[],o=O_(t.providerData,s),c=t.isAnonymous,u=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),f=c?u:!1,v={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new Cl(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(t,v)}async function N_(t){const e=gi(t);await co(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function O_(t,e){return[...t.filter(n=>!e.some(i=>i.providerId===n.providerId)),...e]}function gd(t){return t.map(({providerId:e,...r})=>({providerId:e,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}))}/**
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
 */async function D_(t,e){const r=await vd(t,{},async()=>{const n=Ss({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await _d(t,i,"/v1/token",`key=${s}`),c=await t._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:n};return t.emulatorConfig&&jl(t.emulatorConfig.host)&&(u.credentials="include"),pd.fetch()(o,u)});return{accessToken:r.access_token,expiresIn:r.expires_in,refreshToken:r.refresh_token}}async function L_(t,e){return Ua(t,"POST","/v2/accounts:revokeToken",Kl(t,e))}/**
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
 */class va{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){te(e.idToken,"internal-error"),te(typeof e.idToken<"u","internal-error"),te(typeof e.refreshToken<"u","internal-error");const r="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Dc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,r)}updateFromIdToken(e){te(e.length!==0,"internal-error");const r=Dc(e);this.updateTokensAndExpiration(e,null,r)}async getToken(e,r=!1){return!r&&this.accessToken&&!this.isExpired?this.accessToken:(te(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,r){const{accessToken:n,refreshToken:i,expiresIn:s}=await D_(e,r);this.updateTokensAndExpiration(n,i,Number(s))}updateTokensAndExpiration(e,r,n){this.refreshToken=r||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,r){const{refreshToken:n,accessToken:i,expirationTime:s}=r,o=new va;return n&&(te(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),i&&(te(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(te(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new va,this.toJSON())}_performRefresh(){return Wn("not implemented")}}/**
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
 */function ii(t,e){te(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Wr{constructor({uid:e,auth:r,stsTokenManager:n,...i}){this.providerId="firebase",this.proactiveRefresh=new x_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=r,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Cl(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const r=await hs(this,this.stsTokenManager.getToken(this.auth,e));return te(r,this.auth,"internal-error"),this.accessToken!==r&&(this.accessToken=r,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),r}getIdTokenResult(e){return R_(this,e)}reload(){return N_(this)}_assign(e){this!==e&&(te(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(r=>({...r})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const r=new Wr({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return r.metadata._copy(this.metadata),r}_onReload(e){te(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,r=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),r&&await co(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(_n(this.auth.app))return Promise.reject(Gi(this.auth));const e=await this.getIdToken();return await hs(this,C_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,r){const n=r.displayName??void 0,i=r.email??void 0,s=r.phoneNumber??void 0,o=r.photoURL??void 0,c=r.tenantId??void 0,u=r._redirectEventId??void 0,f=r.createdAt??void 0,v=r.lastLoginAt??void 0,{uid:_,emailVerified:b,isAnonymous:w,providerData:I,stsTokenManager:P}=r;te(_&&P,e,"internal-error");const T=va.fromJSON(this.name,P);te(typeof _=="string",e,"internal-error"),ii(n,e.name),ii(i,e.name),te(typeof b=="boolean",e,"internal-error"),te(typeof w=="boolean",e,"internal-error"),ii(s,e.name),ii(o,e.name),ii(c,e.name),ii(u,e.name),ii(f,e.name),ii(v,e.name);const x=new Wr({uid:_,auth:e,email:i,emailVerified:b,displayName:n,isAnonymous:w,photoURL:o,phoneNumber:s,tenantId:c,stsTokenManager:T,createdAt:f,lastLoginAt:v});return I&&Array.isArray(I)&&(x.providerData=I.map(W=>({...W}))),u&&(x._redirectEventId=u),x}static async _fromIdTokenResponse(e,r,n=!1){const i=new va;i.updateFromServerResponse(r);const s=new Wr({uid:r.localId,auth:e,stsTokenManager:i,isAnonymous:n});return await co(s),s}static async _fromGetAccountInfoResponse(e,r,n){const i=r.users[0];te(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?gd(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new va;c.updateFromIdToken(n);const u=new Wr({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:o}),f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Cl(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,f),u}}/**
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
 */const Lc=new Map;function qn(t){Yn(t instanceof Function,"Expected a class definition");let e=Lc.get(t);return e?(Yn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Lc.set(t,e),e)}/**
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
 */class md{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,r){this.storage[e]=r}async _get(e){const r=this.storage[e];return r===void 0?null:r}async _remove(e){delete this.storage[e]}_addListener(e,r){}_removeListener(e,r){}}md.type="NONE";const Mc=md;/**
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
 */function Ys(t,e,r){return`firebase:${t}:${e}:${r}`}class Ki{constructor(e,r,n){this.persistence=e,this.auth=r,this.userKey=n;const{config:i,name:s}=this.auth;this.fullUserKey=Ys(this.userKey,i.apiKey,s),this.fullPersistenceKey=Ys("persistence",i.apiKey,s),this.boundEventHandler=r._onStorageEvent.bind(r);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const r=await lo(this.auth,{idToken:e}).catch(()=>{});return r?Wr._fromGetAccountInfoResponse(this.auth,r,e):null}return Wr._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const r=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,r)return this.setCurrentUser(r)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,r,n="authUser"){if(!r.length)return new Ki(qn(Mc),e,n);const i=(await Promise.all(r.map(async f=>{try{if(await f._isAvailable())return f}catch{return}}))).filter(f=>f);let s=i[0]||qn(Mc);const o=Ys(n,e.config.apiKey,e.name);let c=null;for(const f of r)try{const v=await f._get(o);if(v){let _;if(typeof v=="string"){const b=await lo(e,{idToken:v}).catch(()=>{});if(!b)break;_=await Wr._fromGetAccountInfoResponse(e,b,v)}else _=Wr._fromJSON(e,v);f!==s&&(c=_),s=f;break}}catch{}const u=i.filter(f=>f._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Ki(s,e,n):(s=u[0],c&&await s._set(o,c.toJSON()),await Promise.all(r.map(async f=>{if(f!==s)try{await f._remove(o)}catch{}})),new Ki(s,e,n))}}/**
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
 */function Uc(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Id(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(bd(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Sd(e))return"Blackberry";if(kd(e))return"Webos";if(wd(e))return"Safari";if((e.includes("chrome/")||yd(e))&&!e.includes("edge/"))return"Chrome";if(Ed(e))return"Android";{const r=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=t.match(r);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function bd(t=Ht()){return/firefox\//i.test(t)}function wd(t=Ht()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function yd(t=Ht()){return/crios\//i.test(t)}function Id(t=Ht()){return/iemobile/i.test(t)}function Ed(t=Ht()){return/android/i.test(t)}function Sd(t=Ht()){return/blackberry/i.test(t)}function kd(t=Ht()){return/webos/i.test(t)}function Yl(t=Ht()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function M_(t=Ht()){var e;return Yl(t)&&!!((e=window.navigator)!=null&&e.standalone)}function U_(){return Xp()&&document.documentMode===10}function Td(t=Ht()){return Yl(t)||Ed(t)||kd(t)||Sd(t)||/windows phone/i.test(t)||Id(t)}/**
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
 */function Ad(t,e=[]){let r;switch(t){case"Browser":r=Uc(Ht());break;case"Worker":r=`${Uc(Ht())}-${t}`;break;default:r=t}const n=e.length?e.join(","):"FirebaseCore-web";return`${r}/JsCore/${ks}/${n}`}/**
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
 */class F_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,r){const n=s=>new Promise((o,c)=>{try{const u=e(s);o(u)}catch(u){c(u)}});n.onAbort=r,this.queue.push(n);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const r=[];try{for(const n of this.queue)await n(e),n.onAbort&&r.push(n.onAbort)}catch(n){r.reverse();for(const i of r)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
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
 */async function $_(t,e={}){return Ua(t,"GET","/v2/passwordPolicy",Kl(t,e))}/**
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
 */const B_=6;class H_{constructor(e){var n;const r=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=r.minPasswordLength??B_,r.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=r.maxPasswordLength),r.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=r.containsLowercaseCharacter),r.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=r.containsUppercaseCharacter),r.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=r.containsNumericCharacter),r.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=r.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const r={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,r),this.validatePasswordCharacterOptions(e,r),r.isValid&&(r.isValid=r.meetsMinPasswordLength??!0),r.isValid&&(r.isValid=r.meetsMaxPasswordLength??!0),r.isValid&&(r.isValid=r.containsLowercaseLetter??!0),r.isValid&&(r.isValid=r.containsUppercaseLetter??!0),r.isValid&&(r.isValid=r.containsNumericCharacter??!0),r.isValid&&(r.isValid=r.containsNonAlphanumericCharacter??!0),r}validatePasswordLengthOptions(e,r){const n=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;n&&(r.meetsMinPasswordLength=e.length>=n),i&&(r.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,r){this.updatePasswordCharacterOptionsStatuses(r,!1,!1,!1,!1);let n;for(let i=0;i<e.length;i++)n=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(r,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,r,n,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=r)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class V_{constructor(e,r,n,i){this.app=e,this.heartbeatServiceProvider=r,this.appCheckServiceProvider=n,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Fc(this),this.idTokenSubscription=new Fc(this),this.beforeStateQueue=new F_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=hd,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,r){return r&&(this._popupRedirectResolver=qn(r)),this._initializationPromise=this.queue(async()=>{var n,i,s;if(!this._deleted){try{this.persistenceManager=await Ki.create(this,e)}catch(o){Ks(`Failed to initialize persistence: ${o}`),this.persistenceManager=await Ki.create(this,[])}finally{(n=this._resolvePersistenceManagerAvailable)==null||n.call(this)}if(!this._deleted){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(r)}catch(o){Ks(`Failed to initialize current user: ${o}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const r=await lo(this,{idToken:e}),n=await Wr._fromGetAccountInfoResponse(this,r,e);await this.directlySetCurrentUser(n)}catch(r){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",r),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(_n(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let n=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=n==null?void 0:n._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(n=u.user,i=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return te(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let r=null;try{r=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return r}async reloadAndSetCurrentUserOrClear(e){try{await co(e)}catch(r){if((r==null?void 0:r.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=I_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(_n(this.app))return Promise.reject(Gi(this));const r=e?gi(e):null;return r&&te(r.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(r&&r._clone(this))}async _updateCurrentUser(e,r=!1){if(!this._deleted)return e&&te(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),r||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return _n(this.app)?Promise.reject(Gi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return _n(this.app)?Promise.reject(Gi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(qn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const r=this._getPasswordPolicyInternal();return r.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):r.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await $_(this),r=new H_(e);this.tenantId===null?this._projectPasswordPolicy=r:this._tenantPasswordPolicies[this.tenantId]=r}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Es("auth","Firebase",e())}onAuthStateChanged(e,r,n){return this.registerStateListener(this.authStateSubscription,e,r,n)}beforeAuthStateChanged(e,r){return this.beforeStateQueue.pushCallback(e,r)}onIdTokenChanged(e,r,n){return this.registerStateListener(this.idTokenSubscription,e,r,n)}authStateReady(){return new Promise((e,r)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},r)}})}async revokeAccessToken(e){if(this.currentUser){const r=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:r};this.tenantId!=null&&(n.tenantId=this.tenantId),await L_(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,r){const n=await this.getOrInitRedirectPersistenceManager(r);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const r=e&&qn(e)||this._popupRedirectResolver;te(r,this,"argument-error"),this.redirectPersistenceManager=await Ki.create(this,[qn(r._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var r,n;return this._isInitialized&&await this.queue(async()=>{}),((r=this._currentUser)==null?void 0:r._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var r;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((r=this.currentUser)==null?void 0:r.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,r,n,i){if(this._deleted)return()=>{};const s=typeof r=="function"?r:r.next.bind(r);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(te(c,this,"internal-error"),c.then(()=>{o||s(this.currentUser)}).catch(u=>{if(!o)if(typeof r!="function"&&r.error)r.error(u);else if(n)n(u);else throw u}),typeof r=="function"){const u=e.addObserver(r,n,i);return()=>{o=!0,u()}}else{const u=e.addObserver(r);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(r){const n=(r==null?void 0:r.message)||String(r),i=So(this,"internal-error",`An internal AuthError has occurred: ${n}`);throw i.customData={originalError:r},i}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return te(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Ad(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const r=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());r&&(e["X-Firebase-Client"]=r);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var r;if(_n(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((r=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getToken());return e!=null&&e.error&&Ks(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function ko(t){return gi(t)}class Fc{constructor(e){this.auth=e,this.observer=null,this.addObserver=nv(r=>this.observer=r)}get next(){return te(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Xl={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function z_(t){Xl=t}function j_(t){return Xl.loadJS(t)}function W_(){return Xl.gapiScript}function q_(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function G_(t,e){const r=ld(t,"auth");if(r.isInitialized()){const i=r.getImmediate(),s=r.getOptions();if(Pa(s,e??{}))return i;En(i,"already-initialized")}return r.initialize({options:e})}function K_(t,e){const r=(e==null?void 0:e.persistence)||[],n=(Array.isArray(r)?r:[r]).map(qn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function Cd(t,e,r){const n=ko(t);te(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const i=!1,s=Rd(e),{host:o,port:c}=J_(e),u=c===null?"":`:${c}`,f={url:`${s}//${o}${u}/`},v=Object.freeze({host:o,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!n._canInitEmulator){te(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),te(Pa(f,n.config.emulator)&&Pa(v,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=f,n.emulatorConfig=v,n.settings.appVerificationDisabledForTesting=!0,jl(o)?sv(`${s}//${o}${u}`):Y_()}function Rd(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function J_(t){const e=Rd(t),r=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!r)return{host:"",port:null};const n=r[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(n);if(i){const s=i[1];return{host:s,port:$c(n.substr(s.length+1))}}else{const[s,o]=n.split(":");return{host:s,port:$c(o)}}}function $c(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Y_(){function t(){const e=document.createElement("p"),r=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",r.position="fixed",r.width="100%",r.backgroundColor="#ffffff",r.border=".1em solid #000000",r.color="#b50000",r.bottom="0px",r.left="0px",r.margin="0px",r.zIndex="10000",r.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class Pd{constructor(e,r){this.providerId=e,this.signInMethod=r}toJSON(){return Wn("not implemented")}_getIdTokenResponse(e){return Wn("not implemented")}_linkToIdToken(e,r){return Wn("not implemented")}_getReauthenticationResolver(e){return Wn("not implemented")}}/**
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
 */async function _a(t,e){return T_(t,"POST","/v1/accounts:signInWithIdp",Kl(t,e))}/**
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
 */const X_="http://localhost";class Yi extends Pd{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const r=new Yi(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(r.idToken=e.idToken),e.accessToken&&(r.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(r.nonce=e.nonce),e.pendingToken&&(r.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(r.accessToken=e.oauthToken,r.secret=e.oauthTokenSecret):En("argument-error"),r}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const r=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:i,...s}=r;if(!n||!i)return null;const o=new Yi(n,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const r=this.buildRequest();return _a(e,r)}_linkToIdToken(e,r){const n=this.buildRequest();return n.idToken=r,_a(e,n)}_getReauthenticationResolver(e){const r=this.buildRequest();return r.autoCreate=!1,_a(e,r)}buildRequest(){const e={requestUri:X_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const r={};this.idToken&&(r.id_token=this.idToken),this.accessToken&&(r.access_token=this.accessToken),this.secret&&(r.oauth_token_secret=this.secret),r.providerId=this.providerId,this.nonce&&!this.pendingToken&&(r.nonce=this.nonce),e.postBody=Ss(r)}return e}}/**
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
 */class Ql{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class As extends Ql{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class si extends As{constructor(){super("facebook.com")}static credential(e){return Yi._fromParams({providerId:si.PROVIDER_ID,signInMethod:si.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return si.credentialFromTaggedObject(e)}static credentialFromError(e){return si.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return si.credential(e.oauthAccessToken)}catch{return null}}}si.FACEBOOK_SIGN_IN_METHOD="facebook.com";si.PROVIDER_ID="facebook.com";/**
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
 */class Hn extends As{constructor(){super("google.com"),this.addScope("profile")}static credential(e,r){return Yi._fromParams({providerId:Hn.PROVIDER_ID,signInMethod:Hn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:r})}static credentialFromResult(e){return Hn.credentialFromTaggedObject(e)}static credentialFromError(e){return Hn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:r,oauthAccessToken:n}=e;if(!r&&!n)return null;try{return Hn.credential(r,n)}catch{return null}}}Hn.GOOGLE_SIGN_IN_METHOD="google.com";Hn.PROVIDER_ID="google.com";/**
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
 */class oi extends As{constructor(){super("github.com")}static credential(e){return Yi._fromParams({providerId:oi.PROVIDER_ID,signInMethod:oi.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return oi.credentialFromTaggedObject(e)}static credentialFromError(e){return oi.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return oi.credential(e.oauthAccessToken)}catch{return null}}}oi.GITHUB_SIGN_IN_METHOD="github.com";oi.PROVIDER_ID="github.com";/**
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
 */class li extends As{constructor(){super("twitter.com")}static credential(e,r){return Yi._fromParams({providerId:li.PROVIDER_ID,signInMethod:li.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:r})}static credentialFromResult(e){return li.credentialFromTaggedObject(e)}static credentialFromError(e){return li.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:r,oauthTokenSecret:n}=e;if(!r||!n)return null;try{return li.credential(r,n)}catch{return null}}}li.TWITTER_SIGN_IN_METHOD="twitter.com";li.PROVIDER_ID="twitter.com";/**
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
 */class Na{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,r,n,i=!1){const s=await Wr._fromIdTokenResponse(e,n,i),o=Bc(n);return new Na({user:s,providerId:o,_tokenResponse:n,operationType:r})}static async _forOperation(e,r,n){await e._updateTokensIfNecessary(n,!0);const i=Bc(n);return new Na({user:e,providerId:i,_tokenResponse:n,operationType:r})}}function Bc(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class uo extends _i{constructor(e,r,n,i){super(r.code,r.message),this.operationType=n,this.user=i,Object.setPrototypeOf(this,uo.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:r.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,r,n,i){return new uo(e,r,n,i)}}function xd(t,e,r,n){return(e==="reauthenticate"?r._getReauthenticationResolver(t):r._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?uo._fromErrorAndOperation(t,s,e,n):s})}async function Q_(t,e,r=!1){const n=await hs(t,e._linkToIdToken(t.auth,await t.getIdToken()),r);return Na._forOperation(t,"link",n)}/**
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
 */async function Z_(t,e,r=!1){const{auth:n}=t;if(_n(n.app))return Promise.reject(Gi(n));const i="reauthenticate";try{const s=await hs(t,xd(n,i,e,t),r);te(s.idToken,n,"internal-error");const o=Jl(s.idToken);te(o,n,"internal-error");const{sub:c}=o;return te(t.uid===c,n,"user-mismatch"),Na._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&En(n,"user-mismatch"),s}}/**
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
 */async function eg(t,e,r=!1){if(_n(t.app))return Promise.reject(Gi(t));const n="signIn",i=await xd(t,n,e),s=await Na._fromIdTokenResponse(t,n,i);return r||await t._updateCurrentUser(s.user),s}function tg(t,e,r,n){return gi(t).onIdTokenChanged(e,r,n)}function rg(t,e,r){return gi(t).beforeAuthStateChanged(e,r)}function ng(t,e,r,n){return gi(t).onAuthStateChanged(e,r,n)}function ig(t){return gi(t).signOut()}const fo="__sak";/**
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
 */class Nd{constructor(e,r){this.storageRetriever=e,this.type=r}_isAvailable(){try{return this.storage?(this.storage.setItem(fo,"1"),this.storage.removeItem(fo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,r){return this.storage.setItem(e,JSON.stringify(r)),Promise.resolve()}_get(e){const r=this.storage.getItem(e);return Promise.resolve(r?JSON.parse(r):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const ag=1e3,sg=10;class Od extends Nd{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,r)=>this.onStorageEvent(e,r),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Td(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const r of Object.keys(this.listeners)){const n=this.storage.getItem(r),i=this.localCache[r];n!==i&&e(r,i,n)}}onStorageEvent(e,r=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const n=e.key;r?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(n);!r&&this.localCache[n]===o||this.notifyListeners(n,o)},s=this.storage.getItem(n);U_()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,sg):i()}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r&&JSON.parse(r))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,r,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:r,newValue:n}),!0)})},ag)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,r){await super._set(e,r),this.localCache[e]=JSON.stringify(r)}async _get(e){const r=await super._get(e);return this.localCache[e]=JSON.stringify(r),r}async _remove(e){await super._remove(e),delete this.localCache[e]}}Od.type="LOCAL";const og=Od;/**
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
 */class Dd extends Nd{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,r){}_removeListener(e,r){}}Dd.type="SESSION";const Ld=Dd;/**
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
 */function lg(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(r){return{fulfilled:!1,reason:r}}}))}/**
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
 */class To{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const r=this.receivers.find(i=>i.isListeningto(e));if(r)return r;const n=new To(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const r=e,{eventId:n,eventType:i,data:s}=r.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;r.ports[0].postMessage({status:"ack",eventId:n,eventType:i});const c=Array.from(o).map(async f=>f(r.origin,s)),u=await lg(c);r.ports[0].postMessage({status:"done",eventId:n,eventType:i,response:u})}_subscribe(e,r){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(r)}_unsubscribe(e,r){this.handlersMap[e]&&r&&this.handlersMap[e].delete(r),(!r||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}To.receivers=[];/**
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
 */function Zl(t="",e=10){let r="";for(let n=0;n<e;n++)r+=Math.floor(Math.random()*10);return t+r}/**
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
 */class cg{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,r,n=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((c,u)=>{const f=Zl("",20);i.port1.start();const v=setTimeout(()=>{u(new Error("unsupported_event"))},n);o={messageChannel:i,onMessage(_){const b=_;if(b.data.eventId===f)switch(b.data.status){case"ack":clearTimeout(v),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(b.data.response);break;default:clearTimeout(v),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:f,data:r},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function yn(){return window}function ug(t){yn().location.href=t}/**
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
 */function Md(){return typeof yn().WorkerGlobalScope<"u"&&typeof yn().importScripts=="function"}async function dg(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function fg(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function hg(){return Md()?self:null}/**
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
 */const Ud="firebaseLocalStorageDb",pg=1,ho="firebaseLocalStorage",Fd="fbase_key";class Cs{constructor(e){this.request=e}toPromise(){return new Promise((e,r)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{r(this.request.error)})})}}function Ao(t,e){return t.transaction([ho],e?"readwrite":"readonly").objectStore(ho)}function vg(){const t=indexedDB.deleteDatabase(Ud);return new Cs(t).toPromise()}function $d(){const t=indexedDB.open(Ud,pg);return new Promise((e,r)=>{t.addEventListener("error",()=>{r(t.error)}),t.addEventListener("upgradeneeded",()=>{const n=t.result;try{n.createObjectStore(ho,{keyPath:Fd})}catch(i){r(i)}}),t.addEventListener("success",async()=>{const n=t.result;n.objectStoreNames.contains(ho)?e(n):(n.close(),await vg(),e(await $d()))})})}async function Hc(t,e,r){const n=Ao(t,!0).put({[Fd]:e,value:r});return new Cs(n).toPromise()}async function _g(t,e){const r=Ao(t,!1).get(e),n=await new Cs(r).toPromise();return n===void 0?null:n.value}function Vc(t,e){const r=Ao(t,!0).delete(e);return new Cs(r).toPromise()}const gg=800,mg=3;class Bd{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=$d(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let r=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(r++>mg)throw n;if(this.dbPromise){const i=this.dbPromise;this.dbPromise=null;try{(await i).close()}catch{}}}}async initializeServiceWorkerMessaging(){return Md()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=To._getInstance(hg()),this.receiver._subscribe("keyChanged",async(e,r)=>({keyProcessed:(await this._poll()).includes(r.key)})),this.receiver._subscribe("ping",async(e,r)=>["keyChanged"])}async initializeSender(){var r,n;if(this.activeServiceWorker=await dg(),!this.activeServiceWorker)return;this.sender=new cg(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(r=e[0])!=null&&r.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||fg()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Hc(e,fo,"1"),await Vc(e,fo)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,r){return this._withPendingWrite(async()=>(await this._withRetries(n=>Hc(n,e,r)),this.localCache[e]=r,this.notifyServiceWorker(e)))}async _get(e){const r=await this._withRetries(n=>_g(n,e));return this.localCache[e]=r,r}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(r=>Vc(r,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(i=>{const s=Ao(i,!1).getAll();return new Cs(s).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const r=[],n=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)n.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),r.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!n.has(i)&&(this.notifyListeners(i,null),r.push(i));return r}catch(e){return this.isClosing||Ks(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),gg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Bd.type="LOCAL";const bg=Bd;new Ts(3e4,6e4);/**
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
 */function Hd(t,e){return e?qn(e):(te(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class ec extends Pd{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return _a(e,this._buildIdpRequest())}_linkToIdToken(e,r){return _a(e,this._buildIdpRequest(r))}_getReauthenticationResolver(e){return _a(e,this._buildIdpRequest())}_buildIdpRequest(e){const r={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(r.idToken=e),r}}function wg(t){return eg(t.auth,new ec(t),t.bypassAuthState)}function yg(t){const{auth:e,user:r}=t;return te(r,e,"internal-error"),Z_(r,new ec(t),t.bypassAuthState)}async function Ig(t){const{auth:e,user:r}=t;return te(r,e,"internal-error"),Q_(r,new ec(t),t.bypassAuthState)}/**
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
 */class Vd{constructor(e,r,n,i,s=!1){this.auth=e,this.resolver=n,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(r)?r:[r]}execute(){return new Promise(async(e,r)=>{this.pendingPromise={resolve:e,reject:r};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:r,sessionId:n,postBody:i,tenantId:s,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:r,sessionId:n,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(f){this.reject(f)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return wg;case"linkViaPopup":case"linkViaRedirect":return Ig;case"reauthViaPopup":case"reauthViaRedirect":return yg;default:En(this.auth,"internal-error")}}resolve(e){Yn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Yn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const Eg=new Ts(2e3,1e4);async function Sg(t,e,r){if(_n(t.app))return Promise.reject(Kr(t,"operation-not-supported-in-this-environment"));const n=ko(t);b_(t,e,Ql);const i=Hd(n,r);return new $i(n,"signInViaPopup",e,i).executeNotNull()}class $i extends Vd{constructor(e,r,n,i,s){super(e,r,i,s),this.provider=n,this.authWindow=null,this.pollId=null,$i.currentPopupAction&&$i.currentPopupAction.cancel(),$i.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return te(e,this.auth,"internal-error"),e}async onExecution(){Yn(this.filter.length===1,"Popup operations only handle one event");const e=Zl();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(r=>{this.reject(r)}),this.resolver._isIframeWebStorageSupported(this.auth,r=>{r||this.reject(Kr(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(Kr(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,$i.currentPopupAction=null}pollUserCancellation(){const e=()=>{var r,n;if((n=(r=this.authWindow)==null?void 0:r.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Kr(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Eg.get())};e()}}$i.currentPopupAction=null;/**
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
 */const kg="pendingRedirect",Xs=new Map;class Tg extends Vd{constructor(e,r,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],r,void 0,n),this.eventId=null}async execute(){let e=Xs.get(this.auth._key());if(!e){try{const n=await Ag(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(r){e=()=>Promise.reject(r)}Xs.set(this.auth._key(),e)}return this.bypassAuthState||Xs.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const r=await this.auth._redirectUserForId(e.eventId);if(r)return this.user=r,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Ag(t,e){const r=Pg(e),n=Rg(t);if(!await n._isAvailable())return!1;const i=await n._get(r)==="true";return await n._remove(r),i}function Cg(t,e){Xs.set(t._key(),e)}function Rg(t){return qn(t._redirectPersistence)}function Pg(t){return Ys(kg,t.config.apiKey,t.name)}async function xg(t,e,r=!1){if(_n(t.app))return Promise.reject(Gi(t));const n=ko(t),i=Hd(n,e),o=await new Tg(n,i,r).execute();return o&&!r&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}/**
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
 */const Ng=600*1e3;class Og{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let r=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(r=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Dg(e)||(this.hasHandledPotentialRedirect=!0,r||(this.queuedRedirectEvent=e,r=!0)),r}sendToConsumer(e,r){var n;if(e.error&&!zd(e)){const i=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";r.onError(Kr(this.auth,i))}else r.onAuthEvent(e)}isEventForConsumer(e,r){const n=r.eventId===null||!!e.eventId&&e.eventId===r.eventId;return r.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ng&&this.cachedEventUids.clear(),this.cachedEventUids.has(zc(e))}saveEventToCache(e){this.cachedEventUids.add(zc(e)),this.lastProcessedEventTime=Date.now()}}function zc(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function zd({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Dg(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return zd(t);default:return!1}}/**
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
 */async function Lg(t,e={}){return Ua(t,"GET","/v1/projects",e)}/**
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
 */const Mg=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ug=/^https?/;async function Fg(t){if(t.config.emulator)return;const{authorizedDomains:e}=await Lg(t);for(const r of e)try{if($g(r))return}catch{}En(t,"unauthorized-domain")}function $g(t){const e=Al(),{protocol:r,hostname:n}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&n===""?r==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):r==="chrome-extension:"&&o.hostname===n}if(!Ug.test(r))return!1;if(Mg.test(t))return n===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(n)}/**
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
 */const Bg=new Ts(3e4,6e4);function jc(){const t=yn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let r=0;r<t.CP.length;r++)t.CP[r]=null}}function Hg(t){return new Promise((e,r)=>{var i,s,o;function n(){jc(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{jc(),r(Kr(t,"network-request-failed"))},timeout:Bg.get()})}if((s=(i=yn().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=yn().gapi)!=null&&o.load)n();else{const c=q_("iframefcb");return yn()[c]=()=>{gapi.load?n():r(Kr(t,"network-request-failed"))},j_(`${W_()}?onload=${c}`).catch(u=>r(u))}}).catch(e=>{throw Qs=null,e})}let Qs=null;function Vg(t){return Qs=Qs||Hg(t),Qs}/**
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
 */const zg=new Ts(5e3,15e3),jg="__/auth/iframe",Wg="emulator/auth/iframe",qg={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Gg=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Kg(t){const e=t.config;te(e.authDomain,t,"auth-domain-config-required");const r=e.emulator?Gl(e,Wg):`https://${t.config.authDomain}/${jg}`,n={apiKey:e.apiKey,appName:t.name,v:ks},i=Gg.get(t.config.apiHost);i&&(n.eid=i);const s=t._getFrameworks();return s.length&&(n.fw=s.join(",")),`${r}?${Ss(n).slice(1)}`}async function Jg(t){const e=await Vg(t),r=yn().gapi;return te(r,t,"internal-error"),e.open({where:document.body,url:Kg(t),messageHandlersFilter:r.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:qg,dontclear:!0},n=>new Promise(async(i,s)=>{await n.restyle({setHideOnLeave:!1});const o=Kr(t,"network-request-failed"),c=yn().setTimeout(()=>{s(o)},zg.get());function u(){yn().clearTimeout(c),i(n)}n.ping(u).then(u,()=>{s(o)})}))}/**
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
 */const Yg={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Xg=500,Qg=600,Zg="_blank",em="http://localhost";class Wc{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function tm(t,e,r,n=Xg,i=Qg){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let c="";const u={...Yg,width:n.toString(),height:i.toString(),top:s,left:o},f=Ht().toLowerCase();r&&(c=yd(f)?Zg:r),bd(f)&&(e=e||em,u.scrollbars="yes");const v=Object.entries(u).reduce((b,[w,I])=>`${b}${w}=${I},`,"");if(M_(f)&&c!=="_self")return rm(e||"",c),new Wc(null);const _=window.open(e||"",c,v);te(_,t,"popup-blocked");try{_.focus()}catch{}return new Wc(_)}function rm(t,e){const r=document.createElement("a");r.href=t,r.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),r.dispatchEvent(n)}/**
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
 */const nm="__/auth/handler",im="emulator/auth/handler",am=encodeURIComponent("fac");async function qc(t,e,r,n,i,s){te(t.config.authDomain,t,"auth-domain-config-required"),te(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:r,redirectUrl:n,v:ks,eventId:i};if(e instanceof Ql){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",rv(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[v,_]of Object.entries({}))o[v]=_}if(e instanceof As){const v=e.getScopes().filter(_=>_!=="");v.length>0&&(o.scopes=v.join(","))}t.tenantId&&(o.tid=t.tenantId);const c=o;for(const v of Object.keys(c))c[v]===void 0&&delete c[v];const u=await t._getAppCheckToken(),f=u?`#${am}=${encodeURIComponent(u)}`:"";return`${sm(t)}?${Ss(c).slice(1)}${f}`}function sm({config:t}){return t.emulator?Gl(t,im):`https://${t.authDomain}/${nm}`}/**
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
 */const il="webStorageSupport";class om{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ld,this._completeRedirectFn=xg,this._overrideRedirectResult=Cg}async _openPopup(e,r,n,i){var o;Yn((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await qc(e,r,n,Al(),i);return tm(e,s,Zl())}async _openRedirect(e,r,n,i){await this._originValidation(e);const s=await qc(e,r,n,Al(),i);return ug(s),new Promise(()=>{})}_initialize(e){const r=e._key();if(this.eventManagers[r]){const{manager:i,promise:s}=this.eventManagers[r];return i?Promise.resolve(i):(Yn(s,"If manager is not set, promise should be"),s)}const n=this.initAndGetManager(e);return this.eventManagers[r]={promise:n},n.catch(()=>{delete this.eventManagers[r]}),n}async initAndGetManager(e){const r=await Jg(e),n=new Og(e);return r.register("authEvent",i=>(te(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:n.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=r,n}_isIframeWebStorageSupported(e,r){this.iframes[e._key()].send(il,{type:il},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[il];s!==void 0&&r(!!s),En(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const r=e._key();return this.originValidationPromises[r]||(this.originValidationPromises[r]=Fg(e)),this.originValidationPromises[r]}get _shouldInitProactively(){return Td()||wd()||Yl()}}const lm=om;var Gc="@firebase/auth",Kc="1.13.6";/**
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
 */class cm{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const r=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,r),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const r=this.internalListeners.get(e);r&&(this.internalListeners.delete(e),r(),this.updateProactiveRefresh())}assertAuthConfigured(){te(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function um(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function dm(t){ds(new xa("auth",(e,{options:r})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=n.options;te(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const u={apiKey:o,authDomain:c,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Ad(t)},f=new V_(n,i,s,u);return K_(f,r),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,r,n)=>{e.getProvider("auth-internal").initialize()})),ds(new xa("auth-internal",e=>{const r=ko(e.getProvider("auth").getImmediate());return(n=>new cm(n))(r)},"PRIVATE").setInstantiationMode("EXPLICIT")),pa(Gc,Kc,um(t)),pa(Gc,Kc,"esm2020")}/**
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
 */const fm=300,hm=id("authIdTokenMaxAge")||fm;let Jc=null;const pm=t=>async e=>{const r=e&&await e.getIdTokenResult(),n=r&&(new Date().getTime()-Date.parse(r.issuedAtTime))/1e3;if(n&&n>hm)return;const i=r==null?void 0:r.token;Jc!==i&&(Jc=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function vm(t=a_()){const e=ld(t,"auth");if(e.isInitialized())return e.getImmediate();const r=G_(t,{popupRedirectResolver:lm,persistence:[bg,og,Ld]}),n=id("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(n,location.origin);if(location.origin===s.origin){const o=pm(s.toString());rg(r,o,()=>o(r.currentUser)),tg(r,c=>o(c))}}const i=Wp("auth");return i&&Cd(r,`http://${i}`),r}function _m(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}z_({loadJS(t){return new Promise((e,r)=>{const n=document.createElement("script");n.setAttribute("src",t),n.onload=e,n.onerror=i=>{const s=Kr("internal-error");s.customData=i,r(s)},n.type="text/javascript",n.charset="UTF-8",_m().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});dm("Browser");function gm(t){var n,i,s,o;if(!((n=t.firebase)!=null&&n.apiKey)||!((i=t.firebase)!=null&&i.projectId)||!((s=t.firebase)!=null&&s.authDomain)||!((o=t.firebase)!=null&&o.appId))throw new Error("Google sign-in is not configured. Contact your studio operator.");const e=vm(cd(t.firebase,"liquidity-studio"));if(t.emulator){const c=new URL(t.emulator.url),u=f=>["localhost","127.0.0.1","[::1]"].includes(f);if(!u(location.hostname)||!u(c.hostname)||c.protocol!=="http:")throw new Error("Authentication emulator is restricted to local development.");Cd(e,c.origin)}const r=new Hn;return r.setCustomParameters({prompt:"select_account"}),{watch:c=>ng(e,c),login:()=>Sg(e,r),logout:()=>ig(e),getToken:async()=>{if(!e.currentUser)throw new Error("Sign in with Google to continue.");return e.currentUser.getIdToken()}}}var mm=R('<meta name="description" content="Private editorial workspace for brand campaigns, measured previews and source review."/>'),bm=R('<main class="login-shell"><p role="status">Connecting to your studio…</p></main>'),wm=R('<button class="primary"> </button>'),ym=R('<form><label>Username<input name="username" autocomplete="username" required=""/></label><label>Password<input name="password" type="password" autocomplete="current-password" required=""/></label><button class="primary"> </button></form>'),Im=R('<p class="error" role="alert"> </p>'),Em=R(`<main class="login-shell"><div class="login-card"><span class="wordmark">◈ LIQUIDITY STUDIO</span> <h1>Good work starts<br/>with a clear view.</h1> <p>Sign in to your private brand workspace.</p> <!> <!> <p class="small muted">Accounts are provisioned by your studio operator. No public
        registration.</p></div> <div class="login-art"><span class="eyebrow">YOUR EDITORIAL WORKSPACE</span> <h2>From a good story.<br/>To a considered campaign.</h2> <div class="login-cards"><span>SOURCE</span><span>SHAPE</span><span>PREVIEW</span></div> <p>One place to edit, inspect and export.<br/>Every brand keeps its own
        context.</p></div></main>`),Ni=R("<option> </option>"),Sm=R('<button><span aria-hidden="true"> </span> </button>'),km=R('<button><span aria-hidden="true">⌘</span>Operations</button>'),Tm=R('<div class="error banner" role="alert"> <button aria-label="Dismiss error">×</button></div>'),Am=R('<div class="notice banner" role="status"> <button aria-label="Dismiss notice">×</button></div>'),Cm=R('<div class="panel" role="status"> </div>'),Rm=R('<div class="panel"><h2>Workspace could not load.</h2> <p>Retry loading this brand before opening or adding stories.</p> <button class="secondary">Retry workspace</button></div>'),Yc=R('<span class="status-tag"> </span>'),Pm=R('<div class="active-filters" role="group" aria-label="Active filters"><!> <!> <button class="secondary">Clear filters</button></div>'),xm=R('<article class="story-row"><div class="story-day"><b> </b><span> </span></div> <div class="story-copy"><span class="eyebrow"> </span> <h3> </h3> <p> </p> <span class="status-tag"> </span></div> <button class="secondary"> </button></article>'),Nm=R("<h3>No stories match these filters.</h3> <p>Your stories are still in this brand. Clear filters to show them.</p>",1),Om=R("<h3>No stories here yet.</h3> <p>Add supplied facts below. The studio will not invent them.</p>",1),Dm=R('<div class="empty"><!></div>'),Lm=R(`<div class="section-line"><div><h2>Story backlog <span class="count"> </span></h2> <p id="backlog-results" class="muted" role="status" aria-live="polite" aria-atomic="true"> </p> <p class="muted">Opening a saved story keeps your edits.</p></div> <div class="filters"><input aria-label="Search stories" aria-describedby="backlog-results" placeholder="Search stories…"/><select aria-label="Filter by status"><option>All</option><!></select></div></div> <!> <div class="story-list"></div> <details class="panel add-story"><summary>Add a story</summary> <form class="form-grid"><label class="full">Story title<input required=""/></label><label>Category<input/></label><label>Calendar day<select></select></label><label class="full">Supplied facts, one per line<textarea rows="4" required="" placeholder="Add the specific facts you want the draft to use."></textarea></label><label class="full">Source links, one per line<textarea rows="2" placeholder="https://…"></textarea></label> <p class="small muted full">Facts are editorial inputs, not independently verified claims.
              Clinical claims require source review.</p> <button class="primary">Add to backlog</button></form></details>`,1),Mm=R('<button class="calendar-story"><span class="eyebrow"> </span><b> </b><span class="status-tag"> </span></button>'),Um=R('<p class="muted small">Room for a story</p>'),Fm=R('<section class="day-column"><h3> </h3> <!></section>'),$m=R('<div class="section-line"><h2>Weekly editorial calendar</h2> <span class="muted small">Assignments only · no automatic publishing</span></div> <div class="calendar-grid"></div>',1),Bm=R('<p class="download"><a> </a><small>Actual exported artifact · scope authorization required</small></p>'),Hm=R("<button> <small> </small></button>"),Vm=R('<label> <textarea rows="3"></textarea></label>'),zm=R('<label>Headline<textarea aria-label="Headline" rows="3"></textarea></label> <!> <label>Takeaway<textarea rows="3"></textarea></label> <label>Caption<textarea aria-label="Caption" rows="4"></textarea></label>',1),jm=R('<fieldset><legend></legend><label>Title<input/></label><label>Source detail<textarea rows="3"></textarea></label><label>Visual direction<input/></label></fieldset>'),Wm=R("<label>Cover hook<input/></label> <!>",1),qm=R('<label>Story hook<textarea rows="3"></textarea></label><label>Source highlight<textarea rows="4"></textarea></label><label>Poll question<input aria-label="Poll question"/></label>',1),Gm=R("<label> <textarea></textarea></label>"),Km=R("<fieldset><legend></legend><!></fieldset>"),Jm=R('<label>Spoken hook<textarea rows="3"></textarea></label><!><label>Closing call to action<input/></label>',1),Ym=R(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and
                            want to record my review.</label>`),Xm=R(`<p class="small muted">A founder clinical source review is required before
                            generation.</p>`),Qm=R(`<p class="small error">Clinical review must be recorded by an authorized
                          reviewer.</p>`),Zm=R('<fieldset tabindex="-1"><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label><!></fieldset>'),eb=R('<p class="small error"> </p>'),tb=R(`<p class="small muted">Preflight recorded for this brand. Editorial review
                    required.</p>`),rb=R(`<div class="studio-grid"><section class="editor-panel"><div class="panel-heading"><h3>Make it yours.</h3> <span class="status-tag"> </span></div> <p class="small muted">Edit the wording, then save to update your preview and
                  exported artwork.</p> <div class="field-editor"><!></div> <details class="advanced-editor"><summary>Advanced format JSON</summary><label>Format content<textarea class="json-editor" aria-label="Format content" spellcheck="false"></textarea></label></details> <button class="primary">Save changes</button> <div class="schedule-box"><label>Assigned day<select aria-label="Assigned day"></select></label><button class="secondary">Assign to calendar</button> <p class="small muted">Assigning a day does not publish or export.</p></div> <details class="sources"><summary>Review source claims</summary> <p class="small muted">Approve a claim only after reviewing its linked source and
                    meaning. Clinical claims require a separate clinical review.</p> <!><button class="secondary">Add source claim</button><button class="secondary">Save source review</button><button class="secondary">Reload saved review (discard review edits)</button></details> <!></section> <!></div>`),nb=R(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and want
                          to record my review.</label>`),ib=R(`<p class="small muted">A founder clinical source review is required before
                          generation.</p>`),ab=R('<fieldset tabindex="-1"><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label></fieldset>'),sb=R(`<section class="panel"><h3>Review sources before generation</h3> <p class="muted">Add a source link to each claim and choose its review status.
                Unreviewed claims cannot enter a campaign.</p> <div class="field-editor"></div> <button class="secondary">Add source claim</button> <button class="secondary">Save source review</button><button class="secondary">Reload saved review (discard review edits)</button></section> <div class="empty"><span class="empty-symbol">◧</span> <h2>A story ready to take shape.</h2> <p>Generate a draft from the supplied facts, then review every
                format.</p> <!> <button class="primary"> </button></div>`,1),ob=R('<div class="studio-toolbar"><div><span class="eyebrow">ACTIVE STORY</span> <h2> </h2> <span class="provenance"> </span></div> <div class="toolbar-actions"><button class="secondary"> </button><button class="primary"> </button></div></div> <div class="generation-review-context"><!></div> <!> <div class="format-tabs" aria-label="Campaign format"></div> <!>',1),lb=R('<div class="empty"><h2>Choose a story to begin.</h2> <p>Every campaign starts with supplied facts and a source review.</p> <button class="primary">Open story backlog</button></div>'),cb=R('<label> <div><input type="color"/><input/></div></label>'),ub=R('<p class="small muted"> </p> <p> </p>',1),db=R('<article class="panel" style="margin-bottom:12px"><h3> </h3> <!></article>'),fb=R('<p class="muted">Audience groups need owner review.</p>'),hb=R("<li><p> </p></li>"),pb=R('<li class="muted">Editorial pillars need owner review.</li>'),vb=R(`<p class="small error">Clinical claims remain quarantined until explicit source and
                clinical review are recorded.</p>`),_b=R(`<section class="panel" style="margin-top:24px" aria-label="Brand positioning reference"><span class="eyebrow">OWNER POSITIONING · READ-ONLY REFERENCE</span> <h2>Proposed editorial positioning</h2> <p class="muted">These audiences and pillars describe editorial intent. They are
              not verified factual or clinical claims. Source review is required
              for every campaign.</p> <span class="status-tag"> </span> <div class="admin-grid" style="margin-top:24px"><section><h3>Audience value groups</h3> <!></section> <section><h3>Editorial pillars</h3> <ol></ol></section></div> <!></section>`),gb=R('<article class="story-row"><div class="story-copy"><h3> </h3> <span class="status-tag"> </span></div> <button class="secondary">Review sources</button></article>'),mb=R('<p class="small muted">No research prompts in this brand.</p>'),bb=R(`<form class="panel brand-form form-grid"><label>Brand name<input required=""/></label><label>Website<input/></label><label class="full">Tagline<input/></label><label class="full">Editorial mission<textarea rows="4"></textarea></label><label>Wordmark / monogram<input/></label><label>Heading font<select aria-label="Heading font"></select></label><label>Body font<select aria-label="Body font"></select></label> <div class="full color-list"></div> <button class="primary">Save Brand Kit</button></form> <!> <section class="panel" style="margin-top:24px" aria-label="Unreviewed research topics"><h2>Research queue · unreviewed</h2> <p class="muted">Research prompts are starting points, not approved claims. Open a
            topic to add sourced claims for review.</p> <!></section>`,1),wb=R('<button class="secondary"> </button>'),yb=R('<li><strong> </strong> <p class="small muted"> </p> <!></li>'),Ib=R('<li class="muted">No batch attempts for this brand.</li>'),Eb=R("<tr><td> </td><td> </td><td> </td><td> </td></tr>"),Sb=R('<tr><td colspan="4">No generation traces for this brand.</td></tr>'),kb=R(`<div class="admin-grid"><section class="panel"><div class="panel-heading"><h2>Health & readiness</h2> <button class="secondary">Refresh</button></div> <p class="muted">Repository readiness does not establish provider connectivity.</p> <div class="ops-metrics"><div><b> </b><span>Service readiness</span></div> <div><b> </b><span>Repository check</span></div> <div><b> </b><span>Generation provider</span></div></div> <details><summary>Readiness details</summary> <pre> </pre></details></section> <section class="panel"><h2>Scoped operations</h2> <button class="secondary">Run this brand’s batch</button> <p><a>Download scoped feedback JSONL</a></p> <p class="small muted">Jobs use this organization and brand. Export is separate from
              publishing.</p> <h3>Recent batch attempts</h3> <ul aria-label="Recent batch attempts"></ul></section> <section class="panel"><h2>Organization management</h2> <form><label>New organization name<input required=""/></label><button class="secondary">Create organization</button></form> <form><label> <input required=""/></label><label>Brand preset<select aria-label="Brand preset"><option>The Liquidity Desk</option><option>Chai With Jai</option></select></label><button class="secondary">Create brand</button></form></section> <section class="panel"><h2>Telemetry & generation</h2> <div class="ops-metrics"><div><b> </b><span>Recent generation traces</span></div> <div><b> </b><span>Recorded usage events</span></div> <div><b> </b><span>Recent operational events</span></div></div> <p class="small muted">Usage records describe operations; they are not customer invoices
              or proof of factual accuracy.</p> <div class="trace-table"><table><thead><tr><th>Status</th><th>Provider</th><th>Model</th><th>Duration</th></tr></thead><tbody></tbody></table></div> <details><summary>Operational data</summary> <pre> </pre></details></section> <details class="panel"><summary>Architecture reference</summary> <pre> </pre></details></div>`),Tb=R('<div class="app-shell"><aside class="sidebar"><a href="/" class="wordmark">◈<span>LIQUIDITY<br/>STUDIO</span></a> <div class="scope-selectors"><label>Organization<select aria-label="Organization"></select></label><label>Brand<select aria-label="Brand"></select></label></div> <nav aria-label="Main navigation"><!><!></nav> <div class="sidebar-bottom"><span class="avatar"> </span> <div><b> </b><small> </small></div> <button aria-label="Sign out">↪</button></div></aside> <main class="workspace"><header class="workspace-header"><div><span class="eyebrow"> </span> <h1> </h1> <p> </p></div> <span class="private-badge">● Private workspace</span></header> <!><!> <!></main></div>');function Ab(t,e){yo(e,!0);const r=["Mona Sans","Inter","Instrument Serif","DejaVu Sans"];function n(g){const m=typeof g=="string"?g.split("/")[0].trim():"";return r.includes(m)?m:"DejaVu Sans"}const i=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],s=[{id:"infographic",name:"Feed post",ratio:"4:5"},{id:"carousel",name:"Carousel",ratio:"4 slides"},{id:"story",name:"Story",ratio:"9:16"},{id:"reel",name:"Reel",ratio:"30s script"}];let o=O("unavailable"),c,u=0,f=0,v,_=O(null),b=O(_r([])),w=O(""),I=O(""),P=O(_r({})),T=O(""),x=O(""),W=O(!0),U=O(!1),D=O(""),q=O(""),Q=O("backlog"),F=O(null),Z=O(_r([])),z=O(_r([])),L=O(null),pe=O(null),ue=O("infographic"),Dt=O("Monday"),Ke=O(""),ke=O("All"),Vt=O(null);const er=new yl;let zt="",Ye=O(""),ot=_t(()=>a(Ke).trim()),Sn=_t(()=>!!(a(ot)||a(ke)!=="All")),ce=O(""),xe=O(_r({})),Be=O(!1),kn=O(""),Xi=O(""),Tn=O(""),lt=O(_r([])),Qi=O("[]"),An=_t(()=>Mp(a(lt),Ja(a(lt))!==a(Qi)));function Fa(g){var S;const m=document.getElementById(`source-claim-${encodeURIComponent(g)}`),A=m==null?void 0:m.closest("details");A&&(A.open=!0),m==null||m.scrollIntoView({block:"center",behavior:"smooth"}),(S=(m==null?void 0:m.querySelector("textarea, input, select"))||m)==null||S.focus()}let mi=O("Editorial"),Zi=O("Monday"),bi=O(""),wi=O(""),ea=O("liquidity_desk"),gr=O(null),ta=O(null),Cn=O(null),mr=O(null),jt=O(""),yi=O(""),Yr=O(!1),Ae=0,Rs=0,ra=_t(()=>a(b).find(g=>g.id===a(w))),$a=_t(()=>{var g,m;return(m=(g=a(ra))==null?void 0:g.brands)==null?void 0:m.find(A=>A.id===a(I))}),Ba=_t(()=>a(Z).filter(g=>(!a(ot)||(g.title+" "+g.category).toLowerCase().includes(a(ot).toLowerCase()))&&(a(ke)==="All"||g.status===a(ke)))),Co=_t(()=>{var g,m,A,S;return((m=(g=a(pe))==null?void 0:g.provenance)==null?void 0:m.mode)==="synthetic"?"Synthetic draft · source review required":((S=(A=a(pe))==null?void 0:A.provenance)==null?void 0:S.mode)==="provider"?"Provider draft · source review required":"Source provenance unverified · review required"}),na=_t(()=>{var g,m;return((g=a(P))==null?void 0:g.admin)===!0||((m=a(_))==null?void 0:m.role)==="founder"});function Ha(){return new URLSearchParams({organizationId:a(w),brandId:a(I)}).toString()}async function br(g,m={},A=!0){const S=Ae,M=a(o)==="google"?{Authorization:`Bearer ${await c.getToken()}`}:{},V=await fetch(g+(A?(g.includes("?")?"&":"?")+Ha():""),{...m,credentials:"same-origin",headers:{...m.body?{"Content-Type":"application/json"}:{},...m.headers,...M}}),J=await V.json().catch(()=>({}));if(!V.ok)throw V.status===401&&aa(),new Error(J.error||J.message||`Request failed (${V.status})`);if(A&&S!==Ae)throw new Error("Workspace changed while the request was running; retry in the current brand");return J}function Tt(g,m={},A=!0){return br(g,{method:"POST",body:JSON.stringify(m)},A)}function ia(g){var m,A,S,M,V,J;d(_,g.user,!0),d(b,g.organizations||[],!0),d(P,g.permissions||{},!0),d(w,((m=g.activeScope)==null?void 0:m.organizationId)||((A=a(b)[0])==null?void 0:A.id)||"",!0),d(I,((S=g.activeScope)==null?void 0:S.brandId)||((J=(V=(M=a(b).find(ee=>ee.id===a(w)))==null?void 0:M.brands)==null?void 0:V[0])==null?void 0:J.id)||"",!0)}function Qn(){f++,clearTimeout(v),v=void 0}function aa(){Ae++,d(Yr,!1),d(Ye,""),er.clear(),zt="",d(Ke,""),d(ke,"All"),d(_,null),d(b,[],!0),d(P,{},!0),d(w,""),d(I,""),d(Z,[],!0),d(z,[],!0),d(L,null),d(pe,null),d(F,null),d(gr,null),d(mr,null),d(jt,""),d(Be,!1)}Qu(()=>{let g=!1,m;async function A(){try{const S=await fetch("/api/auth/config");if(!S.ok)throw new Error("Could not load sign-in configuration.");const M=await S.json();if(g)return;if(!["google","password"].includes(M.mode))throw new Error("Unsupported sign-in configuration.");if(d(o,M.mode,!0),a(o)==="google")c=gm(M),m=c.watch(async V=>{Qn();const J=++u;aa(),d(W,!0);try{if(V){const ee=await br("/api/auth/session",{},!1);if(g||J!==u)return;ia(ee),a(I)&&await Xr()}}catch(ee){!g&&J===u&&(aa(),d(D,`Google sign-in could not open this workspace: ${ee.message}. Check your invited account or contact the studio operator.`))}finally{!g&&J===u&&(d(W,!1),d(U,!1))}});else{const V=await fetch("/api/auth/session",{credentials:"same-origin"});V.ok&&!g&&(ia(await V.json()),a(I)&&await Xr()),g||d(W,!1)}}catch(S){g||(d(D,S.message,!0),d(W,!1))}}return A(),()=>{g=!0,u++,Qn(),m==null||m()}});async function Ps(){if(a(U)||!c)return;Qn();const g=f;d(U,!0),d(D,"");const m=setTimeout(()=>{g===f&&(Qn(),d(U,!1),d(D,"Google sign-in has not completed. Finish the Google popup or try again."))},9e4);v=m;try{await c.login()}catch(A){if(g!==f)return;d(D,A.code==="auth/popup-closed-by-user"?"Google sign-in was closed. Select Continue with Google to try again.":A.code==="auth/popup-blocked"?"Allow the Google sign-in popup, then try again.":A.message||"Google sign-in failed. Try again.",!0)}finally{clearTimeout(m),g===f&&(v=void 0,d(U,!1))}}async function Ro(g){g.preventDefault(),d(U,!0),d(D,"");try{const m=await Tt("/api/auth/login",{username:a(T),password:a(x)},!1);d(x,""),ia(m),await Xr()}catch(m){d(D,m.message,!0)}finally{d(U,!1)}}async function Po(){try{a(o)==="google"?await c.logout():await Tt("/api/auth/logout",{},!1),u++,Qn(),aa(),d(W,!1)}catch(g){d(D,g.message,!0)}}async function xs(g){if(a(o)==="google"){g.preventDefault();try{const m=await fetch(a(jt),{headers:{Authorization:`Bearer ${await c.getToken()}`}});if(!m.ok)throw new Error(`Download failed (${m.status}). Sign in again if access expired.`);const A=URL.createObjectURL(await m.blob()),S=document.createElement("a");S.href=A,S.download=a(yi),S.click(),setTimeout(()=>URL.revokeObjectURL(A),1e3)}catch(m){d(D,m.message,!0)}}}function Va(){var g;return JSON.stringify([(g=a(_))==null?void 0:g.id,a(w),a(I)])}function Rn(){var A;if(!a(_)||a(Yr)||a(Ye))return;const g=Va(),m=er.get(g);er.set(g,{search:a(Ke),statusFilter:a(ke),selectedStoryId:(A=a(L))==null?void 0:A.id,scrollY:a(Q)==="backlog"?window.scrollY:(m==null?void 0:m.scrollY)||0})}async function Ns(g){var m;if(a(Q)==="backlog"&&Rn(),d(Q,g,!0),g==="backlog"){const A=Ae;await as(),A===Ae&&!a(Yr)&&window.scrollTo(0,((m=er.get(Va()))==null?void 0:m.scrollY)||0)}}async function xo(){var g;d(Ke,""),d(ke,"All"),Rn(),await as(),(g=a(Vt))==null||g.focus()}async function Xr(){var M,V,J;const g=Va(),m=er.get(g),A=g===zt?{search:a(Ke),statusFilter:a(ke),selectedStoryId:((M=a(L))==null?void 0:M.id)||(m==null?void 0:m.selectedStoryId),scrollY:(m==null?void 0:m.scrollY)||0}:m;zt=g,d(Ke,(A==null?void 0:A.search)||"",!0),d(ke,(A==null?void 0:A.statusFilter)||"All",!0),d(Ye,"");const S=++Ae;d(Yr,!0),d(Z,[],!0),d(z,[],!0),d(F,null),d(lt,[],!0),d(q,""),d(D,""),d(U,!0),d(L,null),d(pe,null),d(gr,null),d(mr,null),d(jt,""),d(Be,!1);try{const ee=await br("/api/studio/bootstrap");if(S!==Ae)return;d(F,ee.brandProfile,!0),a(F)&&((V=a(F)).fonts||(V.fonts={heading:"DejaVu Sans",body:"DejaVu Sans"}),a(F).fonts.heading=n(a(F).fonts.heading),a(F).fonts.body=n(a(F).fonts.body),(J=a(F)).colors||(J.colors=[])),d(Z,ee.backlog||[],!0),d(z,ee.calendar||[],!0),ee.organizations&&d(b,ee.organizations,!0),ee.permissions&&d(P,ee.permissions,!0),a(Z).length&&za(a(Z).find(de=>de.id===(A==null?void 0:A.selectedStoryId))||a(Z)[0])}catch(ee){S===Ae&&(d(D,ee.message,!0),d(Ye,ee.message,!0),d(Z,[],!0),d(z,[],!0),d(F,null))}finally{S===Ae&&(d(U,!1),d(Yr,!1),await as(),S===Ae&&a(Q)==="backlog"&&!a(Ye)&&window.scrollTo(0,(A==null?void 0:A.scrollY)||0))}}async function No(g){var S,M,V;const m=g.currentTarget,A=m.value;if(a(Be)&&!await Te()){m.value=a(w);return}Rn(),d(w,A,!0),d(I,((V=(M=(S=a(b).find(J=>J.id===a(w)))==null?void 0:S.brands)==null?void 0:M[0])==null?void 0:V.id)||"",!0),d(Q,"backlog"),await Xr()}async function Oo(g){const m=g.currentTarget,A=m.value;if(a(Be)&&!await Te()){m.value=a(I);return}Rn(),d(I,A,!0),d(Q,"backlog"),await Xr()}function za(g){var m;d(L,g,!0),d(pe,(g==null?void 0:g.campaignDraft)||null,!0),d(Dt,(g==null?void 0:g.scheduledDay)||"Monday",!0),d(lt,((g==null?void 0:g.sourceClaims)||((m=g==null?void 0:g.verifiedFacts)==null?void 0:m.map((A,S)=>({id:`claim_${S}`,text:A,sourceUrl:"",status:"unreviewed"})))||[]).map(A=>({...A})),!0),d(Qi,Ja(a(lt)),!0),d(jt,""),d(mr,null),ja()}function ja(){var g,m;d(xe,(g=a(pe))!=null&&g[a(ue)]?JSON.parse(JSON.stringify(a(pe)[a(ue)])):{},!0),d(ce,(m=a(pe))!=null&&m[a(ue)]?JSON.stringify(a(xe),null,2):"",!0),d(Be,!1)}function C(g,m){a(xe)[g]=m,d(ce,JSON.stringify(a(xe),null,2),!0),d(Be,!0)}function X(g,m,A,S){A?a(xe)[g][m][A]=S:a(xe)[g][m]=S,d(ce,JSON.stringify(a(xe),null,2),!0),d(Be,!0)}async function Fe(g){a(Be)&&!await Te()||(Rn(),za(g),Rn(),d(Q,"studio"))}async function it(g){a(Be)&&!await Te()||(d(ue,g,!0),d(jt,""),ja())}async function gt(){var A,S;if(!a(L)||a(U)||!a(An).ready||a(Be)&&!await Te())return;d(U,!0),d(D,"");const g=Ae,m=a(L).id;try{const M=await Tt("/api/studio/generate-campaign",{storyId:m});if(g!==Ae||((A=a(L))==null?void 0:A.id)!==m)return;d(pe,M.campaign,!0),d(L,((S=M.backlog)==null?void 0:S.find(V=>V.id===m))||M.story,!0),d(Z,M.backlog||a(Z),!0),d(z,M.calendar||a(z),!0),ja(),d(q,"Draft generated. Review the sources before export.")}catch(M){g===Ae&&d(D,`Generation failed: ${M.message}. Your existing draft is preserved.`)}finally{g===Ae&&d(U,!1)}}async function Te(){if(!a(pe)||!a(L)||!a(Be))return!0;d(D,"");try{const g=a(ce),m=JSON.parse(g);if(!m||typeof m!="object"||Array.isArray(m))throw new Error("Format content must be a JSON object");const A=await Tt("/api/studio/save-edit",{storyId:a(L).id,format:a(ue),content:m,expectedRevision:a(L).revision});A.story?d(L,A.story,!0):A.revision!==void 0&&(a(L).revision=A.revision),a(pe)[a(ue)]=m,a(L).campaignDraft=a(pe);const S=a(Z).find(M=>M.id===a(L).id);return S&&(S.campaignDraft=a(pe)),d(Be,a(ce)!==g),d(q,a(Be)?"Saved the submitted edit. Newer changes remain unsaved.":"Changes saved.",!0),!a(Be)}catch(g){return d(D,`Could not save: ${g.message}. Your editor text is still here.`),!1}}async function Lt(){if(a(L))try{const g=await Tt("/api/studio/schedule",{storyId:a(L).id,status:"Scheduled",scheduledDay:a(Dt)});d(L,g.story||{...a(L),scheduledDay:a(Dt),status:"Scheduled"},!0),d(Z,g.backlog||a(Z),!0),d(z,g.calendar||a(z),!0),d(q,`Assigned to ${a(Dt)}. This does not publish to Instagram.`)}catch(g){d(D,g.message,!0)}}async function Mt(){var g,m;if(!(!await Te()||!a(L)||!a(pe))){d(U,!0),d(D,""),d(jt,"");try{const A=await Tt("/api/studio/export-asset",{storyId:a(L).id,format:a(ue),content:a(pe)[a(ue)]});if(d(jt,A.downloadUrl||((g=A.artifact)==null?void 0:g.downloadUrl)||"",!0),d(yi,A.filename||((m=A.artifact)==null?void 0:m.filename)||"Download export",!0),!a(jt))throw new Error("Server did not return a downloadable artifact");d(Z,A.backlog||a(Z),!0),d(z,A.calendar||a(z),!0),d(L,a(Z).find(S=>S.id===a(L).id)||a(L),!0),d(q,"Export created. Download the actual file below.")}catch(A){d(D,`Export failed: ${A.message}`)}finally{d(U,!1)}}}function Wt(){d(lt,[...a(lt),{id:crypto.randomUUID(),text:"",sourceUrl:"",kind:"",status:"unreviewed"}],!0)}function At(g){d(lt,a(lt).filter(m=>m.id!==g),!0)}async function at(){var A,S;if(!a(L)||a(U)||a(Be))return;const g=Ae,m=a(L).id;try{const M=await br("/api/studio/bootstrap");if(g!==Ae||((A=a(L))==null?void 0:A.id)!==m)return;const V=(S=M.backlog)==null?void 0:S.find(J=>J.id===m);if(!V)throw new Error("Story is no longer available in this brand.");d(Z,M.backlog,!0),za(V),d(D,""),d(q,"Saved review reloaded. Unsaved review edits were discarded.")}catch(M){g===Ae&&d(D,M.message,!0)}}async function wr(){var S,M;if(!a(L))return;if(!a(lt).length){d(D,"Add at least one sourced claim before saving the review.");return}d(D,"");const g=Ae,m=a(L).id,A=Ja(a(lt));try{const V=await Tt("/api/studio/source-claims",{storyId:m,sourceClaims:a(lt),expectedRevision:a(L).revision});if(g!==Ae||((S=a(L))==null?void 0:S.id)!==m)return;if(V.story){d(L,V.story,!0);const J=(V.story.sourceClaims||[]).map(_e=>({..._e}));Ja(a(lt))===A&&d(lt,J,!0),d(Qi,Ja(J),!0);const de=a(Z).findIndex(_e=>_e.id===a(L).id);de>=0&&(a(Z)[de]=a(L))}d(q,"Source review saved. Only approved sourced claims can enter generation.")}catch(V){g===Ae&&((M=a(L))==null?void 0:M.id)===m&&d(D,V.message,!0)}}async function qt(g){g.preventDefault();try{const A=Object.fromEntries(["brandName","websiteUrl","tagline","mission","fonts","colors","logoText","strategy","valueGroups","pillars"].filter(M=>a(F)[M]!==void 0).map(M=>[M,a(F)[M]]));A.fonts={heading:n(a(F).fonts.heading),body:n(a(F).fonts.body)};const S=await Tt("/api/studio/brand-profile",A);d(F,S.brandProfile||a(F),!0),d(q,"Brand profile saved for this brand.")}catch(m){d(D,m.message,!0)}}async function yr(g){g.preventDefault();const m=a(Xi).split(`
`).map(A=>A.trim()).filter(Boolean);if(!m.length){d(D,"Add at least one supplied fact. The studio will not invent source facts.");return}try{const A=await Tt("/api/studio/backlog",{title:a(kn),category:a(mi),scheduledDay:a(Zi),verifiedFacts:m,sourceClaims:m.map((S,M)=>{var V;return{id:`claim_${M}`,text:S,sourceUrl:((V=a(Tn).split(`
`)[M])==null?void 0:V.trim())||"",status:"unreviewed"}}),sourceUrls:a(Tn).split(`
`).filter(Boolean),sourceStatus:"unreviewed"});d(Z,A.backlog||[A.story,...a(Z)],!0),d(z,A.calendar||a(z),!0),d(kn,""),d(Xi,""),d(Tn,""),d(q,"Story added. Supplied facts still need source review.")}catch(A){d(D,A.message,!0)}}async function Gt(){a(Q)==="backlog"&&Rn(),d(Q,"admin"),d(D,"");try{await(async g=>{var m=mf(g,3);d(gr,m[0],!0),d(ta,m[1],!0),d(Cn,m[2],!0)})(await Promise.all([br("/api/admin/overview"),br("/api/admin/context-graph"),fetch("/readyz").then(g=>g.json())]))}catch(g){d(D,g.message,!0)}}async function Qr(g){g.preventDefault();try{await Tt("/api/admin/organizations",{name:a(bi)});const m=await br("/api/auth/session",{},!1);d(b,m.organizations||a(b),!0),d(bi,""),d(q,"Organization created.")}catch(m){d(D,m.message,!0)}}async function Pn(g){g.preventDefault();try{await Tt("/api/admin/brands",{organizationId:a(w),name:a(wi),preset:a(ea)});const m=await br("/api/auth/session",{},!1);d(b,m.organizations||a(b),!0),d(wi,""),d(q,"Brand created.")}catch(m){d(D,m.message,!0)}}async function Zr(g=null){const m=Ae;d(U,!0),d(D,"");try{if(await Tt("/api/admin/run-weekly-batch",{idempotencyKey:crypto.randomUUID(),maxStories:5,...g?{retryOfJobId:g}:{}}),m!==Ae)return;await Xr(),await Gt(),d(q,g?"Retry completed. Previously completed drafts were preserved.":"Scoped batch completed. Review every generated draft.",!0)}catch(A){if(m!==Ae)return;await Gt(),d(D,A.message,!0)}finally{d(U,!1)}}async function Ir(g){if(!a(L)||!a(_))return;const m=++Rs,A=Ae;try{const S=await Tt("/api/studio/preflight",{storyId:a(L).id,expectedRevision:a(L).revision,...g});m===Rs&&A===Ae&&d(mr,S,!0)}catch(S){A===Ae&&d(mr,{error:S.message},!0)}}var tr=Us();zh("1n46o8q",g=>{var m=mm();$l(()=>{Cu.title="Liquidity Studio · Brand workspace"}),k(g,m)});var rr=Ze(tr);{var Zn=g=>{var m=bm();k(g,m)},sa=g=>{var m=Em(),A=p(m),S=l(p(A),6);{var M=de=>{var _e=wm(),Ce=E(_e,!0);B(()=>{_e.disabled=a(U),y(Ce,a(U)?"Signing in…":"Continue with Google")}),N("click",_e,Ps),k(de,_e)},V=de=>{var _e=ym(),Ce=p(_e),Ct=l(p(Ce)),pt=l(Ce),en=l(p(pt)),Er=l(pt),tn=E(Er,!0);B(()=>{Er.disabled=a(U),y(tn,a(U)?"Signing in…":"Sign in →")}),Li("submit",_e,Ro),We(Ct,()=>a(T),Kt=>d(T,Kt)),We(en,()=>a(x),Kt=>d(x,Kt)),k(de,_e)};ae(S,de=>{a(o)==="google"?de(M):a(o)==="password"&&de(V,1)})}var J=l(S,2);{var ee=de=>{var _e=Im(),Ce=E(_e,!0);B(()=>y(Ce,a(D))),k(de,_e)};ae(J,de=>{a(D)&&de(ee)})}k(g,m)},Wa=g=>{var m=Tb(),A=p(m),S=p(A),M=l(S,2),V=p(M),J=l(p(V));Pe(J,21,()=>a(b),G=>G.id,(G,ne)=>{var se=Ni(),Ne=E(se,!0),Xe={};B(()=>{y(Ne,a(ne).name),Xe!==(Xe=a(ne).id)&&(se.value=(se.__value=Xe)??"")}),k(G,se)});var ee;lr(J);var de=l(V),_e=l(p(de));Pe(_e,21,()=>{var G;return((G=a(ra))==null?void 0:G.brands)||[]},G=>G.id,(G,ne)=>{var se=Ni(),Ne=E(se,!0),Xe={};B(()=>{y(Ne,a(ne).name),Xe!==(Xe=a(ne).id)&&(se.value=(se.__value=Xe)??"")}),k(G,se)});var Ce;lr(_e);var Ct=l(M,2),pt=p(Ct);Pe(pt,16,()=>[{id:"backlog",label:"Story backlog",icon:"▤"},{id:"calendar",label:"Content calendar",icon:"▦"},{id:"studio",label:"Campaign Studio",icon:"◧"},{id:"brand",label:"Brand Kit",icon:"◉"}],G=>G.id,(G,ne)=>{var se=Sm();let Ne;var Xe=p(se),ct=E(Xe,!0),bt=l(Xe,1,!0);B(()=>{Ne=cr(se,1,"",null,Ne,{active:a(Q)===ne.id}),y(ct,ne.icon),y(bt,ne.label)}),N("click",se,()=>Ns(ne.id)),k(G,se)});var en=l(pt);{var Er=G=>{var ne=km();let se;B(()=>{ne.disabled=a(Yr),se=cr(ne,1,"",null,se,{active:a(Q)==="admin"})}),N("click",ne,Gt),k(G,ne)};ae(en,G=>{a(na)&&G(Er)})}var tn=l(Ct,2),Kt=p(tn),ei=E(Kt,!0),rn=l(Kt,2),Sr=p(rn),Nr=E(Sr,!0),Ii=l(Sr),mt=E(Ii,!0),nr=l(rn,2),xn=l(A,2),qa=p(xn),Ei=p(qa),Nn=p(Ei),On=E(Nn),Os=l(Nn,2),Do=E(Os,!0),Si=l(Os,2),ki=E(Si,!0),ti=l(qa,2);{var Lo=G=>{var ne=Tm(),se=p(ne),Ne=l(se);B(()=>y(se,a(D))),N("click",Ne,()=>d(D,"")),k(G,ne)};ae(ti,G=>{a(D)&&G(Lo)})}var Ga=l(ti);{var jd=G=>{var ne=Am(),se=p(ne),Ne=l(se);B(()=>y(se,a(q))),N("click",Ne,()=>d(q,"")),k(G,ne)};ae(Ga,G=>{a(q)&&G(jd)})}var Wd=l(Ga,2);{var qd=G=>{var ne=Cm(),se=E(ne);B(()=>{var Ne;return y(se,`Loading ${(((Ne=a($a))==null?void 0:Ne.name)||"brand")??""} workspace…`)}),k(G,ne)},Gd=G=>{var ne=Rm(),se=l(p(ne),4);N("click",se,Xr),k(G,ne)},Kd=G=>{var ne=Lm(),se=Ze(ne),Ne=p(se),Xe=p(Ne),ct=l(p(Xe)),bt=E(ct),ir=l(Xe,2),nn=E(ir),vt=l(Ne,2),Rt=p(vt);Xu(Rt,H=>d(Vt,H),()=>a(Vt));var Jt=l(Rt),an=l(p(Jt));Pe(an,16,()=>[...new Set([...a(Z).map(H=>H.status),a(ke)].filter(H=>H!=="All"))],H=>H,(H,le)=>{var ye=Ni(),tt=E(ye,!0),Re={};B(()=>{y(tt,le),Re!==(Re=le)&&(ye.__value=Re)}),k(H,ye)}),lr(Jt);var Or=l(se,2);{var Ut=H=>{var le=Pm(),ye=p(le);{var tt=qe=>{var st=Yc(),ut=E(st);B(()=>y(ut,`Search: ${a(ot)??""}`)),k(qe,st)};ae(ye,qe=>{a(ot)&&qe(tt)})}var Re=l(ye,2);{var ve=qe=>{var st=Yc(),ut=E(st);B(()=>y(ut,`Status: ${a(ke)??""}`)),k(qe,st)};ae(Re,qe=>{a(ke)!=="All"&&qe(ve)})}var Ie=l(Re,2);N("click",Ie,xo),k(H,le)};ae(Or,H=>{a(Sn)&&H(Ut)})}var Dr=l(Or,2);Pe(Dr,21,()=>a(Ba),H=>H.id,(H,le)=>{var ye=xm(),tt=p(ye),Re=p(tt),ve=E(Re,!0),Ie=l(Re),qe=E(Ie,!0),st=l(tt,2),ut=p(st),Qe=E(ut,!0),kr=l(ut,2),Ft=E(kr,!0),Yt=l(kr,2),Mr=E(Yt,!0),sr=l(Yt,2),Ur=E(sr,!0),Fr=l(st,2),Ln=E(Fr);B(Tr=>{var Mn;y(ve,Tr),y(qe,a(le).campaignDraft?"DRAFT":"SOURCE"),y(Qe,a(le).category),y(Ft,a(le).title),y(Mr,((Mn=a(le).verifiedFacts)==null?void 0:Mn[0])||"Add source facts before generating."),y(Ur,a(le).status),y(Ln,`${a(le).campaignDraft?"Open draft":"Open story"} ↗`)},[()=>{var Tr;return((Tr=a(le).scheduledDay)==null?void 0:Tr.slice(0,3))||"—"}]),N("click",Fr,()=>Fe(a(le))),k(H,ye)},H=>{var le=Dm(),ye=p(le);{var tt=ve=>{var Ie=Nm();k(ve,Ie)},Re=ve=>{var Ie=Om();k(ve,Ie)};ae(ye,ve=>{a(Z).length?ve(tt):ve(Re,-1)})}k(H,le)});var ar=l(Dr,2),sn=l(p(ar),2),Lr=p(sn),Dn=l(p(Lr)),on=l(Lr),Ti=l(p(on)),ie=l(on),Se=l(p(ie));Pe(Se,20,()=>i,H=>H,(H,le)=>{var ye=Ni(),tt=E(ye,!0),Re={};B(()=>{y(tt,le),Re!==(Re=le)&&(ye.__value=Re)}),k(H,ye)}),lr(Se);var He=l(ie),wt=l(p(He)),ge=l(He),Ve=l(p(ge));B(()=>{y(bt,`${a(Ba).length??""} of ${a(Z).length??""}`),y(nn,`Showing ${a(Ba).length??""} of ${a(Z).length??""} stories.${a(ot)?` Search: ${a(ot)}.`:""}${a(ke)!=="All"?` Status: ${a(ke)}.`:""}`)}),We(Rt,()=>a(Ke),H=>d(Ke,H)),$r(Jt,()=>a(ke),H=>d(ke,H)),Li("submit",sn,yr),We(Dn,()=>a(kn),H=>d(kn,H)),We(Ti,()=>a(mi),H=>d(mi,H)),$r(Se,()=>a(Zi),H=>d(Zi,H)),We(wt,()=>a(Xi),H=>d(Xi,H)),We(Ve,()=>a(Tn),H=>d(Tn,H)),k(G,ne)},Jd=G=>{var ne=$m(),se=l(Ze(ne),2);Pe(se,20,()=>i,Ne=>Ne,(Ne,Xe)=>{var ct=Fm(),bt=p(ct),ir=E(bt,!0),nn=l(bt,2);Pe(nn,17,()=>a(Z).filter(vt=>vt.scheduledDay===Xe),vt=>vt.id,(vt,Rt)=>{var Jt=Mm(),an=p(Jt),Or=E(an,!0),Ut=l(an),Dr=E(Ut,!0),ar=l(Ut),sn=E(ar,!0);B(()=>{y(Or,a(Rt).category),y(Dr,a(Rt).title),y(sn,a(Rt).status)}),N("click",Jt,()=>Fe(a(Rt))),k(vt,Jt)},vt=>{var Rt=Um();k(vt,Rt)}),B(()=>y(ir,Xe)),k(Ne,ct)}),k(G,ne)},Yd=G=>{var ne=Us(),se=Ze(ne);{var Ne=ct=>{var bt=ob(),ir=Ze(bt),nn=p(ir),vt=l(p(nn),2),Rt=E(vt,!0),Jt=l(vt,2),an=E(Jt,!0),Or=l(nn,2),Ut=p(Or),Dr=E(Ut,!0),ar=l(Ut),sn=E(ar),Lr=l(ir,2),Dn=p(Lr);Ic(Dn,{get summary(){return a(An)},onclaim:Fa});var on=l(Lr,2);{var Ti=ge=>{var Ve=Bm(),H=p(Ve),le=E(H);B(()=>{ft(H,"href",a(jt)),ft(H,"download",a(yi)),y(le,`↓ ${a(yi)??""}`)}),N("click",H,xs),k(ge,Ve)};ae(on,ge=>{a(jt)&&ge(Ti)})}var ie=l(on,2);Pe(ie,21,()=>s,ge=>ge.id,(ge,Ve)=>{var H=Hm();let le;var ye=p(H),tt=l(ye),Re=E(tt,!0);B(()=>{le=cr(H,1,"",null,le,{active:a(ue)===a(Ve).id}),y(ye,a(Ve).name),y(Re,a(Ve).ratio)}),N("click",H,()=>it(a(Ve).id)),k(ge,H)});var Se=l(ie,2);{var He=ge=>{var Ve=rb(),H=p(Ve),le=p(H),ye=l(p(le),2),tt=E(ye,!0),Re=l(le,4),ve=p(Re);{var Ie=j=>{var $=zm(),me=Ze($),Me=l(p(me)),Oe=l(me,2);Pe(Oe,17,()=>a(xe).statRows||[],fa,(ze,Je,Ge)=>{var yt=Vm(),je=p(yt);je.nodeValue=`Fact ${Ge+1}`;var rt=l(je);B(()=>Xt(rt,a(Je))),N("input",rt,Pt=>X("statRows",Ge,null,Pt.currentTarget.value)),k(ze,yt)});var $e=l(Oe,2),De=l(p($e)),Le=l($e,2),fe=l(p(Le));B(()=>{Xt(Me,a(xe).headline||""),Xt(De,a(xe).bottomTakeaway||""),Xt(fe,a(xe).caption||"")}),N("input",Me,ze=>C("headline",ze.currentTarget.value)),N("input",De,ze=>C("bottomTakeaway",ze.currentTarget.value)),N("input",fe,ze=>C("caption",ze.currentTarget.value)),k(j,$)},qe=j=>{var $=Wm(),me=Ze($),Me=l(p(me)),Oe=l(me,2);Pe(Oe,17,()=>a(xe).slides||[],fa,($e,De,Le)=>{var fe=jm(),ze=p(fe);ze.textContent=`Slide ${Le+1}`;var Je=l(ze),Ge=l(p(Je)),yt=l(Je),je=l(p(yt)),rt=l(yt),Pt=l(p(rt));B(()=>{Xt(Ge,a(De).title||""),Xt(je,a(De).bodyMetric||""),Xt(Pt,a(De).visualNote||"")}),N("input",Ge,It=>X("slides",Le,"title",It.currentTarget.value)),N("input",je,It=>X("slides",Le,"bodyMetric",It.currentTarget.value)),N("input",Pt,It=>X("slides",Le,"visualNote",It.currentTarget.value)),k($e,fe)}),B(()=>Xt(Me,a(xe).coverHook||"")),N("input",Me,$e=>C("coverHook",$e.currentTarget.value)),k(j,$)},st=j=>{var $=qm(),me=Ze($),Me=l(p(me)),Oe=l(me),$e=l(p(Oe)),De=l(Oe),Le=l(p(De));B(()=>{Xt(Me,a(xe).hookBanner||""),Xt($e,a(xe).keyStatHighlight||""),Xt(Le,a(xe).interactiveStickerPrompt||"")}),N("input",Me,fe=>C("hookBanner",fe.currentTarget.value)),N("input",$e,fe=>C("keyStatHighlight",fe.currentTarget.value)),N("input",Le,fe=>C("interactiveStickerPrompt",fe.currentTarget.value)),k(j,$)},ut=j=>{var $=Jm(),me=Ze($),Me=l(p(me)),Oe=l(me);Pe(Oe,17,()=>a(xe).beats||[],fa,(Le,fe,ze)=>{var Je=Km(),Ge=p(Je);Ge.textContent=`Beat ${ze+1}`;var yt=l(Ge);Pe(yt,16,()=>["timecode","voiceover","onScreenText","bRollDirection"],je=>je,(je,rt)=>{var Pt=Gm(),It=p(Pt),ln=l(It);B(()=>{y(It,rt),Xt(ln,a(fe)[rt]||""),ft(ln,"rows",rt==="timecode"?1:3)}),N("input",ln,Ds=>X("beats",ze,rt,Ds.currentTarget.value)),k(je,Pt)}),k(Le,Je)});var $e=l(Oe),De=l(p($e));B(()=>{Xt(Me,a(xe).spokenHook0to3s||""),Xt(De,a(xe).closingCta||"")}),N("input",Me,Le=>C("spokenHook0to3s",Le.currentTarget.value)),N("input",De,Le=>C("closingCta",Le.currentTarget.value)),k(j,$)};ae(ve,j=>{a(ue)==="infographic"?j(Ie):a(ue)==="carousel"?j(qe,1):a(ue)==="story"?j(st,2):j(ut,-1)})}var Qe=l(Re,2),kr=l(p(Qe)),Ft=l(p(kr)),Yt=l(Qe,2),Mr=l(Yt,2),sr=p(Mr),Ur=l(p(sr));Pe(Ur,20,()=>i,j=>j,(j,$)=>{var me=Ni(),Me=E(me,!0),Oe={};B(()=>{y(Me,$),Oe!==(Oe=$)&&(me.__value=Oe)}),k(j,me)}),lr(Ur);var Fr=l(sr),Ln=l(Mr,2),Tr=l(p(Ln),4);Pe(Tr,19,()=>a(lt),j=>j.id,(j,$,me)=>{var Me=Zm(),Oe=p(Me),$e=E(Oe),De=l(Oe),Le=E(De),fe=l(De),ze=l(p(fe)),Je=l(fe),Ge=l(p(Je)),yt=l(Je),je=l(p(yt)),rt=p(je);rt.value=rt.__value="";var Pt=l(rt);Pt.value=Pt.__value="general";var It=l(Pt);It.value=It.__value="financial";var ln=l(It);ln.value=ln.__value="cultural";var Ds=l(ln);Ds.value=Ds.__value="clinical",lr(je);var rc=l(yt);{var Zd=Et=>{var Ls=Us(),rf=Ze(Ls);{var nf=oa=>{var Ms=Ym(),sf=p(Ms);ao(sf,()=>a($).clinicalReviewRequested,of=>a($).clinicalReviewRequested=of),k(oa,Ms)},af=oa=>{var Ms=Xm();k(oa,Ms)};ae(rf,oa=>{a(na)?oa(nf):oa(af,-1)})}k(Et,Ls)};ae(rc,Et=>{a($).kind==="clinical"&&Et(Zd)})}var nc=l(rc),Mo=l(p(nc)),Uo=p(Mo);Uo.value=Uo.__value="unreviewed";var Fo=l(Uo);Fo.value=Fo.__value="approved";var ic=l(Fo);ic.value=ic.__value="rejected",lr(Mo);var ef=l(nc);{var tf=Et=>{var Ls=Qm();k(Et,Ls)};ae(ef,Et=>{a($).kind==="clinical"&&Et(tf)})}B(Et=>{ft(Me,"id",Et),y($e,`Claim ${a(me)+1}`),ft(De,"aria-label",`Remove claim ${a(me)+1}`),y(Le,`Remove claim ${a(me)+1}`)},[()=>`source-claim-${encodeURIComponent(a($).id)}`]),N("click",De,()=>At(a($).id)),We(ze,()=>a($).text,Et=>a($).text=Et),We(Ge,()=>a($).sourceUrl,Et=>a($).sourceUrl=Et),$r(je,()=>a($).kind,Et=>a($).kind=Et),$r(Mo,()=>a($).status,Et=>a($).status=Et),k(j,Me)});var Mn=l(Tr),Ai=l(Mn),ri=l(Ai),Ci=l(Ln,2);{var Ri=j=>{var $=eb(),me=E($);B(()=>y(me,`Preflight could not be recorded: ${a(mr).error??""}`)),k(j,$)},Pi=j=>{var $=tb();k(j,$)};ae(Ci,j=>{var $;($=a(mr))!=null&&$.error?j(Ri):a(mr)&&j(Pi,1)})}var xi=l(H,2);$h(xi,()=>a(w)+a(I)+a(L).id+a(ue),j=>{xp(j,{get campaign(){return a(pe)},get brandProfile(){return a(F)},get format(){return a(ue)},get backlog(){return a(Z)},get activeStoryId(){return a(L).id},onpreflight:Ir})}),B(()=>{y(tt,a(Be)?"Unsaved changes":"Saved draft"),Yt.disabled=!a(Be)||a(U),ri.disabled=a(U)||a(Be)}),N("input",Ft,()=>{d(Be,!0);try{d(xe,JSON.parse(a(ce)),!0)}catch{}}),We(Ft,()=>a(ce),j=>d(ce,j)),N("click",Yt,Te),$r(Ur,()=>a(Dt),j=>d(Dt,j)),N("click",Fr,Lt),N("click",Mn,Wt),N("click",Ai,wr),N("click",ri,at),k(ge,Ve)},wt=ge=>{var Ve=sb(),H=Ze(Ve),le=l(p(H),4);Pe(le,23,()=>a(lt),ut=>ut.id,(ut,Qe,kr)=>{var Ft=ab(),Yt=p(Ft),Mr=E(Yt),sr=l(Yt),Ur=E(sr),Fr=l(sr),Ln=l(p(Fr)),Tr=l(Fr),Mn=l(p(Tr)),Ai=l(Tr),ri=l(p(Ai)),Ci=p(ri);Ci.value=Ci.__value="";var Ri=l(Ci);Ri.value=Ri.__value="general";var Pi=l(Ri);Pi.value=Pi.__value="financial";var xi=l(Pi);xi.value=xi.__value="cultural";var j=l(xi);j.value=j.__value="clinical",lr(ri);var $=l(Ai);{var me=fe=>{var ze=Us(),Je=Ze(ze);{var Ge=je=>{var rt=nb(),Pt=p(rt);ao(Pt,()=>a(Qe).clinicalReviewRequested,It=>a(Qe).clinicalReviewRequested=It),k(je,rt)},yt=je=>{var rt=ib();k(je,rt)};ae(Je,je=>{a(na)?je(Ge):je(yt,-1)})}k(fe,ze)};ae($,fe=>{a(Qe).kind==="clinical"&&fe(me)})}var Me=l($),Oe=l(p(Me)),$e=p(Oe);$e.value=$e.__value="unreviewed";var De=l($e);De.value=De.__value="approved";var Le=l(De);Le.value=Le.__value="rejected",lr(Oe),B(fe=>{ft(Ft,"id",fe),y(Mr,`Claim ${a(kr)+1}`),ft(sr,"aria-label",`Remove claim ${a(kr)+1}`),y(Ur,`Remove claim ${a(kr)+1}`)},[()=>`source-claim-${encodeURIComponent(a(Qe).id)}`]),N("click",sr,()=>At(a(Qe).id)),We(Ln,()=>a(Qe).text,fe=>a(Qe).text=fe),We(Mn,()=>a(Qe).sourceUrl,fe=>a(Qe).sourceUrl=fe),$r(ri,()=>a(Qe).kind,fe=>a(Qe).kind=fe),$r(Oe,()=>a(Qe).status,fe=>a(Qe).status=fe),k(ut,Ft)});var ye=l(le,2),tt=l(ye,2),Re=l(tt),ve=l(H,2),Ie=l(p(ve),6);Ic(Ie,{get summary(){return a(An)},onclaim:Fa});var qe=l(Ie,2),st=E(qe,!0);B(()=>{Re.disabled=a(U)||a(Be),qe.disabled=a(U)||!a(An).ready,y(st,a(U)?"Generating…":"Generate four-format draft")}),N("click",ye,Wt),N("click",tt,wr),N("click",Re,at),N("click",qe,gt),k(ge,Ve)};ae(Se,ge=>{a(pe)?ge(He):ge(wt,-1)})}B(()=>{y(Rt,a(L).title),y(an,a(pe)?a(Co):"No generated draft yet"),Ut.disabled=a(U)||!a(An).ready,y(Dr,a(U)?"Working…":a(pe)?"Regenerate draft":"Generate draft"),ar.disabled=a(U)||!a(pe),y(sn,`Export ${a(ue)==="carousel"?"ZIP":a(ue)==="reel"?"script":"PNG"} ↗`)}),N("click",Ut,gt),N("click",ar,Mt),k(ct,bt)},Xe=ct=>{var bt=lb(),ir=l(p(bt),4);N("click",ir,()=>d(Q,"backlog")),k(ct,bt)};ae(se,ct=>{a(L)?ct(Ne):ct(Xe,-1)})}k(G,ne)},Xd=G=>{var ne=bb(),se=Ze(ne),Ne=p(se),Xe=l(p(Ne)),ct=l(Ne),bt=l(p(ct)),ir=l(ct),nn=l(p(ir)),vt=l(ir),Rt=l(p(vt)),Jt=l(vt),an=l(p(Jt)),Or=l(Jt),Ut=l(p(Or));Pe(Ut,20,()=>r,ie=>ie,(ie,Se)=>{var He=Ni(),wt=E(He,!0),ge={};B(()=>{y(wt,Se),ge!==(ge=Se)&&(He.value=(He.__value=ge)??"")}),k(ie,He)}),lr(Ut);var Dr=l(Or),ar=l(p(Dr));Pe(ar,20,()=>r,ie=>ie,(ie,Se)=>{var He=Ni(),wt=E(He,!0),ge={};B(()=>{y(wt,Se),ge!==(ge=Se)&&(He.value=(He.__value=ge)??"")}),k(ie,He)}),lr(ar);var sn=l(Dr,2);Pe(sn,21,()=>a(F).colors||[],ie=>ie.name,(ie,Se,He)=>{var wt=cb(),ge=p(wt),Ve=l(ge),H=p(Ve),le=l(H);B(()=>{y(ge,`${a(Se).name??""} `),ft(H,"aria-label",`${a(Se).name??""} color`),ft(le,"aria-label",`${a(Se).name??""} hex`)}),We(H,()=>a(Se).hex,ye=>a(Se).hex=ye),We(le,()=>a(Se).hex,ye=>a(Se).hex=ye),k(ie,wt)});var Lr=l(se,2);{var Dn=ie=>{var Se=_b(),He=l(p(Se),6),wt=E(He,!0),ge=l(He,2),Ve=p(ge),H=l(p(Ve),2);Pe(H,19,()=>a(F).strategy.valueGroups||[],(ve,Ie)=>typeof ve=="string"?ve:ve.id||Ie,(ve,Ie)=>{var qe=db(),st=p(qe),ut=E(st,!0),Qe=l(st,2);{var kr=Ft=>{var Yt=ub(),Mr=Ze(Yt),sr=E(Mr,!0),Ur=l(Mr,2),Fr=E(Ur,!0);B(()=>{y(sr,a(Ie).ageRange||""),y(Fr,a(Ie).motivation||"")}),k(Ft,Yt)};ae(Qe,Ft=>{typeof a(Ie)=="object"&&Ft(kr)})}B(()=>y(ut,typeof a(Ie)=="string"?a(Ie):a(Ie).name)),k(ve,qe)},ve=>{var Ie=fb();k(ve,Ie)});var le=l(Ve,2),ye=l(p(le),2);Pe(ye,20,()=>a(F).strategy.pillars||[],ve=>ve,(ve,Ie)=>{var qe=hb(),st=p(qe),ut=E(st,!0);B(()=>y(ut,Ie)),k(ve,qe)},ve=>{var Ie=pb();k(ve,Ie)});var tt=l(ge,2);{var Re=ve=>{var Ie=vb();k(ve,Ie)};ae(tt,ve=>{a(F).strategy.clinicalClaimsQuarantined&&ve(Re)})}B(()=>y(wt,a(F).strategy.status||"Proposed positioning")),k(ie,Se)};ae(Lr,ie=>{a(F).strategy&&ie(Dn)})}var on=l(Lr,2),Ti=l(p(on),4);Pe(Ti,17,()=>a(Z).filter(ie=>ie.category==="Source research"),ie=>ie.id,(ie,Se)=>{var He=gb(),wt=p(He),ge=p(wt),Ve=E(ge,!0),H=l(ge,2),le=E(H,!0),ye=l(wt,2);B(()=>{y(Ve,a(Se).title),y(le,a(Se).reviewStatus||"Unreviewed research")}),N("click",ye,()=>Fe(a(Se))),k(ie,He)},ie=>{var Se=mb();k(ie,Se)}),Li("submit",se,qt),We(Xe,()=>a(F).brandName,ie=>a(F).brandName=ie),We(bt,()=>a(F).websiteUrl,ie=>a(F).websiteUrl=ie),We(nn,()=>a(F).tagline,ie=>a(F).tagline=ie),We(Rt,()=>a(F).mission,ie=>a(F).mission=ie),We(an,()=>a(F).logoText,ie=>a(F).logoText=ie),$r(Ut,()=>a(F).fonts.heading,ie=>a(F).fonts.heading=ie),$r(ar,()=>a(F).fonts.body,ie=>a(F).fonts.body=ie),k(G,ne)},Qd=G=>{var ne=kb(),se=p(ne),Ne=p(se),Xe=l(p(Ne),2),ct=l(Ne,4),bt=p(ct),ir=p(bt),nn=E(ir,!0),vt=l(bt,2),Rt=p(vt),Jt=E(Rt,!0),an=l(vt,2),Or=p(an),Ut=E(Or,!0),Dr=l(ct,2),ar=l(p(Dr),2),sn=E(ar,!0),Lr=l(se,2),Dn=l(p(Lr),2),on=l(Dn,2),Ti=E(on),ie=l(on,6);Pe(ie,21,()=>{var j,$,me;return((me=($=(j=a(gr))==null?void 0:j.observability)==null?void 0:$.jobs)==null?void 0:me.slice(0,10))||[]},j=>j.jobId,(j,$)=>{var me=yb(),Me=p(me),Oe=E(Me,!0),$e=l(Me),De=l($e),Le=E(De),fe=l(De,2);{var ze=Je=>{var Ge=wb(),yt=E(Ge,!0);B(je=>{Ge.disabled=a(U),ft(Ge,"aria-label",je),y(yt,a($).status==="FAILED"?"Retry failed batch":"Retry interrupted batch")},[()=>`${a($).status==="FAILED"?"Retry failed batch":"Retry interrupted batch"} ${a($).jobId.slice(0,8)}`]),N("click",Ge,()=>Zr(a($).jobId)),k(Je,Ge)};ae(fe,Je=>{(a($).status==="FAILED"||a($).status==="INTERRUPTED")&&Je(ze)})}B(Je=>{var Ge;y(Oe,a($).status),y($e,` · Attempt ${(a($).attempt||1)??""} `),y(Le,`${(((Ge=a($).completedStoryIds)==null?void 0:Ge.length)||0)??""} completed stories
                    ${Je??""}`)},[()=>a($).retryOfJobId?` · Retry of ${a($).retryOfJobId.slice(0,8)}`:""]),k(j,me)},j=>{var $=Ib();k(j,$)});var Se=l(Lr,2),He=l(p(Se),2),wt=p(He),ge=l(p(wt)),Ve=l(He,2),H=p(Ve),le=p(H),ye=l(le),tt=l(H),Re=l(p(tt)),ve=p(Re);ve.value=ve.__value="liquidity_desk";var Ie=l(ve);Ie.value=Ie.__value="vedic_dharma",lr(Re);var qe=l(Se,2),st=l(p(qe),2),ut=p(st),Qe=p(ut),kr=E(Qe,!0),Ft=l(ut,2),Yt=p(Ft),Mr=E(Yt,!0),sr=l(Ft,2),Ur=p(sr),Fr=E(Ur,!0),Ln=l(st,4),Tr=p(Ln),Mn=l(p(Tr));Pe(Mn,21,()=>{var j,$;return(($=(j=a(gr))==null?void 0:j.observability)==null?void 0:$.traces)||[]},j=>j.traceId,(j,$)=>{var me=Eb(),Me=p(me),Oe=E(Me,!0),$e=l(Me),De=E($e,!0),Le=l($e),fe=E(Le,!0),ze=l(Le),Je=E(ze);B(()=>{y(Oe,a($).status),y(De,a($).provider),y(fe,a($).model),y(Je,`${a($).latencyMs??""} ms`)}),k(j,me)},j=>{var $=Sb();k(j,$)});var Ai=l(Ln,2),ri=l(p(Ai),2),Ci=E(ri,!0),Ri=l(qe,2),Pi=l(p(Ri),2),xi=E(Pi,!0);B((j,$,me,Me)=>{var Oe,$e,De,Le,fe,ze,Je,Ge,yt,je,rt,Pt,It,ln;y(nn,((Oe=a(Cn))==null?void 0:Oe.status)||"Unknown"),y(Jt,((De=($e=a(Cn))==null?void 0:$e.checks)==null?void 0:De.repository)||"Unknown"),y(Ut,((fe=(Le=a(Cn))==null?void 0:Le.checks)==null?void 0:fe.generationProvider)||"Not checked"),y(sn,j),Dn.disabled=a(U),ft(Ti,"href",$),y(le,`New brand in ${((ze=a(ra))==null?void 0:ze.name)??""}`),y(kr,((yt=(Ge=(Je=a(gr))==null?void 0:Je.observability)==null?void 0:Ge.traces)==null?void 0:yt.length)||0),y(Mr,((rt=(je=a(gr))==null?void 0:je.observability)==null?void 0:rt.usageEvents)||0),y(Fr,((ln=(It=(Pt=a(gr))==null?void 0:Pt.observability)==null?void 0:It.operationalEvents)==null?void 0:ln.length)||0),y(Ci,me),y(xi,Me)},[()=>JSON.stringify(a(Cn),null,2),()=>"/api/admin/backprop-jsonl?"+Ha(),()=>JSON.stringify(a(gr),null,2),()=>JSON.stringify(a(ta),null,2)]),N("click",Xe,Gt),N("click",Dn,()=>Zr()),Li("submit",He,Qr),We(ge,()=>a(bi),j=>d(bi,j)),Li("submit",Ve,Pn),We(ye,()=>a(wi),j=>d(wi,j)),$r(Re,()=>a(ea),j=>d(ea,j)),k(G,ne)};ae(Wd,G=>{a(Yr)?G(qd):a(Ye)?G(Gd,1):a(Q)==="backlog"?G(Kd,2):a(Q)==="calendar"?G(Jd,3):a(Q)==="studio"?G(Yd,4):a(Q)==="brand"&&a(F)?G(Xd,5):a(Q)==="admin"&&a(na)&&G(Qd,6)})}B(G=>{var ne,se;ee!==(ee=a(w))&&(J.value=(J.__value=ee)??"",io(J,ee)),Ce!==(Ce=a(I))&&(_e.value=(_e.__value=Ce)??"",io(_e,Ce)),y(ei,G),y(Nr,a(_).username),y(mt,a(_).role),y(On,`${(((ne=a(ra))==null?void 0:ne.name)||"ORGANIZATION")??""} / ${(((se=a($a))==null?void 0:se.name)||"BRAND")??""}`),y(Do,a(Q)==="backlog"?"Good stories, next up.":a(Q)==="calendar"?"Make room for the week.":a(Q)==="studio"?"Campaign Studio":a(Q)==="brand"?"Your brand, clearly.":"Studio operations"),y(ki,a(Q)==="studio"?"Edit the substance. Inspect the surface. Export with context.":"A focused workspace for source-backed editorial work.")},[()=>{var G;return(G=a(_).username)==null?void 0:G.slice(0,2)}]),N("click",S,G=>{G.preventDefault(),Ns("backlog")}),N("change",J,No),N("change",_e,Oo),N("click",nr,Po),k(g,m)};ae(rr,g=>{a(W)?g(Zn):a(_)?g(Wa,-1):g(sa,1)})}k(t,tr),Io()}Vl(["click","change","input"]);Lh(Ab,{target:document.getElementById("app")});
