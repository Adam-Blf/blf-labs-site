import { SITE, FULL_ADDRESS } from "@/lib/site";
import { creeJeton } from "@/lib/prospection/jeton";

/**
 * La coquille des emails de prospection, et les en-tetes qui vont avec.
 *
 * POURQUOI UNE COQUILLE DISTINCTE DE lib/mail.ts.
 *
 * Un accuse de reception et un message de prospection n'ont pas les memes
 * obligations. Le second doit porter, dans CHAQUE envoi, l'identite complete de
 * l'annonceur et un moyen de retrait immediat. Les melanger reviendrait a poser
 * un lien de desinscription sur une facture, ou a oublier ce lien sur une
 * campagne. La coquille l'ajoute ici, une fois, pour tout le monde : aucun
 * message n'a a y penser, donc aucun message ne peut l'oublier.
 *
 * LES EN-TETES DE DESINSCRIPTION.
 *
 * `List-Unsubscribe` avec une adresse HTTPS et une adresse mail, plus
 * `List-Unsubscribe-Post`, forment la desinscription en un clic decrite par la
 * RFC 8058. Elle affiche le bouton natif de Gmail et d'Outlook, celui que les
 * gens utilisent au lieu du bouton "indesirable". C'est la difference entre une
 * desinscription, qui ne coute rien, et une plainte, qui abime la reputation du
 * domaine pour tous les envois suivants, factures comprises.
 */

const COULEUR_TEXTE = "#0d1117";
const COULEUR_DISCRETE = "#5b6472";

function esc(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type EmailPret = {
  sujet: string;
  html: string;
  texte: string;
  entetes: Record<string, string>;
};

/**
 * Version texte brut, deduite du HTML.
 *
 * Ce n'est pas du confort : un message qui n'a qu'une partie HTML est note plus
 * severement par les filtres, et certains clients n'affichent que le texte. La
 * conversion reste volontairement grossiere, le corps des messages n'utilisant
 * que des paragraphes et des liens.
 */
function versTexte(html: string): string {
  return html
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function piedDePage(urlDesinscription: string): string {
  return `<div style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.6;color:${COULEUR_DISCRETE}">
    <p style="margin:0 0 6px">${esc(SITE.legalMention)}, ${esc(SITE.legalForm)}. SIRET ${esc(SITE.siret)}.</p>
    <p style="margin:0 0 6px">${esc(FULL_ADDRESS)} &bull; ${esc(SITE.email)}</p>
    <p style="margin:0"><a href="${esc(urlDesinscription)}" style="color:${COULEUR_DISCRETE}">Ne plus recevoir ces messages</a>, en un clic et sans justification.</p>
  </div>`;
}

/**
 * Assemble un message pret a partir, coquille et en-tetes compris.
 *
 * `base` est la racine publique du site. Elle est passee et non lue depuis
 * l'environnement pour que la fonction reste testable sans variable posee.
 */
export function prepare(params: {
  sujet: string;
  corps: string;
  email: string;
  base: string;
}): EmailPret {
  const { sujet, corps, email, base } = params;

  // Un seul jeton pour les deux usages : la page de retrait, que la personne
  // ouvre, et l'adresse en un clic, que sa messagerie appelle sans rien
  // afficher. Deux jetons distincts n'apporteraient rien et ouvriraient la
  // porte a ce que l'un des deux cesse de correspondre a l'autre.
  const jeton = creeJeton("desinscription", email);
  const urlDesinscription = `${base}/desinscription?jeton=${jeton}`;
  const urlUnClic = `${base}/api/desinscription?jeton=${jeton}`;

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f7f8fa;padding:24px;font-family:Segoe UI,system-ui,sans-serif;color:${COULEUR_TEXTE}">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e5ea;border-radius:16px;padding:28px">
    <p style="margin:0 0 18px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#5b5bd6">BLF Lab&rsquo;s</p>
    <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3">${esc(sujet)}</h1>
    ${corps}
  </div>
  ${piedDePage(urlDesinscription)}
</body></html>`;

  const texte = `${versTexte(corps)}

${SITE.legalMention}, ${SITE.legalForm}. SIRET ${SITE.siret}.
${FULL_ADDRESS} - ${SITE.email}

Ne plus recevoir ces messages : ${urlDesinscription}`;

  return {
    sujet,
    html,
    texte,
    entetes: {
      "List-Unsubscribe": `<${urlUnClic}>, <mailto:${SITE.email}?subject=Desinscription>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
