import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// 색인 대상은 랜딩 한 페이지뿐 — 결과는 위치 기반 클라이언트 상태라 URL이 없고,
// /share/[rx]는 개인 공유용이라 robots.ts에서 제외했다.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
