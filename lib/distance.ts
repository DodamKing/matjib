// 거리/도보시간 계산. 순수 함수.

const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** 두 좌표 간 거리(미터). Haversine. */
export function haversine(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** 거리(미터) → 도보 시간(분). 약 80m/분(시속 4.8km) 기준. */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 80));
}

const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** a→b 방위각(도, 북=0 시계방향). 미니 로케이터 화살표 방향용. */
export function bearingDeg(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLng = toRad(bLng - aLng);
  const y = Math.sin(dLng) * Math.cos(toRad(bLat));
  const x =
    Math.cos(toRad(aLat)) * Math.sin(toRad(bLat)) -
    Math.sin(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const COMPASS_8 = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"] as const;

/** 방위각(도) → 8방위 한글("북동쪽" 등). */
export function compass8(deg: number): string {
  return `${COMPASS_8[Math.round(deg / 45) % 8]}쪽`;
}
