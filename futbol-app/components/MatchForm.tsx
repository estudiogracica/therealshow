"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface SeasonChoice {
  id: string;
  name: string;
}

interface MatchFormProps {
  mode: "create" | "edit";
  matchId?: string;
  seasons: SeasonChoice[];
  initialValues?: {
    match_date: string;
    match_time: string;
    location: string;
    season_id: string;
  };
}

export function MatchForm({ mode, matchId, seasons, initialValues }: MatchFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [matchDate, setMatchDate] = useState(initialValues?.match_date ?? "");
  const [matchTime, setMatchTime] = useState(initialValues?.match_time?.slice(0, 5) ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [seasonId, setSeasonId] = useState(initialValues?.season_id ?? seasons[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "create") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("matches")
        .insert({
          match_date: matchDate,
          match_time: matchTime,
          location: location.trim(),
          season_id: seasonId,
          created_by: user!.id,
        })
        .select("id")
        .single();

      setLoading(false);

      if (error || !data) {
        setError("No se pudo crear el partido. Inténtalo de nuevo.");
        return;
      }

      router.push(`/dashboard/partidos/${data.id}`);
      router.refresh();
      return;
    }

    // mode === "edit"
    const { error } = await supabase
      .from("matches")
      .update({
        match_date: matchDate,
        match_time: matchTime,
        location: location.trim(),
        season_id: seasonId,
      })
      .eq("id", matchId!);

    setLoading(false);

    if (error) {
      setError("No se pudo guardar los cambios.");
      return;
    }

    router.push(`/dashboard/partidos/${matchId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Temporada</label>
        <select
          required
          value={seasonId}
          onChange={(e) => setSeasonId(e.target.value)}
          className="input-field"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Fecha</label>
        <input
          type="date"
          required
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Hora</label>
        <input
          type="time"
          required
          value={matchTime}
          onChange={(e) => setMatchTime(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Lugar</label>
        <input
          type="text"
          required
          placeholder="Ej. Polideportivo Municipal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input-field"
        />
      </div>

      {error && <p className="text-danger text-sm px-1">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary mt-2">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {mode === "create" ? "Crear partido" : "Guardar cambios"}
      </button>
    </form>
  );
}
