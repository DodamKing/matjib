// 후보 풀 구성 + 공정 셔플 (DECISIONS D3). 품질 랭킹 아님 — 거리 적합 + 랜덤 추첨.
import type { Restaurant, RestaurantSource, WalkRadius } from "@/types";
import { haversine, walkMinutes } from "@/lib/distance";

/** 사용자 위치 기준 반경 내 후보를 거리순으로. walkMin 부착. */
export function buildPool(
  sources: RestaurantSource[],
  userLat: number,
  userLng: number,
  radius: WalkRadius,
): Restaurant[] {
  const pool: Restaurant[] = [];
  for (const s of sources) {
    const meters = haversine(userLat, userLng, s.lat, s.lng);
    if (meters <= radius) {
      pool.push({ ...s, walkMin: walkMinutes(meters) });
    }
  }
  return pool.sort((a, b) => a.walkMin - b.walkMin);
}

/** 후보 풀에서 공정하게 최대 3개 추첨 (Fisher–Yates). */
export function pickThree(pool: Restaurant[]): Restaurant[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}
