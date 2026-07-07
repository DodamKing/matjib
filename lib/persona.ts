// "AI 의사 처방" 카피. 템플릿 기반(LLM 미사용) — DECISIONS D5 개정.
import type { Restaurant } from "@/types";
import { SITUATION_TAGS } from "@/lib/tags";

const GENERIC_LINES = [
  "고민 그만하고 이 3곳 중에 고르세요.",
  "오늘의 처방전, 여기 3곳입니다.",
  "더 고민할 필요 없어요. 딱 3곳 처방했습니다.",
];

/** 카드 묶음에 붙일 처방 카피 문구 생성. 선택된 태그가 있으면 반영, 없으면 일반 문구. */
export function prescribe(_cards: Restaurant[], tagIds: string[] = []): string {
  const labels = tagIds
    .map((id) => SITUATION_TAGS.find((t) => t.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  if (labels.length === 0) {
    return GENERIC_LINES[Math.floor(Math.random() * GENERIC_LINES.length)];
  }
  return `"${labels.join(", ")}" 처방으로 3곳 골랐습니다.`;
}
