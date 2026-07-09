// 상황 태그 → 업종 키워드 매핑 (DECISIONS D5 개정: LLM 대신 결정론적 태그).
// 모드별(밥집/카페/술집) 태그 세트. 커버리지보다 선택 속도 우선 — 안 걸리는 카테고리는
// 태그 미선택(전체 풀) 또는 셔플로 흡수한다.
//
// keywords는 sdsc2 「상권업종 소분류명」에 대한 부분일치(substring) 대상 (2026-07-09 실 API로 튜닝).
// 예: "구이" → 돼지/소/닭·오리/곱창/해산물 구이·찜, "국수" → 국수/칼국수. 너무 넓은 키(예: "국")는
// 다른 업종(중국집)까지 걸리므로 피한다.
import type { SituationTag } from "@/types";

// 밥집 모드 태그 (카페는 별도 모드로 분리돼 '가볍게'에서 카페 키워드 제거).
export const MEAL_TAGS: SituationTag[] = [
  { id: "hangover", label: "해장", keywords: ["국/탕", "국수"] },
  { id: "hearty", label: "든든하게", keywords: ["구이", "족발", "보쌈", "백반", "곱창"] },
  { id: "light", label: "가볍게", keywords: ["분식", "샌드위치", "샐러드", "토스트"] },
  { id: "spicy", label: "매콤하게", keywords: ["마라", "중국집"] },
  { id: "soup", label: "뜨끈한 국물", keywords: ["국/탕", "국수", "면 요리", "베트남"] },
  { id: "global", label: "이국음식", keywords: ["중국집", "마라", "일식", "베트남", "동남아", "외국식", "파스타", "경양식"] },
  { id: "date", label: "분위기 있게", keywords: ["파스타", "스테이크", "초밥", "경양식", "횟집"] },
  { id: "quick", label: "빠르게 한끼", keywords: ["분식", "김밥", "버거", "돈가스", "토스트", "피자"] },
];

// 카페 모드 태그 (소분류: 카페 / 빵·도넛 / 아이스크림·빙수).
export const CAFE_TAGS: SituationTag[] = [
  { id: "coffee", label: "커피 한잔", keywords: ["카페"] },
  { id: "bakery", label: "베이커리", keywords: ["빵"] },
  { id: "dessert", label: "디저트", keywords: ["아이스크림", "빙수"] },
];

// 술집 모드 태그 (소분류: 생맥주 / 요리 주점 / 유흥 주점).
export const BAR_TAGS: SituationTag[] = [
  { id: "beer", label: "맥주 한잔", keywords: ["생맥주"] },
  { id: "anju", label: "안주에 한잔", keywords: ["요리 주점"] },
  { id: "party", label: "제대로 한잔", keywords: ["유흥"] },
];
