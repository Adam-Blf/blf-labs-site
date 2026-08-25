# BLF Lab's - site officiel

Version 0.25.0

<!-- adam-badges:start -->
[![verification](https://img.shields.io/github/actions/workflow/status/Adam-Blf/blf-labs-site/ci.yml?branch=main&style=flat-square&label=verification)](https://github.com/Adam-Blf/blf-labs-site/actions/workflows/ci.yml)
[![commits](https://img.shields.io/github/commit-activity/t/Adam-Blf/blf-labs-site?color=001329&label=commits&style=flat-square)](https://github.com/Adam-Blf/blf-labs-site/commits)
[![visites](https://hits.sh/github.com/Adam-Blf/blf-labs-site.svg?style=flat-square&label=visites&color=001329)](https://hits.sh/github.com/Adam-Blf/blf-labs-site/)
[![last commit](https://img.shields.io/github/last-commit/Adam-Blf/blf-labs-site?color=D4A437&style=flat-square&label=dernier%20push)](https://github.com/Adam-Blf/blf-labs-site/commits)
[![top language](https://img.shields.io/github/languages/top/Adam-Blf/blf-labs-site?style=flat-square)](https://github.com/Adam-Blf/blf-labs-site)
[![license](https://img.shields.io/github/license/Adam-Blf/blf-labs-site?style=flat-square&color=D4A437)](LICENSE)
<!-- adam-badges:end -->

Site vitrine et tunnel de commande du studio **BLF Lab's**, publie sur
**beloucif.com**. Une demande envoyee depuis le site est enregistree en base,
notifiee par email au studio, et confirmee au client par un accuse de reception.

## Sommaire

- [Architecture](#architecture)
- [Direction artistique](#direction-artistique)
- [Demarrer](#demarrer)
- [Variables d'environnement](#variables-denvironnement)
- [Emails et DNS](#emails-et-dns)
- [Prospection par email](#prospection-par-email)
- [Scripts](#scripts)
- [Verification](#verification)
- [Choix structurants](#choix-structurants)

## Architecture

```mermaid
flowchart TD
    V["Visiteur"] -->|"formulaire 3 etapes"| F["/commander"]
    F -->|"POST JSON"| API["/api/orders"]

    subgraph Next["Application Next.js 16 sur Vercel"]
        F
        API
        P["Pages statiques<br/>accueil, offres, references, legal"]
    end

    API -->|"1. valide"| Z["Schema Zod partage<br/>lib/validation.ts"]
    API -->|"2. limite le debit"| H["Empreinte SHA-256 de l'IP<br/>3 envois par heure"]
    API -->|"3. enregistre"| DB[("Supabase<br/>orders, projects, invoices, project_tasks<br/>RLS active, is_blf_admin = email + aal2")]
    API -->|"4. notifie"| R["Resend"]

    R -->|"notification"| A["adam@beloucif.com"]
    R -->|"accuse de reception"| C["Client"]

    subgraph Admin["Back-office /admin (proxy.ts, matcher /admin/*)"]
        L["/admin/login<br/>email + mot de passe (facteur 1)"]
        P["/admin/change-password<br/>mot de passe provisoire<br/>a changer (1re connexion)"]
        T["/admin/2fa<br/>QR puis code TOTP (facteur 2 -> aal2)"]
        K["Kanban leads + projets<br/>facturation, taches"]
        L --> P --> T --> K
    end

    K -->|"lecture et ecriture<br/>filtrees par RLS (aal2)"| DB
```

Le point important : l&rsquo;etape 5 ne peut pas faire echouer l&rsquo;etape 3.
Si Resend est indisponible ou mal configure, la demande reste enregistree et le
drapeau `mail_sent` garde la trace de la relance a faire. Perdre une demande
client parce qu&rsquo;une variable d&rsquo;environnement manque serait la pire
des pannes silencieuses.

## Direction artistique

Huit directions completes ont ete maquettees sur la vraie page d&rsquo;accueil,
puis departagees sur captures. La retenue est la direction **"laboratoire"**,
posee en classe `.dir-labs` : angles droits, filets fins de 1 px, aplats francs,
titres en capitales dans la largeur variable d&rsquo;Archivo. Palette encre
`#111016`, neige `#edeef1`, violet `#cb6ce6` et citron `#d9fb50`.

Trois choses sont exclues par principe, parce qu&rsquo;elles signent une
interface generee plutot qu&rsquo;une interface dessinee : **le degrade**, le
**verre depoli** et le **halo de couleur diffuse** derriere un titre. La classe
`.grad-text` porte donc un aplat de violet et non un degrade, et les disques
flous du hero ont ete remplaces par la grille millimetree de la paillasse.

Elle vit dans `app/themes.css` sous forme de jetons : couleurs, rayon, epaisseur
de trait, ombre, police de titre, casse et rythme vertical. **Aucun composant ne
code un style en dur** : ils lisent les classes `blk`, `title`, `section`,
`rule-b`. Changer de direction ne demande donc de toucher aucun composant.

### Effets

Trois effets se greffent sur cette direction sans la modifier, et chacun se
retire sans laisser de trou :

- **Scene 3D du hero** (React Three Fiber). La fiole du logo en volume, avec une
  refraction reelle. Elle ne se charge pas du tout sans WebGL 2.0, sous
  `prefers-reduced-motion`, ou quand `Save-Data` est demande : le repli est
  l&rsquo;etat par defaut, et c&rsquo;est la grille qui reste. Ni `three` ni
  `drei` n&rsquo;entrent alors dans le paquet initial.
- **Barre de navigation en verre refractif**. Une carte de deplacement SVG
  courbe l&rsquo;arriere-plan sans le flouter, tant que la page n&rsquo;a pas
  defile. Des qu&rsquo;un contenu passe dessous, la barre redevient opaque :
  au-dessus d&rsquo;un texte qui glisse, une barre translucide est illisible.
- **Revelation au defilement** (GSAP ScrollTrigger). Rien n&rsquo;est masque en
  CSS : l&rsquo;etat visible est l&rsquo;etat naturel du document, donc une
  panne de script ne produit jamais une page blanche.

Le mouvement reduit est traite en JavaScript et pas seulement en CSS : le bloc
`@media (prefers-reduced-motion: reduce)` annule des durees de transition, il
n&rsquo;arrete ni une boucle WebGL ni un `requestAnimationFrame`.

Regle de contraste heritee d&rsquo;un projet precedent : `--accent-ink` et
`--support-ink` sont invariants par theme. Tout texte pose sur un aplat les
utilise, jamais `--ink`, sans quoi il s&rsquo;inverse en mode sombre alors que
l&rsquo;aplat, lui, ne bouge pas.

Le logo est un bloc typographique ou **la fiole de laboratoire remplace le A de
LAB'S** : une fiole d&rsquo;Erlenmeyer a la silhouette d&rsquo;un A et son niveau
de liquide en fait la barre.

## Demarrer

```bash
npm install
npm run dev     # http://localhost:3200
npm run build
```

Le port 3200 est reserve a ce projet dans le registre de ports local.

## Variables d'environnement

Aucune n&rsquo;est obligatoire pour lancer le site : sans elles il tourne en mode
degrade, et le formulaire indique une alternative par email.

| Variable | Role | Sans elle |
|---|---|---|
| `RESEND_API_KEY` | Envoi des emails | Aucun email, la demande reste en base |
| `RESEND_FROM` | Adresse d&rsquo;expedition | Valeur par defaut `contact@send.beloucif.com` |
| `SUPABASE_URL` | Base de donnees | Aucune ecriture, seul l&rsquo;email part |
| `SUPABASE_SERVICE_ROLE_KEY` | Ecriture serveur | Idem. **Jamais cote client** |
| `NEXT_PUBLIC_SUPABASE_URL` | Authentification admin | `/admin` inaccessible |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Authentification admin | `/admin` inaccessible |
| `ADMIN_EMAILS` | Liste blanche du back-office | Personne n&rsquo;entre |
| `IP_HASH_SALT` | Sel de l&rsquo;empreinte d&rsquo;IP | Sel par defaut, a definir en production |
| `NEXT_PUBLIC_GA_ID` | Mesure d&rsquo;audience GA4 | Aucune mesure, et **aucun bandeau de consentement** |
| `STRIPE_SECRET_KEY` | Liens de paiement des factures | Facture emise sans lien de paiement |
| `STRIPE_WEBHOOK_SECRET` | Verification de la signature Stripe | Le webhook refuse tout |
| `INDEXNOW_KEY` | Annonce des pages aux moteurs | Repli sur une cle en dur, publique par conception |
| `CRON_SECRET` | Garde de `/api/cron/sequences` | La route repond 401, **aucune sequence ne part** |
| `UNSUBSCRIBE_SECRET` | Signature des liens de retrait et de confirmation | Le moteur **leve** : mieux vaut ne rien envoyer que des liens falsifiables |
| `RESEND_WEBHOOK_SECRET` | Verification de la signature Resend | Plaintes et rebonds non traites, la liste ne se nettoie plus |
| `RESEND_FROM_PROSPECTION` | Expedition des sequences | Valeur par defaut `carnet@send.beloucif.com` |
| `PROSPECTION_PLAFOND_JOUR` | Plafond d&rsquo;envois par jour | 50, valeur volontairement basse au demarrage |

## Emails et DNS

Les emails partent du domaine `beloucif.com` verifie chez Resend (region
Irlande). Trois enregistrements sont necessaires, poses automatiquement dans la
zone OVH :

- `TXT resend._domainkey` : signature DKIM
- `MX send` et `TXT send` : chemin de retour et SPF, **sur le sous-domaine**

Ce point compte : Resend place son SPF sur `send`, pas sur la racine. Les
enregistrements MX de `beloucif.com` restent donc intacts et la boite
`adam@beloucif.com` continue de fonctionner. Le script refuse d&rsquo;ecrire un
MX a la racine, precisement pour eviter cet accident.

## Prospection par email

Deux regimes juridiques cohabitent, et **c'est la base qui les empeche de se
melanger**, pas la vigilance de celui qui importe un fichier.

| Regime | Qui | Fondement | Ce que la base exige |
|---|---|---|---|
| `optin` | Toute personne physique | Consentement, article 6.1.a du RGPD | Statut `confirme`, donc une case cochee et, depuis le pied de page, un clic de confirmation |
| `b2b_generique` | Adresse generique d'une personne morale immatriculee | Article L.34-5 du CPCE | SIREN present ET partie locale dans une liste blanche (`contact`, `info`...). Une adresse `prenom.nom@` est **refusee par la contrainte `contacts_b2b_strict`** |

Un independant ou une profession liberale est une personne physique : il releve
du premier regime, jamais du second. C'est la nuance qui coute le plus cher
quand on la rate, d'ou une contrainte en base plutot qu'une note dans un
document.

```mermaid
flowchart LR
  F1[Formulaire commande<br/>case facultative] --> C[(contacts)]
  F2[Pied de page] --> DOI[Double opt-in] --> C
  IMP[Import professionnel<br/>SIREN + adresse generique] --> C
  C --> E[(enrollments)]
  CRON[GitHub Actions<br/>15 min] -->|Bearer CRON_SECRET| API[/api/cron/sequences/]
  API --> E
  API --> G{peut_recevoir}
  G -->|autorise| SEND[Resend<br/>List-Unsubscribe RFC 8058]
  SEND --> LOG[(email_sends)]
  WH[/api/resend/webhook/] -->|plainte, rebond dur| SUP[(suppression_list)]
  UNSUB[/desinscription/] --> SUP
  SUP --> G
```

**Ou vit quoi.** Le contenu des messages est en TypeScript dans
`content/emails/sequences.ts`, pas en base : il passe ainsi la garde
typographique et `check:french` de l'integration continue, et se relit dans une
revue de code. La base ne garde qu'un slug de sequence et un numero d'etape.

**Trois invariants du moteur**, `lib/prospection/moteur.ts` :

1. la ligne de journal est ecrite **avant** l'appel a Resend, et l'unicite
   `(enrollment_id, etape)` empeche le doublon si le processus meurt entre les
   deux ;
2. la regle d'autorisation vit dans la fonction SQL `peut_recevoir`, une seule
   fois. Le moteur l'appelle, il ne la reimplemente pas ;
3. un plafond quotidien, bas au demarrage. Un domaine neuf qui envoie plusieurs
   centaines de messages le premier jour se fait classer en indesirable, et il
   emporte avec lui les factures qui partent du meme domaine.

**Le battement** vient de `.github/workflows/prospection.yml`, pas de Vercel
Cron : le plan Hobby limite une tache planifiee a une execution par jour, alors
qu'une sequence a des echeances a l'heure.

Registre des traitements et regle sur l'origine des adresses :
[`docs/registre-traitements.md`](docs/registre-traitements.md).

## Scripts

Tout asset genere a son script reproductible, aucun n&rsquo;embarque de secret :

| Script | Role |
|---|---|
| `scripts/fetch_fonts.py` | Rapatrie les polices en local (aucun CDN) |
| `scripts/fetch_icons.py` | Recupere les pictogrammes Icons8 et les convertit en composants React |
| `scripts/ovh_dns.py` | Consulte et modifie la zone DNS de beloucif.com |
| `scripts/setup_email_dns.py` | Lit les enregistrements exiges par Resend et les pose chez OVH, de facon idempotente |
| `scripts/check_encoding.py` | Garde : UTF-8 propre, sans BOM ni mojibake. Executee en CI |
| `scripts/check_french.py` | Garde : accents manquants dans le texte visible. `--fix` pour appliquer. Executee en CI |
| `scripts/clean_svg.py` | Retire les metadonnees des SVG exportes de Canva |
| `scripts/capture_shots.py` | Recapture les realisations en ligne, guide d'introduction et bandeau cookies ecartes, et ecrit les vignettes WebP |

Les identifiants sont lus dans un fichier d&rsquo;environnement **hors depot**
et ne sont jamais affiches, meme en cas d&rsquo;erreur.

## Choix structurants

- **Aucun CDN.** Polices et pictogrammes sont servis par le site. Une page
  s&rsquo;affiche a l&rsquo;identique sans acces internet sortant, et aucune
  requete ne part vers un tiers au chargement.
- **La validation fait foi cote serveur.** Le formulaire et l&rsquo;API
  partagent le meme schema Zod ; le controle cote navigateur n&rsquo;est
  qu&rsquo;un confort.
- **Les invariants vivent en base.** RLS est active sur `orders` et aucune
  policy n&rsquo;autorise le role anonyme : meme si la cle publiable fuite, la
  table reste illisible depuis un navigateur.
- **Aucune adresse IP en clair.** Seule une empreinte SHA-256 salee est stockee,
  suffisante pour limiter le debit, insuffisante pour identifier quelqu&rsquo;un.
- **Consentement jamais pre-coche**, et aucun traceur, donc aucun bandeau
  cookies a afficher.

## Licence

MIT, voir [LICENSE](LICENSE).

## Verification

Le depot ne se relit pas a la main. Un workflow GitHub Actions rejoue a chaque
poussee et a chaque pull request : types, lint, tests, encodage, accents, build,
plus une garde typographique qui refuse tiret cadratin, demi-cadratin et
mediopoint dans le contenu publie.

```bash
npm run typecheck && npm run lint && npm test
npm run check:encoding && npm run check:french
npm run build
```

Les etapes sont independantes : un run signale **tout** ce qui casse, pas
seulement la premiere erreur rencontree.

Ce que la CI ne voit pas, et qu&rsquo;il faut donc regarder soi-meme : le rendu.
Aucune de ces etapes ne dit si une scene 3D deborde du cadre ou si une barre de
navigation devient illisible. Les deux sont arrives, et c&rsquo;est la capture
d&rsquo;ecran qui les a trouves, pas le build.
