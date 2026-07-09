// 핵심 API: 반경 조회 → 태그 필터 → 거리순 상위 N → 공정 셔플 → 3카드 반환.
// 흐름 상세: docs/ARCHITECTURE.md. 키는 전부 이 서버 레이어에서만 사용 (보안규칙).
import { NextResponse } from "next/server";
import type { RecommendRequest, RecommendResponse, WalkRadius } from "@/types";
import { searchInRadius } from "@/lib/sangwon";
import { buildPool, pickThree } from "@/lib/shuffle";
import { filterByTags } from "@/lib/match";
import { resolveMode } from "@/lib/modes";

// Edge 런타임: V8 아이솔레이트라 콜드스타트 ~ms (fetch+순수로직뿐, Node 전용 API 미사용).
export const runtime = "edge";
// 서울 리전: 한국 유저 + 공공데이터 API(apis.data.go.kr) 양쪽에 가까워 왕복 지연 최소.
export const preferredRegion = ["icn1"];

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

  const { lat, lng, radius, mode, tags = [] } = body;
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

  const selectedMode = resolveMode(mode);

  try {
    const sources = await searchInRadius({ lat, lng, radius: radius as WalkRadius });
    // buildPool: 반경 재확인 + walkMin + 거리순 → 모드(밥집/카페/술집)로 업종 분리 → 태그 키워드 필터.
    const byDistance = buildPool(sources, lat, lng, radius as WalkRadius).filter(
      (r) => selectedMode.match(r.category),
    );
    const pool = filterByTags(byDistance, tags, selectedMode.tags).slice(0, POOL_CAP);

    const res: RecommendResponse = { cards: pickThree(pool), pool };
    return NextResponse.json(res);
  } catch (e) {
    console.error("[/api/recommend]", e);
    return NextResponse.json({ error: "추천 조회 실패" }, { status: 502 });
  }
}
