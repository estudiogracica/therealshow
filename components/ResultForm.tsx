"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ScoreStepper } from "@/components/ScoreStepper";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function ResultForm({
  matchId,
  initialColor,
  initialBlanco,
  wasFinalizado,
}: {
  matchId: string;
  initialColor: number;
  initialBlanco: number;
  wasFinalizado: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [color, setColor] = useState(initialColor);
  const [blanco, setBlanco] = useState(initialBlanco);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmReopen, setConfirmReopen] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("matches")
      .update({
        result_color: color,
        result_blanco: blanco,
        status: "finalizado",
      })
      .eq("id", matchId);

    setLoading(false);

    if (error) {
      setError("No se pudo guardar el resultado. Inténtalo de nuevo.");
      return;
    }

    router.push(`/dashboard/partidos/${matchId}`);
    router.refresh();
  }

  async function handleReopen() {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("matches")
      .update({
        result_color: null,
        result_blanco: null,
        status: "pendiente",
      })
      .eq("id", matchId);

    setLoading(false);
    setConfirmReopen(false);

    if (error) {
      setError("No se pudo reabrir el partido. Inténtalo de nuevo.");
      return;
    }

    router.push(`/dashboard/partidos/${matchId}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-6 flex items-center justify-center gap-8">
        <ScoreStepper label="Color" dotClass="bg-danger" value={color} onChange={setColor} />
        <span className="text-base-500 text-2xl font-display">—</span>
        <ScoreStepper label="Blanco" dotClass="bg-white" value={blanco} onChange={setBlanco} />
      </div>

      {error && <p className="text-danger text-sm text-center">{error}</p>}

      <button type="button" onClick={handleSave} disabled={loading} className="btn-primary">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        Guardar resultado y finalizar
      </button>

      {wasFinalizado && (
        <button
          type="button"
          onClick={() => setConfirmReopen(true)}
          disabled={loading}
          className="text-base-500 text-sm underline underline-offset-2"
        >
          Quitar resultado y volver a "pendiente"
        </button>
      )}

      <ConfirmDialog
        open={confirmReopen}
        title="¿Quitar el resultado?"
        description="El partido volverá a estado pendiente y se borrará el marcador guardado."
        confirmLabel="Sí, quitar resultado"
        danger
        loading={loading}
        onConfirm={handleReopen}
        onCancel={() => setConfirmReopen(false)}
      />
    </div>
  );
}
