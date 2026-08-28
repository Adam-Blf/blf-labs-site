"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { db } from "@/lib/admin/db";
import { SITE } from "@/lib/site";

/**
 * Mutations de la messagerie.
 *
 * Toutes passent par le client lie a la session, donc par RLS et
 * `is_blf_admin()`, qui exige la deuxieme facteur. Aucune n'utilise la cle de
 * service - sauf l'appel a `retire_a_la_demande`, qui est en SECURITY DEFINER
 * pour une raison precise : ecrire dans `suppression_list` doit rester possible
 * meme si la politique de cette table change, parce que RESPECTER UNE
 * OPPOSITION ne doit jamais dependre d'un reglage.
 */

const EXPEDITEUR =
  process.env.RESEND_FROM_PROSPECTION ?? `Adam Beloucif <${SITE.email}>`;

/** Marque un fil comme lu. Sans effet de bord ailleurs. */
export async function marqueLu(filId: string) {
  const supabase = await db();
  const { error } = await supabase
    .from("fils")
    .update({ non_lu: false })
    .eq("id", filId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prospection");
}

/** Sort un fil de la liste courante. Le fil et ses messages restent en base. */
export async function archiveFil(filId: string) {
  const supabase = await db();
  const { error } = await supabase
    .from("fils")
    .update({ archive: true })
    .eq("id", filId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prospection");
}

/**
 * Repond dans un fil.
 *
 * L'ENVOI PRECEDE L'ECRITURE, contrairement au moteur de sequences qui journalise
 * d'abord. Les deux choix sont justes, pour des raisons opposees :
 *
 *   le moteur ecrit d'abord parce qu'il tourne SANS PERSONNE, et qu'un doublon
 *   y serait invisible ;
 *   ici, quelqu'un regarde l'ecran. Si l'envoi echoue, il doit le voir tout de
 *   suite et reessayer, plutot que de lire dans le fil un message qui n'est
 *   jamais parti - ce qui est le pire des deux, parce qu'on croit avoir repondu.
 */
export async function repond(filId: string, texte: string) {
  const corps = texte.trim();
  if (!corps) throw new Error("Un message vide ne s'envoie pas.");

  const supabase = await db();

  const { data: fil, error: erreurFil } = await supabase
    .from("fils")
    .select("id, email, sujet")
    .eq("id", filId)
    .maybeSingle();
  if (erreurFil) throw new Error(erreurFil.message);
  if (!fil) throw new Error("Ce fil n'existe plus.");

  /*
   * ON NE REPOND PAS A QUELQU'UN QUI S'EST RETIRE. La liste de suppression vaut
   * pour tout message commercial, y compris une reponse ecrite a la main : le
   * droit d'opposition ne se decoupe pas par intention de l'expediteur.
   */
  const { data: retire } = await supabase
    .from("suppression_list")
    .select("email")
    .eq("email", fil.email)
    .maybeSingle();
  if (retire) {
    throw new Error(
      "Cette adresse s'est retirée. Aucun message ne peut lui être envoyé, " +
        "y compris une réponse écrite à la main.",
    );
  }

  const cle = process.env.RESEND_API_KEY;
  if (!cle) throw new Error("Clé d'envoi absente.");

  const sujet = fil.sujet.startsWith("Re:") ? fil.sujet : `Re: ${fil.sujet}`;
  const retour = await new Resend(cle).emails.send({
    from: EXPEDITEUR,
    to: fil.email,
    replyTo: SITE.email,
    subject: sujet,
    // Texte brut seulement. Une reponse ecrite a la main dans un back-office
    // n'a aucune raison de porter du HTML, et le texte brut passe mieux les
    // filtres qu'un HTML minimal fabrique a la volee.
    text: corps,
  });
  if (retour.error) throw new Error(retour.error.message);

  const { error } = await supabase.from("messages").insert({
    fil_id: fil.id,
    direction: "sortant",
    expediteur: EXPEDITEUR,
    destinataire: fil.email,
    sujet,
    texte: corps,
    resend_id: retour.data?.id ?? null,
  });
  if (error) throw new Error(error.message);

  await supabase
    .from("fils")
    .update({ dernier_message_at: new Date().toISOString(), non_lu: false })
    .eq("id", fil.id);

  revalidatePath("/admin/prospection");
}

/**
 * Retire l'adresse d'un fil, a sa demande.
 *
 * LE GESTE QUI MANQUAIT. Une reponse « retirez-moi de votre liste » n'avait
 * aucun chemin vers la base : `desinscrire()` exige un jeton signe, donc le
 * clic de la personne elle-meme. Quelqu'un qui le demande PAR ECRIT devait
 * etre retire a la main, en SQL, ce qui veut dire en pratique : pas retire.
 */
export async function retireLAdresse(filId: string, email: string) {
  const supabase = await db();
  const { error } = await supabase.rpc("retire_a_la_demande", {
    p_email: email,
    p_motif: "demande de retrait, lue dans un message",
  });
  if (error) throw new Error(error.message);

  await supabase.from("fils").update({ archive: true }).eq("id", filId);
  revalidatePath("/admin/prospection");
}
