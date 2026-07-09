// 식당 카드 1개 (상호·업종·도보시간·길찾기).
// 길찾기는 외부로 튕기지 않고 부모의 onOpen으로 앱 내부 상세 시트를 연다 (D11).
"use client";

import type { Restaurant } from "@/types";

type Props = { restaurant: Restaurant; onOpen: (r: Restaurant) => void };

export function Card({ restaurant, onOpen }: Props) {
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
      <button
        onClick={() => onOpen(restaurant)}
        className="ml-3 shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
      >
        길찾기
      </button>
    </div>
  );
}
