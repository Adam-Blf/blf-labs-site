import { SITE, FULL_ADDRESS } from "@/lib/site";

/**
 * Droit de retractation du consommateur. SOURCE UNIQUE, partagee par les CGV, le
 * PDF et la vue HTML d'un devis : ces trois surfaces doivent porter exactement le
 * meme texte, sinon la mention diverge et l'obligation n'est plus tenue.
 *
 * Enjeu concret, deja vecu sur un projet : l'article L. 221-5 7° impose de
 * FOURNIR l'information et le formulaire type AVANT que le consommateur soit lie.
 * Comme le contrat se noue a la signature du devis, c'est le devis qui doit les
 * porter. Leur absence porte le delai de retractation de quatorze jours a douze
 * mois (L. 221-20), sur un projet potentiellement deja livre et paye.
 */

/** Information sur le droit de retractation (art. L. 221-18). */
export const RETRACTATION_INFO =
  "Le consommateur dispose d'un délai de quatorze jours pour se rétracter d'un contrat conclu à distance (art. L. 221-18 du Code de la consommation). S'il demande expressément que la prestation commence avant la fin de ce délai, il reste redevable du travail déjà réalisé en cas de rétractation. Ce droit ne s'applique pas aux contrats conclus entre professionnels.";

/**
 * Formulaire type de retractation (annexe a l'article R. 221-1). Sa redaction est
 * IMPOSEE par le Code de la consommation et ne doit pas etre reformulee.
 */
export function retractationForm(): string {
  return (
    `À l'attention de ${SITE.legalMention}, ${FULL_ADDRESS}, ${SITE.email} : ` +
    "je vous notifie par la présente ma rétractation du contrat portant sur la " +
    "prestation de services ci-dessous : … . Commandé le … . Nom du " +
    "consommateur : … . Adresse du consommateur : … . Signature du " +
    "consommateur, uniquement en cas de notification du présent formulaire sur " +
    "papier : … . Date : … ."
  );
}
