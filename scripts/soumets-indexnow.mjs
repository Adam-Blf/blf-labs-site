/**
 * Annonce toutes les pages du site aux moteurs qui participent a IndexNow.
 *
 * POURQUOI IL LIT LE PLAN DU SITE ET NE TIENT AUCUNE LISTE. Une seconde liste
 * d'URL divergerait de la premiere des la page suivante, et personne ne s'en
 * apercevrait : le plan resterait juste, l'annonce oublierait les nouveautes.
 * La source est donc unique - `sitemap.xml`, deja construit a partir de
 * `content/`.
 *
 * IL VERIFIE LE FICHIER DE CLE AVANT D'ANNONCER. C'est la seule erreur
 * vraiment frequente du protocole : sans ce fichier servi a la racine, le
 * moteur repond 403 et l'annonce est perdue. Mieux vaut le dire tout de suite,
 * en nommant l'adresse attendue, que de lire un code d'erreur nu.
 *
 * CE QU'IL NE FAIT PAS : il ne parle pas a Google, qui n'utilise pas IndexNow.
 * Pour lui, le plan du site et la Search Console restent le chemin.
 *
 * Usage :
 *   node scripts/soumets-indexnow.mjs [base-url]
 *
 * Sortie 0 si l'annonce est acceptee, 1 sinon. A lancer APRES un deploiement.
 */
import { soumettreUrls, CLE_INDEXNOW } from "../lib/indexnow.ts";

const BASE = (process.argv[2] ?? "https://beloucif.com").replace(/\/$/, "");
const HOTE = new URL(BASE).host;

const lireLocs = (xml) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

console.log(`Lecture du plan : ${BASE}/sitemap.xml`);
const plan = await fetch(`${BASE}/sitemap.xml`);
if (!plan.ok) {
  console.error(`Plan du site illisible : HTTP ${plan.status}`);
  process.exit(1);
}
const urls = lireLocs(await plan.text());
console.log(`${urls.length} URL relevees. Verification de la cle…`);

const fichierCle = `${BASE}/${CLE_INDEXNOW}.txt`;
const cle = await fetch(fichierCle);
if (!cle.ok) {
  console.error(
    `Fichier de cle absent : ${fichierCle} repond ${cle.status}.\n` +
      "Sans lui, les moteurs refusent l'annonce (403). Deployer d'abord.",
  );
  process.exit(1);
}
const contenu = (await cle.text()).trim();
if (contenu !== CLE_INDEXNOW) {
  console.error(
    `Le fichier de cle ne contient pas la cle attendue.\n` +
      `  attendu : ${CLE_INDEXNOW}\n  trouve  : ${contenu.slice(0, 40)}`,
  );
  process.exit(1);
}

const resultat = await soumettreUrls(HOTE, urls);
console.log(
  `${resultat.ok ? "OK" : "ECHEC"} : ${resultat.soumises} URL annoncees ` +
    `(HTTP ${resultat.statut} - ${resultat.message}).`,
);
if (resultat.ok) {
  console.log("Bing, Yandex, Seznam et Naver sont servis par ce seul appel.");
  console.log("Google ignore IndexNow : pour lui, plan du site et Search Console.");
}
process.exit(resultat.ok ? 0 : 1);
