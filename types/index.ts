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
