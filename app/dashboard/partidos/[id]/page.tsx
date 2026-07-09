import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarDays, MapPin, Pencil, Users, Trophy, Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { TeamsDisplay, type TeamPlayer } from "@/components/TeamsDisplay";
import { GoalsList, type GoalItem } from "@/components/GoalsList";

export default async function PartidoDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { profile } = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!match) notFound();

  const { data: rosterRows } = await supabase
    .from("match_players")
    .select("team, player:profiles(id, full_name, nickname, avatar_url)")
    .eq("match_id", match.id);

  const colorPlayers: TeamPlayer[] = [];
  const blancoPlayers: TeamPlayer[] = [];
  for (const row of rosterRows ?? []) {
    const player = row.player as unknown as TeamPlayer | null;
    if (!player) continue;
    if (row.team === "color") colorPlayers.push(player);
    else if (row.team === "blanco") blancoPlayers.push(player);
  }

  const hayResultado = match.status === "finalizado" && match.result_color !== null;

  const { data: goalRows } = await supabase
    .from("goals")
    .select(
      "id, minute, team, player:profiles!goals_player_id_fkey(full_name, nickname), assist:profiles!goals_assist_player_id_fkey(full_name, nickname)"
    )
    .eq("match_id", match.id);

  const goals: GoalItem[] = (goalRows ?? []).map((g) => {
    const player = g.player as unknown as { full_name: string; nickname: string | null } | null;
    const assist = g.assist as unknown as { full_name: string; nickname: string | null } | null;
    return {
      id: g.id,
      minute: g.minute,
      team: g.team,
      scorerName: player ? player.nickname || player.full_name : "—",
      assistName: assist ? assist.nickname || assist.full_name : null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/partidos" className="p-2 -ml-2 text-base-500">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Partido</h1>
        </div>

        {isAdmin && (
          <Link
            href={`/dashboard/partidos/${match.id}/editar`}
            className="p-2 text-base-500 flex items-center gap-1 text-sm"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        )}
      </div>

      {/* Info principal */}
      <div className="card p-5 flex flex-col gap-3">
        <StatusBadge status={match.status} />
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-base-500" />
          <span className="font-display text-xl font-semibold">
            {formatearFecha(match.match_date)} · {match.match_time.slice(0, 5)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-base-500">
          <MapPin className="w-5 h-5" />
          <span>{match.location}</span>
        </div>
      </div>

      {/* Resultado */}
      {hayResultado ? (
        <section className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-danger" />
              <span className="text-sm text-base-500">Color</span>
              <span className="font-display text-4xl font-bold">{match.result_color}</span>
            </div>
            <span className="text-base-500 text-xl">—</span>
            <div className="flex flex-col items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-white" />
              <span className="text-sm text-base-500">Blanco</span>
              <span className="font-display text-4xl font-bold">{match.result_blanco}</span>
            </div>
          </div>
          {isAdmin && (
            <Link
              href={`/dashboard/partidos/${match.id}/resultado`}
              className="text-pitch-500 text-sm font-semibold text-center flex items-center justify-center gap-1"
            >
              <Pencil className="w-4 h-4" />
              Editar resultado
            </Link>
          )}
        </section>
      ) : (
        isAdmin && (
          <Link
            href={`/dashboard/partidos/${match.id}/resultado`}
            className="card p-5 flex flex-col items-center gap-2 text-center !border-pitch-500/40"
          >
            <Trophy className="w-6 h-6 text-pitch-500" />
            <span className="text-pitch-500 font-semibold text-sm">Añadir resultado</span>
          </Link>
        )
      )}

      {/* Equipos */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide">Equipos</h2>
          {isAdmin && (
            <Link
              href={`/dashboard/partidos/${match.id}/equipos`}
              className="text-pitch-500 text-sm font-semibold flex items-center gap-1"
            >
              <Settings2 className="w-4 h-4" />
              Gestionar
            </Link>
          )}
        </div>

        {colorPlayers.length === 0 && blancoPlayers.length === 0 ? (
          <div className="card p-6 flex flex-col items-center gap-2 text-center">
            <Users className="w-6 h-6 text-base-500" />
            <p className="text-sm text-base-500">Todavía no se han asignado equipos.</p>
          </div>
        ) : (
          <TeamsDisplay colorPlayers={colorPlayers} blancoPlayers={blancoPlayers} />
        )}
      </section>

      {/* Goles y asistencias */}
      {match.status === "finalizado" && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide">
              Goles y asistencias
            </h2>
            {isAdmin && (
              <Link
                href={`/dashboard/partidos/${match.id}/goles`}
                className="text-pitch-500 text-sm font-semibold flex items-center gap-1"
              >
                <Settings2 className="w-4 h-4" />
                Gestionar
              </Link>
            )}
          </div>
          <div className="card p-4">
            <GoalsList goals={goals} />
          </div>
        </section>
      )}
    </div>
  );
}

function formatearFecha(fecha: string) {
  const date = new Date(`${fecha}T00:00:00`);
  return date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}
