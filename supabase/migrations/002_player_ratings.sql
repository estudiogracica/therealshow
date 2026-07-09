-- =========================================================
-- FUTBOL APP — Migración Fase 2
-- Carta FUT: 6 atributos + Media General calculados automáticamente
-- Ejecutar en Supabase: SQL Editor > New query > pegar y Run
-- (requiere haber ejecutado antes supabase/schema.sql)
-- =========================================================

-- ---------------------------------------------------------
-- NOTA sobre las fórmulas
-- La app no registra eventos en bruto (sprints, entradas, pases...),
-- así que cada atributo es un PROXY calculado a partir de lo que sí
-- registramos: goles, asistencias y resultados de partido.
-- Todos los atributos se acotan entre 40 y 99, como en un juego real.
-- Un jugador sin partidos jugados aún arranca con una carta "ROOKIE" (50 en todo).
-- ---------------------------------------------------------

create or replace view public.player_ratings as
with s as (
  select * from public.player_stats
),
rates as (
  select
    s.*,
    case when matches_played = 0 then 0 else wins::numeric   / matches_played end as win_rate,
    case when matches_played = 0 then 0 else losses::numeric / matches_played end as loss_rate
  from s
),
attrs as (
  select
    r.*,

    -- ⚡ RITMO: frecuencia goleadora + rodaje (partidos jugados)
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40,
        50 + (goals_per_match * 14) + least(matches_played, 20) * 0.6
      )))
    end as ritmo,

    -- 🎯 PASE: asistencias por partido + participación de gol total
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40,
        50 + (assists_per_match * 22) + least(goal_contributions, 15) * 0.4
      )))
    end as pase,

    -- ⚽ TIRO: goles por partido, el atributo más ligado al finalizador
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40,
        50 + (goals_per_match * 26)
      )))
    end as tiro,

    -- 🛡 DEFENSA: proxy a partir del % de victorias del equipo (menos derrotas resta)
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40,
        50 + (win_rate * 32) - (loss_rate * 14)
      )))
    end as defensa,

    -- 💪 FÍSICO: aguante/participación medida en partidos disputados
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40,
        50 + least(matches_played, 30) * 1.1
      )))
    end as fisico,

    -- 🧠 VISIÓN: mezcla de asistencias y goles (creatividad + últimopase)
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40,
        50 + (assists_per_match * 16) + (goals_per_match * 8)
      )))
    end as vision

  from rates r
)
select
  player_id,
  full_name,
  nickname,
  avatar_url,
  matches_played,
  wins,
  losses,
  draws,
  goals,
  assists,
  goal_contributions,
  goals_per_match,
  assists_per_match,
  ritmo,
  pase,
  tiro,
  defensa,
  fisico,
  vision,
  round((ritmo + pase + tiro + defensa + fisico + vision) / 6.0) as media_general
from attrs;

comment on view public.player_ratings is
  'Carta FUT: 6 atributos (proxy calculado desde goles/asistencias/resultados) + media general. Se recalcula solo, en vivo, cada vez que se consulta.';

-- Las vistas heredan RLS de las tablas base (profiles, matches, goals, match_players),
-- así que no hace falta política adicional: cualquier usuario autenticado puede leerla.
