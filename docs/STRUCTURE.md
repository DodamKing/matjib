# 코드맵 (파일 색인)

> **목적: 코드를 다 읽지 않고 이 문서만으로 어디에 뭐가 있는지 파악한다.**
> 파일을 추가/이동/삭제하거나 책임이 바뀌면 **여기를 즉시 갱신**한다.
> 설계 의도는 `ARCHITECTURE.md`, 이 문서는 "현재 실제 파일이 뭘 하는지".

상태 표기: ✅ 구현됨 · 🟡 스텁/진행중 · ⬜ 미생성(예정)

## 앱 / 라우트
| 경로 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `app/layout.tsx` | ✅ | 루트 레이아웃 + 메타데이터. `metadataBase`/canonical/OG/twitter를 `SITE_URL`→`VERCEL_PROJECT_PRODUCTION_URL`→localhost 순으로 해석(프로토콜 자동 보강). 폰트/전역 스타일 | `default`, `metadata` |
| `app/page.tsx` | ✅ | 메인. 큰 헤더 상단 → **카드덱+셔플+공유(화면 위, 한 뷰에)** → 조정(모드/도보/상황태그) 데크 아래로 (D20/B). 위치 전엔 헤더+게이트. `/api/recommend` fetch, `openPlace`→`PlaceSheet`(D11). 공유 복사 폴백(D20) | `default` |
| `app/share/[rx]/page.tsx` | ✅ | 공유 처방전 뷰(서버) — URL의 3곳 재현(읽기전용)+길찾기+"나도 받기" CTA. OG 제목/설명에 상호명, `noindex` (D17) | `default`, `generateMetadata` |
| `app/share/[rx]/opengraph-image.tsx` | ✅ | 공유 링크 OG 이미지 — 3곳 카드 1200×630(한글 폰트 `ogFont`) = 카톡/SNS 미리보기 훅 (D17) | `default` |
| `app/api/recommend/route.ts` | ✅ | 핵심 API(Edge/서울). 반경조회→모드필터→태그필터→거리순 상위20→3카드+풀. 키는 여기서만 | `POST` |
| `app/api/staticmap/route.ts` | ✅ | 시트 지도 미리보기 프록시 — NCP Static Map을 서버에서 호출해 이미지만 반환(키 서버전용). 키 없으면 501→클라 폴백 (D11) | `GET` |
| `app/icon.svg` | ✅ | 파비콘 — 3카드 팬 모양 마크 (오렌지 톤) | — |
| `app/opengraph-image.tsx` | ✅ | 공유 링크 미리보기 이미지 생성 (og:image/twitter:image 자동 연결) | `default` |

## 컴포넌트 (`components/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `LocationGate.tsx` | ✅ | 위치 동의 UI + geolocation 획득, 거부/에러 상태 구분 (+강남역 둘러보기 fallback) | `LocationGate` |
| `Card.tsx` | ✅ | 식당 카드 1개 (상호·업종·도보). 길찾기 버튼은 외부링크 대신 `onOpen(r)`로 상세 시트 열기 (D11) | `Card` |
| `CardDeck.tsx` | ✅ | 카드 3개 + 셔플 버튼 (Zero-Scroll). 셔플/새 결과 시 `pool` 슬롯머신 롤→순차 정지 애니메이션, reduced-motion 대응 (D19) | `CardDeck` |
| `PlaceSheet.tsx` | ✅ | 장소 상세 바텀시트 — 길찾기를 앱 내부에서 감쌈. 지도 미리보기(NCP 실지도 우선, 실패 시 방향·거리 로케이터 폴백)+출발/도착 범례+지도탭→인터랙티브(D12)+주소복사+내비앱 선택 (D11) | `PlaceSheet` |
| `MapModal.tsx` | ✅ | 전체화면 인터랙티브 지도 — NAVER Web Dynamic Map(핀줌·이동), 시트 썸네일 탭 시 열림. 클라 JS 키(도메인제한), authFailure/키없음 시 안내 (D12) | `MapModal` |
| `SituationInput.tsx` | ✅ | 상황 태그 다중 선택 칩 UI — 태그 세트는 부모가 모드별로 주입 (D5/D10) | `SituationInput` |

## 라이브러리 (`lib/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `sangwon.ts` | ✅ | 소상공인 sdsc2 「반경내 조회」 실연동, 음식(I2) 필터·필드매핑 (D2) | `searchInRadius()` |
| `navlinks.ts` | ✅ | 내비앱 길찾기 딥링크 빌더(카카오맵·네이버지도, 키 불필요). 티맵 제외(도보 서비스) (D11) | `NAV_APPS`, `NavApp` |
| `kakao.ts` | 🟡 | 카카오 로컬 길찾기 링크 보강, 선택적 (D4). ※D11의 링크 UX 감싸기와는 별개 | `enrichMapUrl()` |
| `modes.ts` | ✅ | 검색 모드(밥집/카페/술집) 정의 — 소분류 카테고리 집합 + 모드별 태그 (D10) | `MODES`, `MODE_LIST`, `resolveMode()`, `ModeId` |
| `tags.ts` | ✅ | 모드별 상황 태그 세트 + 키워드 매핑 (D5/D10) | `MEAL_TAGS`, `CAFE_TAGS`, `BAR_TAGS` |
| `match.ts` | ✅ | 태그 키워드 → 업종 필터링(모드 태그셋 인자로 받음), LLM 미사용 (D5) | `filterByTags()` |
| `distance.ts` | ✅ | 도보분↔미터 변환, 거리 계산 + 방위(미니 로케이터용, D11) | `haversine()`, `walkMinutes()`, `bearingDeg()`, `compass8()` |
| `walkBands.ts` | ✅ | 도보 밴드(구간) 단일 원천 — 5/10/15분 겹치지 않는 구간 정의·필터 (D14) | `WALK_BANDS`, `DEFAULT_BAND`, `resolveBand()`, `inBand()`, `WalkBandDef` |
| `useHistoryDismiss.ts` | ✅ | 오버레이(시트/지도) 브라우저 히스토리 연동 — 폰 뒤로가기=오버레이만 닫기, 중첩·StrictMode 안전 (D16) | `useHistoryDismiss()` |
| `shareLink.ts` | ✅ | 처방전 공유 링크 — 3곳을 URL(base64url)에 인코딩/디코딩, 저장소 없음 (D17) | `encodeRx()`, `decodeRx()`, `cardsToRx()`, `rxToRestaurants()` |
| `ogFont.ts` | ✅ | OG 이미지용 한글 폰트(Pretendard OTF) 런타임 로더+캐시 — satori 한글 렌더 (D17) | `loadKoreanFont()` |
| `shuffle.ts` | ✅ | 후보 풀 구성(밴드 구간 필터) + 밴드 내 공정 랜덤 추첨 (D3/D14/D15) | `buildPool()`, `sample()`, `pickThree()` |
| `mock.ts` | ✅ | 더미 식당 26개 — **제품 런타임 미사용(개발/오프라인용)**. `MOCK_CENTER`(강남역)만 위치거부 폴백 좌표로 실사용 | `MOCK_RESTAURANTS`, `MOCK_CENTER` |

## 타입 (`types/`)
| 파일 | 상태 | 책임 | 주요 export |
|---|---|---|---|
| `index.ts` | ✅ | 공유 타입 | `Restaurant`, `RestaurantSource`, `SituationTag`, `RecommendRequest`, `RecommendResponse`, `WalkBand` |

## 설정 파일
| 파일 | 용도 |
|---|---|
| `.env.local` | 실제 키 (커밋 금지): (선택)`SITE_URL`(커스텀 도메인=OG/canonical), `SANGWON_API_KEY`, (선택)`KAKAO_REST_API_KEY`, (선택)`NCP_MAP_CLIENT_ID`/`NCP_MAP_CLIENT_SECRET`(서버), (선택)`NEXT_PUBLIC_NCP_MAP_CLIENT_ID`(Dynamic Map 클라, D12) |
| `.env.example` | 키 이름만 (커밋) |
| `next.config.ts` | 프레임워크 설정 + `allowedDevOrigins`(핫스팟/사내망 IP로 모바일 dev 접속 허용, dev 전용) |
| `tailwind.config.ts` / `tsconfig.json` | 프레임워크 설정 |
