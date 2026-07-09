# 작업 로그

새 세션은 이 파일을 먼저 읽고 이어서 작업한다. 최신 항목이 맨 위.
형식: `## YYYY-MM-DD` 아래에 한 일 / 현재 상태 / 다음 할 것.

> 역할 구분: **DECISIONS** = 왜(결정·근거) / **ROADMAP** = 무엇을 어떤 순서로 / **WORKLOG** = 실제로 무엇을 했고 지금 어디까지.

---

## 2026-07-09 (추가) — 개발 캡처 루프 도입 (Playwright)
**한 일**
- 개발 중 시각 확인용 스크린샷 워크플로 도입: Claude가 dev 서버를 백그라운드로 띄우고
  **글로벌 설치한 Playwright**로 헤드리스 크롬 캡처 → 모바일 전송. `CLAUDE.md` 규칙 갱신
  (dev 서버 캡처 목적 한정 허용 + 알림 `[맛집]` 접두어).
- Playwright는 **글로벌 설치**(`npm i -g playwright`, 브라우저는 머신 공유 캐시). 맛집 레포
  `package.json`은 안 건드림. 캡처 스크립트는 세션 스크래치 폴더(`capture.js`)에 격리.
- 첫 실전: 강남역 좌표 주입 → 위치버튼 → 실 `/api/recommend`(200) → 3카드 캡처.
  '해장' 태그 선택 시 국수/국밥집으로 필터되는 것 화면으로 확인, 2장 모바일 전송. 캡처 후 dev 서버 정리.

## 2026-07-09 — Phase 3: 공공데이터 실연동 (sdsc2) + 서버 오케스트레이션
**한 일**
- 공공데이터 키 발급·검증: 실 API로 엔드포인트/파라미터/음식코드 확정 (DECISIONS D2 갱신).
  - 엔드포인트 `…/api/open/sdsc2/storeListInRadius` (구버전 sdsc는 폐기), **음식 대분류=`I2`**,
    cx=경도/cy=위도(축 뒤집힘), 필드매핑 bizesId/bizesNm/indsSclsNm/lon/lat/rdnmAdr 확인.
  - 초기 "Forbidden"은 키 활성화 지연(최대 1h)이었고, 재입력 후 `resultCode:00` 정상.
- `lib/sangwon.ts`: `searchInRadius()` 실구현 — I2 필터, JSON 파싱/게이트웨이오류 방어, `RestaurantSource[]` 매핑.
- `app/api/recommend/route.ts`: 스텁 → 오케스트레이션. `POST{lat,lng,radius,tags}` →
  sangwon → buildPool(거리순) → filterByTags → **거리순 상위 20 캡** → pickThree. `{cards, pool}` 반환. 키는 서버에서만.
- `app/page.tsx`: 클라 mock 직접호출 제거 → `/api/recommend` fetch, **로딩/에러 상태** 추가. 셔플은 반환된 pool로 로컬 pickThree.
- `types`: `RecommendResponse.poolToken` → `pool: Restaurant[]` (셔플용 실체화).
- `lib/tags.ts`: 8개 태그 키워드를 **실제 sdsc2 소분류명**(백반/한정식·국/탕/찌개류·중국집 등)에 맞게 튜닝.
- `lib/mock.ts`: 제품 런타임에서 제거(파일은 개발용 보존). 위치 거부 시 `MOCK_CENTER`(강남역) 좌표로 동일 실 API 호출.
- 결정 기록: DECISIONS **D9 신규**(서버 조회 + 셔플 풀 상한 20 + 1000페이지 한계 + 폴백).
- 검증: `tsc --noEmit`·`eslint` 에러 0. 실 API 데이터로 파이프라인 스모크 테스트 — 8개 태그 전부 실업종 매칭,
  상위20 풀·3장 선정 정상, 결과 전부 도보 1~2분권 확인.

**현재 상태**
- **ROADMAP Phase 3 완료**(카카오 보강 제외): 실데이터로 위치→태그필터→3카드→셔플이 서버 오케스트레이션으로 동작.
- 미커밋 상태(사용자 요청 시 묶어서 커밋 예정). dev 서버 확인·배포는 사용자 몫.
- 알려진 한계(D9): 초밀집 반경은 API 1페이지(1,000개) 상한으로 최근접 일부 누락 이론상 가능 — 실측 영향 없어 MVP에선 미보완.

**다음 할 것**
- (선택) `lib/kakao.ts` 고도화: 상호명+좌표 → 카카오 로컬로 정확 길찾기 링크/주소 보강(fallback 유지).
- 사용자가 배포를 지시하면 `metadataBase` 채우고 Vercel 배포.

## 2026-07-07 (밤) — Phase 4 착수 (배포 전까지): 상태 처리 + 로깅 정책
**한 일**
- 실행 순서 결정(DECISIONS D8): Phase 4(배포 제외) → 공공데이터 키+Phase 3 → 카카오 고도화 순으로 진행하기로 함.
- `components/LocationGate.tsx`: 에러 상태를 `denied`(권한 거부)/`error`(그 외: timeout·미지원 등)로 분리,
  거부 시 전용 안내 문구 표시. `console.error`로 실패 원인 로깅.
- `docs/DECISIONS.md`: D7(런타임 로깅 = console만, 외부 모니터링 미도입) 신규 추가.
  D6에서 Anthropic 키 언급 제거(D5 개정으로 미사용).
- "결과없음"(반경 내 후보 없음) 상태는 Phase 1에서 이미 구현돼 있어 추가 작업 없음(`app/page.tsx`).
- 검증: `tsc --noEmit`/`eslint` 에러 0.
- **Vercel 배포는 보류** — 사용자가 별도로 지시할 때 진행하기로 함(외부 배포는 확인 후 진행).

**현재 상태**
- Phase 4 중 배포를 제외한 항목(상태 처리·로깅 정책) 완료. ROADMAP 체크박스 갱신.
- 미커밋 상태. 다음 커밋 시 이번 세션 변경(태그 매칭 + 파비콘/OG + 상태처리) 한 번에 묶을 예정.

**다음 할 것**
- 공공데이터(`data.go.kr`) API 키 발급 → `lib/sangwon.ts` 실연동 → `page.tsx`를 fetch 기반으로 전환(Phase 3).
- 그다음 카카오 로컬 API로 `lib/kakao.ts` 고도화(선택, fallback 유지).
- 사용자가 배포를 지시하면 `metadataBase` 채우고 Vercel 배포.

## 2026-07-07 (저녁) — 파비콘 + 공유 미리보기 이미지
**한 일**
- `app/icon.svg` 신규: 브랜드 마크(오렌지 3카드 팬 모양) — "항상 카드 3개" 정체성을 아이콘화.
  기본 Next.js `favicon.ico`(로고)는 제거하고 이 SVG로 대체.
- `app/opengraph-image.tsx` 신규: `next/og`(`ImageResponse`)로 카톡/슬랙 등 링크 공유 시
  미리보기 이미지를 정적 생성 (1200x630). 같은 3카드 마크 + 타이틀/태그라인.
  Next.js 파일 컨벤션이 `og:image`/`twitter:image` 메타태그에 자동 연결.
- `app/layout.tsx`: 기본 `metadata`("Create Next App")를 실제 타이틀/설명으로 교체.
  `metadataBase`는 Vercel 배포 도메인 정해지면 채우기로 TODO 남김(현재는 로컬호스트로 폴백, 빌드 경고만 있고 에러 아님).
- `public/*.svg`(create-next-app 스캐폴딩 잔재, 미사용 확인 후 삭제).
- 검증: `npx next build` 성공, `/icon.svg`·`/opengraph-image` 둘 다 정적(○) 생성 확인.
  `sharp`로 아이콘을 256px·32px 렌더링해 실제 파비콘 크기에서도 3카드 모양이 인식되는지 육안 확인.

**현재 상태**
- 파비콘·공유 미리보기 이미지 완성. 도메인 없어서 실제 배포 후 카톡 등에서 og:image 반영 여부는
  Vercel 배포 시 `metadataBase` 채우고 재확인 필요.

## 2026-07-07 — Phase 2: 상황 태그 매칭 (D5 개정, LLM 제거)
**한 일**
- 설계 변경: 자연어+Claude 매칭 → **고정 상황 태그(다중 선택) + 키워드 필터**로 전환.
  이유: 원클릭·선택지 축소 철학에 태그 클릭이 더 맞고, LLM 키/지연/비용 없이 결정론적으로 동작.
  태그로 전체 업종을 커버하려 하면 태그 수가 늘어나 정체성이 깨지므로, 커버리지는 포기하고
  태그 미선택/미매칭은 "아무거나"+D3 공정 셔플이 흡수하도록 함. 상세 근거: `DECISIONS.md` D5.
- `lib/tags.ts` 신설: 태그 8개(해장/든든하게/가볍게/매콤하게/뜨끈한 국물/이국음식/분위기 있게/빠르게 한끼).
- `lib/match.ts`: Claude 스텁 제거 → `filterByTags()`(키워드 포함 매칭, 미매칭 시 원본 풀 반환).
- `lib/persona.ts`: Claude 스텁 제거 → 템플릿 기반 `prescribe()`(선택 태그 있으면 반영, 없으면 랜덤 일반 문구).
- `components/SituationInput.tsx`: 자연어 입력 스텁 → 태그 다중 선택 칩 UI로 구현.
- `types/index.ts`: `SituationTag` 추가, `RecommendRequest.query` → `tags?: string[]`.
- `app/page.tsx`: 태그 선택 상태 연결, `buildPool → filterByTags → pickThree` 흐름으로 변경.
- `.env.example`에서 `ANTHROPIC_API_KEY` 제거(v1 스코프에서 불필요).
- 문서 동기화: `DECISIONS.md`(D5 개정) · `MVP_SCOPE.md` · `ROADMAP.md`(Phase2 체크) · `ARCHITECTURE.md`
  (데이터 흐름·폴더·타입·env) · `STRUCTURE.md`(상태 ✅ 갱신) · `CLAUDE.md`(기술스택/원칙/보안 문구) · `README.md`.
- 검증: `tsc --noEmit` 에러 0, `eslint` 에러 0 (Phase3 스텁 미사용 파라미터 warning 2개만 남음).

**현재 상태**
- **ROADMAP Phase 2 완료**: 태그 선택 → 키워드 필터 → 3카드 → 셔플이 전부 클라이언트에서 동작(더미데이터).
- `/api/recommend` API Route는 여전히 빈 스텁 — 매칭에 서버/키가 필요 없어져서 Phase 3(실데이터 조회 시
  공공데이터 키 은닉 목적)까지 그대로 미룸.
- 미커밋 상태(사용자 요청 시 묶어서 커밋 예정). dev 서버 확인은 사용자 몫.

**다음 할 것**
- 공공데이터 API 키 발급되면 Phase 3: `lib/sangwon.ts` 실연동, `/api/recommend`에 서버 오케스트레이션 이전.
- (선택) 태그 라벨/키워드가 실제 소분류명과 안 맞으면 튜닝.

## 2026-06-19 (저녁) — Phase 0 마무리 + Phase 1
**한 일**
- `lib/mock.ts`: 강남역 주변 더미 식당 26개 (≈90m~1.4km 분산). `MOCK_CENTER` 추가.
- `lib/distance.ts`: haversine 거리 + walkMinutes(80m/분) 구현.
- `lib/shuffle.ts`: `buildPool`(반경 필터+walkMin 부착, 거리순) + `pickThree`(Fisher–Yates) 구현.
- `types`: `RestaurantSource`(walkMin/mapUrl 제외 원천 타입) 추가.
- 컴포넌트 구현: `LocationGate`(위치동의+강남역 fallback), `Card`(카카오맵 길찾기 링크), `CardDeck`(3카드+셔플).
- `app/page.tsx`: CNA 랜딩 → 본 서비스 화면 교체 (위치 → 도보 5/10/15 필터 → 3카드 → 셔플, 빈결과 처리).
- 검증: `tsc` 에러 0, `lint` 에러 0 (warning 6개는 Phase2/3 스텁 미사용 파라미터).

**현재 상태**
- **ROADMAP Phase 1 완료**: 더미데이터로 위치→3카드→셔플 흐름이 화면에서 동작.
- 미커밋 상태(사용자 push 예정). dev 서버 확인은 사용자 몫.
- AI(자연어 입력)·실데이터·persona는 아직 (Phase 2~3). `SituationInput`은 스텁.

**다음 할 것**
- Phase 2: `SituationInput` 연결 + `/api/recommend` + `lib/match.ts`(Claude 자연어→업종) + `persona.ts`.
- API 키 발급되면 Phase 3: `lib/sangwon.ts` 실연동.

## 2026-06-19 (오후) — Phase 0 스캐폴딩
**한 일**
- 코드맵 문서 `docs/STRUCTURE.md` 추가 (코드 안 읽고 파악하는 파일 색인).
- `create-next-app`으로 스캐폴딩: Next.js(App Router)+TS+Tailwind+ESLint, git 초기화됨.
- 뼈대 스텁 생성: `types/index.ts`(✅ 구현), `lib/*`·`components/*`·`app/api/recommend/route.ts`(🟡 스텁), `.env.example`.
- `npx tsc --noEmit` 통과(에러 0). STRUCTURE.md 상태 갱신.

**현재 상태**
- 빌드 가능한 빈 뼈대 완성. dev 서버 정상 구동 확인됨. 메인 화면(`app/page.tsx`)은 아직 CNA 기본 랜딩.
- 커밋 완료(뼈대+문서). 원격 연결: origin = https://github.com/DodamKing/matjib.git (**공개 레포**).
  push는 사용자가 직접 (`git push -u origin main`).
- `.gitignore`에 `!.env.example` 예외 추가(키 이름 파일은 커밋, 실제 키는 제외).
- 공공데이터 API 키: 여전히 미발급.
- 참고: create-next-app이 만든 기본 `AGENTS.md` 존재(정리 여부 추후 결정).

**다음 할 것**
- ROADMAP Phase 0 마무리: `lib/mock.ts`에 더미 식당 20~30개 채우기.
- ROADMAP Phase 1: `distance.ts`/`shuffle.ts` 구현 → LocationGate→CardDeck UX 연결.

## 2026-06-19 (오전)
**한 일**
- 기획서(PDF) 분석, 방향 토론.
- 핵심 결정 확정: Next.js+TS / 공공데이터 API 1차 소스 / 풀스택 MVP.
- 공공데이터 「반경내 상가업소 조회」 API 검증 — 반경·좌표·업종·상호명 제공 확인.
- 데이터 함정 발견·정리: 품질/평점 신호 없음 → "최적"=거리+업종+공정셔플 (DECISIONS D3).
- 문서 작성: CLAUDE.md, DECISIONS.md, ARCHITECTURE.md, MVP_SCOPE.md, ROADMAP.md, WORKLOG.md.

**현재 상태**
- 코드 없음. 기획/문서 단계 완료. git 미초기화.
- 공공데이터 API 키: 미발급 (나중에 발급 예정).

**다음 할 것**
- ROADMAP Phase 0: 프로젝트 세팅(Next.js 스캐폴딩 + git init + 더미데이터)부터 시작.
