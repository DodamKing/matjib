// 브랜드 마크 — 카드 3장 심볼(app/icon.svg 재사용) + "딱세곳" 워드마크.
// 카드 3장 = "딱 세 곳"의 시각적 정체성이자 릴스·캐러셀 클라이맥스와 같은 자산.
// 릴스·검색으로 들어온 사람이 앱에서 브랜드명을 각인하는 자리라 헤더 최상단에 둔다.
export function BrandMark({
  className = "",
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      aria-label="딱세곳"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="7"
          y="11"
          width="10"
          height="14"
          rx="2.2"
          fill="#FDBA74"
          transform="rotate(-18 12 18)"
        />
        <rect
          x="15"
          y="11"
          width="10"
          height="14"
          rx="2.2"
          fill="#FB923C"
          transform="rotate(18 20 18)"
        />
        <rect x="11" y="9" width="10" height="14" rx="2.2" fill="#F97316" />
      </svg>
      <span className="text-base font-extrabold tracking-tight text-zinc-900">
        딱세곳
      </span>
    </div>
  );
}
