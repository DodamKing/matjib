import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /share/[rx]는 개인 처방전 공유용 일회성 URL — 색인 대상 아님(OG 미리보기는 크롤 없이 동작).
      disallow: ["/api/", "/share/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
