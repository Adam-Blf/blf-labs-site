/**
 * Garde d'architecture du back-office.
 *
 * POURQUOI CE CONTROLE EXISTE
 * ---------------------------
 * Ce back-office etait deja sain - une coquille unique, une largeur unique, un
 * en-tete partage sur les cinq ecrans. C'est exactement pour cela qu'il vaut la
 * peine d'etre garde : un ecart d'architecture ne s'installe jamais d'un coup,
 * il arrive par un ecran ajoute un soir, avec sa propre largeur et son propre
 * titre, et ce sont les projets deja propres qui se degradent sans qu'on le
 * remarque.
 *
 * Le meme controle existe sur ohypnozen, ou il avait releve cinquante ecarts.
 * Ici il devrait rester vert - et c'est le but.
 *
 * CE QU'IL VOIT
 * -------------
 * 1. UNE SEULE LARGEUR. Les pages ne declarent pas de conteneur : la coquille
 *    du groupe `(dashboard)` s'en charge.
 * 2. UN SEUL EN-TETE. Chaque ecran passe par `PageHeading` plutot que de poser
 *    son propre `<h1>`.
 * 3. AUCUNE ADRESSE PERDUE. Les adresses d'avant le regroupement en poles ont
 *    leur redirection.
 * 4. LA NAVIGATION A UNE SEULE SOURCE : `components/admin/navigation.ts`.
 *    Ecrite a deux endroits, elle finit par diverger, et c'est le menu qui a
 *    raison a l'ecran pendant que l'autre a raison dans le code.
 * 5. DES FICHIERS RELISIBLES : rien au-dela de 400 lignes.
 *
 * CE QU'IL NE VOIT PAS
 * --------------------
 * Ni la mise en page reelle, ni les contrastes, ni le comportement des onglets :
 * cela se regarde dans un navigateur.
 *
 *   node scripts/controle-admin.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = fileURLToPath(new URL("..", import.meta.url));
const PAGES = join(RACINE, "app", "admin");
const COMPOSANTS = join(RACINE, "components", "admin");

let echecs = 0;
const echec = (message) => {
  echecs += 1;
  console.error(`ECHEC - ${message}`);
};

function fichiers(dossier) {
  const trouves = [];
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiers(chemin));
    else if (/\.(ts|tsx)$/.test(entree)) trouves.push(chemin);
  }
  return trouves;
}

/**
 * Neutralise les commentaires, en preservant les positions.
 *
 * Sans cela, la garde se denonce elle-meme : le commentaire qui explique
 * pourquoi on n'ecrit pas de titre a la main contient ce mot-la. Un controle
 * qui crie sur sa propre documentation finit desactive.
 */
function sansCommentaires(source) {
  const bloc = new RegExp("/\\*[\\s\\S]*?\\*/", "g");
  const ligne = new RegExp("//[^\n]*", "g");
  return source
    .replace(bloc, (m) => m.replace(/[^\n]/g, " "))
    .replace(ligne, (m) => " ".repeat(m.length));
}

const relatif = (chemin) => relative(RACINE, chemin).replace(/\\/g, "/");

/**
 * Les ecrans d'AUTHENTIFICATION ne passent pas par la coquille : on y accede
 * avant d'etre pleinement authentifie, ils sont en pleine page, et ils posent
 * donc legitimement leur propre largeur et leur propre titre.
 */
const HORS_COQUILLE = /app\/admin\/(login|2fa|change-password)\//;

const ANCIENNES_ADRESSES = [
  "/admin/leads",
  "/admin/projets",
  "/admin/facturation",
  "/admin/comptabilite",
];

const SEUIL = 400;

for (const chemin of fichiers(PAGES)) {
  const nom = relatif(chemin);
  if (HORS_COQUILLE.test(nom)) continue;
  const source = sansCommentaires(readFileSync(chemin, "utf8"));

  const largeurs = source.match(/max-w-(?:\d?xl|screen-\w+)/g);
  if (largeurs && !nom.endsWith("(dashboard)/layout.tsx")) {
    echec(
      `${nom} declare sa propre largeur (${[...new Set(largeurs)].join(", ")}) - c'est a la coquille de la porter`,
    );
  }

  if (/<h1[\s>]/.test(source)) {
    echec(`${nom} pose son propre <h1> - PageHeading existe pour ca`);
  }
}

const config = readFileSync(join(RACINE, "next.config.ts"), "utf8");
for (const adresse of ANCIENNES_ADRESSES) {
  if (!config.includes(`"${adresse}"`) && !config.includes(`'${adresse}'`)) {
    echec(`${adresse} n'a pas de redirection dans next.config.ts`);
  }
}

/*
 * La navigation ne se recopie pas. On cherche une liste d'entrees ecrite
 * ailleurs que dans `navigation.ts` : c'est ce qui s'etait produit ici, ou
 * `AdminNav` portait sa propre table de cinq liens.
 */
for (const chemin of fichiers(COMPOSANTS)) {
  const nom = relatif(chemin);
  if (nom.endsWith("components/admin/navigation.ts")) continue;
  const source = readFileSync(chemin, "utf8");
  if (/const NAV\s*=\s*\[/.test(source)) {
    echec(`${nom} redeclare une liste de navigation - la source est navigation.ts`);
  }
}

for (const chemin of [...fichiers(PAGES), ...fichiers(COMPOSANTS)]) {
  const nom = relatif(chemin);
  const lignes = readFileSync(chemin, "utf8").split("\n").length;
  if (lignes > SEUIL) {
    echec(`${nom} fait ${lignes} lignes (seuil ${SEUIL})`);
  }
}

/*
 * TOUT `revalidatePath` VISE UNE ROUTE VIVANTE.
 *
 * Les poles ont ete regroupes, les anciennes adresses ont recu une
 * redirection, et QUINZE appels a `revalidatePath` ont continue de pointer
 * vers `/admin/facturation`, `/admin/projets` et `/admin/comptabilite`, qui
 * n'existent plus comme routes. Un `revalidatePath` vers une route morte ne
 * leve rien et ne previent rien : il ne rafraichit simplement rien. On deplace
 * une carte, on emet une facture, et l'ecran garde l'ancienne valeur.
 *
 * La redirection posee dans next.config.ts sert un NAVIGATEUR qui arrive sur
 * une ancienne adresse. Elle ne fait pas de ces adresses des routes a
 * invalider, et c'est precisement ce qui rendait le defaut invisible.
 *
 * CE QUE CETTE GARDE NE VOIT PAS : les chemins interpoles, du type
 * `/admin/facturation/${id}`. Elle ne lit que les litteraux.
 */
const ROUTES = new Set(
  fichiers(PAGES)
    .filter((c) => /[\\/]page\.tsx$/.test(c))
    .map((c) =>
      relatif(c)
        .replace(/^app\/admin/, "/admin")
        .replace(/\/\([^)]+\)/g, "")
        .replace(/\/page\.tsx$/, ""),
    )
    .map((r) => r || "/admin"),
);

for (const chemin of fichiers(PAGES)) {
  const nom = relatif(chemin);
  const source = sansCommentaires(readFileSync(chemin, "utf8"));
  for (const trouve of source.matchAll(/revalidatePath\(\s*"([^"$`]+)"/g)) {
    const cible = trouve[1];
    if (!ROUTES.has(cible)) {
      echec(
        `${nom} appelle revalidatePath("${cible}") - cette route n'existe pas, ` +
          "rien n'est rafraichi et rien ne le signale",
      );
    }
  }
}

/*
 * AUTANT DE SECTIONS RENDUES QUE D'ONGLETS DECLARES.
 *
 * Un onglet ajoute a `navigation.ts` sans vue correspondante ne se signale
 * jamais, et il echoue de DEUX facons selon la maniere dont la page choisit
 * sa section :
 *
 *   chaine de `&&`  -> ecran BLANC sous un onglet souligne. Un ecran vide se
 *                      lit comme « il n'y a rien », pas comme « il manque du
 *                      code ».
 *   ternaire        -> pire encore : la branche `else` s'affiche, donc le
 *                      MAUVAIS contenu sous le bon onglet, sans rien d'anormal
 *                      a l'ecran.
 *
 * D'ou le critere retenu : on ne cherche pas la cle de l'onglet dans le code -
 * un ternaire ne la nomme pas, et le controle rendait deux faux positifs sur
 * `projets` et `comptabilite`. On compte les composants `Section*` rendus.
 * C'est la seule mesure qui vaut pour les deux formes.
 */
const navigation = readFileSync(join(COMPOSANTS, "navigation.ts"), "utf8");
for (const pole of navigation.matchAll(
  /chemin:\s*"(\/admin[^"]*)"([\s\S]*?)(?=\n  \{|\n\];)/g,
)) {
  const [, chemin, corps] = pole;
  const onglets = [...corps.matchAll(/cle:\s*"([^"]+)"/g)].length;
  if (onglets === 0) continue;
  const page = join(PAGES, "(dashboard)", chemin.replace("/admin/", ""), "page.tsx");
  let source;
  try {
    source = sansCommentaires(readFileSync(page, "utf8"));
  } catch {
    echec(`${chemin} est declare dans navigation.ts mais n'a pas de page`);
    continue;
  }
  const sections = new Set(
    [...source.matchAll(/<(Section[A-Z]\w*)[\s/>]/g)].map((m) => m[1]),
  );
  if (sections.size !== onglets) {
    echec(
      `${chemin} declare ${onglets} onglet(s) et ne rend que ${sections.size} ` +
        `section(s) distincte(s) - un onglet sans vue affiche un ecran blanc, ` +
        "ou pire, le contenu d'un autre onglet",
    );
  }
}

if (echecs > 0) {
  console.error(`\n${echecs} ecart(s) d'architecture.`);
  process.exitCode = 1;
} else {
  console.log(
    "Back-office - une seule largeur, un seul en-tete, une seule source de navigation, aucune adresse perdue.",
  );
}
