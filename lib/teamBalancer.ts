export interface BalanceablePlayer {
  id: string;
  skill: number;
}

/**
 * Reparte a los jugadores convocados en dos equipos ("color" / "blanco")
 * intentando igualar tanto la suma de nivel como el número de jugadores.
 *
 * Estrategia: ordena de mejor a peor nivel y va asignando cada jugador
 * al equipo que menos suma lleve hasta el momento (greedy), sin dejar
 * que un equipo se llene más de lo que le toca si el número es impar.
 */
export function balanceTeams(players: BalanceablePlayer[]): Record<string, "color" | "blanco"> {
  const sorted = [...players].sort((a, b) => b.skill - a.skill);
  const maxPerTeam = Math.ceil(sorted.length / 2);

  const result: Record<string, "color" | "blanco"> = {};
  let colorCount = 0;
  let blancoCount = 0;
  let colorSum = 0;
  let blancoSum = 0;

  for (const player of sorted) {
    let team: "color" | "blanco";

    if (colorCount >= maxPerTeam) {
      team = "blanco";
    } else if (blancoCount >= maxPerTeam) {
      team = "color";
    } else if (colorSum <= blancoSum) {
      team = "color";
    } else {
      team = "blanco";
    }

    result[player.id] = team;
    if (team === "color") {
      colorCount++;
      colorSum += player.skill;
    } else {
      blancoCount++;
      blancoSum += player.skill;
    }
  }

  return result;
}
