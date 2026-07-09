"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function EditProfileForm({
  userId,
  initialFullName,
  initialNickname,
}: {
  userId: string;
  initialFullName: string;
  initialNickname: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialFullName);
  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        nickname: nickname.trim() || null,
      })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      setError("No se pudo guardar. Inténtalo de nuevo.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Nombre y apellido</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-base-500 px-1">Apodo (opcional)</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Como te llama el grupo"
          className="input-field"
        />
      </div>

      {error && <p className="text-danger text-sm px-1">{error}</p>}
      {saved && <p className="text-pitch-500 text-sm px-1">Cambios guardados ✓</p>}

      <button type="submit" disabled={loading} className="btn-primary mt-2">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        Guardar cambios
      </button>
    </form>
  );
}
