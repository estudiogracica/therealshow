"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteMatchButton({ matchId }: { matchId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("matches").delete().eq("id", matchId);

    if (error) {
      setError("No se pudo eliminar el partido.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/partidos");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-14 rounded-xl2 border border-danger/40 text-danger font-semibold flex items-center justify-center gap-2"
      >
        <Trash2 className="w-5 h-5" />
        Eliminar partido
      </button>
      {error && <p className="text-danger text-sm text-center mt-2">{error}</p>}

      <ConfirmDialog
        open={open}
        title="¿Eliminar este partido?"
        description="Se borrarán también los equipos, goles y asistencias asociados. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        danger
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
