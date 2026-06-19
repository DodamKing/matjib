# 구현 로드맵

빌드 순서. API 키 발급 전이므로 **더미데이터로 UX부터 완성 → 키 나오면 실연동 교체** 전략.
각 Phase 완료 시 `WORKLOG.md`에 기록.

## Phase 0 — 프로젝트 세팅
- [ ] Next.js(App Router) + TypeScript + Tailwind 스캐폴딩
- [ ] `git init`, `.gitignore`, `.env.example`
- [ ] `docs/ARCHITECTURE.md`의 폴더 뼈대 생성 (빈 파일/스텁)
- [ ] 더미 식당 데이터 (`lib/mock.ts`) — 좌표·업종 포함 20~30개

## Phase 1 — UX 뼈대 (더미데이터, API 불필요)
- [ ] `LocationGate`: 위치 동의 화면 → geolocation 획득
- [ ] 도보 필터 5/10/15분 토글
- [ ] `Card` + `CardDeck`: 카드 3개 풀스크린, Zero-Scroll
- [ ] 셔플: 후보 풀에서 새 3개 재추첨 (`shuffle.ts`)
- [ ] 거리/도보시간 계산 (`distance.ts`)
- [ ] 모바일 반응형 + 미니멀 스타일

## Phase 2 — AI 매칭
- [ ] `SituationInput`: 자연어 입력 UI
- [ ] `match.ts`: Claude(Haiku) 자연어 → 음식 업종 소분류 코드/키워드
- [ ] `/api/recommend`: 매칭 → 더미 필터 → 3개 반환 오케스트레이션
- [ ] `persona.ts`: "AI 처방" 카피 생성

## Phase 3 — 실데이터 연동 (키 발급 후)
- [ ] data.go.kr API 키 발급 + `.env.local` 설정
- [ ] `sangwon.ts`: 「반경내 상가업소 조회」 실연동 → 더미 교체
- [ ] (선택) `kakao.ts`: 상호명+좌표 → 길찾기 링크 보강 (fallback)

## Phase 4 — 마감
- [ ] 상태 처리: 로딩 / 위치거부 / 결과없음(반경 확대 제안) / 에러
- [ ] (필요 시) 런타임 로깅 정책 결정
- [ ] Vercel 배포

## 화면/상태 (UX 명세 초안)
- **위치 게이트**: "위치 동의" 한 버튼. 거부 시 안내 + 재시도.
- **로딩**: "처방전 작성 중..." (페르소나 톤)
- **결과(정상)**: 카드 3개 + [셔플] 버튼. 각 카드 = 상호명·업종·도보시간·길찾기.
- **결과 없음**: "반경 안에 후보가 없어요" → 도보시간 확대 제안.
