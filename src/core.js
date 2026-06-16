// core.js — 공유 상태 · 상수 · DOM/포맷 헬퍼 · 토스트 · 확인 다이얼로그
// (원본 index.html 인라인 스크립트에서 그대로 추출, 동작/문구 변경 없음)

export const TIER = { std:{l:'표준화 후보',c:'std'}, resell:{l:'재판매 가능',c:'resell'}, excl:{l:'전용',c:'excl'} };
export const PLATFORMS = ['웹','iOS','AOS','태블릿'];
export const DEV_RATE = 800;
export const MODEL = 'claude-sonnet-4-20250514';
export const KEYICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

// DATA 는 라이브 바인딩 — 재할당은 setData() 로만. 참조 모듈은 항상 최신 배열을 본다.
export let DATA = [];
export function setData(next){ DATA = next; }

export const state = { mode:'internal', view:'overview', anon:false, qx:'', tier:'', groupBy:'cat', cart:new Set(), editId:null, variants:null, selVar:0, dataReady:false, entered:false };
export const isInternal=()=>state.mode==='internal';
export const cl=d=>state.anon?d.anon:d.real;

export const $=s=>document.querySelector(s);
export const $$=s=>document.querySelectorAll(s);
export const esc=s=>(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const today=()=>{const n=new Date();return `${n.getFullYear()}.${String(n.getMonth()+1).padStart(2,'0')}.${String(n.getDate()).padStart(2,'0')}`};
export function won(m){if(m>=10000){let v=(m/10000);return (v%1?v.toFixed(1):v)+'억'}return m.toLocaleString()+'만'}
export function inCart(id){return state.cart.has(id)}

export function toast(msg){const el=document.createElement('div');el.className='toast';el.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg><div class="tb">${esc(msg)}</div>`;$('#toastWrap').appendChild(el);setTimeout(()=>{el.style.transition='opacity .3s,transform .3s';el.style.opacity='0';el.style.transform='translateX(20px)';setTimeout(()=>el.remove(),300)},3200)}

export function copyText(t){const done=()=>toast('초안이 복사됐어요');if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done).catch(()=>fb(t,done))}else fb(t,done);function fb(x,cb){const ta=document.createElement('textarea');ta.value=x;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');cb()}catch(e){}document.body.removeChild(ta)}}

let confirmCb=null;
export function openConfirm({title,body,go='확인',danger=false,onGo}){$('#cfmTitle').textContent=title;$('#cfmBody').textContent=body;const g=$('#cfmGo');g.textContent=go;g.classList.toggle('danger',!!danger);confirmCb=onGo;$('#cfmOv').classList.add('show')}
export function closeConfirm(){$('#cfmOv').classList.remove('show');confirmCb=null}
$('#cfmGo').onclick=()=>{const cb=confirmCb;closeConfirm();if(cb)cb()};
$('#cfmCancel').onclick=closeConfirm;$('#cfmOv').onclick=e=>{if(e.target.id==='cfmOv')closeConfirm()};
