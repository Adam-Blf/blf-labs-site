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

if (echecs > 0) {
  console.error(`\n${echecs} ecart(s) d'architecture.`);
  process.exitCode = 1;
} else {
  console.log(
    "Back-office - une seule largeur, un seul en-tete, une seule source de navigation, aucune adresse perdue.",
  );
}
