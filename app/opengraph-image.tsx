import { ImageResponse } from "next/og";

export const alt = "matjib — 오늘 뭐 먹지 클리닉";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CARD = {
  width: 150,
  height: 210,
  borderRadius: 28,
};

export default function Image() {
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
            fontSize: 64,
            fontWeight: 800,
            color: "#18181b",
          }}
        >
          🩺 오늘 뭐 먹지 클리닉
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#71717a",
            marginTop: 20,
          }}
        >
          고민 그만하세요. 가까운 3곳만 딱 처방해 드립니다.
        </div>
      </div>
    ),
    { ...size },
  );
}
