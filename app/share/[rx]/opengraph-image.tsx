// 공유 처방전 링크의 OG 이미지 (D17). 카톡·SNS 붙여넣기 미리보기 = 바이럴 훅.
// path param(rx)이라 page와 동일하게 params로 payload를 받아 3곳을 렌더.
import { ImageResponse } from "next/og";
import { decodeRx } from "@/lib/shareLink";
import { loadKoreanFont } from "@/lib/ogFont";

export const alt = "matjib 점심 처방전";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = { params: Promise<{ rx: string }> };

export default async function Image({ params }: Params) {
  const { rx } = await params;
  const payload = decodeRx(rx);
  const places = payload?.p.slice(0, 3) ?? [];
  const scope = [payload?.m, payload?.b ? `도보 ${payload.b}분` : null]
    .filter(Boolean)
    .join(" · ");
  const font = await loadKoreanFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FFFBEB",
          padding: "52px 72px",
          fontFamily: "KR",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.3,
              color: "#f97316",
              fontWeight: 700,
            }}
          >
            📍 걸어서 갈 만한 근처 3곳
          </div>
          <div style={{ display: "flex", fontSize: 26, lineHeight: 1.3, color: "#a1a1aa" }}>
            matjib · 걸어서 5~15분{scope ? ` · ${scope}` : ""}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 30 }}>
          {places.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: "#ffffff",
                borderRadius: 22,
                padding: "18px 28px",
                border: "1px solid #fed7aa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: "#f97316",
                  color: "#fff",
                  fontSize: 26,
                  fontWeight: 700,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#18181b",
                    maxWidth: 900,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.n}
                </div>
                <div style={{ display: "flex", fontSize: 22, color: "#71717a", marginTop: 2 }}>
                  {p.c} · 🚶 약 {p.w}분
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 22,
            color: "#71717a",
            fontWeight: 700,
          }}
        >
          나도 받기 → matjib.dimad.kr
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "KR", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
