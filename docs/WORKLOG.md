# 작업 로그

새 세션은 이 파일을 먼저 읽고 이어서 작업한다. 최신 항목이 맨 위.
형식: `## YYYY-MM-DD` 아래에 한 일 / 현재 상태 / 다음 할 것.

> 역할 구분: **DECISIONS** = 왜(결정·근거) / **ROADMAP** = 무엇을 어떤 순서로 / **WORKLOG** = 실제로 무엇을 했고 지금 어디까지.

---

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
