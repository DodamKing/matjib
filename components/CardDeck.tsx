// 카드 3개 + 셔플 버튼 (Zero-Scroll).
import type { Restaurant } from "@/types";
import { Card } from "@/components/Card";

type Props = { cards: Restaurant[]; onShuffle: () => void };

export function CardDeck({ cards, onShuffle }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {cards.map((r) => (
          <Card key={r.id} restaurant={r} />
        ))}
      </div>
      <button
        onClick={onShuffle}
        className="mt-1 w-full rounded-2xl border-2 border-dashed border-orange-300 py-3.5 text-base font-bold text-orange-600 transition active:scale-95"
      >
        🎲 마음에 안 들어요, 다시 처방
      </button>
    </div>
  );
}
