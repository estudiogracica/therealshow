"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AvatarUploader({
  userId,
  currentUrl,
}: {
  userId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("La imagen no puede superar 4 MB.");
      return;
    }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("No se pudo subir la imagen. Inténtalo de nuevo.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq("id", userId);

    setUploading(false);

    if (updateError) {
      setError("No se pudo guardar la foto en tu perfil.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-base-600 bg-base-800 flex items-center justify-center"
      >
        {preview ? (
          <Image src={preview} alt="Foto de perfil" fill sizes="112px" className="object-cover" />
        ) : (
          <User className="w-10 h-10 text-base-500" />
        )}

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <span className="text-xs text-base-500">Toca para cambiar la foto</span>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}
