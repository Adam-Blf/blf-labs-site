import { Resend } from "resend";
import { serviceClient } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { creeJeton, litJeton } from "@/lib/prospection/jeton";
import { corpsConfirmation, SUJET_CONFIRMATION } from "@/content/emails/confirmation";
import { SEQUENCE_CARNET, SEQUENCE_DEVIS, trouveSequence } from "@/content/emails/sequences";

/**
 * L'entree dans la liste, et rien d'autre.
 *
 * Le double opt-in n'est pas une obligation legale, c'est un choix. Il coute un
 * clic et il rapporte deux choses qui comptent autant l'une que l'autre : une
 * preuve de consentement qu'un controle ne peut pas contester, et un taux de
 * plainte plus bas, parce qu'une adresse saisie par erreur ou par un tiers ne
 * recoit jamais rien.
 *
 * La consequence a assumer : une inscription non confirmee ne vaut rien. C'est
 * exactement ce qu'on veut.
 */

/**
 * Version de la politique de confidentialite en vigueur, recopiee dans chaque
 * preuve de consentement. Elle doit changer a chaque modification du texte de
 * la politique, sinon la preuve renvoie a un document qui n'est plus celui qui
 * a ete montre.
 */
export const VERSION_POLITIQUE = "2026-08-25";

/**
 * Le texte EXACT affiche a cote de la case. Il est recopie dans la preuve de
 * consentement, pas reference : quand ce libelle changera, les consentements
 * deja donnes doivent continuer a porter celui qui a ete lu.
 */
export const TEXTE_CONSENTEMENT =
  "J'accepte de recevoir par email des informations et propositions commerciales de BLF Lab's. " +
  "Ce consentement est distinct de ma demande, je peux le retirer a tout moment par le lien " +
  "present dans chaque email.";

export type ResultatInscription =
  | "confirmation_envoyee"
  | "deja_inscrit"
  | "refuse"
  | "indisponible";

export type DemandeInscription = {
  email: string;
  nom?: string | null;
  organisation?: string | null;
  /** D'ou vient l'inscription. Recopie dans la fiche et dans la preuve. */
  source: string;
  pageOrigine: string;
  ipHash?: string | null;
  userAgent?: string | null;
};

const FROM = process.env.RESEND_FROM ?? `BLF Lab's <contact@send.beloucif.com>`;

/**
 * Enregistre une demande d'inscription et envoie le message de confirmation.
 *
 * Le resultat ne distingue jamais, cote appelant public, une adresse deja
 * inscrite d'une adresse desinscrite : repondre differemment transformerait le
 * formulaire en oracle permettant de tester si une adresse est dans la liste.
 * La distinction existe ici pour le journal, pas pour ce que rend la route.
 */
export async function inscrire(demande: DemandeInscription): Promise<ResultatInscription> {
  const db = serviceClient();
  if (!db) return "indisponible";

  const email = demande.email.trim().toLowerCase();

  // Une adresse retiree de la liste ne peut pas y rentrer par un formulaire.
  // La reinscription apres desabonnement est la faute la plus couteuse du
  // domaine, et le seul moyen sur de ne pas la commettre est de refuser ici,
  // avant meme d'ecrire quoi que ce soit.
  const { data: supprime } = await db
    .from("suppression_list")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (supprime) return "refuse";

  const { data: existant } = await db
    .from("contacts")
    .select("id, statut")
    .eq("email", email)
    .maybeSingle();

  if (existant?.statut === "confirme") return "deja_inscrit";

  let contactId = existant?.id as string | undefined;

  if (!contactId) {
    const { data: cree, error } = await db
      .from("contacts")
      .insert({
        email,
        nom: demande.nom ?? null,
        organisation: demande.organisation ?? null,
        regime: "optin",
        statut: "en_attente",
        source: demande.source,
      })
      .select("id")
      .single();
    if (error || !cree) return "indisponible";
    contactId = cree.id as string;
  }

  const jeton = creeJeton("confirmation", email);

  const { error: erreurPreuve } = await db.from("contact_consents").insert({
    contact_id: contactId,
    texte_affiche: TEXTE_CONSENTEMENT,
    version_politique: VERSION_POLITIQUE,
    page_origine: demande.pageOrigine,
    ip_hash: demande.ipHash ?? null,
    user_agent: demande.userAgent ?? null,
    jeton_confirmation: jeton,
  });
  if (erreurPreuve) return "indisponible";

  const envoye = await envoieConfirmation(email, jeton);
  return envoye ? "confirmation_envoyee" : "indisponible";
}

async function envoieConfirmation(email: string, jeton: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const lien = `${SITE.url}/api/inscription/confirmer?jeton=${jeton}`;

  try {
    const retour = await new Resend(apiKey).emails.send({
      from: FROM,
      to: email,
      replyTo: SITE.email,
      subject: SUJET_CONFIRMATION,
      html: `<!doctype html><html lang="fr"><body style="margin:0;background:#f7f8fa;padding:24px;font-family:Segoe UI,system-ui,sans-serif;color:#0d1117">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e5ea;border-radius:16px;padding:28px">
    <p style="margin:0 0 18px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#5b5bd6">BLF Lab&rsquo;s</p>
    <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3">${SUJET_CONFIRMATION}</h1>
    ${corpsConfirmation(lien)}
  </div>
  <p style="max-width:560px;margin:16px auto 0;font-size:12px;color:#5b6472">${SITE.legalMention}</p>
</body></html>`,
    });
    return !retour.error;
  } catch {
    return false;
  }
}

/**
 * Traite le clic de confirmation : la fiche passe en confirme, la preuve est
 * horodatee, et le carnet demarre.
 *
 * Rejouer le meme lien deux fois ne double rien : le trigger d'immuabilite
 * refuse une seconde confirmation, et l'inscription a la sequence est unique
 * par contact.
 */
export async function confirme(jeton: string | null): Promise<boolean> {
  const email = litJeton("confirmation", jeton);
  if (!email) return false;

  const db = serviceClient();
  if (!db) return false;

  const { data: supprime } = await db
    .from("suppression_list")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (supprime) return false;

  const { data: contact } = await db
    .from("contacts")
    .select("id, statut")
    .eq("email", email)
    .maybeSingle();
  if (!contact) return false;

  const { data: preuve } = await db
    .from("contact_consents")
    .select("id, confirme_at")
    .eq("jeton_confirmation", jeton)
    .maybeSingle();
  if (!preuve) return false;

  if (!preuve.confirme_at) {
    await db
      .from("contact_consents")
      .update({ confirme_at: new Date().toISOString() })
      .eq("id", preuve.id);
  }

  await db.from("contacts").update({ statut: "confirme" }).eq("id", contact.id);

  await inscritASequence(db, contact.id as string, SEQUENCE_CARNET);

  return true;
}

/**
 * Le raccordement du formulaire de commande.
 *
 * DEUX GESTES QUI N'ONT RIEN A VOIR, faits au meme endroit parce qu'ils
 * partent du meme formulaire.
 *
 * 1. LE SUIVI DE LA DEMANDE, toujours. Article 6.1.b du RGPD, mesures
 *    precontractuelles prises a la demande de la personne. Repondre a
 *    quelqu'un qui a demande un devis n'est pas de la prospection et n'exige
 *    aucune case cochee. C'est aussi, de loin, la sequence qui rapporte le
 *    plus tot.
 *
 * 2. LE CARNET, seulement si la seconde case a ete cochee. Article 6.1.a.
 *
 * POURQUOI PAS DE DOUBLE OPT-IN SUR CE CHEMIN, contrairement au pied de page.
 * La preuve est deja bien plus solide ici qu'un email tape seul dans un champ :
 * un formulaire complet, une description de projet, une empreinte d'adresse IP,
 * un horodatage, le texte exact affiche, et un accuse de reception qui part
 * dans la foulee vers cette adresse. Si elle n'appartient pas a la personne, le
 * rebond arrive avant le premier message du carnet et la retire. Ajouter une
 * troisieme demande de clic apres tout cela ferait perdre des inscriptions
 * sans rien prouver de plus.
 *
 * Jamais bloquant : la commande est deja enregistree quand cette fonction est
 * appelee, et rien de ce qui se passe ici ne doit pouvoir la faire echouer.
 */
export async function raccordeCommande(params: {
  email: string;
  nom: string | null;
  organisation: string | null;
  prospection: boolean;
  ipHash: string | null;
  userAgent: string | null;
}): Promise<void> {
  const db = serviceClient();
  if (!db) return;

  const email = params.email.trim().toLowerCase();

  const { data: supprime } = await db
    .from("suppression_list")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  // Quelqu'un qui s'est oppose reste oppose, meme s'il redepose une demande.
  // Sa demande sera traitee a la main, comme il l'a implicitement demande.
  if (supprime) return;

  const { data: existant } = await db
    .from("contacts")
    .select("id, statut")
    .eq("email", email)
    .maybeSingle();

  let contactId = existant?.id as string | undefined;

  if (!contactId) {
    const { data: cree } = await db
      .from("contacts")
      .insert({
        email,
        nom: params.nom,
        organisation: params.organisation,
        regime: "optin",
        statut: params.prospection ? "confirme" : "en_attente",
        source: "formulaire_commande",
      })
      .select("id")
      .single();
    if (!cree) return;
    contactId = cree.id as string;
  } else if (params.prospection && existant?.statut !== "confirme") {
    await db.from("contacts").update({ statut: "confirme" }).eq("id", contactId);
  }

  if (params.prospection) {
    const maintenant = new Date().toISOString();
    await db.from("contact_consents").insert({
      contact_id: contactId,
      texte_affiche: TEXTE_CONSENTEMENT,
      version_politique: VERSION_POLITIQUE,
      page_origine: "/commander",
      ip_hash: params.ipHash,
      user_agent: params.userAgent,
      confirme_at: maintenant,
    });
    await inscritASequence(db, contactId, SEQUENCE_CARNET);
  }

  await inscritASequence(db, contactId, SEQUENCE_DEVIS);
}

/**
 * Pose une inscription a une sequence, en respectant le delai de sa premiere
 * etape. Sans cela, le premier message d'une sequence dont l'etape zero attend
 * quarante-huit heures partirait immediatement.
 */
async function inscritASequence(
  db: ReturnType<typeof serviceClient>,
  contactId: string,
  slug: string,
): Promise<void> {
  if (!db) return;
  const sequence = trouveSequence(slug);
  const delai = sequence?.messages[0]?.delaiHeures ?? 0;
  const echeance = new Date(Date.now() + delai * 3_600_000).toISOString();

  await db.from("enrollments").upsert(
    {
      contact_id: contactId,
      sequence_slug: slug,
      etape: 0,
      prochaine_echeance_at: echeance,
      statut: "actif",
    },
    { onConflict: "contact_id,sequence_slug", ignoreDuplicates: true },
  );
}
