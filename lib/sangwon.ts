// 소상공인시장진흥공단 「반경내 상가업소 조회」 클라이언트 (DECISIONS D2).
// 키는 서버에서만 사용 (SANGWON_API_KEY).
// TODO(Phase 3): 실연동. 그 전까지는 lib/mock.ts 사용.
import type { Restaurant, WalkRadius } from "@/types";

export async function searchInRadius(_args: {
  lat: number;
  lng: number;
  radius: WalkRadius;
  categoryCode?: string; // 음식 업종 코드
}): Promise<Restaurant[]> {
  throw new Error("not implemented");
}
