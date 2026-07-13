// 전체화면 인터랙티브 지도 (NAVER Dynamic Map). 시트의 정적 썸네일을 탭하면 열림 — 핀줌·확대·이동.
// 클라 JS 키(NEXT_PUBLIC_NCP_MAP_CLIENT_ID) 사용: 지도 SDK 키는 도메인 제한으로 보호되는 공개 키 (D12 예외).
"use client";

import { useEffect, useRef, useState } from "react";
import type { Restaurant } from "@/types";
import { useHistoryDismiss } from "@/lib/useHistoryDismiss";

type Props = {
  place: Restaurant;
  userCoords: { lat: number; lng: number };
  onClose: () => void;
};

// 우리가 쓰는 NAVER Maps API 부분만 좁게 선언 (전체 타입 패키지 없이).
type LatLng = object;
type Bounds = object;
interface NaverMap {
  fitBounds(bounds: Bounds, margin?: number): void;
}
interface NaverMaps {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => NaverMap;
  LatLng: new (lat: number, lng: number) => LatLng;
  LatLngBounds: new (sw: LatLng, ne: LatLng) => Bounds;
  Marker: new (opts: Record<string, unknown>) => unknown;
  Point: new (x: number, y: number) => object;
}
type NaverWindow = Window & {
  naver?: { maps?: NaverMaps };
  navermap_authFailure?: () => void;
};

let mapsPromise: Promise<void> | null = null;
function loadNaverMaps(clientId: string): Promise<void> {
  const w = window as NaverWindow;
  if (w.naver?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      mapsPromise = null;
      reject(new Error("NAVER Maps 스크립트 로드 실패"));
    };
    document.head.appendChild(s);
  });
  return mapsPromise;
}

// 출발/도착 글자 라벨이 붙은 마커. (실제 걷는 경로선은 도보 Directions 필요 → 보류, D12)
function pinIcon(maps: NaverMaps, color: string, label: string) {
  return {
    content:
      `<div style="display:flex;align-items:center;gap:5px;white-space:nowrap;font-family:-apple-system,'Malgun Gothic',sans-serif">` +
      `<span style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)"></span>` +
      `<span style="background:${color};color:#fff;font-weight:800;font-size:12px;line-height:1;padding:4px 7px;border-radius:9px;box-shadow:0 1px 5px rgba(0,0,0,.35)">${label}</span>` +
      `</div>`,
    anchor: new maps.Point(11, 11),
  };
}

const CLIENT_ID = process.env.NEXT_PUBLIC_NCP_MAP_CLIENT_ID;

export function MapModal({ place, userCoords, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!CLIENT_ID); // 키 없으면 처음부터 안내

  // 폰 뒤로가기 = 지도만 닫기 (아래 시트로 복귀, 페이지 이탈 아님).
  useHistoryDismiss(onClose);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const w = window as NaverWindow;
    // 도메인 미등록 등 인증 실패 시 SDK가 호출 — 조용히 깨지지 않게 안내로 전환.
    w.navermap_authFailure = () => setFailed(true);

    let cancelled = false;
    loadNaverMaps(CLIENT_ID)
      .then(() => {
        if (cancelled || !ref.current) return;
        const maps = w.naver?.maps;
        if (!maps) return setFailed(true);

        const placeLL = new maps.LatLng(place.lat, place.lng);
        const userLL = new maps.LatLng(userCoords.lat, userCoords.lng);
        const map = new maps.Map(ref.current, { center: placeLL, zoom: 16 });

        new maps.Marker({ position: userLL, map, icon: pinIcon(maps, "#2563eb", "출발") });
        new maps.Marker({ position: placeLL, map, icon: pinIcon(maps, "#f97316", "도착") });

        const sw = new maps.LatLng(
          Math.min(place.lat, userCoords.lat),
          Math.min(place.lng, userCoords.lng),
        );
        const ne = new maps.LatLng(
          Math.max(place.lat, userCoords.lat),
          Math.max(place.lng, userCoords.lng),
        );
        map.fitBounds(new maps.LatLngBounds(sw, ne), 72);
      })
      .catch((e) => {
        console.error("[MapModal] 지도 초기화 실패:", e);
        setFailed(true);
      });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      w.navermap_authFailure = undefined;
    };
  }, [place, userCoords, onClose]);

  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex flex-col bg-white">
      {/* 상단 바: 상호 + 닫기 */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-zinc-900">{place.name}</p>
          <p className="text-xs text-zinc-500">🔵 출발(내 위치) · 🟠 도착 · 걸어서 약 {place.walkMin}분</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition active:scale-95"
        >
          닫기
        </button>
      </div>

      {/* 지도 (핀줌·이동) 또는 실패 안내 */}
      <div className="relative flex-1">
        <div ref={ref} className="h-full w-full" />
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-amber-50 px-8 text-center">
            <p className="text-sm font-bold text-zinc-700">지도를 불러오지 못했어요.</p>
            <p className="text-xs text-zinc-500">
              키가 없거나 접속 도메인이 NCP에 등록되지 않았을 수 있어요. 아래 내비앱으로 길찾기는 그대로 됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
