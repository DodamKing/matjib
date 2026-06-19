# 코드맵 (파일 색인)

> **목적: 코드를 다 읽지 않고 이 문서만으로 어디에 뭐가 있는지 파악한다.**
> 파일을 추가/이동/삭제하거나 책임이 바뀌면 **여기를 즉시 갱신**한다.
> 설계 의도는 `ARCHITECTURE.md`, 이 문서는 "현재 실제 파일이 뭘 하는지".

상태 표기: ✅ 구현됨 · 🟡 스텁/진행중 · ⬜ 미생성(예정)

## 앱 / 라우트
| 경로 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `app/layout.tsx` | ✅ | 루트 레이아웃, 폰트/전역 스타일 (CNA 기본) | `default` |
| `app/page.tsx` | 🟡 | 메인: 위치게이트 → 카드덱 (현재 CNA 기본 랜딩, 교체 예정) | `default` |
| `app/api/recommend/route.ts` | 🟡 | 핵심 API. 매칭→조회→셔플→3카드 반환 | `POST` |

## 컴포넌트 (`components/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `LocationGate.tsx` | 🟡 | 위치 동의 UI + geolocation 획득 | `LocationGate` |
| `Card.tsx` | 🟡 | 식당 카드 1개 (상호·업종·도보·길찾기) | `Card` |
| `CardDeck.tsx` | 🟡 | 카드 3개 + 셔플 버튼 (Zero-Scroll) | `CardDeck` |
| `SituationInput.tsx` | 🟡 | 자연어 상황 입력 | `SituationInput` |

## 라이브러리 (`lib/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `sangwon.ts` | 🟡 | 소상공인 「반경내 조회」 클라이언트 (D2) | `searchInRadius()` |
| `kakao.ts` | 🟡 | 카카오 로컬 길찾기 링크 보강, 선택적 (D4) | `enrichMapUrl()` |
| `match.ts` | 🟡 | Claude 자연어→업종 번역 (D5) | `matchCategory()`, `MatchResult` |
| `distance.ts` | 🟡 | 도보분↔미터 변환, 거리 계산 | `haversine()`, `walkMinutes()` |
| `shuffle.ts` | 🟡 | 공정 셔플 + 후보 풀 관리 (D3) | `pickThree()` |
| `persona.ts` | 🟡 | "AI 처방" 카피 생성 | `prescribe()` |
| `mock.ts` | 🟡 | 더미 식당 데이터 (Phase 1~2용, 비어있음) | `MOCK_RESTAURANTS` |

## 타입 (`types/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `index.ts` | ✅ | 공유 타입 | `Restaurant`, `RecommendRequest`, `RecommendResponse`, `WalkRadius` |

## 설정 파일
| 파일 | 용도 |
|---|---|
| `.env.local` | 실제 키 (커밋 금지) |
| `.env.example` | 키 이름만 (커밋) |
| `next.config.ts` / `tailwind.config.ts` / `tsconfig.json` | 프레임워크 설정 |
