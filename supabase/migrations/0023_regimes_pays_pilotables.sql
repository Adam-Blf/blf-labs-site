-- LA TABLE QUI DECIDE A QUI L'ON ECRIT DOIT SE PILOTER DEPUIS LE BACK-OFFICE.
--
-- La migration 0022 a cree `regimes_pays` avec RLS active et AUCUNE politique.
-- C'etait juste tant que la table ne servait qu'aux gardes, qui tournent avec
-- la cle de service et ignorent RLS. Des lors qu'Adam doit voir et changer ces
-- regimes depuis `/admin`, il lui faut une politique : sans elle, l'ecran
-- afficherait une liste vide, ce qui se lit comme « aucun pays n'est ouvert »
-- alors que douze le sont.
--
-- La politique reprend celle des autres tables du domaine : `is_blf_admin()`,
-- qui exige a la fois l'appartenance a la liste blanche et une session en
-- deuxieme facteur. Fermer un pays est sans danger ; en OUVRIR un engage
-- juridiquement, et ce geste ne doit pas etre a portee d'une session simple.

create policy "admins gerent les regimes par pays"
  on public.regimes_pays
  for all
  using (public.is_blf_admin())
  with check (public.is_blf_admin());

-- LA TRACE DE QUI A OUVERT UN PAYS, ET QUAND.
--
-- `verifie_le` dit quand la lecture juridique a ete faite. Il ne dit pas qui a
-- bascule l'interrupteur depuis un ecran, ni quand. Le jour ou l'on demande
-- pourquoi un message est parti en Espagne, la reponse « la table disait
-- ouvert » ne suffit pas : il faut savoir depuis quand, et sur quelle base.

alter table public.regimes_pays
  add column if not exists modifie_le timestamptz,
  add column if not exists modifie_par text;

comment on column public.regimes_pays.modifie_le is
  'Derniere bascule depuis le back-office. Distinct de verifie_le, qui date la '
  'lecture juridique et non le geste.';

create or replace function public.trace_regime_pays()
returns trigger language plpgsql security invoker set search_path = public as $fn$
begin
  if new.courriel_professionnel_sans_consentement
     is distinct from old.courriel_professionnel_sans_consentement then
    new.modifie_le := now();
    new.modifie_par := coalesce(auth.jwt() ->> 'email', 'service');
  end if;
  return new;
end $fn$;

drop trigger if exists regimes_pays_trace on public.regimes_pays;
create trigger regimes_pays_trace
  before update on public.regimes_pays
  for each row execute function public.trace_regime_pays();
