import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  // 검색엔진 사이트 소유확인(네이버 서치어드바이저 / 구글 서치콘솔).
  // 색인 등록 후에도 태그를 지우면 소유확인이 풀리므로 계속 유지할 것.
  verification: {
    google: "PlYdRNSi1zGbnQC-1UtvTw81FjJ-zoEHv4n_V4dW360",
    other: {
      "naver-site-verification": "0985268297cbaec8c3890ec82f76b6d4fb672c02",
    },
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
