"use client";

// 메인: 위치게이트 → 상황 태그 → 도보 필터 → 카드 3개 → 셔플. (Phase 2, 더미데이터)
import { useState } from "react";
import type { Restaurant, WalkRadius } from "@/types";
import { MOCK_RESTAURANTS } from "@/lib/mock";
import { buildPool, pickThree } from "@/lib/shuffle";
import { filterByTags } from "@/lib/match";
import { LocationGate } from "@/components/LocationGate";
import { CardDeck } from "@/components/CardDeck";
import { SituationInput } from "@/components/SituationInput";

const RADII: { label: string; value: WalkRadius }[] = [
  { label: "5분", value: 300 },
  { label: "10분", value: 600 },
  { label: "15분", value: 1000 },
];

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<WalkRadius>(600);
  const [tags, setTags] = useState<string[]>([]);
  const [pool, setPool] = useState<Restaurant[]>([]);
  const [cards, setCards] = useState<Restaurant[]>([]);

  function prescribe(c: { lat: number; lng: number }, r: WalkRadius, t: string[]) {
    const base = buildPool(MOCK_RESTAURANTS, c.lat, c.lng, r);
    const next = filterByTags(base, t);
    setPool(next);
    setCards(pickThree(next));
  }

  function handleLocate(c: { lat: number; lng: number }) {
    setCoords(c);
    prescribe(c, radius, tags);
  }

  function handleRadius(r: WalkRadius) {
    setRadius(r);
    if (coords) prescribe(coords, r, tags);
  }

  function handleTags(next: string[]) {
    setTags(next);
    if (coords) prescribe(coords, radius, next);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-amber-50 px-5 py-10 text-zinc-900">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          🩺 오늘 뭐 먹지 클리닉
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          고민하지 마세요. 가까운 3곳만 처방해 드립니다.
        </p>
      </header>

      {!coords ? (
        <div className="flex flex-1 items-center justify-center">
          <LocationGate onLocate={handleLocate} />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* 상황 태그 (다중 선택, 미선택 = 아무거나) */}
          <SituationInput selected={tags} onChange={handleTags} />

          {/* 도보 시간 필터 */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
            {RADII.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleRadius(value)}
                className={`rounded-xl py-2.5 text-sm font-bold transition ${
                  radius === value
                    ? "bg-orange-500 text-white shadow"
                    : "text-zinc-500"
                }`}
              >
                도보 {label}
              </button>
            ))}
          </div>

          {cards.length > 0 ? (
            <CardDeck cards={cards} onShuffle={() => setCards(pickThree(pool))} />
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              이 반경 안엔 식당이 없어요.
              <br />
              도보 시간을 늘려보세요. 🚶
            </div>
          )}
        </div>
      )}
    </main>
  );
}
