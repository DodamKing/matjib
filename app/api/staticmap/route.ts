// 장소 상세 시트 지도 미리보기 프록시 (DECISIONS D11).
// NCP Static Map을 서버에서 호출해 이미지 바이트만 반환 — 키는 서버에만 남는다 (D6).
// 키 미설정이면 501 → 클라(PlaceSheet)가 방향·거리 로케이터로 자동 폴백.
import type { NextRequest } from "next/server";

// Edge 런타임: fetch만 쓰므로 콜드스타트 최소화(첫 지도 로딩 지연 완화). 서울 리전으로 NCP 왕복 단축.
export const runtime = "edge";
export const preferredRegion = ["icn1"];

// NCP Maps 신 플랫폼 엔드포인트. 구 naveropenapi.apigw.ntruss.com은 신규 자격증명에 401 (2026 실측).
const ENDPOINT = "https://maps.apigw.ntruss.com/map-static/v2/raster";

function num(v: string | null): number | null {
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: NextRequest) {
  const id = process.env.NCP_MAP_CLIENT_ID;
  const secret = process.env.NCP_MAP_CLIENT_SECRET;
  // 키 없음 → 501(Not Implemented). 클라가 <img> onError로 받아 로케이터 폴백.
  if (!id || !secret) return new Response(null, { status: 501 });

  const sp = req.nextUrl.searchParams;
  const plat = num(sp.get("plat")); // 식당
  const plng = num(sp.get("plng"));
  const ulat = num(sp.get("ulat")); // 사용자(선택)
  const ulng = num(sp.get("ulng"));
  if (plat === null || plng === null) return new Response(null, { status: 400 });

  // 표시 크기(2x). NCP 최대 1024.
  const w = Math.min(1024, Math.max(1, num(sp.get("w")) ?? 600));
  const h = Math.min(1024, Math.max(1, num(sp.get("h")) ?? 320));

  // markers만 주면 두 점이 다 보이도록 자동 프레이밍. pos는 "경도 위도" 순.
  // ⚠️ NCP 신 Static Map은 type:e 마커를 403으로 거부 — 둘 다 type:d로(색상만 구분). (2026 실측)
  const markers = [`type:d|size:mid|color:0xf97316|pos:${plng} ${plat}`]; // 식당(주황)
  if (ulat !== null && ulng !== null) {
    markers.push(`type:d|size:mid|color:0x2563eb|pos:${ulng} ${ulat}`); // 내 위치(파랑)
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set("w", String(w));
  url.searchParams.set("h", String(h));
  url.searchParams.set("format", "png");
  url.searchParams.set("scale", "2");
  for (const m of markers) url.searchParams.append("markers", m);
  // 마커가 하나뿐(사용자 좌표 없음)이면 자동 프레이밍이 애매 → center/level 보강.
  if (markers.length === 1) {
    url.searchParams.set("center", `${plng},${plat}`);
    url.searchParams.set("level", "17");
  }

  try {
    const res = await fetch(url, {
      headers: {
        "x-ncp-apigw-api-key-id": id,
        "x-ncp-apigw-api-key": secret,
      },
    });
    if (!res.ok) {
      console.error("[staticmap] NCP 응답 실패:", res.status);
      return new Response(null, { status: 502 });
    }
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/png",
        // 같은 장소 재요청 절약. 좌표가 키라 안전.
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (e) {
    console.error("[staticmap] 프록시 예외:", e);
    return new Response(null, { status: 502 });
  }
}
