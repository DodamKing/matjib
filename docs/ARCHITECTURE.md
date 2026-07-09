# 아키텍처

## 데이터 흐름 (한 장 요약)

```
[브라우저 — app/page.tsx]
  1. navigator.geolocation → { lat, lng }   (거부 시 MOCK_CENTER=강남역 좌표로 폴백, 이후 동일)
  2. (선택) 상황 태그 다중 선택: 해장/든든하게/가볍게/... (lib/tags.ts, D5)
  3. 도보시간 선택: 5분(300m) / 10분(600m) / 15분(1km)
  4. fetch POST /api/recommend { lat, lng, radius, tags }  → 로딩/에러 상태 처리
        ▼
  5. 응답 { cards:[≤3], pool:[≤20] } 수신 → 카드 3개 렌더 (Zero-Scroll)
  6. [셔플] → 재요청 없이 반환된 pool에서 로컬 pickThree()로 새 3개

[Next.js API Route — /api/recommend (실데이터 조회 + 키 은닉, DECISIONS D9)]
  POST { lat, lng, radius, tags? }
  → sangwon.searchInRadius: sdsc2 「반경내 상가업소 조회」 (radius, cx=lng, cy=lat, indsLclsCd=I2 음식)
  → buildPool(): 반경 재확인 + walkMin 계산, 거리순 정렬 (lib/shuffle.ts, D3)
  → filterByTags(): 선택 태그 키워드로 category(소분류명) 필터, 미선택/미매칭 시 원본 풀 (lib/match.ts, D5)
  → 거리순 상위 20개로 캡 → pickThree(): 공정 셔플 3개 (품질 랭킹 X — D3)
  → (선택, 미구현) 카카오 로컬로 길찾기 링크 보강
  → 응답: { cards: [≤3], pool: [≤20] }
```
> 키(SANGWON_API_KEY)는 이 API Route 서버에서만 사용 — 클라 번들 노출 금지 (D6).
> "AI 처방" 카피(lib/persona.ts)는 아직 화면 미연결 — 카드 UI는 상호·업종·도보·길찾기만 표시.

## 폴더 구조 (예정)

```
/app
  layout.tsx                # 루트 레이아웃 + 메타데이터(타이틀/설명)
  page.tsx                  # 메인: 위치게이트 → 카드 3개
  icon.svg                  # 파비콘 (3카드 팬 마크)
  opengraph-image.tsx       # 공유 미리보기 이미지 (og:image, next/og로 생성)
  /api
    /recommend/route.ts     # 핵심 오케스트레이션 (4~8단계)
/components
  LocationGate.tsx          # 위치 동의 UI
  Card.tsx                  # 식당 카드 1개
  CardDeck.tsx              # 카드 3개 + 셔플 버튼
  SituationInput.tsx        # 상황 태그 다중 선택 칩 UI (D5)
/lib
  sangwon.ts                # 소상공인 API 클라이언트 (D2)
  kakao.ts                  # 카카오 로컬 보강 (D4, 선택적)
  tags.ts                   # 상황 태그 8개 + 키워드 매핑 (D5)
  match.ts                  # 태그 키워드 → 업종 필터링 (D5, LLM 미사용)
  distance.ts               # 도보분 ↔ 미터 변환, 거리 계산
  shuffle.ts                # 공정 셔플 + 풀 관리 (D3)
  persona.ts                # 템플릿 기반 "AI 처방" 카피 생성 (D5)
/types
  index.ts                  # Restaurant, RecommendRequest/Response 등
```

## 환경 변수 (.env.local — 커밋 금지)

```
SANGWON_API_KEY=        # 공공데이터포털 인증키
KAKAO_REST_API_KEY=     # 카카오 로컬 (선택)
```
(Anthropic 키는 D5 개정으로 v1 스코프에서 제거 — 상황 매칭에 LLM을 쓰지 않음)
`.env.example`에 키 이름만 두고 커밋. 값은 절대 커밋하지 않음.

## 주요 타입 (초안)

```ts
type Restaurant = {
  id: string;            // 상가업소번호
  name: string;          // 상호명
  category: string;      // 상권업종(소분류명)
  lat: number; lng: number;
  address: string;
  walkMin: number;       // 계산된 도보 시간
  mapUrl?: string;       // 카카오 보강 시
};

type SituationTag = { id: string; label: string; keywords: string[] };
type RecommendRequest = { lat: number; lng: number; radius: 300|600|1000; tags?: string[] };
type RecommendResponse = { cards: Restaurant[]; /* ≤3 */ pool: Restaurant[]; /* ≤20, 셔플용 */ };
```
