-- =========================================================
-- FUTBOL APP — Migración: Temporadas
-- Ejecutar en Supabase: SQL Editor > New query > pegar y Run
-- (requiere haber ejecutado antes schema.sql y 002_player_ratings.sql)
-- =========================================================

-- ---------------------------------------------------------
-- 1. Tabla de temporadas
-- ---------------------------------------------------------
create table public.seasons (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,        -- ej. "Pretemporada 26/27", "Temporada 27/28"
  start_date date,
  end_date date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.seasons is 'Temporadas del grupo. Solo una puede estar activa a la vez.';

-- Solo puede haber una temporada activa: al activar una, se desactivan las demás
create or replace function public.ensure_single_active_season()
returns trigger as $$
begin
  if new.is_active then
    update public.seasons set is_active = false where id <> new.id and is_active = true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_single_active_season
  before insert or update on public.seasons
  for each row execute procedure public.ensure_single_active_season();

-- ---------------------------------------------------------
-- 2. Vincular partidos a una temporada
-- ---------------------------------------------------------
alter table public.matches add column season_id uuid references public.seasons(id);
create index idx_matches_season on public.matches(season_id);

-- Creamos una temporada por defecto y le asignamos los partidos ya existentes,
-- para que nada se quede "huérfano" al aplicar esta migración
insert into public.seasons (name, is_active)
values ('Pretemporada 26/27', true)
on conflict (name) do nothing;

update public.matches
set season_id = (select id from public.seasons where name = 'Pretemporada 26/27')
where season_id is null;

-- A partir de ahora, todo partido nuevo debe llevar temporada
alter table public.matches alter column season_id set not null;

-- ---------------------------------------------------------
-- 3. RLS de seasons (mismo patrón que matches: todos leen, solo admin escribe)
-- ---------------------------------------------------------
alter table public.seasons enable row level security;

create policy "Cualquier usuario autenticado puede ver temporadas"
  on public.seasons for select
  to authenticated using (true);

create policy "Solo admin crea temporadas"
  on public.seasons for insert
  to authenticated with check (public.is_admin());

create policy "Solo admin edita temporadas"
  on public.seasons for update
  to authenticated using (public.is_admin());

create policy "Solo admin elimina temporadas"
  on public.seasons for delete
  to authenticated using (public.is_admin());

-- ---------------------------------------------------------
-- 4. Estadísticas y ratings POR TEMPORADA
-- (player_stats / player_ratings, de la Fase 2, se mantienen igual:
--  siguen siendo el "histórico total" de todas las temporadas juntas)
-- ---------------------------------------------------------
create or replace view public.player_season_stats as
with roster as (
  -- Todo jugador convocado a algún partido de esa temporada
  select distinct m.season_id, mp.player_id
  from public.match_players mp
  join public.matches m on m.id = mp.match_id
),
played as (
  select mp.player_id, m.season_id, mp.team, m.result_color, m.result_blanco
  from public.match_players mp
  join public.matches m on m.id = mp.match_id
  where m.status = 'finalizado'
),
results as (
  select
    season_id, player_id,
    count(*) as matches_played,
    count(*) filter (
      where (team = 'color' and result_color > result_blanco)
         or (team = 'blanco' and result_blanco > result_color)
    ) as wins,
    count(*) filter (
      where (team = 'color' and result_color < result_blanco)
         or (team = 'blanco' and result_blanco < result_color)
    ) as losses,
    count(*) filter (where result_color = result_blanco) as draws
  from played
  group by season_id, player_id
),
goals_agg as (
  select m.season_id, g.player_id, count(*) as goals
  from public.goals g
  join public.matches m on m.id = g.match_id
  group by m.season_id, g.player_id
),
assists_agg as (
  select m.season_id, g.assist_player_id as player_id, count(*) as assists
  from public.goals g
  join public.matches m on m.id = g.match_id
  where g.assist_player_id is not null
  group by m.season_id, g.assist_player_id
)
select
  ro.season_id,
  ro.player_id,
  p.full_name,
  p.nickname,
  p.avatar_url,
  coalesce(r.matches_played, 0) as matches_played,
  coalesce(r.wins, 0) as wins,
  coalesce(r.losses, 0) as losses,
  coalesce(r.draws, 0) as draws,
  coalesce(g.goals, 0) as goals,
  coalesce(a.assists, 0) as assists,
  coalesce(g.goals, 0) + coalesce(a.assists, 0) as goal_contributions,
  case when coalesce(r.matches_played, 0) = 0 then 0
       else round(coalesce(g.goals, 0)::numeric / r.matches_played, 2)
  end as goals_per_match,
  case when coalesce(r.matches_played, 0) = 0 then 0
       else round(coalesce(a.assists, 0)::numeric / r.matches_played, 2)
  end as assists_per_match
from roster ro
join public.profiles p on p.id = ro.player_id
left join results r on r.season_id = ro.season_id and r.player_id = ro.player_id
left join goals_agg g on g.season_id = ro.season_id and g.player_id = ro.player_id
left join assists_agg a on a.season_id = ro.season_id and a.player_id = ro.player_id;

comment on view public.player_season_stats is 'Igual que player_stats pero calculado por separado para cada temporada.';

-- Carta FUT por temporada (mismas fórmulas que player_ratings, aplicadas a cada temporada)
create or replace view public.player_season_ratings as
with s as (
  select * from public.player_season_stats
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
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40, 50 + (goals_per_match * 14) + least(matches_played, 20) * 0.6)))
    end as ritmo,
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40, 50 + (assists_per_match * 22) + least(goal_contributions, 15) * 0.4)))
    end as pase,
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40, 50 + (goals_per_match * 26))))
    end as tiro,
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40, 50 + (win_rate * 32) - (loss_rate * 14))))
    end as defensa,
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40, 50 + least(matches_played, 30) * 1.1)))
    end as fisico,
    case when matches_played = 0 then 50 else
      round(least(99, greatest(40, 50 + (assists_per_match * 16) + (goals_per_match * 8))))
    end as vision
  from rates r
)
select
  season_id, player_id, full_name, nickname, avatar_url,
  matches_played, wins, losses, draws, goals, assists, goal_contributions,
  goals_per_match, assists_per_match,
  ritmo, pase, tiro, defensa, fisico, vision,
  round((ritmo + pase + tiro + defensa + fisico + vision) / 6.0) as media_general
from attrs;

comment on view public.player_season_ratings is 'Carta FUT calculada por separado para cada temporada.';
