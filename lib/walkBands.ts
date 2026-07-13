// 도보 시간 밴드(구간) 정의 — 단일 진실원천 (2026-07-13, DECISIONS D14).
// 누적 반경이 아니라 **겹치지 않는 구간**: 5분=0~5분 이내 / 10분=5~10분 / 15분=10~15분.
// 밀집 상권(예: 강남역)에서 모두 1분 미만으로만 뽑히던 문제 해소.
import type { WalkBand } from "@/types";

export type WalkBandDef = {
  band: WalkBand;
  label: string;
  minMin: number; // 하한(초과, exclusive) — walkMin > minMin
  maxMin: number; // 상한(이하, inclusive) — walkMin <= maxMin
  radiusM: number; // 공공 API 조회 반경(m). maxMin을 넉넉히 커버 후 walkMin으로 재필터.
};

// radiusM: walkMinutes = round(m/80) 기준 maxMin을 커버(round(m/80)<=maxMin ⇒ m<80*(maxMin+0.5)).
export const WALK_BANDS: WalkBandDef[] = [
  { band: 5, label: "5분", minMin: 0, maxMin: 5, radiusM: 450 },
  { band: 10, label: "10분", minMin: 5, maxMin: 10, radiusM: 850 },
  { band: 15, label: "15분", minMin: 10, maxMin: 15, radiusM: 1250 },
];

export const DEFAULT_BAND: WalkBand = 10;

/** 요청값 → 밴드 정의(유효하지 않으면 기본 10분). */
export function resolveBand(band: unknown): WalkBandDef {
  return WALK_BANDS.find((b) => b.band === band) ?? WALK_BANDS[1];
}

/** walkMin이 밴드 구간(minMin < walkMin <= maxMin)에 드는지. */
export function inBand(walkMin: number, def: WalkBandDef): boolean {
  return walkMin > def.minMin && walkMin <= def.maxMin;
}
