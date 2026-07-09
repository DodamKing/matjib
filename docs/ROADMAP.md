# 구현 로드맵

빌드 순서. API 키 발급 전이므로 **더미데이터로 UX부터 완성 → 키 나오면 실연동 교체** 전략.
각 Phase 완료 시 `WORKLOG.md`에 기록.

## Phase 0 — 프로젝트 세팅
- [x] Next.js(App Router) + TypeScript + Tailwind 스캐폴딩
- [x] `git init`, `.gitignore`, `.env.example`
- [x] `docs/ARCHITECTURE.md`의 폴더 뼈대 생성 (빈 파일/스텁)
- [x] 더미 식당 데이터 (`lib/mock.ts`) — 좌표·업종 포함 20~30개

## Phase 1 — UX 뼈대 (더미데이터, API 불필요)
- [x] `LocationGate`: 위치 동의 화면 → geolocation 획득
- [x] 도보 필터 5/10/15분 토글
- [x] `Card` + `CardDeck`: 카드 3개 풀스크린, Zero-Scroll
- [x] 셔플: 후보 풀에서 새 3개 재추첨 (`shuffle.ts`)
- [x] 거리/도보시간 계산 (`distance.ts`)
- [x] 모바일 반응형 + 미니멀 스타일

## Phase 2 — 상황 태그 매칭 (LLM 미사용, D5 개정)
- [x] `tags.ts`: 상황 태그 8개 + 키워드 매핑
- [x] `SituationInput`: 태그 다중 선택 칩 UI
- [x] `match.ts`: 태그 키워드 → `Restaurant.category` 필터링 (`filterByTags`)
- [x] `persona.ts`: 템플릿 기반 "AI 처방" 카피 생성
- [x] `app/page.tsx`: 태그 선택 → 필터 → 3개 카드 흐름 연결 (클라이언트 전용, API route 불필요)

## Phase 3 — 실데이터 연동 (키 발급 후)
- [x] data.go.kr API 키 발급 + `.env.local` 설정 (2026-07-09, 실 API 검증)
- [x] `sangwon.ts`: sdsc2 「반경내 상가업소 조회」 실연동 (음식=I2 필터) → 더미 교체
- [x] `/api/recommend` 서버 오케스트레이션: 조회→태그필터→거리순 상위20→3카드+풀 (D9)
- [x] `app/page.tsx`: 클라 mock 처리 → `/api/recommend` fetch(로딩/에러 상태)로 전환
- [x] `tags.ts` 키워드를 실제 sdsc2 소분류명에 맞게 튜닝
- [ ] (선택) `kakao.ts`: 상호명+좌표 → 길찾기 링크 보강 (fallback)

## Phase 4 — 마감 (Vercel 배포 전까지 진행 중, D8: Phase 3보다 먼저 착수)
- [x] 파비콘 + 공유(OG) 미리보기 이미지 (2026-07-07, 조기 완료)
- [x] 상태 처리: 로딩 / 위치거부·에러 구분 / 결과없음(반경 확대 제안) — `LocationGate`·`app/page.tsx`
- [x] 런타임 로깅 정책 결정: console만, 외부 모니터링 미도입 (DECISIONS D7)
- [ ] Vercel 배포 — **보류 중, 사용자 지시 시 진행** (배포 시 `metadataBase`를 실제 도메인으로 채울 것)

## 화면/상태 (UX 명세 초안)
- **위치 게이트**: "위치 동의" 한 버튼. 거부 시 안내 + 재시도.
- **로딩**: "처방전 작성 중..." (페르소나 톤)
- **결과(정상)**: 카드 3개 + [셔플] 버튼. 각 카드 = 상호명·업종·도보시간·길찾기.
- **결과 없음**: "반경 안에 후보가 없어요" → 도보시간 확대 제안.
