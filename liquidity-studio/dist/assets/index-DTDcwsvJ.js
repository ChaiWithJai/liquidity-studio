var Sd=Object.defineProperty;var Dl=t=>{throw TypeError(t)};var kd=(t,e,r)=>e in t?Sd(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var ir=(t,e,r)=>kd(t,typeof e!="symbol"?e+"":e,r),_o=(t,e,r)=>e.has(t)||Dl("Cannot "+r);var v=(t,e,r)=>(_o(t,e,"read from private field"),r?r.call(t):e.get(t)),se=(t,e,r)=>e.has(t)?Dl("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),re=(t,e,r,n)=>(_o(t,e,"write to private field"),n?n.call(t,r):e.set(t,r),r),ne=(t,e,r)=>(_o(t,e,"access private method"),r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function r(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=r(i);fetch(i.href,s)}})();const Tc=!1;var Js=Array.isArray,Td=Array.prototype.indexOf,Da=Array.prototype.includes,Ys=Array.from,Ac=Object.defineProperty,ji=Object.getOwnPropertyDescriptor,Ad=Object.getOwnPropertyDescriptors,Cd=Object.prototype,Rd=Array.prototype,Cc=Object.getPrototypeOf,Ll=Object.isExtensible;const Pd=()=>{};function xd(t){for(var e=0;e<t.length;e++)t[e]()}function Rc(){var t,e,r=new Promise((n,i)=>{t=n,e=i});return{promise:r,resolve:t,reject:e}}function Nd(t,e){if(Array.isArray(t))return t;if(!(Symbol.iterator in t))return Array.from(t);const r=[];for(const n of t)if(r.push(n),r.length===e)break;return r}const Nt=2,aa=4,Xs=8,Pc=1<<24,Hr=16,qr=32,ei=64,Mo=128,sl=256,Wr=512,ht=1024,at=2048,Er=4096,$t=8192,kt=16384,ha=32768,La=1<<25,sa=65536,Ns=1<<17,xc=1<<18,pa=1<<19,Od=1<<20,an=1<<25,Os=1<<21,qi=1<<22,Xn=1<<23,Ai=Symbol("$state"),Nc=Symbol("component"),Dd=Symbol("legacy props"),Ld=Symbol(""),Is=Symbol("attributes"),Uo=Symbol("class"),Fo=Symbol("style"),Sa=Symbol("text"),Es=Symbol("form reset"),Ga=new class extends Error{constructor(){super(...arguments);ir(this,"name","StaleReactionError");ir(this,"message","The reaction that called `getAbortSignal()` was re-run or destroyed")}};var Ec;const Md=!!((Ec=globalThis.document)!=null&&Ec.contentType)&&globalThis.document.contentType.includes("xml"),Ud=1,Fd=2,Oc=4,$d=8,Bd=16,Hd=1,Vd=4,zd=8,Wd=16,jd=1,qd=2,Dc={},ft=Symbol("uninitialized"),Lc="http://www.w3.org/1999/xhtml",Gd="http://www.w3.org/2000/svg",Kd="http://www.w3.org/1998/Math/MathML";function Jd(){console.warn("https://svelte.dev/e/derived_inert")}function Yd(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function Xd(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}let Mc=!1;function Uc(t){return t===this.v}function Qd(t,e){return t!=t?e==e:t!==e||t!==null&&typeof t=="object"||typeof t=="function"}function Fc(t){return!Qd(t,this.v)}function Zd(t){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function ef(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function tf(t,e,r){throw new Error("https://svelte.dev/e/each_key_duplicate")}function rf(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function nf(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function af(t){throw new Error("https://svelte.dev/e/effect_orphan")}function sf(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function of(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function lf(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function cf(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function uf(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function df(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}let ff=!1,xt=null;function oa(t){xt=t}function ol(t,e=!1,r){xt={p:xt,i:!1,c:null,e:null,s:t,x:null,r:ve,l:null}}function ll(t){var e=xt,r=e.e;if(r!==null){e.e=null;for(var n of r)ou(n)}return e.i=!0,xt=e.p,cl(t)}function cl(t={}){return Ac(t,Nc,{value:!0}),t}function $c(){return!0}let mi=[];function Bc(){var t=mi;mi=[],xd(t)}function Tn(t){if(mi.length===0&&!Pa){var e=mi;queueMicrotask(()=>{e===mi&&Bc()})}mi.push(t)}function hf(){for(;mi.length>0;)Bc()}const pf=-7169;function Ze(t,e){t.f=t.f&pf|e}function ul(t){(t.f&Wr)!==0||t.deps===null?Ze(t,ht):Ze(t,Er)}function Hc(t,e,r){(t.f&at)!==0?e.add(t):(t.f&Er)!==0&&r.add(t),Ze(t,ht)}let Ml=!1;function vf(){Ml||(Ml=!0,document.addEventListener("reset",t=>{Promise.resolve().then(()=>{var e;if(!t.defaultPrevented)for(const r of t.target.elements)(e=r[Es])==null||e.call(r)})},{capture:!0}))}function va(t){var e=ue,r=ve;Sr(null),cn(null);try{return t()}finally{Sr(e),cn(r)}}function dl(t,e,r,n=r){t.addEventListener(e,()=>va(r));const i=t[Es];i?t[Es]=()=>{i(),n(!0)}:t[Es]=()=>n(!0),vf()}function _f(t,e,r,n){const i=Ma;var s=t.filter(w=>!w.settled),o=e.map(i);if(r.length===0&&s.length===0){n(o);return}var c=ve,u=gf(),f=s.length===1?s[0].promise:s.length>1?Promise.all(s.map(w=>w.promise)):null;function p(w){if((c.f&kt)===0){u();try{n([...o,...w])}catch(S){rn(S,c)}Ds()}}var g=Vc();if(r.length===0){f.then(()=>p([])).finally(g);return}function m(){Promise.all(r.map(w=>mf(w))).then(p).catch(w=>rn(w,c)).finally(g)}f?f.then(()=>{if((c.f&kt)!==0){g();return}u(),m(),Ds()}):m()}function gf(){var t=ve,e=ue,r=xt,n=H;return function(s=!0){cn(t),Sr(e),oa(r),s&&(t.f&kt)===0&&(n==null||n.activate(),n==null||n.apply())}}function Ds(t=!0){cn(null),Sr(null),oa(null),t&&(H==null||H.deactivate())}function Vc(){var t=ve,e=t.b,r=H,n=!!(e!=null&&e.is_rendered());return e==null||e.update_pending_count(1,r),r.increment(n,t),()=>{e==null||e.update_pending_count(-1,r),r.decrement(n,t)}}function Ma(t){var e=Nt|at;return ve!==null&&(ve.f|=pa),{ctx:xt,deps:null,effects:null,equals:Uc,f:e,fn:t,reactions:null,rv:0,v:ft,wv:0,parent:ve,ac:null}}const ka=Symbol("obsolete");function mf(t,e,r){let n=ve;n===null&&ef();var i=void 0,s=Oi(ft),o=!ue,c=new Set;return Of(()=>{var w,S;var u=ve,f=Rc();i=f.promise;try{Promise.resolve(t()).then(f.resolve,N=>{N!==Ga&&f.reject(N)}).finally(Ds)}catch(N){f.reject(N),Ds()}var p=H;if(o){if((u.f&ha)!==0)var g=Vc();if((w=n.b)!=null&&w.is_rendered())(S=p.async_deriveds.get(u))==null||S.reject(ka);else for(const N of c.values())N.reject(ka);c.add(f),p.async_deriveds.set(u,f)}const m=(N,I=void 0)=>{g==null||g(),c.delete(f),I!==ka&&(p.activate(),I?(s.f|=Xn,la(s,I)):((s.f&Xn)!==0&&(s.f^=Xn),la(s,N)),p.deactivate())};f.promise.then(m,N=>m(null,N||"unknown"))}),_l(()=>{for(const u of c)u.reject(ka)}),new Promise(u=>{function f(p){function g(){p===i?u(s):f(i)}p.then(g,g)}f(i)})}function Ft(t){const e=Ma(t);return hu(e),e}function zc(t){const e=Ma(t);return e.equals=Fc,e}function bf(t){var e=t.effects;if(e!==null){t.effects=null;for(var r=0;r<e.length;r+=1)Xt(e[r])}}function fl(t){var e,r=ve,n=t.parent;if(!Nn&&n!==null&&t.v!==ft&&(n.f&(kt|$t))!==0)return Jd(),t.v;cn(n);try{bf(t),e=gu(t)}finally{cn(r)}return e}function Wc(t){var e=fl(t);if(!t.equals(e)&&(t.wv=vu(),(!(H!=null&&H.is_fork)||t.deps===null)&&(H!==null?(H.capture(t,e,!0),Qn==null||Qn.capture(t,e,!0)):t.v=e,t.deps===null))){Ze(t,ht);return}Nn||(St!==null?(vl()||H!=null&&H.is_fork)&&St.set(t,e):ul(t))}function wf(t){var e;if(t.effects!==null)for(const r of t.effects)(r.teardown||r.ac)&&((e=r.teardown)==null||e.call(r),r.ac!==null&&va(()=>{r.ac.abort(Ga),r.ac=null}),r.fn!==null&&(r.teardown=Pd),Ua(r,0),ml(r))}function jc(t){if(t.effects!==null)for(const e of t.effects)e.teardown&&e.fn!==null&&ca(e)}let go=null,zi=null,H=null,Qn=null,St=null,$o=null,Pa=!1,mo=!1,xa=null,Ss=null;var Ul=0;let yf=1;var Qi,Jn,Ii,Zi,ea,ta,In,ra,or,Va,En,$r,Zr,na,Ei,we,Bo,Ho,Ta,Vo,qc,Gc,Wi,If,Aa;const qs=class qs{constructor(){se(this,we);ir(this,"id",yf++);se(this,Qi,!1);ir(this,"linked",!0);se(this,Jn,null);se(this,Ii,null);ir(this,"async_deriveds",new Map);ir(this,"current",new Map);ir(this,"previous",new Map);se(this,Zi,new Set);se(this,ea,new Set);se(this,ta,0);se(this,In,new Map);se(this,ra,null);se(this,or,[]);se(this,Va,[]);se(this,En,new Set);se(this,$r,new Set);se(this,Zr,new Map);se(this,na,new Set);ir(this,"is_fork",!1);se(this,Ei,!1);zi===null?go=zi=this:(re(zi,Ii,this),re(this,Jn,zi)),zi=this}skip_effect(e){v(this,Zr).has(e)||v(this,Zr).set(e,{d:[],m:[]}),v(this,na).delete(e)}unskip_effect(e,r=n=>this.schedule(n)){var n=v(this,Zr).get(e);if(n){v(this,Zr).delete(e);for(var i of n.d)Ze(i,at),r(i);for(i of n.m)Ze(i,Er),r(i)}v(this,na).add(e)}capture(e,r,n=!1){e.v!==ft&&!this.previous.has(e)&&this.previous.set(e,e.v),(e.f&Xn)===0&&(this.current.set(e,[r,n]),St==null||St.set(e,r)),this.is_fork||(e.v=r)}activate(){H=this}deactivate(){H=null,St=null}flush(){try{mo=!0,H=this,ne(this,we,Ta).call(this)}finally{Ul=0,$o=null,xa=null,Ss=null,mo=!1,H=null,St=null,sn.clear()}}discard(){var e;for(const r of v(this,ea))r(this);v(this,ea).clear();for(const r of this.async_deriveds.values())r.reject(ka);ne(this,we,Aa).call(this),(e=v(this,ra))==null||e.resolve()}register_created_effect(e){v(this,Va).push(e)}increment(e,r){if(re(this,ta,v(this,ta)+1),e){let n=v(this,In).get(r)??0;v(this,In).set(r,n+1)}}decrement(e,r){if(re(this,ta,v(this,ta)-1),e){let n=v(this,In).get(r)??0;n===1?v(this,In).delete(r):v(this,In).set(r,n-1)}v(this,Ei)||(re(this,Ei,!0),Tn(()=>{re(this,Ei,!1),this.linked&&this.flush()}))}transfer_effects(e,r){for(const n of e)v(this,En).add(n);for(const n of r)v(this,$r).add(n);e.clear(),r.clear()}oncommit(e){v(this,Zi).add(e)}ondiscard(e){v(this,ea).add(e)}settled(){return(v(this,ra)??re(this,ra,Rc())).promise}static ensure(){if(H===null){const e=H=new qs;!mo&&!Pa&&Tn(()=>{v(e,Qi)||e.flush()})}return H}apply(){{St=null;return}}schedule(e){var r;if($o=e,(r=e.b)!=null&&r.is_pending&&(e.f&(aa|Xs|Pc))!==0&&(e.f&ha)===0){e.b.defer_effect(e);return}v(this,or).push(e)}};Qi=new WeakMap,Jn=new WeakMap,Ii=new WeakMap,Zi=new WeakMap,ea=new WeakMap,ta=new WeakMap,In=new WeakMap,ra=new WeakMap,or=new WeakMap,Va=new WeakMap,En=new WeakMap,$r=new WeakMap,Zr=new WeakMap,na=new WeakMap,Ei=new WeakMap,we=new WeakSet,Bo=function(){if(this.is_fork)return!0;for(const n of v(this,In).keys()){for(var e=n,r=!1;e.parent!==null;){if(v(this,Zr).has(e)){r=!0;break}e=e.parent}if(!r)return!0}return!1},Ho=function(){var e=[];for(const s of v(this,or))if(!((s.f&kt)!==0||(s.f&(at|Er))===0)){for(var r=s,n=!1;r.parent!==null;){r=r.parent;var i=r.f;if((i&(ei|qr))!==0){if((i&ht)===0){n=!0;break}r.f^=ht}}n||e.push(r)}return re(this,or,[]),e},Ta=function(){var c,u,f,p;re(this,Qi,!0);for(const g of v(this,En))v(this,$r).delete(g),Ze(g,at),this.schedule(g);for(const g of v(this,$r))Ze(g,Er),this.schedule(g);this.apply();for(var e=xa=[],r=[],n=Ss=[];v(this,or).length>0;){Ul++>1e3&&(ne(this,we,Aa).call(this),Sf());for(const g of ne(this,we,Ho).call(this))try{ne(this,we,Vo).call(this,g,e,r)}catch(m){throw Yc(g),ne(this,we,Bo).call(this)||this.discard(),m}}if(H=null,n.length>0){var i=qs.ensure();for(const g of n)i.schedule(g)}if(xa=null,Ss=null,ne(this,we,Bo).call(this)){ne(this,we,Wi).call(this,r),ne(this,we,Wi).call(this,e);for(const[g,m]of v(this,Zr))Jc(g,m);n.length>0&&ne(c=H,we,Ta).call(c);return}const s=ne(this,we,qc).call(this);if(s){ne(this,we,Wi).call(this,r),ne(this,we,Wi).call(this,e),ne(u=s,we,Gc).call(u,this);return}v(this,En).clear(),v(this,$r).clear();for(const g of v(this,Zi))g(this);v(this,Zi).clear(),Qn=this,Fl(r),Fl(e),Qn=null,(f=v(this,ra))==null||f.resolve();var o=H;if(v(this,ta)===0&&(v(this,or).length===0||o!==null)&&ne(this,we,Aa).call(this),v(this,or).length>0)if(o!==null){for(const g of v(this,or))v(o,or).push(g);re(this,or,[])}else o=this;o!==null&&(sn.clear(),ne(p=o,we,Ta).call(p))},Vo=function(e,r,n){e.f^=ht;for(var i=e.first;i!==null;){var s=i.f,o=(s&(qr|ei))!==0,c=o&&(s&ht)!==0,u=c||(s&$t)!==0||v(this,Zr).has(i);if(!u&&i.fn!==null){o?i.f^=ht:(s&aa)!==0?r.push(i):Ya(i)&&((s&Hr)!==0&&v(this,$r).add(i),ca(i));var f=i.first;if(f!==null){i=f;continue}}for(;i!==null;){var p=i.next;if(p!==null){i=p;break}i=i.parent}}},qc=function(){for(var e=v(this,Jn);e!==null;){if(!e.is_fork){for(const[r,[,n]]of this.current)if(e.current.has(r)&&!n)return e}e=v(e,Jn)}return null},Gc=function(e){var n;for(const[i,s]of e.current)!this.previous.has(i)&&e.previous.has(i)&&this.previous.set(i,e.previous.get(i)),this.current.set(i,s);for(const[i,s]of e.async_deriveds){const o=this.async_deriveds.get(i);o&&s.promise.then(o.resolve).catch(o.reject)}e.async_deriveds.clear(),this.transfer_effects(v(e,En),v(e,$r));const r=i=>{var s=i.reactions;if(s!==null&&!((i.f&Nt)!==0&&(i.f&(at|Er))===0))for(const u of s){var o=u.f;if((o&Nt)!==0)r(u);else{var c=u;o&(qi|Hr)&&!this.async_deriveds.has(c)&&(v(this,$r).delete(c),Ze(c,at),this.schedule(c))}}};for(const i of this.current.keys())r(i);this.oncommit(()=>e.discard()),ne(n=e,we,Aa).call(n),H=this,ne(this,we,Ta).call(this)},Wi=function(e){for(var r=0;r<e.length;r+=1)Hc(e[r],v(this,En),v(this,$r))},If=function(){var g,m;for(let w=go;w!==null;w=v(w,Ii)){var e=w.id<this.id,r=[];for(const[S,[N,I]]of this.current){if(w.current.has(S)){var n=w.current.get(S)[0];if(e&&N!==n)w.current.set(S,[N,I]);else continue}r.push(S)}if(e)for(const[S,N]of this.async_deriveds){const I=w.async_deriveds.get(S);I&&N.promise.then(I.resolve).catch(I.reject)}var i=[...w.current.keys()].filter(S=>!w.current.get(S)[1]);if(!(!v(w,Qi)||i.length===0)){var s=i.filter(S=>!this.current.has(S));if(s.length===0)e&&w.discard();else if(r.length>0){if(e)for(const S of v(this,na))w.unskip_effect(S,N=>{var I;(N.f&(Hr|qi))!==0?w.schedule(N):ne(I=w,we,Wi).call(I,[N])});w.activate();var o=new Set,c=new Map;for(var u of r)Kc(u,s,o,c);c=new Map;var f=[...w.current].filter(([S,N])=>{const I=this.current.get(S);return I?I[0]!==N[0]||I[1]!==N[1]:!0}).map(([S])=>S);if(f.length>0)for(const S of v(this,Va))(S.f&(kt|$t|Ns))===0&&hl(S,f,c)&&((S.f&(qi|Hr))!==0?(Ze(S,at),w.schedule(S)):v(w,En).add(S));if(v(w,or).length>0&&!v(w,Ei)){w.apply();for(var p of ne(g=w,we,Ho).call(g))ne(m=w,we,Vo).call(m,p,[],[])}w.deactivate()}}}},Aa=function(){if(this.linked){var e=v(this,Jn),r=v(this,Ii);e===null?go=r:re(e,Ii,r),r===null?zi=e:re(r,Jn,e),this.linked=!1}};let Ni=qs;function Ef(t){var e=Pa,r=Qn;Qn=null,Pa=!0;try{for(var n;;){if(hf(),H===null)return n;H.flush()}}finally{Pa=e,Qn=r}}function Sf(){try{sf()}catch(t){rn(t,$o)}}let Fr=null;function Fl(t){var e=t.length;if(e!==0){for(var r=0;r<e;){var n=t[r++];if((n.f&(kt|$t))===0&&Ya(n)&&(Fr=new Set,ca(n),n.deps===null&&n.first===null&&n.nodes===null&&n.teardown===null&&n.ac===null&&uu(n),(Fr==null?void 0:Fr.size)>0)){sn.clear();for(const i of Fr){if((i.f&(kt|$t))!==0)continue;const s=[i];let o=i.parent;for(;o!==null;)Fr.has(o)&&(Fr.delete(o),s.push(o)),o=o.parent;for(let c=s.length-1;c>=0;c--){const u=s[c];(u.f&(kt|$t))===0&&ca(u)}}Fr.clear()}}Fr=null}}function Kc(t,e,r,n){if(!r.has(t)&&(r.add(t),t.reactions!==null))for(const i of t.reactions){const s=i.f;(s&Nt)!==0?Kc(i,e,r,n):(s&(qi|Hr))!==0&&(s&at)===0&&hl(i,e,n)&&(Ze(i,at),pl(i))}}function hl(t,e,r){const n=r.get(t);if(n!==void 0)return n;if(t.deps!==null)for(const i of t.deps){if(Da.call(e,i))return!0;if((i.f&Nt)!==0&&hl(i,e,r))return r.set(i,!0),!0}return r.set(t,!1),!1}function pl(t){H.schedule(t)}function Jc(t,e){if(!((t.f&qr)!==0&&(t.f&ht)!==0)){(t.f&at)!==0?e.d.push(t):(t.f&Er)!==0&&e.m.push(t),Ze(t,ht);for(var r=t.first;r!==null;)Jc(r,e),r=r.next}}function Yc(t){Ze(t,ht);for(var e=t.first;e!==null;)Yc(e),e=e.next}let Ls=new Set;const sn=new Map;let Xc=!1;function Oi(t,e){var r={f:0,v:t,reactions:null,equals:Uc,rv:0,wv:0};return r}function D(t,e){const r=Oi(t);return hu(r),r}function kf(t,e=!1,r=!0){const n=Oi(t);return e||(n.equals=Fc),n}function d(t,e,r=!1){ue!==null&&(!Vr||(ue.f&Ns)!==0)&&$c()&&(ue.f&(Nt|Hr|qi|Ns))!==0&&(on===null||!on.has(t))&&uf();let n=r?hr(e):e;return la(t,n,Ss)}var _i=null,zo=0;function la(t,e,r=null){if(!t.equals(e)){Nn?sn.set(t,e):sn.has(t)||sn.set(t,t.v);var n=Ni.ensure();if(n.capture(t,e),(t.f&Nt)!==0){const i=t;(t.f&at)!==0&&fl(i),St===null&&ul(i)}t.wv=vu(),_i=null,zo=0,Qc(t,at,r),_i=null,ve!==null&&(ve.f&ht)!==0&&(ve.f&(qr|ei))===0&&(wr===null?Lf([t]):wr.push(t)),!n.is_fork&&Ls.size>0&&!Xc&&Tf()}return e}function Tf(){Xc=!1;for(const t of Ls){(t.f&ht)!==0&&Ze(t,Er);let e;try{e=Ya(t)}catch{e=!0}e&&ca(t)}Ls.clear()}function Na(t){d(t,t.v+1)}function Qc(t,e,r){var n=t.reactions;if(n!==null){var i=n.length;if(zo+=i,zo>1e5&&_i===null&&(_i=new Set),_i!==null){if(_i.has(t))return;_i.add(t)}for(var s=0;s<i;s++){var o=n[s],c=o.f,u=(c&at)===0;if(u&&Ze(o,e),(c&Ns)!==0)Ls.add(o);else if((c&Nt)!==0){var f=o;St==null||St.delete(f),Qc(f,Er,r)}else if(u){var p=o;(c&Hr)!==0&&Fr!==null&&Fr.add(p),r!==null?r.push(p):pl(p)}}}}function hr(t){if(typeof t!="object"||t===null||Ai in t||Nc in t)return t;const e=Cc(t);if(e!==Cd&&e!==Rd)return t;var r=new Map,n=Js(t),i=D(0),s=Ri,o=c=>{if(Ri===s)return c();var u=ue,f=Ri;Sr(null),Hl(s);var p=c();return Sr(u),Hl(f),p};return n&&r.set("length",D(t.length)),new Proxy(t,{defineProperty(c,u,f){(!("value"in f)||f.configurable===!1||f.enumerable===!1||f.writable===!1)&&lf();var p=r.get(u);return p===void 0?o(()=>{var g=D(f.value);return r.set(u,g),g}):d(p,f.value,!0),!0},deleteProperty(c,u){var f=r.get(u);if(f===void 0){if(u in c){const p=o(()=>D(ft));r.set(u,p),Na(i)}}else d(f,ft),Na(i);return!0},get(c,u,f){var w;if(u===Ai)return t;var p=r.get(u),g=u in c;if(p===void 0&&(!g||(w=ji(c,u))!=null&&w.writable)&&(p=o(()=>{var S=hr(g?c[u]:ft),N=D(S);return N}),r.set(u,p)),p!==void 0){var m=a(p);return m===ft?void 0:m}return Reflect.get(c,u,f)},getOwnPropertyDescriptor(c,u){var m;(m=this.has)==null||m.call(this,c,u);var f=Reflect.getOwnPropertyDescriptor(c,u),p=r.get(u);if(p!==void 0){var g=a(p);if(g===ft)return;if(f&&"value"in f)f.value=g;else return{enumerable:!0,configurable:!0,value:g,writable:!0}}return f},has(c,u){var m;if(u===Ai)return!0;var f=r.get(u),p=f!==void 0&&f.v!==ft||Reflect.has(c,u);if(f!==void 0||ve!==null&&(!p||(m=ji(c,u))!=null&&m.writable)){f===void 0&&(f=o(()=>{var w=p?hr(c[u]):ft,S=D(w);return S}),r.set(u,f));var g=a(f);if(g===ft)return!1}return p},set(c,u,f,p){var z;var g=r.get(u),m=u in c;if(n&&u==="length")for(var w=f;w<g.v;w+=1){var S=r.get(w+"");S!==void 0?d(S,ft):w in c&&(S=o(()=>D(ft)),r.set(w+"",S))}if(g===void 0)(!m||(z=ji(c,u))!=null&&z.writable)&&(g=o(()=>D(void 0)),d(g,hr(f)),r.set(u,g));else{m=g.v!==ft;var N=o(()=>hr(f));d(g,N)}var I=Reflect.getOwnPropertyDescriptor(c,u);if(I!=null&&I.set&&I.set.call(p,f),!m){if(n&&typeof u=="string"){var T=r.get("length"),x=Number(u);Number.isInteger(x)&&x>=T.v&&d(T,x+1)}Na(i)}return!0},ownKeys(c){a(i);var u=Reflect.ownKeys(c).filter(g=>{var m=r.get(g);return m===void 0||m.v!==ft});for(var[f,p]of r)p.v!==ft&&!(f in c)&&u.push(f);return u},setPrototypeOf(){cf()}})}function $l(t){try{if(t!==null&&typeof t=="object"&&Ai in t)return t[Ai]}catch{}return t}function Zc(t,e){return Object.is($l(t),$l(e))}var Wo,eu,tu,ru,nu;function Af(){if(Wo===void 0){Wo=window,eu=document,tu=/Firefox/.test(navigator.userAgent);var t=Element.prototype,e=Node.prototype,r=Text.prototype;ru=ji(e,"firstChild").get,nu=ji(e,"nextSibling").get,Ll(t)&&(t[Uo]=void 0,t[Is]=null,t[Fo]=void 0,t.__e=void 0),Ll(r)&&(r[Sa]=void 0)}}function xn(t=""){return document.createTextNode(t)}function An(t){return ru.call(t)}function Ka(t){return nu.call(t)}function h(t,e){return An(t)}function Qe(t,e=!1){{var r=An(t);return r instanceof Comment&&r.data===""?Ka(r):r}}function E(t,e=!1){return An(t)}function l(t,e=1,r=!1){let n=t;for(;e--;)n=Ka(n);return n}function Cf(t){t.textContent=""}function iu(){return!1}function au(t,e,r){return e==null||e===Lc?r?document.createElement(t,{is:r}):document.createElement(t):r?document.createElementNS(e,t,{is:r}):document.createElementNS(e,t)}function Rf(t){var e=ve;if(e===null)return ue.f|=Xn,t;if((e.f&ha)===0&&(e.f&aa)===0)throw t;rn(t,e)}function rn(t,e){if(t===Dc)throw t;if(!(e!==null&&(e.f&kt)!==0)){for(;e!==null;){if((e.f&Mo)!==0&&(e.f&(kt|La))===0){if((e.f&ha)===0)throw t;try{e.b.error(t);return}catch(r){t=r}}e=e.parent}throw t}}function Pf(t){ve===null&&(ue===null&&af(),nf()),Nn&&rf()}function xf(t,e){var r=e.last;r===null?e.last=e.first=t:(r.next=t,t.prev=r,e.last=t)}function Ln(t,e){var r=ve;r!==null&&(r.f&$t)!==0&&(t|=$t);var n={ctx:xt,deps:null,nodes:null,f:t|at|Wr,first:null,fn:e,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,wv:0,ac:null};H==null||H.register_created_effect(n);var i=n;if((t&aa)!==0)xa!==null?xa.push(n):Ni.ensure().schedule(n);else if(e!==null){try{ca(n)}catch(o){throw Xt(n),o}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&pa)===0&&(i=i.first,(t&Hr)!==0&&(t&sa)!==0&&i!==null&&(i.f|=sa))}if(i!==null&&(i.parent=r,r!==null&&xf(i,r),ue!==null&&(ue.f&Nt)!==0&&(t&ei)===0)){var s=ue;(s.effects??(s.effects=[])).push(i)}return n}function vl(){return ue!==null&&!Vr}function _l(t){const e=Ln(Xs,null);return Ze(e,ht),e.teardown=t,e}function su(t){Pf();var e=ve.f,r=!ue&&(e&qr)!==0&&xt!==null&&!xt.i;if(r){var n=xt;(n.e??(n.e=[])).push(t)}else return ou(t)}function ou(t){return Ln(aa|Od,t)}function Nf(t){Ni.ensure();const e=Ln(ei|pa,t);return(r={})=>new Promise(n=>{r.outro?Ci(e,()=>{Xt(e),n(void 0)}):(Xt(e),n(void 0))})}function gl(t){return Ln(aa,t)}function Of(t){return Ln(qi|pa,t)}function Qs(t,e=0){return Ln(Xs|e,t)}function F(t,e=[],r=[],n=[]){_f(n,e,r,i=>{Ln(Xs,()=>{t(...i.map(a))})})}function Ja(t,e=0){var r=Ln(Hr|e,t);return r}function fr(t){return Ln(qr|pa,t)}function lu(t){var e=t.teardown;if(e!==null){const r=Nn,n=ue;Bl(!0),Sr(null);try{e.call(null)}catch(i){rn(i,t.parent)}finally{Bl(r),Sr(n)}}}function ml(t,e=!1){var r=t.first;for(t.first=t.last=null;r!==null;){const i=r.ac;i!==null&&va(()=>{i.abort(Ga)});var n=r.next;(r.f&ei)!==0?r.parent=null:Xt(r,e),r=n}}function Df(t){for(var e=t.first;e!==null;){var r=e.next;(e.f&qr)===0&&Xt(e),e=r}}function Xt(t,e=!0){var r=!1;(e||(t.f&xc)!==0)&&t.nodes!==null&&t.nodes.end!==null&&(cu(t.nodes.start,t.nodes.end),r=!0),t.f|=La,ml(t,e&&!r),Ua(t,0);var n=t.nodes&&t.nodes.t;if(n!==null)for(const s of n)s.stop();lu(t),t.f^=La,t.f|=kt;var i=t.parent;i!==null&&i.first!==null&&uu(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes=t.ac=t.b=null}function cu(t,e){for(;t!==null;){var r=t===e?null:Ka(t);t.remove(),t=r}}function uu(t){var e=t.parent,r=t.prev,n=t.next;r!==null&&(r.next=n),n!==null&&(n.prev=r),e!==null&&(e.first===t&&(e.first=n),e.last===t&&(e.last=r))}function Ci(t,e,r=!0){var n=[];t.f|=sl,du(t,n,!0);var i=()=>{r&&Xt(t),e&&e()},s=n.length;if(s>0){var o=()=>--s||i();for(var c of n)c.out(o)}else i()}function du(t,e,r){if((t.f&$t)===0){t.f^=$t;var n=t.nodes&&t.nodes.t;if(n!==null)for(const c of n)(c.is_global||r)&&e.push(c);for(var i=t.first;i!==null;){var s=i.next;if((i.f&ei)===0){var o=(i.f&sa)!==0||(i.f&qr)!==0&&(t.f&Hr)!==0;du(i,e,o?r:!1)}i=s}}}function Ms(t){t.f&=~sl,fu(t,!0)}function fu(t,e){if((t.f&sl)===0&&(t.f&$t)!==0){t.f^=$t,(t.f&ht)===0&&(Ze(t,at),Ni.ensure().schedule(t));for(var r=t.first;r!==null;){var n=r.next,i=(r.f&sa)!==0||(r.f&qr)!==0;fu(r,i?e:!1),r=n}var s=t.nodes&&t.nodes.t;if(s!==null)for(const o of s)(o.is_global||e)&&o.in()}}function bl(t,e){if(t.nodes)for(var r=t.nodes.start,n=t.nodes.end;r!==null;){var i=r===n?null:Ka(r);e.append(r),r=i}}let Nn=!1;function Bl(t){Nn=t}let ue=null,Vr=!1;function Sr(t){ue=t}let ve=null;function cn(t){ve=t}let on=null;function hu(t){ue!==null&&((ue.f&Os)!==0||(ue.f&Nt)!==0)&&(on??(on=new Set)).add(t)}let Yt=null,dr=0,wr=null;function Lf(t){wr=t}let pu=1,bi=0,Ri=bi;function Hl(t){Ri=t}function vu(){return++pu}function Ya(t){var e=t.f;if((e&at)!==0)return!0;if((e&Er)!==0){for(var r=t.deps,n=r.length,i=0;i<n;i++){var s=r[i];if(Ya(s)&&Wc(s),s.wv>t.wv)return!0}(e&Wr)!==0&&St===null&&Ze(t,ht)}return!1}function _u(t,e,r=!0){var n=t.reactions;if(n!==null&&!(on!==null&&on.has(t)))for(var i=0;i<n.length;i++){var s=n[i];(s.f&Nt)!==0?_u(s,e,!1):e===s&&(r?Ze(s,at):(s.f&ht)!==0&&Ze(s,Er),pl(s))}}function gu(t){var e=Yt,r=dr,n=wr,i=ue,s=on,o=xt,c=Vr,u=Ri,f=t.f;Yt=null,dr=0,wr=null,ue=(f&(qr|ei))===0?t:null,on=null,oa(t.ctx),Vr=!1,Ri=++bi,t.ac!==null&&(va(()=>{t.ac.abort(Ga)}),t.ac=null);try{t.f|=Os;var p=t.fn,g=p();t.f|=ha;var m=Vl(t);if($c()&&wr!==null&&!Vr&&m!==null&&(t.f&(Nt|Er|at))===0)for(var w=0;w<wr.length;w++)_u(wr[w],t);if(i!==null&&i!==t){if(bi++,i.deps!==null)for(let S=0;S<r;S+=1)i.deps[S].rv=bi;if(e!==null)for(const S of e)S.rv=bi;wr!==null&&(n===null?n=wr:n.push(...wr))}return(t.f&Xn)!==0&&(t.f^=Xn),g}catch(S){return Vl(t),Rf(S)}finally{t.f^=Os,Yt=e,dr=r,wr=n,ue=i,on=s,oa(o),Vr=c,Ri=u}}function Vl(t){var i;var e=t.deps,r=H==null?void 0:H.is_fork;if(Yt!==null){var n;if(r||Ua(t,dr),e!==null&&dr>0)for(e.length=dr+Yt.length,n=0;n<Yt.length;n++)e[dr+n]=Yt[n];else t.deps=e=Yt;if(vl()&&(t.f&Wr)!==0)for(n=dr;n<e.length;n++)((i=e[n]).reactions??(i.reactions=[])).push(t)}else!r&&e!==null&&dr<e.length&&(Ua(t,dr),e.length=dr);return e}function Mf(t,e){let r=e.reactions;if(r!==null){var n=Td.call(r,t);if(n!==-1){var i=r.length-1;i===0?r=e.reactions=null:(r[n]=r[i],r.pop())}}if(r===null&&(e.f&Nt)!==0&&(Yt===null||!Da.call(Yt,e))){var s=e;(s.f&Wr)!==0&&(s.f^=Wr),s.v!==ft&&ul(s),s.ac!==null&&va(()=>{s.ac.abort(Ga),s.ac=null,Ze(s,at)}),wf(s),Ua(s,0)}}function Ua(t,e){var r=t.deps;if(r!==null)for(var n=e;n<r.length;n++)Mf(t,r[n])}function ca(t){var e=t.f;if((e&kt)===0){Ze(t,ht);var r=ve;ve=t;try{(e&(Hr|Pc))!==0?Df(t):ml(t),lu(t);var n=gu(t);t.teardown=typeof n=="function"?n:null,t.wv=pu;var i;Tc&&ff&&(t.f&at)!==0&&t.deps}finally{ve=r}}}async function mu(){await Promise.resolve(),Ef()}function a(t){var e=t.f,r=(e&Nt)!==0;if(ue!==null&&!Vr){var n=ve!==null&&(ve.f&kt)!==0;if(!n&&(on===null||!on.has(t))){var i=ue.deps;if((ue.f&Os)!==0)t.rv<bi&&(t.rv=bi,Yt===null&&i!==null&&i[dr]===t?dr++:Yt===null?Yt=[t]:Yt.push(t));else{ue.deps??(ue.deps=[]),Da.call(ue.deps,t)||ue.deps.push(t);var s=t.reactions;s===null?t.reactions=[ue]:Da.call(s,ue)||s.push(ue)}}}if(Nn&&sn.has(t))return sn.get(t);if(r){var o=t;if(Nn){var c=o.v;return((o.f&ht)===0&&o.reactions!==null||wu(o))&&(c=fl(o)),sn.set(o,c),c}var u=(o.f&Wr)===0&&!Vr&&ue!==null&&(ue.f&Wr)!==0,f=(o.f&ha)===0;Ya(o)&&(u&&(o.f|=Wr),Wc(o)),u&&!f&&(jc(o),bu(o))}if(St!=null&&St.has(t))return St.get(t);if((t.f&Xn)!==0)throw t.v;return t.v}function bu(t){if(t.f|=Wr,t.deps!==null)for(const r of t.deps){var e=r.reactions;e===null?r.reactions=[t]:Da.call(e,t)||e.push(t),(r.f&Nt)!==0&&(r.f&Wr)===0&&(jc(r),bu(r))}}function wu(t){if(t.v===ft)return!0;if(t.deps===null)return!1;for(const e of t.deps)if(sn.has(e)||(e.f&Nt)!==0&&wu(e))return!0;return!1}function _a(t){var e=Vr;try{return Vr=!0,t()}finally{Vr=e}}const Uf=["touchstart","touchmove"];function Ff(t){return Uf.includes(t)}const wi=Symbol("events"),yu=new Set,jo=new Set;function $f(t,e,r,n={}){function i(s){if(n.capture||qo.call(e,s),!s.cancelBubble)return va(()=>r==null?void 0:r.call(this,s))}return t.startsWith("pointer")||t.startsWith("touch")||t==="wheel"?(i.__removed=!1,Tn(()=>{i.__removed||e.addEventListener(t,i,n)})):e.addEventListener(t,i,n),i}function gi(t,e,r,n,i){var s={capture:n,passive:i},o=$f(t,e,r,s);(e===document.body||e===window||e===document||e instanceof HTMLMediaElement)&&_l(()=>{o.__removed=!0,e.removeEventListener(t,o,s)})}function O(t,e,r){(e[wi]??(e[wi]={}))[t]=r}function Iu(t){for(var e=0;e<t.length;e++)yu.add(t[e]);for(var r of jo)r(t)}let bo=null,wo=!1;function qo(t){var N,I;var e=this,r=e.ownerDocument,n=t.type,i=((N=t.composedPath)==null?void 0:N.call(t))||[],s=i[0]||t.target;bo=t,wo||(wo=!0,setTimeout(()=>{wo=!1,bo=null}));var o=0,c=bo===t&&t[wi];if(c){var u=i.indexOf(c);if(u!==-1&&(e===document||e===window)){t[wi]=e;return}var f=i.indexOf(e);if(f===-1)return;u<=f&&(o=u)}if(s=i[o]||t.target,s!==e){Ac(t,"currentTarget",{configurable:!0,get(){return s||r}});var p=ue,g=ve;Sr(null),cn(null);try{for(var m,w=[];s!==null&&s!==e;){try{var S=(I=s[wi])==null?void 0:I[n];S!=null&&(!s.disabled||t.target===s)&&S.call(s,t)}catch(T){m?w.push(T):m=T}if(t.cancelBubble)break;o++,s=o<i.length?i[o]:null}if(m){for(let T of w)queueMicrotask(()=>{throw T});throw m}}finally{t[wi]=e,delete t.currentTarget,Sr(p),cn(g)}}}var Sc;const yo=((Sc=globalThis==null?void 0:globalThis.window)==null?void 0:Sc.trustedTypes)&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:t=>t});function Bf(t){return(yo==null?void 0:yo.createHTML(t))??t}function Hf(t){var e=au("template");return e.innerHTML=Bf(t.replaceAll("<!>","<!---->")),e.content}function Fa(t,e){var r=ve;r.nodes===null&&(r.nodes={start:t,end:e,a:null,t:null})}function C(t,e){var r=(e&jd)!==0,n=(e&qd)!==0,i,s=!t.startsWith("<!>");return()=>{i===void 0&&(i=Hf(s?t:"<!>"+t),r||(i=An(i)));var o=n||tu?document.importNode(i,!0):i.cloneNode(!0);if(r){var c=An(o),u=o.lastChild;Fa(c,u)}else Fa(o,o);return o}}function gs(){var t=document.createDocumentFragment(),e=document.createComment(""),r=xn();return t.append(e,r),Fa(e,r),t}function k(t,e){t!==null&&t.before(e)}function Vf(t){let e=0,r=Oi(0),n;return()=>{vl()&&(a(r),Qs(()=>(e===0&&(n=_a(()=>t(()=>Na(r)))),e+=1,()=>{Tn(()=>{e-=1,e===0&&(n==null||n(),n=void 0,Na(r))})})))}}var zf=sa|pa;function Wf(t,e,r,n){new jf(t,e,r,n)}var yr,al,Ir,Si,Pt,lr,Ut,cr,en,ki,Yn,ia,za,Wa,Sn,Gs,pe,qf,Gf,Go,jn,Kf,Ko,Ca,ks,Jo,Yo;class jf{constructor(e,r,n,i){se(this,pe);ir(this,"parent");ir(this,"is_pending",!1);ir(this,"transform_error");se(this,yr);se(this,al,null);se(this,Ir);se(this,Si);se(this,Pt);se(this,lr,null);se(this,Ut,null);se(this,cr,null);se(this,en,null);se(this,ki,0);se(this,Yn,0);se(this,ia,!1);se(this,za,new Set);se(this,Wa,new Set);se(this,Sn,null);se(this,Gs,Vf(()=>(re(this,Sn,Oi(v(this,ki))),()=>{re(this,Sn,null)})));var s;re(this,yr,e),re(this,Ir,r),re(this,Si,o=>{var c=ve;c.b=this,c.f|=Mo,n(o)}),this.parent=ve.b,this.transform_error=i??((s=this.parent)==null?void 0:s.transform_error)??(o=>o),re(this,Pt,Ja(()=>{ne(this,pe,Ko).call(this)},zf))}defer_effect(e){Hc(e,v(this,za),v(this,Wa))}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!v(this,Ir).pending}update_pending_count(e,r){ne(this,pe,Jo).call(this,e,r),re(this,ki,v(this,ki)+e),!(!v(this,Sn)||v(this,ia))&&(re(this,ia,!0),Tn(()=>{re(this,ia,!1),v(this,Sn)&&la(v(this,Sn),v(this,ki))}))}get_effect_pending(){return v(this,Gs).call(this),a(v(this,Sn))}error(e){if(e===Dc||!v(this,Ir).onerror&&!v(this,Ir).failed)throw e;H!=null&&H.is_fork?(v(this,lr)&&H.skip_effect(v(this,lr)),v(this,Ut)&&H.skip_effect(v(this,Ut)),v(this,cr)&&H.skip_effect(v(this,cr)),H.oncommit(()=>{ne(this,pe,jn).call(this)||ne(this,pe,Yo).call(this,e)})):ne(this,pe,Yo).call(this,e)}}yr=new WeakMap,al=new WeakMap,Ir=new WeakMap,Si=new WeakMap,Pt=new WeakMap,lr=new WeakMap,Ut=new WeakMap,cr=new WeakMap,en=new WeakMap,ki=new WeakMap,Yn=new WeakMap,ia=new WeakMap,za=new WeakMap,Wa=new WeakMap,Sn=new WeakMap,Gs=new WeakMap,pe=new WeakSet,qf=function(){try{re(this,lr,fr(()=>v(this,Si).call(this,v(this,yr))))}catch(e){this.error(e)}},Gf=function(e){const r=v(this,Ir).failed,{reset:n,invoke_onerror:i}=ne(this,pe,Go).call(this,e);Tn(i),r&&re(this,cr,fr(()=>{r(v(this,yr),()=>e,()=>n)}))},Go=function(e){var r=!1,n=!1;const i=()=>{if(!ne(this,pe,jn).call(this)){if(r){Xd();return}r=!0,n&&df(),v(this,cr)!==null&&Ci(v(this,cr),()=>{re(this,cr,null)}),ne(this,pe,ks).call(this,()=>{ne(this,pe,Ko).call(this)})}};return{reset:i,invoke_onerror:()=>{var o,c;if(!ne(this,pe,jn).call(this))try{n=!0,(c=(o=v(this,Ir)).onerror)==null||c.call(o,e,i),n=!1}catch(u){rn(u,v(this,Pt)&&v(this,Pt).parent)}}}},jn=function(){return(v(this,Pt).f&(kt|La))!==0},Kf=function(){const e=v(this,Ir).pending;e&&(this.is_pending=!0,re(this,Ut,fr(()=>e(v(this,yr)))),Tn(()=>{if(!ne(this,pe,jn).call(this)){var r=re(this,en,document.createDocumentFragment()),n=xn(),i=!1;if(r.append(n),re(this,lr,ne(this,pe,ks).call(this,()=>{try{return fr(()=>v(this,Si).call(this,n))}catch(s){try{this.error(s),i=!0}catch(o){rn(o,v(this,Pt).parent)}return null}})),v(this,lr)===null){re(this,en,null),i&&ne(this,pe,Ca).call(this,H);return}v(this,Yn)===0&&(v(this,yr).before(r),re(this,en,null),Ci(v(this,Ut),()=>{re(this,Ut,null)}),ne(this,pe,Ca).call(this,H))}}))},Ko=function(){try{if(this.is_pending=this.has_pending_snippet(),re(this,Yn,0),re(this,ki,0),re(this,lr,fr(()=>{v(this,Si).call(this,v(this,yr))})),v(this,Yn)>0){var e=re(this,en,document.createDocumentFragment());bl(v(this,lr),e);const r=v(this,Ir).pending;re(this,Ut,fr(()=>r(v(this,yr))))}else ne(this,pe,Ca).call(this,H)}catch(r){this.error(r)}},Ca=function(e){this.is_pending=!1,e.transfer_effects(v(this,za),v(this,Wa))},ks=function(e){var r=ve,n=ue,i=xt;cn(v(this,Pt)),Sr(v(this,Pt)),oa(v(this,Pt).ctx);try{return Ni.ensure(),e()}finally{cn(r),Sr(n),oa(i)}},Jo=function(e,r){var n;if(!this.has_pending_snippet()){this.parent&&ne(n=this.parent,pe,Jo).call(n,e,r);return}re(this,Yn,v(this,Yn)+e),v(this,Yn)===0&&(ne(this,pe,Ca).call(this,r),v(this,Ut)&&Ci(v(this,Ut),()=>{re(this,Ut,null)}),v(this,en)&&(v(this,yr).before(v(this,en)),re(this,en,null)))},Yo=function(e){v(this,lr)&&(Xt(v(this,lr)),re(this,lr,null)),v(this,Ut)&&(Xt(v(this,Ut)),re(this,Ut,null)),v(this,cr)&&(Xt(v(this,cr)),re(this,cr,null));let r=v(this,Ir).failed;const n=i=>{if(ne(this,pe,jn).call(this))return;const{reset:s,invoke_onerror:o}=ne(this,pe,Go).call(this,i);o(),r&&!ne(this,pe,jn).call(this)&&re(this,cr,ne(this,pe,ks).call(this,()=>{try{return fr(()=>{var c=ve;c.b=this,c.f|=Mo,r(v(this,yr),()=>i,()=>s)})}catch(c){return rn(c,v(this,Pt).parent),null}}))};Tn(()=>{if(!ne(this,pe,jn).call(this)){var i;try{i=this.transform_error(e)}catch(s){rn(s,v(this,Pt)&&v(this,Pt).parent);return}i!==null&&typeof i=="object"&&typeof i.then=="function"?i.then(n,s=>rn(s,v(this,Pt)&&v(this,Pt).parent)):n(i)}})};function y(t,e){var r=e==null?"":typeof e=="object"?`${e}`:e;r!==(t[Sa]??(t[Sa]=t.nodeValue))&&(t[Sa]=r,t.nodeValue=`${r}`)}function Jf(t,e){return Yf(t,e)}const ms=new Map;function Yf(t,{target:e,anchor:r,props:n={},events:i,context:s,intro:o=!0,transformError:c}){Af();var u=void 0,f=Nf(()=>{var p=r??e.appendChild(xn());Wf(p,{pending:()=>{}},w=>{ol({});var S=xt;s&&(S.c=s),i&&(n.$$events=i),u=t(w,n)||cl(),ll()},c);var g=new Set,m=w=>{for(var S=0;S<w.length;S++){var N=w[S];if(!g.has(N)){g.add(N);var I=Ff(N);for(const z of[e,document]){var T=ms.get(z);T===void 0&&(T=new Map,ms.set(z,T));var x=T.get(N);x===void 0?(z.addEventListener(N,qo,{passive:I}),T.set(N,1)):T.set(N,x+1)}}}};return m(Ys(yu)),jo.add(m),()=>{var I;for(var w of g)for(const T of[e,document]){var S=ms.get(T),N=S.get(w);--N==0?(T.removeEventListener(w,qo),S.delete(w),S.size===0&&ms.delete(T)):S.set(w,N)}jo.delete(m),p!==r&&((I=p.parentNode)==null||I.removeChild(p))}});return Xf.set(u,f),u}let Xf=new WeakMap;var Br,tn,ur,Ti,ja,qa,Ks;class Eu{constructor(e,r=!0){ir(this,"anchor");se(this,Br,new Map);se(this,tn,new Map);se(this,ur,new Map);se(this,Ti,new Set);se(this,ja,!0);se(this,qa,e=>{if(v(this,Br).has(e)){var r=v(this,Br).get(e),n=v(this,tn).get(r);if(n)Ms(n),v(this,Ti).delete(r);else{var i=v(this,ur).get(r);i&&(Ms(i.effect),v(this,tn).set(r,i.effect),v(this,ur).delete(r),i.fragment.lastChild.remove(),this.anchor.before(i.fragment),n=i.effect)}for(const[s,o]of v(this,Br)){if(v(this,Br).delete(s),s===e)break;const c=v(this,ur).get(o);c&&(Xt(c.effect),v(this,ur).delete(o))}for(const[s,o]of v(this,tn)){if(s===r||v(this,Ti).has(s))continue;const c=()=>{if(Array.from(v(this,Br).values()).includes(s)){var f=document.createDocumentFragment();bl(o,f),f.append(xn()),v(this,ur).set(s,{effect:o,fragment:f})}else Xt(o);v(this,Ti).delete(s),v(this,tn).delete(s)};v(this,ja)||!n?(v(this,Ti).add(s),Ci(o,c,!1)):c()}}});se(this,Ks,e=>{v(this,Br).delete(e);const r=Array.from(v(this,Br).values());for(const[n,i]of v(this,ur))r.includes(n)||(Xt(i.effect),v(this,ur).delete(n))});this.anchor=e,re(this,ja,r)}ensure(e,r){var n=H,i=iu();if(r&&!v(this,tn).has(e)&&!v(this,ur).has(e))if(i){var s=document.createDocumentFragment(),o=xn();s.append(o),v(this,ur).set(e,{effect:fr(()=>r(o)),fragment:s})}else v(this,tn).set(e,fr(()=>r(this.anchor)));if(v(this,Br).set(n,e),i){for(const[c,u]of v(this,tn))c===e?n.unskip_effect(u):n.skip_effect(u);for(const[c,u]of v(this,ur))c===e?n.unskip_effect(u.effect):n.skip_effect(u.effect);n.oncommit(v(this,qa)),n.ondiscard(v(this,Ks))}else v(this,qa).call(this,n)}}Br=new WeakMap,tn=new WeakMap,ur=new WeakMap,Ti=new WeakMap,ja=new WeakMap,qa=new WeakMap,Ks=new WeakMap;function le(t,e,r=!1){var n=new Eu(t),i=r?sa:0;function s(o,c){n.ensure(o,c)}Ja(()=>{var o=!1;e((c,u=0)=>{o=!0,s(u,c)}),o||s(-1,null)},i)}const Qf=Symbol("NaN");function Zf(t,e,r){var n=new Eu(t);Ja(()=>{var i=e();i!==i&&(i=Qf),n.ensure(i,r)})}function Gi(t,e){return e}function eh(t,e,r){for(var n=[],i=e.length,s,o=e.length,c=0;c<i;c++){let g=e[c];Ci(g,()=>{if(s){if(s.pending.delete(g),s.done.add(g),s.pending.size===0){var m=t.outrogroups;Xo(t,Ys(s.done)),m.delete(s),m.size===0&&(t.outrogroups=null)}}else o-=1},!1)}if(o===0){var u=n.length===0&&r!==null&&t.pending.size===0;if(u){var f=r,p=f.parentNode;Cf(p),p.append(f),t.items.clear()}Xo(t,e,!u)}else s={pending:new Set(e),done:new Set},(t.outrogroups??(t.outrogroups=new Set)).add(s)}function Xo(t,e,r=!0){var n;if(t.pending.size>0){n=new Set;for(const o of t.pending.values())for(const c of o)n.add(t.items.get(c).e)}for(var i=0;i<e.length;i++){var s=e[i];if(n!=null&&n.has(s)){s.f|=an;const o=document.createDocumentFragment();bl(s,o)}else Xt(e[i],r)}}var zl;function Re(t,e,r,n,i,s=null){var o=t,c=new Map,u=(e&Oc)!==0;if(u){var f=t;o=f.appendChild(xn())}var p=null,g=zc(()=>{var x=r();return Js(x)?x:x==null?[]:Ys(x)}),m=new Map,w=!0;function S(x){if((T.effect.f&kt)===0){T.pending.delete(x);var z=a(g);T.fallback=p,th(T,z,o,e,n),p!==null&&(z.length===0?(p.f&an)===0?Ms(p):(p.f^=an,Ra(p,null,o)):Ci(p,()=>{p=null}))}}function N(x){T.pending.delete(x)}var I=Ja(()=>{for(var x=a(g),z=x.length,$=new Set,P=H,q=iu(),ae=0;ae<z;ae+=1){var B=x[ae],L=n(B,ae),X=w?null:c.get(L);X?(X.v&&la(X.v,B),X.i&&la(X.i,ae),q&&P.unskip_effect(X.e)):(X=rh(c,w?o:zl??(zl=xn()),B,L,ae,i,e,r),w||(X.e.f|=an),c.set(L,X)),$.add(L)}if(z===0&&s&&!p&&(w?p=fr(()=>s(o)):(p=fr(()=>s(zl??(zl=xn()))),p.f|=an)),z>$.size&&tf(),!w)if(m.set(P,$),q){for(const[Je,Me]of c)$.has(Je)||P.skip_effect(Me.e);P.oncommit(S),P.ondiscard(N)}else S(P);a(g)}),T={effect:I,items:c,pending:m,outrogroups:null,fallback:p};w=!1}function Ea(t){for(;t!==null&&(t.f&qr)===0;)t=t.next;return t}function th(t,e,r,n,i){var X,Je,Me,Qt,je,he,Te,pr,Ot;var s=(n&$d)!==0,o=e.length,c=t.items,u=Ea(t.effect.first),f,p=null,g,m=[],w=[],S,N,I,T;if(s)for(T=0;T<o;T+=1)S=e[T],N=i(S,T),I=c.get(N).e,(I.f&an)===0&&((Je=(X=I.nodes)==null?void 0:X.a)==null||Je.measure(),(g??(g=new Set)).add(I));for(T=0;T<o;T+=1){if(S=e[T],N=i(S,T),I=c.get(N).e,t.outrogroups!==null)for(const et of t.outrogroups)et.pending.delete(I),et.done.delete(I);if((I.f&$t)!==0&&(Ms(I),s&&((Qt=(Me=I.nodes)==null?void 0:Me.a)==null||Qt.unfix(),(g??(g=new Set)).delete(I))),(I.f&an)!==0)if(I.f^=an,I===u)Ra(I,null,r);else{var x=p?p.next:u;I===t.effect.last&&(t.effect.last=I.prev),I.prev&&(I.prev.next=I.next),I.next&&(I.next.prev=I.prev),zn(t,p,I),zn(t,I,x),Ra(I,x,r),p=I,m=[],w=[],u=Ea(p.next);continue}if(I!==u){if(f!==void 0&&f.has(I)){if(m.length<w.length){var z=w[0],$;p=z.prev;var P=m[0],q=m[m.length-1];for($=0;$<m.length;$+=1)Ra(m[$],z,r);for($=0;$<w.length;$+=1)f.delete(w[$]);zn(t,P.prev,q.next),zn(t,p,P),zn(t,q,z),u=z,p=q,T-=1,m=[],w=[]}else f.delete(I),Ra(I,u,r),zn(t,I.prev,I.next),zn(t,I,p===null?t.effect.first:p.next),zn(t,p,I),p=I;continue}for(m=[],w=[];u!==null&&u!==I;)(f??(f=new Set)).add(u),w.push(u),u=Ea(u.next);if(u===null)continue}(I.f&an)===0&&m.push(I),p=I,u=Ea(I.next)}if(t.outrogroups!==null){for(const et of t.outrogroups)et.pending.size===0&&(Xo(t,Ys(et.done)),(je=t.outrogroups)==null||je.delete(et));t.outrogroups.size===0&&(t.outrogroups=null)}if(u!==null||f!==void 0){var ae=[];if(f!==void 0)for(I of f)(I.f&$t)===0&&ae.push(I);for(;u!==null;)(u.f&$t)===0&&u!==t.fallback&&ae.push(u),u=Ea(u.next);var B=ae.length;if(B>0){var L=(n&Oc)!==0&&o===0?r:null;if(s){for(T=0;T<B;T+=1)(Te=(he=ae[T].nodes)==null?void 0:he.a)==null||Te.measure();for(T=0;T<B;T+=1)(Ot=(pr=ae[T].nodes)==null?void 0:pr.a)==null||Ot.fix()}eh(t,ae,L)}}s&&Tn(()=>{var et,tt;if(g!==void 0)for(I of g)(tt=(et=I.nodes)==null?void 0:et.a)==null||tt.apply()})}function rh(t,e,r,n,i,s,o,c){var u=(o&Ud)!==0?(o&Bd)===0?kf(r,!1,!1):Oi(r):null,f=(o&Fd)!==0?Oi(i):null;return{v:u,i:f,e:fr(()=>(s(e,u??r,f??i,c),()=>{t.delete(n)}))}}function Ra(t,e,r){if(t.nodes)for(var n=t.nodes.start,i=t.nodes.end,s=e&&(e.f&an)===0?e.nodes.start:r;n!==null;){var o=Ka(n);if(s.before(n),n===i)return;n=o}}function zn(t,e,r){e===null?t.effect.first=r:e.next=r,r===null?t.effect.last=e:r.prev=e}function Wl(t,e,r=!1,n=!1,i=!1,s=!1){var o=t,c="";if(r)var u=t;F(()=>{var f=ve;if(c!==(c=e()??"")){if(r&&!Mc){f.nodes=null,u.innerHTML=c,c!==""&&Fa(An(u),u.lastChild);return}if(f.nodes!==null&&(cu(f.nodes.start,f.nodes.end),f.nodes=null),c!==""){var p=n?Gd:i?Kd:void 0,g=au(n?"svg":i?"math":"template",p);g.innerHTML=c;var m=n||i?g:g.content;if(Fa(An(m),m.lastChild),n||i)for(;An(m);)o.before(An(m));else o.before(m)}}})}function nh(t,e){var r;r=document.head.appendChild(xn());try{Ja(()=>{var n=fr(()=>e(r));n.f|=xc,Mc||(n.nodes===null?n.nodes={start:r,end:r,a:null,t:null}:n.nodes.end=r)})}finally{}}const jl=[...` 	
\r\f \v\uFEFF`];function ih(t,e,r){var n=t==null?"":""+t;if(r){for(var i of Object.keys(r))if(r[i])n=n?n+" "+i:i;else if(n.length)for(var s=i.length,o=0;(o=n.indexOf(i,o))>=0;){var c=o+s;(o===0||jl.includes(n[o-1]))&&(c===n.length||jl.includes(n[c]))?n=(o===0?"":n.substring(0,o))+n.substring(c+1):o=c}}return n===""?null:n}function ql(t,e=!1){var r=e?" !important;":";",n="";for(var i of Object.keys(t)){var s=t[i];s!=null&&s!==""&&(n+=" "+i+": "+s+r)}return n}function ah(t,e){if(e){var r="",n,i;return Array.isArray(e)?(n=e[0],i=e[1]):n=e,n&&(r+=ql(n)),i&&(r+=ql(i,!0)),r=r.trim(),r===""?null:r}return String(t)}function sr(t,e,r,n,i,s){var o=t[Uo];if(o!==r||o===void 0){var c=ih(r,n,s);c==null?t.removeAttribute("class"):t.className=c,t[Uo]=r}else if(s&&i!==s)for(var u in s){var f=!!s[u];(i==null||f!==!!i[u])&&t.classList.toggle(u,f)}return s}function Io(t,e={},r,n){for(var i in r){var s=r[i];e[i]!==s&&(r[i]==null?t.style.removeProperty(i):t.style.setProperty(i,s,n))}}function Gl(t,e,r,n){var i=t[Fo];if(i!==e){var s=ah(e,n);s==null?t.removeAttribute("style"):t.style.cssText=s,t[Fo]=e}else n&&(Array.isArray(n)?(Io(t,r==null?void 0:r[0],n[0]),Io(t,r==null?void 0:r[1],n[1],"important")):Io(t,r,n));return n}function sh(t,e){e?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function oh(t,e){var r=t.__defaultValue,n=t.multiple,i=n?r??[]:null;if(!(n&&!Js(i))){t.selectedIndex;for(var s of t.options){var o=Ki(s);sh(s,n?i.includes(o):Zc(o,r))}}}function Us(t,e,r=!1){if(t.multiple){if(e==null)return;if(!Js(e))return Yd();for(var n of t.options)n.selected=e.includes(Ki(n));return}for(n of t.options){var i=Ki(n);if(Zc(i,e)){n.selected=!0;return}}(!r||e!==void 0)&&(t.selectedIndex=-1)}function ar(t){var e=new MutationObserver(r=>{r.every(lh)||("__defaultValue"in t&&oh(t),"__value"in t&&Us(t,t.__value))});e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),_l(()=>{e.disconnect()})}function Ur(t,e,r=e){var n=new WeakSet,i=!0;dl(t,"change",s=>{var o=s?"[selected]":":checked",c;if(t.multiple)c=[].map.call(t.querySelectorAll(o),Ki);else{var u=t.querySelector(o)??t.querySelector("option:not([disabled])");c=u&&Ki(u)}r(c),t.__value=c,H!==null&&n.add(H)}),gl(()=>{var s=e();if(t===document.activeElement){var o=H;if(n.has(o))return}if(Us(t,s,i),i&&s===void 0){var c=t.querySelector(":checked");c!==null&&(s=Ki(c),r(s))}t.__value=s,i=!1})}function Ki(t){return"__value"in t?t.__value:t.value}function lh(t){if(t.target.closest("selectedcontent")!==null)return!0;if(t.type==="childList"){var e=[...t.addedNodes,...t.removedNodes];return e.length>0&&e.every(r=>r.nodeName==="SELECTEDCONTENT")}return!1}const ch=Symbol("is custom element"),uh=Symbol("is html"),dh=Md?"progress":"PROGRESS";function Jt(t,e){var r=Su(t);r.value===(r.value=e??void 0)||t.value===e&&(e!==0||t.nodeName!==dh)||(t.value=e??"")}function Et(t,e,r,n){var i=Su(t);i[e]!==(i[e]=r)&&(e==="loading"&&(t[Ld]=r),r==null?t.removeAttribute(e):typeof r!="string"&&fh(t).has(e)?t[e]=r:t.setAttribute(e,r))}function Su(t){return t[Is]??(t[Is]={[ch]:t.nodeName.includes("-"),[uh]:t.namespaceURI===Lc})}var Kl=new Map;function fh(t){var e=t.getAttribute("is")||t.nodeName,r=Kl.get(e);if(r)return r;Kl.set(e,r=new Set);for(var n,i=t,s=Element.prototype;s!==i;){n=Ad(i);for(var o in n)n[o].set&&o!=="innerHTML"&&o!=="textContent"&&o!=="innerText"&&r.add(o);i=Cc(i)}return r}function Be(t,e,r=e){var n=new WeakSet;dl(t,"input",async i=>{var s=i?t.defaultValue:t.value;if(s=Eo(t)?So(s):s,r(s),H!==null&&n.add(H),await mu(),s!==(s=e())){var o=t.selectionStart,c=t.selectionEnd,u=t.value.length;if(t.value=s??"",c!==null){var f=t.value.length;o===c&&c===u&&f>u?(t.selectionStart=f,t.selectionEnd=f):(t.selectionStart=o,t.selectionEnd=Math.min(c,f))}}}),_a(e)==null&&t.value&&(r(Eo(t)?So(t.value):t.value),H!==null&&n.add(H)),Qs(()=>{var i=e();if(t===document.activeElement){var s=H;if(n.has(s))return}Eo(t)&&i===So(t.value)||t.type==="date"&&!i&&!t.value||i!==t.value&&(t.value=i??"")})}function Fs(t,e,r=e){dl(t,"change",n=>{var i=n?t.defaultChecked:t.checked;r(i)}),_a(e)==null&&r(t.checked),Qs(()=>{var n=e();t.checked=!!n})}function Eo(t){var e=t.type;return e==="number"||e==="range"}function So(t){return t===""?null:+t}function ko(t,e){return t===e||(t==null?void 0:t[Ai])===e}function hh(t=cl(),e,r,n){var i=xt.r,s=ve;return gl(()=>{var o,c;return Qs(()=>{o=c,c=[],_a(()=>{ko(r(...c),t)||(e(t,...c),o&&ko(r(...o),t)&&e(null,...o))})}),()=>{let u=s;for(;u!==i&&u.parent!==null&&u.parent.f&La;)u=u.parent;const f=()=>{c&&ko(r(...c),t)&&e(null,...c)},p=u.teardown;u.teardown=()=>{f(),p==null||p()}}}),t}let bs=!1;function ph(t){var e=bs;try{return bs=!1,[t(),bs]}finally{bs=e}}function To(t,e,r,n){var $;var i=!0,s=(r&zd)!==0,o=(r&Wd)!==0,c=n,u=!0,f=void 0,p=()=>o&&i?(f??(f=Ma(n)),a(f)):(u&&(u=!1,c=o?_a(n):n),c);let g;if(s){var m=Ai in t||Dd in t;g=(($=ji(t,e))==null?void 0:$.set)??(m&&e in t?P=>t[e]=P:void 0)}var w,S=!1;s?[w,S]=ph(()=>t[e]):w=t[e],w===void 0&&n!==void 0&&(w=p(),g&&(of(),g(w)));var N;if(N=()=>{var P=t[e];return P===void 0?p():(u=!0,P)},(r&Vd)===0)return N;if(g){var I=t.$$legacy;return(function(P,q){return arguments.length>0?((!q||I||S)&&g(q?N():P),P):N()})}var T=!1,x=((r&Hd)!==0?Ma:zc)(()=>(T=!1,N()));s&&a(x);var z=ve;return(function(P,q){if(arguments.length>0){const ae=q?a(x):s?hr(P):P;return d(x,ae),T=!0,c!==void 0&&(c=ae),P}return Nn&&T||(z.f&kt)!==0?x.v:a(x)})}function ku(t){xt===null&&Zd(),su(()=>{const e=_a(t);if(typeof e=="function")return e})}const vh="5";var kc;typeof window<"u"&&((kc=window.__svelte??(window.__svelte={})).v??(kc.v=new Set)).add(vh);const Jl=Object.freeze({infographic:[1080,1350],carousel:[1080,1350],story:[1080,1920],reel:[1080,1920]});function Ts(t=""){return String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[e])}function ws(t,e){return/^#[0-9a-f]{6}$/i.test(t||"")?t:e}function _h(t,e,r){const n=String(t??"").slice(0,12e3).split(/\s+/).filter(Boolean),i=[];let s="";for(const o of n){const c=o.match(new RegExp(`.{1,${e}}`,"gu"))||[];for(const u of c)s&&[...`${s} ${u}`].length>e&&(i.push(s),s=""),s=s?`${s} ${u}`:u}if(s&&i.push(s),i.length>r)throw new Error(`Content exceeds artwork capacity (${r} lines). Shorten the text before exporting.`);return i}function Ao(t,e,r,n,i,s,o,c=400,u="DejaVu Sans"){const f=_h(t,Math.max(8,Math.floor(i/(n*.63))),s);return{height:Math.max(1,f.length)*n*1.3,svg:`<text data-preflight-text="true" x="${e}" y="${r}" fill="${o}" font-family="${u}, Noto Sans Devanagari, sans-serif" font-size="${n}" font-weight="${c}">${f.map((p,g)=>`<tspan x="${e}" dy="${g?n*1.3:0}">${Ts(p)}</tspan>`).join("")}</text>`}}function gh({brandProfile:t={},campaign:e,format:r="infographic",slideIndex:n=0}){var Je,Me,Qt,je,he,Te,pr,Ot,et,tt,kr;if(!e||!Jl[r])throw new Error("A campaign and supported format are required");const[i,s]=Jl[r],o=t.colors||[],c=ws((Je=o[0])==null?void 0:Je.hex,"#141513"),u=ws((Me=o[2])==null?void 0:Me.hex,"#C5D86D"),f=ws((Qt=o[3])==null?void 0:Qt.hex,"#F4F1EA"),p=ws((je=o[1])==null?void 0:je.hex,"#A8C5A0"),g=s===1920,m=r==="reel"?740:900,w=g?400:140;let S,N,I;if(r==="infographic"){const _e=e.infographic;if(!_e||!Array.isArray(_e.statRows))throw new Error("Infographic content missing");S=_e.headline,N=_e.statRows,I=_e.bottomTakeaway}else if(r==="carousel"){const _e=(Te=(he=e.carousel)==null?void 0:he.slides)==null?void 0:Te[n];if(!_e)throw new Error("Carousel slide missing");S=_e.title,N=[_e.bodyMetric],I=_e.visualNote}else if(r==="story"){const _e=e.story;if(!_e)throw new Error("Story content missing");S=_e.hookBanner,N=[_e.keyStatHighlight],I=_e.interactiveStickerPrompt}else{const _e=(Ot=(pr=e.reel)==null?void 0:pr.beats)==null?void 0:Ot[n];if(!_e)throw new Error("Reel beat missing");S=_e.onScreenText||e.reel.spokenHook0to3s,N=[_e.voiceover],I=e.reel.closingCta}const T=(_e,vr)=>["Mona Sans","Inter","Instrument Serif","DejaVu Sans"].find(dn=>String(_e||"").split("/")[0].trim()===dn)||vr,x=T((et=t.fonts)==null?void 0:et.heading,"DejaVu Sans"),z=T((tt=t.fonts)==null?void 0:tt.body,"DejaVu Sans"),$=[];let P=w;const q=Ao(S,80,P,52,m,5,f,700,x);$.push(q.svg),P+=q.height+72;for(const _e of N){const vr=Ao(_e,106,P,34,m-60,5,f,400,z);$.push(`<path d="M80 ${P-30}v${vr.height+10}" stroke="${u}" stroke-width="6"/>`,vr.svg),P+=vr.height+50}const ae=Ao(I,80,P+10,29,m,4,p,400,z),B=g?s*.82-35:s-80;if(P+ae.height>B)throw new Error("Content exceeds the safe artwork area. Shorten the copy before exporting.");$.push(ae.svg);const L=Ts([t.logoText,t.brandName||"Campaign Studio"].filter(Boolean).join(" · ")),X=((kr=e.provenance)==null?void 0:kr.mode)==="synthetic"?"SYNTHETIC DRAFT · REVIEW REQUIRED":"EDITORIAL DRAFT";return`<svg xmlns="http://www.w3.org/2000/svg" width="${i}" height="${s}" viewBox="0 0 ${i} ${s}" role="img" aria-label="${Ts(S)}"><title>${Ts(S)}</title><rect width="${i}" height="${s}" fill="${c}"/><g font-family="DejaVu Sans, Noto Sans Devanagari, sans-serif"><text data-preflight-text="true" x="80" y="${g?305:65}" fill="${p}" font-size="26" font-weight="700">${L}</text><path d="M80 ${w-55}h920" stroke="${u}" stroke-width="3"/>${$.join("")}<text data-preflight-text="true" x="80" y="${g?Math.floor(s*.8):s-35}" fill="${p}" font-size="19">${X}${r==="carousel"?` · ${n+1}/4`:""}</text></g></svg>`}const mh=new Set(["infographic","carousel","story","reel"]);function Co(t){if(typeof t!="string"||!/^#[0-9a-f]{6}$/i.test(t))return null;const[e,r,n]=t.slice(1).match(/.{2}/g).map(i=>{const s=parseInt(i,16)/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4});return .2126*e+.7152*r+.0722*n}function bh({format:t,canvas:e,textBoxes:r=[],obstructionBoxes:n=[],foreground:i,background:s,caption:o="",captionLimit:c=125}){if(!mh.has(t)||!e||!Number.isFinite(e.width)||!Number.isFinite(e.height)||e.width<=0||e.height<=0||e.width>1e4||e.height>1e4)throw new Error("Invalid preflight canvas or format");if(!Array.isArray(r)||r.length>2e3||r.some(L=>!L||["x","y","width","height"].some(X=>!Number.isFinite(L[X]))||L.width<0||L.height<0))throw new Error("Invalid preflight text rectangles");if(!Array.isArray(n)||n.length>40||n.some(L=>!L||["x","y","width","height"].some(X=>!Number.isFinite(L[X]))||L.width<0||L.height<0))throw new Error("Invalid preflight obstruction rectangles");if(typeof o!="string"||o.length>2e4||!Number.isInteger(c)||c<40||c>500)throw new Error("Invalid preflight caption settings");const{width:u,height:f}=e,p=t==="story"||t==="reel",g=p?[{x:0,y:0,width:u,height:f*.14},{x:0,y:f*.82,width:u,height:f*.18},...t==="reel"?[{x:u*.82,y:0,width:u*.18,height:f}]:[]]:[],m=r.filter(L=>[...g,...n].some(X=>L.x<X.x+X.width&&L.x+L.width>X.x&&L.y<X.y+X.height&&L.y+L.height>X.y)).length,w=r.filter(L=>L.x<-1||L.y<-1||L.x+L.width>u+1||L.y+L.height>f+1).length,S=Co(s),N=r.map(L=>Co(L.foreground||i)).filter(L=>L!==null).map(L=>S===null?null:(Math.max(L,S)+.05)/(Math.min(L,S)+.05)).filter(L=>L!==null),I=r.filter(L=>Co(L.foreground||i)===null||S===null).length,T=N.length?Math.round(Math.min(...N)*100)/100:null,x=Math.min(c,o.length),z=/\$\d|\d%/.test(o.slice(0,c)),$=r.length>0,P=p?9/16:4/5,q=u/f,ae=Math.abs(q-P)/P;return{simulation:!0,measurementMethod:"client-svg-text-rectangles",requiresReview:!0,metrics:{obstructionElementsCount:n.length,unmeasuredColorCount:I,expectedAspectRatio:p?"9:16":"4:5",actualAspectRatio:Math.round(q*1e4)/1e4,aspectRatioDeviation:ae,artworkWidth:u,artworkHeight:f,textElementsCount:r.length,occludedElementsCount:m,overflowElementsCount:w,contrastRatio:T,captionCharacters:o.length,firstLookCharacters:x,firstLookContainsHardNumber:z,safeZoneRegions:{top:p?.14:0,bottom:p?.18:0,right:t==="reel"?.18:0}},checks:[{id:"aspect-ratio",status:ae<=.01?"pass":"warning",measured:q,limit:P,message:"Rendered artwork ratio compared with the intended 4:5 or 9:16 export; 1% layout tolerance."},{id:"safe-zones",status:$?m?"warning":"pass":"unmeasured",measured:$?m:null,limit:0,message:"Text rectangles intersecting measured native chrome/stickers or approximate chrome zones; actual Instagram layout can vary."},{id:"artwork-overflow",status:$?w?"warning":"pass":"unmeasured",measured:$?w:null,limit:0,message:"Text rectangles outside the rendered artwork."},{id:"contrast",status:T===null||I>0?"unmeasured":T>=4.5?"pass":"warning",measured:T,limit:4.5,message:"Minimum text fill contrast against the supplied base background, without image/gradient analysis."},{id:"caption-fold",status:o.length>c?"warning":"pass",measured:o.length,limit:c,message:"Configurable approximate caption fold; not an official platform guarantee."}]}}var wh=C('<div class="statusbar"><span>9:41</span><span class="island"></span><span>▴ ▰ ▮</span></div>'),yh=C("<!><span> </span>",1),Ih=C('<span class="empty-cell">No scheduled or exported post</span>'),Eh=C("<div><!></div>"),Sh=C('<div class="profile-header"><b> </b><button aria-label="Profile options">☰</button></div> <div class="profile-summary"><span class="avatar large"> </span><span><b> </b> preview posts</span><span>Private<br/>preview</span></div> <div class="profile-bio"><b> </b> <p> </p> <small>Local preview · active first, weekly schedule Monday–Sunday, then newest exports. Not a live Instagram feed.</small></div> <div class="profile-grid"></div>',1),kh=C('<header class="ig-header"><span class="avatar"> </span> <div><b> </b><small>Editorial draft</small></div> <button aria-label="Post options">•••</button></header>'),Th=C('<span class="slide-count"> </span><button class="previous" aria-label="Previous slide">‹</button><button class="next" aria-label="Next slide">›</button>',1),Ah=C("<span><i></i></span>"),Ch=C('<div class="story-chrome"><div class="timer-bars"></div> <div class="story-header"><span class="avatar"> </span><b> </b><span>Draft</span><button> </button><button aria-label="Close story preview">×</button></div></div> <div class="poll-sticker"><b> </b> <div><button> </button><button> </button></div> <small> </small></div> <div class="story-reply"><input aria-label="Story reply preview" placeholder="Send message…"/><button aria-label="Like story"> </button><button aria-label="Share story preview">➤</button></div>',1),Rh=C('<div class="reel-top"><b>Reels</b><span>Storyboard simulation</span></div> <div class="reel-rail"><button aria-label="Like reel"> <small> </small></button><button aria-label="Comment on reel">♧<small> </small></button><button aria-label="Share reel preview">➤</button><button aria-label="Reel options">•••</button><span>♫</span></div> <div class="reel-meta"><b> </b><button> </button> <p> </p> <div class="audio">♫ Original audio · storyboard, no audio playback</div></div>',1),Ph=C('<div class="danger right">18%</div>'),xh=C('<div class="safe-mask" aria-label="Simulated safe-zone overlay"><div class="danger top">Top 14% · chrome risk</div> <div class="danger bottom">Bottom 18% · caption / reply risk</div> <!> <div class="clear-zone">Inspect text clearance</div></div>'),Nh=C('<span class="floating-heart">♥</span>'),Oh=C('<div class="reel-controls"><button> </button><input aria-label="Reel scrubber" type="range" min="0" max="30" step=".25"/><output data-testid="active-beat"> </output></div>'),Dh=C("<button>●</button>"),Lh=C('<div class="dots"></div>'),Mh=C("<button> </button>"),Uh=C('<div class="engagement"><button aria-label="Like post"> </button><button aria-label="Comment on post">♧</button><button aria-label="Share post preview">➤</button><!><button class="bookmark" aria-label="Save post locally"> </button></div> <p class="local-count"> </p> <div class="caption"><b> </b> <!><small>LOCAL DRAFT · NO INSTAGRAM CONNECTION</small></div>',1),Fh=C(`<div class="fold-ruler"><label>Approximate fold <input aria-label="Caption fold threshold" type="number" min="40" max="500"/> characters</label> <p><mark> </mark><span class="fold-line">│</span> </p> <small>Configurable simulation. Actual truncation varies by app, device
              and layout.</small></div>`),$h=C('<!> <div role="group" aria-label="Artwork preview"><div class="artwork"></div> <!> <!> <!> <!> <!></div> <!> <!> <!>',1),Bh=C("<p> </p>"),Hh=C('<div class="comment-panel"><b>Local comments</b><!> <form><input aria-label="Local comment" placeholder="Write a preview comment"/><button>Add</button></form></div>'),Vh=C('<p class="local-notice" role="status"> </p>'),zh=C(`<div class="measurements"><span><b> </b> text boxes in chrome zones</span><span><b> </b> text boxes outside artwork</span><span><b> </b> </span><span><b> </b> </span><span><b> </b> caption characters before simulated
          fold</span></div> <p class="small muted">Measured SVG text boxes and fill contrast against the base background;
        images, glyph shapes and all native app variations are not covered.
        Review required. No confidence score is inferred.</p>`,1),Wh=C('<p class="small muted">Open a design or Instagram surface to measure the rendered SVG.</p>'),jh=C(`<section class="emulator" aria-label="Instagram preview simulator"><div class="preview-heading"><div><span class="eyebrow">PREVIEW LAB</span> <h3>See it in context.</h3></div> <span class="simulation">Local simulation</span></div> <div class="segmented" aria-label="Preview mode"><button>Design Mode</button> <button>In-Situ Instagram</button> <button>3×3 Profile Grid</button></div> <div class="preview-controls"><label>Phone width <select><option>375 px</option><option>390 px · generic</option><option>402 px · iPhone 16 Pro</option><option>430 px</option></select></label> <label>Zoom <input aria-label="Preview zoom" type="range" min="55" max="125" step="5"/><output> </output></label> <label><input type="checkbox"/>Safe zones</label> <label><input type="checkbox"/>Caption ruler</label></div> <p class="muted small">Approximate Instagram chrome. Local interactions only. Validate final assets
    in Instagram before publishing.</p> <div class="phone-well"><div aria-label="Simulated phone viewport"><!> <!> <!> <!></div></div> <div class="evidence"><div class="evidence-title"><b>Measured preflight</b><button>Measure again</button></div> <!></div></section>`);function qh(t,e){ol(e,!0);let r=To(e,"format",3,"infographic"),n=To(e,"backlog",19,()=>[]),i=To(e,"onpreflight",3,()=>{}),s=D("instagram"),o=D(85),c=D(402),u=D(!1),f=D(!0),p=D(125),g=D(0),m=D(!1),w=D(!1),S=D(!1),N=D(""),I=D(hr([])),T=D(!1),x=D(""),z=D(null),$=D(0),P=D(0),q=D(!1),ae=D(0),B=D(!1),L=D(!1),X=0,Je=D(void 0),Me=D(null);function Qt(A){try{return gh(A)}catch{return'<div class="artwork-error">Artwork exceeds its layout. Shorten the copy and save before export.</div>'}}let je=Ft(()=>{var A,K;return(((A=e.brandProfile)==null?void 0:A.handle)||((K=e.brandProfile)==null?void 0:K.brandName)||"studio").replace(/[^a-zA-Z0-9_.]/g,"").toLowerCase()}),he=Ft(()=>{var A,K,He,st;return((K=(A=e.campaign)==null?void 0:A.infographic)==null?void 0:K.caption)||((st=(He=e.campaign)==null?void 0:He.story)==null?void 0:st.hookBanner)||""}),Te=Ft(()=>{var K,He,st;const A=((He=(K=e.campaign)==null?void 0:K.reel)==null?void 0:He.beats)||[];for(let Tt=A.length-1;Tt>=0;Tt--){const Ve=(st=A[Tt].timecode)==null?void 0:st.match(/^(\d+):(\d+)/);if(Ve&&a(ae)>=Number(Ve[1])*60+Number(Ve[2]))return Tt}return 0}),pr=Ft(()=>Qt({campaign:e.campaign,brandProfile:e.brandProfile,format:r(),slideIndex:r()==="reel"?a(Te):a(g)})),Ot=Ft(()=>{var A,K;return((K=(A=e.campaign)==null?void 0:A.carousel)==null?void 0:K.slides)||[]});const et=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];let tt=Ft(()=>[{id:"active",campaignDraft:e.campaign,title:"Active campaign",gridLabel:"Active"},...n().filter(A=>A.id!==e.activeStoryId&&A.campaignDraft&&["Scheduled","Exported"].includes(A.status)).sort((A,K)=>A.status!==K.status?A.status==="Scheduled"?-1:1:A.status==="Scheduled"?et.indexOf(A.scheduledDay)-et.indexOf(K.scheduledDay):(Date.parse(K.exportedAt)||0)-(Date.parse(A.exportedAt)||0)).slice(0,8).map(A=>({...A,gridLabel:A.status==="Scheduled"?`Scheduled · ${A.scheduledDay}`:`Exported${A.exportedAt?` · ${new Date(A.exportedAt).toLocaleString()}`:" · time unavailable"}`}))]);su(()=>{JSON.stringify(e.campaign),r(),a(s),a(c),a(o),a(g),a(p),a(Te),a($),a(z),a(S),a(m),a(w),a(L),a(I).length;const A=setTimeout(()=>{Mn()},160);return()=>clearTimeout(A)}),ku(()=>{window.innerWidth<700&&d(o,75);const A=setInterval(()=>{a(B)&&(d(ae,Math.min(30,a(ae)+.25),!0),a(ae)>=30&&d(B,!1)),a(q)&&(d(P,a(P)+.25),a(P)>=5&&(d(P,0),d($,(a($)+1)%4)))},250);return document.fonts.addEventListener("loadingdone",Mn),()=>{clearInterval(A),document.fonts.removeEventListener("loadingdone",Mn)}});function kr(A){d(s,A,!0),d(B,!1),d(q,!1)}function _e(A){r()==="carousel"&&d(g,Math.max(0,Math.min(a(Ot).length-1,a(g)+A)),!0),r()==="story"&&(d($,(a($)+A+4)%4),d(P,0))}function vr(A){var K;["INPUT","TEXTAREA","SELECT"].includes((K=A.target)==null?void 0:K.tagName)||(A.key==="ArrowRight"&&_e(1),A.key==="ArrowLeft"&&_e(-1))}function dn(A){if(/^#[0-9a-f]{6}$/i.test(A))return A;const K=A.match(/[\d.]+/g);return(K==null?void 0:K.length)>=3?"#"+K.slice(0,3).map(He=>Math.round(Number(He)).toString(16).padStart(2,"0")).join(""):null}async function Mn(){var R;if(await mu(),await document.fonts.ready,!a(Je)||a(s)==="grid"){d(Me,null);return}const A=a(Je).getBoundingClientRect();if(!A.width||!A.height)return;const K=[...a(Je).querySelectorAll("svg text")],He=dn(((R=a(Je).querySelector("svg rect"))==null?void 0:R.getAttribute("fill"))||"#141513"),st=K.map(M=>{const W=M.getBoundingClientRect();return{x:W.x-A.x,y:W.y-A.y,width:W.width,height:W.height,foreground:dn(getComputedStyle(M).fill)}}),Tt=a(Je).parentElement,Ve=a(s)==="instagram"?[...Tt.querySelectorAll(".poll-sticker,.reel-rail,.reel-meta,.reel-top,.story-chrome,.story-reply,.slide-count,.previous,.next,.floating-heart")].map(M=>{const W=M.getBoundingClientRect(),me=M.classList.contains("reel-meta")?getComputedStyle(M,"::before"):null,be=gr=>me&&me.content!=="none"?Math.min(0,parseFloat(me[gr])||0):0,qe=be("left"),Ye=be("right"),Pe=be("top"),lt=be("bottom");return{x:W.x-A.x+qe,y:W.y-A.y+Pe,width:W.width-qe-Ye,height:W.height-Pe-lt}}):[],_={format:r(),obstructionBoxes:Ve,canvas:{width:A.width,height:A.height},textBoxes:st,background:He,caption:a(he),captionLimit:Number(a(p)),viewContext:{mode:a(s),frameIndex:r()==="reel"?a(Te):a(g),storyFrame:a($),pollVote:a(z),measuredAt:new Date().toISOString()}},b=bh(_);d(Me,b.metrics,!0),i()(_)}function Tr(){a(N).trim()&&(d(I,[...a(I),a(N).trim()],!0),d(N,""))}async function Li(){d(x,"Local share preview opened. Nothing was published.")}var Un=jh();gi("keydown",Wo,vr);var Ar=l(h(Un),2),Ht=h(Ar);let ni;var rt=l(Ht,2);let ma;var ii=l(rt,2);let ns;var is=l(Ar,2),as=h(is),Fn=l(h(as)),Mi=h(Fn);Mi.value=Mi.__value=375;var Cr=l(Mi);Cr.value=Cr.__value=390;var _t=l(Cr);_t.value=_t.__value=402;var Ui=l(_t);Ui.value=Ui.__value=430,ar(Fn);var ai=l(as,2),ss=l(h(ai)),no=l(ss),io=E(no),os=l(ai,2),$n=h(os),ao=l(os,2),so=h(ao),ba=l(is,4),si=h(ba);let _r,Bn;var Fi=h(si);{var oo=A=>{var K=wh();k(A,K)};le(Fi,A=>{a(s)!=="design"&&A(oo)})}var wa=l(Fi,2);{var fn=A=>{var K=Sh(),He=Qe(K),st=h(He),Tt=E(st,!0),Ve=l(st),_=l(He,2),b=h(_),R=E(b,!0),M=l(b),W=h(M),me=E(W,!0),be=l(_,2),qe=h(be),Ye=E(qe,!0),Pe=l(qe,2),lt=E(Pe,!0),gr=l(be,2);Re(gr,20,()=>Array(9),Gi,(At,Vt,Ct)=>{var Gr=Eh();sr(Gr,1,"grid-cell",null,{},{current:Ct===0});var Rr=h(Gr);{var ya=zt=>{var Hn=yh(),G=Qe(Hn);Wl(G,()=>Qt({campaign:a(tt)[Ct].campaignDraft,brandProfile:e.brandProfile,format:"infographic"}));var Ie=l(G),xe=E(Ie,!0);F(()=>y(xe,a(tt)[Ct].gridLabel)),k(zt,Hn)},Bi=zt=>{var Hn=Ih();k(zt,Hn)};le(Rr,zt=>{a(tt)[Ct]?zt(ya):zt(Bi,-1)})}F(()=>{var zt;return Et(Gr,"title",((zt=a(tt)[Ct])==null?void 0:zt.title)||"Empty slot")}),k(At,Gr)}),F(At=>{var Vt,Ct;y(Tt,a(je)),y(R,At),y(me,a(tt).length),y(Ye,(Vt=e.brandProfile)==null?void 0:Vt.brandName),y(lt,(Ct=e.brandProfile)==null?void 0:Ct.tagline)},[()=>{var At,Vt;return((Vt=(At=e.brandProfile)==null?void 0:At.logoText)==null?void 0:Vt.slice(0,2))||a(je).slice(0,2)}]),O("click",Ve,()=>d(x,"Profile options are a local simulation.")),k(A,K)},lo=A=>{var K=$h(),He=Qe(K);{var st=G=>{var Ie=kh(),xe=h(Ie),ze=E(xe,!0),Ue=l(xe,2),nt=h(Ue),Dt=E(nt,!0),ct=l(Ue,2);F(Wt=>{y(ze,Wt),y(Dt,a(je))},[()=>a(je).slice(0,2)]),O("click",ct,()=>d(x,"Post menu preview. Export to save an actual file.")),k(G,Ie)},Tt=Ft(()=>a(s)==="instagram"&&!["story","reel"].includes(r()));le(He,G=>{a(Tt)&&G(st)})}var Ve=l(He,2);let _;var b=h(Ve);Wl(b,()=>a(pr),!0),hh(b,G=>d(Je,G),()=>a(Je));var R=l(b,2);{var M=G=>{var Ie=Th(),xe=Qe(Ie),ze=E(xe),Ue=l(xe),nt=l(Ue);F(()=>{y(ze,`${a(g)+1}/${a(Ot).length??""}`),Ue.disabled=a(g)===0,nt.disabled=a(g)===a(Ot).length-1}),O("click",Ue,()=>_e(-1)),O("click",nt,()=>_e(1)),k(G,Ie)};le(R,G=>{a(s)==="instagram"&&r()==="carousel"&&G(M)})}var W=l(R,2);{var me=G=>{var Ie=Ch(),xe=Qe(Ie),ze=h(xe);Re(ze,20,()=>[0,1,2,3],Ke=>Ke,(Ke,ut)=>{var mt=Ah(),Xe=h(mt);let bt;F(()=>bt=Gl(Xe,"",bt,{width:`${ut<a($)?100:ut===a($)?a(P)*20:0}%`})),k(Ke,mt)});var Ue=l(ze,2),nt=h(Ue),Dt=E(nt,!0),ct=l(nt),Wt=E(ct,!0),jt=l(ct,2),Vn=E(jt,!0),hn=l(jt),pn=l(xe,2),vn=h(pn),_n=E(vn,!0),gn=l(vn,2),Pr=h(gn);let xr;var oi=E(Pr),gt=l(Pr);let Zt;var mn=E(gt),V=l(gn,2),ee=E(V,!0),J=l(pn,2),ge=l(h(J)),Ge=E(ge,!0),it=l(ge);F(Ke=>{var ut,mt;y(Dt,Ke),y(Wt,a(je)),Et(jt,"aria-label",a(q)?"Pause story":"Play story"),y(Vn,a(q)?"Ⅱ":"▶"),y(_n,(mt=(ut=e.campaign)==null?void 0:ut.story)==null?void 0:mt.interactiveStickerPrompt),xr=sr(Pr,1,"",null,xr,{voted:a(z)==="A"}),y(oi,`Investigate ${a(z)?a(z)==="A"?"✓ 100%":"0%":""}`),Zt=sr(gt,1,"",null,Zt,{voted:a(z)==="B"}),y(mn,`Read sources ${a(z)?a(z)==="B"?"✓ 100%":"0%":""}`),y(ee,a(z)?"Your one local vote · simulated result":"Try a local poll vote"),Et(ge,"aria-pressed",a(m)),y(Ge,a(m)?"♥":"♡")},[()=>a(je).slice(0,2)]),O("click",jt,()=>d(q,!a(q))),O("click",hn,()=>kr("design")),O("click",Pr,()=>d(z,"A")),O("click",gt,()=>d(z,"B")),O("click",ge,()=>d(m,!a(m))),O("click",it,Li),k(G,Ie)};le(W,G=>{a(s)==="instagram"&&r()==="story"&&G(me)})}var be=l(W,2);{var qe=G=>{var Ie=Rh(),xe=l(Qe(Ie),2),ze=h(xe),Ue=h(ze),nt=l(Ue),Dt=E(nt,!0),ct=l(ze),Wt=l(h(ct)),jt=E(Wt,!0),Vn=l(ct),hn=l(Vn),pn=l(hn);let vn;var _n=l(xe,2),gn=h(_n),Pr=E(gn,!0),xr=l(gn),oi=E(xr,!0),gt=l(xr,2),Zt=E(gt);F(mn=>{Et(ze,"aria-pressed",a(m)),y(Ue,a(m)?"♥":"♡"),y(Dt,a(m)?1:0),y(jt,a(I).length),vn=sr(pn,1,"vinyl",null,vn,{spinning:a(B)}),y(Pr,a(je)),Et(xr,"aria-pressed",a(L)),y(oi,a(L)?"Following":"+ Follow"),y(Zt,`${mn??""}${a(he).length>a(p)?"…":""}`)},[()=>a(he).slice(0,a(p))]),O("click",ze,()=>d(m,!a(m))),O("click",ct,()=>d(T,!a(T))),O("click",Vn,Li),O("click",hn,()=>d(x,"Reel options preview; nothing is published.")),O("click",xr,()=>d(L,!a(L))),k(G,Ie)};le(be,G=>{a(s)==="instagram"&&r()==="reel"&&G(qe)})}var Ye=l(be,2);{var Pe=G=>{var Ie=xh(),xe=l(h(Ie),4);{var ze=Ue=>{var nt=Ph();k(Ue,nt)};le(xe,Ue=>{r()==="reel"&&Ue(ze)})}k(G,Ie)},lt=Ft(()=>a(u)&&["story","reel"].includes(r()));le(Ye,G=>{a(lt)&&G(Pe)})}var gr=l(Ye,2);{var At=G=>{var Ie=Nh();k(G,Ie)},Vt=Ft(()=>a(m)&&a(x).includes("Liked"));le(gr,G=>{a(Vt)&&G(At)})}var Ct=l(Ve,2);{var Gr=G=>{var Ie=Oh(),xe=h(Ie),ze=E(xe,!0),Ue=l(xe),nt=l(Ue),Dt=E(nt);F(ct=>{y(ze,a(B)?"Pause reel":"Play reel"),y(Dt,`BEAT ${a(Te)+1} · ${ct??""} / 30s`)},[()=>Math.floor(a(ae))]),O("click",xe,()=>d(B,!a(B))),Be(Ue,()=>a(ae),ct=>d(ae,ct)),k(G,Ie)};le(Ct,G=>{r()==="reel"&&G(Gr)})}var Rr=l(Ct,2);{var ya=G=>{var Ie=Uh(),xe=Qe(Ie),ze=h(xe),Ue=E(ze,!0),nt=l(ze),Dt=l(nt),ct=l(Dt);{var Wt=gt=>{var Zt=Lh();Re(Zt,21,()=>a(Ot),Gi,(mn,V,ee)=>{var J=Dh();Et(J,"aria-label",`Go to slide ${ee+1}`);let ge;F(()=>ge=sr(J,1,"",null,ge,{active:a(g)===ee})),O("click",J,()=>d(g,ee,!0)),k(mn,J)}),k(gt,Zt)};le(ct,gt=>{r()==="carousel"&&gt(Wt)})}var jt=l(ct),Vn=E(jt,!0),hn=l(xe,2),pn=E(hn),vn=l(hn,2),_n=h(vn),gn=E(_n,!0),Pr=l(_n),xr=l(Pr);{var oi=gt=>{var Zt=Mh(),mn=E(Zt,!0);F(()=>y(mn,a(S)?"less":"… more")),O("click",Zt,()=>d(S,!a(S))),k(gt,Zt)};le(xr,gt=>{a(he).length>a(p)&&gt(oi)})}F(gt=>{Et(ze,"aria-pressed",a(m)),y(Ue,a(m)?"♥":"♡"),Et(jt,"aria-pressed",a(w)),y(Vn,a(w)?"▣":"♧"),y(pn,`${a(m)?1:0} local likes · ${a(w)?"Saved in preview":"Preview only"}`),y(gn,a(je)),y(Pr,` ${gt??""}`)},[()=>a(S)?a(he):a(he).slice(0,a(p))]),O("click",ze,()=>d(m,!a(m))),O("click",nt,()=>d(T,!a(T))),O("click",Dt,Li),O("click",jt,()=>d(w,!a(w))),k(G,Ie)},Bi=Ft(()=>a(s)==="instagram"&&!["story","reel"].includes(r()));le(Rr,G=>{a(Bi)&&G(ya)})}var zt=l(Rr,2);{var Hn=G=>{var Ie=Fh(),xe=h(Ie),ze=l(h(xe)),Ue=l(xe,2),nt=h(Ue),Dt=E(nt,!0),ct=l(nt,2,!0);F((Wt,jt)=>{y(Dt,Wt),y(ct,jt)},[()=>a(he).slice(0,a(p)),()=>a(he).slice(a(p))]),Be(ze,()=>a(p),Wt=>d(p,Wt)),k(G,Ie)};le(zt,G=>{a(f)&&G(Hn)})}F(G=>_=sr(Ve,1,"asset-stage",null,_,{vertical:G}),[()=>["story","reel"].includes(r())]),O("pointerdown",Ve,G=>X=G.clientX),O("pointerup",Ve,G=>{Math.abs(G.clientX-X)>40&&_e(G.clientX<X?1:-1)}),O("dblclick",Ve,()=>{d(m,!0),d(x,"Liked in this simulation")}),k(A,K)};le(wa,A=>{a(s)==="grid"?A(fn):A(lo,-1)})}var ls=l(wa,2);{var cs=A=>{var K=Hh(),He=l(h(K));Re(He,17,()=>a(I),Gi,(Ve,_)=>{var b=Bh(),R=E(b,!0);F(()=>y(R,a(_))),k(Ve,b)});var st=l(He,2),Tt=h(st);gi("submit",st,Ve=>{Ve.preventDefault(),Tr()}),Be(Tt,()=>a(N),Ve=>d(N,Ve)),k(A,K)};le(ls,A=>{a(T)&&A(cs)})}var us=l(ls,2);{var ds=A=>{var K=Vh(),He=E(K,!0);F(()=>y(He,a(x))),k(A,K)};le(us,A=>{a(x)&&A(ds)})}var co=l(ba,2),fs=h(co),$i=l(h(fs)),uo=l(fs,2);{var fo=A=>{var K=zh(),He=Qe(K),st=h(He),Tt=h(st),Ve=E(Tt,!0),_=l(st),b=h(_),R=E(b,!0),M=l(_),W=h(M),me=E(W),be=l(W),qe=l(M),Ye=h(qe),Pe=E(Ye,!0),lt=l(Ye),gr=l(qe),At=h(gr),Vt=E(At,!0);F(()=>{y(Ve,a(Me).occludedElementsCount),y(R,a(Me).overflowElementsCount),y(me,`${a(Me).contrastRatio??"Unmeasured"??""}${a(Me).contrastRatio!==null?":1":""}`),y(be,` minimum text/background contrast${a(Me).unmeasuredColorCount?` · ${a(Me).unmeasuredColorCount} unmeasured`:""}`),y(Pe,a(Me).expectedAspectRatio),y(lt,` target ratio · ${a(Me).aspectRatioDeviation<=.01?"matched":"check dimensions"}`),y(Vt,a(Me).firstLookCharacters)}),k(A,K)},hs=A=>{var K=Wh();k(A,K)};le(uo,A=>{a(Me)?A(fo):A(hs,-1)})}F(A=>{ni=sr(Ht,1,"",null,ni,{active:a(s)==="design"}),ma=sr(rt,1,"",null,ma,{active:a(s)==="instagram"}),ns=sr(ii,1,"",null,ns,{active:a(s)==="grid"}),y(io,`${a(o)??""}%`),_r=sr(si,1,"phone",null,_r,{raw:a(s)==="design"}),Bn=Gl(si,"",Bn,{width:`${a(c)??""}px`,height:A,zoom:a(o)/100})},[()=>a(s)==="design"?"auto":`${Math.round(a(c)*874/402)}px`]),O("click",Ht,()=>kr("design")),O("click",rt,()=>kr("instagram")),O("click",ii,()=>kr("grid")),Ur(Fn,()=>a(c),A=>d(c,A)),Be(ss,()=>a(o),A=>d(o,A)),Fs($n,()=>a(u),A=>d(u,A)),Fs(so,()=>a(f),A=>d(f,A)),O("click",$i,Mn),k(t,Un),ll()}Iu(["click","pointerdown","pointerup","dblclick"]);const Gh=()=>{};var Yl={};/**
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
 */const Tu=function(t){const e=[];let r=0;for(let n=0;n<t.length;n++){let i=t.charCodeAt(n);i<128?e[r++]=i:i<2048?(e[r++]=i>>6|192,e[r++]=i&63|128):(i&64512)===55296&&n+1<t.length&&(t.charCodeAt(n+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++n)&1023),e[r++]=i>>18|240,e[r++]=i>>12&63|128,e[r++]=i>>6&63|128,e[r++]=i&63|128):(e[r++]=i>>12|224,e[r++]=i>>6&63|128,e[r++]=i&63|128)}return e},Kh=function(t){const e=[];let r=0,n=0;for(;r<t.length;){const i=t[r++];if(i<128)e[n++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[r++];e[n++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[r++],o=t[r++],c=t[r++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|c&63)-65536;e[n++]=String.fromCharCode(55296+(u>>10)),e[n++]=String.fromCharCode(56320+(u&1023))}else{const s=t[r++],o=t[r++];e[n++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},Au={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const r=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,c=o?t[i+1]:0,u=i+2<t.length,f=u?t[i+2]:0,p=s>>2,g=(s&3)<<4|c>>4;let m=(c&15)<<2|f>>6,w=f&63;u||(w=64,o||(m=64)),n.push(r[p],r[g],r[m],r[w])}return n.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Tu(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Kh(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const r=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let i=0;i<t.length;){const s=r[t.charAt(i++)],c=i<t.length?r[t.charAt(i)]:0;++i;const f=i<t.length?r[t.charAt(i)]:64;++i;const g=i<t.length?r[t.charAt(i)]:64;if(++i,s==null||c==null||f==null||g==null)throw new Jh;const m=s<<2|c>>4;if(n.push(m),f!==64){const w=c<<4&240|f>>2;if(n.push(w),g!==64){const S=f<<6&192|g;n.push(S)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Jh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Yh=function(t){const e=Tu(t);return Au.encodeByteArray(e,!0)},Cu=function(t){return Yh(t).replace(/\./g,"")},Ru=function(t){try{return Au.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Xh(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Qh=()=>Xh().__FIREBASE_DEFAULTS__,Zh=()=>{if(typeof process>"u"||typeof Yl>"u")return;const t=Yl.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},ep=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Ru(t[1]);return e&&JSON.parse(e)},wl=()=>{try{return Gh()||Qh()||Zh()||ep()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},tp=t=>{var e,r;return(r=(e=wl())==null?void 0:e.emulatorHosts)==null?void 0:r[t]},Pu=()=>{var t;return(t=wl())==null?void 0:t.config},xu=t=>{var e;return(e=wl())==null?void 0:e[`_${t}`]};/**
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
 */class rp{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,r)=>{this.resolve=e,this.reject=r})}wrapCallback(e){return(r,n)=>{r?this.reject(r):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(r):e(r,n))}}}/**
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
 */function Bt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function np(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Bt())}function ip(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function ap(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function sp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function op(){const t=Bt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function lp(){try{return typeof indexedDB=="object"}catch{return!1}}function cp(){return new Promise((t,e)=>{try{let r=!0;const n="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(n);i.onsuccess=()=>{i.result.close(),r||self.indexedDB.deleteDatabase(n),t(!0)},i.onupgradeneeded=()=>{r=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(r){e(r)}})}/**
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
 */const up="FirebaseError";class ti extends Error{constructor(e,r,n){super(r),this.code=e,this.customData=n,this.name=up,Object.setPrototypeOf(this,ti.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Xa.prototype.create)}}class Xa{constructor(e,r,n){this.service=e,this.serviceName=r,this.errors=n}create(e,...r){const n=r[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?dp(s,n):"Error",c=`${this.serviceName}: ${o} (${i}).`;return new ti(i,c,n)}}function dp(t,e){try{let r=0,n="";for(;r<t.length;){const i=t.indexOf("{$",r);if(i===-1){n+=t.substring(r);break}const s=t.indexOf("}",i+2);if(s===-1){n+=t.substring(r);break}const o=t.substring(i+2,s),c=e[o];n+=t.substring(r,i)+(c!=null?String(c):`<${o}?>`),r=s+1}return n}catch{return t}}function fp(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function ua(t,e){if(t===e)return!0;const r=Object.keys(t),n=Object.keys(e);for(const i of r){if(!n.includes(i))return!1;const s=t[i],o=e[i];if(Xl(s)&&Xl(o)){if(!ua(s,o))return!1}else if(s!==o)return!1}for(const i of n)if(!r.includes(i))return!1;return!0}function Xl(t){return t!==null&&typeof t=="object"}/**
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
 */function Qa(t){const e=[];for(const[r,n]of Object.entries(t))Array.isArray(n)?n.forEach(i=>{e.push(encodeURIComponent(r)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(r)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function hp(t,e){const r=new pp(t,e);return r.subscribe.bind(r)}class pp{constructor(e,r){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=r,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(r=>{r.next(e)})}error(e){this.forEachObserver(r=>{r.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,r,n){let i;if(e===void 0&&r===void 0&&n===void 0)throw new Error("Missing Observer.");vp(e,["next","error","complete"])?i=e:i={next:e,error:r,complete:n},i.next===void 0&&(i.next=Ro),i.error===void 0&&(i.error=Ro),i.complete===void 0&&(i.complete=Ro);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let r=0;r<this.observers.length;r++)this.sendOne(r,e)}sendOne(e,r){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{r(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function vp(t,e){if(typeof t!="object"||t===null)return!1;for(const r of e)if(r in t&&typeof t[r]=="function")return!0;return!1}function Ro(){}/**
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
 */function ri(t){return t&&t._delegate?t._delegate:t}/**
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
 */function yl(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function _p(t){return(await fetch(t,{credentials:"include"})).ok}class da{constructor(e,r,n){this.name=e,this.instanceFactory=r,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const vi="[DEFAULT]";/**
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
 */class gp{constructor(e,r){this.name=e,this.container=r,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const r=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(r)){const n=new rp;if(this.instancesDeferred.set(r,n),this.isInitialized(r)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:r});i&&n.resolve(i)}catch{}}return this.instancesDeferred.get(r).promise}getImmediate(e){const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(n)return null;throw i}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(bp(e))try{this.getOrInitializeService({instanceIdentifier:vi})}catch{}for(const[r,n]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(r);try{const s=this.getOrInitializeService({instanceIdentifier:i});n.resolve(s)}catch{}}}}clearInstance(e=vi){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(r=>"INTERNAL"in r).map(r=>r.INTERNAL.delete()),...e.filter(r=>"_delete"in r).map(r=>r._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=vi){return this.instances.has(e)}getOptions(e=vi){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:r={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:n,options:r});for(const[s,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);n===c&&o.resolve(i)}return i}onInit(e,r){const n=this.normalizeInstanceIdentifier(r),i=this.onInitCallbacks.get(n)??new Set;i.add(e),this.onInitCallbacks.set(n,i);const s=this.instances.get(n);return s&&e(s,n),()=>{i.delete(e)}}invokeOnInitCallbacks(e,r){const n=this.onInitCallbacks.get(r);if(n)for(const i of n)try{i(e,r)}catch{}}getOrInitializeService({instanceIdentifier:e,options:r={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:mp(e),options:r}),this.instances.set(e,n),this.instancesOptions.set(e,r),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=vi){return this.component?this.component.multipleInstances?e:vi:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function mp(t){return t===vi?void 0:t}function bp(t){return t.instantiationMode==="EAGER"}/**
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
 */class wp{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const r=this.getProvider(e.name);if(r.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);r.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const r=new gp(e,this);return this.providers.set(e,r),r}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var Le;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Le||(Le={}));const yp={debug:Le.DEBUG,verbose:Le.VERBOSE,info:Le.INFO,warn:Le.WARN,error:Le.ERROR,silent:Le.SILENT},Ip=Le.INFO,Ep={[Le.DEBUG]:"log",[Le.VERBOSE]:"log",[Le.INFO]:"info",[Le.WARN]:"warn",[Le.ERROR]:"error"},Sp=(t,e,...r)=>{if(e<t.logLevel)return;const n=new Date().toISOString(),i=Ep[e];if(i)console[i](`[${n}]  ${t.name}:`,...r);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Nu{constructor(e){this.name=e,this._logLevel=Ip,this._logHandler=Sp,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Le))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?yp[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Le.DEBUG,...e),this._logHandler(this,Le.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Le.VERBOSE,...e),this._logHandler(this,Le.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Le.INFO,...e),this._logHandler(this,Le.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Le.WARN,...e),this._logHandler(this,Le.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Le.ERROR,...e),this._logHandler(this,Le.ERROR,...e)}}const kp=(t,e)=>e.some(r=>t instanceof r);let Ql,Zl;function Tp(){return Ql||(Ql=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ap(){return Zl||(Zl=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Ou=new WeakMap,Qo=new WeakMap,Du=new WeakMap,Po=new WeakMap,Il=new WeakMap;function Cp(t){const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{r(Zn(t.result)),i()},o=()=>{n(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(r=>{r instanceof IDBCursor&&Ou.set(r,t)}).catch(()=>{}),Il.set(e,t),e}function Rp(t){if(Qo.has(t))return;const e=new Promise((r,n)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{r(),i()},o=()=>{n(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});Qo.set(t,e)}let Zo={get(t,e,r){if(t instanceof IDBTransaction){if(e==="done")return Qo.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Du.get(t);if(e==="store")return r.objectStoreNames[1]?void 0:r.objectStore(r.objectStoreNames[0])}return Zn(t[e])},set(t,e,r){return t[e]=r,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Pp(t){Zo=t(Zo)}function xp(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...r){const n=t.call(xo(this),e,...r);return Du.set(n,e.sort?e.sort():[e]),Zn(n)}:Ap().includes(t)?function(...e){return t.apply(xo(this),e),Zn(Ou.get(this))}:function(...e){return Zn(t.apply(xo(this),e))}}function Np(t){return typeof t=="function"?xp(t):(t instanceof IDBTransaction&&Rp(t),kp(t,Tp())?new Proxy(t,Zo):t)}function Zn(t){if(t instanceof IDBRequest)return Cp(t);if(Po.has(t))return Po.get(t);const e=Np(t);return e!==t&&(Po.set(t,e),Il.set(e,t)),e}const xo=t=>Il.get(t);function Op(t,e,{blocked:r,upgrade:n,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),c=Zn(o);return n&&o.addEventListener("upgradeneeded",u=>{n(Zn(o.result),u.oldVersion,u.newVersion,Zn(o.transaction),u)}),r&&o.addEventListener("blocked",u=>r(u.oldVersion,u.newVersion,u)),c.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",f=>i(f.oldVersion,f.newVersion,f))}).catch(()=>{}),c}const Dp=["get","getKey","getAll","getAllKeys","count"],Lp=["put","add","delete","clear"],No=new Map;function ec(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(No.get(e))return No.get(e);const r=e.replace(/FromIndex$/,""),n=e!==r,i=Lp.includes(r);if(!(r in(n?IDBIndex:IDBObjectStore).prototype)||!(i||Dp.includes(r)))return;const s=async function(o,...c){const u=this.transaction(o,i?"readwrite":"readonly");let f=u.store;return n&&(f=f.index(c.shift())),(await Promise.all([f[r](...c),i&&u.done]))[0]};return No.set(e,s),s}Pp(t=>({...t,get:(e,r,n)=>ec(e,r)||t.get(e,r,n),has:(e,r)=>!!ec(e,r)||t.has(e,r)}));/**
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
 */class Mp{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(r=>{if(Up(r)){const n=r.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(r=>r).join(" ")}}function Up(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const el="@firebase/app",tc="0.16.2";/**
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
 */const On=new Nu("@firebase/app"),Fp="@firebase/app-compat",$p="@firebase/analytics-compat",Bp="@firebase/analytics",Hp="@firebase/app-check-compat",Vp="@firebase/app-check",zp="@firebase/auth",Wp="@firebase/auth-compat",jp="@firebase/database",qp="@firebase/data-connect",Gp="@firebase/database-compat",Kp="@firebase/functions",Jp="@firebase/functions-compat",Yp="@firebase/installations",Xp="@firebase/installations-compat",Qp="@firebase/messaging",Zp="@firebase/messaging-compat",ev="@firebase/performance",tv="@firebase/performance-compat",rv="@firebase/remote-config",nv="@firebase/remote-config-compat",iv="@firebase/storage",av="@firebase/storage-compat",sv="@firebase/firestore",ov="@firebase/ai",lv="@firebase/firestore-compat",cv="firebase",uv="12.19.0";/**
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
 */const tl="[DEFAULT]",dv={[el]:"fire-core",[Fp]:"fire-core-compat",[Bp]:"fire-analytics",[$p]:"fire-analytics-compat",[Vp]:"fire-app-check",[Hp]:"fire-app-check-compat",[zp]:"fire-auth",[Wp]:"fire-auth-compat",[jp]:"fire-rtdb",[qp]:"fire-data-connect",[Gp]:"fire-rtdb-compat",[Kp]:"fire-fn",[Jp]:"fire-fn-compat",[Yp]:"fire-iid",[Xp]:"fire-iid-compat",[Qp]:"fire-fcm",[Zp]:"fire-fcm-compat",[ev]:"fire-perf",[tv]:"fire-perf-compat",[rv]:"fire-rc",[nv]:"fire-rc-compat",[iv]:"fire-gcs",[av]:"fire-gcs-compat",[sv]:"fire-fst",[lv]:"fire-fst-compat",[ov]:"fire-vertex","fire-js":"fire-js",[cv]:"fire-js-all"};/**
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
 */const $s=new Map,fv=new Map,rl=new Map;function rc(t,e){try{t.container.addComponent(e)}catch(r){On.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,r)}}function $a(t){const e=t.name;if(rl.has(e))return On.debug(`There were multiple attempts to register component ${e}.`),!1;rl.set(e,t);for(const r of $s.values())rc(r,t);for(const r of fv.values())rc(r,t);return!0}function Lu(t,e){const r=t.container.getProvider("heartbeat").getImmediate({optional:!0});return r&&r.triggerHeartbeat(),t.container.getProvider(e)}function nn(t){return t==null?!1:t.settings!==void 0}/**
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
 */const hv={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Cn=new Xa("app","Firebase",hv);/**
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
 */class pv{constructor(e,r,n){this._isDeleted=!1,this._options={...e},this._config={...r},this._name=r.name,this._automaticDataCollectionEnabled=r.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new da("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Cn.create("app-deleted",{appName:this._name})}}/**
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
 */const Za=uv;function Mu(t,e={}){let r=t;typeof e!="object"&&(e={name:e});const n={name:tl,automaticDataCollectionEnabled:!0,...e},i=n.name;if(typeof i!="string"||!i)throw Cn.create("bad-app-name",{appName:String(i)});if(r||(r=Pu()),!r)throw Cn.create("no-options");const s=$s.get(i);if(s)if(ua(r,s.options)){if(ua(n,s.config))return s;throw Cn.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(s.config),newValue:JSON.stringify(n)})}else throw Cn.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(s.options),newValue:JSON.stringify(r)});const o=new wp(i);for(const u of rl.values())o.addComponent(u);const c=new pv(r,n,o);return $s.set(i,c),c}function vv(t=tl){const e=$s.get(t);if(!e&&t===tl&&Pu())return Mu();if(!e)throw Cn.create("no-app",{appName:t});return e}function Ji(t,e,r){let n=dv[t]??t;r&&(n+=`-${r}`);const i=n.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${n}" with version "${e}":`];i&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),On.warn(o.join(" "));return}$a(new da(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
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
 */const _v="firebase-heartbeat-database",gv=1,Ba="firebase-heartbeat-store";let Oo=null;function Uu(){return Oo||(Oo=Op(_v,gv,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Ba)}catch(r){console.warn(r)}}}}).catch(t=>{throw Cn.create("idb-open",{originalErrorMessage:t.message})})),Oo}async function mv(t){try{const r=(await Uu()).transaction(Ba),n=await r.objectStore(Ba).get(Fu(t));return await r.done,n}catch(e){if(e instanceof ti)On.warn(e.message);else{const r=Cn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});On.warn(r.message)}}}async function nc(t,e){try{const n=(await Uu()).transaction(Ba,"readwrite");await n.objectStore(Ba).put(e,Fu(t)),await n.done}catch(r){if(r instanceof ti)On.warn(r.message);else{const n=Cn.create("idb-set",{originalErrorMessage:r==null?void 0:r.message});On.warn(n.message)}}}function Fu(t){return`${t.name}!${t.options.appId}`}/**
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
 */const bv=1024,wv=30;class yv{constructor(e){this.container=e,this._heartbeatsCache=null;const r=this.container.getProvider("app").getImmediate();this._storage=new Ev(r),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,r;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=ic();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((r=this._heartbeatsCache)==null?void 0:r.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>wv){const o=Sv(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){On.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const r=ic(),{heartbeatsToSend:n,unsentEntries:i}=Iv(this._heartbeatsCache.heartbeats),s=Cu(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=r,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(r){return On.warn(r),""}}}function ic(){return new Date().toISOString().substring(0,10)}function Iv(t,e=bv){const r=[];let n=t.slice();for(const i of t){const s=r.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),ac(r)>e){s.dates.pop();break}}else if(r.push({agent:i.agent,dates:[i.date]}),ac(r)>e){r.pop();break}n=n.slice(1)}return{heartbeatsToSend:r,unsentEntries:n}}class Ev{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return lp()?cp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const r=await mv(this.app);return r!=null&&r.heartbeats?r:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return nc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return nc(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function ac(t){return Cu(JSON.stringify({version:2,heartbeats:t})).length}function Sv(t){if(t.length===0)return-1;let e=0,r=t[0].date;for(let n=1;n<t.length;n++)t[n].date<r&&(r=t[n].date,e=n);return e}/**
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
 */function kv(t){$a(new da("platform-logger",e=>new Mp(e),"PRIVATE")),$a(new da("heartbeat",e=>new yv(e),"PRIVATE")),Ji(el,tc,t),Ji(el,tc,"esm2020"),Ji("fire-js","")}/**
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
 */kv("");var Tv="firebase",Av="12.19.0";/**
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
 */Ji(Tv,Av,"app");function $u(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Cv=$u,Bu=new Xa("auth","Firebase",$u());/**
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
 */const Bs=new Nu("@firebase/auth");function As(t,...e){Bs.logLevel<=Le.WARN&&Bs.warn(`Auth (${Za}): ${t}`,...e)}function Cs(t,...e){Bs.logLevel<=Le.ERROR&&Bs.error(`Auth (${Za}): ${t}`,...e)}/**
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
 */function un(t,...e){throw El(t,...e)}function jr(t,...e){return El(t,...e)}function Zs(t,e,r){const n={...Cv(),[e]:r};return new Xa("auth","Firebase",n).create(e,{appName:t.name})}function Pi(t){return Zs(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Rv(t,e,r){const n=r;if(!(e instanceof n))throw n.name!==e.constructor.name&&un(t,"argument-error"),Zs(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function El(t,...e){if(typeof t!="string"){const r=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=t.name),t._errorFactory.create(r,...n)}return Bu.create(t,...e)}function Y(t,e,...r){if(!t)throw El(e,...r)}function Rn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Cs(e),new Error(e)}function Dn(t,e){t||Rn(e)}/**
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
 */function nl(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function Pv(){return sc()==="http:"||sc()==="https:"}function sc(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
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
 */function xv(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Pv()||ap()||"connection"in navigator)?navigator.onLine:!0}function Nv(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class es{constructor(e,r){this.shortDelay=e,this.longDelay=r,Dn(r>e,"Short delay should be less than long delay!"),this.isMobile=np()||sp()}get(){return xv()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Sl(t,e){Dn(t.emulator,"Emulator should always be set here");const{url:r}=t.emulator;return e?`${r}${e.startsWith("/")?e.slice(1):e}`:r}/**
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
 */class Hu{static initialize(e,r,n){this.fetchImpl=e,r&&(this.headersImpl=r),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Rn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Rn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Rn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Ov={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Dv=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Lv=new es(3e4,6e4);function kl(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function ga(t,e,r,n,i={}){return Vu(t,i,async()=>{let s={},o={};n&&(e==="GET"?o=n:s={body:JSON.stringify(n)});const c=Qa({...o,key:t.config.apiKey}).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const f={method:e,headers:u,...s};return ip()||(f.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&yl(t.emulatorConfig.host)&&(f.credentials="include"),Hu.fetch()(await zu(t,t.config.apiHost,r,c),f)})}async function Vu(t,e,r){t._canInitEmulator=!1;const n={...Ov,...e};try{const i=new Uv(t),s=await Promise.race([r(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw ys(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const c=s.ok?o.errorMessage:o.error.message,[u,f]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw ys(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw ys(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw ys(t,"user-disabled",o);const p=n[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(f)throw Zs(t,p,f);un(t,p)}}catch(i){if(i instanceof ti)throw i;un(t,"network-request-failed",{message:String(i)})}}async function Mv(t,e,r,n,i={}){const s=await ga(t,e,r,n,i);return"mfaPendingCredential"in s&&un(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function zu(t,e,r,n){const i=`${e}${r}?${n}`,s=t,o=s.config.emulator?Sl(t.config,i):`${t.config.apiScheme}://${i}`;return Dv.includes(r)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}class Uv{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((r,n)=>{this.timer=setTimeout(()=>n(jr(this.auth,"network-request-failed")),Lv.get())})}}function ys(t,e,r){const n={appName:t.name};r.email&&(n.email=r.email),r.phoneNumber&&(n.phoneNumber=r.phoneNumber);const i=jr(t,e,n);return i.customData._tokenResponse=r,i}/**
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
 */async function Fv(t,e){return ga(t,"POST","/v1/accounts:delete",e)}async function Hs(t,e){return ga(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function Oa(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function $v(t,e=!1){const r=ri(t),n=await r.getIdToken(e),i=Tl(n);Y(i&&i.exp&&i.auth_time&&i.iat,r.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:n,authTime:Oa(Do(i.auth_time)),issuedAtTime:Oa(Do(i.iat)),expirationTime:Oa(Do(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Do(t){return Number(t)*1e3}function Tl(t){const[e,r,n]=t.split(".");if(e===void 0||r===void 0||n===void 0)return Cs("JWT malformed, contained fewer than 3 sections"),null;try{const i=Ru(r);return i?JSON.parse(i):(Cs("Failed to decode base64 JWT payload"),null)}catch(i){return Cs("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function oc(t){const e=Tl(t);return Y(e,"internal-error"),Y(typeof e.exp<"u","internal-error"),Y(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Ha(t,e,r=!1){if(r)return e;try{return await e}catch(n){throw n instanceof ti&&Bv(n)&&t.auth.currentUser===t&&await t.auth.signOut(),n}}function Bv({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class Hv{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const r=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},r)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class il{constructor(e,r){this.createdAt=e,this.lastLoginAt=r,this._initializeTime()}_initializeTime(){this.lastSignInTime=Oa(this.lastLoginAt),this.creationTime=Oa(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Vs(t){var g;const e=t.auth,r=await t.getIdToken(),n=await Ha(t,Hs(e,{idToken:r}));Y(n==null?void 0:n.users.length,e,"internal-error");const i=n.users[0];t._notifyReloadListener(i);const s=(g=i.providerUserInfo)!=null&&g.length?Wu(i.providerUserInfo):[],o=zv(t.providerData,s),c=t.isAnonymous,u=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),f=c?u:!1,p={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new il(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(t,p)}async function Vv(t){const e=ri(t);await Vs(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function zv(t,e){return[...t.filter(n=>!e.some(i=>i.providerId===n.providerId)),...e]}function Wu(t){return t.map(({providerId:e,...r})=>({providerId:e,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}))}/**
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
 */async function Wv(t,e){const r=await Vu(t,{},async()=>{const n=Qa({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await zu(t,i,"/v1/token",`key=${s}`),c=await t._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:n};return t.emulatorConfig&&yl(t.emulatorConfig.host)&&(u.credentials="include"),Hu.fetch()(o,u)});return{accessToken:r.access_token,expiresIn:r.expires_in,refreshToken:r.refresh_token}}async function jv(t,e){return ga(t,"POST","/v2/accounts:revokeToken",kl(t,e))}/**
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
 */class Yi{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){Y(e.idToken,"internal-error"),Y(typeof e.idToken<"u","internal-error"),Y(typeof e.refreshToken<"u","internal-error");const r="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):oc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,r)}updateFromIdToken(e){Y(e.length!==0,"internal-error");const r=oc(e);this.updateTokensAndExpiration(e,null,r)}async getToken(e,r=!1){return!r&&this.accessToken&&!this.isExpired?this.accessToken:(Y(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,r){const{accessToken:n,refreshToken:i,expiresIn:s}=await Wv(e,r);this.updateTokensAndExpiration(n,i,Number(s))}updateTokensAndExpiration(e,r,n){this.refreshToken=r||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,r){const{refreshToken:n,accessToken:i,expirationTime:s}=r,o=new Yi;return n&&(Y(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),i&&(Y(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(Y(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Yi,this.toJSON())}_performRefresh(){return Rn("not implemented")}}/**
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
 */function Wn(t,e){Y(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class zr{constructor({uid:e,auth:r,stsTokenManager:n,...i}){this.providerId="firebase",this.proactiveRefresh=new Hv(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=r,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new il(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const r=await Ha(this,this.stsTokenManager.getToken(this.auth,e));return Y(r,this.auth,"internal-error"),this.accessToken!==r&&(this.accessToken=r,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),r}getIdTokenResult(e){return $v(this,e)}reload(){return Vv(this)}_assign(e){this!==e&&(Y(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(r=>({...r})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const r=new zr({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return r.metadata._copy(this.metadata),r}_onReload(e){Y(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,r=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),r&&await Vs(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(nn(this.auth.app))return Promise.reject(Pi(this.auth));const e=await this.getIdToken();return await Ha(this,Fv(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,r){const n=r.displayName??void 0,i=r.email??void 0,s=r.phoneNumber??void 0,o=r.photoURL??void 0,c=r.tenantId??void 0,u=r._redirectEventId??void 0,f=r.createdAt??void 0,p=r.lastLoginAt??void 0,{uid:g,emailVerified:m,isAnonymous:w,providerData:S,stsTokenManager:N}=r;Y(g&&N,e,"internal-error");const I=Yi.fromJSON(this.name,N);Y(typeof g=="string",e,"internal-error"),Wn(n,e.name),Wn(i,e.name),Y(typeof m=="boolean",e,"internal-error"),Y(typeof w=="boolean",e,"internal-error"),Wn(s,e.name),Wn(o,e.name),Wn(c,e.name),Wn(u,e.name),Wn(f,e.name),Wn(p,e.name);const T=new zr({uid:g,auth:e,email:i,emailVerified:m,displayName:n,isAnonymous:w,photoURL:o,phoneNumber:s,tenantId:c,stsTokenManager:I,createdAt:f,lastLoginAt:p});return S&&Array.isArray(S)&&(T.providerData=S.map(x=>({...x}))),u&&(T._redirectEventId=u),T}static async _fromIdTokenResponse(e,r,n=!1){const i=new Yi;i.updateFromServerResponse(r);const s=new zr({uid:r.localId,auth:e,stsTokenManager:i,isAnonymous:n});return await Vs(s),s}static async _fromGetAccountInfoResponse(e,r,n){const i=r.users[0];Y(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?Wu(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new Yi;c.updateFromIdToken(n);const u=new zr({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:o}),f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new il(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,f),u}}/**
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
 */const lc=new Map;function Pn(t){Dn(t instanceof Function,"Expected a class definition");let e=lc.get(t);return e?(Dn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,lc.set(t,e),e)}/**
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
 */class ju{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,r){this.storage[e]=r}async _get(e){const r=this.storage[e];return r===void 0?null:r}async _remove(e){delete this.storage[e]}_addListener(e,r){}_removeListener(e,r){}}ju.type="NONE";const cc=ju;/**
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
 */function Rs(t,e,r){return`firebase:${t}:${e}:${r}`}class xi{constructor(e,r,n){this.persistence=e,this.auth=r,this.userKey=n;const{config:i,name:s}=this.auth;this.fullUserKey=Rs(this.userKey,i.apiKey,s),this.fullPersistenceKey=Rs("persistence",i.apiKey,s),this.boundEventHandler=r._onStorageEvent.bind(r);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const r=await Hs(this.auth,{idToken:e}).catch(()=>{});return r?zr._fromGetAccountInfoResponse(this.auth,r,e):null}return zr._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const r=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,r)return this.setCurrentUser(r)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,r,n="authUser"){if(!r.length)return new xi(Pn(cc),e,n);const i=(await Promise.all(r.map(async f=>{try{if(await f._isAvailable())return f}catch{return}}))).filter(f=>f);let s=i[0]||Pn(cc);const o=Rs(n,e.config.apiKey,e.name);let c=null;for(const f of r)try{const p=await f._get(o);if(p){let g;if(typeof p=="string"){const m=await Hs(e,{idToken:p}).catch(()=>{});if(!m)break;g=await zr._fromGetAccountInfoResponse(e,m,p)}else g=zr._fromJSON(e,p);f!==s&&(c=g),s=f;break}}catch{}const u=i.filter(f=>f._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new xi(s,e,n):(s=u[0],c&&await s._set(o,c.toJSON()),await Promise.all(r.map(async f=>{if(f!==s)try{await f._remove(o)}catch{}})),new xi(s,e,n))}}/**
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
 */function uc(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Ju(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(qu(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Xu(e))return"Blackberry";if(Qu(e))return"Webos";if(Gu(e))return"Safari";if((e.includes("chrome/")||Ku(e))&&!e.includes("edge/"))return"Chrome";if(Yu(e))return"Android";{const r=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=t.match(r);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function qu(t=Bt()){return/firefox\//i.test(t)}function Gu(t=Bt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Ku(t=Bt()){return/crios\//i.test(t)}function Ju(t=Bt()){return/iemobile/i.test(t)}function Yu(t=Bt()){return/android/i.test(t)}function Xu(t=Bt()){return/blackberry/i.test(t)}function Qu(t=Bt()){return/webos/i.test(t)}function Al(t=Bt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function qv(t=Bt()){var e;return Al(t)&&!!((e=window.navigator)!=null&&e.standalone)}function Gv(){return op()&&document.documentMode===10}function Zu(t=Bt()){return Al(t)||Yu(t)||Qu(t)||Xu(t)||/windows phone/i.test(t)||Ju(t)}/**
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
 */function ed(t,e=[]){let r;switch(t){case"Browser":r=uc(Bt());break;case"Worker":r=`${uc(Bt())}-${t}`;break;default:r=t}const n=e.length?e.join(","):"FirebaseCore-web";return`${r}/JsCore/${Za}/${n}`}/**
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
 */class Kv{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,r){const n=s=>new Promise((o,c)=>{try{const u=e(s);o(u)}catch(u){c(u)}});n.onAbort=r,this.queue.push(n);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const r=[];try{for(const n of this.queue)await n(e),n.onAbort&&r.push(n.onAbort)}catch(n){r.reverse();for(const i of r)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
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
 */async function Jv(t,e={}){return ga(t,"GET","/v2/passwordPolicy",kl(t,e))}/**
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
 */const Yv=6;class Xv{constructor(e){var n;const r=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=r.minPasswordLength??Yv,r.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=r.maxPasswordLength),r.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=r.containsLowercaseCharacter),r.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=r.containsUppercaseCharacter),r.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=r.containsNumericCharacter),r.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=r.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const r={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,r),this.validatePasswordCharacterOptions(e,r),r.isValid&&(r.isValid=r.meetsMinPasswordLength??!0),r.isValid&&(r.isValid=r.meetsMaxPasswordLength??!0),r.isValid&&(r.isValid=r.containsLowercaseLetter??!0),r.isValid&&(r.isValid=r.containsUppercaseLetter??!0),r.isValid&&(r.isValid=r.containsNumericCharacter??!0),r.isValid&&(r.isValid=r.containsNonAlphanumericCharacter??!0),r}validatePasswordLengthOptions(e,r){const n=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;n&&(r.meetsMinPasswordLength=e.length>=n),i&&(r.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,r){this.updatePasswordCharacterOptionsStatuses(r,!1,!1,!1,!1);let n;for(let i=0;i<e.length;i++)n=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(r,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,r,n,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=r)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class Qv{constructor(e,r,n,i){this.app=e,this.heartbeatServiceProvider=r,this.appCheckServiceProvider=n,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new dc(this),this.idTokenSubscription=new dc(this),this.beforeStateQueue=new Kv(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Bu,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,r){return r&&(this._popupRedirectResolver=Pn(r)),this._initializationPromise=this.queue(async()=>{var n,i,s;if(!this._deleted){try{this.persistenceManager=await xi.create(this,e)}catch(o){As(`Failed to initialize persistence: ${o}`),this.persistenceManager=await xi.create(this,[])}finally{(n=this._resolvePersistenceManagerAvailable)==null||n.call(this)}if(!this._deleted){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(r)}catch(o){As(`Failed to initialize current user: ${o}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const r=await Hs(this,{idToken:e}),n=await zr._fromGetAccountInfoResponse(this,r,e);await this.directlySetCurrentUser(n)}catch(r){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",r),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(nn(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let n=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,c=n==null?void 0:n._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(n=u.user,i=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return Y(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let r=null;try{r=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return r}async reloadAndSetCurrentUserOrClear(e){try{await Vs(e)}catch(r){if((r==null?void 0:r.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Nv()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(nn(this.app))return Promise.reject(Pi(this));const r=e?ri(e):null;return r&&Y(r.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(r&&r._clone(this))}async _updateCurrentUser(e,r=!1){if(!this._deleted)return e&&Y(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),r||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return nn(this.app)?Promise.reject(Pi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return nn(this.app)?Promise.reject(Pi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Pn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const r=this._getPasswordPolicyInternal();return r.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):r.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Jv(this),r=new Xv(e);this.tenantId===null?this._projectPasswordPolicy=r:this._tenantPasswordPolicies[this.tenantId]=r}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Xa("auth","Firebase",e())}onAuthStateChanged(e,r,n){return this.registerStateListener(this.authStateSubscription,e,r,n)}beforeAuthStateChanged(e,r){return this.beforeStateQueue.pushCallback(e,r)}onIdTokenChanged(e,r,n){return this.registerStateListener(this.idTokenSubscription,e,r,n)}authStateReady(){return new Promise((e,r)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},r)}})}async revokeAccessToken(e){if(this.currentUser){const r=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:r};this.tenantId!=null&&(n.tenantId=this.tenantId),await jv(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,r){const n=await this.getOrInitRedirectPersistenceManager(r);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const r=e&&Pn(e)||this._popupRedirectResolver;Y(r,this,"argument-error"),this.redirectPersistenceManager=await xi.create(this,[Pn(r._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var r,n;return this._isInitialized&&await this.queue(async()=>{}),((r=this._currentUser)==null?void 0:r._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var r;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((r=this.currentUser)==null?void 0:r.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,r,n,i){if(this._deleted)return()=>{};const s=typeof r=="function"?r:r.next.bind(r);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(Y(c,this,"internal-error"),c.then(()=>{o||s(this.currentUser)}).catch(u=>{if(!o)if(typeof r!="function"&&r.error)r.error(u);else if(n)n(u);else throw u}),typeof r=="function"){const u=e.addObserver(r,n,i);return()=>{o=!0,u()}}else{const u=e.addObserver(r);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(r){const n=(r==null?void 0:r.message)||String(r),i=Zs(this,"internal-error",`An internal AuthError has occurred: ${n}`);throw i.customData={originalError:r},i}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return Y(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ed(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const r=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());r&&(e["X-Firebase-Client"]=r);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var r;if(nn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((r=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getToken());return e!=null&&e.error&&As(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function eo(t){return ri(t)}class dc{constructor(e){this.auth=e,this.observer=null,this.addObserver=hp(r=>this.observer=r)}get next(){return Y(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Cl={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Zv(t){Cl=t}function e_(t){return Cl.loadJS(t)}function t_(){return Cl.gapiScript}function r_(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function n_(t,e){const r=Lu(t,"auth");if(r.isInitialized()){const i=r.getImmediate(),s=r.getOptions();if(ua(s,e??{}))return i;un(i,"already-initialized")}return r.initialize({options:e})}function i_(t,e){const r=(e==null?void 0:e.persistence)||[],n=(Array.isArray(r)?r:[r]).map(Pn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function td(t,e,r){const n=eo(t);Y(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const i=!1,s=rd(e),{host:o,port:c}=a_(e),u=c===null?"":`:${c}`,f={url:`${s}//${o}${u}/`},p=Object.freeze({host:o,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!n._canInitEmulator){Y(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),Y(ua(f,n.config.emulator)&&ua(p,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=f,n.emulatorConfig=p,n.settings.appVerificationDisabledForTesting=!0,yl(o)?_p(`${s}//${o}${u}`):s_()}function rd(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function a_(t){const e=rd(t),r=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!r)return{host:"",port:null};const n=r[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(n);if(i){const s=i[1];return{host:s,port:fc(n.substr(s.length+1))}}else{const[s,o]=n.split(":");return{host:s,port:fc(o)}}}function fc(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function s_(){function t(){const e=document.createElement("p"),r=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",r.position="fixed",r.width="100%",r.backgroundColor="#ffffff",r.border=".1em solid #000000",r.color="#b50000",r.bottom="0px",r.left="0px",r.margin="0px",r.zIndex="10000",r.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class nd{constructor(e,r){this.providerId=e,this.signInMethod=r}toJSON(){return Rn("not implemented")}_getIdTokenResponse(e){return Rn("not implemented")}_linkToIdToken(e,r){return Rn("not implemented")}_getReauthenticationResolver(e){return Rn("not implemented")}}/**
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
 */async function Xi(t,e){return Mv(t,"POST","/v1/accounts:signInWithIdp",kl(t,e))}/**
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
 */const o_="http://localhost";class Di extends nd{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const r=new Di(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(r.idToken=e.idToken),e.accessToken&&(r.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(r.nonce=e.nonce),e.pendingToken&&(r.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(r.accessToken=e.oauthToken,r.secret=e.oauthTokenSecret):un("argument-error"),r}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const r=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:i,...s}=r;if(!n||!i)return null;const o=new Di(n,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const r=this.buildRequest();return Xi(e,r)}_linkToIdToken(e,r){const n=this.buildRequest();return n.idToken=r,Xi(e,n)}_getReauthenticationResolver(e){const r=this.buildRequest();return r.autoCreate=!1,Xi(e,r)}buildRequest(){const e={requestUri:o_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const r={};this.idToken&&(r.id_token=this.idToken),this.accessToken&&(r.access_token=this.accessToken),this.secret&&(r.oauth_token_secret=this.secret),r.providerId=this.providerId,this.nonce&&!this.pendingToken&&(r.nonce=this.nonce),e.postBody=Qa(r)}return e}}/**
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
 */class Rl{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class ts extends Rl{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class qn extends ts{constructor(){super("facebook.com")}static credential(e){return Di._fromParams({providerId:qn.PROVIDER_ID,signInMethod:qn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return qn.credentialFromTaggedObject(e)}static credentialFromError(e){return qn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return qn.credential(e.oauthAccessToken)}catch{return null}}}qn.FACEBOOK_SIGN_IN_METHOD="facebook.com";qn.PROVIDER_ID="facebook.com";/**
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
 */class kn extends ts{constructor(){super("google.com"),this.addScope("profile")}static credential(e,r){return Di._fromParams({providerId:kn.PROVIDER_ID,signInMethod:kn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:r})}static credentialFromResult(e){return kn.credentialFromTaggedObject(e)}static credentialFromError(e){return kn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:r,oauthAccessToken:n}=e;if(!r&&!n)return null;try{return kn.credential(r,n)}catch{return null}}}kn.GOOGLE_SIGN_IN_METHOD="google.com";kn.PROVIDER_ID="google.com";/**
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
 */class Gn extends ts{constructor(){super("github.com")}static credential(e){return Di._fromParams({providerId:Gn.PROVIDER_ID,signInMethod:Gn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Gn.credentialFromTaggedObject(e)}static credentialFromError(e){return Gn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Gn.credential(e.oauthAccessToken)}catch{return null}}}Gn.GITHUB_SIGN_IN_METHOD="github.com";Gn.PROVIDER_ID="github.com";/**
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
 */class Kn extends ts{constructor(){super("twitter.com")}static credential(e,r){return Di._fromParams({providerId:Kn.PROVIDER_ID,signInMethod:Kn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:r})}static credentialFromResult(e){return Kn.credentialFromTaggedObject(e)}static credentialFromError(e){return Kn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:r,oauthTokenSecret:n}=e;if(!r||!n)return null;try{return Kn.credential(r,n)}catch{return null}}}Kn.TWITTER_SIGN_IN_METHOD="twitter.com";Kn.PROVIDER_ID="twitter.com";/**
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
 */class fa{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,r,n,i=!1){const s=await zr._fromIdTokenResponse(e,n,i),o=hc(n);return new fa({user:s,providerId:o,_tokenResponse:n,operationType:r})}static async _forOperation(e,r,n){await e._updateTokensIfNecessary(n,!0);const i=hc(n);return new fa({user:e,providerId:i,_tokenResponse:n,operationType:r})}}function hc(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class zs extends ti{constructor(e,r,n,i){super(r.code,r.message),this.operationType=n,this.user=i,Object.setPrototypeOf(this,zs.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:r.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,r,n,i){return new zs(e,r,n,i)}}function id(t,e,r,n){return(e==="reauthenticate"?r._getReauthenticationResolver(t):r._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?zs._fromErrorAndOperation(t,s,e,n):s})}async function l_(t,e,r=!1){const n=await Ha(t,e._linkToIdToken(t.auth,await t.getIdToken()),r);return fa._forOperation(t,"link",n)}/**
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
 */async function c_(t,e,r=!1){const{auth:n}=t;if(nn(n.app))return Promise.reject(Pi(n));const i="reauthenticate";try{const s=await Ha(t,id(n,i,e,t),r);Y(s.idToken,n,"internal-error");const o=Tl(s.idToken);Y(o,n,"internal-error");const{sub:c}=o;return Y(t.uid===c,n,"user-mismatch"),fa._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&un(n,"user-mismatch"),s}}/**
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
 */async function u_(t,e,r=!1){if(nn(t.app))return Promise.reject(Pi(t));const n="signIn",i=await id(t,n,e),s=await fa._fromIdTokenResponse(t,n,i);return r||await t._updateCurrentUser(s.user),s}function d_(t,e,r,n){return ri(t).onIdTokenChanged(e,r,n)}function f_(t,e,r){return ri(t).beforeAuthStateChanged(e,r)}function h_(t,e,r,n){return ri(t).onAuthStateChanged(e,r,n)}function p_(t){return ri(t).signOut()}const Ws="__sak";/**
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
 */class ad{constructor(e,r){this.storageRetriever=e,this.type=r}_isAvailable(){try{return this.storage?(this.storage.setItem(Ws,"1"),this.storage.removeItem(Ws),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,r){return this.storage.setItem(e,JSON.stringify(r)),Promise.resolve()}_get(e){const r=this.storage.getItem(e);return Promise.resolve(r?JSON.parse(r):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const v_=1e3,__=10;class sd extends ad{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,r)=>this.onStorageEvent(e,r),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Zu(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const r of Object.keys(this.listeners)){const n=this.storage.getItem(r),i=this.localCache[r];n!==i&&e(r,i,n)}}onStorageEvent(e,r=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const n=e.key;r?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(n);!r&&this.localCache[n]===o||this.notifyListeners(n,o)},s=this.storage.getItem(n);Gv()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,__):i()}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r&&JSON.parse(r))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,r,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:r,newValue:n}),!0)})},v_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,r){await super._set(e,r),this.localCache[e]=JSON.stringify(r)}async _get(e){const r=await super._get(e);return this.localCache[e]=JSON.stringify(r),r}async _remove(e){await super._remove(e),delete this.localCache[e]}}sd.type="LOCAL";const g_=sd;/**
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
 */class od extends ad{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,r){}_removeListener(e,r){}}od.type="SESSION";const ld=od;/**
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
 */function m_(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(r){return{fulfilled:!1,reason:r}}}))}/**
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
 */class to{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const r=this.receivers.find(i=>i.isListeningto(e));if(r)return r;const n=new to(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const r=e,{eventId:n,eventType:i,data:s}=r.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;r.ports[0].postMessage({status:"ack",eventId:n,eventType:i});const c=Array.from(o).map(async f=>f(r.origin,s)),u=await m_(c);r.ports[0].postMessage({status:"done",eventId:n,eventType:i,response:u})}_subscribe(e,r){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(r)}_unsubscribe(e,r){this.handlersMap[e]&&r&&this.handlersMap[e].delete(r),(!r||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}to.receivers=[];/**
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
 */function Pl(t="",e=10){let r="";for(let n=0;n<e;n++)r+=Math.floor(Math.random()*10);return t+r}/**
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
 */class b_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,r,n=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((c,u)=>{const f=Pl("",20);i.port1.start();const p=setTimeout(()=>{u(new Error("unsupported_event"))},n);o={messageChannel:i,onMessage(g){const m=g;if(m.data.eventId===f)switch(m.data.status){case"ack":clearTimeout(p),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(m.data.response);break;default:clearTimeout(p),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:f,data:r},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function ln(){return window}function w_(t){ln().location.href=t}/**
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
 */function cd(){return typeof ln().WorkerGlobalScope<"u"&&typeof ln().importScripts=="function"}async function y_(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function I_(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function E_(){return cd()?self:null}/**
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
 */const ud="firebaseLocalStorageDb",S_=1,js="firebaseLocalStorage",dd="fbase_key";class rs{constructor(e){this.request=e}toPromise(){return new Promise((e,r)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{r(this.request.error)})})}}function ro(t,e){return t.transaction([js],e?"readwrite":"readonly").objectStore(js)}function k_(){const t=indexedDB.deleteDatabase(ud);return new rs(t).toPromise()}function fd(){const t=indexedDB.open(ud,S_);return new Promise((e,r)=>{t.addEventListener("error",()=>{r(t.error)}),t.addEventListener("upgradeneeded",()=>{const n=t.result;try{n.createObjectStore(js,{keyPath:dd})}catch(i){r(i)}}),t.addEventListener("success",async()=>{const n=t.result;n.objectStoreNames.contains(js)?e(n):(n.close(),await k_(),e(await fd()))})})}async function pc(t,e,r){const n=ro(t,!0).put({[dd]:e,value:r});return new rs(n).toPromise()}async function T_(t,e){const r=ro(t,!1).get(e),n=await new rs(r).toPromise();return n===void 0?null:n.value}function vc(t,e){const r=ro(t,!0).delete(e);return new rs(r).toPromise()}const A_=800,C_=3;class hd{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=fd(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let r=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(r++>C_)throw n;if(this.dbPromise){const i=this.dbPromise;this.dbPromise=null;try{(await i).close()}catch{}}}}async initializeServiceWorkerMessaging(){return cd()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=to._getInstance(E_()),this.receiver._subscribe("keyChanged",async(e,r)=>({keyProcessed:(await this._poll()).includes(r.key)})),this.receiver._subscribe("ping",async(e,r)=>["keyChanged"])}async initializeSender(){var r,n;if(this.activeServiceWorker=await y_(),!this.activeServiceWorker)return;this.sender=new b_(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(r=e[0])!=null&&r.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||I_()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await pc(e,Ws,"1"),await vc(e,Ws)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,r){return this._withPendingWrite(async()=>(await this._withRetries(n=>pc(n,e,r)),this.localCache[e]=r,this.notifyServiceWorker(e)))}async _get(e){const r=await this._withRetries(n=>T_(n,e));return this.localCache[e]=r,r}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(r=>vc(r,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(i=>{const s=ro(i,!1).getAll();return new rs(s).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const r=[],n=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)n.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),r.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!n.has(i)&&(this.notifyListeners(i,null),r.push(i));return r}catch(e){return this.isClosing||As(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,r){this.localCache[e]=r;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(r)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),A_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,r){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(r)}_removeListener(e,r){this.listeners[e]&&(this.listeners[e].delete(r),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}hd.type="LOCAL";const R_=hd;new es(3e4,6e4);/**
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
 */function pd(t,e){return e?Pn(e):(Y(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class xl extends nd{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Xi(e,this._buildIdpRequest())}_linkToIdToken(e,r){return Xi(e,this._buildIdpRequest(r))}_getReauthenticationResolver(e){return Xi(e,this._buildIdpRequest())}_buildIdpRequest(e){const r={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(r.idToken=e),r}}function P_(t){return u_(t.auth,new xl(t),t.bypassAuthState)}function x_(t){const{auth:e,user:r}=t;return Y(r,e,"internal-error"),c_(r,new xl(t),t.bypassAuthState)}async function N_(t){const{auth:e,user:r}=t;return Y(r,e,"internal-error"),l_(r,new xl(t),t.bypassAuthState)}/**
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
 */class vd{constructor(e,r,n,i,s=!1){this.auth=e,this.resolver=n,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(r)?r:[r]}execute(){return new Promise(async(e,r)=>{this.pendingPromise={resolve:e,reject:r};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:r,sessionId:n,postBody:i,tenantId:s,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:r,sessionId:n,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(f){this.reject(f)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return P_;case"linkViaPopup":case"linkViaRedirect":return N_;case"reauthViaPopup":case"reauthViaRedirect":return x_;default:un(this.auth,"internal-error")}}resolve(e){Dn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Dn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const O_=new es(2e3,1e4);async function D_(t,e,r){if(nn(t.app))return Promise.reject(jr(t,"operation-not-supported-in-this-environment"));const n=eo(t);Rv(t,e,Rl);const i=pd(n,r);return new yi(n,"signInViaPopup",e,i).executeNotNull()}class yi extends vd{constructor(e,r,n,i,s){super(e,r,i,s),this.provider=n,this.authWindow=null,this.pollId=null,yi.currentPopupAction&&yi.currentPopupAction.cancel(),yi.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return Y(e,this.auth,"internal-error"),e}async onExecution(){Dn(this.filter.length===1,"Popup operations only handle one event");const e=Pl();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(r=>{this.reject(r)}),this.resolver._isIframeWebStorageSupported(this.auth,r=>{r||this.reject(jr(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(jr(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,yi.currentPopupAction=null}pollUserCancellation(){const e=()=>{var r,n;if((n=(r=this.authWindow)==null?void 0:r.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(jr(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,O_.get())};e()}}yi.currentPopupAction=null;/**
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
 */const L_="pendingRedirect",Ps=new Map;class M_ extends vd{constructor(e,r,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],r,void 0,n),this.eventId=null}async execute(){let e=Ps.get(this.auth._key());if(!e){try{const n=await U_(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(r){e=()=>Promise.reject(r)}Ps.set(this.auth._key(),e)}return this.bypassAuthState||Ps.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const r=await this.auth._redirectUserForId(e.eventId);if(r)return this.user=r,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function U_(t,e){const r=B_(e),n=$_(t);if(!await n._isAvailable())return!1;const i=await n._get(r)==="true";return await n._remove(r),i}function F_(t,e){Ps.set(t._key(),e)}function $_(t){return Pn(t._redirectPersistence)}function B_(t){return Rs(L_,t.config.apiKey,t.name)}async function H_(t,e,r=!1){if(nn(t.app))return Promise.reject(Pi(t));const n=eo(t),i=pd(n,e),o=await new M_(n,i,r).execute();return o&&!r&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}/**
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
 */const V_=600*1e3;class z_{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let r=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(r=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!W_(e)||(this.hasHandledPotentialRedirect=!0,r||(this.queuedRedirectEvent=e,r=!0)),r}sendToConsumer(e,r){var n;if(e.error&&!_d(e)){const i=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";r.onError(jr(this.auth,i))}else r.onAuthEvent(e)}isEventForConsumer(e,r){const n=r.eventId===null||!!e.eventId&&e.eventId===r.eventId;return r.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=V_&&this.cachedEventUids.clear(),this.cachedEventUids.has(_c(e))}saveEventToCache(e){this.cachedEventUids.add(_c(e)),this.lastProcessedEventTime=Date.now()}}function _c(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function _d({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function W_(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return _d(t);default:return!1}}/**
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
 */async function j_(t,e={}){return ga(t,"GET","/v1/projects",e)}/**
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
 */const q_=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,G_=/^https?/;async function K_(t){if(t.config.emulator)return;const{authorizedDomains:e}=await j_(t);for(const r of e)try{if(J_(r))return}catch{}un(t,"unauthorized-domain")}function J_(t){const e=nl(),{protocol:r,hostname:n}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&n===""?r==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):r==="chrome-extension:"&&o.hostname===n}if(!G_.test(r))return!1;if(q_.test(t))return n===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(n)}/**
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
 */const Y_=new es(3e4,6e4);function gc(){const t=ln().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let r=0;r<t.CP.length;r++)t.CP[r]=null}}function X_(t){return new Promise((e,r)=>{var i,s,o;function n(){gc(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{gc(),r(jr(t,"network-request-failed"))},timeout:Y_.get()})}if((s=(i=ln().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=ln().gapi)!=null&&o.load)n();else{const c=r_("iframefcb");return ln()[c]=()=>{gapi.load?n():r(jr(t,"network-request-failed"))},e_(`${t_()}?onload=${c}`).catch(u=>r(u))}}).catch(e=>{throw xs=null,e})}let xs=null;function Q_(t){return xs=xs||X_(t),xs}/**
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
 */const Z_=new es(5e3,15e3),eg="__/auth/iframe",tg="emulator/auth/iframe",rg={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},ng=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function ig(t){const e=t.config;Y(e.authDomain,t,"auth-domain-config-required");const r=e.emulator?Sl(e,tg):`https://${t.config.authDomain}/${eg}`,n={apiKey:e.apiKey,appName:t.name,v:Za},i=ng.get(t.config.apiHost);i&&(n.eid=i);const s=t._getFrameworks();return s.length&&(n.fw=s.join(",")),`${r}?${Qa(n).slice(1)}`}async function ag(t){const e=await Q_(t),r=ln().gapi;return Y(r,t,"internal-error"),e.open({where:document.body,url:ig(t),messageHandlersFilter:r.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:rg,dontclear:!0},n=>new Promise(async(i,s)=>{await n.restyle({setHideOnLeave:!1});const o=jr(t,"network-request-failed"),c=ln().setTimeout(()=>{s(o)},Z_.get());function u(){ln().clearTimeout(c),i(n)}n.ping(u).then(u,()=>{s(o)})}))}/**
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
 */const sg={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},og=500,lg=600,cg="_blank",ug="http://localhost";class mc{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function dg(t,e,r,n=og,i=lg){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let c="";const u={...sg,width:n.toString(),height:i.toString(),top:s,left:o},f=Bt().toLowerCase();r&&(c=Ku(f)?cg:r),qu(f)&&(e=e||ug,u.scrollbars="yes");const p=Object.entries(u).reduce((m,[w,S])=>`${m}${w}=${S},`,"");if(qv(f)&&c!=="_self")return fg(e||"",c),new mc(null);const g=window.open(e||"",c,p);Y(g,t,"popup-blocked");try{g.focus()}catch{}return new mc(g)}function fg(t,e){const r=document.createElement("a");r.href=t,r.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),r.dispatchEvent(n)}/**
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
 */const hg="__/auth/handler",pg="emulator/auth/handler",vg=encodeURIComponent("fac");async function bc(t,e,r,n,i,s){Y(t.config.authDomain,t,"auth-domain-config-required"),Y(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:r,redirectUrl:n,v:Za,eventId:i};if(e instanceof Rl){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",fp(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[p,g]of Object.entries({}))o[p]=g}if(e instanceof ts){const p=e.getScopes().filter(g=>g!=="");p.length>0&&(o.scopes=p.join(","))}t.tenantId&&(o.tid=t.tenantId);const c=o;for(const p of Object.keys(c))c[p]===void 0&&delete c[p];const u=await t._getAppCheckToken(),f=u?`#${vg}=${encodeURIComponent(u)}`:"";return`${_g(t)}?${Qa(c).slice(1)}${f}`}function _g({config:t}){return t.emulator?Sl(t,pg):`https://${t.authDomain}/${hg}`}/**
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
 */const Lo="webStorageSupport";class gg{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=ld,this._completeRedirectFn=H_,this._overrideRedirectResult=F_}async _openPopup(e,r,n,i){var o;Dn((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await bc(e,r,n,nl(),i);return dg(e,s,Pl())}async _openRedirect(e,r,n,i){await this._originValidation(e);const s=await bc(e,r,n,nl(),i);return w_(s),new Promise(()=>{})}_initialize(e){const r=e._key();if(this.eventManagers[r]){const{manager:i,promise:s}=this.eventManagers[r];return i?Promise.resolve(i):(Dn(s,"If manager is not set, promise should be"),s)}const n=this.initAndGetManager(e);return this.eventManagers[r]={promise:n},n.catch(()=>{delete this.eventManagers[r]}),n}async initAndGetManager(e){const r=await ag(e),n=new z_(e);return r.register("authEvent",i=>(Y(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:n.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=r,n}_isIframeWebStorageSupported(e,r){this.iframes[e._key()].send(Lo,{type:Lo},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[Lo];s!==void 0&&r(!!s),un(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const r=e._key();return this.originValidationPromises[r]||(this.originValidationPromises[r]=K_(e)),this.originValidationPromises[r]}get _shouldInitProactively(){return Zu()||Gu()||Al()}}const mg=gg;var wc="@firebase/auth",yc="1.13.6";/**
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
 */class bg{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const r=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,r),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const r=this.internalListeners.get(e);r&&(this.internalListeners.delete(e),r(),this.updateProactiveRefresh())}assertAuthConfigured(){Y(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function wg(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function yg(t){$a(new da("auth",(e,{options:r})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=n.options;Y(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const u={apiKey:o,authDomain:c,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ed(t)},f=new Qv(n,i,s,u);return i_(f,r),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,r,n)=>{e.getProvider("auth-internal").initialize()})),$a(new da("auth-internal",e=>{const r=eo(e.getProvider("auth").getImmediate());return(n=>new bg(n))(r)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ji(wc,yc,wg(t)),Ji(wc,yc,"esm2020")}/**
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
 */const Ig=300,Eg=xu("authIdTokenMaxAge")||Ig;let Ic=null;const Sg=t=>async e=>{const r=e&&await e.getIdTokenResult(),n=r&&(new Date().getTime()-Date.parse(r.issuedAtTime))/1e3;if(n&&n>Eg)return;const i=r==null?void 0:r.token;Ic!==i&&(Ic=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function kg(t=vv()){const e=Lu(t,"auth");if(e.isInitialized())return e.getImmediate();const r=n_(t,{popupRedirectResolver:mg,persistence:[R_,g_,ld]}),n=xu("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(n,location.origin);if(location.origin===s.origin){const o=Sg(s.toString());f_(r,o,()=>o(r.currentUser)),d_(r,c=>o(c))}}const i=tp("auth");return i&&td(r,`http://${i}`),r}function Tg(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Zv({loadJS(t){return new Promise((e,r)=>{const n=document.createElement("script");n.setAttribute("src",t),n.onload=e,n.onerror=i=>{const s=jr("internal-error");s.customData=i,r(s)},n.type="text/javascript",n.charset="UTF-8",Tg().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});yg("Browser");function Ag(t){var n,i,s,o;if(!((n=t.firebase)!=null&&n.apiKey)||!((i=t.firebase)!=null&&i.projectId)||!((s=t.firebase)!=null&&s.authDomain)||!((o=t.firebase)!=null&&o.appId))throw new Error("Google sign-in is not configured. Contact your studio operator.");const e=kg(Mu(t.firebase,"liquidity-studio"));if(t.emulator){const c=new URL(t.emulator.url),u=f=>["localhost","127.0.0.1","[::1]"].includes(f);if(!u(location.hostname)||!u(c.hostname)||c.protocol!=="http:")throw new Error("Authentication emulator is restricted to local development.");td(e,c.origin)}const r=new kn;return r.setCustomParameters({prompt:"select_account"}),{watch:c=>h_(e,c),login:()=>D_(e,r),logout:()=>p_(e),getToken:async()=>{if(!e.currentUser)throw new Error("Sign in with Google to continue.");return e.currentUser.getIdToken()}}}var Cg=C('<meta name="description" content="Private editorial workspace for brand campaigns, measured previews and source review."/>'),Rg=C('<main class="login-shell"><p role="status">Connecting to your studio…</p></main>'),Pg=C('<button class="primary"> </button>'),xg=C('<form><label>Username<input name="username" autocomplete="username" required=""/></label><label>Password<input name="password" type="password" autocomplete="current-password" required=""/></label><button class="primary"> </button></form>'),Ng=C('<p class="error" role="alert"> </p>'),Og=C(`<main class="login-shell"><div class="login-card"><span class="wordmark">◈ LIQUIDITY STUDIO</span> <h1>Good work starts<br/>with a clear view.</h1> <p>Sign in to your private brand workspace.</p> <!> <!> <p class="small muted">Accounts are provisioned by your studio operator. No public
        registration.</p></div> <div class="login-art"><span class="eyebrow">YOUR EDITORIAL WORKSPACE</span> <h2>From a good story.<br/>To a considered campaign.</h2> <div class="login-cards"><span>SOURCE</span><span>SHAPE</span><span>PREVIEW</span></div> <p>One place to edit, inspect and export.<br/>Every brand keeps its own
        context.</p></div></main>`),pi=C("<option> </option>"),Dg=C('<button><span aria-hidden="true"> </span> </button>'),Lg=C('<button><span aria-hidden="true">⌘</span>Operations</button>'),Mg=C('<div class="error banner" role="alert"> <button aria-label="Dismiss error">×</button></div>'),Ug=C('<div class="notice banner" role="status"> <button aria-label="Dismiss notice">×</button></div>'),Fg=C('<article class="story-row"><div class="story-day"><b> </b><span> </span></div> <div class="story-copy"><span class="eyebrow"> </span> <h3> </h3> <p> </p> <span class="status-tag"> </span></div> <button class="secondary"> </button></article>'),$g=C('<div class="empty"><h3>No stories here yet.</h3> <p>Add supplied facts below. The studio will not invent them.</p></div>'),Bg=C(`<div class="section-line"><div><h2>Story backlog <span class="count"> </span></h2> <p class="muted">Opening a saved story keeps your edits.</p></div> <div class="filters"><input aria-label="Search stories" placeholder="Search stories…"/><select aria-label="Filter by status"><option>All</option><!></select></div></div> <div class="story-list"></div> <details class="panel add-story"><summary>Add a story</summary> <form class="form-grid"><label class="full">Story title<input required=""/></label><label>Category<input/></label><label>Calendar day<select></select></label><label class="full">Supplied facts, one per line<textarea rows="4" required="" placeholder="Add the specific facts you want the draft to use."></textarea></label><label class="full">Source links, one per line<textarea rows="2" placeholder="https://…"></textarea></label> <p class="small muted full">Facts are editorial inputs, not independently verified claims.
              Clinical claims require source review.</p> <button class="primary">Add to backlog</button></form></details>`,1),Hg=C('<button class="calendar-story"><span class="eyebrow"> </span><b> </b><span class="status-tag"> </span></button>'),Vg=C('<p class="muted small">Room for a story</p>'),zg=C('<section class="day-column"><h3> </h3> <!></section>'),Wg=C('<div class="section-line"><h2>Weekly editorial calendar</h2> <span class="muted small">Assignments only · no automatic publishing</span></div> <div class="calendar-grid"></div>',1),jg=C('<p class="download"><a> </a><small>Actual exported artifact · scope authorization required</small></p>'),qg=C("<button> <small> </small></button>"),Gg=C('<label> <textarea rows="3"></textarea></label>'),Kg=C('<label>Headline<textarea aria-label="Headline" rows="3"></textarea></label> <!> <label>Takeaway<textarea rows="3"></textarea></label> <label>Caption<textarea aria-label="Caption" rows="4"></textarea></label>',1),Jg=C('<fieldset><legend></legend><label>Title<input/></label><label>Source detail<textarea rows="3"></textarea></label><label>Visual direction<input/></label></fieldset>'),Yg=C("<label>Cover hook<input/></label> <!>",1),Xg=C('<label>Story hook<textarea rows="3"></textarea></label><label>Source highlight<textarea rows="4"></textarea></label><label>Poll question<input aria-label="Poll question"/></label>',1),Qg=C("<label> <textarea></textarea></label>"),Zg=C("<fieldset><legend></legend><!></fieldset>"),em=C('<label>Spoken hook<textarea rows="3"></textarea></label><!><label>Closing call to action<input/></label>',1),tm=C(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and
                            want to record my review.</label>`),rm=C(`<p class="small muted">A founder clinical source review is required before
                            generation.</p>`),nm=C(`<p class="small error">Clinical review must be recorded by an authorized
                          reviewer.</p>`),im=C('<fieldset><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label><!></fieldset>'),am=C('<p class="small error"> </p>'),sm=C(`<p class="small muted">Preflight recorded for this brand. Editorial review
                    required.</p>`),om=C(`<div class="studio-grid"><section class="editor-panel"><div class="panel-heading"><h3>Make it yours.</h3> <span class="status-tag"> </span></div> <p class="small muted">Edit the wording, then save to update your preview and
                  exported artwork.</p> <div class="field-editor"><!></div> <details class="advanced-editor"><summary>Advanced format JSON</summary><label>Format content<textarea class="json-editor" aria-label="Format content" spellcheck="false"></textarea></label></details> <button class="primary">Save changes</button> <div class="schedule-box"><label>Assigned day<select aria-label="Assigned day"></select></label><button class="secondary">Assign to calendar</button> <p class="small muted">Assigning a day does not publish or export.</p></div> <details class="sources"><summary>Review source claims</summary> <p class="small muted">Approve a claim only after reviewing its linked source and
                    meaning. Clinical claims require a separate clinical review.</p> <!><button class="secondary">Add source claim</button><button class="secondary">Save source review</button></details> <!></section> <!></div>`),lm=C(`<label class="clinical-attestation"><input type="checkbox"/>I have completed the clinical source review and want
                          to record my review.</label>`),cm=C(`<p class="small muted">A founder clinical source review is required before
                          generation.</p>`),um=C('<fieldset><legend> </legend><button class="secondary"> </button><label>Claim text<textarea rows="3"></textarea></label><label>HTTPS source URL<input type="url" placeholder="https://…"/></label><label>Claim classification<select aria-label="Claim classification"><option>Select a classification</option><option>General editorial</option><option>Financial</option><option>Cultural</option><option>Clinical · separate reviewer required</option></select></label><!><label>Review status<select aria-label="Review status"><option>Unreviewed</option><option>Approved after source review</option><option>Rejected</option></select></label></fieldset>'),dm=C(`<section class="panel"><h3>Review sources before generation</h3> <p class="muted">Add a source link to each claim and choose its review status.
                Unreviewed claims cannot enter a campaign.</p> <div class="field-editor"></div> <button class="secondary">Add source claim</button> <button class="secondary">Save source review</button></section> <div class="empty"><span class="empty-symbol">◧</span> <h2>A story ready to take shape.</h2> <p>Generate a draft from the supplied facts, then review every
                format.</p> <button class="primary"> </button></div>`,1),fm=C('<div class="studio-toolbar"><div><span class="eyebrow">ACTIVE STORY</span> <h2> </h2> <span class="provenance"> </span></div> <div class="toolbar-actions"><button class="secondary"> </button><button class="primary"> </button></div></div> <!> <div class="format-tabs" aria-label="Campaign format"></div> <!>',1),hm=C('<div class="empty"><h2>Choose a story to begin.</h2> <p>Every campaign starts with supplied facts and a source review.</p> <button class="primary">Open story backlog</button></div>'),pm=C('<label> <div><input type="color"/><input/></div></label>'),vm=C('<p class="small muted"> </p> <p> </p>',1),_m=C('<article class="panel" style="margin-bottom:12px"><h3> </h3> <!></article>'),gm=C('<p class="muted">Audience groups need owner review.</p>'),mm=C("<li><p> </p></li>"),bm=C('<li class="muted">Editorial pillars need owner review.</li>'),wm=C(`<p class="small error">Clinical claims remain quarantined until explicit source and
                clinical review are recorded.</p>`),ym=C(`<section class="panel" style="margin-top:24px" aria-label="Brand positioning reference"><span class="eyebrow">OWNER POSITIONING · READ-ONLY REFERENCE</span> <h2>Proposed editorial positioning</h2> <p class="muted">These audiences and pillars describe editorial intent. They are
              not verified factual or clinical claims. Source review is required
              for every campaign.</p> <span class="status-tag"> </span> <div class="admin-grid" style="margin-top:24px"><section><h3>Audience value groups</h3> <!></section> <section><h3>Editorial pillars</h3> <ol></ol></section></div> <!></section>`),Im=C('<article class="story-row"><div class="story-copy"><h3> </h3> <span class="status-tag"> </span></div> <button class="secondary">Review sources</button></article>'),Em=C('<p class="small muted">No research prompts in this brand.</p>'),Sm=C(`<form class="panel brand-form form-grid"><label>Brand name<input required=""/></label><label>Website<input/></label><label class="full">Tagline<input/></label><label class="full">Editorial mission<textarea rows="4"></textarea></label><label>Wordmark / monogram<input/></label><label>Heading font<select aria-label="Heading font"></select></label><label>Body font<select aria-label="Body font"></select></label> <div class="full color-list"></div> <button class="primary">Save Brand Kit</button></form> <!> <section class="panel" style="margin-top:24px" aria-label="Unreviewed research topics"><h2>Research queue · unreviewed</h2> <p class="muted">Research prompts are starting points, not approved claims. Open a
            topic to add sourced claims for review.</p> <!></section>`,1),km=C('<button class="secondary"> </button>'),Tm=C('<li><strong> </strong> <p class="small muted"> </p> <!></li>'),Am=C('<li class="muted">No batch attempts for this brand.</li>'),Cm=C("<tr><td> </td><td> </td><td> </td><td> </td></tr>"),Rm=C('<tr><td colspan="4">No generation traces for this brand.</td></tr>'),Pm=C(`<div class="admin-grid"><section class="panel"><div class="panel-heading"><h2>Health & readiness</h2> <button class="secondary">Refresh</button></div> <p class="muted">Repository readiness does not establish provider connectivity.</p> <div class="ops-metrics"><div><b> </b><span>Service readiness</span></div> <div><b> </b><span>Repository check</span></div> <div><b> </b><span>Generation provider</span></div></div> <details><summary>Readiness details</summary> <pre> </pre></details></section> <section class="panel"><h2>Scoped operations</h2> <button class="secondary">Run this brand’s batch</button> <p><a>Download scoped feedback JSONL</a></p> <p class="small muted">Jobs use this organization and brand. Export is separate from
              publishing.</p> <h3>Recent batch attempts</h3> <ul aria-label="Recent batch attempts"></ul></section> <section class="panel"><h2>Organization management</h2> <form><label>New organization name<input required=""/></label><button class="secondary">Create organization</button></form> <form><label> <input required=""/></label><label>Brand preset<select aria-label="Brand preset"><option>The Liquidity Desk</option><option>Chai With Jai</option></select></label><button class="secondary">Create brand</button></form></section> <section class="panel"><h2>Telemetry & generation</h2> <div class="ops-metrics"><div><b> </b><span>Recent generation traces</span></div> <div><b> </b><span>Recorded usage events</span></div> <div><b> </b><span>Recent operational events</span></div></div> <p class="small muted">Usage records describe operations; they are not customer invoices
              or proof of factual accuracy.</p> <div class="trace-table"><table><thead><tr><th>Status</th><th>Provider</th><th>Model</th><th>Duration</th></tr></thead><tbody></tbody></table></div> <details><summary>Operational data</summary> <pre> </pre></details></section> <details class="panel"><summary>Architecture reference</summary> <pre> </pre></details></div>`),xm=C('<div class="app-shell"><aside class="sidebar"><a href="/" class="wordmark">◈<span>LIQUIDITY<br/>STUDIO</span></a> <div class="scope-selectors"><label>Organization<select aria-label="Organization"></select></label><label>Brand<select aria-label="Brand"></select></label></div> <nav aria-label="Main navigation"><!><!></nav> <div class="sidebar-bottom"><span class="avatar"> </span> <div><b> </b><small> </small></div> <button aria-label="Sign out">↪</button></div></aside> <main class="workspace"><header class="workspace-header"><div><span class="eyebrow"> </span> <h1> </h1> <p> </p></div> <span class="private-badge">● Private workspace</span></header> <!><!> <!></main></div>');function Nm(t,e){ol(e,!0);const r=["Mona Sans","Inter","Instrument Serif","DejaVu Sans"];function n(_){const b=typeof _=="string"?_.split("/")[0].trim():"";return r.includes(b)?b:"DejaVu Sans"}const i=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],s=[{id:"infographic",name:"Feed post",ratio:"4:5"},{id:"carousel",name:"Carousel",ratio:"4 slides"},{id:"story",name:"Story",ratio:"9:16"},{id:"reel",name:"Reel",ratio:"30s script"}];let o=D("unavailable"),c,u=0,f=D(null),p=D(hr([])),g=D(""),m=D(""),w=D(hr({})),S=D(""),N=D(""),I=D(!0),T=D(!1),x=D(""),z=D(""),$=D("backlog"),P=D(null),q=D(hr([])),ae=D(hr([])),B=D(null),L=D(null),X=D("infographic"),Je=D("Monday"),Me=D(""),Qt=D("All"),je=D(""),he=D(hr({})),Te=D(!1),pr=D(""),Ot=D(""),et=D(""),tt=D(hr([])),kr=D("Editorial"),_e=D("Monday"),vr=D(""),dn=D(""),Mn=D("liquidity_desk"),Tr=D(null),Li=D(null),Un=D(null),Ar=D(null),Ht=D(""),ni=D(""),rt=0,ma=0,ii=Ft(()=>a(p).find(_=>_.id===a(g))),ns=Ft(()=>{var _,b;return(b=(_=a(ii))==null?void 0:_.brands)==null?void 0:b.find(R=>R.id===a(m))}),is=Ft(()=>a(q).filter(_=>(!a(Me)||(_.title+" "+_.category).toLowerCase().includes(a(Me).toLowerCase()))&&(a(Qt)==="All"||_.status===a(Qt)))),as=Ft(()=>{var _,b,R,M;return((b=(_=a(L))==null?void 0:_.provenance)==null?void 0:b.mode)==="synthetic"?"Synthetic draft · source review required":((M=(R=a(L))==null?void 0:R.provenance)==null?void 0:M.mode)==="provider"?"Provider draft · source review required":"Source provenance unverified · review required"}),Fn=Ft(()=>{var _,b;return((_=a(w))==null?void 0:_.admin)===!0||((b=a(f))==null?void 0:b.role)==="founder"});function Mi(){return new URLSearchParams({organizationId:a(g),brandId:a(m)}).toString()}async function Cr(_,b={},R=!0){const M=rt,W=a(o)==="google"?{Authorization:`Bearer ${await c.getToken()}`}:{},me=await fetch(_+(R?(_.includes("?")?"&":"?")+Mi():""),{...b,credentials:"same-origin",headers:{...b.body?{"Content-Type":"application/json"}:{},...b.headers,...W}}),be=await me.json().catch(()=>({}));if(!me.ok)throw me.status===401&&ai(),new Error(be.error||be.message||`Request failed (${me.status})`);if(R&&M!==rt)throw new Error("Workspace changed while the request was running; retry in the current brand");return be}function _t(_,b={},R=!0){return Cr(_,{method:"POST",body:JSON.stringify(b)},R)}function Ui(_){var b,R,M,W,me,be;d(f,_.user,!0),d(p,_.organizations||[],!0),d(w,_.permissions||{},!0),d(g,((b=_.activeScope)==null?void 0:b.organizationId)||((R=a(p)[0])==null?void 0:R.id)||"",!0),d(m,((M=_.activeScope)==null?void 0:M.brandId)||((be=(me=(W=a(p).find(qe=>qe.id===a(g)))==null?void 0:W.brands)==null?void 0:me[0])==null?void 0:be.id)||"",!0)}function ai(){rt++,d(f,null),d(p,[],!0),d(w,{},!0),d(g,""),d(m,""),d(q,[],!0),d(ae,[],!0),d(B,null),d(L,null),d(P,null),d(Tr,null),d(Ar,null),d(Ht,""),d(Te,!1)}ku(()=>{let _=!1,b;async function R(){try{const M=await fetch("/api/auth/config");if(!M.ok)throw new Error("Could not load sign-in configuration.");const W=await M.json();if(_)return;if(!["google","password"].includes(W.mode))throw new Error("Unsupported sign-in configuration.");if(d(o,W.mode,!0),a(o)==="google")c=Ag(W),b=c.watch(async me=>{const be=++u;ai(),d(I,!0);try{if(me){const qe=await Cr("/api/auth/session",{},!1);if(_||be!==u)return;Ui(qe),a(m)&&await $n()}}catch(qe){!_&&be===u&&(ai(),d(x,`Google sign-in could not open this workspace: ${qe.message}. Check your invited account or contact the studio operator.`))}finally{!_&&be===u&&(d(I,!1),d(T,!1))}});else{const me=await fetch("/api/auth/session",{credentials:"same-origin"});me.ok&&!_&&(Ui(await me.json()),a(m)&&await $n()),_||d(I,!1)}}catch(M){_||(d(x,M.message,!0),d(I,!1))}}return R(),()=>{_=!0,u++,b==null||b()}});async function ss(){if(!(a(T)||!c)){d(T,!0),d(x,"");try{await c.login()}catch(_){d(x,_.code==="auth/popup-closed-by-user"?"Google sign-in was closed. Select Continue with Google to try again.":_.code==="auth/popup-blocked"?"Allow the Google sign-in popup, then try again.":_.message||"Google sign-in failed. Try again.",!0)}finally{d(T,!1)}}}async function no(_){_.preventDefault(),d(T,!0),d(x,"");try{const b=await _t("/api/auth/login",{username:a(S),password:a(N)},!1);d(N,""),Ui(b),await $n()}catch(b){d(x,b.message,!0)}finally{d(T,!1)}}async function io(){try{a(o)==="google"?await c.logout():await _t("/api/auth/logout",{},!1),u++,ai(),d(I,!1)}catch(_){d(x,_.message,!0)}}async function os(_){if(a(o)==="google"){_.preventDefault();try{const b=await fetch(a(Ht),{headers:{Authorization:`Bearer ${await c.getToken()}`}});if(!b.ok)throw new Error(`Download failed (${b.status}). Sign in again if access expired.`);const R=URL.createObjectURL(await b.blob()),M=document.createElement("a");M.href=R,M.download=a(ni),M.click(),setTimeout(()=>URL.revokeObjectURL(R),1e3)}catch(b){d(x,b.message,!0)}}}async function $n(){var b,R;const _=++rt;d(x,""),d(T,!0),d(B,null),d(L,null),d(Tr,null),d(Ar,null),d(Ht,""),d(Te,!1);try{const M=await Cr("/api/studio/bootstrap");if(_!==rt)return;d(P,M.brandProfile,!0),a(P)&&((b=a(P)).fonts||(b.fonts={heading:"DejaVu Sans",body:"DejaVu Sans"}),a(P).fonts.heading=n(a(P).fonts.heading),a(P).fonts.body=n(a(P).fonts.body),(R=a(P)).colors||(R.colors=[])),d(q,M.backlog||[],!0),d(ae,M.calendar||[],!0),M.organizations&&d(p,M.organizations,!0),M.permissions&&d(w,M.permissions,!0),a(q).length&&ba(a(q)[0])}catch(M){_===rt&&(d(x,M.message,!0),d(q,[],!0),d(ae,[],!0),d(P,null))}finally{_===rt&&d(T,!1)}}async function ao(_){var b,R,M;a(Te)&&!await fn()||(d(g,_.currentTarget.value,!0),d(m,((M=(R=(b=a(p).find(W=>W.id===a(g)))==null?void 0:b.brands)==null?void 0:R[0])==null?void 0:M.id)||"",!0),d($,"backlog"),await $n())}async function so(_){a(Te)&&!await fn()||(d(m,_.currentTarget.value,!0),d($,"backlog"),await $n())}function ba(_){var b;d(B,_,!0),d(L,(_==null?void 0:_.campaignDraft)||null,!0),d(Je,(_==null?void 0:_.scheduledDay)||"Monday",!0),d(tt,((_==null?void 0:_.sourceClaims)||((b=_==null?void 0:_.verifiedFacts)==null?void 0:b.map((R,M)=>({id:`claim_${M}`,text:R,sourceUrl:"",status:"unreviewed"})))||[]).map(R=>({...R})),!0),d(Ht,""),d(Ar,null),si()}function si(){var _,b;d(he,(_=a(L))!=null&&_[a(X)]?JSON.parse(JSON.stringify(a(L)[a(X)])):{},!0),d(je,(b=a(L))!=null&&b[a(X)]?JSON.stringify(a(he),null,2):"",!0),d(Te,!1)}function _r(_,b){a(he)[_]=b,d(je,JSON.stringify(a(he),null,2),!0),d(Te,!0)}function Bn(_,b,R,M){R?a(he)[_][b][R]=M:a(he)[_][b]=M,d(je,JSON.stringify(a(he),null,2),!0),d(Te,!0)}async function Fi(_){a(Te)&&!await fn()||(ba(_),d($,"studio"))}async function oo(_){a(Te)&&!await fn()||(d(X,_,!0),d(Ht,""),si())}async function wa(){var R,M;if(!a(B)||a(T)||a(Te)&&!await fn())return;d(T,!0),d(x,"");const _=rt,b=a(B).id;try{const W=await _t("/api/studio/generate-campaign",{storyId:b});if(_!==rt||((R=a(B))==null?void 0:R.id)!==b)return;d(L,W.campaign,!0),d(B,((M=W.backlog)==null?void 0:M.find(me=>me.id===b))||W.story,!0),d(q,W.backlog||a(q),!0),d(ae,W.calendar||a(ae),!0),si(),d(z,"Draft generated. Review the sources before export.")}catch(W){_===rt&&d(x,`Generation failed: ${W.message}. Your existing draft is preserved.`)}finally{_===rt&&d(T,!1)}}async function fn(){if(!a(L)||!a(B)||!a(Te))return!0;d(x,"");try{const _=a(je),b=JSON.parse(_);if(!b||typeof b!="object"||Array.isArray(b))throw new Error("Format content must be a JSON object");const R=await _t("/api/studio/save-edit",{storyId:a(B).id,format:a(X),content:b,expectedRevision:a(B).revision});R.story?d(B,R.story,!0):R.revision!==void 0&&(a(B).revision=R.revision),a(L)[a(X)]=b,a(B).campaignDraft=a(L);const M=a(q).find(W=>W.id===a(B).id);return M&&(M.campaignDraft=a(L)),d(Te,a(je)!==_),d(z,a(Te)?"Saved the submitted edit. Newer changes remain unsaved.":"Changes saved.",!0),!a(Te)}catch(_){return d(x,`Could not save: ${_.message}. Your editor text is still here.`),!1}}async function lo(){if(a(B))try{const _=await _t("/api/studio/schedule",{storyId:a(B).id,status:"Scheduled",scheduledDay:a(Je)});d(B,_.story||{...a(B),scheduledDay:a(Je),status:"Scheduled"},!0),d(q,_.backlog||a(q),!0),d(ae,_.calendar||a(ae),!0),d(z,`Assigned to ${a(Je)}. This does not publish to Instagram.`)}catch(_){d(x,_.message,!0)}}async function ls(){var _,b;if(!(!await fn()||!a(B)||!a(L))){d(T,!0),d(x,""),d(Ht,"");try{const R=await _t("/api/studio/export-asset",{storyId:a(B).id,format:a(X),content:a(L)[a(X)]});if(d(Ht,R.downloadUrl||((_=R.artifact)==null?void 0:_.downloadUrl)||"",!0),d(ni,R.filename||((b=R.artifact)==null?void 0:b.filename)||"Download export",!0),!a(Ht))throw new Error("Server did not return a downloadable artifact");d(q,R.backlog||a(q),!0),d(ae,R.calendar||a(ae),!0),d(B,a(q).find(M=>M.id===a(B).id)||a(B),!0),d(z,"Export created. Download the actual file below.")}catch(R){d(x,`Export failed: ${R.message}`)}finally{d(T,!1)}}}function cs(){d(tt,[...a(tt),{id:crypto.randomUUID(),text:"",sourceUrl:"",kind:"",status:"unreviewed"}],!0)}function us(_){d(tt,a(tt).filter(b=>b.id!==_),!0)}async function ds(){if(a(B)){if(!a(tt).length){d(x,"Add at least one sourced claim before saving the review.");return}d(x,"");try{const _=await _t("/api/studio/source-claims",{storyId:a(B).id,sourceClaims:a(tt),expectedRevision:a(B).revision});if(_.story){d(B,_.story,!0);const b=a(q).findIndex(R=>R.id===a(B).id);b>=0&&(a(q)[b]=a(B))}d(z,"Source review saved. Only approved sourced claims can enter generation.")}catch(_){d(x,_.message,!0)}}}async function co(_){_.preventDefault();try{const R=Object.fromEntries(["brandName","websiteUrl","tagline","mission","fonts","colors","logoText","strategy","valueGroups","pillars"].filter(W=>a(P)[W]!==void 0).map(W=>[W,a(P)[W]]));R.fonts={heading:n(a(P).fonts.heading),body:n(a(P).fonts.body)};const M=await _t("/api/studio/brand-profile",R);d(P,M.brandProfile||a(P),!0),d(z,"Brand profile saved for this brand.")}catch(b){d(x,b.message,!0)}}async function fs(_){_.preventDefault();const b=a(Ot).split(`
`).map(R=>R.trim()).filter(Boolean);if(!b.length){d(x,"Add at least one supplied fact. The studio will not invent source facts.");return}try{const R=await _t("/api/studio/backlog",{title:a(pr),category:a(kr),scheduledDay:a(_e),verifiedFacts:b,sourceClaims:b.map((M,W)=>{var me;return{id:`claim_${W}`,text:M,sourceUrl:((me=a(et).split(`
`)[W])==null?void 0:me.trim())||"",status:"unreviewed"}}),sourceUrls:a(et).split(`
`).filter(Boolean),sourceStatus:"unreviewed"});d(q,R.backlog||[R.story,...a(q)],!0),d(ae,R.calendar||a(ae),!0),d(pr,""),d(Ot,""),d(et,""),d(z,"Story added. Supplied facts still need source review.")}catch(R){d(x,R.message,!0)}}async function $i(){d($,"admin"),d(x,"");try{await(async _=>{var b=Nd(_,3);d(Tr,b[0],!0),d(Li,b[1],!0),d(Un,b[2],!0)})(await Promise.all([Cr("/api/admin/overview"),Cr("/api/admin/context-graph"),fetch("/readyz").then(_=>_.json())]))}catch(_){d(x,_.message,!0)}}async function uo(_){_.preventDefault();try{await _t("/api/admin/organizations",{name:a(vr)});const b=await Cr("/api/auth/session",{},!1);d(p,b.organizations||a(p),!0),d(vr,""),d(z,"Organization created.")}catch(b){d(x,b.message,!0)}}async function fo(_){_.preventDefault();try{await _t("/api/admin/brands",{organizationId:a(g),name:a(dn),preset:a(Mn)});const b=await Cr("/api/auth/session",{},!1);d(p,b.organizations||a(p),!0),d(dn,""),d(z,"Brand created.")}catch(b){d(x,b.message,!0)}}async function hs(_=null){const b=rt;d(T,!0),d(x,"");try{if(await _t("/api/admin/run-weekly-batch",{idempotencyKey:crypto.randomUUID(),maxStories:5,..._?{retryOfJobId:_}:{}}),b!==rt)return;await $n(),await $i(),d(z,_?"Retry completed. Previously completed drafts were preserved.":"Scoped batch completed. Review every generated draft.",!0)}catch(R){if(b!==rt)return;await $i(),d(x,R.message,!0)}finally{d(T,!1)}}async function A(_){if(!a(B)||!a(f))return;const b=++ma,R=rt;try{const M=await _t("/api/studio/preflight",{storyId:a(B).id,expectedRevision:a(B).revision,..._});b===ma&&R===rt&&d(Ar,M,!0)}catch(M){R===rt&&d(Ar,{error:M.message},!0)}}var K=gs();nh("1n46o8q",_=>{var b=Cg();gl(()=>{eu.title="Liquidity Studio · Brand workspace"}),k(_,b)});var He=Qe(K);{var st=_=>{var b=Rg();k(_,b)},Tt=_=>{var b=Og(),R=h(b),M=l(h(R),6);{var W=Ye=>{var Pe=Pg(),lt=E(Pe,!0);F(()=>{Pe.disabled=a(T),y(lt,a(T)?"Signing in…":"Continue with Google")}),O("click",Pe,ss),k(Ye,Pe)},me=Ye=>{var Pe=xg(),lt=h(Pe),gr=l(h(lt)),At=l(lt),Vt=l(h(At)),Ct=l(At),Gr=E(Ct,!0);F(()=>{Ct.disabled=a(T),y(Gr,a(T)?"Signing in…":"Sign in →")}),gi("submit",Pe,no),Be(gr,()=>a(S),Rr=>d(S,Rr)),Be(Vt,()=>a(N),Rr=>d(N,Rr)),k(Ye,Pe)};le(M,Ye=>{a(o)==="google"?Ye(W):a(o)==="password"&&Ye(me,1)})}var be=l(M,2);{var qe=Ye=>{var Pe=Ng(),lt=E(Pe,!0);F(()=>y(lt,a(x))),k(Ye,Pe)};le(be,Ye=>{a(x)&&Ye(qe)})}k(_,b)},Ve=_=>{var b=xm(),R=h(b),M=h(R),W=l(M,2),me=h(W),be=l(h(me));Re(be,21,()=>a(p),V=>V.id,(V,ee)=>{var J=pi(),ge=E(J,!0),Ge={};F(()=>{y(ge,a(ee).name),Ge!==(Ge=a(ee).id)&&(J.value=(J.__value=Ge)??"")}),k(V,J)});var qe;ar(be);var Ye=l(me),Pe=l(h(Ye));Re(Pe,21,()=>{var V;return((V=a(ii))==null?void 0:V.brands)||[]},V=>V.id,(V,ee)=>{var J=pi(),ge=E(J,!0),Ge={};F(()=>{y(ge,a(ee).name),Ge!==(Ge=a(ee).id)&&(J.value=(J.__value=Ge)??"")}),k(V,J)});var lt;ar(Pe);var gr=l(W,2),At=h(gr);Re(At,16,()=>[{id:"backlog",label:"Story backlog",icon:"▤"},{id:"calendar",label:"Content calendar",icon:"▦"},{id:"studio",label:"Campaign Studio",icon:"◧"},{id:"brand",label:"Brand Kit",icon:"◉"}],V=>V.id,(V,ee)=>{var J=Dg();let ge;var Ge=h(J),it=E(Ge,!0),Ke=l(Ge,1,!0);F(()=>{ge=sr(J,1,"",null,ge,{active:a($)===ee.id}),y(it,ee.icon),y(Ke,ee.label)}),O("click",J,()=>d($,ee.id,!0)),k(V,J)});var Vt=l(At);{var Ct=V=>{var ee=Lg();let J;F(()=>J=sr(ee,1,"",null,J,{active:a($)==="admin"})),O("click",ee,$i),k(V,ee)};le(Vt,V=>{a(Fn)&&V(Ct)})}var Gr=l(gr,2),Rr=h(Gr),ya=E(Rr,!0),Bi=l(Rr,2),zt=h(Bi),Hn=E(zt,!0),G=l(zt),Ie=E(G,!0),xe=l(Bi,2),ze=l(R,2),Ue=h(ze),nt=h(Ue),Dt=h(nt),ct=E(Dt),Wt=l(Dt,2),jt=E(Wt,!0),Vn=l(Wt,2),hn=E(Vn,!0),pn=l(Ue,2);{var vn=V=>{var ee=Mg(),J=h(ee),ge=l(J);F(()=>y(J,a(x))),O("click",ge,()=>d(x,"")),k(V,ee)};le(pn,V=>{a(x)&&V(vn)})}var _n=l(pn);{var gn=V=>{var ee=Ug(),J=h(ee),ge=l(J);F(()=>y(J,a(z))),O("click",ge,()=>d(z,"")),k(V,ee)};le(_n,V=>{a(z)&&V(gn)})}var Pr=l(_n,2);{var xr=V=>{var ee=Bg(),J=Qe(ee),ge=h(J),Ge=h(ge),it=l(h(Ge)),Ke=E(it,!0),ut=l(ge,2),mt=h(ut),Xe=l(mt),bt=l(h(Xe));Re(bt,16,()=>[...new Set(a(q).map(U=>U.status))],U=>U,(U,te)=>{var Z=pi(),Ne=E(Z,!0),Se={};F(()=>{y(Ne,te),Se!==(Se=te)&&(Z.__value=Se)}),k(U,Z)}),ar(Xe);var er=l(J,2);Re(er,21,()=>a(is),U=>U.id,(U,te)=>{var Z=Fg(),Ne=h(Z),Se=h(Ne),wt=E(Se,!0),pt=l(Se),Lr=E(pt,!0),mr=l(Ne,2),ye=h(mr),de=E(ye,!0),yt=l(ye,2),Lt=E(yt,!0),Gt=l(yt,2),Xr=E(Gt,!0),Kt=l(Gt,2),tr=E(Kt,!0),rr=l(mr,2),br=E(rr);F(nr=>{var Mr;y(wt,nr),y(Lr,a(te).campaignDraft?"DRAFT":"SOURCE"),y(de,a(te).category),y(Lt,a(te).title),y(Xr,((Mr=a(te).verifiedFacts)==null?void 0:Mr[0])||"Add source facts before generating."),y(tr,a(te).status),y(br,`${a(te).campaignDraft?"Open draft":"Open story"} ↗`)},[()=>{var nr;return((nr=a(te).scheduledDay)==null?void 0:nr.slice(0,3))||"—"}]),O("click",rr,()=>Fi(a(te))),k(U,Z)},U=>{var te=$g();k(U,te)});var Kr=l(er,2),Nr=l(h(Kr),2),Rt=h(Nr),Jr=l(h(Rt)),qt=l(Rt),bn=l(h(qt)),Or=l(qt),Dr=l(h(Or));Re(Dr,20,()=>i,U=>U,(U,te)=>{var Z=pi(),Ne=E(Z,!0),Se={};F(()=>{y(Ne,te),Se!==(Se=te)&&(Z.__value=Se)}),k(U,Z)}),ar(Dr);var Yr=l(Or),li=l(h(Yr)),ie=l(Yr),Ee=l(h(ie));F(()=>y(Ke,a(q).length)),Be(mt,()=>a(Me),U=>d(Me,U)),Ur(Xe,()=>a(Qt),U=>d(Qt,U)),gi("submit",Nr,fs),Be(Jr,()=>a(pr),U=>d(pr,U)),Be(bn,()=>a(kr),U=>d(kr,U)),Ur(Dr,()=>a(_e),U=>d(_e,U)),Be(li,()=>a(Ot),U=>d(Ot,U)),Be(Ee,()=>a(et),U=>d(et,U)),k(V,ee)},oi=V=>{var ee=Wg(),J=l(Qe(ee),2);Re(J,20,()=>i,ge=>ge,(ge,Ge)=>{var it=zg(),Ke=h(it),ut=E(Ke,!0),mt=l(Ke,2);Re(mt,17,()=>a(q).filter(Xe=>Xe.scheduledDay===Ge),Xe=>Xe.id,(Xe,bt)=>{var er=Hg(),Kr=h(er),Nr=E(Kr,!0),Rt=l(Kr),Jr=E(Rt,!0),qt=l(Rt),bn=E(qt,!0);F(()=>{y(Nr,a(bt).category),y(Jr,a(bt).title),y(bn,a(bt).status)}),O("click",er,()=>Fi(a(bt))),k(Xe,er)},Xe=>{var bt=Vg();k(Xe,bt)}),F(()=>y(ut,Ge)),k(ge,it)}),k(V,ee)},gt=V=>{var ee=gs(),J=Qe(ee);{var ge=it=>{var Ke=fm(),ut=Qe(Ke),mt=h(ut),Xe=l(h(mt),2),bt=E(Xe,!0),er=l(Xe,2),Kr=E(er,!0),Nr=l(mt,2),Rt=h(Nr),Jr=E(Rt,!0),qt=l(Rt),bn=E(qt),Or=l(ut,2);{var Dr=U=>{var te=jg(),Z=h(te),Ne=E(Z);F(()=>{Et(Z,"href",a(Ht)),Et(Z,"download",a(ni)),y(Ne,`↓ ${a(ni)??""}`)}),O("click",Z,os),k(U,te)};le(Or,U=>{a(Ht)&&U(Dr)})}var Yr=l(Or,2);Re(Yr,21,()=>s,U=>U.id,(U,te)=>{var Z=qg();let Ne;var Se=h(Z),wt=l(Se),pt=E(wt,!0);F(()=>{Ne=sr(Z,1,"",null,Ne,{active:a(X)===a(te).id}),y(Se,a(te).name),y(pt,a(te).ratio)}),O("click",Z,()=>oo(a(te).id)),k(U,Z)});var li=l(Yr,2);{var ie=U=>{var te=om(),Z=h(te),Ne=h(Z),Se=l(h(Ne),2),wt=E(Se,!0),pt=l(Ne,4),Lr=h(pt);{var mr=ce=>{var oe=Kg(),Fe=Qe(oe),Q=l(h(Fe)),j=l(Fe,2);Re(j,17,()=>a(he).statRows||[],Gi,($e,ot,dt)=>{var We=Gg(),ke=h(We);ke.nodeValue=`Fact ${dt+1}`;var De=l(ke);F(()=>Jt(De,a(ot))),O("input",De,vt=>Bn("statRows",dt,null,vt.currentTarget.value)),k($e,We)});var Ae=l(j,2),Oe=l(h(Ae)),fe=l(Ae,2),Ce=l(h(fe));F(()=>{Jt(Q,a(he).headline||""),Jt(Oe,a(he).bottomTakeaway||""),Jt(Ce,a(he).caption||"")}),O("input",Q,$e=>_r("headline",$e.currentTarget.value)),O("input",Oe,$e=>_r("bottomTakeaway",$e.currentTarget.value)),O("input",Ce,$e=>_r("caption",$e.currentTarget.value)),k(ce,oe)},ye=ce=>{var oe=Yg(),Fe=Qe(oe),Q=l(h(Fe)),j=l(Fe,2);Re(j,17,()=>a(he).slides||[],Gi,(Ae,Oe,fe)=>{var Ce=Jg(),$e=h(Ce);$e.textContent=`Slide ${fe+1}`;var ot=l($e),dt=l(h(ot)),We=l(ot),ke=l(h(We)),De=l(We),vt=l(h(De));F(()=>{Jt(dt,a(Oe).title||""),Jt(ke,a(Oe).bodyMetric||""),Jt(vt,a(Oe).visualNote||"")}),O("input",dt,It=>Bn("slides",fe,"title",It.currentTarget.value)),O("input",ke,It=>Bn("slides",fe,"bodyMetric",It.currentTarget.value)),O("input",vt,It=>Bn("slides",fe,"visualNote",It.currentTarget.value)),k(Ae,Ce)}),F(()=>Jt(Q,a(he).coverHook||"")),O("input",Q,Ae=>_r("coverHook",Ae.currentTarget.value)),k(ce,oe)},de=ce=>{var oe=Xg(),Fe=Qe(oe),Q=l(h(Fe)),j=l(Fe),Ae=l(h(j)),Oe=l(j),fe=l(h(Oe));F(()=>{Jt(Q,a(he).hookBanner||""),Jt(Ae,a(he).keyStatHighlight||""),Jt(fe,a(he).interactiveStickerPrompt||"")}),O("input",Q,Ce=>_r("hookBanner",Ce.currentTarget.value)),O("input",Ae,Ce=>_r("keyStatHighlight",Ce.currentTarget.value)),O("input",fe,Ce=>_r("interactiveStickerPrompt",Ce.currentTarget.value)),k(ce,oe)},yt=ce=>{var oe=em(),Fe=Qe(oe),Q=l(h(Fe)),j=l(Fe);Re(j,17,()=>a(he).beats||[],Gi,(fe,Ce,$e)=>{var ot=Zg(),dt=h(ot);dt.textContent=`Beat ${$e+1}`;var We=l(dt);Re(We,16,()=>["timecode","voiceover","onScreenText","bRollDirection"],ke=>ke,(ke,De)=>{var vt=Qg(),It=h(vt),Qr=l(It);F(()=>{y(It,De),Jt(Qr,a(Ce)[De]||""),Et(Qr,"rows",De==="timecode"?1:3)}),O("input",Qr,hi=>Bn("beats",$e,De,hi.currentTarget.value)),k(ke,vt)}),k(fe,ot)});var Ae=l(j),Oe=l(h(Ae));F(()=>{Jt(Q,a(he).spokenHook0to3s||""),Jt(Oe,a(he).closingCta||"")}),O("input",Q,fe=>_r("spokenHook0to3s",fe.currentTarget.value)),O("input",Oe,fe=>_r("closingCta",fe.currentTarget.value)),k(ce,oe)};le(Lr,ce=>{a(X)==="infographic"?ce(mr):a(X)==="carousel"?ce(ye,1):a(X)==="story"?ce(de,2):ce(yt,-1)})}var Lt=l(pt,2),Gt=l(h(Lt)),Xr=l(h(Gt)),Kt=l(Lt,2),tr=l(Kt,2),rr=h(tr),br=l(h(rr));Re(br,20,()=>i,ce=>ce,(ce,oe)=>{var Fe=pi(),Q=E(Fe,!0),j={};F(()=>{y(Q,oe),j!==(j=oe)&&(Fe.__value=j)}),k(ce,Fe)}),ar(br);var nr=l(rr),Mr=l(tr,2),wn=l(h(Mr),4);Re(wn,19,()=>a(tt),ce=>ce.id,(ce,oe,Fe)=>{var Q=im(),j=h(Q),Ae=E(j),Oe=l(j),fe=E(Oe),Ce=l(Oe),$e=l(h(Ce)),ot=l(Ce),dt=l(h(ot)),We=l(ot),ke=l(h(We)),De=h(ke);De.value=De.__value="";var vt=l(De);vt.value=vt.__value="general";var It=l(vt);It.value=It.__value="financial";var Qr=l(It);Qr.value=Qr.__value="cultural";var hi=l(Qr);hi.value=hi.__value="clinical",ar(ke);var Ia=l(We);{var ps=Mt=>{var vs=gs(),bd=Qe(vs);{var wd=Vi=>{var _s=tm(),Id=h(_s);Fs(Id,()=>a(oe).clinicalReviewRequested,Ed=>a(oe).clinicalReviewRequested=Ed),k(Vi,_s)},yd=Vi=>{var _s=rm();k(Vi,_s)};le(bd,Vi=>{a(Fn)?Vi(wd):Vi(yd,-1)})}k(Mt,vs)};le(Ia,Mt=>{a(oe).kind==="clinical"&&Mt(ps)})}var Nl=l(Ia),ho=l(h(Nl)),po=h(ho);po.value=po.__value="unreviewed";var vo=l(po);vo.value=vo.__value="approved";var Ol=l(vo);Ol.value=Ol.__value="rejected",ar(ho);var gd=l(Nl);{var md=Mt=>{var vs=nm();k(Mt,vs)};le(gd,Mt=>{a(oe).kind==="clinical"&&Mt(md)})}F(()=>{y(Ae,`Claim ${a(Fe)+1}`),Et(Oe,"aria-label",`Remove claim ${a(Fe)+1}`),y(fe,`Remove claim ${a(Fe)+1}`)}),O("click",Oe,()=>us(a(oe).id)),Be($e,()=>a(oe).text,Mt=>a(oe).text=Mt),Be(dt,()=>a(oe).sourceUrl,Mt=>a(oe).sourceUrl=Mt),Ur(ke,()=>a(oe).kind,Mt=>a(oe).kind=Mt),Ur(ho,()=>a(oe).status,Mt=>a(oe).status=Mt),k(ce,Q)});var yn=l(wn),ci=l(yn),ui=l(Mr,2);{var di=ce=>{var oe=am(),Fe=E(oe);F(()=>y(Fe,`Preflight could not be recorded: ${a(Ar).error??""}`)),k(ce,oe)},fi=ce=>{var oe=sm();k(ce,oe)};le(ui,ce=>{var oe;(oe=a(Ar))!=null&&oe.error?ce(di):a(Ar)&&ce(fi,1)})}var Hi=l(Z,2);Zf(Hi,()=>a(g)+a(m)+a(B).id+a(X),ce=>{qh(ce,{get campaign(){return a(L)},get brandProfile(){return a(P)},get format(){return a(X)},get backlog(){return a(q)},get activeStoryId(){return a(B).id},onpreflight:A})}),F(()=>{y(wt,a(Te)?"Unsaved changes":"Saved draft"),Kt.disabled=!a(Te)||a(T)}),O("input",Xr,()=>{d(Te,!0);try{d(he,JSON.parse(a(je)),!0)}catch{}}),Be(Xr,()=>a(je),ce=>d(je,ce)),O("click",Kt,fn),Ur(br,()=>a(Je),ce=>d(Je,ce)),O("click",nr,lo),O("click",yn,cs),O("click",ci,ds),k(U,te)},Ee=U=>{var te=dm(),Z=Qe(te),Ne=l(h(Z),4);Re(Ne,23,()=>a(tt),ye=>ye.id,(ye,de,yt)=>{var Lt=um(),Gt=h(Lt),Xr=E(Gt),Kt=l(Gt),tr=E(Kt),rr=l(Kt),br=l(h(rr)),nr=l(rr),Mr=l(h(nr)),wn=l(nr),yn=l(h(wn)),ci=h(yn);ci.value=ci.__value="";var ui=l(ci);ui.value=ui.__value="general";var di=l(ui);di.value=di.__value="financial";var fi=l(di);fi.value=fi.__value="cultural";var Hi=l(fi);Hi.value=Hi.__value="clinical",ar(yn);var ce=l(wn);{var oe=fe=>{var Ce=gs(),$e=Qe(Ce);{var ot=We=>{var ke=lm(),De=h(ke);Fs(De,()=>a(de).clinicalReviewRequested,vt=>a(de).clinicalReviewRequested=vt),k(We,ke)},dt=We=>{var ke=cm();k(We,ke)};le($e,We=>{a(Fn)?We(ot):We(dt,-1)})}k(fe,Ce)};le(ce,fe=>{a(de).kind==="clinical"&&fe(oe)})}var Fe=l(ce),Q=l(h(Fe)),j=h(Q);j.value=j.__value="unreviewed";var Ae=l(j);Ae.value=Ae.__value="approved";var Oe=l(Ae);Oe.value=Oe.__value="rejected",ar(Q),F(()=>{y(Xr,`Claim ${a(yt)+1}`),Et(Kt,"aria-label",`Remove claim ${a(yt)+1}`),y(tr,`Remove claim ${a(yt)+1}`)}),O("click",Kt,()=>us(a(de).id)),Be(br,()=>a(de).text,fe=>a(de).text=fe),Be(Mr,()=>a(de).sourceUrl,fe=>a(de).sourceUrl=fe),Ur(yn,()=>a(de).kind,fe=>a(de).kind=fe),Ur(Q,()=>a(de).status,fe=>a(de).status=fe),k(ye,Lt)});var Se=l(Ne,2),wt=l(Se,2),pt=l(Z,2),Lr=l(h(pt),6),mr=E(Lr,!0);F(()=>{Lr.disabled=a(T),y(mr,a(T)?"Generating…":"Generate four-format draft")}),O("click",Se,cs),O("click",wt,ds),O("click",Lr,wa),k(U,te)};le(li,U=>{a(L)?U(ie):U(Ee,-1)})}F(()=>{y(bt,a(B).title),y(Kr,a(L)?a(as):"No generated draft yet"),Rt.disabled=a(T),y(Jr,a(T)?"Working…":a(L)?"Regenerate draft":"Generate draft"),qt.disabled=a(T)||!a(L),y(bn,`Export ${a(X)==="carousel"?"ZIP":a(X)==="reel"?"script":"PNG"} ↗`)}),O("click",Rt,wa),O("click",qt,ls),k(it,Ke)},Ge=it=>{var Ke=hm(),ut=l(h(Ke),4);O("click",ut,()=>d($,"backlog")),k(it,Ke)};le(J,it=>{a(B)?it(ge):it(Ge,-1)})}k(V,ee)},Zt=V=>{var ee=Sm(),J=Qe(ee),ge=h(J),Ge=l(h(ge)),it=l(ge),Ke=l(h(it)),ut=l(it),mt=l(h(ut)),Xe=l(ut),bt=l(h(Xe)),er=l(Xe),Kr=l(h(er)),Nr=l(er),Rt=l(h(Nr));Re(Rt,20,()=>r,ie=>ie,(ie,Ee)=>{var U=pi(),te=E(U,!0),Z={};F(()=>{y(te,Ee),Z!==(Z=Ee)&&(U.value=(U.__value=Z)??"")}),k(ie,U)}),ar(Rt);var Jr=l(Nr),qt=l(h(Jr));Re(qt,20,()=>r,ie=>ie,(ie,Ee)=>{var U=pi(),te=E(U,!0),Z={};F(()=>{y(te,Ee),Z!==(Z=Ee)&&(U.value=(U.__value=Z)??"")}),k(ie,U)}),ar(qt);var bn=l(Jr,2);Re(bn,21,()=>a(P).colors||[],ie=>ie.name,(ie,Ee,U)=>{var te=pm(),Z=h(te),Ne=l(Z),Se=h(Ne),wt=l(Se);F(()=>{y(Z,`${a(Ee).name??""} `),Et(Se,"aria-label",`${a(Ee).name??""} color`),Et(wt,"aria-label",`${a(Ee).name??""} hex`)}),Be(Se,()=>a(Ee).hex,pt=>a(Ee).hex=pt),Be(wt,()=>a(Ee).hex,pt=>a(Ee).hex=pt),k(ie,te)});var Or=l(J,2);{var Dr=ie=>{var Ee=ym(),U=l(h(Ee),6),te=E(U,!0),Z=l(U,2),Ne=h(Z),Se=l(h(Ne),2);Re(Se,19,()=>a(P).strategy.valueGroups||[],(ye,de)=>typeof ye=="string"?ye:ye.id||de,(ye,de)=>{var yt=_m(),Lt=h(yt),Gt=E(Lt,!0),Xr=l(Lt,2);{var Kt=tr=>{var rr=vm(),br=Qe(rr),nr=E(br,!0),Mr=l(br,2),wn=E(Mr,!0);F(()=>{y(nr,a(de).ageRange||""),y(wn,a(de).motivation||"")}),k(tr,rr)};le(Xr,tr=>{typeof a(de)=="object"&&tr(Kt)})}F(()=>y(Gt,typeof a(de)=="string"?a(de):a(de).name)),k(ye,yt)},ye=>{var de=gm();k(ye,de)});var wt=l(Ne,2),pt=l(h(wt),2);Re(pt,20,()=>a(P).strategy.pillars||[],ye=>ye,(ye,de)=>{var yt=mm(),Lt=h(yt),Gt=E(Lt,!0);F(()=>y(Gt,de)),k(ye,yt)},ye=>{var de=bm();k(ye,de)});var Lr=l(Z,2);{var mr=ye=>{var de=wm();k(ye,de)};le(Lr,ye=>{a(P).strategy.clinicalClaimsQuarantined&&ye(mr)})}F(()=>y(te,a(P).strategy.status||"Proposed positioning")),k(ie,Ee)};le(Or,ie=>{a(P).strategy&&ie(Dr)})}var Yr=l(Or,2),li=l(h(Yr),4);Re(li,17,()=>a(q).filter(ie=>ie.category==="Source research"),ie=>ie.id,(ie,Ee)=>{var U=Im(),te=h(U),Z=h(te),Ne=E(Z,!0),Se=l(Z,2),wt=E(Se,!0),pt=l(te,2);F(()=>{y(Ne,a(Ee).title),y(wt,a(Ee).reviewStatus||"Unreviewed research")}),O("click",pt,()=>Fi(a(Ee))),k(ie,U)},ie=>{var Ee=Em();k(ie,Ee)}),gi("submit",J,co),Be(Ge,()=>a(P).brandName,ie=>a(P).brandName=ie),Be(Ke,()=>a(P).websiteUrl,ie=>a(P).websiteUrl=ie),Be(mt,()=>a(P).tagline,ie=>a(P).tagline=ie),Be(bt,()=>a(P).mission,ie=>a(P).mission=ie),Be(Kr,()=>a(P).logoText,ie=>a(P).logoText=ie),Ur(Rt,()=>a(P).fonts.heading,ie=>a(P).fonts.heading=ie),Ur(qt,()=>a(P).fonts.body,ie=>a(P).fonts.body=ie),k(V,ee)},mn=V=>{var ee=Pm(),J=h(ee),ge=h(J),Ge=l(h(ge),2),it=l(ge,4),Ke=h(it),ut=h(Ke),mt=E(ut,!0),Xe=l(Ke,2),bt=h(Xe),er=E(bt,!0),Kr=l(Xe,2),Nr=h(Kr),Rt=E(Nr,!0),Jr=l(it,2),qt=l(h(Jr),2),bn=E(qt,!0),Or=l(J,2),Dr=l(h(Or),2),Yr=l(Dr,2),li=E(Yr),ie=l(Yr,6);Re(ie,21,()=>{var Q,j,Ae;return((Ae=(j=(Q=a(Tr))==null?void 0:Q.observability)==null?void 0:j.jobs)==null?void 0:Ae.slice(0,10))||[]},Q=>Q.jobId,(Q,j)=>{var Ae=Tm(),Oe=h(Ae),fe=E(Oe,!0),Ce=l(Oe),$e=l(Ce),ot=E($e),dt=l($e,2);{var We=ke=>{var De=km(),vt=E(De,!0);F(It=>{De.disabled=a(T),Et(De,"aria-label",It),y(vt,a(j).status==="FAILED"?"Retry failed batch":"Retry interrupted batch")},[()=>`${a(j).status==="FAILED"?"Retry failed batch":"Retry interrupted batch"} ${a(j).jobId.slice(0,8)}`]),O("click",De,()=>hs(a(j).jobId)),k(ke,De)};le(dt,ke=>{(a(j).status==="FAILED"||a(j).status==="INTERRUPTED")&&ke(We)})}F(ke=>{var De;y(fe,a(j).status),y(Ce,` · Attempt ${(a(j).attempt||1)??""} `),y(ot,`${(((De=a(j).completedStoryIds)==null?void 0:De.length)||0)??""} completed stories
                    ${ke??""}`)},[()=>a(j).retryOfJobId?` · Retry of ${a(j).retryOfJobId.slice(0,8)}`:""]),k(Q,Ae)},Q=>{var j=Am();k(Q,j)});var Ee=l(Or,2),U=l(h(Ee),2),te=h(U),Z=l(h(te)),Ne=l(U,2),Se=h(Ne),wt=h(Se),pt=l(wt),Lr=l(Se),mr=l(h(Lr)),ye=h(mr);ye.value=ye.__value="liquidity_desk";var de=l(ye);de.value=de.__value="vedic_dharma",ar(mr);var yt=l(Ee,2),Lt=l(h(yt),2),Gt=h(Lt),Xr=h(Gt),Kt=E(Xr,!0),tr=l(Gt,2),rr=h(tr),br=E(rr,!0),nr=l(tr,2),Mr=h(nr),wn=E(Mr,!0),yn=l(Lt,4),ci=h(yn),ui=l(h(ci));Re(ui,21,()=>{var Q,j;return((j=(Q=a(Tr))==null?void 0:Q.observability)==null?void 0:j.traces)||[]},Q=>Q.traceId,(Q,j)=>{var Ae=Cm(),Oe=h(Ae),fe=E(Oe,!0),Ce=l(Oe),$e=E(Ce,!0),ot=l(Ce),dt=E(ot,!0),We=l(ot),ke=E(We);F(()=>{y(fe,a(j).status),y($e,a(j).provider),y(dt,a(j).model),y(ke,`${a(j).latencyMs??""} ms`)}),k(Q,Ae)},Q=>{var j=Rm();k(Q,j)});var di=l(yn,2),fi=l(h(di),2),Hi=E(fi,!0),ce=l(yt,2),oe=l(h(ce),2),Fe=E(oe,!0);F((Q,j,Ae,Oe)=>{var fe,Ce,$e,ot,dt,We,ke,De,vt,It,Qr,hi,Ia,ps;y(mt,((fe=a(Un))==null?void 0:fe.status)||"Unknown"),y(er,(($e=(Ce=a(Un))==null?void 0:Ce.checks)==null?void 0:$e.repository)||"Unknown"),y(Rt,((dt=(ot=a(Un))==null?void 0:ot.checks)==null?void 0:dt.generationProvider)||"Not checked"),y(bn,Q),Dr.disabled=a(T),Et(li,"href",j),y(wt,`New brand in ${((We=a(ii))==null?void 0:We.name)??""}`),y(Kt,((vt=(De=(ke=a(Tr))==null?void 0:ke.observability)==null?void 0:De.traces)==null?void 0:vt.length)||0),y(br,((Qr=(It=a(Tr))==null?void 0:It.observability)==null?void 0:Qr.usageEvents)||0),y(wn,((ps=(Ia=(hi=a(Tr))==null?void 0:hi.observability)==null?void 0:Ia.operationalEvents)==null?void 0:ps.length)||0),y(Hi,Ae),y(Fe,Oe)},[()=>JSON.stringify(a(Un),null,2),()=>"/api/admin/backprop-jsonl?"+Mi(),()=>JSON.stringify(a(Tr),null,2),()=>JSON.stringify(a(Li),null,2)]),O("click",Ge,$i),O("click",Dr,()=>hs()),gi("submit",U,uo),Be(Z,()=>a(vr),Q=>d(vr,Q)),gi("submit",Ne,fo),Be(pt,()=>a(dn),Q=>d(dn,Q)),Ur(mr,()=>a(Mn),Q=>d(Mn,Q)),k(V,ee)};le(Pr,V=>{a($)==="backlog"?V(xr):a($)==="calendar"?V(oi,1):a($)==="studio"?V(gt,2):a($)==="brand"&&a(P)?V(Zt,3):a($)==="admin"&&a(Fn)&&V(mn,4)})}F(V=>{var ee,J;qe!==(qe=a(g))&&(be.value=(be.__value=qe)??"",Us(be,qe)),lt!==(lt=a(m))&&(Pe.value=(Pe.__value=lt)??"",Us(Pe,lt)),y(ya,V),y(Hn,a(f).username),y(Ie,a(f).role),y(ct,`${(((ee=a(ii))==null?void 0:ee.name)||"ORGANIZATION")??""} / ${(((J=a(ns))==null?void 0:J.name)||"BRAND")??""}`),y(jt,a($)==="backlog"?"Good stories, next up.":a($)==="calendar"?"Make room for the week.":a($)==="studio"?"Campaign Studio":a($)==="brand"?"Your brand, clearly.":"Studio operations"),y(hn,a($)==="studio"?"Edit the substance. Inspect the surface. Export with context.":"A focused workspace for source-backed editorial work.")},[()=>{var V;return(V=a(f).username)==null?void 0:V.slice(0,2)}]),O("click",M,V=>{V.preventDefault(),d($,"backlog")}),O("change",be,ao),O("change",Pe,so),O("click",xe,io),k(_,b)};le(He,_=>{a(I)?_(st):a(f)?_(Ve,-1):_(Tt,1)})}k(t,K),ll()}Iu(["click","change","input"]);Jf(Nm,{target:document.getElementById("app")});
