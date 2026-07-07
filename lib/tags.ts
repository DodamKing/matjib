// 상황 태그 → 업종 키워드 매핑 (DECISIONS D5 개정: LLM 대신 결정론적 태그).
// 8개 고정 세트 + "아무거나"(미선택). 커버리지보다 선택 속도 우선 — 안 걸리는 카테고리는
// 태그 미선택(전체 풀) 또는 셔플로 흡수한다.
import type { SituationTag } from "@/types";

export const SITUATION_TAGS: SituationTag[] = [
  { id: "hangover", label: "해장", keywords: ["국밥", "해장", "우동", "칼국수"] },
  { id: "hearty", label: "든든하게", keywords: ["삼겹살", "곱창", "족발", "보쌈", "정식"] },
  { id: "light", label: "가볍게", keywords: ["샐러드", "분식", "카페", "브런치"] },
  { id: "spicy", label: "매콤하게", keywords: ["마라탕", "찜", "짬뽕"] },
  { id: "soup", label: "뜨끈한 국물", keywords: ["국밥", "우동", "칼국수", "쌀국수", "라멘"] },
  { id: "global", label: "이국음식", keywords: ["중식", "라멘", "쌀국수", "카레", "초밥"] },
  { id: "date", label: "분위기 있게", keywords: ["초밥", "양식", "파스타", "브런치"] },
  { id: "quick", label: "빠르게 한끼", keywords: ["분식", "버거", "김밥", "돈가스"] },
];
