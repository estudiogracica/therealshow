import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { TeamEditor } from "@/components/TeamEditor";
import type { TeamColor } from "@/lib/supabase/types";

export default async function EquiposPage({ params }: { params: { id: string } }) {
  const { profile } = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect(`/dashboard/partidos/${params.id}`);

  const supabase = createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, location, match_date")
    .eq("id", params.id)
    .single();

  if (!match) notFound();

  const { data: players } = await supabase
    .from("profiles")
    .select("id, full_name, nickname, avatar_url, skill_rating")
    .order("full_name", { ascending: true });

  const { data: currentAssignments } = await supabase
    .from("match_players")
    .select("player_id, team")
    .eq("match_id", params.id);

  const initialAssignments: Record<string, TeamColor> = {};
  for (const row of currentAssignments ?? []) {
    initialAssignments[row.player_id] = row.team;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/partidos/${params.id}`} className="p-2 -ml-2 text-base-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Equipos</h1>
          <p className="text-xs text-base-500">{match.location}</p>
        </div>
      </div>

      <Link href="/dashboard/valoraciones" className="text-pitch-500 text-sm font-semibold -mt-3">
        Ajustar nivel de juego de los jugadores →
      </Link>

      {!players || players.length === 0 ? (
        <div className="card p-6 text-center text-base-500">No hay jugadores registrados todavía.</div>
      ) : (
        <TeamEditor matchId={params.id} players={players} initialAssignments={initialAssignments} />
      )}
    </div>
  );
}
