-- UN MOTEUR AUTONOME DOIT AVOIR UN FREIN QUI N'EXIGE PAS DE DEPLOIEMENT.
--
-- Etat avant cette migration : pour arreter les envois, il fallait desactiver
-- un workflow GitHub, revoquer un secret, ou changer une variable Vercel et
-- redeployer. Aucun des trois n'est faisable depuis un telephone en trente
-- secondes, et le plafond etait lu au chargement du module, donc figé jusqu'au
-- prochain deploiement.
--
-- Ce n'est pas une commodite. Le premier contact professionnel a `delaiHeures`
-- a zero : apres une inscription, le prochain battement part dans les quinze
-- minutes. La fenetre de rattrapage etait donc de quinze minutes, sans aucun
-- outil pour s'en servir.
--
-- Cette migration pose quatre choses, dans l'ordre ou elles arretent le plus
-- tot :
--
--   1. un INTERRUPTEUR en base, lu avant toute reservation ;
--   2. une QUARANTAINE, qui fait passer la fenetre de quinze minutes a douze
--      heures pour un cout nul ;
--   3. la PREUVE D'APPARTENANCE portee par le contact et exigee par la garde
--      de sortie, donc incontournable par n'importe quel chemin d'ecriture ;
--   4. le STATUT DE DIFFUSION Sirene reverifie a chaque envoi, ce que la
--      migration 0021 annoncait sans le faire.

-- 1. L'INTERRUPTEUR ---------------------------------------------------------

create table if not exists public.moteur_reglages (
  -- Une seule ligne, garantie par la contrainte : un reglage en double serait
  -- un reglage qu'on croit avoir change.
  id boolean primary key default true check (id),
  actif boolean not null default true,
  plafond_jour integer not null default 50 check (plafond_jour >= 0),
  -- Renseignes quand l'arret vient du coupe-circuit, pour qu'un silence
  -- s'explique sans avoir a fouiller un journal.
  motif_arret text,
  arrete_le timestamptz,
  arrete_par text
);

insert into public.moteur_reglages (id) values (true) on conflict (id) do nothing;

comment on table public.moteur_reglages is
  'Interrupteur et plafond du moteur d''envoi, lus AVANT chaque battement. '
  'Le plafond vivait dans une variable d''environnement, donc figee jusqu''au '
  'prochain deploiement.';

alter table public.moteur_reglages enable row level security;

create policy "admins gerent les reglages du moteur"
  on public.moteur_reglages for all
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- 2. LE JOURNAL DES BATTEMENTS ---------------------------------------------
--
-- Le rapport de chaque battement finissait dans un journal GitHub Actions puis
-- disparaissait. Sans trace, rien ne distingue « rien a envoyer » de « plus
-- personne n'appelle la route » : le workflow est vert dans les deux cas.

create table if not exists public.moteur_battements (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  candidats integer not null default 0,
  envoyes integer not null default 0,
  ignores integer not null default 0,
  echecs integer not null default 0,
  purges integer not null default 0,
  journal text[] not null default '{}'
);

create index if not exists moteur_battements_at_idx
  on public.moteur_battements (at desc);

alter table public.moteur_battements enable row level security;

create policy "admins lisent les battements"
  on public.moteur_battements for all
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- 3. LA PREUVE D'APPARTENANCE, PORTEE PAR LE CONTACT ------------------------
--
-- Elle etait calculee par le script de verification et perdue a l'import. Une
-- garde qui vit dans un CSV ne garde rien : le CSV se regenere, se contourne,
-- et ne s'applique pas aux fiches ecrites avant qu'elle existe.
--
-- Portee par le contact et exigee par `peut_recevoir`, elle devient evaluee
-- AVANT CHAQUE ENVOI, donc elle couvre le passe, et aucun chemin d'ecriture ne
-- la contourne - y compris un script jetable ecrit dans six mois.

alter table public.contacts
  add column if not exists preuve_appartenance text
    check (preuve_appartenance in ('commune', 'code_postal', 'manuelle')),
  add column if not exists preuve_url text,
  add column if not exists preuve_le timestamptz;

comment on column public.contacts.preuve_appartenance is
  'Ce qui prouve que le site ou l''adresse a ete lue appartient bien a la '
  'structure. "commune" et "code_postal" sont automatiques ; "manuelle" est '
  'pose depuis le back-office, ligne par ligne, et exige une preuve_url.';

-- Les fiches deja en base ont ete qualifiees a la main par le meme controle,
-- hors du depot, le 27 aout. On les marque pour ce qu'elles sont plutot que de
-- les laisser sans preuve : sans cela, la garde ci-dessous les arreterait
-- toutes, y compris celles a qui un message est deja parti.
update public.contacts
   set preuve_appartenance = 'manuelle',
       preuve_le = now(),
       preuve_url = 'controle du 2026-08-27, commune ou code postal lu sur le site'
 where regime = 'b2b_generique'
   and preuve_appartenance is null
   and exists (select 1 from public.enrollments e where e.contact_id = contacts.id);

-- 4. LA QUARANTAINE ---------------------------------------------------------

alter table public.enrollments
  add column if not exists quarantaine_jusqu_a timestamptz;

comment on column public.enrollments.quarantaine_jusqu_a is
  'Aucun envoi avant cette date, quelle que soit l''echeance. Donne le temps '
  'de relire ce qui va partir : sans elle, une inscription part au battement '
  'suivant, donc dans les quinze minutes.';

-- 5. LA GARDE DE SORTIE, QUI DECIDE ----------------------------------------
--
-- Trois ajouts a la branche professionnelle, tous de la meme famille : ce qui
-- pouvait changer APRES l'ecriture doit etre relu AVANT l'envoi.
--
--   preuve_appartenance   la fiche doit porter la preuve que le site lu est
--                         bien le sien.
--   statut_diffusion      la migration 0021 ecrit que ce statut « se
--                         rafraichit avant chaque campagne, il ne se releve
--                         pas une fois pour toutes ». C'etait une contrainte
--                         CHECK, donc evaluee a l'ECRITURE seulement :
--                         quelqu'un qui exerce son opposition aupres de
--                         l'INSEE apres la collecte continuait de recevoir.
--   pays                  deja pose par 0022, conserve.

create or replace function public.peut_recevoir(cible citext, audience text)
returns boolean language sql stable set search_path = public as $fn$
  select not exists (select 1 from public.suppression_list s where s.email = cible)
     and exists (
       select 1
         from public.contacts c
        where c.email = cible
          and case audience
                when 'optin' then c.regime = 'optin' and c.statut = 'confirme'
                when 'b2b' then c.regime = 'b2b_generique'
                                and c.statut in ('en_attente', 'confirme')
                                and c.pays is not null
                                and public.pays_admet_courriel_professionnel(c.pays)
                                and c.preuve_appartenance is not null
                                and (c.pays <> 'FR' or c.statut_diffusion = 'O')
                when 'devis' then c.statut not in ('desinscrit', 'plainte', 'bounce')
                else false
              end
     );
$fn$;

-- 6. LA PROMESSE DE TROIS ANS, TENUE AUSSI POUR LE REGIME PROFESSIONNEL ------
--
-- Le premier message professionnel annonce une conservation de trois ans au
-- plus. La fonction de purge posee par 0017 filtre `regime = 'optin'` : aucun
-- contact professionnel n'etait jamais purge. C'est mot pour mot le defaut que
-- 0017 existe pour avoir corrige, reproduit sur l'autre regime.

create or replace function public.purge_consentements_caducs()
returns integer language plpgsql security definer set search_path = public as $fn$
declare
  supprimes integer;
begin
  with caducs as (
    delete from public.contacts c
     where (
             -- Consentement repute caduc : trois ans sans interaction.
             c.regime = 'optin'
             and c.statut = 'confirme'
             and coalesce(c.last_engagement_at, c.created_at) < now() - interval '3 years'
           )
        or (
             -- Meme duree pour la voie professionnelle : c'est ce que le
             -- premier message annonce, en toutes lettres.
             c.regime = 'b2b_generique'
             and coalesce(c.last_engagement_at, c.created_at) < now() - interval '3 years'
           )
    returning 1
  )
  select count(*) into supprimes from caducs;
  return supprimes;
end $fn$;

-- 7. LE SUIVI DE DEVIS NE DOIT PAS ETRE AFFAME PAR LE DEMARCHAGE ------------
--
-- La reservation trie par echeance seule. Les inscriptions a froid creees en
-- lot ont toutes une echeance a `now()`, donc elles sont en retard, donc
-- premieres. Un suivi de devis cree demain passe derriere la totalite du
-- retard accumule : a 138 contacts et 50 par jour, six jours ; a 10 000, la
-- relance de devis ne part jamais.
--
-- Or c'est la sequence fondee sur l'article 6.1.b, celle qui repond a quelqu'un
-- qui a DEMANDE une reponse, et c'est celle qui rapporte. Elle passe devant.

create or replace function public.priorite_sequence(slug text)
returns integer language sql immutable set search_path = public as $fn$
  select case slug
           when 'devis' then 0          -- suivi d'une demande, 6.1.b
           when 'carnet' then 1         -- carnet consenti, 6.1.a
           else 2                       -- premier contact a froid, 6.1.f
         end
$fn$;
