import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MatchForm } from "@/components/MatchForm";

export default async function NuevoPartidoPage() {
  const { profile } = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard/partidos");

  const supabase = createClient();
  const { data: seasonsRaw } = await supabase
    .from("seasons")
    .select("id, name")
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });
  const seasons = seasonsRaw as { id: string; name: string }[] | null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/partidos" className="p-2 -ml-2 text-base-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Nuevo partido</h1>
      </div>

      {!seasons || seasons.length === 0 ? (
        <div className="card p-6 text-center text-base-500">
          Primero tienes que crear una temporada en{" "}
          <Link href="/dashboard/temporadas" className="text-pitch-500 font-semibold">
            Temporadas
          </Link>
          .
        </div>
      ) : (
        <MatchForm mode="create" seasons={seasons} />
      )}
    </div>
  );
}
