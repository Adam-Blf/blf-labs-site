-- Mode de reglement, pour le livre des recettes (obligation micro-entreprise :
-- le registre doit porter le mode d'encaissement de chaque recette).
alter table public.invoices
  add column if not exists payment_method text;
