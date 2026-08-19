-- Projets / missions : le suivi de livraison, distinct du pipeline commercial
-- des leads. Un projet nait souvent d'un lead gagne (order_id), mais peut aussi
-- exister seul (mission entrante hors formulaire).
create type project_status as enum ('backlog','en_cours','revue','livre','archive');

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  order_id uuid references public.orders (id) on delete set null,
  title text not null,
  client_name text not null,
  client_email text,
  status project_status not null default 'backlog',
  amount_cents integer,
  due_date date,
  notes text,
  position integer not null default 0
);

create index if not exists projects_status_position_idx on public.projects (status, position);
create index if not exists projects_order_id_idx on public.projects (order_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "admins gerent les projets"
  on public.projects for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());
