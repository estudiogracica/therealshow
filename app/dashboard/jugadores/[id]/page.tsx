import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FutCard } from "@/components/FutCard";
import { PlayerStatsGrid } from "@/components/PlayerStatsGrid";
import { MatchHistoryList, type MatchHistoryItem } from "@/components/MatchHistoryList";
import { ActivityFeed, type ActivityItem } from "@/components/ActivityFeed";
import { SeasonSelector } from "@/components/SeasonSelector";
import type { PlayerRatingRow } from "@/lib/supabase/types";

export default async function JugadorPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { temporada?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, nickname, avatar_url, created_at")
    .eq("id", params.id)
    .single();

  if (!profile) notFound();

  const { data: seasonsRaw } = await supabase
    .from("seasons")
    .select("id, name, is_active")
    .order("created_at", { ascending: false });
  const seasons = seasonsRaw as { id: string; name: string; is_active: boolean }[] | null;

  const activeSeason = seasons?.find((s) => s.is_active) ?? seasons?.[0];
  const current = searchParams.temporada || activeSeason?.id || "historico";
  const isOwnProfile = user?.id === params.id;

  // --- Rating para la Carta FUT + estadísticas (histórico o de la temporada elegida) ---
  let rating: PlayerRatingRow | null = null;

  if (current === "historico") {
    const { data } = await supabase.from("player_ratings").select("*").eq("player_id", params.id).single();
    rating = data;
  } else {
    const { data } = await supabase
      .from("player_season_ratings")
      .select("*")
      .eq("player_id", params.id)
      .eq("season_id", current)
      .maybeSingle();
    rating = data;
  }

  // Si el jugador todavía no tiene partidos en esta temporada, mostramos una carta "rookie" en 50
  const displayRating: PlayerRatingRow = rating ?? {
    player_id: params.id,
    full_name: profile.full_name,
    nickname: profile.nickname,
    avatar_url: profile.avatar_url,
    matches_played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    goals: 0,
    assists: 0,
    goal_contributions: 0,
    goals_per_match: 0,
    assists_per_match: 0,
    ritmo: 50,
    pase: 50,
    tiro: 50,
    defensa: 50,
    fisico: 50,
    vision: 50,
    media_general: 50,
  };

  // --- Historial de partidos (filtrado por temporada, salvo que se vea el histórico) ---
  const rosterQuery = supabase
    .from("match_players")
    .select("team, match:matches(id, match_date, location, status, result_color, result_blanco, season_id)")
    .eq("player_id", params.id);

  const { data: rosterRows } = await rosterQuery;

  const matchHistory: MatchHistoryItem[] = [];
  for (const row of rosterRows ?? []) {
    const match = row.match as unknown as {
      id: string;
      match_date: string;
      location: string;
      status: string;
      result_color: number | null;
      result_blanco: number | null;
      season_id: string;
    } | null;
    if (!match || match.status !== "finalizado" || match.result_color === null || match.result_blanco === null) {
      continue;
    }
    if (current !== "historico" && match.season_id !== current) continue;
    matchHistory.push({
      matchId: match.id,
      date: match.match_date,
      location: match.location,
      team: row.team,
      resultColor: match.result_color,
      resultBlanco: match.result_blanco,
    });
  }
  matchHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
  const matchHistoryTop = matchHistory.slice(0, 10);

  // --- Últimos goles ---
  const { data: goalRows } = await supabase
    .from("goals")
    .select("id, minute, match:matches(id, match_date, location, season_id)")
    .eq("player_id", params.id);

  const ultimosGoles: ActivityItem[] = [];
  for (const g of goalRows ?? []) {
    const match = g.match as unknown as { id: string; match_date: string; location: string; season_id: string } | null;
    if (!match) continue;
    if (current !== "historico" && match.season_id !== current) continue;
    ultimosGoles.push({ id: g.id, matchId: match.id, date: match.match_date, location: match.location, minute: g.minute });
  }
  ultimosGoles.sort((a, b) => (a.date < b.date ? 1 : -1));
  const ultimosGolesTop = ultimosGoles.slice(0, 5);

  // --- Últimas asistencias ---
  const { data: assistRows } = await supabase
    .from("goals")
    .select(
      "id, minute, match:matches(id, match_date, location, season_id), scorer:profiles!goals_player_id_fkey(full_name, nickname)"
    )
    .eq("assist_player_id", params.id);

  const ultimasAsistencias: ActivityItem[] = [];
  for (const g of assistRows ?? []) {
    const match = g.match as unknown as { id: string; match_date: string; location: string; season_id: string } | null;
    const scorer = g.scorer as unknown as { full_name: string; nickname: string | null } | null;
    if (!match) continue;
    if (current !== "historico" && match.season_id !== current) continue;
    ultimasAsistencias.push({
      id: g.id,
      matchId: match.id,
      date: match.match_date,
      location: match.location,
      minute: g.minute,
      targetName: scorer ? scorer.nickname || scorer.full_name : null,
    });
  }
  ultimasAsistencias.sort((a, b) => (a.date < b.date ? 1 : -1));
  const ultimasAsistenciasTop = ultimasAsistencias.slice(0, 5);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/jugadores" className="p-2 -ml-2 text-base-500">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Ficha de jugador</h1>
        </div>

        {isOwnProfile && (
          <Link
            href="/dashboard/perfil/editar"
            className="p-2 text-base-500 flex items-center gap-1 text-sm"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
        )}
      </div>

      {seasons && seasons.length > 0 && (
        <SeasonSelector seasons={seasons} current={current} includeHistorico />
      )}

      {/* Carta FUT */}
      <div className="flex justify-center py-2">
        <FutCard
          name={displayRating.full_name}
          nickname={displayRating.nickname}
          avatarUrl={displayRating.avatar_url}
          overall={displayRating.media_general}
          stats={{
            ritmo: displayRating.ritmo,
            pase: displayRating.pase,
            tiro: displayRating.tiro,
            defensa: displayRating.defensa,
            fisico: displayRating.fisico,
            vision: displayRating.vision,
          }}
        />
      </div>

      {profile?.created_at && (
        <p className="text-center text-xs text-base-500 -mt-2">
          Jugador desde {formatearFecha(profile.created_at)}
        </p>
      )}

      {/* Estadísticas */}
      <section>
        <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide mb-2">
          Estadísticas {current === "historico" ? "(histórico total)" : ""}
        </h2>
        <PlayerStatsGrid stats={displayRating} />
      </section>

      {/* Historial de partidos */}
      <section>
        <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide mb-2">
          Historial de partidos
        </h2>
        <MatchHistoryList items={matchHistoryTop} />
      </section>

      {/* Últimos goles */}
      <section>
        <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide mb-2">
          Últimos goles
        </h2>
        <ActivityFeed items={ultimosGolesTop} emptyLabel="Todavía no ha marcado goles." icon="⚽" />
      </section>

      {/* Últimas asistencias */}
      <section>
        <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide mb-2">
          Últimas asistencias
        </h2>
        <ActivityFeed items={ultimasAsistenciasTop} emptyLabel="Todavía no tiene asistencias." icon="🎯" />
      </section>
    </div>
  );
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}
