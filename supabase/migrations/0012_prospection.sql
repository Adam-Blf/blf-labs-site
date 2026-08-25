-- PROSPECTION PAR EMAIL.
--
-- Deux regimes juridiques cohabitent ici, et la base est ce qui les empeche de
-- se melanger. Ecrire la regle dans un document ne suffit pas : un import fait
-- un soir de fatigue ne relit aucun document.
--
--   regime 'optin'         consentement explicite de la personne, article 6.1.a
--                          du RGPD. Seul regime autorise pour une personne
--                          physique, donc pour un independant ou une profession
--                          liberale, qui EST son activite.
--
--   regime 'b2b_generique' adresse generique d'une personne morale immatriculee,
--                          article L.34-5 du CPCE, opt-out. La contrainte
--                          contacts_b2b_strict le verifie : partie locale dans
--                          une liste blanche ET numero SIREN present. Une
--                          adresse prenom.nom@ est refusee par la base.
--
-- Ce que la base NE porte pas : le contenu des messages. Les sequences vivent
-- dans content/emails/, en TypeScript, pour passer la garde typographique et
-- check:french de l'integration continue, et pour se relire dans une revue de
-- code. Une inscription ne garde qu'un slug et un numero d'etape.

create extension if not exists citext;

create type contact_regime as enum ('optin', 'b2b_generique');

create type contact_statut as enum (
  'en_attente',
  'confirme',
  'desinscrit',
  'bounce',
  'plainte'
);

create type enrollment_statut as enum ('actif', 'termine', 'arrete');

create type envoi_statut as enum (
  'file', 'envoye', 'delivre', 'ouvert', 'clic', 'bounce', 'plainte', 'echec'
);

create type suppression_raison as enum (
  'desinscription', 'plainte', 'bounce_dur', 'demande_directe'
);

-- LES CONTACTS ------------------------------------------------------------

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email citext not null unique,
  nom text,
  organisation text,
  siren text,
  regime contact_regime not null default 'optin',
  statut contact_statut not null default 'en_attente',
  -- D'ou vient l'adresse. Sert a repondre a l'article 14 du RGPD quand la
  -- donnee ne vient pas de la personne elle-meme.
  source text not null,
  -- Derniere ouverture ou dernier clic. Fonde la duree de conservation : trois
  -- ans sans interaction, le consentement est repute caduc.
  last_engagement_at timestamptz,
  constraint contacts_b2b_strict check (
    regime = 'optin'
    or (
      siren is not null
      and split_part(lower(email::text), '@', 1) = any (array[
        'contact', 'info', 'bonjour', 'hello', 'accueil',
        'direction', 'secretariat', 'commercial', 'admin'
      ])
    )
  )
);

create index if not exists contacts_statut_idx on public.contacts (statut);
create index if not exists contacts_regime_idx on public.contacts (regime);

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- LA PREUVE DE CONSENTEMENT -----------------------------------------------
--
-- Table d'ajout seulement. Un consentement ne se corrige pas, il se remplace
-- par un nouveau. C'est la premiere piece qu'un controle demande, et une ligne
-- reecrite ne prouve plus rien.

create table if not exists public.contact_consents (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  donne_at timestamptz not null default now(),
  -- Le texte EXACT affiche a la personne au moment ou elle a coche. Recopie,
  -- pas reference : le libelle du formulaire changera, la preuve ne doit pas.
  texte_affiche text not null,
  version_politique text not null,
  page_origine text not null,
  ip_hash text,
  user_agent text,
  jeton_confirmation text unique,
  confirme_at timestamptz,
  retire_at timestamptz,
  canal_retrait text
);

create index if not exists contact_consents_contact_idx
  on public.contact_consents (contact_id, donne_at desc);

-- Le verrou d'immuabilite. Seules deux colonnes bougent apres coup, et une
-- seule fois chacune : la confirmation du double opt-in, et le retrait.
create or replace function public.consent_immuable()
returns trigger language plpgsql as $fn$
begin
  if new.contact_id is distinct from old.contact_id
     or new.donne_at is distinct from old.donne_at
     or new.texte_affiche is distinct from old.texte_affiche
     or new.version_politique is distinct from old.version_politique
     or new.page_origine is distinct from old.page_origine then
    raise exception 'Une preuve de consentement ne se modifie pas.';
  end if;
  if old.confirme_at is not null and new.confirme_at is distinct from old.confirme_at then
    raise exception 'Une confirmation deja enregistree ne se rejoue pas.';
  end if;
  if old.retire_at is not null and new.retire_at is distinct from old.retire_at then
    raise exception 'Un retrait deja enregistre ne se rejoue pas.';
  end if;
  return new;
end;
$fn$;

create trigger contact_consents_immuable
  before update on public.contact_consents
  for each row execute function public.consent_immuable();

-- LA LISTE DE SUPPRESSION -------------------------------------------------
--
-- Consultee avant chaque envoi, sans exception. Elle survit a la suppression du
-- contact : c'est justement quand la fiche a disparu qu'il faut se souvenir de
-- ne plus jamais ecrire. Une reinscription apres desabonnement a deja coute
-- 250 000 euros a un annonceur (CNIL, deliberation SAN-2024-003).

create table if not exists public.suppression_list (
  email citext primary key,
  raison suppression_raison not null,
  ajoute_at timestamptz not null default now()
);

-- LES INSCRIPTIONS A UNE SEQUENCE -----------------------------------------

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  -- Slug d'une sequence definie dans content/emails/sequences.ts.
  sequence_slug text not null,
  -- Position de la PROCHAINE etape a envoyer, base zero.
  etape integer not null default 0,
  prochaine_echeance_at timestamptz not null default now(),
  statut enrollment_statut not null default 'actif',
  arret_raison text,
  -- Verrou horodate : deux executions du cron qui se chevauchent ne peuvent pas
  -- traiter la meme ligne. Remis a null apres traitement, expire seul.
  verrou_at timestamptz,
  unique (contact_id, sequence_slug)
);

create index if not exists enrollments_dus_idx
  on public.enrollments (prochaine_echeance_at)
  where statut = 'actif';

-- LE JOURNAL DES ENVOIS ---------------------------------------------------
--
-- Ecrit AVANT l'appel a Resend, jamais apres. Si l'appel echoue, il reste une
-- ligne en echec ; si le processus meurt entre les deux, l'unicite empeche le
-- doublon au tour suivant. L'inverse, ecrire apres, envoie deux fois le meme
-- message a la moindre coupure.

create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  enrollment_id uuid references public.enrollments (id) on delete set null,
  sequence_slug text not null,
  etape integer not null,
  sujet text not null,
  resend_id text,
  statut envoi_statut not null default 'file',
  erreur text,
  envoye_at timestamptz,
  unique (enrollment_id, etape)
);

create index if not exists email_sends_contact_idx
  on public.email_sends (contact_id, created_at desc);
create index if not exists email_sends_jour_idx
  on public.email_sends (created_at)
  where statut <> 'echec';

-- LES EVENEMENTS DE LIVRAISON ---------------------------------------------

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  recu_at timestamptz not null default now(),
  resend_id text,
  email citext not null,
  type text not null,
  charge jsonb
);

create index if not exists email_events_resend_idx on public.email_events (resend_id);

-- LA GARDE DE SORTIE ------------------------------------------------------
--
-- Une seule fonction decide si une adresse peut recevoir un message. Le moteur
-- l'appelle, l'ecran d'import l'appelle, et personne n'a besoin de reimplementer
-- la regle. Une regle recopiee a deux endroits diverge au premier correctif.
--
-- Le regime b2b_generique n'attend pas de confirmation : il n'y a pas de double
-- opt-in a confirmer sur une adresse generique. Il reste soumis a la liste de
-- suppression, comme tout le monde.

create or replace function public.peut_recevoir(cible citext)
returns boolean language sql stable set search_path = public as $fn$
  select not exists (select 1 from public.suppression_list s where s.email = cible)
     and exists (
       select 1
         from public.contacts c
        where c.email = cible
          and (
            (c.regime = 'optin' and c.statut = 'confirme')
            or (c.regime = 'b2b_generique' and c.statut in ('en_attente', 'confirme'))
          )
     );
$fn$;

-- La desinscription, en un seul geste atomique : liste de suppression, statut du
-- contact, arret des sequences en cours, horodatage du retrait de consentement.
-- Quatre ecritures separees laisseraient un etat a moitie desinscrit si l'une
-- echoue, et c'est cette moitie qui renverrait un message.

create or replace function public.desinscrire(cible citext, motif suppression_raison)
returns void language plpgsql security definer set search_path = public as $fn$
declare
  cid uuid;
begin
  insert into public.suppression_list (email, raison)
  values (cible, motif)
  on conflict (email) do nothing;

  select id into cid from public.contacts where email = cible;
  if cid is null then
    return;
  end if;

  update public.contacts
     set statut = case motif
                    when 'plainte' then 'plainte'::contact_statut
                    when 'bounce_dur' then 'bounce'::contact_statut
                    else 'desinscrit'::contact_statut
                  end
   where id = cid;

  update public.enrollments
     set statut = 'arrete', arret_raison = motif::text, verrou_at = null
   where contact_id = cid and statut = 'actif';

  update public.contact_consents
     set retire_at = now(), canal_retrait = motif::text
   where contact_id = cid and retire_at is null and confirme_at is not null;
end;
$fn$;

-- SECURITE ----------------------------------------------------------------
--
-- Meme motif que le reste du back-office : lecture et ecriture reservees a
-- l'administrateur en double authentification. Aucune policy pour anon : les
-- inscriptions publiques passent par une route API et la cle de service, comme
-- app/api/orders/route.ts.

alter table public.contacts enable row level security;
alter table public.contact_consents enable row level security;
alter table public.suppression_list enable row level security;
alter table public.enrollments enable row level security;
alter table public.email_sends enable row level security;
alter table public.email_events enable row level security;

create policy "admins gerent les contacts"
  on public.contacts for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());

create policy "admins gerent les consentements"
  on public.contact_consents for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());

create policy "admins gerent la liste de suppression"
  on public.suppression_list for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());

create policy "admins gerent les inscriptions"
  on public.enrollments for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());

create policy "admins lisent les envois"
  on public.email_sends for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());

create policy "admins lisent les evenements"
  on public.email_events for all to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());
