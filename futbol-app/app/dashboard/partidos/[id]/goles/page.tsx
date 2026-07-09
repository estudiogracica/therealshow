import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { GoalForm, type RosterPlayer } from "@/components/GoalForm";
import { ManageGoalsList } from "@/components/ManageGoalsList";
import type { GoalItem } from "@/components/GoalsList";

export default async function GolesPage({ params }: { params: { id: string } }) {
  const { profile } = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect(`/dashboard/partidos/${params.id}`);

  const supabase = createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, status, location")
    .eq("id", params.id)
    .single();

  if (!match) notFound();

  const { data: rosterRows } = await supabase
    .from("match_players")
    .select("team, player:profiles(id, full_name, nickname)")
    .eq("match_id", params.id);

  const roster: RosterPlayer[] = [];
  for (const row of rosterRows ?? []) {
    const player = row.player as unknown as { id: string; full_name: string; nickname: string | null } | null;
    if (!player) continue;
    roster.push({ id: player.id, name: player.nickname || player.full_name, team: row.team });
  }

  const { data: goalRows } = await supabase
    .from("goals")
    .select(
      "id, minute, team, player:profiles!goals_player_id_fkey(full_name, nickname), assist:profiles!goals_assist_player_id_fkey(full_name, nickname)"
    )
    .eq("match_id", params.id);

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
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/partidos/${params.id}`} className="p-2 -ml-2 text-base-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Goles y asistencias</h1>
          <p className="text-xs text-base-500">{match.location}</p>
        </div>
      </div>

      {match.status !== "finalizado" ? (
        <div className="card p-6 flex flex-col items-center gap-3 text-center">
          <Trophy className="w-6 h-6 text-base-500" />
          <p className="text-sm text-base-500">
            Primero tienes que guardar el resultado del partido para poder añadir goles.
          </p>
          <Link href={`/dashboard/partidos/${params.id}/resultado`} className="text-pitch-500 text-sm font-semibold">
            Ir a resultado
          </Link>
        </div>
      ) : roster.length === 0 ? (
        <div className="card p-6 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-base-500">Primero tienes que asignar los equipos de este partido.</p>
          <Link href={`/dashboard/partidos/${params.id}/equipos`} className="text-pitch-500 text-sm font-semibold">
            Ir a equipos
          </Link>
        </div>
      ) : (
        <>
          <GoalForm matchId={params.id} roster={roster} />

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide">
              Goles registrados
            </h2>
            <ManageGoalsList goals={goals} />
          </section>
        </>
      )}
    </div>
  );
}
