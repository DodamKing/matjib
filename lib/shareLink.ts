// 공유 "처방전" 링크 인코딩/디코딩 (D17). 서버·클라 양쪽에서 쓰는 순수 유틸.
// 그 3곳을 URL에 담아 링크만으로 동일 처방전을 재현(별도 저장소/DB 없음). base64url(UTF-8 안전).
import type { Restaurant } from "@/types";

// URL 길이 절약을 위해 키를 짧게. (n=상호, c=업종, la/ln=좌표, w=도보분, a=주소)
type RxPlace = { n: string; c: string; la: number; ln: number; w: number; a: string };
export type RxPayload = {
  v: 1; // 스키마 버전
  m?: string; // 모드 라벨(밥집/카페/술집) — 표시용
  b?: number; // 도보 밴드(5/10/15) — 표시용
  p: RxPlace[]; // 처방된 장소들(최대 3)
};

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function encodeRx(payload: RxPayload): string {
  const json = JSON.stringify(payload);
  return toBase64Url(new TextEncoder().encode(json));
}

/** 실패(변조·구버전 등) 시 null. 호출부에서 안내 처리. */
export function decodeRx(token: string): RxPayload | null {
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(token))) as RxPayload;
    if (data?.v !== 1 || !Array.isArray(data.p) || data.p.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

/** 카드 → 공유 payload (필요한 최소 필드만, 최대 3곳). */
export function cardsToRx(
  cards: Restaurant[],
  meta?: { modeLabel?: string; band?: number },
): RxPayload {
  return {
    v: 1,
    m: meta?.modeLabel,
    b: meta?.band,
    p: cards.slice(0, 3).map((r) => ({
      n: r.name,
      c: r.category,
      la: r.lat,
      ln: r.lng,
      w: r.walkMin,
      a: r.address,
    })),
  };
}

/** 공유 payload의 장소 → 화면/길찾기에서 쓰는 Restaurant 형태로 복원. */
export function rxToRestaurants(payload: RxPayload): Restaurant[] {
  return payload.p.map((p, i) => ({
    id: `rx-${i}`,
    name: p.n,
    category: p.c,
    lat: p.la,
    lng: p.ln,
    address: p.a,
    walkMin: p.w,
  }));
}
