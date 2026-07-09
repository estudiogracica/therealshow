import Image from "next/image";
import { User } from "lucide-react";

export interface TeamPlayer {
  id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
}

export function TeamsDisplay({
  colorPlayers,
  blancoPlayers,
}: {
  colorPlayers: TeamPlayer[];
  blancoPlayers: TeamPlayer[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TeamColumn title="Equipo Color" dotClass="bg-danger" players={colorPlayers} />
      <TeamColumn title="Equipo Blanco" dotClass="bg-white" players={blancoPlayers} />
    </div>
  );
}

function TeamColumn({
  title,
  dotClass,
  players,
}: {
  title: string;
  dotClass: string;
  players: TeamPlayer[];
}) {
  return (
    <div className="card p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        <span className="text-xs font-semibold text-base-500 uppercase tracking-wide">{title}</span>
      </div>

      {players.length === 0 ? (
        <p className="text-xs text-base-500">Sin jugadores</p>
      ) : (
        players.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-base-700 shrink-0 flex items-center justify-center">
              {p.avatar_url ? (
                <Image src={p.avatar_url} alt={p.full_name} fill sizes="28px" className="object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 text-base-500" />
              )}
            </div>
            <span className="text-sm truncate">{p.nickname || p.full_name}</span>
          </div>
        ))
      )}
    </div>
  );
}
