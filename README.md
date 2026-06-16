# Asset Vault — V1 (Sheet → JSON)

사내 개발자산 메뉴판. **구글시트가 원본(source of truth)**, 변환기로 `assets.json`을 만들어 정적 웹앱이 읽는다.
DB·인증·자동입력은 V2. 단, **시트 컬럼을 DB 테이블 모양 그대로** 잡아두어 V2 이관이 1:1이 되게 한다.

> V1 프로토타입의 단일 `index.html` 을 동작·디자인 변경 없이 **바닐라 ES 모듈 구조로 분리**했다.
> 마크업은 `public/`, 스타일·로직은 `src/` 로 나뉘며 번들러·프레임워크는 쓰지 않는다.

```
flow_enterprise-menu/
├─ public/
│  ├─ index.html      # 웹앱(메뉴판). 같은 폴더의 assets.json 을 fetch, 실패 시 내장 샘플로 폴백
│  └─ assets.json     # 빌드 산출물(앱이 읽음)
├─ src/               # 앱 소스 (바닐라 ES 모듈, 번들 없음)
│  ├─ styles.css      # 디자인 토큰 + 전체 스타일 (단일 폰트: Noto Sans KR)
│  ├─ core.js         # 공유 상태·상수·DOM/포맷 헬퍼·토스트·확인 다이얼로그
│  ├─ data.js         # assets.json 로딩/정규화 + 오프라인 폴백(SAMPLE)
│  ├─ overview.js     # 둘러보기 (내부: 가치 대시보드 / 고객: 소개)
│  ├─ catalog.js      # 자산 카탈로그 (검색·등급필터·그룹토글·카드)
│  ├─ proposal.js     # 제안 빌더 (담기 → AI 3안 초안, 규칙기반 폴백)
│  ├─ modal.js        # 자산 상세 모달 + Q&A
│  ├─ admin.js        # 자산 관리 (테이블·CRUD·등록폼·AI 태그추천)
│  └─ app.js          # 진입점/오케스트레이터 (renderAll·모드전환·이벤트 위임)
├─ build_assets.py    # 시트 CSV → public/assets.json 변환기
└─ sheets/
   ├─ assets.csv         # 'assets' 탭을 CSV로 내려받은 것
   └─ applications.csv   # 'applications' 탭을 CSV로 내려받은 것
```

## 갱신 워크플로 (V1)
1. 구글시트 `assets` / `applications` 탭에 입력·수정
2. 각 탭 → 파일 > 다운로드 > **CSV** → `sheets/assets.csv`, `sheets/applications.csv` 로 저장(덮어쓰기)
3. `python3 build_assets.py` 실행 (또는 `npm run build:data`) → `public/assets.json` 재생성
4. 사내 정적 호스트에 **저장소 루트째 배포**하고 `/public/` 을 앱 진입점으로 연다.
   `public/index.html` 이 `../src` 를 참조하므로 **`public/` 만 떼어 배포하지 말 것**(public/ + src/ 둘 다 필요).

> **신선도(=무덤 방지)**: V1에서는 "기능 클로징 체크리스트에 시트 한 줄 입력"을 **필수 절차**로 둔다(프로세스로 강제). 개발 중 DB 직접 입력 + MCP 선제 알림은 V2의 핵심 과제.

## 시트 구조 (= 미래 DB 테이블)

### 탭 1) `assets` — 자산 본체 (1행 = 자산 1개)
| 컬럼 | 의미 | 예시 | 비고 |
|---|---|---|---|
| id | 자산 고유번호(정수, 유일) | 1 | PK |
| feature_key | 기능키(대문자_스네이크) | CHAT_UNIFIED_SEARCH | 마스터 어드민 토글 키 |
| name_ko | 자산명(국문) | 채팅 통합 검색 | |
| name_en | 영문명 | Unified Chat Search | 선택 |
| category | 카테고리 | 메신저 | |
| tier | 범용성 등급 | std \| resell \| excl | 표준화후보/재판매가능/전용 |
| platforms | 지원 플랫폼 | 웹\|iOS\|AOS | **`\|` 로 구분** |
| effort_mm | 예상 공수(M/M) | 1.0 | |
| rev_est | 기여 매출(만원, 추정·참고) | 9500 | 헤드라인 아님 |
| source | 수집 방식 | auto \| manual | |
| is_new | 이번 분기 신규 | Y / N | |
| pm | 담당 PM | 김기획 | |
| tags | 해시태그 | 검색\|메신저\|생산성 | **`\|` 로 구분**, AI 생성 가능 |
| description | 한 줄 설명 | … | 콤마 포함 가능(자동 따옴표) |
| constraints | 의존성·제약 | … | 선택 |
| demo_url | 데모 링크 | https://… | 선택 |
| wiki_url | 위키 링크 | https://… | 선택 |

### 탭 2) `applications` — 적용 이력 (1행 = 자산이 한 고객사에 적용된 1건)
| 컬럼 | 의미 | 예시 |
|---|---|---|
| asset_id | 어느 자산인지(assets.id 참조) | 1 |
| client_name | 고객사 실명 | 새솔증권 |
| client_anon | 고객사 익명 표기 | S증권 |
| applied_at | 적용 시점 | 2025-07 |
| contract_ref | 계약 참조번호 | C-2025-090 |

> ★ **재사용 횟수는 시트에 숫자로 적지 않는다.** `applications` 의 행 수로 자동 계산된다.
> 한 자산을 N개 고객사에 적용했으면 N행. 이게 재사용·자산화율·(향후)매출의 단일 진실원.

## 앱 동작
- `public/index.html` 은 같은 폴더의 `assets.json` 을 `fetch` 한다(`fetch` 는 문서 기준 경로 해석 → `public/assets.json`).
- **ES 모듈을 쓰므로 `file://` 직접 열기(더블클릭)는 동작하지 않는다.** 반드시 http 로 서빙한다:
  저장소 루트에서 `python3 -m http.server 8000` (또는 `npm start`) 실행 후 **`localhost:8000/public/`** 접속.
  `assets.json` 페치가 실패하면 `src/data.js` 의 **내장 샘플로 폴백**(화면은 동일).
- 카드의 **기능키 칩을 클릭하면 클립보드 복사**.
- 진입 시 **내부 임직원용 / 고객사 소개용** 선택. 고객 모드는 매출·공수·등급·실명 비공개.
- 제안 빌더·해시태그 추천의 AI 생성은 **claude.ai 환경에서 동작**(API 키는 코드에 넣지 않음). 실패 시 규칙 기반 초안으로 폴백.

## V2 DB 매핑 (이관 시)
| 시트 | → 테이블 | 키 |
|---|---|---|
| assets 탭 | `assets` | PK `id`, unique `feature_key` |
| assets.tags 칸 | `asset_tags(asset_id, tag)` | `\|` 분리 → 행 분해 |
| applications 탭 | `asset_applications(asset_id, client_name, client_anon, applied_at, contract_ref)` | FK `asset_id` |
| (상수) DEV_RATE 등 | `value_params` | 절감 계산 파라미터 분리 |

- `reuse` 컬럼은 DB에도 두지 않는다 → `COUNT(asset_applications)` 뷰로 계산.
- 변환기(`build_assets.py`)의 입력만 CSV → DB 쿼리로 바꾸면 앱(`assets.json` 계약)은 그대로 동작.

## ⚠️ 보안 (인증 P2)
- 인증이 없으므로 **고객사 소개 모드라도 URL을 고객에게 넘기지 말 것.** 프론트로만 가린 거라 개발자도구로 매출·실명이 노출됨. "영업이 노트북으로 직접 보여주는 용도"까지만.
- 구글시트 **"웹에 게시(Publish to web)"로 CSV/JSON을 받지 말 것** — 공개 URL로 영업기밀이 새어나간다. 반드시 CSV **다운로드 → 빌드 → 사내 호스트 배포** 경로로.
- `public/assets.json` 에는 고객사 실명이 들어있다. 사내 접근 통제 뒤에 둘 것.
