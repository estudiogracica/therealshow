import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * Uso: const supabase = createClient();
 *
 * Nota: no forzamos aquí el genérico <Database> de TypeScript (ver el mismo
 * comentario en lib/supabase/client.ts). Sin esto, el build de producción
 * puede fallar de forma muy puntual con errores de tipos difíciles de prever.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Se puede ignorar si se llama desde un Server Component.
            // El middleware se encarga de refrescar la sesión.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Idem
          }
        },
      },
    }
  );
}
