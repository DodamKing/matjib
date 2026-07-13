// 카드 3개 + 셔플 버튼 (Zero-Scroll).
// 셔플/새 결과 시 슬롯머신처럼 pool을 빠르게 굴리다 슬롯별로 순차 정지 (D19). 의존성 없음(setInterval+CSS).
// 이 "돌다 멈춤" 순간이 제품 리추얼이자 릴스 훅(docs/MARKETING_REELS.md).
"use client";

import { useEffect, useRef, useState } from "react";
import type { Restaurant } from "@/types";
import { Card } from "@/components/Card";
import { sample } from "@/lib/shuffle";

type Props = {
  cards: Restaurant[]; // 최종 확정 3곳 (부모 소유)
  pool: Restaurant[]; // 굴릴 때 스쳐 보여줄 후보 풀
  onShuffle: () => void;
  onOpen: (r: Restaurant) => void;
};

const ROLL_MS = 800; // 전체 롤 길이 (원클릭·빠름 원칙상 1초 이내)
const TICK_MS = 70; // 프레임 교체 간격
const STOPS = [0.55, 0.78, 1]; // 슬롯별 정지 시점(비율) — 1번→2번→3번 순차 정지

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function CardDeck({ cards, pool, onShuffle, onOpen }: Props) {
  const [display, setDisplay] = useState<Restaurant[]>(cards);
  const [rolling, setRolling] = useState(false);
  const [settleKey, setSettleKey] = useState(0); // 정지 시 pop 애니메이션 재생용 key
  const startRef = useRef(0);

  // cards가 바뀌면 슬롯-롤 후 실제 카드로 정지 (모션 최소화/풀 부족 시 즉시).
  useEffect(() => {
    if (cards.length === 0) {
      setDisplay([]);
      setRolling(false);
      return;
    }
    const pooled = pool.length >= 2 ? pool : cards;
    if (reducedMotion() || pooled.length < 2) {
      setDisplay(cards);
      setRolling(false);
      setSettleKey((k) => k + 1);
      return;
    }

    setRolling(true);
    startRef.current = performance.now();
    const id = setInterval(() => {
      const t = performance.now() - startRef.current;
      const rnd = sample(pooled, 3);
      // 슬롯별 정지 시점을 지나면 실제 카드로 고정, 아니면 랜덤 후보로 계속 굴림.
      setDisplay(cards.map((c, i) => (t >= ROLL_MS * STOPS[i] ? c : rnd[i] ?? c)));
      if (t >= ROLL_MS) {
        clearInterval(id);
        setDisplay(cards);
        setRolling(false);
        setSettleKey((k) => k + 1);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [cards, pool]);

  return (
    <div className="flex flex-col gap-4">
      {/* 굴리는 동안엔 탭 방지(랜덤 카드 상세 열림 방지) */}
      <div className={`flex flex-col gap-3 ${rolling ? "pointer-events-none" : ""}`}>
        {display.map((r, i) => (
          <div
            key={rolling ? `roll-${i}` : `settle-${settleKey}-${i}`}
            className={rolling ? "" : "animate-card-settle"}
          >
            <Card restaurant={r} onOpen={onOpen} />
          </div>
        ))}
      </div>
      <button
        onClick={onShuffle}
        disabled={rolling}
        className="mt-1 w-full rounded-2xl border-2 border-dashed border-orange-300 py-3.5 text-base font-bold text-orange-600 transition active:scale-95 disabled:opacity-60"
      >
        {rolling ? "🎰 뽑는 중…" : "🎲 다른 3곳 보기"}
      </button>
    </div>
  );
}
