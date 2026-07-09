import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el usuario autenticado junto con su perfil (incluye el rol).
 * Útil para decidir en Server Components si se muestran acciones de admin.
 */
export async function getCurrentProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, nickname, avatar_url, role")
    .eq("id", user.id)
    .single();

  return { user, profile };
}
