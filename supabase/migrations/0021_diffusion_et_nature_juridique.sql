-- DEUX DEFAUTS DE LA MIGRATION 0012, FERMES ICI.
--
-- ============================================================================
-- 1. LA GARDE QUI MANQUAIT : LE STATUT DE DIFFUSION SIRENE
-- ============================================================================
--
-- Toute personne inscrite au repertoire Sirene peut demander a l'INSEE que ses
-- donnees ne soient pas rendues publiques. C'est un droit d'opposition prevu
-- par le code de commerce, exerce par plus d'un million d'etablissements, et il
-- se lit dans un champ que l'API publie : `statut_diffusion`.
--
-- Ce qu'il faut savoir pour ne pas se tromper de valeur. Il n'existe PLUS de
-- statut "N" : toutes les unites anciennement non diffusibles ont ete basculees
-- en "P", diffusion partielle. Le test correct est donc `= 'O'`, jamais
-- `<> 'N'`, qui laisserait passer toutes les oppositions reelles.
--
-- POURQUOI C'EST LA GARDE LA PLUS IMPORTANTE DU DISPOSITIF. Tout le reste -
-- double opt-in, jeton signe, lien de desinscription - protege des gens qui
-- n'ont encore rien demande. Celle-ci respecte une opposition DEJA EXERCEE,
-- explicitement, par une personne identifiee. La violer n'est pas un defaut de
-- forme, c'est passer outre une volonte exprimee.
--
-- Le statut peut changer. Il se rafraichit avant chaque campagne, il ne se
-- releve pas une fois pour toutes.
--
-- ============================================================================
-- 2. L'ETIQUETTE `b2b_generique` MENTAIT SUR SON FONDEMENT
-- ============================================================================
--
-- La contrainte d'origine exigeait un SIREN et une adresse generique, en
-- s'appuyant sur la position de la CNIL selon laquelle les adresses de type
-- contact@ ou info@ « concernent des personnes morales » et echappent au
-- consentement prealable.
--
-- Or un SIREN ne dit RIEN de la nature juridique. Une entreprise individuelle
-- en a un, et c'est une personne PHYSIQUE. `contact@monresto.fr` ou monresto
-- est une EI ne relevait donc pas de la derogation invoquee.
--
-- Ce que ce n'est pas : une illegalite. L'interet legitime de l'article 6.1.f
-- couvre la sollicitation d'un professionnel sur une adresse professionnelle
-- pour une offre qui releve de sa fonction, quelle que soit sa forme juridique.
--
-- Ce que c'est : un registre qui se trompe sur sa propre base legale. Et un
-- registre qui se trompe sur sa base legale ne protege personne le jour ou on
-- le lui demande.
--
-- Le correctif n'EXCLUT donc pas les entreprises individuelles, ce serait plus
-- strict que le droit. Il OBLIGE a savoir a qui l'on ecrit : la nature
-- juridique devient obligatoire pour le regime sans consentement prealable.
-- Code 1000 = entrepreneur individuel, donc personne physique ; tout autre code
-- designe une personne morale.

alter table public.contacts
  add column if not exists statut_diffusion text,
  add column if not exists nature_juridique text;

comment on column public.contacts.statut_diffusion is
  'Statut de diffusion Sirene releve a la collecte. "O" = diffusible. "P" = '
  'diffusion partielle, la personne s''est opposee : elle ne doit pas etre '
  'demarchee. A rafraichir avant chaque campagne.';

comment on column public.contacts.nature_juridique is
  'Code de nature juridique INSEE. "1000" = entrepreneur individuel, donc '
  'personne physique. Tout autre code designe une personne morale. Determine '
  'le fondement exact du regime sans consentement prealable.';

-- La contrainte est reecrite, pas complete : `add constraint` ne remplace pas.
-- La table est vide, la revalidation est donc immediate.
alter table public.contacts drop constraint if exists contacts_b2b_strict;

alter table public.contacts add constraint contacts_b2b_strict check (
  regime = 'optin'
  or (
    siren is not null
    -- On doit SAVOIR si l'on ecrit a une personne morale ou physique.
    and nature_juridique is not null
    -- Opposition a la diffusion deja exercee : rien ne part.
    and statut_diffusion = 'O'
    and split_part(lower(email::text), '@', 1) = any (array[
      'contact', 'info', 'bonjour', 'hello', 'accueil',
      'direction', 'secretariat', 'commercial', 'admin'
    ])
  )
);
