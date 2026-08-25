# Journal des versions

Format inspire de Keep a Changelog, versionnage semantique.

Regle de lecture : une entree decrit ce qui change pour quelqu'un qui utilise le
site ou reprend le depot, pas la liste des fichiers touches. Le detail technique
est dans les messages de commit et les pull requests.

## 0.29.0 - 2026-08-25

### Corrige

- **La clause de responsabilite etait nulle de plein droit.** Elle plafonnait la
  reparation au montant de la prestation, sans distinguer le client. Face a un
  consommateur, c'est la clause noire de l'article R. 212-1, 6° du Code de la
  consommation : presomption IRREFRAGABLE, clause reputee non ecrite, aucune
  preuve contraire recevable. L'article R. 212-5 etendait le meme sort aux
  non-professionnels, donc aux associations clientes. Le plafond est desormais
  reserve aux clients professionnels, hors faute lourde, dol et dommage
  corporel.
- **La garantie de correction n'avait aucune limite.** Elle promettait de
  corriger sans supplement toute non-conformite signalee apres la livraison,
  sans duree, sans definition, sans plafond de volume. Sur le seul projet livre,
  le suivi d'apres-livraison a coute 58 heures contre 26 heures de construction ;
  ces heures ont ete offertes par choix, la clause permettait de les exiger.
- **Les penalites de retard s'appliquaient aux particuliers.** Les articles
  L. 441-10 et D. 441-5 relevent du Code de COMMERCE et ne regissent que les
  relations entre professionnels. Opposees a un consommateur, elles n'ont aucun
  fondement, et une penalite sans fondement de ce montant est presumee abusive
  (R. 212-2, 3°). Le paragraphe leur est desormais reserve.

### Ajoute

- **Une recette de quinze jours**, qui borne le perimetre du projet sans toucher
  aux garanties legales. C'est elle le vrai levier, et non la duree de garantie :
  pendant DOUZE mois, le client n'a qu'a etablir l'existence du defaut, pas sa
  date d'apparition (L. 224-25-16). Une garantie de trente jours ne reduisait
  donc aucune charge reelle, elle en donnait l'illusion.
- **Une garantie commerciale de quatre-vingt-dix jours**, declaree avec tout ce
  que l'article L. 217-22 exige : contenu, modalites, prix, duree, etendue
  territoriale et identite du garant. S'il en manque un seul, la garantie reste
  due sans etre opposable.
- **L'encadre obligatoire de l'article D. 211-3**, absent jusqu'ici. Le decret
  n° 2022-946 en impose la presence dans les conditions generales, et D. 217-5
  le rend obligatoire dans tout contrat de garantie commerciale portant sur du
  numerique. Sa redaction est fixee par l'annexe au code et n'a pas ete
  reformulee.

### Note de methode

Une premiere reecriture de la clause 6, ecrite le meme jour, bornait la
correction gratuite a trente jours en ajoutant que « passe ce delai, les
corrections font l'objet d'un devis distinct ». C'etait REDUIRE la garantie
legale, gratuite pendant deux ans et d'ordre public : juridiquement PIRE que la
clause illimitee qu'elle corrigeait. Elle n'a jamais ete publiee, l'audit
juridique l'ayant refusee avant fusion. La lecon vaut d'etre gardee : borner une
obligation contractuelle sans verifier ce que la loi rend indisponible ne borne
rien, cela cree une clause reputee non ecrite et une preuve d'intention.

## 0.28.0 - 2026-08-25

### Corrige

- **La garde qui manquait vraiment : le statut de diffusion Sirene.** Toute
  personne inscrite au repertoire peut demander a l'INSEE que ses donnees ne
  soient pas publiees, et plus d'un million d'etablissements l'ont fait. Rien ne
  le verifiait. Tout le reste du dispositif - double opt-in, jeton signe, lien de
  retrait - protege des gens qui n'ont encore rien demande ; cette garde-ci
  respecte une opposition DEJA EXERCEE, explicitement, par une personne
  identifiee. Piege de valeur a connaitre : il n'existe plus de statut « N »,
  toutes les unites anciennement non diffusibles ont ete basculees en « P ».
  Le test correct est donc `= 'O'`, jamais `<> 'N'`.
- **L'etiquette `b2b_generique` mentait sur son fondement.** Elle exigeait un
  SIREN, en s'appuyant sur la position de la CNIL selon laquelle les adresses
  `contact@` ou `info@` « concernent des personnes morales ». Or un SIREN ne dit
  rien de la nature juridique : une entreprise individuelle en a un, et c'est une
  personne physique. Le correctif n'exclut pas les entreprises individuelles,
  ce serait plus strict que le droit ; il oblige a SAVOIR a qui l'on ecrit, la
  nature juridique devenant obligatoire pour ce regime.
- **L'information de l'article 14 du RGPD etait incomplete.** Le premier message
  donnait l'origine de l'adresse et les droits, mais ni la finalite, ni la base
  legale, ni la duree de conservation, ni le lien vers la politique. Et le droit
  d'opposition, que l'article 21.4 impose de mentionner « explicitement et de
  facon distincte », etait noye dans la meme ligne que les autres droits. Il a
  desormais son propre paragraphe.

### Ajoute

- **`scripts/prospects.py`**, qui constitue une base de prospects qualifies
  depuis l'annuaire public des entreprises (API Recherche d'entreprises, service
  public gratuit, sans cle). Il ecarte les unites opposees a la diffusion, les
  structures de vingt salaries et plus, et par defaut les entreprises
  individuelles - cette derniere exclusion etant un choix de prudence levable,
  pas une obligation, et l'entete dit pourquoi. Il n'ecrit rien en base,
  n'envoie rien, et refuse d'ecrire sa sortie dans le depot : un fichier de
  prospects porte des donnees relatives a des personnes.

## 0.27.1 - 2026-08-25

### Corrige

- **Cinq libelles du tunnel de commande portaient des fautes d'accent**, et ils
  sont lus par le client a deux endroits : les listes de l'etape 2 de
  `/commander`, et le recapitulatif des emails. « 2 000 a 5 000 euros »,
  « A definir ensemble », « Des que possible », « Pas de date imposee ».
  Seules les valeurs affichees changent ; les cles restent intactes, ce sont
  des identifiants stockes en base que les commandes existantes referencent.

  Ce n'est pas un defaut de `check:french` : son dictionnaire ecarte
  deliberement « a », « des » et « ou », qui sont aussi des mots corrects, et
  les y ajouter casserait du texte juste ailleurs. La relecture reste humaine
  sur ces trois mots-la, et c'est le bon arbitrage. Un commentaire le dit
  desormais dans `lib/validation.ts`, pour que personne n'elargisse la garde en
  croyant bien faire.

## 0.27.0 - 2026-08-25

### Corrige

- **Aucune piece comptable ne pouvait plus etre emise depuis le back-office.**
  Regression introduite le jour meme par la version 0.26.0. `create or replace
  function` ne remplace que si la signature est identique : en ajoutant un
  troisieme parametre, la migration 0018 n'a rien remplace, elle a cree une
  SURCHARGE a cote de la fonction d'origine. Le back-office appelant avec deux
  arguments, les deux candidates convenaient et Postgres refusait d'arbitrer
  (`42725: function is not unique`). Le bouton Emettre echouait donc a chaque
  fois, et sans rien afficher. Verifie en production avant et apres correctif.
  La lecon depasse ce depot : ajouter un parametre avec valeur par defaut a une
  fonction existante est une creation, pas une modification.
- **Un refus d'emission se voit enfin.** Emettre une facture a un professionnel
  sans SIREN valide est refuse, article 242 nonies A du CGI, et le message
  existait, bien redige, mais restait inatteignable : aucune frontiere d'erreur
  n'existait dans `app/`, et les exceptions des actions serveur remontaient dans
  le vide depuis des `useTransition` sans rattrapage. On cliquait, il ne se
  passait rien. Les refus attendus sont desormais rendus comme un etat et
  affiches a cote du bouton ; un `app/admin/error.tsx` attrape le reste.
- **La date d'encaissement se corrige.** Elle etait figee a la date du CLIC,
  alors que le recapitulatif URSSAF et le livre des recettes se calculent
  exclusivement dessus : un reglement recu le 30 juin et pointe le 2 juillet
  basculait de trimestre, sans recours. Un champ de date apparait sur la fiche
  d'une piece pointee payee. La date future est refusee, la date anterieure a
  l'emission reste acceptee, parce qu'une piece etablie apres coup pour un
  travail deja regle en a legitimement besoin.
- **Le repli du consentement tient enfin sa promesse.** Le commentaire annoncait
  que le choix valait « au moins pour la session en cours » quand le stockage
  local est inaccessible, alors que rien ne le retenait. Un repli en memoire le
  porte desormais. Precision utile : le bandeau et la mesure fonctionnaient
  correctement en production, ce qu'une verification au navigateur a etabli.

### Modifie

- **`actions-facturation.ts` est scinde en trois.** Il depassait le seuil de 400
  lignes que `verifie:admin` fait respecter. Le catalogue de prestations part
  dans `actions-catalogue.ts` et le lien de paiement dans `actions-paiement.ts`,
  seul module du pole a dependre de Stripe et de l'envoi d'email.
- **La validation de date d'encaissement vit dans `lib/invoice.ts`**, pas dans
  l'action serveur, parce que celle-ci importe Stripe et l'email : une garde
  qu'on ne peut pas executer dans un test est une garde qu'on n'a jamais vue
  rouge. Six tests la couvrent, dont le 31 fevrier, que `new Date` accepte en
  glissant au 3 mars.

## 0.26.0 - 2026-08-25

### Corrige

- **Collision de numeros de facture, presente depuis la version 0.12.** Dans
  Postgres, `lpad(chaine, 4, '0')` ne fait pas que completer : il TRONQUE ce qui
  depasse. La sequence 10 000 rendait donc `1000`, exactement le meme numero que
  la sequence 1 000. Mesure sur les 120 000 premieres sequences : l'ancienne
  forme ne produisait que **9 999 valeurs distinctes**. Un numero de facture doit
  etre unique, article 242 nonies A du CGI, et rien n'aurait proteste.
  Le candidat de remplacement `to_char(v, 'FM0000')` echoue exactement de la
  meme facon, 10 000 valeurs distinctes : il a ete teste, pas suppose.
- **Un index unique protege desormais `invoices.number`.** La fonction juste
  aujourd'hui peut etre reecrite demain ; la contrainte, elle, refuse le doublon
  quoi qu'il arrive. Partielle, pour laisser coexister plusieurs brouillons sans
  numero.
- **L'adresse d'expedition par defaut pointait vers un domaine non verifie.**
  `send.beloucif.com` porte le chemin de retour et le SPF du montage Resend,
  mais n'est PAS un domaine verifie : l'API refuse en 403. Le defaut n'avait
  jamais ete exerce, la base ne comptant aucune commande, et il serait apparu au
  premier client reel sous la forme d'un accuse de reception qui ne part pas.
  Constate en tentant un envoi reel.
- **« Total a payer » s'imprimait sur une facture deja reglee**, ce qui est le
  meilleur moyen de se faire payer deux fois. Le libelle suit maintenant l'etat
  de la piece, et une facture acquittee affiche sa date de reglement au lieu
  d'une echeance qui n'a plus d'objet.
- **Les dates des PDF sortaient en ISO** sur un document francais. Elles passent
  en JJ/MM/AAAA, formatees a la main pour ne pas dependre de la locale du
  serveur qui genere la piece.

### Modifie

- **Le numero de facture porte la date d'emission** : `F-06062026-0001` au lieu
  de `F-2026-0001`. Le compteur reste annuel et continu, la date est
  informative : une numerotation qui repartirait a zero chaque jour resterait
  unique mais briserait la continuite de la sequence, et c'est la continuite que
  l'administration regarde.

## 0.25.0 - 2026-08-25

### Ajoute

- **Un moteur d'emailing automatise, avec deux regimes juridiques separes par la
  base.** Le regime `optin` couvre les personnes qui ont coche une case dediee,
  article 6.1.a du RGPD. Le regime `b2b_generique` ne vaut que pour l'adresse
  generique d'une personne morale immatriculee, article L.34-5 du CPCE. Une
  contrainte `CHECK` refuse une adresse nominative en regime professionnel, et
  exige un SIREN : un independant ou une profession liberale est une personne
  physique, et la base l'empeche d'etre traite autrement, sans dependre de
  l'attention de celui qui importe un fichier.
- **Trois sequences, dans `content/emails/sequences.ts`.** Le suivi d'une demande
  de devis, trois relances puis cloture, sur la base de l'article 6.1.b : ce
  n'est pas de la prospection, aucune case n'est requise, et c'est la sequence
  qui rapporte le plus tot. Le carnet du studio, quatre messages d'accueil puis
  une note par mois, sur consentement. Le premier contact professionnel, deux
  messages et jamais trois.
- **La desinscription en un clic**, page `/desinscription` et route
  `/api/desinscription`, avec les en-tetes `List-Unsubscribe` et
  `List-Unsubscribe-Post` de la RFC 8058. C'est le bouton natif de Gmail et
  d'Outlook, celui que les gens utilisent au lieu du bouton « indesirable ».
  Traitement immediat, pas sous quarante-huit heures : la limite legale est un
  plafond, pas un objectif.
- **Le double opt-in** pour les inscriptions faites depuis le pied de page. Sans
  clic de confirmation, aucune adresse n'entre dans la liste et rien ne part.
  Le formulaire de commande, lui, porte deja une preuve bien plus solide,
  formulaire complet et accuse de reception, et n'ajoute pas ce clic.
- **Un pole « Prospection » dans le back-office**, trois onglets : contacts,
  envois, retraits. La liste de suppression y est en LECTURE SEULE : une
  reinscription apres desabonnement a deja coute 250 000 euros a un annonceur
  devant la CNIL, et la friction est voulue.
- **Le battement du moteur par GitHub Actions**, toutes les quinze minutes, sur
  une route gardee par `CRON_SECRET`. Pas par Vercel Cron : le plan Hobby limite
  une tache planifiee a une execution par jour, alors qu'une sequence a des
  echeances a l'heure.
- **Le webhook Resend**, qui retire automatiquement une adresse en cas de
  plainte ou de rebond definitif. Sans lui, le back-office afficherait
  « envoye » pour l'eternite, y compris pour une adresse morte.
- **Le registre des traitements**, `docs/registre-traitements.md`, quatre fiches
  au titre de l'article 30, plus la regle interne interdisant tout premier email
  a une adresse achetee ou extraite automatiquement.
- **Une configuration Vitest**, absente jusqu'ici, et dix-huit tests sur les
  deux choses qu'on ne verra jamais echouer a l'oeil nu : un jeton falsifie qui
  passerait, et un message parti sans lien de retrait.

### Modifie

- **Les etudes de cas portent enfin des chiffres**, et seulement des chiffres
  reellement mesures : poids reel transfere et delai de premiere reponse,
  chacun avec sa methode et sa date dans le champ `source`. La frequentation et
  le taux de prise de contact restent absents tant que la mesure d'audience
  n'est pas branchee.
- **La politique DMARC est posee** sur `beloucif.com` et `send.beloucif.com`,
  en `p=none` pour observer avant de sanctionner, par le nouveau script
  `scripts/setup_dmarc.py`. Sans elle, depuis novembre 2025, Gmail et Yahoo ne
  classent plus le courrier non conforme en indesirable : ils le rejettent.
- **La politique de confidentialite ne ment plus.** Elle affirmait que les
  donnees n'etaient « jamais utilisees pour de la prospection », promesse
  repetee a quatre endroits du site. Une section « Prospection commerciale »
  complete la remplace, et le suivi automatise d'une demande de devis y est
  annonce noir sur blanc, avec son plafond de trois messages.
- **L'etape 5 du tunnel ne demande plus de quoi facturer.** Elle reclamait
  raison sociale, SIREN et adresse de facturation complete, tous obligatoires,
  sur un formulaire de PRISE DE CONTACT : personne ne va chercher son numero
  SIREN pour demander un devis qu'il n'a pas encore vu. La garde n'a pas
  disparu, elle a bouge la ou elle a du sens : `issueInvoice` refuse toujours
  d'emettre une piece a un professionnel sans SIREN valide. Seul le SIREN reste
  propose, facultatif, avec sa verification de format des la saisie.
- **La politique cookies decrivait une carte Google Maps retiree le 2026-08-12**,
  et les mentions legales citaient deux polices non utilisees. Une politique qui
  decrit un traitement inexistant est une politique fausse.
- **Le formulaire de commande porte une seconde case, facultative.** La refuser
  n'empeche rien : un consentement dont le refus bloquerait le service ne serait
  pas libre au sens de l'article 7.4, donc nul.

### Corrige

- **Une panne passagere arretait DEFINITIVEMENT des sequences.** L'appel a la
  garde `peut_recevoir` ne distinguait pas un refus d'un echec : sur coupure
  reseau ou rechargement du cache de schema, la reponse etait nulle, le moteur
  concluait « envoi non autorise » et arretait tout le lot, avec un motif
  parfaitement credible dans le back-office. Un echec libere maintenant le
  verrou et retente au tour suivant.
- **Le suivi de devis relancait des clients qui venaient de signer.**
  `orders.email` etait en `text`, sensible a la casse, et l'adresse y est
  inseree telle qu'elle a ete tapee ; `contacts.email` est en minuscules. Pour
  quelqu'un ayant tape « Jean@Exemple.fr », la comparaison ne trouvait rien et
  la sequence continuait. Colonne passee en `citext`, migration `0016`.
- **Une cle Resend momentanement absente FAISAIT PERDRE le message** au lieu de
  le retenter : la ligne restait verrouillee sans avancer, et au tour suivant
  l'unicite du journal faisait sauter l'etape pour toujours. Le moteur ne
  reserve plus rien sans cle.
- **Toute erreur d'insertion au journal valait « deja envoye ».** Seul le code
  `23505`, la violation d'unicite, le signifie desormais.
- **Le formulaire de commande inscrivait un tiers sans verification.** Cocher la
  case facultative avec l'adresse de quelqu'un d'autre l'inscrivait en
  `confirme`, et le premier message partait au battement suivant. Le double
  opt-in s'applique maintenant a ce chemin comme au pied de page.
- **La preuve de consentement enregistrait un texte que personne n'avait vu.**
  Une constante unique servait pour deux formulaires aux libelles differents.
  Les textes vivent dans `content/consentement.ts`, lus par l'ecran ET par la
  route, et la politique affiche desormais sa version pour qu'une preuve puisse
  y etre rattachee.
- **Le retrait automatique apres trois ans etait promis sans etre implemente.**
  `last_engagement_at` etait alimente mais jamais lu. Fonction
  `purge_consentements_caducs`, migration `0017`, appelee a chaque battement.
- **Une etape affirmait un fait que le moteur ne verifiait pas.** « Le devis
  envoye la semaine derniere » partait sur un simple minuteur, y compris a des
  gens n'ayant jamais recu de devis. Les etapes portent une condition d'etat.
- **Le nom et l'organisation etaient injectes bruts dans le HTML des messages**,
  alors que la coquille echappe tout le reste. Ils viennent d'un formulaire.
- **Un evenement Resend en retard faisait regresser un statut** de « Cliqué » a
  « Délivré ». Les statuts ont un rang, il ne descend plus.
- **Le piege a robots du formulaire du pied de page n'existait pas** : la route
  le validait, le composant ne le rendait jamais.
- **La notification de commande affirmait « TVA non applicable »** pour tout
  professionnel, deduit d'un champ que le formulaire ne collecte plus.
- **Deux homoglyphes cyrilliques** U+0435 dans du code, invisibles a l'oeil et
  a la garde d'encodage, qui cassaient toute recherche sur le mot.
- **Securite : une fonction de la base etait appelable par n'importe qui.**
  Toute fonction du schema `public` est exposee par PostgREST a
  `/rest/v1/rpc/<nom>`, et PostgreSQL accorde l'execution a tous par defaut.
  `desinscrire`, ecrite en SECURITY DEFINER, s'executait donc pour quiconque
  portait la cle publiable, laquelle est publique par conception puisqu'elle vit
  dans le navigateur. Mesure avant correctif : un appel HTTP sans aucun jeton a
  inscrit une adresse arbitraire dans la liste de suppression, contournant toute
  la mecanique de jetons signes. `desinscrire` et `peut_recevoir` sont
  desormais reservees au role de service. La lecon depasse ce projet : une
  fonction n'est pas privee parce que seul le code serveur l'appelle.
- **Le piege a robots annoncait a l'automate qu'il avait ete repere.** Le champ
  invisible etait valide en `max(0)`, donc le remplir faisait echouer la
  validation et renvoyait 400. Le garde-fou ecrit pour repondre un succes
  factice n'etait jamais atteint. Le tri se fait maintenant dans la route.
- **Le CHANGELOG portait trois fois l'entree 0.20.0**, dans le desordre, et rien
  pour 0.23.0 ni 0.24.0. Les etiquettes ont ete recalees sur les commits qui ont
  reellement bumpe `package.json`.
- **Treize imports morts dans `app/admin/actions.ts`**, restes de la scission en
  `actions-facturation.ts`. Ils laissaient croire que ce module touchait encore
  aux factures.
- **Trois pages du back-office supprimees par le regroupement en poles trainaient
  encore sur le disque**, non suivies par git. Une route reelle gagne sur une
  redirection : elles masquaient silencieusement les redirections de
  `next.config.ts`.

## 0.24.0 - 2026-08-20

### Modifie

- **Le back-office se lit en deux poles au lieu de cinq entrees.** Demandes et
  Projets sont deux moments du meme fil : une demande gagnee devient un projet.
  Devis et Comptabilite lisent la meme table de factures, l'un pour suivre les
  paiements, l'autre pour en tirer le recapitulatif URSSAF. Ils vivent
  desormais sous « Activite » et « Argent », avec des onglets qui vivent dans
  l'URL - un onglet garde en memoire ne se met pas en favori et se perd a chaque
  rechargement, or on recharge beaucoup un back-office.
- **Les quatre anciennes adresses redirigent** (`/admin/leads`,
  `/admin/projets`, `/admin/facturation`, `/admin/comptabilite`). La fiche
  d'une facture, elle, ne bouge pas.
- **La bascule clair/sombre est enfin dans le back-office.** Elle existait
  depuis longtemps, mais seulement dans l'en-tete du site public - alors que
  c'est l'ecran qui se tient le plus tard et le plus longtemps.

### Ajoute

- **Un etat vide partage.** Le back-office portait cinq formulations de la meme
  chose, toutes en petit gris sans cadre : une page qui se contente d'une ligne
  grise se lit comme une panne.
- **`npm run verifie:admin`** - garde d'architecture : une seule largeur, un
  seul en-tete (`PageHeading`), une seule source de navigation, aucune adresse
  perdue, aucun fichier au-dela de quatre cents lignes. Le depot etait deja
  sain ; c'est justement pour cela qu'il vaut la peine d'etre garde, car un
  ecart arrive toujours par un ecran ajoute un soir.

### Interne

- `app/admin/actions.ts` (462 lignes) est scinde : l'activite commerciale d'un
  cote, la facturation de l'autre. Emettre une facture - numerotation continue,
  instantane de l'emetteur, lien de paiement, courriel - se relit ligne a
  ligne, et se relisait mal au milieu des deplacements de cartes.
- La fonction `db()`, recopiee dans les deux fichiers d'actions, vit dans
  `lib/admin-db.ts` : toutes les mutations doivent passer par le client lie a
  la session pour que RLS applique `is_blf_admin()`.
## 0.23.0 - 2026-08-20

### Ajoute

- **IndexNow.** Le site annonce desormais ses pages a Bing, Yandex, Seznam et
  Naver en un seul appel, au lieu d'attendre qu'un robot repasse - ce qui prend
  des jours, parfois des semaines. `npm run indexnow`, a lancer apres un
  deploiement.

  Le script lit le plan du site et ne tient AUCUNE liste : une seconde liste
  divergerait de la premiere des la page suivante, et personne ne s'en
  apercevrait - le plan resterait juste, l'annonce oublierait les nouveautes.

  Il verifie aussi le fichier de cle AVANT d'annoncer, en nommant l'adresse
  attendue. C'est la seule erreur vraiment frequente du protocole : sans ce
  fichier servi a la racine, le moteur repond 403 et l'annonce est perdue sans
  que rien ne l'explique.

  La cle est publique par construction - le moteur la lit a la racine du site
  pour verifier qu'on controle le domaine. Elle vit dans le code plutot que
  dans l'environnement pour rester identique au fichier `public/<cle>.txt` :
  deux sources separees finiraient par diverger.

  Google ne participe pas a IndexNow. Pour lui, le plan du site et la Search
  Console restent le seul chemin.

## 0.22.1 - 2026-08-20

### Corrige

- **`npm run lint` analysait tout le disque.** La commande etait `eslint` sans
  chemin : plus de sept minutes, 116 000 remontees, et donc une commande que
  personne ne lance. Elle cible desormais `app`, `components` et `lib` - trente
  secondes, deux avertissements.
- **Le controle du francais reclamait d'accentuer du CODE.** Il signalait
  `numero` dans le livre des recettes, c'est-a-dire une propriete TypeScript :
  l'accentuer aurait casse la compilation, exactement la panne que l'en-tete du
  script raconte avoir deja subie sur un import. La cause : le filtre
  `looks_like_code` etait applique aux textes JSX mais pas aux chaines, et
  l'expression reguliere capturait tout le code separant deux chaines
  eloignees. Verifie dans les deux sens - le controle ne signale plus le code,
  et attrape toujours une vraie faute d'accent introduite volontairement.

## 0.22.0 - 2026-08-20

### Logos cliquables et pied de page range

- **Tous les logos ramenent a l'accueil.** Le logo du pied de page, celui du
  back-office et celui des ecrans de connexion sont desormais des liens vers
  l'accueil, comme l'etait deja celui de l'en-tete.
- **Pied de page reorganise.** L'ancienne colonne fourre-tout de douze liens
  est repartie par intention : les pages du studio d'un cote, les actions
  (demarrer un projet, prendre rendez-vous, contact) dans la colonne contact.
  Les liens legaux descendent dans la barre basse, a cote de la denomination et
  du SIRET. Aucune page n'est perdue.

## 0.21.0 - 2026-08-20

### Reduire l'empreinte de l'adresse de domicile

L'adresse etait repetee bien au-dela du minimum legal. On la reserve aux seuls
endroits ou la loi l'exige (mentions legales, formulaire de retractation,
facture) :

- **Pied de page** : "Ile-de-France" au lieu de la commune et du code postal,
  sur toutes les pages du site.
- **CGV** : l'adresse complete du corps devient un renvoi vers les mentions
  legales (le formulaire de retractation garde l'adresse, il l'exige).
- **Donnees structurees (JSON-LD)** : SIRET et SIREN retires, comme l'adresse et
  le telephone l'etaient deja, pour ne pas les rendre moissonnables.
- **Confidentialite** : contact par e-mail seul, sans la rue.

## 0.20.0 - 2026-08-20

### N'afficher que le strict minimum legal

Audit par un sous-agent juridique dedie, puis retrait de tout ce qui etait
affiche sans obligation :

- **Code APE** retire du pied de page (toutes les pages) et des mentions
  legales : ce n'est une mention obligatoire ni de la LCEN, ni d'une facture.
- **SIRET** retire du pied des e-mails (accuse de reception, e-mail de paiement)
  et du fichier `llms.txt` : il n'est requis que sur la facture et les mentions
  legales, pas sur une correspondance ordinaire ni un fichier moissonnable.
- **Telephone personnel** retire des devis et factures : il n'est pas une
  mention obligatoire de facture, et l'e-mail suffit comme contact. Il reste sur
  les mentions legales, ou la loi l'impose.

## 0.19.0 - 2026-08-20

### Corrige

- **Texte sombre sur fond sombre supprimé partout.** Un aplat coloré posé sur
  une classe `blk` (badges, alertes, bascules, boutons du back-office et du
  formulaire) restait en réalité sur la surface : en clair ça passait par
  accident, en sombre le texte devenait illisible. Les classes `blk` passent
  dans `@layer components`, si bien qu'un `bg-accent` reprend la main quand il
  est présent, sur tout le site.

### Change

- **Back-office aux couleurs de BLF Lab's.** La grille de paillasse du site
  habille le fond du dashboard et des écrans de connexion, le logo s'affiche en
  tête (et bascule sur sa version claire en thème sombre), et les écrans
  d'authentification partagent un gabarit commun.

## 0.18.0 - 2026-08-20

### Ajoute

- **Date de la prestation** sur les devis et factures. Un champ facultatif
  permet d'indiquer quand la prestation a réellement été réalisée ; il ne
  s'affiche que s'il diffère de la date d'émission, comme l'exige l'article
  242 nonies A, 3° du CGI pour une facture émise après l'achèvement.

## 0.17.0 - 2026-08-20

### Corrige

- **Droit de rétractation sur les devis adressés à un particulier.** Le contrat
  se noue à la signature du devis : ce document doit donc porter l'information
  sur le droit de rétractation et le formulaire type (annexe art. R. 221-1),
  faute de quoi le délai passe de quatorze jours à douze mois. Le devis destiné
  à un particulier les affiche désormais, sur le PDF comme à l'écran, à partir
  d'une source unique partagée avec les CGV.
- **Libellés adaptés au devis.** Un devis n'est pas une demande de paiement :
  il affiche « Valable jusqu'au » au lieu de « Échéance le » et « Montant du
  devis » au lieu de « Total à payer ».

## 0.16.0 - 2026-08-20

### Change

- **Back-office réagencé.** L'admin ne s'ouvre plus directement sur le pipeline :
  une page d'**accueil** pose d'abord une vue d'ensemble (CA encaissé du mois,
  encaissé total, à encaisser, leads en cours, projets actifs) et l'activité
  récente (pièces et leads). La navigation devient des onglets avec un onglet
  actif souligné au citron, le logo coiffe la barre, et toutes les pages
  partagent le même en-tête à filet. Les survols flottants (lévitation) sont
  retirés au profit de transitions nettes. Le pipeline commercial vit désormais
  sous l'onglet **Leads**.

## 0.15.0 - 2026-08-20

### Ajoute

- **Catalogue de prestations réutilisables.** Pour facturer plus vite, chaque
  prestation se retient : un sélecteur pré-remplit désignation et prix à la
  composition d'une ligne. Le catalogue se remplit tout seul (toute ligne
  facturée y est enregistrée, sans doublon) et se gère à la main depuis la page
  de facturation (ajouter, corriger un prix, retirer). Les prestations les plus
  facturées remontent en tête du sélecteur.

## 0.14.0 - 2026-08-20

### Ajoute

- **Suppression d'un brouillon** depuis la liste de facturation, avec
  confirmation en deux temps. Une pièce déjà émise ne se supprime pas : elle
  porte un numéro légal dont la séquence doit rester continue, on l'annule.

### Change

- **SIREN / SIRET obligatoire pour émettre à un client professionnel**, et nom
  de client requis dans tous les cas : l'émission est refusée sinon, pour ne pas
  consommer un numéro légal sur une pièce incomplète.
- **Pièce émise réellement verrouillée côté serveur.** Le contenu et les lignes
  d'une facture déjà numérotée ne peuvent plus être modifiés (le verrou ne
  vivait que dans l'affichage).
- **Indemnité de recouvrement de 40 € retirée des pièces adressées à un
  particulier** : ce dispositif est réservé aux transactions entre
  professionnels (art. L441-10 II du code de commerce).
- **Code APE retiré des factures et devis** : il n'est pas une mention légale
  obligatoire. L'identité repose sur le SIRET.

## 0.13.0 - 2026-08-20

### Ajoute

- **Logo sur les devis et factures.** Le document portait seulement le nom en
  texte ; il porte maintenant le logo BLF Lab's, en en-tete du PDF comme de la
  vue a l'ecran. Le logo est un bitmap embarque en base64 dans le generateur
  PDF, pour rester disponible cote serveur ou un acces fichier n'est pas
  garanti.

## 0.12.1 - 2026-08-20

### Corrige

- **Lien de paiement Stripe fiabilise.** La redirection de fin de paiement
  exigee par Stripe doit etre une URL absolue. Quand la server action ne
  recevait pas d'en-tete d'origine, l'adresse devenait relative et Stripe
  refusait le lien entier ; l'erreur, avalee a l'emission, laissait une facture
  emise sans lien ni email. On retombe desormais sur le domaine canonique du
  site, donc le lien se genere toujours.

## 0.12.0 - 2026-08-20

### Change

- **Hero remis dans la direction artistique du site.** Le premier ecran ne
  ressemble plus a une page generee : angles droits partout (les boutons
  pilule deviennent des rectangles, comme le reste du site trace a la regle),
  l'accent passe par un soulignement au citron sur un mot plutot que par une
  ligne de titre coloree, une etiquette de studio coiffe le titre, et le trio
  de puces sous les boutons disparait (le sous-titre portait deja la promesse).
- **Boutons a angle droit sur tout le site.** La suppression de la pilule et de
  son survol flottant (levitation plus halo violet) vaut pour l'ensemble des
  boutons, pas seulement le hero, pour rester coherent avec l'identite.

## 0.11.1 - 2026-08-20

### Améliore

- **Montant de facture en une saisie.** À la création d'un devis ou d'une
  facture, un champ « Montant en € » pose directement une ligne : plus besoin de
  composer des lignes détaillées pour un montant simple. Le lien de paiement se
  génère ensuite à l'émission, comme avant.

## 0.11.0 - 2026-08-20

### Ajoute

- **Paiement en ligne des factures (Stripe).** À l'émission d'une facture, un
  lien de paiement Stripe est généré et envoyé au client par email (bouton
  « Payer ma facture ») ; le lien est aussi disponible et regénérable depuis la
  fiche. Quand le client paie, un **webhook à signature vérifiée** passe la
  facture en payé, renseigne le mode « Carte » et la fait entrer dans le livre
  des recettes, automatiquement. Micro-entreprise : le montant encaissé est le
  TTC (= HT, franchise de TVA). Le webhook doit pointer sur le domaine actif.

## 0.10.1 - 2026-08-20

### Sécurité

- **En-têtes de sécurité** sur toutes les réponses (HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors)
  et **dépendance vulnérable corrigée** (nanoid). Passage de la checklist de
  pré-lancement : RLS, secrets hors du code, clés publique/privée séparées,
  validation serveur, sessions expirantes, message d'erreur unique et
  console propre étaient déjà en place.

## 0.10.0 - 2026-08-20

### Améliore

- **Le hero et la page de commande tiennent dans le premier écran.** Le titre
  d'accueil, trop grand, remplissait l'écran à lui seul et poussait les boutons
  et toute preuve sous la ligne de flottaison ; il est redimensionné et complété
  d'une bande de preuve, si bien que le message, l'action et les garanties sont
  visibles sans scroller. La page `/commander` a un en-tête plus compact : le
  formulaire est immédiatement atteignable.
- **Le formulaire de commande est un vrai parcours guidé, une question par
  étape** (type, budget, délai, besoin, coordonnées), chaque étape tenant à
  l'écran, avec un **état de chargement** clair à l'envoi.

## 0.9.0 - 2026-08-20

### Ajoute

- **Comptabilité dans le back-office.** Une section `/admin/comptabilite` dérive
  des factures : **trésorerie** (encaissé vs à encaisser), **récap URSSAF** par
  trimestre ou par mois (CA encaissé + cotisations dues au taux 2026, 25,6 %
  cotisations sociales BNC + 0,2 % CFP, à revérifier à la source), et **livre des
  recettes** chronologique avec **export CSV** (séparateur point-virgule, prêt
  pour un comptable). Le mode de règlement se renseigne sur la fiche de la
  facture. Aucun montant n'est déclaré automatiquement : les chiffres sont
  préparés pour être recopiés dans l'espace URSSAF ou la plateforme agréée.

## 0.8.0 - 2026-08-20

### Ajoute

- **Téléchargement du PDF d'un devis ou d'une facture** depuis sa fiche dans le
  back-office. Le document reprend toutes les mentions obligatoires (émetteur,
  numéro, dates, lignes, « TVA non applicable, art. 293 B », conditions de
  paiement, médiateur pour un particulier) et l'identité figée à l'émission.

### En cours

- La facture **électronique structurée (Factur-X : PDF + XML embarqué)**, exigée
  du format e-invoicing, n'est pas encore générée : le PDF actuel est un document
  lisible, pas encore une pièce structurée transmissible via une plateforme
  agréée. Étape suivante du chantier facturation.

## 0.7.0 - 2026-08-19

### Ajoute

- **Facturation conforme dans le back-office (socle).** Chaque devis ou facture
  se compose avec des lignes de détail (désignation, quantité, prix unitaire),
  les coordonnées complètes de l'acheteur, et s'affiche en document conforme
  portant toutes les mentions obligatoires : identité de l'émetteur (SIRET, APE,
  forme juridique), mention « TVA non applicable, art. 293 B du CGI », conditions
  et pénalités de paiement, et le médiateur de la consommation face à un
  particulier.
- **Numérotation légale, séquentielle et sans trou.** À l'émission, la pièce
  reçoit un numéro attribué en base de façon atomique (format `F-2026-0001` /
  `D-2026-0001`, un compteur par année et par type), et l'identité de l'émetteur
  est figée sur la pièce : une facture émise ne change plus si le SIRET ou
  l'adresse évoluent ensuite.

Ce socle prépare la génération d'e-factures (Factur-X) et le suivi comptable
(livre de recettes, URSSAF), livrés dans les étapes suivantes.

## 0.6.0 - 2026-08-19

### Corrige

- **Texte illisible en thème sombre (noir sur fond noir).** Les titres de colonnes
  du pied de page, le fil d'Ariane et les sources des chiffres utilisaient une
  teinte trop sombre (`--faint`) qui disparaissait sur le fond sombre. Remontée à
  un contraste conforme WCAG AA (4,8:1), lisible sans être criarde.

### Améliore

- **Le basculement clair/sombre se fait en fondu** plutôt qu'en coupure sèche, et
  le pictogramme du bouton pivote quand on change de thème (animations désactivées
  pour qui réduit les animations).
- **Formulaire de commande plus sûr et plus accessible.** Le focus suit chaque
  étape (utile au clavier et aux lecteurs d'écran), se pose sur le premier champ
  invalide quand on est bloqué, et sur le message d'erreur en cas d'échec d'envoi.
  L'email, le SIREN et le numéro de TVA sont vérifiés dès la sortie du champ. Le
  compteur de caractères annonce le minimum et le maximum. Les cartes de choix
  répondent au toucher.
- **Plus de flash de couleurs claires** sur l'animation 3D d'accueil quand on
  charge le site en thème sombre.

## 0.5.0 - 2026-08-19

### Modifie

- **La connexion au back-office passe par un mot de passe, plus par un lien
  magique.** L'accès demande désormais l'email et un mot de passe (facteur 1),
  puis toujours le code d'une application d'authentification (facteur 2, TOTP).
  À la toute première connexion, le compte est livré avec un mot de passe
  provisoire qui doit être remplacé avant d'aller plus loin : tant qu'il n'est
  pas changé, aucun accès, pas même l'écran d'activation du second facteur.
- **Le second facteur s'active en scannant un QR code** dans l'application
  d'authentification dès la première connexion, puis le code à six chiffres est
  demandé à chaque session. La garde en base reste la même (RLS `aal2` + email
  autorisé) : une clé qui fuite ne lit toujours aucune ligne.

## 0.4.0 - 2026-08-19

### Ajoute

- **Un back-office `/admin` pour piloter tout le studio.** Un seul endroit pour
  suivre les demandes reçues, les projets en cours, la facturation et les tâches,
  en remplacement d'un suivi éparpillé. Les leads et les projets s'affichent en
  tableaux Kanban : glisser une carte d'une colonne à l'autre change son statut,
  et le changement est enregistré tout de suite en base.
- **Une connexion à double authentification.** L'accès demande d'abord un lien
  magique reçu par email, puis un code à six chiffres d'une application
  d'authentification (TOTP). Tant que ce second facteur n'est pas validé, aucune
  donnée n'est visible : la règle est posée dans la base elle-même (RLS exigeant
  le niveau `aal2` et un email autorisé), pas seulement dans l'interface. Une clé
  qui fuite ne suffit donc pas à lire une seule ligne.
- **Trois nouvelles tables** (`projects`, `invoices`, `project_tasks`) et le
  suivi commercial des commandes, toutes protégées par la même garde
  d'administration.

## 0.3.1 - 2026-08-14

### Corrige

- **Les deux captures de realisations ne montraient pas les projets.** Celle de
  Bacchana affichait l'ecran d'accueil de son guide d'introduction avec le
  bandeau cookies par dessus, celle d'Ohypnozen la page floutee derriere sa
  visite guidee. La vitrine du studio prouvait donc l'existence de deux bandeaux
  de consentement, et rien d'autre. Les captures montrent desormais l'interface
  reelle des deux produits.

### Ajoute

- `scripts/capture_shots.py`, qui rejoue le parcours d'un visiteur avant de
  declencher la capture : passer le guide, refuser les traceurs, laisser
  l'interface se poser, puis convertir en WebP. Il remplace
  `scripts/optimize_shots.py`, qui se contentait de convertir et cherchait
  encore ses fichiers sources sous l'ancienne orthographe fautive du nom de la
  cliente, donc n'aurait rien reproduit du tout.
- Le script force la resolution IPv4 des domaines captures : sur un acces qui
  fait du DNS64/NAT64, un domaine sans enregistrement IPv6 se voit repondre une
  adresse synthetisee qui ne route pas, et la capture echouait sur le reseau
  plutot que sur le site.

### Retire

- Deux fichiers `.pyc` suivis par accident dans `scripts/__pycache__`, et la
  regle `.gitignore` qui manquait pour les tenir dehors.

## 0.3.0 - 2026-08-11

### Ajoute

- **Scene 3D du hero** en React Three Fiber : la fiole du logo rendue en volume,
  avec une refraction reelle et une parallaxe a la souris. Elle ne se charge pas
  du tout sans WebGL 2.0, sous `prefers-reduced-motion` ou quand `Save-Data` est
  demande, et `three` n'entre alors pas dans le paquet initial.
- **Barre de navigation en verre refractif** : une carte de deplacement SVG
  courbe l'arriere-plan sans le flouter, tant que la page n'a pas defile.
- **Revelation au defilement** avec GSAP ScrollTrigger sur les grilles de cartes.
  Rien n'est masque en CSS, donc une panne de script ne vide jamais la page.
- **Mesure d'audience GA4 derriere un bandeau de consentement conforme CNIL.**
  Aucune requete ne part vers Google avant acceptation. Refuser est aussi simple
  qu'accepter, et le choix se retire depuis la page de confidentialite.
- **Verification continue** : un workflow GitHub Actions rejoue types, lint,
  tests, encodage, accents et build a chaque poussee, plus une garde
  typographique. Les gardes du depot existaient mais ne tournaient qu'a la main.
- `.env.example`, qui manquait, avec l'effet de chaque variable absente.
- Premier test du depot, sur la geometrie de la fiole. `vitest` etait installe
  sans rien a executer.

### Corrige

- **Le nom de la cliente Ohypnozen etait mal orthographie** sur la fiche de
  reference, ainsi que son adresse et le nom du fichier de capture. Un
  commentaire du fichier affirmait que cette orthographe etait la bonne.
- Douze fautes d'accent dans du texte visible.
- `scripts/check_french.py --fix` renommait un import et cassait la compilation,
  la panne meme que son en-tete disait avoir deja subie. La zone protegee etait
  testee en inclusion la ou il fallait un chevauchement.
- La page de confidentialite affirmait qu'aucun service tiers n'etait charge
  depuis le navigateur. Reecrite avec finalite, base legale, destinataire et
  duree de conservation.
- La section Direction artistique du README decrivait encore une direction
  abandonnee, avec une palette qui n'est plus celle du site.
- Valeur par defaut de `RESEND_FROM` fausse dans le README.

### Securite

- Passage a Next 16.3.0 : les trois avis de severite haute signales par
  `npm audit` disparaissent. Zero vulnerabilite restante.

## 0.2.0

Site multi-pages, tunnel de commande en trois etapes, enregistrement en base
Supabase, notification et accuse de reception par Resend, pages legales,
sitemap et robots.

## 0.1.0

Amorce du projet.
