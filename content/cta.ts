/**
 * Libelles des appels a l'action qui reviennent sur plusieurs pages.
 *
 * Regle d'Adam du 09/10/2026 : un bouton dit ce que le visiteur GAGNE, pas le
 * geste qu'il fait. Test : « Je veux [libelle] » doit etre une phrase naturelle,
 * et le clic doit la tenir tout de suite.
 *
 * Le delai de 48 heures ouvrees n'est pas une invention de bouton : il est
 * promis par la page /commander, /contact et /rendez-vous. Tout libelle qui le
 * porte renvoie vers l'une de ces pages ou vers le formulaire qui l'engage.
 */
export const CTA = {
  /** Destination : /commander. Le formulaire promet cette estimation. */
  estimation: "Recevoir mon estimation",
  estimationAvecDelai: "Recevoir mon estimation sous 48 h ouvrées",
  /** Version courte pour la barre mobile, ou la largeur manque. */
  estimationAvecDelaiCourt: "Mon estimation sous 48 h ouvrées",
  /** Destination : /tarifs, qui affiche les planchers de chaque palier. */
  prixDeDepart: "Connaître les prix de départ",
  /** Destination : /services, les quatre familles de projets. */
  typeDeProjet: "Trouver mon type de projet",
  /** Destination : /contact, qui promet une reponse ecrite sous 48 heures ouvrees, meme negative. */
  reponse: "Une réponse sous 48 h",
  /** Destination : /rendez-vous. */
  vingtMinutes: "Parler de mon projet en 20 minutes",
} as const;
