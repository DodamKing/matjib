// 카카오 로컬: 상호명+좌표 → 길찾기 링크 보강 (DECISIONS D4). 선택적/fallback.
// 매칭 실패 시 원본 그대로 반환. 키: KAKAO_REST_API_KEY (서버 전용).
// TODO(Phase 3, 선택).
import type { Restaurant } from "@/types";

export async function enrichMapUrl(restaurant: Restaurant): Promise<Restaurant> {
  // 보강 실패해도 안전하게 원본 반환
  return restaurant;
}
