// 사이트 절대 URL(canonical·og:url·robots·sitemap용) 우선순위:
//  1) SITE_URL — 커스텀 도메인 명시(예: https://matjib.dimad.kr).
//  2) VERCEL_PROJECT_PRODUCTION_URL — Vercel 자동 주입(커스텀 도메인 미설정 시 vercel.app 폴백).
//  3) localhost — 로컬 개발.
// 서버 사이드에서만 읽으므로 NEXT_PUBLIC_ 불필요(키 보안 규칙 D12 무관).
export function resolveSiteUrl(): string {
  const raw =
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "http://localhost:3000";
  // 프로토콜 없이 넣어도(SITE_URL=matjib.dimad.kr) new URL()이 안 깨지게 https:// 보강 + 끝 슬래시 제거.
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export const siteUrl = resolveSiteUrl();
