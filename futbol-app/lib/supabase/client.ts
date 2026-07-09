import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components.
 * Uso: const supabase = createClient();
 *
 * Nota: no forzamos aquí el genérico <Database> de TypeScript. La librería de
 * Supabase intenta "parsear" el texto de cada .select(...) para adivinar el
 * tipo exacto del resultado, y con tipos escritos a mano (sin generarlos con
 * `supabase gen types`) a veces falla de forma muy sensible al mínimo detalle
 * y bloquea el build entero. Preferimos fiabilidad al desplegar antes que
 * autocompletado extra en el editor.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
