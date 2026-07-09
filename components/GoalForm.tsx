"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Goal as GoalIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TeamColor } from "@/lib/supabase/types";

export interface RosterPlayer {
  id: string;
  name: string;
  team: TeamColor;
}

export function GoalForm({ matchId, roster }: { matchId: string; roster: RosterPlayer[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [playerId, setPlayerId] = useState("");
  const [assistId, setAssistId] = useState("");
  const [minute, setMinute] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scorer = useMemo(() => roster.find((p) => p.id === playerId), [roster, playerId]);
  const posiblesAsistentes = roster.filter((p) => p.id !== playerId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scorer) {
      setError("Selecciona quién marcó el gol.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("goals").insert({
      match_id: matchId,
      player_id: scorer.id,
      team: scorer.team,
      assist_player_id: assistId || null,
      minute: minute ? Number(minute) : null,
    });

    setLoading(false);

    if (error) {
      setError("No se pudo añadir el gol. Inténtalo de nuevo.");
      return;
    }

    // Limpiamos el formulario para poder añadir el siguiente gol rápido
    setPlayerId("");
    setAssistId("");
    setMinute("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-base-500">
        <GoalIcon className="w-4 h-4" />
        Añadir gol
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Jugador</label>
        <select
          required
          value={playerId}
          onChange={(e) => {
            setPlayerId(e.target.value);
            setAssistId(""); // evita dejar seleccionada una asistencia inválida
          }}
          className="input-field"
        >
          <option value="">Selecciona jugador…</option>
          {roster.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.team === "color" ? "Color" : "Blanco"})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Asistencia (opcional)</label>
        <select
          value={assistId}
          onChange={(e) => setAssistId(e.target.value)}
          disabled={!playerId}
          className="input-field disabled:opacity-50"
        >
          <option value="">Sin asistencia</option>
          {posiblesAsistentes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.team === "color" ? "Color" : "Blanco"})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Minuto (opcional)</label>
        <input
          type="number"
          min={0}
          max={200}
          inputMode="numeric"
          placeholder="Ej. 34"
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          className="input-field"
        />
      </div>

      {error && <p className="text-danger text-sm px-1">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        Añadir gol
      </button>
    </form>
  );
}
