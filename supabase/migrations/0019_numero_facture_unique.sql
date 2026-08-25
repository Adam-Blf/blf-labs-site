-- COLLISION DE NUMEROS LEGAUX, presente depuis la migration 0007.
--
-- `lpad(chaine, 4, '0')` ne fait pas que completer : quand la chaine depasse
-- quatre caracteres, Postgres la TRONQUE. La sequence 10000 rendait donc
-- `1000`, exactement le meme numero que la sequence 1000.
--
-- Mesure, pas supposition. Sur les 120 000 premieres sequences :
--   lpad(v, 4, '0')                            ->   9 999 valeurs distinctes
--   to_char(v, 'FM0000')                       ->  10 000 valeurs distinctes
--   lpad(v, greatest(4, length(v)), '0')       -> 120 000 valeurs distinctes
--
-- Les deux premieres formes produisent des doublons. La troisieme est la seule
-- correcte : elle complete jusqu'a quatre chiffres et laisse le numero grandir
-- au dela. `to_char` avec un gabarit fixe echoue pour la meme raison que
-- `lpad`, ce qui valait la peine d'etre teste plutot que suppose.
--
-- POURQUOI CE N'EST PAS UN DETAIL. L'article 242 nonies A du CGI exige un
-- numero UNIQUE. Deux factures portant le meme numero, c'est une comptabilite
-- irregulière, et le defaut serait apparu des la dix-milliemme piece, sans
-- aucun signal : rien ne protestait.
--
-- LA VRAIE PROTECTION EST LA CONTRAINTE, PAS LA FONCTION. Une fonction juste
-- aujourd'hui peut etre reecrite demain. Un index unique refuse le doublon quoi
-- qu'il arrive, et c'est lui qu'il faut croire.

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
  return prefix
      || '-' || to_char(p_date, 'DDMMYYYY')
      || '-' || lpad(v::text, greatest(4, length(v::text)), '0');
end;
$fn$;

revoke execute on function public.next_invoice_number(invoice_kind, integer, date) from public;
revoke execute on function public.next_invoice_number(invoice_kind, integer, date) from anon;
grant execute on function public.next_invoice_number(invoice_kind, integer, date) to authenticated;
grant execute on function public.next_invoice_number(invoice_kind, integer, date) to service_role;

-- Le filet, en base. Partiel : les brouillons n'ont pas encore de numero, et
-- ils ont le droit d'etre plusieurs a ne pas en avoir.
create unique index if not exists invoices_number_unique
  on public.invoices (number)
  where number is not null;
