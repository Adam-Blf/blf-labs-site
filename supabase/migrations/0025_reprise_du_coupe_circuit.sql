-- UNE GARDE QU'ON NE PEUT PAS LEVER EST UNE GARDE QU'ON FINIT PAR RETIRER.
--
-- Le coupe-circuit pose par 0024 juge les 200 DERNIERS envois. Il s'est
-- declenche correctement le 27 aout - quatre rebonds sur quarante, soit 10 %
-- pour un seuil a 3 % - et il a coupe les envois en production.
--
-- Mais ces quarante envois ne changeront jamais. Au battement suivant, le
-- meme calcul rend le meme resultat, et le moteur se recoupe. Pour toujours.
-- Il n'existait aucun moyen de repartir autrement qu'en desarmant la garde,
-- ce qui est exactement la faute qu'elle existe pour empecher.
--
-- La reprise borne donc la fenetre : on ne juge que ce qui est parti APRES la
-- derniere remise en route. Redemarrer devient un geste explicite, date, et
-- qui laisse une trace - pas un contournement.
alter table public.moteur_reglages
  add column if not exists reprise_le timestamptz;

comment on column public.moteur_reglages.reprise_le is
  'Le coupe-circuit ne juge que les envois posterieurs a cette date. Sans '
  'elle, un declenchement serait definitif : les envois deja partis ne '
  'changent plus, donc le meme calcul rendrait le meme verdict a chaque tour.';
