-- La politique de confidentialite promet, depuis cette meme branche, que
-- l'adresse est retiree de la liste apres trois ans sans interaction, « sans
-- que vous ayez a le demander ». La colonne `last_engagement_at` etait bien
-- alimentee par le webhook, mais RIEN ne la lisait : l'engagement etait publie
-- sans implementation derriere.
--
-- Une promesse ecrite dans une politique de confidentialite est un engagement
-- opposable, pas une intention. Celle-ci est donc executee ici, et appelee a
-- chaque battement du moteur.
--
-- CE QUI EST SUPPRIME, ET CE QUI NE L'EST PAS.
--
-- Seul le regime `optin` est concerne : c'est lui qui repose sur un
-- consentement, et un consentement vieux de trois ans sans le moindre signe de
-- vie n'en est plus un. Le regime professionnel ne repose pas sur un
-- consentement, sa duree se raisonne autrement.
--
-- La fiche est SUPPRIMEE, pas marquee. Les preuves de consentement et les
-- inscriptions tombent en cascade, ce qui est le comportement correct : une
-- preuve ne se conserve que tant qu'on detient la donnee qu'elle justifie.
--
-- La liste de suppression n'est PAS alimentee. Ces personnes ne se sont
-- opposees a rien, elles n'ont simplement plus donne signe de vie. Les y
-- inscrire leur interdirait de se reinscrire un jour, ce qui serait une
-- sanction pour un silence.

create or replace function public.purge_consentements_caducs()
returns integer language plpgsql security definer set search_path = public as $fn$
declare
  supprimes integer;
begin
  with partants as (
    delete from public.contacts c
     where c.regime = 'optin'
       and coalesce(c.last_engagement_at, c.created_at) < now() - interval '3 years'
    returning 1
  )
  select count(*) into supprimes from partants;
  return supprimes;
end;
$fn$;

-- Meme regle que pour les autres fonctions : une fonction du schema public est
-- une route HTTP. Celle-ci EFFACE des lignes, elle n'a rien a faire ouverte.
revoke execute on function public.purge_consentements_caducs() from public;
revoke execute on function public.purge_consentements_caducs() from anon;
revoke execute on function public.purge_consentements_caducs() from authenticated;
grant execute on function public.purge_consentements_caducs() to service_role;
