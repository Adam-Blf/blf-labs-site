-- Facturation conforme : lignes de detail, champs legaux de l'acheteur, identite
-- emettrice figee, et numerotation sequentielle sans trou.

-- 1. Lignes de facture / devis. Le detail (designation, quantite, prix unitaire)
-- est obligatoire sur une facture ; un montant global ne suffit pas.
create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  designation text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price_cents integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists invoice_lines_invoice_position_idx
  on public.invoice_lines (invoice_id, position);
alter table public.invoice_lines enable row level security;
create policy "admins gerent les lignes de facture"
  on public.invoice_lines for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- 2. Champs manquants sur invoices : identite complete de l'acheteur (exigee sur
-- une facture pro), conditions de paiement, echeance, et snapshot de l'emetteur.
-- issuer_snapshot fige l'identite legale (SITE) au moment de l'emission : une
-- facture emise ne doit jamais changer si le SIRET ou l'adresse evoluent ensuite.
alter table public.invoices
  add column if not exists client_type text not null default 'entreprise',
  add column if not exists client_address_street text,
  add column if not exists client_postal_code text,
  add column if not exists client_city text,
  add column if not exists client_country text,
  add column if not exists payment_terms text,
  add column if not exists due_date date,
  add column if not exists issuer_snapshot jsonb;

-- 3. Numerotation legale : sequentielle, chronologique, sans trou ni doublon.
-- Un compteur par (annee, type). L'upsert atomique incremente sous verrou de
-- ligne : deux emissions simultanees ne peuvent pas produire le meme numero.
create table if not exists public.invoice_counters (
  year integer not null,
  kind invoice_kind not null,
  last_value integer not null default 0,
  primary key (year, kind)
);
alter table public.invoice_counters enable row level security;
create policy "admins gerent le compteur de factures"
  on public.invoice_counters for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());

create or replace function public.next_invoice_number(p_kind invoice_kind, p_year integer)
returns text
language plpgsql
as $$
declare
  v integer;
  prefix text;
begin
  insert into public.invoice_counters (year, kind, last_value)
  values (p_year, p_kind, 1)
  on conflict (year, kind)
    do update set last_value = public.invoice_counters.last_value + 1
  returning last_value into v;

  prefix := case p_kind when 'facture' then 'F' else 'D' end;
  return prefix || '-' || p_year || '-' || lpad(v::text, 4, '0');
end;
$$;
