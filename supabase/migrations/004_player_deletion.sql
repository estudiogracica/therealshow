-- =========================================================
-- FUTBOL APP — Migración: permitir eliminar jugadores
-- Ejecutar en Supabase: SQL Editor > New query > pegar y Run
-- =========================================================

-- Al eliminar un jugador (desde auth.users, en cascada hasta profiles):
--
-- 1. Sus propios goles se eliminan (tiene sentido: son "suyos").
-- 2. Si dio una asistencia a un gol de OTRO jugador, esa asistencia se
--    queda en null (el gol de la otra persona no se toca ni se pierde).
-- 3. Si creó algún partido, el partido se conserva igualmente
--    (solo se pierde la referencia de "quién lo creó").
-- 4. Su convocatoria a partidos (match_players) ya se eliminaba en cascada
--    desde la Fase 1, eso no cambia.

alter table public.goals drop constraint goals_player_id_fkey;
alter table public.goals
  add constraint goals_player_id_fkey
  foreign key (player_id) references public.profiles(id) on delete cascade;

alter table public.goals drop constraint goals_assist_player_id_fkey;
alter table public.goals
  add constraint goals_assist_player_id_fkey
  foreign key (assist_player_id) references public.profiles(id) on delete set null;

alter table public.matches alter column created_by drop not null;
alter table public.matches drop constraint matches_created_by_fkey;
alter table public.matches
  add constraint matches_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;
