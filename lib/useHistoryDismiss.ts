// 오버레이(바텀시트·전체화면 지도)를 브라우저 히스토리에 연동하는 클라 훅.
// 폰 뒤로가기가 페이지를 이탈시키지 않고 "오버레이만 닫기"가 되도록 (모바일 표준 패턴).
// - 마운트(열림) 시 히스토리 한 칸 push (단조 증가 id로 식별)
// - popstate(뒤로가기)로 "내 칸"이 빠졌을 때만 onClose → 중첩(시트 위 지도)에서 한 번에 하나씩만 닫힘
// - 버튼/ESC/딤으로 닫으면 언마운트 → 내 칸이 아직 top이면 history.back()으로 소비(잔여 히스토리 방지)
"use client";

import { useEffect, useRef } from "react";

// 여러 오버레이가 겹쳐도 각자 자기 칸만 책임지도록 하는 전역 시퀀스.
let overlaySeq = 0;
// StrictMode(dev)의 mount→unmount→mount 리허설을 흡수하기 위한 "소비 대기" 슬롯.
// 언마운트 직후 같은 tick에 재마운트되면 push/back을 반복하지 않고 그 칸을 그대로 재사용한다.
let pendingConsume: { id: number; cancel: () => void } | null = null;

export function useHistoryDismiss(onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    let id: number;
    if (pendingConsume) {
      // 직전 언마운트가 예약한 back()을 취소하고 그 히스토리 칸을 재사용 (StrictMode 리허설).
      pendingConsume.cancel();
      id = pendingConsume.id;
      pendingConsume = null;
    } else {
      id = ++overlaySeq;
      window.history.pushState({ overlayId: id }, "");
    }

    const onPop = () => {
      // pop 후 현재 top이 내 id보다 아래면(= 내 칸이 빠짐) 나를 닫는다.
      // 부모 오버레이는 자기 id가 그대로 top이라 반응하지 않음.
      const topId = (window.history.state?.overlayId as number | undefined) ?? 0;
      if (topId < id) onCloseRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      // 소비(back)를 다음 tick으로 미룬다. 같은 tick에 재마운트되면 위에서 cancel됨(리허설이라 판단).
      let cancelled = false;
      const t = setTimeout(() => {
        pendingConsume = null;
        if (cancelled) return;
        if (window.history.state?.overlayId === id) window.history.back();
      }, 0);
      pendingConsume = {
        id,
        cancel: () => {
          cancelled = true;
          clearTimeout(t);
        },
      };
    };
  }, []);
}
