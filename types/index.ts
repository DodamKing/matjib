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

export type SituationTag = {
  id: string;
  label: string; // 칩 UI에 표시할 이름
  keywords: string[]; // Restaurant.category 매칭용 키워드
};

export type RecommendRequest = {
  lat: number;
  lng: number;
  radius: WalkRadius;
  mode?: "meal" | "cafe" | "bar"; // 검색 모드 (D10). 미지정 시 밥집
  tags?: string[]; // 선택된 상황 태그 id들 (D5: 태그 매칭, LLM 미사용)
};

export type RecommendResponse = {
  cards: Restaurant[]; // 항상 최대 3개 (Zero-Scroll)
  pool: Restaurant[]; // 셔플 재추첨용 후보 풀 (거리순, 상위 N개). 클라가 로컬 pickThree로 셔플.
};
