-- Paiement en ligne d'une facture (Stripe). Colonnes sur une table deja gardee
-- par RLS (is_blf_admin) : rien a ajouter cote policies. Le webhook ecrit via la
-- cle de service (hors session), donc contourne RLS cote serveur uniquement.
alter table public.invoices
  add column if not exists payment_url text,
  add column if not exists stripe_payment_link_id text,
  add column if not exists stripe_ref text;
