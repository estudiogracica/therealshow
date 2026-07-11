import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { RatingsList } from "@/components/RatingsList";

export default async function ValoracionesPage() {
  const { profile } = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  const supabase = createClient();
  const { data: players } = await supabase
    .from("profiles")
    .select("id, full_name, nickname, avatar_url, skill_rating")
    .order("full_name", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="p-2 -ml-2 text-base-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Nivel de juego</h1>
          <p className="text-xs text-base-500">Solo tú ves esto. Se usa para repartir equipos equilibrados.</p>
        </div>
      </div>

      {!players || players.length === 0 ? (
        <div className="card p-6 text-center text-base-500">No hay jugadores registrados todavía.</div>
      ) : (
        <RatingsList players={players} />
      )}
    </div>
  );
}
