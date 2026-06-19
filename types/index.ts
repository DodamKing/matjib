// 공유 타입. 상세는 docs/ARCHITECTURE.md 참조.

export type WalkRadius = 300 | 600 | 1000; // 도보 5/10/15분

export type Restaurant = {
  id: string; // 상가업소번호
  name: string; // 상호명
  category: string; // 상권업종(소분류명)
  lat: number;
  lng: number;
  address: string;
  walkMin: number; // 계산된 도보 시간(분)
  mapUrl?: string; // 카카오 보강 시 길찾기 링크 (D4)
};

// 원천 데이터(공공데이터/더미)는 walkMin·mapUrl이 없다 — 사용자 위치 기준으로 런타임 계산.
export type RestaurantSource = Omit<Restaurant, "walkMin" | "mapUrl">;

export type RecommendRequest = {
  lat: number;
  lng: number;
  radius: WalkRadius;
  query?: string; // 자연어 상황 입력
};

export type RecommendResponse = {
  cards: Restaurant[]; // 항상 길이 3 (Zero-Scroll)
  poolToken: string; // 셔플용 후보 풀 식별자
};
