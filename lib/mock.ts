// 더미 식당 데이터 (Phase 1~2, API 키 발급 전 UX 개발용).
// 강남역(37.4979, 127.0276) 주변에 ~90m ~ 1.4km로 분산 배치.
import type { RestaurantSource } from "@/types";

/** 위치 동의를 안 할 때 둘러보기용 기준 좌표 (강남역). */
export const MOCK_CENTER = { lat: 37.4979, lng: 127.0276 };

export const MOCK_RESTAURANTS: RestaurantSource[] = [
  { id: "m01", name: "우리집김치찌개", category: "한식·백반", lat: 37.4985, lng: 127.0282, address: "서울 강남구 테헤란로 101" },
  { id: "m02", name: "강남손칼국수", category: "칼국수", lat: 37.4972, lng: 127.027, address: "서울 강남구 강남대로 98" },
  { id: "m03", name: "종로국밥", category: "국밥", lat: 37.499, lng: 127.0269, address: "서울 강남구 테헤란로 110" },
  { id: "m04", name: "김밥나라 강남점", category: "분식", lat: 37.4969, lng: 127.0288, address: "서울 강남구 역삼로 12" },
  { id: "m05", name: "행복돈가스", category: "돈가스", lat: 37.4995, lng: 127.029, address: "서울 강남구 테헤란로 130" },
  { id: "m06", name: "만리장성", category: "중식", lat: 37.496, lng: 127.0265, address: "서울 강남구 강남대로 80" },
  { id: "m07", name: "스시 오마카세", category: "초밥", lat: 37.5002, lng: 127.0276, address: "서울 강남구 테헤란로 140" },
  { id: "m08", name: "라멘 이찌방", category: "라멘", lat: 37.4958, lng: 127.029, address: "서울 강남구 역삼로 20" },
  { id: "m09", name: "파스타 공방", category: "양식·파스타", lat: 37.5005, lng: 127.0258, address: "서울 강남구 봉은사로 30" },
  { id: "m10", name: "버거 인 더 플레이스", category: "버거", lat: 37.495, lng: 127.0276, address: "서울 강남구 강남대로 60" },
  { id: "m11", name: "샐러디", category: "샐러드", lat: 37.498, lng: 127.031, address: "서울 강남구 역삼로 40" },
  { id: "m12", name: "청춘카페", category: "카페·브런치", lat: 37.501, lng: 127.0285, address: "서울 강남구 테헤란로 150" },
  { id: "m13", name: "깐부치킨", category: "치킨", lat: 37.4945, lng: 127.026, address: "서울 강남구 강남대로 50" },
  { id: "m14", name: "원조족발", category: "족발·보쌈", lat: 37.5015, lng: 127.027, address: "서울 강남구 테헤란로 160" },
  { id: "m15", name: "마포곱창", category: "곱창·구이", lat: 37.4955, lng: 127.031, address: "서울 강남구 역삼로 55" },
  { id: "m16", name: "손우동", category: "우동", lat: 37.5012, lng: 127.024, address: "서울 강남구 봉은사로 50" },
  { id: "m17", name: "호아빈", category: "쌀국수", lat: 37.494, lng: 127.029, address: "서울 강남구 역삼로 60" },
  { id: "m18", name: "라화쿵부", category: "마라탕", lat: 37.502, lng: 127.03, address: "서울 강남구 테헤란로 170" },
  { id: "m19", name: "코코카레", category: "카레", lat: 37.4935, lng: 127.025, address: "서울 강남구 강남대로 40" },
  { id: "m20", name: "전주비빔밥", category: "한식·비빔밥", lat: 37.5025, lng: 127.025, address: "서울 강남구 봉은사로 70" },
  { id: "m21", name: "평양냉면", category: "냉면", lat: 37.493, lng: 127.03, address: "서울 강남구 역삼로 80" },
  { id: "m22", name: "행운삼겹살", category: "삼겹살·구이", lat: 37.503, lng: 127.031, address: "서울 강남구 테헤란로 190" },
  { id: "m23", name: "노포해장국", category: "국밥·해장", lat: 37.492, lng: 127.024, address: "서울 강남구 강남대로 20" },
  { id: "m24", name: "시골보리밥", category: "한식·정식", lat: 37.504, lng: 127.022, address: "서울 강남구 봉은사로 90" },
  { id: "m25", name: "멀리국수", category: "칼국수", lat: 37.49, lng: 127.032, address: "서울 강남구 역삼로 110" },
  { id: "m26", name: "더먼분식", category: "분식", lat: 37.488, lng: 127.035, address: "서울 강남구 역삼로 140" },
];
