-- LE TELEPHONE, ET POURQUOI IL CHANGE LE PROBLEME.
--
-- Le courriel a froid butait sur une correlation qu'aucun reglage ne corrige :
-- une structure joignable par courriel est une structure qui a un domaine, donc
-- un site, donc deja un prestataire. Mesure sur la collecte du 27 aout : sur
-- 2 911 structures verifiees, 811 ont un site et 181 publient une adresse
-- exploitable. Six pour cent, et ce sont les six pour cent les moins
-- interessants.
--
-- MESURE DU 28 AOUT, sur les commerces et services cartographies du
-- Val-de-Marne et de ses abords immediats :
--
--     21 157  fiches
--      7 143  portent un telephone                        34 %
--      2 827  un telephone et AUCUN site web              13 %
--      2 634  ni site, ni page Facebook, ni Instagram
--      2 554  et portent un nom exploitable
--        336  dont enseignes de chaine, ecartees
--     ------
--      2 218  appelables, sur UN SEUL departement
--
-- Le renversement est la, et il n'est pas d'echelle mais de NATURE : le
-- telephone atteint precisement les structures SANS site, c'est-a-dire celles
-- qui ont quelque chose a acheter. Le courriel atteignait celles qui en ont
-- deja un.
--
-- CE QUE CETTE MIGRATION NE DECIDE PAS. Qu'on appelle. Elle pose de quoi
-- tracer un appel et respecter une opposition ; composer un numero reste un
-- geste humain, et aucun automate ne doit s'y substituer - un composeur ferait
-- basculer le dispositif entier sous un regime de consentement prealable.

-- 1. L'OPPOSITION EST UNE, QUEL QUE SOIT LE CANAL --------------------------
--
-- Quelqu'un qui s'est desinscrit du courriel s'est oppose a la PROSPECTION,
-- pas a un protocole de transport. Deux listes separees rouvriraient par le
-- telephone les oppositions deja exercees par courriel, ce qui est exactement
-- la faute que la liste de suppression existe pour empecher.
--
-- `suppression_list` reste la table du courriel et n'est pas touchee : cinq
-- appelants la lisent, et une bascule qui oblige a en modifier cinq est une
-- bascule qu'on fait a moitie. La table ci-dessous porte le canal voix, et la
-- garde d'appel interroge LES DEUX.

create table if not exists public.oppositions_telephone (
  numero text primary key,
  ajoute_at timestamptz not null default now(),
  raison text not null,
  note text
);

alter table public.oppositions_telephone enable row level security;

create policy "admins gerent les oppositions telephoniques"
  on public.oppositions_telephone for all
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- 2. LE NUMERO, SOUS UNE SEULE FORME ---------------------------------------
--
-- Un numero ecrit « 01 42 00 11 22 », « +33142001122 » ou « 0142001122 » est
-- le meme numero. Sans forme canonique, une opposition posee sur l'une des
-- ecritures ne bloque pas les deux autres : l'opposition serait enregistree,
-- affichee, et sans effet. C'est le pire des trois etats, parce qu'on la croit
-- posee.

create or replace function public.normalise_telephone(brut text)
returns text language plpgsql immutable set search_path = public as $fn$
declare
  chiffres text;
begin
  if brut is null then return null; end if;
  chiffres := regexp_replace(brut, '[^0-9+]', '', 'g');

  -- Forme internationale francaise deja canonique.
  if chiffres ~ '^\+33[1-9][0-9]{8}$' then return chiffres; end if;
  -- Forme nationale : 0X suivi de huit chiffres.
  if chiffres ~ '^0[1-9][0-9]{8}$' then return '+33' || substring(chiffres from 2); end if;
  -- 0033, encore courant sur les vieux sites.
  if chiffres ~ '^0033[1-9][0-9]{8}$' then return '+33' || substring(chiffres from 5); end if;

  -- Tout le reste est REFUSE, y compris un numero etranger valide. Le
  -- dispositif n'appelle qu'en France : accepter un numero belge ici
  -- reviendrait a fabriquer une fiche qu'aucune garde n'a examinee.
  return null;
end $fn$;

-- 3. LES NUMEROS, RATTACHES A UNE STRUCTURE --------------------------------

create table if not exists public.telephones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  numero text not null unique,
  organisation text not null,
  -- Ce que fait la structure, pour savoir quoi dire en decrochant.
  activite text,
  commune text,
  code_postal text,
  -- D'OU VIENT LE NUMERO, et l'adresse exacte de la page. L'article 14 impose
  -- de dire la source ; « releve sur OpenStreetMap » sans identifiant n'est pas
  -- verifiable par la personne, et c'est elle qui doit pouvoir verifier.
  source text not null,
  source_url text,
  -- Le SIREN quand le rapprochement a reussi. Sa presence n'est PAS exigee :
  -- l'exiger jetterait la majorite du gisement pour un gain qui n'existe pas,
  -- puisque c'est la personne qui decroche qui dit qui elle est.
  siren text,
  nature_juridique text,
  collecte_le timestamptz not null default now(),
  -- Quand l'information de l'article 14 a ete delivree. Voir la garde.
  information_le timestamptz,
  -- Le contact courriel, s'il existe deja. C'est lui qui fait le lien entre
  -- les deux canaux, et donc entre les deux oppositions.
  contact_id uuid references public.contacts (id) on delete set null
);

create index if not exists telephones_a_appeler_idx
  on public.telephones (collecte_le) where information_le is null;

alter table public.telephones enable row level security;

create policy "admins gerent les telephones"
  on public.telephones for all
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- Le numero est stocke SOUS FORME CANONIQUE, verifie a l'ecriture. Une garde
-- qui normalise a la lecture laisse la table porter plusieurs ecritures du meme
-- numero, et l'unicite ne sert alors plus a rien.
create or replace function public.refuse_numero_non_canonique()
returns trigger language plpgsql security invoker set search_path = public as $fn$
begin
  if new.numero is distinct from public.normalise_telephone(new.numero) then
    raise exception
      'Numero non canonique : "%". Attendu la forme +33XXXXXXXXX, obtenue par '
      'normalise_telephone(). Un numero sous deux ecritures rend l''unicite '
      'inoperante, et une opposition posee sur l''une ne bloque pas l''autre.',
      new.numero;
  end if;
  return new;
end $fn$;

drop trigger if exists telephones_canonique on public.telephones;
create trigger telephones_canonique
  before insert or update on public.telephones
  for each row execute function public.refuse_numero_non_canonique();

-- 4. LES APPELS, ET CE QU'ILS ONT DONNE ------------------------------------

create table if not exists public.appels (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  telephone_id uuid not null references public.telephones (id) on delete cascade,
  -- Ce qui s'est passe. `refus_definitif` pose une opposition, voir le
  -- declencheur plus bas.
  issue text not null check (issue in (
    'pas_de_reponse', 'rappeler', 'refus', 'refus_definitif',
    'interesse', 'rendez_vous', 'numero_faux'
  )),
  note text,
  rappeler_le date
);

create index if not exists appels_par_fiche_idx on public.appels (telephone_id, at desc);

alter table public.appels enable row level security;

create policy "admins gerent les appels"
  on public.appels for all
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- UN REFUS DEFINITIF POSE L'OPPOSITION, SANS DEPENDRE D'UN SECOND GESTE.
--
-- Consigner « ne me rappelez plus » puis devoir cliquer ailleurs pour que ce
-- soit vrai, c'est garantir qu'un soir sur deux ce sera oublie. Le declencheur
-- rend le respect de l'opposition mecanique, comme le webhook le fait deja
-- pour une plainte du cote courriel.
create or replace function public.opposition_sur_refus()
returns trigger language plpgsql security definer set search_path = public as $fn$
declare
  v_numero text;
begin
  if new.issue <> 'refus_definitif' then return new; end if;
  select numero into v_numero from public.telephones where id = new.telephone_id;
  insert into public.oppositions_telephone (numero, raison, note)
  values (v_numero, 'refus exprime pendant un appel', new.note)
  on conflict (numero) do nothing;
  return new;
end $fn$;

drop trigger if exists appels_opposition on public.appels;
create trigger appels_opposition
  after insert on public.appels
  for each row execute function public.opposition_sur_refus();

-- 5. LA GARDE D'APPEL ------------------------------------------------------
--
-- Une seule autorite, evaluee AVANT chaque appel, donc couvrant les fiches
-- ecrites avant elle. Meme forme que `peut_recevoir` pour le courriel : quand
-- le code ne sait pas, il refuse.

create or replace function public.peut_appeler(cible text)
returns boolean language sql stable set search_path = public as $fn$
  select
    -- L'opposition exprimee au telephone.
    not exists (select 1 from public.oppositions_telephone o where o.numero = cible)
    -- ET l'opposition exprimee par courriel, sur le meme contact. Une personne
    -- qui a demande a ne plus recevoir de messages n'a pas demande a etre
    -- appelee a la place.
    and not exists (
      select 1
        from public.telephones t
        join public.contacts c on c.id = t.contact_id
        join public.suppression_list s on s.email = c.email
       where t.numero = cible
    )
    and exists (
      select 1 from public.telephones t
       where t.numero = cible
         -- Une association n'achete pas un site a un prestataire de la meme
         -- facon qu'une societe, et son dirigeant est benevole. Ecartee, comme
         -- elle l'est deja du cote courriel.
         and coalesce(t.nature_juridique, '0') not like '9%'
         -- L'INFORMATION DE L'ARTICLE 14 EST DUE DANS LE MOIS QUI SUIT LA
         -- COLLECTE. Une fiche collectee il y a plus de trente jours et jamais
         -- informee ne doit plus etre appelee : l'appeler ne repare pas le
         -- delai, il le prolonge. C'est ce qui oblige a collecter par PETITS
         -- LOTS, et cette garde le rend mecanique plutot que disciplinaire.
         and (t.information_le is not null
              or t.collecte_le > now() - interval '30 days')
    )
$fn$;

comment on function public.peut_appeler(text) is
  'Refuse par defaut. Interroge les DEUX oppositions, celle du telephone et '
  'celle du courriel : quelqu''un qui a dit stop l''a dit a la prospection, '
  'pas a un protocole.';
