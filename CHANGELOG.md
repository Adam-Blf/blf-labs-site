# Journal des versions

Format inspire de Keep a Changelog, versionnage semantique.

Regle de lecture : une entree decrit ce qui change pour quelqu'un qui utilise le
site ou reprend le depot, pas la liste des fichiers touches. Le detail technique
est dans les messages de commit et les pull requests.

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
