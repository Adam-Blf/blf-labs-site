# Journal des versions

Format inspire de Keep a Changelog, versionnage semantique.

Regle de lecture : une entree decrit ce qui change pour quelqu'un qui utilise le
site ou reprend le depot, pas la liste des fichiers touches. Le detail technique
est dans les messages de commit et les pull requests.

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
