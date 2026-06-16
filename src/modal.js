// modal.js — 자산 상세 모달(기능키·데모·위키·specs·제약) + Q&A
import { $, DATA, isInternal, esc, cl, won, TIER, inCart, KEYICON, toast } from './core.js';
import { tagsHTML } from './catalog.js';
import { toggleCart } from './proposal.js';

// Q&A 시드 (인메모리)
export let COMMENTS={
 6:[{a:'정현우',r:'CXM',t:'그린복지공단 외 다른 공공기관에도 적용 가능한가요? 태블릿이 필수인지 궁금합니다.',time:'3일 전'},{a:'박PM',r:'PM',t:'태블릿은 선택 사항이고 웹만으로도 동작합니다. 공공 적용 사례는 위키에 정리해 올릴게요.',time:'2일 전'}],
 1:[{a:'이영업',r:'영업',t:'증권 외 일반 금융권 데모 영상이 따로 있을까요? 다음 주 미팅에 쓰려고 합니다.',time:'5일 전'}],
};

export function openModal(id){
  const d=DATA.find(x=>x.id===id);if(!d)return;const internal=isInternal();
  const specs=internal
    ?`<div class="specs"><div class="sp"><div class="k">적용 고객사</div><div class="v">${esc(cl(d))}</div></div><div class="sp"><div class="k">재사용 / 기여매출</div><div class="v num">${d.reuse}회 · ${won(d.rev)}</div></div><div class="sp"><div class="k">예상 공수</div><div class="v num">${d.mm} M/M</div></div><div class="sp"><div class="k">지원 플랫폼</div><div class="v">${d.platform.join(' · ')||'—'}</div></div></div>`
    :`<div class="specs"><div class="sp"><div class="k">카테고리</div><div class="v">${esc(d.cat)}</div></div><div class="sp"><div class="k">적용 사례</div><div class="v">${esc(cl(d))}</div></div><div class="sp"><div class="k">지원 플랫폼</div><div class="v">${d.platform.join(' · ')||'—'}</div></div><div class="sp"><div class="k">해시태그</div><div class="v">${(d.tags||[]).map(t=>'#'+esc(t)).join(' ')||'—'}</div></div></div>`;
  const cartStrip=internal?`<div class="cart-strip"><div><div class="cs-t">제안서에 이 자산 담기</div><div class="cs-d">담은 기능으로 AI가 제안 초안을 만들어 줘요</div></div><button id="mCart" class="${inCart(id)?'in':''}">${inCart(id)?'담김 ✓':'+ 담기'}</button></div>`:'';
  const keyBlock=internal?`<div class="m-keyrow"><span class="klab">기능키</span><span class="fkey">${KEYICON}${esc(d.key)}</span></div><div class="m-keyhint">마스터 어드민에서 이 키를 켜면 해당 고객 환경에 기능이 노출됩니다.</div>`:'';
  const cmts=COMMENTS[id]||[];
  const qa=internal?`<div class="qa"><div class="qa-h">Q&amp;A <span class="qc num">${cmts.length}</span></div><div id="cmtList">${cmts.map(cmtHTML).join('')||'<div style="font-size:13px;color:var(--faint);margin-bottom:14px">아직 질문이 없어요. 첫 질문을 남겨보세요.</div>'}</div><div class="cmt-form"><input type="text" id="cmtInput" placeholder="기능에 대해 질문하거나 답해보세요"><button id="cmtSend">등록</button></div></div>`:'';
  const tierBadge=internal?`<span class="tier ${TIER[d.tier].c}">${TIER[d.tier].l}</span>`:`<span class="cat-tag">${esc(d.cat)}</span>`;
  $('#modal').innerHTML=`<div class="m-head"><button class="m-close" data-close><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button><div class="bd">${tierBadge}</div><h2>${esc(d.name)}</h2><div class="en">${esc(d.en)}</div></div>
  <div class="demo"><div class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div><div class="pl">DEMO PLACEHOLDER · 영상/GIF 영역</div></div>
  <div class="m-body">${keyBlock}<p class="lead">${esc(d.desc)}</p>${tagsHTML(d)}${cartStrip}${specs}
    ${d.cons&&internal?`<div class="cons"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><div><div class="ct">의존성 · 제약</div><div class="cd">${esc(d.cons)}</div></div></div>`:''}
    <div class="m-foot"><a href="${esc(d.demoUrl||'#')}" class="ghost"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>데모 보기</a><a href="${esc(d.wikiUrl||'#')}" class="primary">위키 전체 보기 →</a></div>
    ${qa}</div>`;
  if(internal){$('#mCart').onclick=()=>{toggleCart(id);openModal(id)};$('#cmtSend').onclick=()=>addComment(id);$('#cmtInput').addEventListener('keydown',e=>{if(e.key==='Enter')addComment(id)})}
  $('#overlay').classList.add('show');document.body.style.overflow='hidden';
}
export function cmtHTML(c){return `<div class="cmt"><div class="av">${esc(c.a.charAt(0))}</div><div class="cb"><div class="ch"><span class="ca">${esc(c.a)}</span><span class="cr">${esc(c.r)}</span><span class="ct">${esc(c.time)}</span></div><div class="cx">${esc(c.t)}</div></div></div>`}
export function addComment(id){const inp=$('#cmtInput');const v=inp.value.trim();if(!v)return;if(!COMMENTS[id])COMMENTS[id]=[];COMMENTS[id].push({a:'나',r:'임직원',t:v,time:'방금'});inp.value='';openModal(id);toast('질문이 등록됐어요')}
export function closeModal(){$('#overlay').classList.remove('show');document.body.style.overflow=''}
