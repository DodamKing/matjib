// 장소 상세 시트 지도 미리보기 프록시 (DECISIONS D11).
// NCP Static Map을 서버에서 호출해 이미지 바이트만 반환 — 키는 서버에만 남는다 (D6).
// 키 미설정이면 501 → 클라(PlaceSheet)가 방향·거리 로케이터로 자동 폴백.
import type { NextRequest } from "next/server";
import { isInKorea } from "@/lib/distance";

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

/**
 * 다른 사이트에서 이 프록시를 지도 API처럼 갖다 쓰는 것(핫링크) 차단.
 * 한계를 알고 쓰는 방어선 — Referer는 curl 한 줄로 위조되므로 작정한 상대는 못 막는다.
 * 목적은 "남의 서비스에 <img src>로 박히는" 손쉬운 전용을 걷어내는 것.
 *
 * Referer 없음은 **허용**한다: 이 라우트는 <img>로 로드되는데, 프라이버시 설정·확장프로그램이
 * Referer를 지우는 정상 사용자가 있다. 없다고 막으면 그들에게 지도가 안 보인다.
 * 그래서 "명시적으로 다른 출처"인 경우만 거부한다.
 */
function isForeignReferer(req: NextRequest): boolean {
  const referer = req.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).host !== req.nextUrl.host;
  } catch {
    return false; // 파싱 불가 → 판단 보류(정상 사용자 차단 방지).
  }
}

export async function GET(req: NextRequest) {
  if (isForeignReferer(req)) return new Response(null, { status: 403 });

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
  // 국내 전용 — 범위 밖 좌표로 이 프록시를 세계지도 API처럼 쓰는 걸 막는다.
  if (!isInKorea(plat, plng)) return new Response(null, { status: 400 });

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
