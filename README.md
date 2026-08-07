# BLF Lab's - site officiel

Version 0.2.0

<!-- adam-badges:start -->
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
- [Scripts](#scripts)
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
    API -->|"3. enregistre"| DB[("Supabase<br/>table orders, RLS active")]
    API -->|"4. notifie"| R["Resend"]

    R -->|"notification"| A["adam@beloucif.com"]
    R -->|"accuse de reception"| C["Client"]

    ADM["/admin<br/>authentifie"] -->|"lecture filtree par RLS"| DB
```

Le point important : l&rsquo;etape 5 ne peut pas faire echouer l&rsquo;etape 3.
Si Resend est indisponible ou mal configure, la demande reste enregistree et le
drapeau `mail_sent` garde la trace de la relance a faire. Perdre une demande
client parce qu&rsquo;une variable d&rsquo;environnement manque serait la pire
des pannes silencieuses.

## Direction artistique

Huit directions completes ont ete maquettees sur la vraie page d&rsquo;accueil,
puis departagees sur captures. La retenue est **"Bento tech"** : structure Bento
(grands rayons, cartes souples, boutons pilule, casse normale) et palette Tech
(fonds profonds, accent violet, appui turquoise).

Elle vit dans `app/themes.css` sous forme de jetons : couleurs, rayon, epaisseur
de trait, ombre, police de titre, casse et rythme vertical. **Aucun composant ne
code un style en dur** : ils lisent les classes `blk`, `title`, `section`,
`rule-b`. Changer de direction ne demande donc de toucher aucun composant.

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
| `RESEND_FROM` | Adresse d&rsquo;expedition | Valeur par defaut `contact@beloucif.com` |
| `SUPABASE_URL` | Base de donnees | Aucune ecriture, seul l&rsquo;email part |
| `SUPABASE_SERVICE_ROLE_KEY` | Ecriture serveur | Idem. **Jamais cote client** |
| `NEXT_PUBLIC_SUPABASE_URL` | Authentification admin | `/admin` inaccessible |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Authentification admin | `/admin` inaccessible |
| `ADMIN_EMAILS` | Liste blanche du back-office | Personne n&rsquo;entre |
| `IP_HASH_SALT` | Sel de l&rsquo;empreinte d&rsquo;IP | Sel par defaut, a definir en production |

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

## Scripts

Tout asset genere a son script reproductible, aucun n&rsquo;embarque de secret :

| Script | Role |
|---|---|
| `scripts/fetch_fonts.py` | Rapatrie les polices en local (aucun CDN) |
| `scripts/fetch_icons.py` | Recupere les pictogrammes Icons8 et les convertit en composants React |
| `scripts/ovh_dns.py` | Consulte et modifie la zone DNS de beloucif.com |
| `scripts/setup_email_dns.py` | Lit les enregistrements exiges par Resend et les pose chez OVH, de facon idempotente |

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
