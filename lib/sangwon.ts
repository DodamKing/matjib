// 소상공인시장진흥공단 「반경내 상가업소 조회」 클라이언트 (DECISIONS D2).
// 키는 서버(API Route)에서만 사용 (SANGWON_API_KEY). 클라 번들 노출 금지.
// 엔드포인트/필드/음식코드는 2026-07-09 실 API로 검증 확정 (WORKLOG 참조).
import type { RestaurantSource, WalkRadius } from "@/types";

const BASE =
  "https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius";
const FOOD_LCLS = "I2"; // 음식 대분류 코드 (sdsc2 신분류). 서버 필터로 음식점만 조회.
const MAX_ROWS = 1000; // 페이지당 상한. 3카드 선정엔 최근접 소수만 필요하므로 1페이지로 충분.

// API 응답 item 중 우리가 쓰는 필드만.
type SangwonItem = {
  bizesId: string; // 상가업소번호
  bizesNm: string; // 상호명
  indsSclsNm?: string; // 상권업종 소분류명 → category
  rdnmAdr?: string; // 도로명주소
  lnoAdr?: string; // 지번주소
  lon: number | string; // 경도
  lat: number | string; // 위도
};

/** 반경 내 음식점을 원천 형태로 조회. 실패 시 throw (호출부에서 502 처리). */
export async function searchInRadius(args: {
  lat: number;
  lng: number;
  radius: WalkRadius;
}): Promise<RestaurantSource[]> {
  const key = process.env.SANGWON_API_KEY;
  if (!key) throw new Error("SANGWON_API_KEY 미설정");

  const url = new URL(BASE);
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("type", "json");
  url.searchParams.set("indsLclsCd", FOOD_LCLS);
  url.searchParams.set("radius", String(args.radius));
  url.searchParams.set("cx", String(args.lng)); // 주의: cx=경도(lng)
  url.searchParams.set("cy", String(args.lat)); // cy=위도(lat)
  url.searchParams.set("numOfRows", String(MAX_ROWS));
  url.searchParams.set("pageNo", "1");

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  // 게이트웨이 오류는 평문("Forbidden") 또는 XML로 오므로 JSON 파싱을 먼저 방어.
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`상가정보 API 비정상 응답: ${text.slice(0, 120)}`);
  }

  const header = (json as { header?: { resultCode?: string; resultMsg?: string } })
    .header;
  if (header?.resultCode && header.resultCode !== "00") {
    throw new Error(
      `상가정보 API 오류(${header.resultCode}): ${header.resultMsg ?? ""}`,
    );
  }

  const items = (json as { body?: { items?: unknown } }).body?.items;
  if (!Array.isArray(items)) return []; // 반경 내 결과 없음

  return (items as SangwonItem[])
    .map(toSource)
    .filter((r): r is RestaurantSource => r !== null);
}

function toSource(it: SangwonItem): RestaurantSource | null {
  const lat = Number(it.lat);
  const lng = Number(it.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: it.bizesId,
    name: it.bizesNm,
    category: it.indsSclsNm ?? "",
    lat,
    lng,
    address: it.rdnmAdr || it.lnoAdr || "",
  };
}
