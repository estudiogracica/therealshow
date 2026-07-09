import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FutCard } from "@/components/FutCard";

export default async function JugadoresPage() {
  const supabase = createClient();

  const { data: players } = await supabase
    .from("player_ratings")
    .select("*")
    .order("media_general", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Jugadores</h1>

      {!players || players.length === 0 ? (
        <div className="card p-6 text-center text-base-500">Todavía no hay jugadores registrados.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {players.map((p) => (
            <Link key={p.player_id} href={`/dashboard/jugadores/${p.player_id}`} className="flex justify-center">
              <FutCard
                size="sm"
                name={p.full_name}
                nickname={p.nickname}
                avatarUrl={p.avatar_url}
                overall={p.media_general}
                stats={{
                  ritmo: p.ritmo,
                  pase: p.pase,
                  tiro: p.tiro,
                  defensa: p.defensa,
                  fisico: p.fisico,
                  vision: p.vision,
                }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
