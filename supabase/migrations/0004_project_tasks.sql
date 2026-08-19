-- Taches d'un projet : checklist cochable dans la carte Kanban. Supprimees avec
-- le projet (cascade) : une tache orpheline n'a pas de sens.
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label text not null,
  done boolean not null default false,
  position integer not null default 0
);

create index if not exists project_tasks_project_position_idx
  on public.project_tasks (project_id, position);

alter table public.project_tasks enable row level security;

create policy "admins gerent les taches"
  on public.project_tasks for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());
