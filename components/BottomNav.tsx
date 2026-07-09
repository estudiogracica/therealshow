"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Trophy, User, Users } from "lucide-react";
import clsx from "clsx";

const ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/jugadores", label: "Jugadores", icon: Users },
  { href: "/dashboard/partidos", label: "Partidos", icon: CalendarDays },
  { href: "/dashboard/ranking", label: "Ranking", icon: Trophy },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-base-800/95 backdrop-blur border-t border-base-700 safe-bottom">
      <div className="max-w-md mx-auto flex items-stretch">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[64px]"
            >
              <Icon
                className={clsx("w-6 h-6", active ? "text-pitch-500" : "text-base-500")}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={clsx(
                  "text-[11px] font-medium",
                  active ? "text-pitch-500" : "text-base-500"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
