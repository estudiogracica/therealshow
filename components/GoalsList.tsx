import type { TeamColor } from "@/lib/supabase/types";

export interface GoalItem {
  id: string;
  minute: number | null;
  team: TeamColor;
  scorerName: string;
  assistName: string | null;
}

export function GoalsList({ goals }: { goals: GoalItem[] }) {
  if (goals.length === 0) {
    return <p className="text-sm text-base-500 text-center">Todavía no hay goles registrados.</p>;
  }

  const ordenados = [...goals].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

  return (
    <div className="flex flex-col divide-y divide-base-700">
      {ordenados.map((g) => (
        <div key={g.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${g.team === "color" ? "bg-danger" : "bg-white"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">⚽ {g.scorerName}</p>
            {g.assistName && (
              <p className="text-xs text-base-500 truncate">Asistencia: {g.assistName}</p>
            )}
          </div>
          {g.minute !== null && (
            <span className="text-xs text-base-500 shrink-0">{g.minute}&apos;</span>
          )}
        </div>
      ))}
    </div>
  );
}
