/**
 * Etat du consentement a la mesure d'audience.
 *
 * Regle qui commande tout ce fichier : rien ne part vers un tiers tant que le
 * visiteur n'a pas accepte. Ce n'est pas seulement le mode "consentement refuse"
 * de Google, c'est l'absence totale de requete. La CNIL demande un consentement
 * prealable au depot ET a la lecture, et un script charge depuis un domaine
 * tiers est deja une requete, meme sans cookie.
 *
 * Trois etats et non deux : tant que le visiteur n'a pas repondu, on est en
 * "inconnu", ce qui n'est pas la meme chose qu'un refus. C'est cet etat qui
 * decide de l'affichage du bandeau.
 */
export type Consentement = "accepte" | "refuse" | "inconnu";

export const CLE_CONSENTEMENT = "blf-consent";

/** Emis quand le choix change, pour que le chargeur de mesure reagisse sans
 *  qu'on ait a remonter un etat global a travers tout l'arbre. */
export const EVENEMENT_CONSENTEMENT = "blf-consent-change";

export function lireConsentement(): Consentement {
  if (typeof window === "undefined") return "inconnu";

  try {
    const valeur = window.localStorage.getItem(CLE_CONSENTEMENT);
    return valeur === "accepte" || valeur === "refuse" ? valeur : "inconnu";
  } catch {
    // Navigation privee ou stockage refuse. On ne peut pas memoriser le choix,
    // donc on redemande : c'est le comportement le plus prudent des deux.
    return "inconnu";
  }
}

export function ecrireConsentement(valeur: Exclude<Consentement, "inconnu">) {
  try {
    window.localStorage.setItem(CLE_CONSENTEMENT, valeur);
  } catch {
    // Le choix vaut au moins pour la session en cours. Ce n'est pas une erreur
    // a remonter au visiteur.
  }

  window.dispatchEvent(
    new CustomEvent(EVENEMENT_CONSENTEMENT, { detail: valeur }),
  );
}

/**
 * Identifiant de mesure, ou chaine vide.
 *
 * Sans identifiant, il n'y a ni mesure ni bandeau : le site tourne entierement
 * sans cle d'environnement, et il ne demande pas un consentement dont il n'a
 * aucun usage. Demander l'accord pour un traitement inexistant serait a la fois
 * inutile et malhonnete.
 */
export function identifiantMesure(): string {
  return process.env.NEXT_PUBLIC_GA_ID ?? "";
}
