# 코드맵 (파일 색인)

> **목적: 코드를 다 읽지 않고 이 문서만으로 어디에 뭐가 있는지 파악한다.**
> 파일을 추가/이동/삭제하거나 책임이 바뀌면 **여기를 즉시 갱신**한다.
> 설계 의도는 `ARCHITECTURE.md`, 이 문서는 "현재 실제 파일이 뭘 하는지".

상태 표기: ✅ 구현됨 · 🟡 스텁/진행중 · ⬜ 미생성(예정)

## 앱 / 라우트
| 경로 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `app/layout.tsx` | ✅ | 루트 레이아웃, 메타데이터(타이틀/설명), 폰트/전역 스타일 | `default`, `metadata` |
| `app/page.tsx` | ✅ | 메인: 위치게이트 → 모드(밥집/카페/술집) → 태그선택 → 도보필터 → 카드덱 → 셔플. `/api/recommend` fetch + 로딩/에러 상태 (실데이터) | `default` |
| `app/api/recommend/route.ts` | ✅ | 핵심 API(Edge/서울). 반경조회→모드필터→태그필터→거리순 상위20→3카드+풀. 키는 여기서만 | `POST` |
| `app/icon.svg` | ✅ | 파비콘 — 3카드 팬 모양 마크 (오렌지 톤) | — |
| `app/opengraph-image.tsx` | ✅ | 공유 링크 미리보기 이미지 생성 (og:image/twitter:image 자동 연결) | `default` |

## 컴포넌트 (`components/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `LocationGate.tsx` | ✅ | 위치 동의 UI + geolocation 획득, 거부/에러 상태 구분 (+강남역 둘러보기 fallback) | `LocationGate` |
| `Card.tsx` | ✅ | 식당 카드 1개 (상호·업종·도보·길찾기) | `Card` |
| `CardDeck.tsx` | ✅ | 카드 3개 + 셔플 버튼 (Zero-Scroll) | `CardDeck` |
| `SituationInput.tsx` | ✅ | 상황 태그 다중 선택 칩 UI — 태그 세트는 부모가 모드별로 주입 (D5/D10) | `SituationInput` |

## 라이브러리 (`lib/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `sangwon.ts` | ✅ | 소상공인 sdsc2 「반경내 조회」 실연동, 음식(I2) 필터·필드매핑 (D2) | `searchInRadius()` |
| `kakao.ts` | 🟡 | 카카오 로컬 길찾기 링크 보강, 선택적 (D4) | `enrichMapUrl()` |
| `modes.ts` | ✅ | 검색 모드(밥집/카페/술집) 정의 — 소분류 카테고리 집합 + 모드별 태그 (D10) | `MODES`, `MODE_LIST`, `resolveMode()`, `ModeId` |
| `tags.ts` | ✅ | 모드별 상황 태그 세트 + 키워드 매핑 (D5/D10) | `MEAL_TAGS`, `CAFE_TAGS`, `BAR_TAGS` |
| `match.ts` | ✅ | 태그 키워드 → 업종 필터링(모드 태그셋 인자로 받음), LLM 미사용 (D5) | `filterByTags()` |
| `distance.ts` | ✅ | 도보분↔미터 변환, 거리 계산 | `haversine()`, `walkMinutes()` |
| `shuffle.ts` | ✅ | 후보 풀 구성 + 공정 셔플 (D3) | `buildPool()`, `pickThree()` |
| `mock.ts` | ✅ | 더미 식당 26개 — **제품 런타임 미사용(개발/오프라인용)**. `MOCK_CENTER`(강남역)만 위치거부 폴백 좌표로 실사용 | `MOCK_RESTAURANTS`, `MOCK_CENTER` |

## 타입 (`types/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `index.ts` | ✅ | 공유 타입 | `Restaurant`, `RestaurantSource`, `SituationTag`, `RecommendRequest`, `RecommendResponse`, `WalkRadius` |

## 설정 파일
| 파일 | 용도 |
|---|---|
| `.env.local` | 실제 키 (커밋 금지) |
| `.env.example` | 키 이름만 (커밋) |
| `next.config.ts` / `tailwind.config.ts` / `tsconfig.json` | 프레임워크 설정 |
