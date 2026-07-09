"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SeasonCreateForm() {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("seasons").insert({ name: name.trim() });

    setLoading(false);

    if (error) {
      setError(
        error.code === "23505" ? "Ya existe una temporada con ese nombre." : "No se pudo crear la temporada."
      );
      return;
    }

    setName("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Nueva temporada
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Nombre de la temporada</label>
        <input
          type="text"
          required
          autoFocus
          placeholder="Ej. Temporada 27/28"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
      </div>

      {error && <p className="text-danger text-sm px-1">{error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Crear
        </button>
      </div>
    </form>
  );
}
