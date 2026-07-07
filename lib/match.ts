// 상황 태그 → 업종 필터링 (DECISIONS D5 개정). LLM 없이 키워드 포함 매칭만 한다.
import type { Restaurant } from "@/types";
import { SITUATION_TAGS } from "@/lib/tags";

/** 선택된 태그의 키워드로 후보를 좁힌다. 태그 미선택이거나 매칭 결과가 없으면 원본 풀 그대로 반환. */
export function filterByTags(pool: Restaurant[], tagIds: string[]): Restaurant[] {
  if (tagIds.length === 0) return pool;

  const keywords = tagIds.flatMap(
    (id) => SITUATION_TAGS.find((t) => t.id === id)?.keywords ?? [],
  );
  if (keywords.length === 0) return pool;

  const filtered = pool.filter((r) => keywords.some((k) => r.category.includes(k)));
  return filtered.length > 0 ? filtered : pool;
}
