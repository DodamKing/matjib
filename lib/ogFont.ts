// OG 이미지(satori)용 한글 폰트 로더 (D17). satori는 기본 폰트에 한글 글리프가 없어 상호명이 깨지므로
// 전체 한글 커버 OTF를 런타임에 받아서 넘긴다. 모듈 스코프 캐시로 재요청 최소화.
// Pretendard(OFL) Bold OTF — jsDelivr(gh) 실측 200/1.57MB.
const FONT_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/packages/pretendard/dist/public/static/Pretendard-Bold.otf";

let cached: ArrayBuffer | null = null;

export async function loadKoreanFont(): Promise<ArrayBuffer | null> {
  if (cached) return cached;
  try {
    const res = await fetch(FONT_URL);
    if (!res.ok) return null;
    cached = await res.arrayBuffer();
    return cached;
  } catch {
    return null;
  }
}
