"use client";

// 메인: 위치게이트 → 모드(밥집/카페/술집) → 상황 태그 → 도보 필터 → 카드 3개 → 셔플. (실데이터)
// 조회/필터/셔플 선정은 서버(/api/recommend)에서. 클라는 반환된 풀로 로컬 셔플만.
import { useState } from "react";
import type { Restaurant, RecommendResponse, WalkBand } from "@/types";
import { pickThree } from "@/lib/shuffle";
import { MODE_LIST, MODES, type ModeId } from "@/lib/modes";
import { WALK_BANDS, DEFAULT_BAND } from "@/lib/walkBands";
import { encodeRx, cardsToRx } from "@/lib/shareLink";
import { LocationGate } from "@/components/LocationGate";
import { CardDeck } from "@/components/CardDeck";
import { SituationInput } from "@/components/SituationInput";
import { PlaceSheet } from "@/components/PlaceSheet";

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<ModeId>("meal");
  const [band, setBand] = useState<WalkBand>(DEFAULT_BAND);
  const [tags, setTags] = useState<string[]>([]);
  const [pool, setPool] = useState<Restaurant[]>([]);
  const [cards, setCards] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [openPlace, setOpenPlace] = useState<Restaurant | null>(null);
  const [copied, setCopied] = useState(false);

  async function prescribe(
    c: { lat: number; lng: number },
    m: ModeId,
    b: WalkBand,
    t: string[],
  ) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: c.lat, lng: c.lng, mode: m, band: b, tags: t }),
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
    prescribe(c, mode, band, tags);
  }

  function handleMode(m: ModeId) {
    setMode(m);
    setTags([]); // 태그 id는 모드별이라 전환 시 초기화
    if (coords) prescribe(coords, m, band, []);
  }

  function handleBand(b: WalkBand) {
    setBand(b);
    if (coords) prescribe(coords, mode, b, tags);
  }

  function handleTags(next: string[]) {
    setTags(next);
    if (coords) prescribe(coords, mode, band, next);
  }

  // 처방전 공유(D17): 그 3곳을 URL에 담아 링크로. 모바일은 Web Share, 아니면 클립보드 복사.
  // URL 복사: 보안 컨텍스트면 Clipboard API, 아니면(LAN·http) 레거시 execCommand 폴백.
  async function copyUrl(url: string): Promise<boolean> {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch {
        /* 폴백으로 진행 */
      }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  async function handleShare() {
    if (cards.length === 0) return;
    const token = encodeRx(cardsToRx(cards, { modeLabel: MODES[mode].label, band }));
    const url = `${window.location.origin}/share/${token}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "📍 걸어서 갈 만한 3곳", text: "이 근처 걸어서 갈 만한 3곳!", url });
        return;
      } catch {
        return; // 사용자가 공유 시트를 취소 — 조용히 종료
      }
    }
    if (await copyUrl(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      // 복사도 불가한 환경 — 링크를 직접 노출해 수동 복사.
      window.prompt("이 링크를 복사해 공유하세요:", url);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-amber-50 px-5 py-6 text-zinc-900">
      {/* 큰 2줄 헤더는 항상 상단(브랜드). 결과 화면에서도 유지 — 데크가 바로 아래 와서 셔플이 한 화면에 담김 (D20/B) */}
      <header className="mb-6 mt-2 text-center">
        <h1 className="text-2xl font-extrabold leading-snug tracking-tight">
          맛집 안 찾아줍니다.
          <br />
          갈 데를 정해줍니다.
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          낯선 동네에서 검색·비교 없이, 걸어서 갈 식당 3곳만.
        </p>
      </header>

      {!coords ? (
        <div className="flex flex-1 items-center justify-center">
          <LocationGate onLocate={handleLocate} />
        </div>
      ) : (
        // 결과 화면: (주인공) 카드 3장 + 셔플 → 조정 컨트롤(아래)
        <div className="flex flex-col gap-4">
          {/* 결과 = 화면 위. 셔플 롤 전체가 한 화면에 담기게 */}
          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              걸어갈 만한 3곳 고르는 중… 🚶
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-red-500 shadow-sm">
              추천을 불러오지 못했어요.
              <br />
              잠시 후 다시 시도해 주세요. 🙏
            </div>
          ) : cards.length > 0 ? (
            <div className="flex flex-col gap-3">
              <CardDeck
                cards={cards}
                pool={pool}
                onShuffle={() => setCards(pickThree(pool))}
                onOpen={setOpenPlace}
              />
              <button
                onClick={handleShare}
                className="w-full rounded-2xl bg-orange-500 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition active:scale-95"
              >
                {copied ? "링크 복사됨 ✓ 붙여넣기 하세요" : "📤 이 3곳 공유하기"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              이 도보 구간엔 {MODES[mode].label}이 없어요.
              <br />
              다른 도보 시간이나 다른 모드를 눌러보세요. 🚶
            </div>
          )}

          {/* 조정 컨트롤: 데크 아래로. 모드 / 도보 / 상황 태그(펼침) */}
          <div className="mt-1 flex flex-col gap-3 border-t border-orange-100 pt-4">
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

            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
              {WALK_BANDS.map((b) => (
                <button
                  key={b.band}
                  onClick={() => handleBand(b.band)}
                  className={`rounded-xl py-2.5 text-sm font-bold transition ${
                    band === b.band
                      ? "bg-orange-500 text-white shadow"
                      : "text-zinc-500"
                  }`}
                >
                  도보 {b.label}
                </button>
              ))}
            </div>

            {/* 상황 태그 (펼침, 데크 아래) */}
            <SituationInput tags={MODES[mode].tags} selected={tags} onChange={handleTags} />
          </div>
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
