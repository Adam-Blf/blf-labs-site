-- LE COURRIEL A FROID N'A PAS UNE LOI, IL EN A UNE PAR PAYS.
--
-- La migration 0012 encodait le droit FRANCAIS - article L.34-5 du CPCE, dont
-- l'opt-out professionnel - dans une contrainte qui ne mentionnait aucun pays.
-- Tant que la base ne portait que des SIREN, l'implicite tenait. Des qu'on
-- ecrit hors de France, il devient faux, et faux dans le sens le plus couteux :
--
--   Allemagne   UWG article 7 alinea 2 numero 2, consentement PREALABLE exige,
--               y compris entre professionnels. Pas d'opposition possible.
--   Autriche    TKG article 174, meme regle.
--   Espagne     LSSI-CE article 21, communication commerciale par courriel
--               interdite si elle n'a pas ete sollicitee ou expressement
--               autorisee. L'Espagne est stricte, contrairement a l'intuition.
--   Italie      Code de la vie privee article 130, consentement exige, et le
--               Garante l'applique aussi aux adresses professionnelles.
--   Canada      LCAP, consentement exige. Il existe bien une presomption pour
--               une adresse publiee sans mention contraire, mais elle est
--               etroite et se plaide : elle ne se code pas a la legere.
--
-- CE QUE CETTE MIGRATION FAIT. Elle sort la regle du pays de la tete de celui
-- qui importe et la met dans une table, avec son fondement et sa date de
-- lecture. Un pays absent de la table est REFUSE.
--
-- Ce n'est pas de la prudence decorative. Deux defauts permissifs ont ete
-- corriges dans ce meme outil le 27 aout : l'un laissait passer un ciblage
-- invalide, l'autre 136 sieges a l'etranger. Un troisieme aurait pour
-- consequence un courriel illicite, pas une ligne de trop dans un fichier.
--
-- CE QU'ELLE NE FAIT PAS. Elle ne remplace pas un avocat. Chaque ligne porte sa
-- source et sa date ; la colonne verifie_le existe pour qu'on sache quand la
-- lecture a ete faite, et donc quand elle sera a refaire.

create table if not exists public.regimes_pays (
  -- ISO 3166-1 alpha-2, en majuscules.
  pays text primary key check (pays ~ '^[A-Z]{2}$'),
  nom text not null,
  -- Vrai seulement si une adresse GENERIQUE de personne morale peut etre
  -- sollicitee sans consentement prealable, avec droit d'opposition.
  courriel_professionnel_sans_consentement boolean not null,
  fondement text not null,
  verifie_le date not null,
  note text
);

comment on table public.regimes_pays is
  'Regime du courriel de prospection professionnelle, par pays. Un pays absent '
  'est refuse : le defaut est le refus, jamais l''envoi.';

insert into public.regimes_pays
  (pays, nom, courriel_professionnel_sans_consentement, fondement, verifie_le, note)
values
  -- OPPOSITION POSSIBLE. L'adresse generique d'une personne morale peut etre
  -- sollicitee, avec information sur l'origine et retrait en un clic.
  ('FR', 'France', true,
   'Article L.34-5 du CPCE et position de la CNIL sur les adresses generiques de personnes morales',
   '2026-08-27',
   'Exige en outre un SIREN, la nature juridique et un statut de diffusion Sirene diffusible.'),
  ('BE', 'Belgique', true,
   'Livre VI du Code de droit economique, exception pour les personnes morales sur adresse impersonnelle',
   '2026-08-27', null),
  ('LU', 'Luxembourg', true,
   'Loi du 30 mai 2005, exception pour les personnes morales',
   '2026-08-27', null),
  ('NL', 'Pays-Bas', true,
   'Telecommunicatiewet article 11.7, opposition admise entre professionnels',
   '2026-08-27', null),
  ('PT', 'Portugal', true,
   'Decret-loi 7/2004 article 13-A, opposition admise pour les personnes morales',
   '2026-08-27', null),
  ('CH', 'Suisse', true,
   'LCD article 3 alinea 1 lettre o, opposition admise avec identification de l''expediteur',
   '2026-08-27', null),
  ('GB', 'Royaume-Uni', true,
   'PECR regle 22, les abonnes personnes morales relevent de l''opposition',
   '2026-08-27',
   'Un entrepreneur individuel ou une societe de personnes compte comme abonne individuel : consentement exige.'),
  ('IE', 'Irlande', true,
   'SI 336/2011, opposition admise vers une adresse professionnelle',
   '2026-08-27', null),
  ('US', 'Etats-Unis', true,
   'CAN-SPAM Act, opposition admise avec retrait fonctionnel',
   '2026-08-27',
   'Exige une adresse postale physique valide dans CHAQUE message. Voir la sequence.'),
  ('MX', 'Mexique', true,
   'LFPDPPP, opposition admise avec avis de confidentialite',
   '2026-08-27', null),
  ('AR', 'Argentine', true,
   'Loi 25.326 article 27, opposition admise en prospection directe',
   '2026-08-27', null),
  ('CL', 'Chili', true,
   'Loi 19.496 article 28 B, courriel commercial admis avec retrait obligatoire',
   '2026-08-27', null),

  -- CONSENTEMENT PREALABLE EXIGE. Ces lignes existent pour que le refus soit
  -- EXPLICITE et documente, et non le simple effet d'une absence : la
  -- difference compte le jour ou quelqu'un demande pourquoi on n'ecrit pas en
  -- Allemagne, et le jour ou quelqu'un est tente d'ajouter la ligne.
  ('DE', 'Allemagne', false,
   'UWG article 7 alinea 2 numero 2, consentement prealable exige y compris entre professionnels',
   '2026-08-27', null),
  ('AT', 'Autriche', false,
   'TKG article 174, consentement prealable exige',
   '2026-08-27', null),
  ('ES', 'Espagne', false,
   'LSSI-CE article 21, communication commerciale non sollicitee interdite',
   '2026-08-27',
   'Exception si relation contractuelle anterieure portant sur un produit similaire.'),
  ('IT', 'Italie', false,
   'Code de la vie privee article 130, consentement exige, applique aussi aux adresses professionnelles',
   '2026-08-27', null),
  ('CA', 'Canada', false,
   'LCAP, consentement exige. La presomption pour adresse publiee est etroite et se plaide',
   '2026-08-27', null),
  ('CO', 'Colombie', false,
   'Loi 1581 de 2012, traitement fonde sur le consentement',
   '2026-08-27', null)
on conflict (pays) do nothing;

alter table public.regimes_pays enable row level security;

-- Aucune politique n'est creee, et c'est voulu : RLS active sans politique
-- refuse tout. Cette table ne se lit que par les gardes, qui tournent avec la
-- cle de service, et par la fonction ci-dessous, qui est en SECURITY INVOKER
-- mais n'est appelee que par elles.

create or replace function public.pays_admet_courriel_professionnel(code text)
returns boolean language sql stable set search_path = public as $fn$
  select coalesce(
    (select r.courriel_professionnel_sans_consentement
       from public.regimes_pays r
      where r.pays = upper(code)),
    false)
$fn$;

comment on function public.pays_admet_courriel_professionnel(text) is
  'Faux pour un pays inconnu. Le defaut permissif est la faute que cette '
  'fonction existe pour empecher.';

-- LES CONTACTS PORTENT DESORMAIS LEUR PAYS ---------------------------------

alter table public.contacts
  add column if not exists pays text,
  -- Le SIREN reste, il ne vaut qu'en France. Ailleurs, l'identifiant national
  -- porte ce que le registre du pays publie, quand il en publie un.
  add column if not exists identifiant_national text;

comment on column public.contacts.pays is
  'ISO 3166-1 alpha-2. Obligatoire en regime professionnel : c''est lui qui '
  'designe la loi applicable a l''envoi.';

comment on column public.contacts.identifiant_national is
  'Identifiant du registre du pays, quand il en existe un de public. Le SIREN '
  'reste dans sa propre colonne : il ne vaut qu''en France.';

-- La contrainte est reecrite, pas completee : `add constraint` ne remplace pas.
alter table public.contacts drop constraint if exists contacts_b2b_strict;

alter table public.contacts add constraint contacts_b2b_strict check (
  regime = 'optin'
  or (
    -- Savoir a quel pays on ecrit, et que ce pays l'admette.
    pays is not null
    and public.pays_admet_courriel_professionnel(pays)
    -- L'adresse generique reste la condition partout : hors de France, c'est le
    -- seul indice disponible qu'on ecrit a une FONCTION et non a une personne
    -- nommee. La liste s'elargit aux formes anglaises et espagnoles, elle ne
    -- s'assouplit pas : une adresse prenom.nom@ reste refusee.
    and split_part(lower(email::text), '@', 1) = any (array[
      'contact', 'info', 'bonjour', 'hello', 'accueil',
      'direction', 'secretariat', 'commercial', 'admin',
      'office', 'enquiries', 'hi', 'team', 'sales', 'support',
      'hola', 'buzon', 'administracion', 'comercial'
    ])
    -- La France garde ses exigences propres, aucune n'est relachee : elles
    -- viennent du repertoire Sirene, qui n'a pas d'equivalent ailleurs.
    and (
      pays <> 'FR'
      or (siren is not null
          and nature_juridique is not null
          and statut_diffusion = 'O')
    )
  )
);

-- LA GARDE DE SORTIE REVERIFIE LE PAYS --------------------------------------
--
-- La contrainte de table vaut au moment de l'ECRITURE. Un pays peut basculer
-- dans la table des regimes apres coup - une jurisprudence, une lecture
-- corrigee, un avocat consulte - et les fiches deja ecrites ne seraient pas
-- revalidees pour autant. La garde appelee avant CHAQUE envoi repose donc la
-- question, et un pays retire cesse de recevoir immediatement.

create or replace function public.peut_recevoir(cible citext, audience text)
returns boolean language sql stable set search_path = public as $fn$
  select not exists (select 1 from public.suppression_list s where s.email = cible)
     and exists (
       select 1
         from public.contacts c
        where c.email = cible
          and case audience
                -- Prospection consentie : consentement confirme exige.
                when 'optin' then c.regime = 'optin' and c.statut = 'confirme'
                -- Voie professionnelle : le regime de la fiche doit le dire, ET
                -- le pays doit l'admettre AU MOMENT DE L'ENVOI.
                when 'b2b' then c.regime = 'b2b_generique'
                                and c.statut in ('en_attente', 'confirme')
                                and c.pays is not null
                                and public.pays_admet_courriel_professionnel(c.pays)
                -- Suivi de demande : tout contact qui ne s'est pas oppose.
                when 'devis' then c.statut not in ('desinscrit', 'plainte', 'bounce')
                -- Audience inconnue : on n'envoie pas.
                else false
              end
     );
$fn$;
