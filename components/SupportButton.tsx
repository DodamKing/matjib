// 후원 버튼 — 「💉 개발자 카페인 수혈」 (Buy Me a Coffee 한국판, 클리닉 톤)
// D13: 실입금은 toss.me / 카카오페이 "송금 링크"(공개 링크)로만. PG·키·서버·수수료 0.
//   → 무광고·무로그인·원클릭 원칙 그대로. 이 링크는 시크릿이 아니라 공개 링크라 클라 노출 무방.
// 개인 송금 핸들을 레포에 커밋하지 않으려고 NEXT_PUBLIC_SUPPORT_URL 로 주입. 값이 있을 때만 노출.
const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL;

export function SupportButton() {
  if (!SUPPORT_URL) return null;
  return (
    <footer className="mt-8 flex flex-col items-center gap-1.5 pb-1 text-center">
      <p className="text-xs text-zinc-400">이 클리닉이 오늘 점심을 구했다면</p>
      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 active:scale-95"
      >
        💉 개발자 카페인 수혈
      </a>
      <p className="text-[11px] text-zinc-300">☕ 커피 한 잔으로 개발자를 살립니다</p>
    </footer>
  );
}
