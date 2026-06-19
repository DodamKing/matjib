// 핵심 API: 매칭 → 반경 조회 → 공정 셔플 → 3카드 반환.
// 흐름 상세: docs/ARCHITECTURE.md. 키는 전부 이 서버 레이어에서만 사용.
// TODO(Phase 2): 오케스트레이션 구현.
import { NextResponse } from "next/server";
import type { RecommendResponse } from "@/types";

export async function POST(_req: Request) {
  const body: RecommendResponse = { cards: [], poolToken: "" };
  return NextResponse.json(body);
}
