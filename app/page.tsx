"use client";

// 메인: 위치게이트 → 모드(밥집/카페/술집) → 상황 태그 → 도보 필터 → 카드 3개 → 셔플. (실데이터)
// 조회/필터/셔플 선정은 서버(/api/recommend)에서. 클라는 반환된 풀로 로컬 셔플만.
import { useState } from "react";
import type { Restaurant, RecommendResponse, WalkRadius } from "@/types";
import { pickThree } from "@/lib/shuffle";
import { MODE_LIST, MODES, type ModeId } from "@/lib/modes";
import { LocationGate } from "@/components/LocationGate";
import { CardDeck } from "@/components/CardDeck";
import { SituationInput } from "@/components/SituationInput";
import { PlaceSheet } from "@/components/PlaceSheet";

const RADII: { label: string; value: WalkRadius }[] = [
  { label: "5분", value: 300 },
  { label: "10분", value: 600 },
  { label: "15분", value: 1000 },
];

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<ModeId>("meal");
  const [radius, setRadius] = useState<WalkRadius>(600);
  const [tags, setTags] = useState<string[]>([]);
  const [pool, setPool] = useState<Restaurant[]>([]);
  const [cards, setCards] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [openPlace, setOpenPlace] = useState<Restaurant | null>(null);

  async function prescribe(
    c: { lat: number; lng: number },
    m: ModeId,
    r: WalkRadius,
    t: string[],
  ) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: c.lat, lng: c.lng, mode: m, radius: r, tags: t }),
      });
      if (!res.ok) throw new Error(`recommend ${res.status}`);
      const data: RecommendResponse = await res.json();
      setPool(data.pool);
      setCards(data.cards);
    } catch (e) {
      console.error("[Home] prescribe 실패:", e);
      setError(true);
      setPool([]);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  function handleLocate(c: { lat: number; lng: number }) {
    setCoords(c);
    prescribe(c, mode, radius, tags);
  }

  function handleMode(m: ModeId) {
    setMode(m);
    setTags([]); // 태그 id는 모드별이라 전환 시 초기화
    if (coords) prescribe(coords, m, radius, []);
  }

  function handleRadius(r: WalkRadius) {
    setRadius(r);
    if (coords) prescribe(coords, mode, r, tags);
  }

  function handleTags(next: string[]) {
    setTags(next);
    if (coords) prescribe(coords, mode, radius, next);
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
          {/* 모드 전환: 밥집 / 카페 / 술집 (기본 밥집) */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
            {MODE_LIST.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMode(m.id)}
                className={`rounded-xl py-2.5 text-sm font-bold transition ${
                  mode === m.id ? "bg-orange-500 text-white shadow" : "text-zinc-500"
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          {/* 상황 태그 (현재 모드 세트, 다중 선택, 미선택 = 아무거나) */}
          <SituationInput tags={MODES[mode].tags} selected={tags} onChange={handleTags} />

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

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              가까운 맛집을 처방 중이에요… 🩺
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-red-500 shadow-sm">
              추천을 불러오지 못했어요.
              <br />
              잠시 후 다시 시도해 주세요. 🙏
            </div>
          ) : cards.length > 0 ? (
            <CardDeck
              cards={cards}
              onShuffle={() => setCards(pickThree(pool))}
              onOpen={setOpenPlace}
            />
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              이 반경 안엔 {MODES[mode].label}이 없어요.
              <br />
              도보 시간을 늘리거나 다른 모드를 눌러보세요. 🚶
            </div>
          )}
        </div>
      )}

      {openPlace && coords && (
        <PlaceSheet
          place={openPlace}
          userCoords={coords}
          onClose={() => setOpenPlace(null)}
        />
      )}
    </main>
  );
}
