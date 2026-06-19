// 위치 동의 UI + geolocation 획득.
"use client";

import { useState } from "react";
import { MOCK_CENTER } from "@/lib/mock";

type Props = { onLocate: (coords: { lat: number; lng: number }) => void };

export function LocationGate({ onLocate }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function locate() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <p className="text-zinc-600">
        지금 있는 곳에서 <b>걸어서 갈 수 있는 식당</b>만 찾아드려요.
      </p>
      <button
        onClick={locate}
        disabled={status === "loading"}
        className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition active:scale-95 disabled:opacity-60"
      >
        {status === "loading" ? "위치 확인 중…" : "📍 내 위치로 맛집 처방받기"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-500">
          위치를 가져오지 못했어요. 아래로 둘러보거나 다시 시도해 주세요.
        </p>
      )}

      <button
        onClick={() => onLocate(MOCK_CENTER)}
        className="text-sm text-zinc-400 underline underline-offset-4"
      >
        그냥 강남역 기준으로 둘러보기
      </button>
    </div>
  );
}
