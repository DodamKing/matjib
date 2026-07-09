// 검색 모드: 밥집 / 카페 / 술집 (2026-07-09, DECISIONS D10).
// 공공데이터 음식 대분류(I2) 안에 카페·주점이 섞여 있어(카페=비알코올, 주점=술집),
// 소분류명으로 3모드를 가른다. 기본=밥집(원클릭 유지).
import type { SituationTag } from "@/types";
import { MEAL_TAGS, CAFE_TAGS, BAR_TAGS } from "@/lib/tags";

export type ModeId = "meal" | "cafe" | "bar";

// 소분류명(category)으로 카페/술집을 특정. 나머지 전부 = 밥집.
const CAFE_CATS = ["카페", "빵/도넛", "아이스크림/빙수"];
const BAR_CATS = ["무도 유흥 주점", "생맥주 전문", "요리 주점", "일반 유흥 주점"];

function isCafe(category: string): boolean {
  return CAFE_CATS.includes(category);
}
function isBar(category: string): boolean {
  return BAR_CATS.includes(category);
}

export type Mode = {
  id: ModeId;
  label: string;
  emoji: string;
  /** 이 소분류가 해당 모드에 속하는지 */
  match: (category: string) => boolean;
  tags: SituationTag[];
};

export const MODES: Record<ModeId, Mode> = {
  meal: {
    id: "meal",
    label: "밥집",
    emoji: "🍚",
    match: (c) => !isCafe(c) && !isBar(c),
    tags: MEAL_TAGS,
  },
  cafe: {
    id: "cafe",
    label: "카페",
    emoji: "☕",
    match: isCafe,
    tags: CAFE_TAGS,
  },
  bar: {
    id: "bar",
    label: "술집",
    emoji: "🍺",
    match: isBar,
    tags: BAR_TAGS,
  },
};

export const MODE_LIST: Mode[] = [MODES.meal, MODES.cafe, MODES.bar];

/** 안전한 모드 조회 (미지정/이상값이면 밥집). */
export function resolveMode(id?: string): Mode {
  return (id && MODES[id as ModeId]) || MODES.meal;
}
