import Link from "next/link";
import { CalendarDays, MapPin, Trophy, Users, IdCard, CalendarRange, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, nickname, role")
    .eq("id", user!.id)
    .single();

  const { data: nextMatch } = await supabase
    .from("matches")
    .select("id, match_date, match_time, location, status")
    .eq("status", "pendiente")
    .order("match_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  const displayName = profile?.nickname || profile?.full_name?.split(" ")[0] || "";

  return (
    <div className="flex flex-col gap-6">
      {/* Saludo */}
      <div>
        <p className="text-base-500 text-sm">Hola,</p>
        <h1 className="text-2xl font-bold">{displayName} 👋</h1>
      </div>

      {/* Próximo partido */}
      <section>
        <h2 className="text-sm font-semibold text-base-500 uppercase tracking-wide mb-2">
          Próximo partido
        </h2>

        {nextMatch ? (
          <Link href={`/dashboard/partidos/${nextMatch.id}`} className="card p-5 flex flex-col gap-3 block">
            <div className="flex items-center gap-2 text-pitch-500 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-pitch-500" />
              PENDIENTE
            </div>
            <div className="flex items-center gap-2 text-white">
              <CalendarDays className="w-5 h-5 text-base-500" />
              <span className="font-display text-xl font-semibold">
                {formatearFecha(nextMatch.match_date)} · {nextMatch.match_time.slice(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-base-500">
              <MapPin className="w-5 h-5" />
              <span>{nextMatch.location}</span>
            </div>
          </Link>
        ) : (
          <div className="card p-6 text-center text-base-500">
            No hay ningún partido programado todavía.
          </div>
        )}
      </section>

      {/* Accesos rápidos */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/jugadores" className="card p-4 flex flex-col gap-2 items-start">
          <IdCard className="w-6 h-6 text-pitch-500" />
          <span className="font-semibold">Jugadores</span>
        </Link>
        <Link href="/dashboard/partidos" className="card p-4 flex flex-col gap-2 items-start">
          <Users className="w-6 h-6 text-pitch-500" />
          <span className="font-semibold">Partidos</span>
        </Link>
        <Link href="/dashboard/ranking" className="card p-4 flex flex-col gap-2 items-start col-span-2">
          <Trophy className="w-6 h-6 text-pitch-500" />
          <span className="font-semibold">Ranking</span>
        </Link>
        {profile?.role === "admin" && (
          <>
            <Link href="/dashboard/valoraciones" className="card p-4 flex flex-col gap-2 items-start">
              <Star className="w-6 h-6 text-pitch-500" />
              <span className="font-semibold">Nivel de juego</span>
            </Link>
            <Link href="/dashboard/temporadas" className="card p-4 flex flex-col gap-2 items-start">
              <CalendarRange className="w-6 h-6 text-pitch-500" />
              <span className="font-semibold">Temporadas</span>
            </Link>
          </>
        )}
      </section>
    </div>
  );
}

function formatearFecha(fecha: string) {
  const date = new Date(`${fecha}T00:00:00`);
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}
