// 식당 카드 1개 (상호·업종·도보시간·길찾기).
import type { Restaurant } from "@/types";

export function Card({ restaurant }: { restaurant: Restaurant }) {
  // 길찾기: 카카오 보강(mapUrl) 있으면 사용, 없으면 상호명+좌표로 카카오맵 링크 (D4)
  const mapUrl =
    restaurant.mapUrl ??
    `https://map.kakao.com/link/map/${encodeURIComponent(restaurant.name)},${restaurant.lat},${restaurant.lng}`;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <span className="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
          {restaurant.category}
        </span>
        <h3 className="mt-2 truncate text-lg font-bold text-zinc-900">
          {restaurant.name}
        </h3>
        <p className="mt-0.5 text-sm text-zinc-500">
          🚶 걸어서 약 {restaurant.walkMin}분
        </p>
      </div>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-3 shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white"
      >
        길찾기
      </a>
    </div>
  );
}
