# 아키텍처

## 데이터 흐름 (한 장 요약)

```
[브라우저 — Phase 1~2는 전부 클라이언트에서 처리, 서버 호출 없음]
  1. navigator.geolocation → { lat, lng }
  2. (선택) 상황 태그 다중 선택: 해장/든든하게/가볍게/... (lib/tags.ts, D5)
  3. 도보시간 선택: 5분(300m) / 10분(600m) / 15분(1km)
  4. buildPool(): 반경 내 후보 + walkMin 계산 (lib/shuffle.ts, D3)
  5. filterByTags(): 선택 태그 키워드로 category 필터, 미선택/미매칭 시 원본 풀 (lib/match.ts, D5)
  6. pickThree(): 공정 셔플로 3개 선정 (품질 랭킹 X — DECISIONS D3)
  7. prescribe(): 템플릿 기반 "AI 처방" 카피 (lib/persona.ts, D5)
        ▼
  8. 3개 카드 렌더 (Zero-Scroll)
  9. [셔플] → 같은 풀에서 새 3개 재추첨

[Next.js API Route — Phase 3부터 사용 (실데이터 조회, 키 은닉 필요할 때)]
  POST /api/recommend { lat, lng, radius, tags? }
  → 소상공인 「반경내 상가업소 조회」 호출 (radius, cx=lng, cy=lat, indsLclsCd=음식)
  → (선택) 상호명+좌표 → 카카오 로컬로 길찾기 링크 보강 (실패 시 생략)
  → 응답: { cards: [3], poolToken }
```

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
type RecommendResponse = { cards: Restaurant[]; /* len 3 */ poolToken: string };
```
