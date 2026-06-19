// Claude 자연어 → 음식 업종 번역 (DECISIONS D5). 맛 판단 아님, 분류 번역만.
// 모델 기본: claude-haiku-4-5. 키: ANTHROPIC_API_KEY (서버 전용).
// TODO(Phase 2): 구현.

export type MatchResult = {
  categoryCode?: string; // 음식 업종 소분류 코드
  keywords: string[];
};

export async function matchCategory(_query: string): Promise<MatchResult> {
  throw new Error("not implemented");
}
