import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { serviceClient } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { prepare } from "@/lib/prospection/gabarit";
import { trouveSequence, type Sequence } from "@/content/emails/sequences";

/**
 * LE MOTEUR D'ENVOI.
 *
 * Appele a intervalle regulier par une route de cron. Il ne decide rien de
 * commercial : il execute des echeances deja posees, et refuse d'envoyer des
 * qu'un doute existe.
 *
 * TROIS INVARIANTS, dans cet ordre de priorite.
 *
 * 1. NE JAMAIS ENVOYER DEUX FOIS LA MEME ETAPE. La ligne de journal est ecrite
 *    AVANT l'appel a Resend, et l'unicite (enrollment_id, etape) la refuse au
 *    tour suivant. Ecrire apres l'envoi paraitrait plus logique et enverrait
 *    deux fois le message a la moindre coupure entre les deux.
 *
 * 2. NE JAMAIS ENVOYER A QUI N'A PAS LE DROIT DE RECEVOIR. La regle vit dans la
 *    fonction SQL peut_recevoir, une seule fois, pas ici. Le moteur l'appelle,
 *    il ne la reimplemente pas.
 *
 * 3. NE JAMAIS DEPASSER LE PLAFOND DU JOUR. Un domaine d'envoi neuf qui part a
 *    plusieurs centaines de messages le premier jour se fait classer en
 *    indesirable pour longtemps, et emporte avec lui les factures et les
 *    accuses de reception qui partent du meme domaine.
 */

/** Au dela, le verrou d'une ligne est considere comme abandonne. */
const VERROU_PERIME_MINUTES = 15;

/** Nombre d'inscriptions traitees par execution. */
const LOT = 20;

/**
 * Plafond d'envois par jour. Volontairement bas au demarrage, a monter par
 * paliers sur trois semaines une fois les rapports DMARC propres.
 */
const PLAFOND_JOUR = Number(process.env.PROSPECTION_PLAFOND_JOUR ?? 50);

/** Pause entre deux envois. Resend limite le rythme des appels. */
const PAUSE_MS = 600;

export type Rapport = {
  candidats: number;
  envoyes: number;
  ignores: number;
  echecs: number;
  /** Une ligne par decision, pour que le back-office puisse expliquer un silence. */
  journal: string[];
};

type Inscription = {
  id: string;
  contact_id: string;
  sequence_slug: string;
  etape: number;
};

type Contact = {
  id: string;
  email: string;
  nom: string | null;
  organisation: string | null;
};

function pause(ms: number): Promise<void> {
  return new Promise((resoud) => setTimeout(resoud, ms));
}

/** Envois deja partis aujourd'hui, echecs exclus. */
async function envoyesAujourdhui(db: SupabaseClient): Promise<number> {
  const debut = new Date();
  debut.setUTCHours(0, 0, 0, 0);
  const { count } = await db
    .from("email_sends")
    .select("id", { count: "exact", head: true })
    .gte("created_at", debut.toISOString())
    .neq("statut", "echec");
  return count ?? 0;
}

/**
 * Reserve un lot d'echeances dues.
 *
 * Le verrou est pose par un update conditionnel, pas par une lecture suivie
 * d'une ecriture : deux executions du cron qui se chevauchent lisent les memes
 * lignes, mais une seule gagne l'update de chaque ligne. C'est la base qui
 * arbitre, pas l'ordre d'arrivee.
 */
async function reserve(db: SupabaseClient, lot: number): Promise<Inscription[]> {
  const maintenant = new Date();
  const perime = new Date(maintenant.getTime() - VERROU_PERIME_MINUTES * 60_000).toISOString();

  const { data: candidats } = await db
    .from("enrollments")
    .select("id")
    .eq("statut", "actif")
    .lte("prochaine_echeance_at", maintenant.toISOString())
    .or(`verrou_at.is.null,verrou_at.lt.${perime}`)
    .order("prochaine_echeance_at", { ascending: true })
    .limit(lot);

  if (!candidats?.length) return [];

  const { data: reserves } = await db
    .from("enrollments")
    .update({ verrou_at: maintenant.toISOString() })
    .in(
      "id",
      candidats.map((c) => c.id as string),
    )
    .or(`verrou_at.is.null,verrou_at.lt.${perime}`)
    .select("id, contact_id, sequence_slug, etape");

  return (reserves ?? []) as Inscription[];
}

/** Arrete une inscription et libere son verrou. */
async function arrete(db: SupabaseClient, id: string, raison: string): Promise<void> {
  await db
    .from("enrollments")
    .update({ statut: "arrete", arret_raison: raison, verrou_at: null })
    .eq("id", id);
}

/** Marque une inscription terminee : toutes les messages ont ete envoyees. */
async function termine(db: SupabaseClient, id: string): Promise<void> {
  await db.from("enrollments").update({ statut: "termine", verrou_at: null }).eq("id", id);
}

/**
 * Le suivi d'une demande de devis s'arrete des que le dossier est tranche.
 * Relancer quelqu'un qui vient de signer le fait douter, et relancer un dossier
 * perdu est du harcelement.
 */
async function dossierTranche(db: SupabaseClient, email: string): Promise<boolean> {
  const { data } = await db
    .from("orders")
    .select("status")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.status === "gagnee" || data?.status === "perdue";
}

async function traiteUne(
  db: SupabaseClient,
  resend: Resend | null,
  inscription: Inscription,
  rapport: Rapport,
): Promise<void> {
  const sequence: Sequence | undefined = trouveSequence(inscription.sequence_slug);
  if (!sequence) {
    await arrete(db, inscription.id, "sequence inconnue");
    rapport.ignores += 1;
    rapport.journal.push(`sequence inconnue : ${inscription.sequence_slug}`);
    return;
  }

  const etape = sequence.messages[inscription.etape];
  if (!etape) {
    await termine(db, inscription.id);
    rapport.ignores += 1;
    return;
  }

  const { data: contact } = await db
    .from("contacts")
    .select("id, email, nom, organisation")
    .eq("id", inscription.contact_id)
    .maybeSingle<Contact>();

  if (!contact) {
    await arrete(db, inscription.id, "contact absent");
    rapport.ignores += 1;
    return;
  }

  const { data: autorise } = await db.rpc("peut_recevoir", {
    cible: contact.email,
    audience: sequence.audience,
  });

  if (autorise !== true) {
    await arrete(db, inscription.id, "envoi non autorise");
    rapport.ignores += 1;
    rapport.journal.push(`refus de la garde pour ${contact.email}`);
    return;
  }

  if (sequence.audience === "devis" && (await dossierTranche(db, contact.email))) {
    await arrete(db, inscription.id, "dossier tranche");
    rapport.ignores += 1;
    return;
  }

  // Le journal AVANT l'envoi. Un conflit d'unicite signifie que cette etape est
  // deja partie, probablement lors d'une execution interrompue : on avance sans
  // renvoyer.
  const { data: ligne, error: conflit } = await db
    .from("email_sends")
    .insert({
      contact_id: contact.id,
      enrollment_id: inscription.id,
      sequence_slug: sequence.slug,
      etape: inscription.etape,
      sujet: etape.sujet,
      statut: "file",
    })
    .select("id")
    .single();

  if (conflit || !ligne) {
    await avance(db, sequence, inscription);
    rapport.ignores += 1;
    rapport.journal.push(`etape deja journalisee pour ${contact.email}`);
    return;
  }

  const message = prepare({
    sujet: etape.sujet,
    corps: etape.corps({
      nom: contact.nom,
      organisation: contact.organisation,
      url: SITE.url,
    }),
    email: contact.email,
    base: SITE.url,
  });

  if (!resend) {
    await db
      .from("email_sends")
      .update({ statut: "echec", erreur: "cle Resend absente" })
      .eq("id", ligne.id);
    rapport.echecs += 1;
    return;
  }

  try {
    const retour = await resend.emails.send({
      from: process.env.RESEND_FROM_PROSPECTION ?? `BLF Lab's <carnet@send.beloucif.com>`,
      to: contact.email,
      replyTo: SITE.email,
      subject: message.sujet,
      html: message.html,
      text: message.texte,
      headers: message.entetes,
    });

    if (retour.error) {
      await db
        .from("email_sends")
        .update({ statut: "echec", erreur: retour.error.message })
        .eq("id", ligne.id);
      rapport.echecs += 1;
    } else {
      await db
        .from("email_sends")
        .update({
          statut: "envoye",
          resend_id: retour.data?.id ?? null,
          envoye_at: new Date().toISOString(),
        })
        .eq("id", ligne.id);
      rapport.envoyes += 1;
    }
  } catch {
    // Aucun detail technique n'est conserve tel quel : un message d'erreur de
    // transport peut contenir l'adresse et la cle utilisee.
    await db
      .from("email_sends")
      .update({ statut: "echec", erreur: "erreur de transport" })
      .eq("id", ligne.id);
    rapport.echecs += 1;
  }

  await avance(db, sequence, inscription);
}

/** Positionne l'echeance suivante, ou termine la sequence. */
async function avance(
  db: SupabaseClient,
  sequence: Sequence,
  inscription: Inscription,
): Promise<void> {
  const suivante = sequence.messages[inscription.etape + 1];
  if (!suivante) {
    await termine(db, inscription.id);
    return;
  }
  const echeance = new Date(Date.now() + suivante.delaiHeures * 3_600_000);
  await db
    .from("enrollments")
    .update({
      etape: inscription.etape + 1,
      prochaine_echeance_at: echeance.toISOString(),
      verrou_at: null,
    })
    .eq("id", inscription.id);
}

export async function traiteEcheances(): Promise<Rapport> {
  const rapport: Rapport = { candidats: 0, envoyes: 0, ignores: 0, echecs: 0, journal: [] };

  const db = serviceClient();
  if (!db) {
    rapport.journal.push("base indisponible");
    return rapport;
  }

  const deja = await envoyesAujourdhui(db);
  const reste = PLAFOND_JOUR - deja;
  if (reste <= 0) {
    rapport.journal.push(`plafond du jour atteint : ${deja} sur ${PLAFOND_JOUR}`);
    return rapport;
  }

  const inscriptions = await reserve(db, Math.min(LOT, reste));
  rapport.candidats = inscriptions.length;
  if (!inscriptions.length) return rapport;

  const apiKey = process.env.RESEND_API_KEY;
  const resend = apiKey ? new Resend(apiKey) : null;

  for (const inscription of inscriptions) {
    await traiteUne(db, resend, inscription, rapport);
    await pause(PAUSE_MS);
  }

  return rapport;
}
