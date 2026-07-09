import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la "service role key" de Supabase — tiene permisos totales,
 * saltándose incluso las reglas de seguridad (RLS).
 *
 * IMPORTANTE: este archivo importa "server-only" a propósito. Si algún día
 * alguien intenta usarlo por error desde un componente de cliente, Next.js
 * lanzará un error en el build en vez de exponer la clave en el navegador.
 *
 * Solo se debe usar dentro de Route Handlers (app/api/.../route.ts).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
