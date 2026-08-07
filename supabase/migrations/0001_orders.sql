-- Demandes de commande recues depuis le site BLF Lab's.
--
-- Principe de securite : les invariants vivent dans la base, pas dans le client.
-- RLS est activee et AUCUNE policy n'autorise le role anonyme. Concretement,
-- meme si la cle publiable fuite, personne ne peut lire ni ecrire cette table
-- depuis un navigateur. L'ecriture passe uniquement par la route d'API, qui
-- utilise la cle de service cote serveur.
--
-- RGPD : aucune adresse IP en clair. `ip_hash` est une empreinte SHA-256 salee,
-- utilisee seulement pour limiter le debit du formulaire.

create type order_status as enum (
  'nouvelle',
  'en_cours',
  'devis_envoye',
  'gagnee',
  'perdue'
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Demande
  project_type text not null,
  budget_range text not null,
  deadline text not null,
  -- Prestations complementaires cochees a la commande (nom de domaine,
  -- hebergement, maintenance...). Stockees en tableau : la liste evolue avec
  -- l'offre, une colonne par option serait ingerable.
  options text[] not null default '{}',
  message text not null,

  -- Contact
  name text not null,
  email text not null,
  phone text,
  company text,

  -- Facturation. Renseigne uniquement pour un client professionnel : une
  -- facture entre professionnels doit porter l'identite complete de l'acheteur,
  -- et le format de facture electronique impose son numero SIREN. Collecter ces
  -- champs a la commande evite de les reclamer au moment d'encaisser.
  customer_type text not null default 'particulier',
  company_name text,
  siren text,
  vat_number text,
  billing_street text,
  billing_postal_code text,
  billing_city text,
  billing_country text,

  -- Garde-fou en base, et pas seulement dans le formulaire : une commande
  -- professionnelle sans raison sociale ni SIREN est refusee a l'ecriture,
  -- quelle que soit la voie utilisee.
  constraint orders_pro_billing_complete check (
    customer_type <> 'entreprise'
    or (
      company_name is not null
      and siren is not null
      and billing_street is not null
      and billing_postal_code is not null
      and billing_city is not null
      and billing_country is not null
    )
  ),

  -- Preuve du consentement, exigee par le RGPD en cas de controle.
  consent_at timestamptz not null,

  -- Suivi commercial
  status order_status not null default 'nouvelle',
  mail_sent boolean not null default false,

  -- Technique
  ip_hash text,
  user_agent text
);

-- La liste du back-office trie par date decroissante et filtre par statut.
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
-- Sert au comptage de la limitation de debit, sur une fenetre glissante.
create index if not exists orders_ip_hash_created_at_idx on public.orders (ip_hash, created_at desc);

alter table public.orders enable row level security;

-- Lecture et mise a jour reservees aux comptes authentifies dont l'email figure
-- dans la liste blanche. Le role anonyme n'a aucune policy, donc aucun acces.
create policy "admins lisent les commandes"
  on public.orders
  for select
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = lower('adam@beloucif.com')
  );

create policy "admins mettent a jour le statut"
  on public.orders
  for update
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = lower('adam@beloucif.com')
  )
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) = lower('adam@beloucif.com')
  );
