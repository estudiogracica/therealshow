"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { SeasonOption } from "@/components/SeasonSelector";

export function SeasonsList({ seasons }: { seasons: SeasonOption[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [pending, setPending] = useState<SeasonOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleActivate() {
    if (!pending) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("seasons").update({ is_active: true }).eq("id", pending.id);

    setLoading(false);
    setPending(null);

    if (error) {
      setError("No se pudo activar la temporada.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-danger text-sm px-1">{error}</p>}

      {seasons.map((s) => (
        <div key={s.id} className="card p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{s.name}</p>
            {s.is_active && (
              <p className="text-xs text-pitch-500 font-semibold flex items-center gap-1 mt-0.5">
                <Check className="w-3.5 h-3.5" /> Temporada activa
              </p>
            )}
          </div>

          {!s.is_active && (
            <button
              type="button"
              onClick={() => setPending(s)}
              className="text-pitch-500 text-sm font-semibold shrink-0"
            >
              Activar
            </button>
          )}
        </div>
      ))}

      <ConfirmDialog
        open={pending !== null}
        title="¿Activar esta temporada?"
        description={
          pending
            ? `"${pending.name}" pasará a ser la temporada activa. Los nuevos partidos que crees se asignarán a ella por defecto.`
            : undefined
        }
        confirmLabel="Sí, activar"
        loading={loading}
        onConfirm={handleActivate}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
