-- Durcissement des commandes : les policies d'origine (0001) n'exigeaient que
-- l'email. On les remplace par la garde unique is_blf_admin(), qui ajoute
-- l'exigence de double authentification (aal2).
drop policy if exists "admins lisent les commandes" on public.orders;
drop policy if exists "admins mettent a jour le statut" on public.orders;

create policy "admins lisent les commandes"
  on public.orders for select to authenticated
  using (public.is_blf_admin());

create policy "admins mettent a jour le statut"
  on public.orders for update to authenticated
  using (public.is_blf_admin()) with check (public.is_blf_admin());
