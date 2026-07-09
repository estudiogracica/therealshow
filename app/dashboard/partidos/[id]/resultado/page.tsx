import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ResultForm } from "@/components/ResultForm";

export default async function ResultadoPage({ params }: { params: { id: string } }) {
  const { profile } = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect(`/dashboard/partidos/${params.id}`);

  const supabase = createClient();
  const { data: match } = await supabase
    .from("matches")
    .select("status, result_color, result_blanco")
    .eq("id", params.id)
    .single();

  if (!match) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/partidos/${params.id}`} className="p-2 -ml-2 text-base-500">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Resultado</h1>
      </div>

      <ResultForm
        matchId={params.id}
        initialColor={match.result_color ?? 0}
        initialBlanco={match.result_blanco ?? 0}
        wasFinalizado={match.status === "finalizado"}
      />
    </div>
  );
}
