import Link from "next/link";
import { MapPin } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { MatchStatus } from "@/lib/supabase/types";

export interface MatchCardData {
  id: string;
  match_date: string;
  match_time: string;
  location: string;
  status: MatchStatus;
  result_color: number | null;
  result_blanco: number | null;
}

export function MatchCard({ match }: { match: MatchCardData }) {
  return (
    <Link href={`/dashboard/partidos/${match.id}`} className="card p-4 flex flex-col gap-2 block">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-semibold">
          {formatearFecha(match.match_date)} · {match.match_time.slice(0, 5)}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center gap-2 text-base-500 text-sm">
        <MapPin className="w-4 h-4 shrink-0" />
        <span className="truncate">{match.location}</span>
      </div>

      {match.status === "finalizado" && match.result_color !== null && match.result_blanco !== null && (
        <div className="flex items-center gap-3 mt-1 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-danger" />
            Color {match.result_color}
          </span>
          <span className="text-base-500">—</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            Blanco {match.result_blanco}
          </span>
        </div>
      )}
    </Link>
  );
}

function formatearFecha(fecha: string) {
  const date = new Date(`${fecha}T00:00:00`);
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}
