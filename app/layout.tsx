import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 사이트 절대 URL(canonical·og:url·og:image 변환용) 우선순위:
//  1) SITE_URL — 커스텀 도메인 명시(예: https://matjib.dimad.kr).
//  2) VERCEL_PROJECT_PRODUCTION_URL — Vercel 자동 주입(커스텀 도메인 미설정 시 vercel.app 폴백).
//  3) localhost — 로컬 개발.
// 서버 사이드 메타데이터라 NEXT_PUBLIC_ 불필요(키 보안 규칙 D12 무관).
function resolveSiteUrl(): string {
  const raw =
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "http://localhost:3000";
  // 프로토콜 없이 넣어도(SITE_URL=matjib.dimad.kr) new URL()이 안 깨지게 https:// 보강 + 끝 슬래시 제거.
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

const siteUrl = resolveSiteUrl();
const TITLE = "맛집 안 찾아줍니다, 갈 데를 정해줍니다 | matjib";
const DESCRIPTION =
  "처음 온 동네에서 뭐 먹을지 검색하기 귀찮을 때. 별점·순위 없이 지금 내 위치 기준 걸어서 5~15분 식당을 딱 3곳만. 위치 동의 한 번, 가입·광고 없음.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  // canonical·og:url을 사이트 도메인으로 고정(metadataBase 기준 상대경로 해석).
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "matjib",
    title: TITLE,
    description: DESCRIPTION,
    // og:image는 app/opengraph-image.tsx가 metadataBase로 절대경로 자동 부착.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
