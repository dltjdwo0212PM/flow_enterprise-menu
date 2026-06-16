// catalog.js — 자산 카드 마크업 · 검색/필터 · 그룹토글 카탈로그 렌더
import { $, isInternal, TIER, esc, KEYICON, cl, inCart, state, DATA } from './core.js';

export function tagsHTML(d){return d.tags&&d.tags.length?`<div class="tags">${d.tags.map(t=>`<span class="tag" data-tag="${esc(t)}">#${esc(t)}</span>`).join('')}</div>`:''}
export function cardHTML(d){
  if(isInternal()){
    return `<article class="card" data-id="${d.id}"><div class="row1"><span class="tier ${TIER[d.tier].c}">${TIER[d.tier].l}</span><span class="fkey">${KEYICON}${esc(d.key)}</span></div><h3>${esc(d.name)}</h3><p class="desc">${esc(d.desc)}</p>${tagsHTML(d)}<div class="foot"><span class="meta">${esc(cl(d))} · 재사용 <span class="n num">${d.reuse}</span> · <span class="n num">${d.mm}</span> M/M</span><button class="add-btn ${inCart(d.id)?'in':''}" data-cart="${d.id}">${inCart(d.id)?'담김 ✓':'+ 담기'}</button></div></article>`;
  }
  return `<article class="card" data-id="${d.id}"><div class="row1"><span class="cat-tag">${esc(d.cat)}</span></div><h3>${esc(d.name)}</h3><p class="desc">${esc(d.desc)}</p>${tagsHTML(d)}<div class="foot"><span class="meta">${d.platform.join(' · ')||'—'}</span></div></article>`;
}
export function filteredList(){
  let q=state.qx.trim().toLowerCase();if(q[0]==='#')q=q.slice(1);
  return DATA.filter(d=>{
    const hit=!q||d.name.toLowerCase().includes(q)||d.en.toLowerCase().includes(q)||d.key.toLowerCase().includes(q)||cl(d).toLowerCase().includes(q)||d.desc.toLowerCase().includes(q)||d.cat.toLowerCase().includes(q)||(d.tags||[]).some(t=>t.toLowerCase().includes(q));
    const tierOk=!isInternal()||!state.tier||d.tier===state.tier;
    return hit&&tierOk;
  });
}
export function renderCatalog(){
  const list=filteredList();const body=$('#catalogBody');
  if(!list.length){body.innerHTML=`<div class="empty"><div class="t">조건에 맞는 자산이 없어요</div>필터를 줄이거나 검색어를 바꿔보세요.</div>`;return}
  let gb=state.groupBy;if(!isInternal()&&gb==='tier')gb='cat';
  let groups;
  if(gb==='client'){const keys=[...new Set(list.map(d=>d.real))].sort();groups=keys.map(k=>({label:cl(list.find(d=>d.real===k)),items:list.filter(d=>d.real===k)}))}
  else if(gb==='tier'){groups=['std','resell','excl'].map(t=>({label:TIER[t].l,items:list.filter(d=>d.tier===t)})).filter(g=>g.items.length)}
  else{const keys=[...new Set(list.map(d=>d.cat))];groups=keys.map(k=>({label:k,items:list.filter(d=>d.cat===k)}))}
  body.innerHTML=groups.map(g=>`<div class="group"><span class="gn">${esc(g.label)}</span><span class="gc num">${g.items.length}</span><span class="gr"></span></div><div class="grid">${g.items.map(cardHTML).join('')}</div>`).join('');
}
