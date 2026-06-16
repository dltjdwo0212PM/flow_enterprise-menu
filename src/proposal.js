// proposal.js — 제안 빌더(담기 → AI 3안 초안), 규칙 기반 폴백, 담기 토글
import { $, $$, state, DATA, esc, cl, TIER, MODEL, copyText } from './core.js';
import { renderCatalog } from './catalog.js';

export function renderProposal(){
  const items=[...state.cart].map(id=>DATA.find(d=>d.id===id)).filter(Boolean);
  const body=$('#proposalBody');
  $('#cartCnt').style.display=state.cart.size?'inline-grid':'none';$('#cartCnt').textContent=state.cart.size;
  if(!items.length){body.innerHTML=`<div class="empty"><div class="t">담은 기능이 없어요</div><span data-goto="catalog" style="color:var(--accent-ink);font-weight:700;cursor:pointer">자산</span>에서 ‘+ 담기’로 기능을 추가하세요.</div>`;return}
  const totalMM=items.reduce((s,d)=>s+d.mm,0);const consItems=items.filter(d=>d.cons);
  body.innerHTML=`<div class="prop-grid"><div>
    <div class="prop-list">${items.map(d=>`<div class="pitem"><div class="pi-main"><div class="nm">${esc(d.name)} <span class="tier ${TIER[d.tier].c}" style="padding:2px 7px">${TIER[d.tier].l}</span></div><div class="sub">적용사례 ${esc(cl(d))} · ${esc(d.key)}</div></div><span class="pi-mm num">${d.mm} M/M</span><button class="pi-rm" data-rm="${d.id}" title="빼기"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>`).join('')}</div>
    ${consItems.length?`<div class="pwarn"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><div><div class="pw-t">검토 필요 · 제약 ${consItems.length}건</div><div class="pw-d">${consItems.map(d=>`<b>${esc(d.name)}</b>: ${esc(d.cons)}`).join('<br>')}</div></div></div>`:''}
    <div class="ai-result" id="aiResult"></div>
  </div><div class="summary"><h3>제안 요약</h3>
    <div class="sline"><span class="sk">포함 기능</span><span class="sv num">${items.length}건</span></div>
    <div class="sline"><span class="sk">표준화 후보</span><span class="sv num">${items.filter(d=>d.tier==='std').length}건</span></div>
    <div class="sline"><span class="sk">검토 필요(제약)</span><span class="sv num">${consItems.length}건</span></div>
    <div class="sline total"><span class="sk">총 예상 공수</span><span class="sv num">${(+totalMM.toFixed(1))} M/M</span></div>
    <div class="field-c"><label>제안 대상 고객사</label><input type="text" id="propClient" placeholder="예: 신규금융 고객사"></div>
    <button class="gen-btn" id="genBtn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/></svg>AI 제안 초안 3안 생성</button>
    <div class="ai-note">Claude로 생성됩니다 · claude.ai 환경에서 실행 시 동작</div>
  </div></div>`;
  $('#genBtn').onclick=()=>genProposals(items);
  if(state.variants)renderVariants();
}
export async function genProposals(items){
  const client=$('#propClient').value.trim()||'(고객사명)';
  const ar=$('#aiResult');
  ar.innerHTML=`<div class="ai-load"><div class="spin"></div><div class="alt">AI가 전략이 다른 제안 초안 3가지를 작성 중…</div></div>`;
  $('#genBtn').disabled=true;
  const feats=items.map(d=>`- ${d.name} (${TIER[d.tier].l}, 예상공수 ${d.mm}M/M, 적용사례 ${cl(d)}${d.cons?', 제약: '+d.cons:''})`).join('\n');
  const totalMM=items.reduce((s,d)=>s+d.mm,0);
  const prompt=`당신은 B2B 협업툴(Flow) 솔루션의 영업 제안 전문가입니다. 아래 정보로, 전략적으로 서로 다른 3가지 제안 초안을 작성하세요.\n\n[대상 고객사] ${client}\n[총 예상 공수] ${(+totalMM.toFixed(1))} M/M\n[포함 기능]\n${feats}\n\n각 안은 강조점과 전략이 분명히 달라야 합니다(예: 빠른 핵심 도입 / 통합 패키지 가치 / 단계적 리스크 최소화 등). 한국어 비즈니스 문어체로 쓰되 과장 없이.\n\n반드시 아래 형식의 JSON 배열로만 응답하세요. 마크다운, 백틱, 설명 없이 순수 JSON만:\n[{"label":"2~4단어 전략명","approach":"이 안이 강조하는 점과 트레이드오프 한 줄","body":"제안 초안 본문 250자 내외"}]`;
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:1000,messages:[{role:"user",content:prompt}]})});
    const data=await res.json();
    let text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
    text=text.replace(/```json/g,'').replace(/```/g,'').trim();
    const arr=JSON.parse(text);
    if(!Array.isArray(arr)||!arr.length)throw new Error('형식 오류');
    state.variants=arr;state.selVar=0;renderVariants();
  }catch(e){
    state.variants=null;
    ar.innerHTML=`<div class="ai-err"><b>AI 생성에 실패했어요.</b> 이 기능은 claude.ai 환경에서 동작합니다(외부 호스팅 시 별도 API 키 필요). 아래는 기본 템플릿 초안이에요.<div style="margin-top:14px"></div></div>`;
    fallbackDraft(items,client);
  }finally{$('#genBtn').disabled=false}
}
export function renderVariants(){
  const ar=$('#aiResult');const v=state.variants;const cur=v[state.selVar];
  ar.innerHTML=`<div class="var-head"><div class="var-tabs">${v.map((x,i)=>`<button class="var-tab ${i===state.selVar?'on':''}" data-var="${i}"><div class="vt-n">${i+1}안</div><div class="vt-l">${esc(x.label||'제안')}</div></button>`).join('')}</div><button class="regen" id="regenBtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.4A9 9 0 0 0 20.5 15"/></svg>다시 생성</button></div>
    <div class="var-body"><div class="vb-h"><div class="vb-app"><b>${esc(cur.label||'')}</b> · ${esc(cur.approach||'')}</div><button class="copy" id="copyBtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>복사</button></div><pre>${esc(cur.body||'')}</pre></div>`;
  $$('#aiResult .var-tab').forEach(b=>b.onclick=()=>{state.selVar=+b.dataset.var;renderVariants()});
  $('#regenBtn').onclick=()=>{const items=[...state.cart].map(id=>DATA.find(d=>d.id===id)).filter(Boolean);genProposals(items)};
  $('#copyBtn').onclick=()=>copyText(cur.body||'');
}
export function fallbackDraft(items,client){
  const totalMM=items.reduce((s,d)=>s+d.mm,0);const consItems=items.filter(d=>d.cons);const L=[];
  L.push('[제안 요약]');L.push('대상: '+client);L.push(`포함 기능 ${items.length}건 · 총 예상 공수 ${(+totalMM.toFixed(1))} M/M`);L.push('');L.push('[제안 기능]');
  items.forEach(d=>L.push(`· ${d.name} (${TIER[d.tier].l}) — ${d.mm} M/M — 적용사례 ${cl(d)}`));
  if(consItems.length){L.push('');L.push('[사전 검토 / 제약]');consItems.forEach(d=>L.push(`· ${d.name}: ${d.cons}`))}
  L.push('');L.push('※ 공수는 과거 적용 기준 추정치이며 고객사 환경에 따라 조정될 수 있습니다.');
  const t=L.join('\n');
  $('#aiResult').innerHTML+=`<div class="var-body"><div class="vb-h"><div class="vb-app"><b>기본 템플릿</b> · 규칙 기반 초안</div><button class="copy" id="copyBtn2"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>복사</button></div><pre>${esc(t)}</pre></div>`;
  $('#copyBtn2').onclick=()=>copyText(t);
}
export function toggleCart(id){if(state.cart.has(id))state.cart.delete(id);else state.cart.add(id);state.variants=null;renderCatalog();renderProposal()}
