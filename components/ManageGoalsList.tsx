"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { GoalItem } from "@/components/GoalsList";

export function ManageGoalsList({ goals }: { goals: GoalItem[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [pendingDelete, setPendingDelete] = useState<GoalItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ordenados = [...goals].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("goals").delete().eq("id", pendingDelete.id);

    setLoading(false);
    setPendingDelete(null);

    if (error) {
      setError("No se pudo eliminar el gol.");
      return;
    }

    router.refresh();
  }

  if (ordenados.length === 0) {
    return <p className="text-sm text-base-500 text-center py-4">Todavía no hay goles registrados.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-danger text-sm px-1">{error}</p>}

      {ordenados.map((g) => (
        <div key={g.id} className="card p-3 flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${g.team === "color" ? "bg-danger" : "bg-white"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">⚽ {g.scorerName}</p>
            {g.assistName && (
              <p className="text-xs text-base-500 truncate">Asistencia: {g.assistName}</p>
            )}
          </div>
          {g.minute !== null && <span className="text-xs text-base-500 shrink-0">{g.minute}&apos;</span>}
          <button
            type="button"
            onClick={() => setPendingDelete(g)}
            className="p-2 text-base-500 shrink-0"
            aria-label="Eliminar gol"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="¿Eliminar este gol?"
        description={pendingDelete ? `${pendingDelete.scorerName} — se recalcularán las estadísticas.` : undefined}
        confirmLabel="Sí, eliminar"
        danger
        loading={loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
