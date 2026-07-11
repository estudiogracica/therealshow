"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface RatablePlayer {
  id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  skill_rating: number;
}

export function RatingsList({ players }: { players: RatablePlayer[] }) {
  const supabase = createClient();
  const [ratings, setRatings] = useState<Record<string, number>>(() =>
    Object.fromEntries(players.map((p) => [p.id, p.skill_rating]))
  );
  const [saving, setSaving] = useState<string | null>(null);

  async function updateRating(playerId: string, value: number) {
    const clamped = Math.min(10, Math.max(1, value));
    setRatings((prev) => ({ ...prev, [playerId]: clamped }));
    setSaving(playerId);

    await supabase.from("profiles").update({ skill_rating: clamped }).eq("id", playerId);

    setSaving(null);
  }

  return (
    <div className="flex flex-col gap-2">
      {players.map((p) => (
        <div key={p.id} className="card p-3 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-base-700 shrink-0 flex items-center justify-center">
            {p.avatar_url ? (
              <Image src={p.avatar_url} alt={p.full_name} fill sizes="40px" className="object-cover" />
            ) : (
              <User className="w-5 h-5 text-base-500" />
            )}
          </div>

          <span className="flex-1 truncate text-sm font-medium">{p.nickname || p.full_name}</span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => updateRating(p.id, ratings[p.id] - 1)}
              disabled={saving === p.id}
              className="w-8 h-8 rounded-lg bg-base-700 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Bajar nota"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-display text-lg font-bold w-6 text-center tabular-nums">{ratings[p.id]}</span>
            <button
              type="button"
              onClick={() => updateRating(p.id, ratings[p.id] + 1)}
              disabled={saving === p.id}
              className="w-8 h-8 rounded-lg bg-pitch-500 text-base-950 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Subir nota"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
