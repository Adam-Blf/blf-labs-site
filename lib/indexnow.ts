/**
 * Annonce des URL aux moteurs qui participent a IndexNow.
 *
 * CE QUE CE PROTOCOLE CHANGE. Sans lui, on publie et on attend qu'un robot
 * repasse - cela prend des jours, parfois des semaines. Avec lui, on previent :
 * un seul appel a `api.indexnow.org` est redistribue a Bing, Yandex, Seznam et
 * Naver. Google n'y participe pas ; pour lui, le plan du site et la Search
 * Console restent le seul chemin.
 *
 * LA CLE N'EST PAS UN SECRET, et c'est le principe meme du protocole : elle est
 * publiee en clair a la racine du site, dans un fichier que le moteur va lire
 * pour verifier qu'on controle bien le domaine. Une cle absente du fichier,
 * c'est un 403 - la seule erreur reellement frequente.
 *
 * ELLE VIT DANS LE CODE ET NON DANS L'ENVIRONNEMENT, parce que le fichier
 * `public/<cle>.txt` doit porter exactement la meme valeur : deux sources
 * separees finiraient par diverger, et l'annonce echouerait en silence. Une
 * variable d'environnement reste possible pour la remplacer.
 */
export const CLE_INDEXNOW =
  process.env.INDEXNOW_KEY ?? "74219de7b4a24562a891d302114c3773";

const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Plafond du protocole. Le site en compte quelques dizaines. */
const MAX_URLS = 10_000;

export type ResultatIndexNow = {
  ok: boolean;
  statut: number;
  soumises: number;
  message: string;
};

/**
 * Ce que disent les codes de reponse, en francais.
 *
 * Le protocole repond souvent 200 ou 202 sans corps : un script qui se
 * contente de « pas d'erreur » ne sait pas s'il a ete compris. On traduit donc
 * chaque code, et surtout le 403 - qui ne veut pas dire « refuse » mais
 * « votre fichier de cle est introuvable ou ne contient pas la cle ».
 */
function expliquer(statut: number): string {
  switch (statut) {
    case 200:
    case 202:
      return "URL acceptees";
    case 400:
      return "format invalide";
    case 403:
      return "cle introuvable a la racine du site, ou fichier ne contenant pas la cle";
    case 422:
      return "les URL n'appartiennent pas a l'hote annonce";
    case 429:
      return "trop de demandes - reessayer plus tard";
    default:
      return `reponse inattendue (${statut})`;
  }
}

export async function soumettreUrls(
  hote: string,
  urls: string[],
): Promise<ResultatIndexNow> {
  const liste = urls.slice(0, MAX_URLS);
  if (liste.length === 0) {
    return { ok: false, statut: 0, soumises: 0, message: "aucune URL a annoncer" };
  }

  const reponse = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: hote,
      key: CLE_INDEXNOW,
      keyLocation: `https://${hote}/${CLE_INDEXNOW}.txt`,
      urlList: liste,
    }),
  });

  return {
    ok: reponse.ok,
    statut: reponse.status,
    soumises: liste.length,
    message: expliquer(reponse.status),
  };
}
