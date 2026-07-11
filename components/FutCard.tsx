"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import clsx from "clsx";

export interface FutCardStats {
  ritmo: number;
  pase: number;
  tiro: number;
  defensa: number;
  fisico: number;
  vision: number;
}

interface FutCardProps {
  name: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  overall: number;
  stats: FutCardStats;
  size?: "sm" | "lg";
  className?: string;
}

// Pares en el orden clásico de una carta FUT: izquierda / derecha por fila
const ATTR_ROWS: { key: keyof FutCardStats; label: string }[][] = [
  [
    { key: "ritmo", label: "RIT" },
    { key: "tiro", label: "TIR" },
  ],
  [
    { key: "pase", label: "PAS" },
    { key: "defensa", label: "DEF" },
  ],
  [
    { key: "fisico", label: "FIS" },
    { key: "vision", label: "VIS" },
  ],
];

// Silueta tipo "escudo" con esquinas recortadas, inspirada en el formato clásico
// de carta dorada (sin reproducir ningún logo ni diseño protegido de EA/FIFA).
const CARD_CLIP =
  "polygon(14% 0%, 86% 0%, 100% 12%, 100% 80%, 88% 100%, 12% 100%, 0% 80%, 0% 12%)";

export function FutCard({
  name,
  nickname,
  avatarUrl,
  overall,
  stats,
  size = "lg",
  className,
}: FutCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, active: false });

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      setTilt({ rx: (0.5 - py) * 14, ry: (px - 0.5) * 14 });
      setGlare({ x: px * 100, y: py * 100, active: true });
    },
    [reduceMotion]
  );

  const handleLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
    setGlare((g) => ({ ...g, active: false }));
  }, []);

  const isLg = size === "lg";

  return (
    <div
      className={clsx("select-none", isLg ? "w-64" : "w-36", className)}
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="relative aspect-[3/4.3] transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          filter: glare.active
            ? "drop-shadow(0 20px 28px rgba(0,0,0,0.55))"
            : "drop-shadow(0 10px 16px rgba(0,0,0,0.45))",
        }}
      >
        {/* Silueta recortada tipo escudo */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: CARD_CLIP,
            background:
              "linear-gradient(160deg, #FFE9A8 0%, #F4C542 32%, #C9962C 66%, #8A6412 100%)",
          }}
        >
          {/* Textura diagonal holográfica */}
          <div
            className="absolute inset-0 opacity-[0.13] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, #fff 0px, #fff 2px, transparent 2px, transparent 14px)",
            }}
          />

          {/* Brillo que sigue el cursor */}
          {!reduceMotion && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{
                opacity: glare.active ? 0.5 : 0,
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.65), transparent 45%)`,
              }}
            />
          )}

          {/* Barrido de brillo periódico (para móvil) */}
          {!reduceMotion && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="fut-sweep" />
            </div>
          )}

          {/* Borde interior fino */}
          <div className="absolute inset-[3px]" style={{ clipPath: CARD_CLIP, boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.35)" }} />
        </div>

        {/* Contenido */}
        <div className="relative h-full flex flex-col">
          {/* Cabecera: media + escudo decorativo */}
          <div className={clsx("flex items-start justify-between", isLg ? "px-4 pt-5" : "px-2.5 pt-3")}>
            <span
              className={clsx(
                "font-display font-bold text-fut-goldDark drop-shadow-sm leading-none",
                isLg ? "text-4xl" : "text-2xl"
              )}
            >
              {overall}
            </span>

            <div className={clsx("relative shrink-0", isLg ? "w-7 h-9" : "w-4 h-5")}>
              <Image src="/logo.png" alt="Escudo de The Real Show" fill sizes="28px" className="object-contain" />
            </div>
          </div>

          {/* Foto — sin marco, se funde con el fondo */}
          <div className={clsx("relative w-full flex-1 -mt-1", isLg ? "min-h-[42%]" : "min-h-[40%]")}>
            <div
              className="absolute inset-x-[12%] inset-y-0"
              style={{
                maskImage: "linear-gradient(to bottom, black 55%, transparent 96%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 96%)",
              }}
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt={name} fill sizes="256px" className="object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-start justify-center pt-2">
                  <User className={clsx("text-fut-goldDark/40", isLg ? "w-20 h-20" : "w-10 h-10")} strokeWidth={1.2} />
                </div>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className={clsx("relative text-center", isLg ? "px-3 pb-1.5 pt-0.5" : "px-2 pb-1")}>
            <p
              className={clsx(
                "font-display font-bold uppercase tracking-wide text-fut-goldDark truncate",
                isLg ? "text-lg" : "text-[11px]"
              )}
            >
              {nickname || name}
            </p>
          </div>

          {/* Separador */}
          <div className="mx-[18%] h-px bg-fut-goldDark/30" />

          {/* Atributos: 2 columnas x 3 filas con divisor central */}
          <div className={clsx("relative flex-1 grid grid-cols-2", isLg ? "px-4 py-2.5 gap-y-1" : "px-2 py-1.5 gap-y-0.5")}>
            <div className="absolute left-1/2 top-2 bottom-2 w-px bg-fut-goldDark/25 -translate-x-1/2" />
            {ATTR_ROWS.flat().map(({ key, label }, i) => (
              <div
                key={key}
                className={clsx(
                  "flex items-center gap-1.5",
                  i % 2 === 0 ? "justify-end pr-3" : "justify-start pl-3"
                )}
              >
                <span className={clsx("font-display font-bold text-fut-goldDark", isLg ? "text-base" : "text-[10px]")}>
                  {stats[key]}
                </span>
                <span className={clsx("font-semibold text-fut-goldDark/70", isLg ? "text-xs" : "text-[8px]")}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .fut-sweep {
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            75deg,
            transparent 0%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 100%
          );
          animation: fut-sweep-move 5s ease-in-out infinite;
        }
        @keyframes fut-sweep-move {
          0% {
            left: -60%;
          }
          25% {
            left: 130%;
          }
          100% {
            left: 130%;
          }
        }
      `}</style>
    </div>
  );
}
