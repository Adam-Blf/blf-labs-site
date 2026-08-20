-- Catalogue de prestations reutilisables. Objectif : facturer plus vite en
-- reutilisant une prestation deja saisie (designation + prix), au lieu de la
-- retaper. Deux voies l'alimentent : la saisie manuelle du catalogue, et
-- l'enregistrement automatique de chaque ligne de facture ajoutee (auto-save).
create table if not exists public.service_items (
  id uuid primary key default gen_random_uuid(),
  designation text not null,
  unit_price_cents integer not null default 0,
  -- Compteur d'usage : les prestations les plus facturees remontent en tete du
  -- selecteur, ce qui accelere la saisie courante.
  times_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unicite sur la designation normalisee (insensible a la casse) : l'auto-save
-- doit reconnaitre une prestation deja connue pour l'actualiser au lieu d'en
-- creer un doublon a chaque facture.
create unique index if not exists service_items_designation_key
  on public.service_items (lower(designation));

alter table public.service_items enable row level security;

-- Meme regle que le reste du back-office : seul un administrateur BLF en session
-- forte (aal2) accede au catalogue. La table est vide de donnee personnelle,
-- mais elle reste derriere la meme garde par coherence.
create policy "admins gerent le catalogue de prestations"
  on public.service_items for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- Auto-save d'une ligne facturee dans le catalogue. Atomique et sans doublon :
-- une prestation deja connue (designation normalisee) voit son prix actualise et
-- son compteur d'usage incremente, sinon elle est creee. `security invoker` :
-- la fonction s'execute sous les droits de l'appelant, donc la RLS admin
-- s'applique normalement.
create or replace function public.remember_service_item(
  p_designation text,
  p_cents integer
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if trim(coalesce(p_designation, '')) = '' then
    return;
  end if;
  insert into public.service_items (designation, unit_price_cents, times_used)
  values (trim(p_designation), p_cents, 1)
  on conflict (lower(designation))
  do update set
    unit_price_cents = excluded.unit_price_cents,
    times_used = public.service_items.times_used + 1,
    updated_at = now();
end;
$$;
