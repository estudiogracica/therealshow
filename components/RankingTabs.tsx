"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import clsx from "clsx";

export interface RankingPlayer {
  player_id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  matches_played: number;
  wins: number;
  goals: number;
  assists: number;
}

type Category = "goals" | "assists" | "matches_played" | "wins";

const CATEGORIES: { key: Category; label: string; unit: string }[] = [
  { key: "goals", label: "Goleadores", unit: "goles" },
  { key: "assists", label: "Asistentes", unit: "asist." },
  { key: "matches_played", label: "Partidos", unit: "partidos" },
  { key: "wins", label: "Victorias", unit: "victorias" },
];

const MEDAL_COLORS = ["text-fut-gold", "text-base-500", "text-fut-goldDark"];

export function RankingTabs({ players }: { players: RankingPlayer[] }) {
  const [category, setCategory] = useState<Category>("goals");

  const ranked = useMemo(() => {
    return [...players]
      .filter((p) => p[category] > 0)
      .sort((a, b) => b[category] - a[category]);
  }, [players, category]);

  const activeUnit = CATEGORIES.find((c) => c.key === category)!.unit;

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de categoría */}
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={clsx(
              "h-12 rounded-xl2 font-semibold text-sm transition-colors",
              category === c.key ? "bg-pitch-500 text-base-950" : "bg-base-700 text-base-500"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {ranked.length === 0 ? (
        <div className="card p-6 text-center text-base-500 text-sm">
          Todavía no hay datos suficientes para este ranking.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ranked.map((p, i) => (
            <Link
              key={p.player_id}
              href={`/dashboard/jugadores/${p.player_id}`}
              className="card p-3 flex items-center gap-3"
            >
              <span
                className={clsx(
                  "w-6 text-center font-display font-bold text-lg shrink-0",
                  i < 3 ? MEDAL_COLORS[i] : "text-base-500"
                )}
              >
                {i + 1}
              </span>

              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-base-700 shrink-0 flex items-center justify-center">
                {p.avatar_url ? (
                  <Image src={p.avatar_url} alt={p.full_name} fill sizes="40px" className="object-cover" />
                ) : (
                  <User className="w-5 h-5 text-base-500" />
                )}
              </div>

              <span className="flex-1 truncate text-sm font-medium">{p.nickname || p.full_name}</span>

              <div className="flex items-baseline gap-1 shrink-0">
                <span className="font-display text-xl font-bold">{p[category]}</span>
                <span className="text-[11px] text-base-500">{activeUnit}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
