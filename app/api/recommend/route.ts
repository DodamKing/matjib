// 핵심 API: 반경 조회 → 태그 필터 → 거리순 상위 N → 공정 셔플 → 3카드 반환.
// 흐름 상세: docs/ARCHITECTURE.md. 키는 전부 이 서버 레이어에서만 사용 (보안규칙).
import { NextResponse } from "next/server";
import type { RecommendRequest, RecommendResponse, WalkRadius } from "@/types";
import { searchInRadius } from "@/lib/sangwon";
import { buildPool, pickThree } from "@/lib/shuffle";
import { filterByTags } from "@/lib/match";

// 셔플 재추첨 풀 상한 — 거리순 상위 N개만 클라로 반환(전부 "가까운" 곳 보장 + 페이로드 경량).
const POOL_CAP = 20;
const VALID_RADII: WalkRadius[] = [300, 600, 1000];

export async function POST(req: Request) {
  let body: Partial<RecommendRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const { lat, lng, radius, tags = [] } = body;
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !VALID_RADII.includes(radius as WalkRadius)
  ) {
    return NextResponse.json(
      { error: "lat/lng/radius가 유효하지 않습니다" },
      { status: 400 },
    );
  }

  try {
    const sources = await searchInRadius({ lat, lng, radius: radius as WalkRadius });
    // buildPool: 반경 재확인 + walkMin 부착 + 거리순 / filterByTags: 태그 키워드 필터.
    const pool = filterByTags(
      buildPool(sources, lat, lng, radius as WalkRadius),
      tags,
    ).slice(0, POOL_CAP);

    const res: RecommendResponse = { cards: pickThree(pool), pool };
    return NextResponse.json(res);
  } catch (e) {
    console.error("[/api/recommend]", e);
    return NextResponse.json({ error: "추천 조회 실패" }, { status: 502 });
  }
}
