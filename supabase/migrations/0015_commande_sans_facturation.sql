-- La contrainte `orders_pro_billing_complete` exigeait raison sociale, SIREN et
-- adresse de facturation complete des qu'une demande venait d'un professionnel.
--
-- Elle avait sa logique : une facture entre professionnels doit porter
-- l'identite de l'acheteur. Mais elle l'appliquait au mauvais moment, sur un
-- formulaire de PRISE DE CONTACT, avant tout engagement et avant tout devis.
-- Personne ne va chercher son numero SIREN pour demander un prix qu'il n'a pas
-- encore vu. C'etait la friction la plus couteuse du site : un formulaire de
-- facturation deguise en formulaire de contact.
--
-- LA GARDE N'EST PAS SUPPRIMEE, ELLE EST DEPLACEE la ou elle a du sens :
-- `issueInvoice`, dans app/admin/actions-facturation.ts, refuse toujours
-- d'emettre une piece a un professionnel sans SIREN valide, et la facture porte
-- ses propres colonnes d'identite de l'acheteur. Une piece legale ne peut
-- toujours pas partir incomplete ; c'est la DEMANDE qui n'a plus a l'etre.
--
-- Les colonnes restent, nullables. Elles se remplissent au moment du devis.

alter table public.orders drop constraint if exists orders_pro_billing_complete;
