// overview.js — 둘러보기(내부: 가치 대시보드 / 고객: 소개 화면)
import { $, isInternal, DATA, DEV_RATE, won, esc, KEYICON } from './core.js';
import { cardHTML } from './catalog.js';

export function renderOverview(){
  const body=$('#overviewBody');
  if(isInternal()){
    const N=DATA.length;
    const save=DATA.reduce((s,d)=>s+Math.max(0,d.reuse-1)*d.mm*DEV_RATE,0);
    const rev=DATA.reduce((s,d)=>s+d.rev,0);
    const avgReuse=N?DATA.reduce((s,d)=>s+d.reuse,0)/N:0;
    const reuseConv=N?Math.round(DATA.filter(d=>d.reuse>=2).length/N*100):0;
    const resellRatio=N?Math.round(DATA.filter(d=>d.tier!=='excl').length/N*100):0;
    const top=[...DATA].sort((a,b)=>b.reuse-a.reuse).slice(0,5).map((d,i)=>`<div class="rrow" data-id="${d.id}"><span class="rk num">${String(i+1).padStart(2,'0')}</span><div class="info"><div class="nm">${esc(d.name)}</div><div class="sub"><span class="fkey">${KEYICON}${esc(d.key)}</span> · 절감 ${won(Math.max(0,d.reuse-1)*d.mm*DEV_RATE)}원</div></div><div class="val"><div class="v num">${d.reuse}회</div><div class="k">재사용</div></div></div>`).join('');
    body.innerHTML=`
      <div class="hero"><span class="eyebrow">Madras Check · 개발자산 레지스트리</span><h1>만든 걸 자산으로, 자산을 매출로.</h1><p>우리가 개발한 상품가치 있는 기능을 자동으로 모으고, 재사용으로 축적한 가치를 한곳에서 봅니다.</p></div>
      <div class="north"><div class="lab">재사용으로 절감한 개발비 <span class="est">추정 · 검증가능</span></div><div class="big num">${won(save)}<span class="u">원</span></div><div class="note">한 번 만든 기능을 재개발하지 않고 재사용해 아낀 추정 개발비. (재사용횟수−1)×공수×인건비단가로 계산한, 방어 가능한 하한선입니다.</div></div>
      <div class="metrics"><div class="metric"><div class="mv num">${reuseConv}%</div><div class="ml">자산화율</div><div class="msub">등록 자산 중 2회 이상 재사용된 비율</div></div><div class="metric"><div class="mv num">${avgReuse.toFixed(1)}회</div><div class="ml">평균 재사용 횟수</div><div class="msub">자산 1개가 평균 적용된 고객사 수</div></div><div class="metric"><div class="mv num">${resellRatio}%</div><div class="ml">재판매 가능 비율</div><div class="msub">전용을 제외한 재판매 가능 자산 비율</div></div></div>
      <div class="note-soft">참고: 기여 매출(추정 ${won(rev)}원)은 묶음·라이선스 계약 특성상 기능별 정확한 산정이 어려워, 헤드라인 대신 별도 추정치로만 관리합니다.</div>
      <div class="sec"><div class="sec-h"><h2>가장 많이 재사용된 자산 TOP 5</h2><span class="more" data-goto="catalog">자산 전체 →</span></div><div class="rank">${top}</div></div>`;
  } else {
    const cats=new Set(DATA.map(d=>d.cat)).size, clients=new Set(DATA.map(d=>d.real)).size;
    const feat=[...DATA].sort((a,b)=>b.reuse-a.reuse).slice(0,6).map(cardHTML).join('');
    body.innerHTML=`
      <div class="hero"><span class="eyebrow">Flow · 검증된 협업 기능</span><h1>필요한 기능, 이미 만들어 뒀습니다.</h1><p>여러 고객사와 함께 검증한 기능들을 소개합니다. 관심 있는 기능은 데모와 상세 설명으로 확인하세요.</p></div>
      <div class="metrics" style="margin-top:34px"><div class="metric"><div class="mv num">${DATA.length}</div><div class="ml">제공 가능한 기능</div></div><div class="metric"><div class="mv num">${cats}</div><div class="ml">기능 카테고리</div></div><div class="metric"><div class="mv num">${clients}+</div><div class="ml">적용 고객사</div></div></div>
      <div class="sec"><div class="sec-h"><h2>대표 기능</h2><span class="more" data-goto="catalog">전체 보기 →</span></div><div class="grid">${feat}</div></div>`;
  }
}
