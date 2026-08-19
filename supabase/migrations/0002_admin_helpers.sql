-- Garde d'acces unique du back-office, reutilisee par toutes les policies.
-- Deux conditions cumulees, cote base (pas seulement dans le middleware) :
--   1. l'email du jeton figure dans la liste des administrateurs ;
--   2. le niveau d'assurance de la session est 'aal2', c'est-a-dire que la
--      double authentification (TOTP) a bien ete validee.
-- Consequence : une session simplement connectee (aal1) ne voit rien, meme si
-- le middleware etait contourne. La 2FA est un invariant de donnees.
create or replace function public.is_blf_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('adam@beloucif.com')
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

-- Horodatage de derniere modification, tenu par la base et non par le client.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
