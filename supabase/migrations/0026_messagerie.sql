-- LIRE ET REPONDRE DEPUIS LE BACK-OFFICE.
--
-- Aujourd'hui, une reponse a un message de prospection arrive dans le Gmail
-- d'Adam par la redirection de `adam@beloucif.com`, et elle n'a AUCUN chemin
-- vers la base. Consequences mesurables :
--
--   - une reponse « retirez-moi de votre liste » reste une note mentale. Le
--     back-office n'a aucun moyen d'inscrire une opposition : l'onglet Retraits
--     est en lecture seule, et `desinscrire()` n'est appelable que par un jeton
--     signe, donc par la personne elle-meme.
--   - une inscription a une sequence continue apres une reponse. Quelqu'un qui
--     ecrit « je vous rappelle en octobre » recoit quand meme le message de
--     cloture cinq jours plus tard.
--   - on ne sait pas mesurer une reponse, donc on ne sait pas dire si le canal
--     fonctionne. C'est le seul chiffre qui compte et c'est le seul qu'on n'a
--     pas.
--
-- CE QUE LE WEBHOOK DE RESEND PORTE, ET CE QU'IL NE PORTE PAS.
--
-- L'evenement `email.received` porte l'expediteur, le sujet, le `message_id` et
-- les pieces jointes. Il ne porte NI le texte, NI le HTML, NI les en-tetes -
-- verifie dans `node_modules/resend/dist/index.d.mts`, interface
-- `ReceivedEmailEventData`, ligne 2180. Le corps s'obtient par un second appel,
-- `emails.receiving.get(email_id)`.
--
-- Ce point vaut d'etre ecrit ici parce qu'un dispositif qui lirait `data.text`
-- compilerait, rendrait 200, afficherait un fil, et n'aurait JAMAIS de corps :
-- la seule fonction qui porte un risque juridique - detecter une demande de
-- retrait - serait morte a la naissance, en silence.
--
-- CE QUI N'EST PAS FAIT, ET POURQUOI.
--
-- Le `mailto:` de `List-Unsubscribe` reste `adam@beloucif.com` et n'est PAS
-- deplace vers une adresse a jeton. Le bouton natif d'un client de messagerie
-- envoie un message au sujet impose et au CORPS VIDE : un detecteur qui ne lit
-- que le corps ne verrait rien. On remplacerait un canal qui echoue
-- bruyamment, dans une boite qu'Adam ouvre, par un canal qui echoue en silence.

create type message_direction as enum ('entrant', 'sortant');

-- LES FILS ------------------------------------------------------------------

create table if not exists public.fils (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Le correspondant. Toujours renseigne : c'est la cle de rattachement la
  -- plus fiable dont on dispose, et la seule qui marche quand le client de
  -- messagerie ne renvoie aucun en-tete de fil.
  email citext not null,
  -- Le contact, quand on le connait. Un inconnu peut ecrire : on garde son
  -- message plutot que de le jeter faute de fiche.
  contact_id uuid references public.contacts (id) on delete set null,
  sujet text not null default '',
  dernier_message_at timestamptz not null default now(),
  -- Non lu tant qu'Adam n'a pas ouvert le fil. Porte la pastille du menu.
  non_lu boolean not null default true,
  -- Archive : traite, on ne veut plus le voir dans la liste courante.
  archive boolean not null default false
);

create index if not exists fils_email_idx on public.fils (email);
create index if not exists fils_recents_idx
  on public.fils (dernier_message_at desc) where not archive;

alter table public.fils enable row level security;

create policy "admins gerent les fils"
  on public.fils for all
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- LES MESSAGES --------------------------------------------------------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fil_id uuid not null references public.fils (id) on delete cascade,
  direction message_direction not null,
  expediteur text not null,
  destinataire text not null,
  sujet text not null default '',
  -- Le texte brut fait foi pour la lecture et pour la detection de retrait.
  -- Le HTML n'est conserve que pour l'affichage, et il n'est JAMAIS injecte
  -- tel quel : voir le commentaire de l'ecran.
  texte text not null default '',
  html text,
  -- Identifiants Resend, pour ne pas traiter deux fois le meme evenement.
  resend_id text unique,
  message_id text,
  -- L'envoi de sequence auquel ce message repond, quand on sait le dire. C'est
  -- ce qui rend une reponse mesurable PAR VARIANTE plutot que par campagne.
  email_send_id uuid references public.email_sends (id) on delete set null
);

create index if not exists messages_fil_idx on public.messages (fil_id, created_at);

alter table public.messages enable row level security;

create policy "admins gerent les messages"
  on public.messages for all
  using (public.is_blf_admin()) with check (public.is_blf_admin());

-- RATTACHER UN MESSAGE ENTRANT ----------------------------------------------

create or replace function public.range_message_entrant(
  p_email citext,
  p_sujet text,
  p_texte text,
  p_html text,
  p_resend_id text,
  p_message_id text
) returns uuid language plpgsql security definer set search_path = public as $fn$
declare
  v_fil uuid;
  v_contact uuid;
  v_message uuid;
begin
  -- REJOUER LE MEME EVENEMENT NE DOIT RIEN DOUBLER. Resend reessaie un webhook
  -- qui n'a pas repondu 200 assez vite, et un fil qui affiche deux fois le
  -- meme message fait douter de tout le reste.
  select id into v_message from public.messages where resend_id = p_resend_id;
  if v_message is not null then
    return v_message;
  end if;

  select id into v_contact from public.contacts where email = p_email;

  -- Le rattachement se fait par ADRESSE, pas par en-tete de fil. Les en-tetes
  -- `In-Reply-To` et `References` sont souvent perdus : une reponse ecrite
  -- depuis un telephone, transferee, ou passee par un secretariat les perd.
  -- L'adresse, elle, reste. On ne rattache qu'a un fil encore ouvert, pour
  -- qu'une reprise de contact six mois plus tard commence un fil neuf.
  select id into v_fil
    from public.fils
   where email = p_email and not archive
   order by dernier_message_at desc
   limit 1;

  if v_fil is null then
    insert into public.fils (email, contact_id, sujet)
    values (p_email, v_contact, coalesce(nullif(p_sujet, ''), 'Sans objet'))
    returning id into v_fil;
  else
    update public.fils
       set dernier_message_at = now(),
           non_lu = true,
           contact_id = coalesce(contact_id, v_contact)
     where id = v_fil;
  end if;

  insert into public.messages
    (fil_id, direction, expediteur, destinataire, sujet, texte, html,
     resend_id, message_id)
  values
    (v_fil, 'entrant', p_email::text, '', coalesce(p_sujet, ''),
     coalesce(p_texte, ''), p_html, p_resend_id, p_message_id)
  returning id into v_message;

  -- UNE REPONSE ARRETE LA SEQUENCE. Quelqu'un qui a repondu n'a plus a
  -- recevoir le message de cloture qui dit « sans reponse de votre part ». Ce
  -- serait faux, et une affirmation fausse dans un message automatique est ce
  -- qui fait perdre un prospect qui venait de repondre.
  update public.enrollments e
     set statut = 'arrete', arret_raison = 'reponse recue', verrou_at = null
   where e.statut = 'actif'
     and e.contact_id = v_contact;

  -- L'interaction date la fiche : c'est elle qui fonde la duree de
  -- conservation de trois ans.
  update public.contacts
     set last_engagement_at = now()
   where id = v_contact;

  return v_message;
end $fn$;

revoke all on function public.range_message_entrant(citext, text, text, text, text, text) from public, anon, authenticated;

comment on function public.range_message_entrant is
  'Reservee au service. Une fonction du schema public est publiee en '
  '/rest/v1/rpc et executable par quiconque a la cle publiable : la lecon a '
  'ete payee sur `desinscrire` le 25 aout, exploitee pour de vrai avant '
  'correctif.';

-- POSER UNE OPPOSITION DEPUIS LE BACK-OFFICE ---------------------------------
--
-- Le geste qui manquait. Une reponse « retirez-moi » n'avait aucun chemin vers
-- la liste de suppression : `desinscrire()` exige un jeton signe, donc le clic
-- de la personne elle-meme. Quelqu'un qui le demande PAR ECRIT doit etre
-- retire, et le refus d'un droit d'opposition exprime est ce qui coute le plus
-- cher en controle.

create or replace function public.retire_a_la_demande(
  p_email citext,
  p_motif text default 'demande directe, recue par message'
) returns boolean language plpgsql security definer set search_path = public as $fn$
begin
  insert into public.suppression_list (email, raison)
  values (p_email, 'demande_directe')
  on conflict (email) do nothing;

  update public.contacts set statut = 'desinscrit' where email = p_email;

  update public.enrollments e
     set statut = 'arrete', arret_raison = p_motif, verrou_at = null
    from public.contacts c
   where c.id = e.contact_id and c.email = p_email and e.statut = 'actif';

  return true;
end $fn$;

revoke all on function public.retire_a_la_demande(citext, text) from public, anon, authenticated;
