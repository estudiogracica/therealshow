"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import clsx from "clsx";

export interface SeasonOption {
  id: string;
  name: string;
  is_active: boolean;
}

export function SeasonSelector({
  seasons,
  current,
  includeHistorico = false,
  paramName = "temporada",
}: {
  seasons: SeasonOption[];
  current: string; // id de temporada, o "historico"
  includeHistorico?: boolean;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
      {seasons.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => go(s.id)}
          className={clsx(
            "shrink-0 h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
            current === s.id ? "bg-pitch-500 text-base-950" : "bg-base-700 text-base-500"
          )}
        >
          {s.name}
          {s.is_active && current !== s.id && <span className="ml-1.5 text-pitch-500">●</span>}
        </button>
      ))}

      {includeHistorico && (
        <button
          type="button"
          onClick={() => go("historico")}
          className={clsx(
            "shrink-0 h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
            current === "historico" ? "bg-pitch-500 text-base-950" : "bg-base-700 text-base-500"
          )}
        >
          Histórico total
        </button>
      )}
    </div>
  );
}
