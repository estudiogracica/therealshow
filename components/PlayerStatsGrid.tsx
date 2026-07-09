import type { PlayerRatingRow } from "@/lib/supabase/types";

const ITEMS: { key: keyof PlayerRatingRow; label: string }[] = [
  { key: "matches_played", label: "Partidos" },
  { key: "wins", label: "Victorias" },
  { key: "draws", label: "Empates" },
  { key: "losses", label: "Derrotas" },
  { key: "goals", label: "Goles" },
  { key: "assists", label: "Asistencias" },
  { key: "goal_contributions", label: "Part. de gol" },
  { key: "goals_per_match", label: "Goles/partido" },
  { key: "assists_per_match", label: "Asist./partido" },
];

export function PlayerStatsGrid({ stats }: { stats: PlayerRatingRow }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ITEMS.map(({ key, label }) => (
        <div key={key} className="card p-3 flex flex-col items-center justify-center text-center gap-0.5">
          <span className="font-display text-xl font-bold text-white">{stats[key]}</span>
          <span className="text-[11px] text-base-500 leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
}
