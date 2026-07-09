import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  redirect(`/dashboard/jugadores/${user.id}`);
}
