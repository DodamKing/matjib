// 장소 상세 바텀시트 — 길찾기를 외부로 튕기지 않고 앱 안에서 감싼다 (DECISIONS D11).
// 미니 로케이터(방향·거리, 키 없음) + 주소 복사 + 내비앱 선택. 최종 이탈만 사용자가 고른다.
"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "@/types";
import { haversine, bearingDeg, compass8 } from "@/lib/distance";
import { NAV_APPS } from "@/lib/navlinks";
import { MapModal } from "@/components/MapModal";

// Dynamic Map 클라 키가 있으면 지도 썸네일 탭 → 전체화면 인터랙티브 지도 활성화 (D12).
const DYN_MAP = !!process.env.NEXT_PUBLIC_NCP_MAP_CLIENT_ID;

type Props = {
  place: Restaurant;
  userCoords: { lat: number; lng: number };
  onClose: () => void;
};

const APP_ICON: Record<string, { mark: string; className: string }> = {
  kakao: { mark: "K", className: "bg-[#ffe000] text-zinc-800" },
  naver: { mark: "N", className: "bg-[#03c75a] text-white" },
};

export function PlaceSheet({ place, userCoords, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  // 실지도 미리보기(NCP Static Map, 서버 프록시). 키 미설정/실패 시 방향·거리 로케이터로 폴백 (D11).
  const [mapFailed, setMapFailed] = useState(false);
  const [showBigMap, setShowBigMap] = useState(false); // 전체화면 인터랙티브 지도 (D12)

  // ESC 닫기 + 열려 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const meters = Math.round(
    haversine(userCoords.lat, userCoords.lng, place.lat, place.lng),
  );
  const bearing = bearingDeg(userCoords.lat, userCoords.lng, place.lat, place.lng);
  const direction = compass8(bearing);

  const mapSrc =
    `/api/staticmap?plat=${place.lat}&plng=${place.lng}` +
    `&ulat=${userCoords.lat}&ulng=${userCoords.lng}&w=600&h=320`;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(place.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.error("[PlaceSheet] 주소 복사 실패:", e);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${place.name} 상세`}
    >
      {/* 배경 딤 — 탭하면 닫힘 */}
      <button
        aria-label="닫기"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 h-full w-full cursor-default bg-zinc-900/45"
      />

      {/* 시트 본체 (Zero-Scroll: 한 화면에 들어가는 고정 높이) */}
      <div className="animate-sheet-up relative z-10 w-full max-w-md rounded-t-3xl bg-white px-5 pb-6 pt-3 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-200" />

        {/* 지도 미리보기: 실지도(NCP) 우선, 키없음/실패 시 방향·거리 로케이터로 폴백 (D11).
            Dynamic Map 키 있으면 탭 → 전체화면 인터랙티브 지도 (D12) */}
        {!mapFailed ? (
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => DYN_MAP && setShowBigMap(true)}
              aria-label={DYN_MAP ? "지도 크게 보기" : undefined}
              className={`relative block h-36 overflow-hidden rounded-2xl border border-orange-100 bg-amber-50 ${
                DYN_MAP ? "transition active:scale-[0.99]" : "cursor-default"
              }`}
            >
              {/* 프록시 이미지 — next/image 대신 img로 onError 폴백 처리 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mapSrc}
                alt={`${place.name} 위치 지도`}
                onError={() => setMapFailed(true)}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-zinc-800 shadow-sm">
                🚶 약 {place.walkMin}분 · {direction} · {meters}m
              </div>
              {DYN_MAP && (
                <div className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-zinc-700 shadow-sm">
                  🔍 탭하여 확대
                </div>
              )}
            </button>
            <p className="px-1 text-[11px] text-zinc-400">
              🔵 내 위치 · 🟠 {place.name}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-2xl bg-amber-50 p-4">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border border-orange-100 bg-white">
              <span className="absolute top-1 text-[9px] font-bold text-zinc-300">N</span>
              <span
                className="text-2xl leading-none"
                style={{ transform: `rotate(${bearing}deg)` }}
                aria-hidden
              >
                ⬆️
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-zinc-900">
                🚶 걸어서 약 {place.walkMin}분
              </p>
              <p className="mt-0.5 text-sm text-zinc-500">
                여기서 <b className="text-orange-600">{direction}</b> · 약 {meters}m
              </p>
            </div>
          </div>
        )}

        {/* 장소 정보 */}
        <div className="mt-4">
          <span className="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
            {place.category}
          </span>
          <h3 className="mt-1.5 text-xl font-extrabold text-zinc-900">{place.name}</h3>
        </div>

        {/* 주소 + 복사 */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3.5 py-2.5">
          <span className="min-w-0 truncate text-sm text-zinc-500">{place.address}</span>
          <button
            onClick={copyAddress}
            className="shrink-0 text-xs font-bold text-orange-600 transition active:scale-95"
          >
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        </div>

        {/* 내비앱 선택 — 최종 이탈은 여기서 사용자가 고른다 */}
        <p className="mt-5 text-xs font-bold text-zinc-500">어떤 앱으로 갈까요?</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {NAV_APPS.map((app) => {
            const href = app.href(place);
            const external = href.startsWith("http");
            const icon = APP_ICON[app.id];
            return (
              <a
                key={app.id}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-100 bg-white py-3.5 text-sm font-bold text-zinc-700 shadow-sm transition active:scale-95"
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg text-sm font-black ${icon.className}`}
                >
                  {icon.mark}
                </span>
                {app.label}
              </a>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white transition active:scale-95"
        >
          닫고 다른 곳 보기
        </button>
      </div>

      {showBigMap && (
        <MapModal
          place={place}
          userCoords={userCoords}
          onClose={() => setShowBigMap(false)}
        />
      )}
    </div>
  );
}
