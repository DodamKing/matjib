import { ImageResponse } from "next/og";
import { loadKoreanFont } from "@/lib/ogFont";

export const alt = "딱세곳 — 낯선 동네에서 갈 데를 정해주는 앱";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CARD = {
  width: 150,
  height: 210,
  borderRadius: 28,
};

export default async function Image() {
  // satori 기본 폰트엔 한글 글리프가 없어 배포(리눅스)에서 "딱세곳"이 두부(□)로 깨진다.
  // 로컬(Windows)은 시스템 폰트로 우연히 렌더되지만 Vercel엔 한글 폰트가 없다 → 명시적으로 실는다.
  const font = await loadKoreanFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFBEB",
          fontFamily: "KR",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 420,
            height: 240,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              ...CARD,
              position: "absolute",
              left: 30,
              top: 25,
              background: "#FDBA74",
              transform: "rotate(-14deg)",
            }}
          />
          <div
            style={{
              ...CARD,
              position: "absolute",
              left: 240,
              top: 25,
              background: "#FB923C",
              transform: "rotate(14deg)",
            }}
          />
          <div
            style={{
              ...CARD,
              position: "absolute",
              left: 135,
              top: 0,
              background: "#F97316",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 800,
            color: "#18181b",
            letterSpacing: -2,
          }}
        >
          딱세곳
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#71717a",
            marginTop: 20,
          }}
        >
          낯선 동네에서 갈 데를 정해드립니다. 걸어서 5~15분, 딱 3곳.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "KR", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
