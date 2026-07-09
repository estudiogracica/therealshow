"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) {
        setError(traducirError(error.message));
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(traducirError(error.message));
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      {mode === "register" && (
        <input
          type="text"
          required
          placeholder="Nombre y apellido"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-field"
          autoComplete="name"
        />
      )}

      <input
        type="email"
        required
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-field"
        autoComplete="email"
        inputMode="email"
      />

      <input
        type="password"
        required
        minLength={6}
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-field"
        autoComplete={mode === "register" ? "new-password" : "current-password"}
      />

      {error && (
        <p className="text-danger text-sm px-1" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-2">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
      </button>

      <p className="text-center text-base-500 text-sm mt-2">
        {mode === "register" ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-pitch-500 font-semibold">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className="text-pitch-500 font-semibold">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

// Traduce los mensajes de error más comunes de Supabase Auth al español
function traducirError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Correo o contraseña incorrectos.",
    "User already registered": "Ya existe una cuenta con ese correo.",
    "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
  };
  return map[message] ?? "Ha ocurrido un error. Inténtalo de nuevo.";
}
