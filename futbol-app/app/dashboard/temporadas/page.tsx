import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { SeasonCreateForm } from "@/components/SeasonCreateForm";
import { SeasonsList } from "@/components/SeasonsList";

export default async function TemporadasPage() {
  const { profile } = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  const supabase = createClient();
  const { data: seasonsRaw } = await supabase
    .from("seasons")
    .select("id, name, is_active")
    .order("created_at", { ascending: false });
  const seasons = seasonsRaw as { id: string; name: string; is_active: boolean }[] | null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="p-2 -ml-2 text-base-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Temporadas</h1>
      </div>

      <SeasonCreateForm />

      {!seasons || seasons.length === 0 ? (
        <div className="card p-6 text-center text-base-500">Todavía no hay temporadas creadas.</div>
      ) : (
        <SeasonsList seasons={seasons} />
      )}
    </div>
  );
}
