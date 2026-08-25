-- La garde de sortie depend du regime juridique de l'envoi, pas seulement du
-- contact. La version de 0012 ne le voyait pas et bloquait le cas le plus
-- rentable : le suivi d'une demande de devis.
--
-- Le suivi d'une demande n'est PAS de la prospection. La personne a rempli un
-- formulaire pour obtenir un devis, l'article 6.1.b du RGPD couvre les mesures
-- precontractuelles prises a sa demande, et lui repondre n'exige aucune case
-- cochee. Exiger un opt-in confirme pour la relancer reviendrait a s'interdire
-- de repondre a quelqu'un qui a demande une reponse.
--
-- Ce qui ne change jamais, quelle que soit l'audience : la liste de
-- suppression. Quelqu'un qui a demande a ne plus rien recevoir ne recoit plus
-- rien, y compris le suivi d'un dossier. Le droit d'opposition ne se decoupe
-- pas par finalite quand la personne, elle, a dit stop tout court.
--
-- Une seule fonction porte la regle. La reecrire en TypeScript dans le moteur
-- ferait deux versions qui divergeraient au premier correctif applique d'un
-- seul cote.

drop function if exists public.peut_recevoir(citext);

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
                -- Voie professionnelle : pas de confirmation a attendre sur une
                -- adresse generique, mais le regime de la fiche doit le dire.
                when 'b2b' then c.regime = 'b2b_generique'
                                and c.statut in ('en_attente', 'confirme')
                -- Suivi de demande : tout contact qui ne s'est pas oppose.
                when 'devis' then c.statut not in ('desinscrit', 'plainte', 'bounce')
                -- Audience inconnue : on n'envoie pas. Un defaut permissif
                -- transformerait une faute de frappe en envoi non autorise.
                else false
              end
     );
$fn$;
