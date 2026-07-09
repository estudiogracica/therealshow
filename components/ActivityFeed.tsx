import Link from "next/link";

export interface ActivityItem {
  id: string;
  matchId: string;
  date: string;
  location: string;
  minute: number | null;
  /** Solo para asistencias: a quién se la diste */
  targetName?: string | null;
}

export function ActivityFeed({
  items,
  emptyLabel,
  icon,
}: {
  items: ActivityItem[];
  emptyLabel: string;
  icon: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-base-500 text-center py-4">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Link key={item.id} href={`/dashboard/partidos/${item.matchId}`} className="card p-3 flex items-center gap-3">
          <span className="text-lg shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {item.targetName ? `Asistencia a ${item.targetName}` : item.location}
            </p>
            <p className="text-xs text-base-500 truncate">
              {item.targetName ? item.location : formatearFecha(item.date)}
              {item.targetName ? ` · ${formatearFecha(item.date)}` : ""}
            </p>
          </div>
          {item.minute !== null && <span className="text-xs text-base-500 shrink-0">{item.minute}&apos;</span>}
        </Link>
      ))}
    </div>
  );
}

function formatearFecha(fecha: string) {
  const date = new Date(`${fecha}T00:00:00`);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
