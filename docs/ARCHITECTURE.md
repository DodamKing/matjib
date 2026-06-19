# 아키텍처

## 데이터 흐름 (한 장 요약)

```
[브라우저]
  1. navigator.geolocation → { lat, lng }
  2. (선택) 자연어 입력: "비 오는데 뜨끈한 면 요리"
  3. 도보시간 선택: 5분(300m) / 10분(600m) / 15분(1km)
        │  POST /api/recommend { lat, lng, radius, query? }
        ▼
[Next.js API Route  (키는 여기서만 사용)]
  4. query 있으면 → Claude(Haiku) : 자연어 → 음식 업종 소분류 코드 + 키워드
  5. 소상공인 「반경내 상가업소 조회」 호출 (radius, cx=lng, cy=lat, indsLclsCd=음식)
  6. 업종 적합도 필터 → 후보 풀(pool) 구성
  7. 공정 셔플로 3개 선정 (품질 랭킹 X — DECISIONS D3)
  8. (선택) 상호명+좌표 → 카카오 로컬로 길찾기 링크 보강 (실패 시 생략)
        │  응답: { cards: [3], poolToken }
        ▼
[브라우저]
  9. 3개 카드 렌더 (Zero-Scroll)
 10. [셔플] → 같은 풀에서 새 3개 재추첨 (필요 시 재요청)
```

## 폴더 구조 (예정)

```
/app
  layout.tsx
  page.tsx                  # 메인: 위치게이트 → 카드 3개
  /api
    /recommend/route.ts     # 핵심 오케스트레이션 (4~8단계)
/components
  LocationGate.tsx          # 위치 동의 UI
  Card.tsx                  # 식당 카드 1개
  CardDeck.tsx              # 카드 3개 + 셔플 버튼
  SituationInput.tsx        # 자연어 입력
/lib
  sangwon.ts                # 소상공인 API 클라이언트 (D2)
  kakao.ts                  # 카카오 로컬 보강 (D4, 선택적)
  match.ts                  # Claude 자연어→업종 번역 (D5)
  distance.ts               # 도보분 ↔ 미터 변환, 거리 계산
  shuffle.ts                # 공정 셔플 + 풀 관리 (D3)
  persona.ts                # "AI 처방" 카피 생성
/types
  index.ts                  # Restaurant, RecommendRequest/Response 등
```

## 환경 변수 (.env.local — 커밋 금지)

```
SANGWON_API_KEY=        # 공공데이터포털 인증키
ANTHROPIC_API_KEY=      # Claude API
KAKAO_REST_API_KEY=     # 카카오 로컬 (선택)
```
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

type RecommendRequest = { lat: number; lng: number; radius: 300|600|1000; query?: string };
type RecommendResponse = { cards: Restaurant[]; /* len 3 */ poolToken: string };
```
