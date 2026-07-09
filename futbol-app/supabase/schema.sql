-- =========================================================
-- FUTBOL APP — Esquema de base de datos (Fase 3)
-- Ejecutar en Supabase: SQL Editor > New query > pegar y Run
-- =========================================================

-- Extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------
create type player_role as enum ('admin', 'player');
create type match_status as enum ('pendiente', 'finalizado');
create type team_color as enum ('color', 'blanco');

-- ---------------------------------------------------------
-- 1. PROFILES (jugadores / usuarios)
-- Extiende auth.users de Supabase Auth 1:1
-- ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  nickname text,
  avatar_url text,
  role player_role not null default 'player',
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público de cada jugador, 1:1 con auth.users';

-- ---------------------------------------------------------
-- 2. MATCHES (partidos)
-- ---------------------------------------------------------
create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  match_date date not null,
  match_time time not null,
  location text not null,
  status match_status not null default 'pendiente',
  result_color smallint,
  result_blanco smallint,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.matches is 'Cada partido organizado por el grupo';

-- ---------------------------------------------------------
-- 3. MATCH_PLAYERS (jugadores convocados + su equipo)
-- Relación N:M entre matches y profiles
-- ---------------------------------------------------------
create table public.match_players (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  team team_color not null,
  unique (match_id, player_id) -- un jugador solo puede estar en un equipo por partido
);

comment on table public.match_players is 'Convocatoria: qué jugador va en qué equipo (Color/Blanco) en cada partido';

-- ---------------------------------------------------------
-- 4. GOALS (goles, con asistencia opcional incluida)
-- ---------------------------------------------------------
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.profiles(id),
  assist_player_id uuid references public.profiles(id),
  team team_color not null,
  minute smallint check (minute is null or (minute >= 0 and minute <= 200)),
  created_at timestamptz not null default now(),
  constraint goal_assist_different_player check (assist_player_id is null or assist_player_id <> player_id)
);

comment on table public.goals is 'Un gol por fila. La asistencia es el campo assist_player_id (opcional)';

-- ---------------------------------------------------------
-- ÍNDICES para consultas de estadísticas/rankings
-- ---------------------------------------------------------
create index idx_match_players_player on public.match_players(player_id);
create index idx_match_players_match on public.match_players(match_id);
create index idx_goals_player on public.goals(player_id);
create index idx_goals_assist on public.goals(assist_player_id);
create index idx_goals_match on public.goals(match_id);
create index idx_matches_date on public.matches(match_date desc);

-- ---------------------------------------------------------
-- TRIGGER: crear perfil automáticamente al registrarse
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Nuevo jugador'),
    new.raw_user_meta_data->>'nickname'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- VISTA: estadísticas agregadas por jugador
-- (partidos jugados, victorias, derrotas, empates, goles, asistencias...)
-- ---------------------------------------------------------
create or replace view public.player_stats as
with played as (
  select
    mp.player_id,
    mp.match_id,
    mp.team,
    m.status,
    m.result_color,
    m.result_blanco
  from public.match_players mp
  join public.matches m on m.id = mp.match_id
  where m.status = 'finalizado'
),
results as (
  select
    player_id,
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
  group by player_id
),
goals_agg as (
  select player_id, count(*) as goals
  from public.goals
  group by player_id
),
assists_agg as (
  select assist_player_id as player_id, count(*) as assists
  from public.goals
  where assist_player_id is not null
  group by assist_player_id
)
select
  p.id as player_id,
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
from public.profiles p
left join results r on r.player_id = p.id
left join goals_agg g on g.player_id = p.id
left join assists_agg a on a.player_id = p.id;

comment on view public.player_stats is 'Estadísticas agregadas por jugador, usada en Ranking y Perfil/Carta FUT';

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- Regla general: todo el grupo puede LEER todo (app privada de amigos).
-- Solo el propio usuario edita su perfil.
-- Solo un admin puede crear/editar/eliminar partidos, equipos, goles y resultados.
-- =========================================================

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.goals enable row level security;

-- Helper: ¿el usuario actual es admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- --- profiles ---
create policy "Cualquier usuario autenticado puede ver perfiles"
  on public.profiles for select
  to authenticated using (true);

create policy "Un usuario puede actualizar su propio perfil"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- --- matches ---
create policy "Cualquier usuario autenticado puede ver partidos"
  on public.matches for select
  to authenticated using (true);

create policy "Solo admin crea partidos"
  on public.matches for insert
  to authenticated with check (public.is_admin());

create policy "Solo admin edita partidos"
  on public.matches for update
  to authenticated using (public.is_admin());

create policy "Solo admin elimina partidos"
  on public.matches for delete
  to authenticated using (public.is_admin());

-- --- match_players (equipos) ---
create policy "Cualquier usuario autenticado puede ver convocatorias"
  on public.match_players for select
  to authenticated using (true);

create policy "Solo admin gestiona equipos"
  on public.match_players for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- --- goals ---
create policy "Cualquier usuario autenticado puede ver goles"
  on public.goals for select
  to authenticated using (true);

create policy "Solo admin gestiona goles"
  on public.goals for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- STORAGE: bucket para fotos de perfil
-- (crear también desde el dashboard: Storage > New bucket > "avatars", público)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Fotos de perfil visibles para todos"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Un usuario sube su propia foto"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Un usuario actualiza su propia foto"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- =========================================================
-- NOTA: para crear el primer administrador, ejecuta manualmente:
-- update public.profiles set role = 'admin' where id = 'UUID-DEL-USUARIO';
-- =========================================================
