"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Loader2 } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import type { TeamColor } from "@/lib/supabase/types";

export interface PlayerOption {
  id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
}

interface TeamEditorProps {
  matchId: string;
  players: PlayerOption[];
  initialAssignments: Record<string, TeamColor>;
}

type Assignment = TeamColor | null;

export function TeamEditor({ matchId, players, initialAssignments }: TeamEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [assignments, setAssignments] = useState<Record<string, Assignment>>(() => {
    const initial: Record<string, Assignment> = {};
    for (const p of players) {
      initial[p.id] = initialAssignments[p.id] ?? null;
    }
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countColor = Object.values(assignments).filter((t) => t === "color").length;
  const countBlanco = Object.values(assignments).filter((t) => t === "blanco").length;

  function setTeam(playerId: string, team: Assignment) {
    setAssignments((prev) => ({ ...prev, [playerId]: team }));
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    const { error: delError } = await supabase.from("match_players").delete().eq("match_id", matchId);
    if (delError) {
      setError("No se pudieron guardar los equipos. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    const rows = Object.entries(assignments)
      .filter(([, team]) => team !== null)
      .map(([player_id, team]) => ({ match_id: matchId, player_id, team: team as TeamColor }));

    if (rows.length > 0) {
      const { error: insError } = await supabase.from("match_players").insert(rows);
      if (insError) {
        setError("No se pudieron guardar los equipos. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }
    }

    router.push(`/dashboard/partidos/${matchId}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Contador de equipos */}
      <div className="flex items-center justify-center gap-6 card p-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-danger" />
          <span className="font-semibold">Color: {countColor}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span className="font-semibold">Blanco: {countBlanco}</span>
        </div>
      </div>

      {/* Lista de jugadores */}
      <div className="flex flex-col gap-2">
        {players.map((p) => (
          <div key={p.id} className="card p-3 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-base-700 shrink-0 flex items-center justify-center">
              {p.avatar_url ? (
                <Image src={p.avatar_url} alt={p.full_name} fill sizes="40px" className="object-cover" />
              ) : (
                <User className="w-5 h-5 text-base-500" />
              )}
            </div>
            <span className="flex-1 truncate text-sm font-medium">{p.nickname || p.full_name}</span>

            <div className="flex gap-1 shrink-0">
              <TeamButton
                active={assignments[p.id] === "color"}
                colorClass="bg-danger"
                onClick={() => setTeam(p.id, assignments[p.id] === "color" ? null : "color")}
                label="C"
              />
              <TeamButton
                active={assignments[p.id] === "blanco"}
                colorClass="bg-white"
                onClick={() => setTeam(p.id, assignments[p.id] === "blanco" ? null : "blanco")}
                label="B"
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-danger text-sm px-1">{error}</p>}

      <button type="button" onClick={handleSave} disabled={loading} className="btn-primary">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        Guardar equipos
      </button>
    </div>
  );
}

function TeamButton({
  active,
  colorClass,
  onClick,
  label,
}: {
  active: boolean;
  colorClass: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-11 h-11 rounded-xl2 flex items-center justify-center font-bold text-sm border-2 transition-colors",
        active ? clsx(colorClass, colorClass === "bg-white" ? "text-base-950" : "text-white", "border-transparent") : "bg-base-700 text-base-500 border-base-600"
      )}
    >
      {label}
    </button>
  );
}
