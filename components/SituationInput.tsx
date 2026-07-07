// 상황 태그 선택 UI (다중 선택, 미선택 = "아무거나"). DECISIONS D5 개정.
"use client";

import { SITUATION_TAGS } from "@/lib/tags";

type Props = {
  selected: string[];
  onChange: (tagIds: string[]) => void;
};

export function SituationInput({ selected, onChange }: Props) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id],
    );
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-sm">
      {SITUATION_TAGS.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => toggle(tag.id)}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition active:scale-95 ${
            selected.includes(tag.id)
              ? "bg-orange-500 text-white shadow"
              : "bg-orange-50 text-zinc-500"
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}
