// admin.js — 자산 관리(테이블·CRUD), 등록/수정 폼, AI 해시태그 추천
import { $, $$, state, DATA, setData, TIER, PLATFORMS, MODEL, esc, won, today, toast, openConfirm } from './core.js';
import { renderAll } from './app.js';

export function renderAdmin(){
  const body=$('#adminBody');
  if(!DATA.length){body.innerHTML=`<tr><td colspan="9"><div class="empty"><div class="t">등록된 자산이 없어요</div></div></td></tr>`;return}
  body.innerHTML=[...DATA].sort((a,b)=>b.id-a.id).map(d=>`<tr><td><div class="tnm">${esc(d.name)} <span class="srctag ${d.source==='manual'?'man':''}">${d.source==='manual'?'수동':'AUTO'}</span></div></td><td><span class="fkey">${esc(d.key)}</span></td><td>${esc(d.cat)}</td><td><span class="tier-sm ${TIER[d.tier].c}">${TIER[d.tier].l}</span></td><td>${esc(d.real)}</td><td class="r num">${d.reuse}</td><td class="r num">${d.mm}</td><td class="r num">${won(d.rev)}</td><td><div class="acts"><button class="icon-btn" data-edit="${d.id}" title="수정"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button><button class="icon-btn del" data-del="${d.id}" title="삭제"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button></div></td></tr>`).join('');
}

export function openForm(id){
  state.editId=id||null;const d=id?DATA.find(x=>x.id===id):null;const opt=map=>Object.entries(map).map(([k,v])=>`<option value="${k}">${v.l}</option>`).join('');
  $('#formModal').innerHTML=`<div class="m-head"><button class="m-close" data-formclose><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button><h2>${d?'자산 수정':'자산 수동 등록'}</h2><div class="en">${d?'#'+d.id+' '+esc(d.en):'새 자산을 등록합니다'}</div></div>
    <div class="form-body"><div class="form-grid">
      <div class="field full" id="wrap-name"><label>자산명 (국문)</label><input type="text" id="fm-name" placeholder="예: 채팅 통합 검색"><span class="err">자산명을 입력하세요.</span></div>
      <div class="field"><label>영문명 <span class="opt">(선택)</span></label><input type="text" id="fm-en"></div>
      <div class="field"><label>기능키 (CONSTANT_CASE)</label><input type="text" id="fm-key" placeholder="예: PDF_EXPORT"></div>
      <div class="field"><label>카테고리</label><input type="text" id="fm-cat" list="catList"><datalist id="catList">${[...new Set(DATA.map(x=>x.cat))].map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
      <div class="field"><label>범용성 등급</label><select id="fm-tier">${opt(TIER)}</select></div>
      <div class="field"><label>고객사 실명</label><input type="text" id="fm-real"></div>
      <div class="field"><label>고객사 익명 표기</label><input type="text" id="fm-anon"></div>
      <div class="field"><label>재사용 횟수</label><input type="number" id="fm-reuse" min="0" value="0"></div>
      <div class="field"><label>예상 공수 (M/M)</label><input type="number" id="fm-mm" min="0" step="0.1" value="1.0"></div>
      <div class="field"><label>기여 매출 (만원) <span class="opt">(추정)</span></label><input type="number" id="fm-rev" min="0" step="100" value="0"></div>
      <div class="field"><label>수집 방식</label><select id="fm-source"><option value="manual">수동</option><option value="auto">자동</option></select></div>
      <div class="field full"><label>지원 플랫폼</label><div class="plat-row" id="fm-plat">${PLATFORMS.map(p=>`<label class="chip-check"><input type="checkbox" value="${p}">${p}</label>`).join('')}</div></div>
      <div class="field full"><label>한 줄 설명</label><textarea id="fm-desc"></textarea></div>
      <div class="field full"><label>해시태그 <button class="ai-tag-btn" id="aiTagBtn" type="button"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/></svg>AI 추천</button></label><input type="text" id="fm-tags" placeholder="예: 검색, 메신저, 생산성 (쉼표 구분)"></div>
      <div class="field full"><label>의존성 · 제약 <span class="opt">(선택)</span></label><textarea id="fm-cons"></textarea></div>
      <div class="field"><label>담당 PM <span class="opt">(선택)</span></label><input type="text" id="fm-pm"></div>
      <div class="field"><label>위키 링크 <span class="opt">(선택)</span></label><input type="url" id="fm-wiki" placeholder="https://"></div>
    </div></div>
    <div class="form-foot"><button class="cancel" data-formclose>취소</button><button class="save" id="fm-save">${d?'수정 저장':'등록하기'}</button></div>`;
  if(d){$('#fm-name').value=d.name;$('#fm-en').value=d.en;$('#fm-key').value=d.key;$('#fm-cat').value=d.cat;$('#fm-tier').value=d.tier;$('#fm-real').value=d.real;$('#fm-anon').value=d.anon;$('#fm-reuse').value=d.reuse;$('#fm-mm').value=d.mm;$('#fm-rev').value=d.rev;$('#fm-source').value=d.source;$('#fm-desc').value=d.desc;$('#fm-tags').value=(d.tags||[]).join(', ');$('#fm-cons').value=d.cons||'';$('#fm-pm').value=d.pm||'';$('#fm-wiki').value=d.wikiUrl||'';$$('#fm-plat input').forEach(c=>{c.checked=d.platform.includes(c.value);c.closest('.chip-check').classList.toggle('on',c.checked)})}
  $$('#fm-plat .chip-check').forEach(l=>l.onclick=e=>{const i=l.querySelector('input');if(e.target!==i)i.checked=!i.checked;l.classList.toggle('on',i.checked)});
  $('#fm-save').onclick=saveForm;$('#aiTagBtn').onclick=aiSuggestTags;
  $('#formOv').classList.add('show');document.body.style.overflow='hidden';
}
export async function aiSuggestTags(){
  const name=$('#fm-name').value.trim();const desc=$('#fm-desc').value.trim();
  if(!name&&!desc){toast('자산명이나 설명을 먼저 입력해줘');return}
  const btn=$('#aiTagBtn');btn.disabled=true;btn.textContent='생성 중…';
  const prompt=`다음 기능에 어울리는 한국어 해시태그를 2~3개 제안하세요. 검색용 키워드이며 짧고 일반적인 단어로. JSON 배열 문자열만 응답(예: ["검색","메신저","생산성"]). #이나 설명 없이.\n기능명: ${name}\n설명: ${desc}`;
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:200,messages:[{role:"user",content:prompt}]})});
    const data=await res.json();let text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("").replace(/```json/g,'').replace(/```/g,'').trim();
    const arr=JSON.parse(text);$('#fm-tags').value=arr.slice(0,3).map(t=>String(t).replace(/^#/,'')).join(', ');
  }catch(e){toast('AI 태그 생성 실패 (claude.ai 환경에서 동작)')}
  finally{btn.disabled=false;btn.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/></svg>AI 추천'}
}
export function closeForm(){$('#formOv').classList.remove('show');document.body.style.overflow='';state.editId=null}
export function saveForm(){
  const name=$('#fm-name').value.trim();if(!name){$('#wrap-name').classList.add('invalid');$('#fm-name').focus();return}
  const real=$('#fm-real').value.trim()||'미지정';
  const tags=$('#fm-tags').value.split(',').map(t=>t.trim().replace(/^#/,'')).filter(Boolean).slice(0,3);
  const obj={name,en:$('#fm-en').value.trim(),key:($('#fm-key').value.trim()||'UNTITLED').toUpperCase().replace(/\s+/g,'_'),cat:$('#fm-cat').value.trim()||'미분류',tier:$('#fm-tier').value,real,anon:$('#fm-anon').value.trim()||real.charAt(0)+'***',reuse:Math.max(0,parseInt($('#fm-reuse').value)||0),mm:Math.max(0,parseFloat($('#fm-mm').value)||0),rev:Math.max(0,parseInt($('#fm-rev').value)||0),source:$('#fm-source').value,platform:[...$$('#fm-plat input:checked')].map(c=>c.value),desc:$('#fm-desc').value.trim(),tags,cons:$('#fm-cons').value.trim(),pm:$('#fm-pm').value.trim(),wikiUrl:$('#fm-wiki').value.trim(),demoUrl:'',neww:true,updated:today()};
  const isNew=!state.editId;
  if(state.editId){Object.assign(DATA.find(x=>x.id===state.editId),obj)}else{obj.id=Math.max(0,...DATA.map(d=>d.id))+1;DATA.push(obj)}
  const nm=obj.name;closeForm();renderAll();toast(`자산 '${nm}'이(가) ${isNew?'등록':'수정'}됐어요`);
}
export function delFeature(id){const d=DATA.find(x=>x.id===id);if(!d)return;openConfirm({title:'이 자산을 삭제할까요?',body:`‘${d.name}’이(가) 목록에서 제거됩니다. (프로토타입이라 새로고침하면 복구돼요.)`,go:'삭제',danger:true,onGo:()=>{setData(DATA.filter(x=>x.id!==id));state.cart.delete(id);renderAll()}})}
