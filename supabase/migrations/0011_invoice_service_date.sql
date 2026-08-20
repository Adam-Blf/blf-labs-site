-- Date de realisation de la prestation, distincte de la date d'emission de la
-- facture. L'article 242 nonies A, 3° du CGI impose de porter "la date de la
-- vente ou de la prestation de services lorsqu'elle est differente de la date
-- d'emission de la facture" : sans champ dedie, cette mention manquait des qu'une
-- prestation etait facturee plusieurs jours apres son achevement (cas courant en
-- developpement web). Facultative, on ne l'affiche que si elle differe de l'emission.
alter table public.invoices
  add column if not exists service_date date;
