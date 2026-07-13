// 후보 풀 구성 + 공정 셔플 (DECISIONS D3). 품질 랭킹 아님 — 거리 적합 + 랜덤 추첨.
import type { Restaurant, RestaurantSource } from "@/types";
import { haversine, walkMinutes } from "@/lib/distance";
import { inBand, type WalkBandDef } from "@/lib/walkBands";

/** 사용자 위치 기준 도보 밴드(구간) 내 후보를 거리순으로. walkMin 부착 (D14). */
export function buildPool(
  sources: RestaurantSource[],
  userLat: number,
  userLng: number,
  band: WalkBandDef,
): Restaurant[] {
  const pool: Restaurant[] = [];
  for (const s of sources) {
    const meters = haversine(userLat, userLng, s.lat, s.lng);
    const walkMin = walkMinutes(meters);
    if (inBand(walkMin, band)) {
      pool.push({ ...s, walkMin });
    }
  }
  return pool.sort((a, b) => a.walkMin - b.walkMin);
}

/** Fisher–Yates로 공정하게 최대 n개 추첨. 거리 가중 없는 순수 랜덤 — 밴드가 이미 거리를 제한하므로 (D14). */
export function sample<T>(items: T[], n: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

/** 후보 풀에서 공정하게 최대 3개 추첨. */
export function pickThree(pool: Restaurant[]): Restaurant[] {
  return sample(pool, 3);
}
