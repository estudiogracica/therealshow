import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { MatchCard } from "@/components/MatchCard";
import { SeasonSelector } from "@/components/SeasonSelector";

export default async function PartidosPage({
  searchParams,
}: {
  searchParams: { temporada?: string };
}) {
  const supabase = createClient();
  const { profile } = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";

  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, name, is_active")
    .order("created_at", { ascending: false });

  const activeSeason = seasons?.find((s) => s.is_active) ?? seasons?.[0];
  const currentSeasonId = searchParams.temporada || activeSeason?.id || "";

  const { data: matches } = await supabase
    .from("matches")
    .select("id, match_date, match_time, location, status, result_color, result_blanco")
    .eq("season_id", currentSeasonId)
    .order("match_date", { ascending: true });

  const proximos = (matches ?? []).filter((m) => m.status === "pendiente");
  const finalizados = (matches ?? [])
    .filter((m) => m.status === "finalizado")
    .sort((a, b) => (a.match_date < b.match_date ? 1 : -1));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Partidos</h1>
      </div>

      {seasons && seasons.length > 0 && (
        <SeasonSelector seasons={seasons} current={currentSeasonId} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide">Próximos</h2>
        {proximos.length === 0 ? (
          <div className="card p-6 text-center text-base-500">No hay partidos pendientes en esta temporada.</div>
        ) : (
          proximos.map((m) => <MatchCard key={m.id} match={m} />)
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide">Finalizados</h2>
        {finalizados.length === 0 ? (
          <div className="card p-6 text-center text-base-500">Todavía no hay partidos finalizados en esta temporada.</div>
        ) : (
          finalizados.map((m) => <MatchCard key={m.id} match={m} />)
        )}
      </section>

      {isAdmin && (
        <Link
          href="/dashboard/partidos/nuevo"
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-pitch-500 text-base-950 flex items-center justify-center shadow-card active:scale-95 transition-transform"
          aria-label="Crear partido"
        >
          <Plus className="w-7 h-7" />
        </Link>
      )}
    </div>
  );
}
