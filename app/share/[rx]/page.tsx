// 공유 처방전 뷰 (D17). 누군가 보낸 3곳을 읽기전용으로 재현 + "나도 받기" CTA.
// 서버 컴포넌트: 링크 미리보기(OG)용 메타를 서버에서 생성. 랜덤 UGC 조합이라 검색 색인은 막고(noindex),
// OG 제목/설명에 상호명을 실어 카톡·SNS 붙여넣기 미리보기(=바이럴 훅)만 살린다.
import type { Metadata } from "next";
import Link from "next/link";
import { decodeRx, rxToRestaurants } from "@/lib/shareLink";
import { NAV_APPS } from "@/lib/navlinks";

type Params = { params: Promise<{ rx: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { rx } = await params;
  const payload = decodeRx(rx);
  if (!payload) {
    return {
      title: "3곳을 찾을 수 없어요 | 딱세곳",
      robots: { index: false, follow: false },
    };
  }
  const names = payload.p.map((p) => p.n).join(" · ");
  const scope = [payload.m, payload.b ? `도보 ${payload.b}분` : null]
    .filter(Boolean)
    .join(" · ");
  const title = `📍 걸어서 갈 만한 3곳: ${names}`;
  const description = `${scope ? scope + " — " : ""}낯선 동네에서 걸어갈 만한 3곳이에요. 나도 내 주변 3곳 받아보기 →`;
  return {
    title,
    description,
    robots: { index: false, follow: false }, // 무작위 조합 UGC — 색인 대신 미리보기만 (D17)
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePage({ params }: Params) {
  const { rx } = await params;
  const payload = decodeRx(rx);

  if (!payload) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 bg-amber-50 px-6 text-center text-zinc-900">
        <p className="text-lg font-extrabold">링크를 열 수 없어요 📍</p>
        <p className="text-sm text-zinc-500">링크가 오래됐거나 잘못됐어요.</p>
        <Link
          href="/"
          className="rounded-2xl bg-orange-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/30"
        >
          📍 내 주변 3곳 받기
        </Link>
      </main>
    );
  }

  const places = rxToRestaurants(payload);
  const scope = [payload.m, payload.b ? `도보 ${payload.b}분` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-amber-50 px-5 py-10 text-zinc-900">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">📍 누가 보낸 맛집 3곳</h1>
        <p className="mt-1 text-sm text-zinc-500">
          걸어서 갈 만한 근처 3곳을 정해서 보냈어요.{scope ? ` (${scope})` : ""}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {places.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
          >
            <span className="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
              {r.category}
            </span>
            <h3 className="mt-2 text-lg font-bold text-zinc-900">{r.name}</h3>
            <p className="mt-0.5 text-sm text-zinc-500">🚶 걸어서 약 {r.walkMin}분</p>
            {r.address && (
              <p className="mt-0.5 truncate text-xs text-zinc-400">{r.address}</p>
            )}
            <div className="mt-3 flex gap-2">
              {NAV_APPS.map((app) => (
                <a
                  key={app.id}
                  href={app.href(r)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl border border-zinc-100 bg-white py-2.5 text-center text-sm font-bold text-zinc-700 shadow-sm"
                >
                  {app.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="mt-6 rounded-2xl bg-orange-500 py-4 text-center text-base font-bold text-white shadow-lg shadow-orange-500/30"
      >
        📍 나도 내 주변 3곳 받기 →
      </Link>
      <p className="mt-3 text-center text-[11px] text-zinc-400">
        딱세곳 · 걸어서 5~15분 · 광고·협찬 없음
      </p>
    </main>
  );
}
