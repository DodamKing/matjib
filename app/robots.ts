import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /share/는 여기서 막지 않는다 — 색인 제외는 페이지의 noindex 메타가 담당(D17).
      // Disallow로 크롤을 막으면 크롤러가 그 noindex를 못 읽어, 카톡 등으로 퍼진 링크가
      // 오히려 URL만 검색결과에 남을 수 있다. noindex를 쓰려면 크롤은 허용해야 한다.
      disallow: "/api/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
