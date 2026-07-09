import { createClient } from "@/lib/supabase/server";
import { RankingTabs } from "@/components/RankingTabs";
import { SeasonSelector } from "@/components/SeasonSelector";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: { temporada?: string };
}) {
  const supabase = createClient();

  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, name, is_active")
    .order("created_at", { ascending: false });

  const activeSeason = seasons?.find((s) => s.is_active) ?? seasons?.[0];
  const current = searchParams.temporada || activeSeason?.id || "historico";

  const players =
    current === "historico"
      ? (
          await supabase
            .from("player_ratings")
            .select("player_id, full_name, nickname, avatar_url, matches_played, wins, goals, assists")
        ).data
      : (
          await supabase
            .from("player_season_stats")
            .select("player_id, full_name, nickname, avatar_url, matches_played, wins, goals, assists")
            .eq("season_id", current)
        ).data;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Ranking</h1>

      {seasons && seasons.length > 0 && (
        <SeasonSelector seasons={seasons} current={current} includeHistorico />
      )}

      <RankingTabs players={players ?? []} />
    </div>
  );
}
