import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Ce qui arrive quand quelqu'un REPOND.
 *
 * CE QUE LE WEBHOOK PORTE, ET CE QU'IL NE PORTE PAS.
 *
 * L'evenement `email.received` porte l'expediteur, le sujet, le `message_id` et
 * les pieces jointes. Il ne porte NI le texte, NI le HTML, NI les en-tetes :
 * `ReceivedEmailEventData` dans `node_modules/resend/dist/index.d.mts` le dit
 * champ par champ. Le corps s'obtient par un SECOND appel,
 * `emails.receiving.get(email_id)`.
 *
 * Ce point vaut d'etre ecrit ici parce qu'un module qui lirait `data.text`
 * compilerait sans erreur, rendrait 200 au webhook, afficherait un fil a
 * l'ecran, et n'aurait jamais de corps. La seule fonction qui porte un risque
 * juridique - reconnaitre une demande de retrait - serait morte a la
 * naissance, en silence, avec tout le reste au vert.
 */

/** Adresse seule, extraite d'un `Nom <adresse>` ou rendue telle quelle. */
export function adresseSeule(brut: string): string {
  const entre = brut.match(/<([^>]+)>/);
  return (entre ? entre[1] : brut).trim().toLowerCase();
}

/**
 * Notre propre pied de page, coupe du corps avant analyse.
 *
 * POURQUOI CETTE CHAINE-LA. Un client de messagerie cite le message d'origine
 * dans la reponse, chacun a sa facon : `>` en texte, un `<blockquote>` en HTML,
 * une ligne « Le 27 aout 2026, Adam a ecrit », et rien du tout sur certains
 * telephones. Aucune de ces marques n'est fiable.
 *
 * Notre pied de page, lui, est ecrit par nous, il est identique dans tous les
 * messages, et il n'apparait dans une reponse QUE parce que le message
 * d'origine y est cite. C'est le seul repere deterministe dont on dispose.
 *
 * Sans cette coupe, la phrase « Ne plus recevoir ces messages » de NOTRE pied
 * de page serait lue comme une demande de retrait dans chaque reponse citee,
 * et on retirerait des gens qui viennent de dire oui.
 */
const PIED_DE_PAGE = "Ne plus recevoir ces messages";

export function corpsUtile(texte: string): string {
  const coupe = texte.indexOf(PIED_DE_PAGE);
  const avant = coupe >= 0 ? texte.slice(0, coupe) : texte;
  // Les lignes citees, quand elles sont marquees. Ce n'est pas fiable, c'est
  // seulement un nettoyage de plus apres la coupe qui, elle, l'est.
  return avant
    .split("\n")
    .filter((l) => !l.trimStart().startsWith(">"))
    .join("\n")
    .trim();
}

/**
 * Une demande de retrait, reconnue seulement quand elle est SANS AMBIGUITE.
 *
 * POURQUOI ON PEUT SE PERMETTRE D'ETRE PRUDENT ICI, alors que rater une
 * opposition coute cher. Parce que toute reponse, quelle qu'elle soit, ARRETE
 * deja l'inscription a la sequence : c'est `range_message_entrant` qui le fait,
 * et il le fait sans lire le contenu. Une demande de retrait non reconnue ne
 * produit donc AUCUN message de plus. Elle laisse seulement la fiche en base,
 * et Adam la retire en deux clics depuis le fil.
 *
 * L'inverse serait pire : reconnaitre a tort transforme « je ne veux plus de
 * ce devis » en suppression definitive d'un prospect qui repondait.
 *
 * Le sujet est analyse AUSSI, et c'est indispensable : le bouton natif de
 * desinscription d'un client de messagerie envoie un message au sujet impose et
 * au CORPS VIDE.
 */
const REFUS = [
  "désinscri",
  "désabonn",
  // « plus recevoir » et non « ne plus recevoir » : la formulation courante est
  // « je ne SOUHAITE plus recevoir », et le motif complet la ratait. Une regle
  // ecrite d'apres la phrase qu'on imagine plutot que d'apres celle qu'on
  // recoit ne reconnait rien.
  "plus recevoir",
  "ne plus me contacter",
  "ne plus m'écrire",
  "ne me contactez plus",
  "retirez-moi",
  "retirez moi",
  "supprimez mon adresse",
  "stop",
  "unsubscribe",
  "remove me",
];

export function demandeUnRetrait(sujet: string, corps: string): boolean {
  const sansAccent = (t: string) =>
    t
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  const dansLeSujet = sansAccent(sujet);
  const dansLeCorps = sansAccent(corps);
  /*
   * LES MOTIFS SONT ECRITS EN VRAI FRANCAIS, ACCENTS COMPRIS, et l'accent est
   * retire des DEUX cotes au moment de comparer.
   *
   * La premiere version les ecrivait sans accents, puisqu'ils sont compares a
   * du texte deja normalise. La garde `check:french` a voulu accentuer
   * « ne plus m'ecrire », ce qui aurait casse la reconnaissance EN SILENCE :
   * un motif accente ne rencontre jamais un texte desaccentue. C'est la lecon
   * du script d'accentuation qui avait casse des identifiants et un selecteur
   * CSS - un correcteur de langue ne doit jamais decider dans du code.
   *
   * Ecrire les motifs correctement et normaliser au moment de comparer supprime
   * le conflit au lieu de l'excepter.
   */
  // « stop » seul est un mot trop court pour etre cherche dans un corps entier :
  // il apparait dans « stopper le projet ». Dans un SUJET, il est explicite.
  return REFUS.map(sansAccent).some(
    (mot) =>
      dansLeSujet.includes(mot) || (mot !== "stop" && dansLeCorps.includes(mot)),
  );
}

type Recu = {
  email_id?: string;
  from?: string;
  subject?: string;
  message_id?: string;
};

/**
 * Traite un message entrant : va chercher son corps, le range, et retire la
 * personne si elle le demande sans ambiguite.
 *
 * Rend `true` si le message a ete traite. Un echec rend `false` et le webhook
 * repond alors autre chose que 200, ce qui fait REESSAYER Resend : perdre un
 * message entrant est pire que de le traiter deux fois, et le rejeu est
 * neutralise en base par l'unicite de `resend_id`.
 */
export async function traiteMessageEntrant(
  db: SupabaseClient,
  resend: Resend,
  recu: Recu,
): Promise<boolean> {
  if (!recu.email_id || !recu.from) return false;

  const detail = await resend.emails.receiving.get(recu.email_id);
  if (detail.error || !detail.data) return false;

  const expediteur = adresseSeule(recu.from);
  const sujet = detail.data.subject ?? recu.subject ?? "";
  const texte = corpsUtile(detail.data.text ?? "");

  const { error } = await db.rpc("range_message_entrant", {
    p_email: expediteur,
    p_sujet: sujet,
    p_texte: texte,
    p_html: detail.data.html ?? null,
    p_resend_id: recu.email_id,
    p_message_id: detail.data.message_id ?? recu.message_id ?? null,
  });
  if (error) return false;

  if (demandeUnRetrait(sujet, texte)) {
    await db.rpc("retire_a_la_demande", {
      p_email: expediteur,
      p_motif: "demande de retrait recue par message",
    });
  }

  return true;
}
