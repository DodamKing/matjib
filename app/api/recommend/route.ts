// 핵심 API: 반경 조회 → 태그 필터 → 거리순 상위 N → 공정 셔플 → 3카드 반환.
// 흐름 상세: docs/ARCHITECTURE.md. 키는 전부 이 서버 레이어에서만 사용 (보안규칙).
import { NextResponse } from "next/server";
import type { RecommendRequest, RecommendResponse, WalkBand } from "@/types";
import { searchInRadius } from "@/lib/sangwon";
import { buildPool, pickThree, sample } from "@/lib/shuffle";
import { filterByTags } from "@/lib/match";
import { resolveMode } from "@/lib/modes";
import { resolveBand } from "@/lib/walkBands";
import { isInKorea } from "@/lib/distance";

// Edge 런타임: V8 아이솔레이트라 콜드스타트 ~ms (fetch+순수로직뿐, Node 전용 API 미사용).
export const runtime = "edge";
// 서울 리전: 한국 유저 + 공공데이터 API(apis.data.go.kr) 양쪽에 가까워 왕복 지연 최소.
export const preferredRegion = ["icn1"];

// 셔플 재추첨 풀 상한 — 밴드 내에서 공정 랜덤 N개를 클라로 반환(밴드가 거리 보장 + 페이로드 경량). D14.
const POOL_CAP = 20;
const VALID_BANDS: WalkBand[] = [5, 10, 15];

export async function POST(req: Request) {
  let body: Partial<RecommendRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const { lat, lng, band, mode, tags = [] } = body;
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !VALID_BANDS.includes(band as WalkBand)
  ) {
    return NextResponse.json(
      { error: "lat/lng/band가 유효하지 않습니다" },
      { status: 400 },
    );
  }

  // 국내 전용(공공데이터 상가정보) — 범위 밖 좌표는 조회해봐야 빈 결과라 키 쿼터만 태운다.
  if (!isInKorea(lat, lng)) {
    return NextResponse.json(
      { error: "서비스 지역(대한민국) 밖입니다" },
      { status: 400 },
    );
  }

  const selectedMode = resolveMode(mode);
  const bandDef = resolveBand(band);

  try {
    const sources = await searchInRadius({ lat, lng, radius: bandDef.radiusM });
    // buildPool: 밴드 구간(walkMin) 필터 → 모드(밥집/카페/술집)로 업종 분리 → 태그 키워드 필터.
    const inBand = buildPool(sources, lat, lng, bandDef).filter(
      (r) => selectedMode.match(r.category),
    );
    const tagged = filterByTags(inBand, tags, selectedMode.tags);
    // 가장 가까운 N이 아니라 밴드 내 "공정 랜덤 N" — 밀집지에서 1분만 반복되던 문제 해소 (D14).
    const pool = sample(tagged, POOL_CAP);

    const res: RecommendResponse = { cards: pickThree(pool), pool };
    return NextResponse.json(res);
  } catch (e) {
    console.error("[/api/recommend]", e);
    return NextResponse.json({ error: "추천 조회 실패" }, { status: 502 });
  }
}
