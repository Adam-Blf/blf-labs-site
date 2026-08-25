-- Le numero porte desormais la date d'emission en JJMMAAAA : `F-25082026-0001`
-- au lieu de `F-2026-0001`. Format demande par Adam.
--
-- Contrepartie assumee du JJMMAAAA : un tri alphabetique des numeros ne donne
-- plus l'ordre chronologique, contrairement a un AAAAMMJJ. Ce n'est pas un
-- probleme ici, l'ordre se lit sur `issued_at` et sur la sequence, mais il faut
-- le savoir avant de trier une liste de factures par leur numero.
--
-- CE QUI NE CHANGE PAS, ET NE DOIT PAS CHANGER. L'article 242 nonies A du CGI
-- exige un numero UNIQUE, fonde sur une sequence chronologique CONTINUE, sans
-- rupture. Le compteur reste donc annuel et continu : la date ajoutee est
-- informative, elle ne remet aucun compteur a zero.
--
-- Le piege qu'on evite en ecrivant ceci : une numerotation qui repartirait a
-- 0001 chaque jour resterait unique, mais briserait la continuite de la
-- sequence, et c'est la continuite que l'administration regarde. Le numero
-- ci-dessous se lit comme une date, il se compte comme une suite annuelle.
--
-- La date est passee en parametre plutot que lue par `current_date` dans le
-- corps : le numero doit correspondre a `issued_at`, pas a l'instant ou la
-- fonction s'execute. Une emission a minuit passe, ou depuis un fuseau
-- different, produirait sinon un numero qui contredit la date imprimee sur la
-- piece.
--
-- Valeur par defaut conservee pour ne pas casser les appels a deux arguments.
--
-- `search_path` fige au passage : la fonction en manquait, le conseiller de
-- securite Supabase le signalait.

create or replace function public.next_invoice_number(
  p_kind invoice_kind,
  p_year integer,
  p_date date default current_date
)
returns text
language plpgsql
set search_path = public
as $fn$
declare
  v integer;
  prefix text;
begin
  insert into public.invoice_counters (year, kind, last_value)
  values (p_year, p_kind, 1)
  on conflict (year, kind)
    do update set last_value = public.invoice_counters.last_value + 1
  returning last_value into v;

  prefix := case p_kind when 'facture' then 'F' else 'D' end;
  return prefix || '-' || to_char(p_date, 'DDMMYYYY') || '-' || lpad(v::text, 4, '0');
end;
$fn$;

-- Meme regle que partout : une fonction du schema public est une route HTTP.
-- Celle-ci consomme un numero legal irreversible, elle n'a rien a faire
-- ouverte au public.
revoke execute on function public.next_invoice_number(invoice_kind, integer, date) from public;
revoke execute on function public.next_invoice_number(invoice_kind, integer, date) from anon;
grant execute on function public.next_invoice_number(invoice_kind, integer, date) to authenticated;
grant execute on function public.next_invoice_number(invoice_kind, integer, date) to service_role;
