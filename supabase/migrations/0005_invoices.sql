-- Facturation : devis et factures BLF Lab's. Liee a un projet et/ou au lead.
-- Montants en centimes.
create type invoice_kind as enum ('devis','facture');
create type invoice_status as enum ('brouillon','envoye','paye','annule');

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project_id uuid references public.projects (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  kind invoice_kind not null default 'devis',
  number text,
  status invoice_status not null default 'brouillon',
  -- Micro-entreprise : TVA generalement non applicable (art. 293 B du CGI).
  amount_ht_cents integer not null default 0,
  vat_cents integer not null default 0,
  amount_ttc_cents integer not null default 0,
  issued_at date,
  paid_at date,
  client_name text,
  client_email text,
  client_siren text
);

create unique index if not exists invoices_number_key
  on public.invoices (number) where number is not null;
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_project_id_idx on public.invoices (project_id);

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

create policy "admins gerent la facturation"
  on public.invoices for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());
