import clsx from "clsx";
import type { MatchStatus } from "@/lib/supabase/types";

export function StatusBadge({ status }: { status: MatchStatus }) {
  const isPending = status === "pendiente";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
        isPending ? "bg-pitch-500/15 text-pitch-500" : "bg-base-600/40 text-base-500"
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", isPending ? "bg-pitch-500" : "bg-base-500")} />
      {isPending ? "Pendiente" : "Finalizado"}
    </span>
  );
}
