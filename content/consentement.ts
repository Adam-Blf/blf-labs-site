/**
 * LES TEXTES DE CONSENTEMENT, AU MOT PRES.
 *
 * POURQUOI CE FICHIER EXISTE.
 *
 * La preuve de consentement recopie, dans `contact_consents.texte_affiche`, le
 * texte qui a ete montre a la personne. C'est la piece qu'un controle demande
 * en premier, et sa seule valeur tient a ce qu'elle corresponde a ce qui a
 * reellement ete affiche.
 *
 * La premiere version stockait UNE constante unique pour les deux formulaires,
 * alors que le pied de page et le tunnel de commande affichent des libelles
 * differents. La preuve etait donc systematiquement fausse pour l'un des deux,
 * ce qui est pire qu'une absence de preuve : elle affirme quelque chose de
 * verifiablement inexact.
 *
 * REGLE : un ecran qui recueille un consentement lit sa phrase ICI, et la route
 * qui l'enregistre lit la MEME constante. Aucun libelle de consentement ne
 * s'ecrit ailleurs. Si le texte doit changer, il change a un seul endroit, et
 * les preuves deja enregistrees continuent de porter celui qui a ete lu, ce qui
 * est exactement le comportement voulu.
 */

/** Identifie le formulaire d'origine. Vit aussi dans `contacts.source`. */
export type SourceConsentement = "formulaire_commande" | "pied_de_page";

export const TEXTES_CONSENTEMENT: Record<SourceConsentement, string> = {
  formulaire_commande:
    "Facultatif : j'accepte de recevoir par email des informations et " +
    "propositions commerciales de BLF Lab's. Ce consentement est distinct de " +
    "ma demande ci-dessus, et je peux le retirer à tout moment par le lien " +
    "présent dans chaque email.",
  pied_de_page:
    "J'accepte de recevoir ces messages et je peux me désinscrire en un clic " +
    "depuis chacun d'eux.",
};

/**
 * Version de la politique de confidentialite en vigueur, recopiee dans chaque
 * preuve. Elle DOIT changer a chaque modification du texte de la politique,
 * sinon une preuve renvoie a un document qui n'est plus celui qui a ete montre.
 *
 * Cette meme valeur est affichee en bas de la politique, pour qu'une preuve
 * puisse etre rattachee au texte correspondant.
 */
export const VERSION_POLITIQUE = "2026-08-25";
