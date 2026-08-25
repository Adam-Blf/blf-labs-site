-- FAILLE OUVERTE PAR 0012, FERMEE ICI.
--
-- Ce qui s'est passe, et qu'il faut retenir. Toute fonction du schema `public`
-- est automatiquement exposee par PostgREST a l'adresse /rest/v1/rpc/<nom>, et
-- PostgreSQL accorde EXECUTE a `public` par defaut. `desinscrire` etant en
-- SECURITY DEFINER, elle s'executait donc avec les droits du proprietaire, pour
-- n'importe quel appelant portant la cle publiable du projet, laquelle est
-- publique par conception puisqu'elle vit dans le code du navigateur.
--
-- Consequence mesuree avant correctif, et pas seulement redoutee : un simple
-- appel HTTP avec la cle publiable, sans aucun jeton, a inscrit une adresse
-- arbitraire dans la liste de suppression. Toute la mecanique de jetons signes
-- de lib/prospection/jeton.ts se contournait par une route qu'on n'avait pas
-- ecrite. La lecon depasse ce projet : ce n'est pas parce qu'une fonction n'est
-- appelee que par du code serveur qu'elle n'est joignable que par lui.
--
-- `peut_recevoir` est traitee de meme. Elle ne modifie rien, mais elle repond
-- oui ou non sur une adresse donnee : laissee ouverte, elle permettait de
-- tester si une adresse figure dans la liste, donc qui parle a qui.
--
-- Le role `service_role`, celui de lib/supabase.ts, garde l'acces. C'est lui,
-- et lui seul, qui appelle ces fonctions depuis une route qui a d'abord
-- verifie un jeton.

revoke execute on function public.desinscrire(citext, suppression_raison) from public;
revoke execute on function public.desinscrire(citext, suppression_raison) from anon;
revoke execute on function public.desinscrire(citext, suppression_raison) from authenticated;
grant execute on function public.desinscrire(citext, suppression_raison) to service_role;

revoke execute on function public.peut_recevoir(citext, text) from public;
revoke execute on function public.peut_recevoir(citext, text) from anon;
revoke execute on function public.peut_recevoir(citext, text) from authenticated;
grant execute on function public.peut_recevoir(citext, text) to service_role;

-- Chemin de recherche fige sur le declencheur d'immuabilite. Sans cela, un role
-- disposant d'un schema place devant `public` pourrait detourner les fonctions
-- que le corps appelle. Les autres fonctions du depot le posent deja.
create or replace function public.consent_immuable()
returns trigger language plpgsql set search_path = public as $fn$
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
