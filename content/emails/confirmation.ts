import { SITE } from "@/lib/site";

/**
 * Le message de confirmation du double opt-in.
 *
 * Il ne contient RIEN d'autre que le lien de confirmation. Pas d'offre, pas
 * d'etude de cas, pas de bouton de rendez-vous. C'est volontaire : tant que la
 * personne n'a pas cliqué, aucun consentement n'existe, donc aucun contenu
 * commercial n'a le droit de partir. Un message de confirmation qui vend est
 * deja un message de prospection non consentie.
 */
export function corpsConfirmation(lien: string): string {
  return (
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">Bonjour,</p>` +
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">Vous avez demandé à recevoir le carnet du studio ${SITE.brand}. Un dernier clic pour le confirmer, et vous n'entendrez plus parler de cette étape.</p>` +
    `<p style="margin:24px 0"><a href="${lien}" style="display:inline-block;background:#cb6ce6;color:#111016;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700">Confirmer mon inscription</a></p>` +
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5b6472">Ce lien est valable sept jours. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : sans confirmation, aucune adresse n'est ajoutée et vous ne recevrez rien.</p>` +
    `<p style="margin:0;font-size:13px;line-height:1.6;color:#5b6472">Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur : ${lien}</p>`
  );
}

export const SUJET_CONFIRMATION = "Confirmez votre inscription";
