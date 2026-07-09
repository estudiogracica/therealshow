import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { MatchForm } from "@/components/MatchForm";
import { DeleteMatchButton } from "@/components/DeleteMatchButton";

export default async function EditarPartidoPage({ params }: { params: { id: string } }) {
  const { profile } = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect(`/dashboard/partidos/${params.id}`);

  const supabase = createClient();
  const { data: match } = await supabase
    .from("matches")
    .select("match_date, match_time, location, season_id")
    .eq("id", params.id)
    .single();

  if (!match) notFound();

  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, name")
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/partidos/${params.id}`} className="p-2 -ml-2 text-base-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Editar partido</h1>
      </div>

      <MatchForm mode="edit" matchId={params.id} seasons={seasons ?? []} initialValues={match} />

      <div className="mt-2">
        <DeleteMatchButton matchId={params.id} />
      </div>
    </div>
  );
}
