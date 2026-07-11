-- =========================================================
-- FUTBOL APP — Migración: Nivel de juego (para el hacedor de equipos)
-- Ejecutar en Supabase: SQL Editor > New query > pegar y Run
-- =========================================================

alter table public.profiles
  add column skill_rating smallint not null default 5
  check (skill_rating between 1 and 10);

comment on column public.profiles.skill_rating is
  'Nota de 1 a 10 puesta por el admin, usada para generar equipos equilibrados. No es visible ni editable por el propio jugador.';

-- ---------------------------------------------------------
-- Protección extra: aunque la política RLS deja que cada uno
-- edite su propio perfil (nombre, apodo, foto), NADIE que no sea
-- admin puede tocar su propia nota de nivel, ni la de otros.
-- ---------------------------------------------------------
create or replace function public.protect_skill_rating()
returns trigger as $$
begin
  if new.skill_rating is distinct from old.skill_rating and not public.is_admin() then
    new.skill_rating := old.skill_rating;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_protect_skill_rating
  before update on public.profiles
  for each row execute procedure public.protect_skill_rating();
