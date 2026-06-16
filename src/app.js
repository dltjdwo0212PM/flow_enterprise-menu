// app.js — 진입점/오케스트레이터: 전체 렌더 조합, 모드·탭 전환, 이벤트 위임
import { $, $$, state, openConfirm, closeConfirm, copyText, toast } from './core.js';
import { loadData, onData } from './data.js';
import { renderOverview } from './overview.js';
import { renderCatalog } from './catalog.js';
import { renderProposal, toggleCart } from './proposal.js';
import { openModal, closeModal } from './modal.js';
import { renderAdmin, openForm, closeForm, delFeature } from './admin.js';

export function renderAll(){renderOverview();renderCatalog();renderProposal();renderAdmin()}

function applyMode(mode){
  state.mode=mode;document.body.dataset.mode=mode;const isC=mode==='client';
  state.anon=isC?true:false;
  $('#anonBtn').style.display=isC?'none':'';$('#anonBtn').setAttribute('aria-checked',state.anon);
  $('#tabProposal').style.display=isC?'none':'';$('#tabAdmin').style.display=isC?'none':'';$('#tabDiv').style.display=isC?'none':'';
  $('#gbTier').style.display=isC?'none':'';$('#f-tier').style.display=isC?'none':'';
  $('#modePill').querySelector('.mp-t').textContent=isC?'고객 소개용':'내부 임직원용';
  if(isC&&(state.view==='proposal'||state.view==='admin'))state.view='overview';
  if(isC&&state.groupBy==='tier')state.groupBy='cat';
  goto(state.view);renderAll();
}
async function enter(mode){if(!state.dataReady){await loadData();}$('#gate').style.display='none';$('#app').style.display='block';state.entered=true;applyMode(mode);window.scrollTo({top:0,behavior:'instant'})}
function openGate(){$('#gate').style.display='flex';$('#app').style.display='none'}

function goto(v){$$('.tab').forEach(x=>x.classList.toggle('on',x.dataset.view===v));$$('.view').forEach(x=>x.classList.toggle('on',x.dataset.v===v));state.view=v;window.scrollTo({top:0,behavior:'instant'})}
function setAnon(v){state.anon=v;$('#anonBtn').setAttribute('aria-checked',v);renderOverview();renderCatalog();renderProposal()}

// ---------- 부트스트랩 (원본 스크립트 하단의 최상위 실행부) ----------
onData(renderAll);
loadData();

$$('.gopt').forEach(o=>o.onclick=()=>enter(o.dataset.mode));
$('#modePill').onclick=openGate;
$$('.tab').forEach(t=>t.onclick=()=>goto(t.dataset.view));
$('#anonBtn').onclick=()=>{if(state.anon){openConfirm({title:'고객사 실명을 표시할까요?',body:'익명화를 끄면 모든 고객사 실명이 화면에 노출됩니다. 외부(고객)와 화면을 공유 중이라면 다시 확인하세요.',go:'실명 표시',onGo:()=>setAnon(false)})}else setAnon(true)};
$('#search-x').oninput=e=>{state.qx=e.target.value;renderCatalog()};
$('#f-tier').onchange=e=>{state.tier=e.target.value;renderCatalog()};
$$('#groupSeg button').forEach(b=>b.onclick=()=>{$$('#groupSeg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');state.groupBy=b.dataset.gb;renderCatalog()});
$('#addBtn').onclick=()=>openForm(null);

document.addEventListener('click',e=>{
  if(e.target.closest('[data-close]')){closeModal();return}
  if(e.target.closest('[data-formclose]')){closeForm();return}
  const gt=e.target.closest('[data-goto]');if(gt){goto(gt.dataset.goto);return}
  const tg=e.target.closest('[data-tag]');if(tg){e.stopPropagation();const t=tg.dataset.tag;state.qx=t;$('#search-x').value=t;goto('catalog');renderCatalog();return}
  const ct=e.target.closest('[data-cart]');if(ct){e.stopPropagation();toggleCart(+ct.dataset.cart);return}
  const rm=e.target.closest('[data-rm]');if(rm){toggleCart(+rm.dataset.rm);return}
  const ed=e.target.closest('[data-edit]');if(ed){openForm(+ed.dataset.edit);return}
  const dl=e.target.closest('[data-del]');if(dl){delFeature(+dl.dataset.del);return}
  const fk=e.target.closest('.fkey');if(fk){e.stopPropagation();copyText(fk.textContent.trim());toast('기능키가 복사됐어요');return}
  const item=e.target.closest('.card,.rrow');if(item){openModal(+item.dataset.id);return}
  if(e.target.id==='overlay')closeModal();if(e.target.id==='formOv')closeForm();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeForm();closeConfirm()}});
