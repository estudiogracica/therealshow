"use client";

import { Minus, Plus } from "lucide-react";

export function ScoreStepper({
  label,
  dotClass,
  value,
  onChange,
}: {
  label: string;
  dotClass: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        <span className="text-sm font-semibold text-base-500">{label}</span>
      </div>

      <span className="font-display text-6xl font-bold tabular-nums">{value}</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-12 h-12 rounded-xl2 bg-base-700 flex items-center justify-center active:scale-95 transition-transform"
          aria-label={`Restar gol a ${label}`}
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-12 h-12 rounded-xl2 bg-pitch-500 text-base-950 flex items-center justify-center active:scale-95 transition-transform"
          aria-label={`Sumar gol a ${label}`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
