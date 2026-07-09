import Link from "next/link";

export interface MatchHistoryItem {
  matchId: string;
  date: string;
  location: string;
  team: "color" | "blanco";
  resultColor: number;
  resultBlanco: number;
}

export function MatchHistoryList({ items }: { items: MatchHistoryItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-base-500 text-center py-4">Todavía no hay partidos finalizados.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((m) => {
        const propio = m.team === "color" ? m.resultColor : m.resultBlanco;
        const rival = m.team === "color" ? m.resultBlanco : m.resultColor;
        const resultado = propio > rival ? "V" : propio < rival ? "D" : "E";
        const resultClasses =
          resultado === "V"
            ? "bg-pitch-500/15 text-pitch-500"
            : resultado === "D"
            ? "bg-danger/15 text-danger"
            : "bg-warn/15 text-warn";

        return (
          <Link key={m.matchId} href={`/dashboard/partidos/${m.matchId}`} className="card p-3 flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${resultClasses}`}>
              {resultado}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.location}</p>
              <p className="text-xs text-base-500">{formatearFecha(m.date)}</p>
            </div>
            <span className="text-sm font-display font-bold shrink-0">
              {m.resultColor} - {m.resultBlanco}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function formatearFecha(fecha: string) {
  const date = new Date(`${fecha}T00:00:00`);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}
