import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { serviceClient } from "@/lib/supabase/clients";
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
 * Plafond d'envois par jour, quand la base n'en porte pas.
 *
 * IL VIT DESORMAIS EN BASE, dans `moteur_reglages`. Il etait lu ici depuis
 * l'environnement, donc fige jusqu'au prochain deploiement : le baisser en
 * urgence demandait un redeploiement, ce qui est exactement ce qu'on n'a pas
 * le temps de faire quand il faut le baisser.
 */
const PLAFOND_PAR_DEFAUT = Number(process.env.PROSPECTION_PLAFOND_JOUR ?? 50);

/**
 * SEUILS DU COUPE-CIRCUIT, et d'ou ils viennent.
 *
 * Ce sont ceux que Google et Microsoft appliquent pour classer un expediteur.
 * Au-dela, ce n'est plus une campagne qui se passe mal, c'est un domaine qui se
 * brule - et celui-ci envoie AUSSI les factures. Une reputation abimee met des
 * mois a revenir, quand elle revient.
 *
 * Mesures sur une fenetre glissante des derniers envois plutot que sur la
 * journee : une salve mauvaise doit arreter la machine en quelques minutes, pas
 * le lendemain matin.
 */
const FENETRE_SURVEILLANCE = 200;
const SEUIL_REBONDS = 0.03;
const SEUIL_PLAINTES = 0.001;
/** En dessous, un taux ne veut rien dire : deux rebonds sur cinq font 40 %. */
const MINIMUM_POUR_CONCLURE = 40;

/** Pause entre deux envois. Resend limite le rythme des appels. */
const PAUSE_MS = 600;

export type Rapport = {
  candidats: number;
  envoyes: number;
  ignores: number;
  echecs: number;
  /** Fiches retirees pour consentement caduc, trois ans sans interaction. */
  purges: number;
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
type Reglages = {
  actif: boolean;
  plafond_jour: number;
  motif_arret: string | null;
};

/**
 * L'interrupteur et le plafond, lus AVANT toute reservation.
 *
 * Une lecture qui echoue rend `null` et le battement s'arrete : ne pas savoir
 * si la machine doit tourner n'autorise pas a la faire tourner. C'est la meme
 * regle que partout ailleurs dans ce module - quand le code ne sait pas, il
 * n'envoie pas.
 */
async function litReglages(db: SupabaseClient): Promise<Reglages | null> {
  const { data, error } = await db
    .from("moteur_reglages")
    .select("actif, plafond_jour, motif_arret")
    .eq("id", true)
    .maybeSingle<Reglages>();
  if (error || !data) return null;
  return data;
}

/** Coupe le moteur et ecrit pourquoi, pour qu'un silence s'explique. */
async function coupe(
  db: SupabaseClient,
  motif: string,
  par: string,
): Promise<void> {
  await db
    .from("moteur_reglages")
    .update({
      actif: false,
      motif_arret: motif,
      arrete_le: new Date().toISOString(),
      arrete_par: par,
    })
    .eq("id", true);
}

/**
 * LE COUPE-CIRCUIT. La seule panne dont on ne se remet pas.
 *
 * Le webhook Resend traite chaque rebond et chaque plainte correctement, un par
 * un. Personne ne regardait le TAUX. A cent cinquante contacts c'est sans
 * effet ; a dix mille, un lot d'adresses mal qualifiees produit une salve de
 * rebonds qui brule le domaine - factures comprises - avant que quiconque
 * ouvre le back-office.
 *
 * Mesure sur les derniers envois, pas sur la journee : une salve doit arreter
 * la machine en quelques minutes.
 */
async function tauxHorsLimites(db: SupabaseClient): Promise<string | null> {
  const { data } = await db
    .from("email_sends")
    .select("statut")
    .order("created_at", { ascending: false })
    .limit(FENETRE_SURVEILLANCE);

  const lignes = data ?? [];
  if (lignes.length < MINIMUM_POUR_CONCLURE) return null;

  const rebonds = lignes.filter((l) => l.statut === "bounce").length;
  const plaintes = lignes.filter((l) => l.statut === "plainte").length;
  const tauxRebonds = rebonds / lignes.length;
  const tauxPlaintes = plaintes / lignes.length;

  if (tauxRebonds > SEUIL_REBONDS) {
    return `rebonds a ${(tauxRebonds * 100).toFixed(1)} % sur les ${lignes.length} derniers envois, seuil ${(SEUIL_REBONDS * 100).toFixed(0)} %`;
  }
  if (tauxPlaintes > SEUIL_PLAINTES) {
    return `plaintes a ${(tauxPlaintes * 100).toFixed(2)} % sur les ${lignes.length} derniers envois, seuil ${(SEUIL_PLAINTES * 100).toFixed(1)} %`;
  }
  return null;
}

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

/** Arrete une inscription et libere son verrou. DEFINITIF. */
async function arrete(db: SupabaseClient, id: string, raison: string): Promise<void> {
  await db
    .from("enrollments")
    .update({ statut: "arrete", arret_raison: raison, verrou_at: null })
    .eq("id", id);
}

/**
 * Rend la ligne au tour suivant, sans rien decider.
 *
 * C'est la difference entre « je ne sais pas » et « non ». Une panne
 * passagere, un rechargement du cache de schema apres une migration, une
 * coupure reseau : rien de tout cela ne doit se transformer en arret
 * definitif d'une sequence. On libere, on retentera dans quinze minutes.
 */
async function libere(db: SupabaseClient, id: string): Promise<void> {
  await db.from("enrollments").update({ verrou_at: null }).eq("id", id);
}

/** Marque une inscription terminee : tous les messages ont ete envoyes. */
async function termine(db: SupabaseClient, id: string): Promise<void> {
  await db.from("enrollments").update({ statut: "termine", verrou_at: null }).eq("id", id);
}

/**
 * Statut de la demande la plus recente de cette adresse, ou `null`.
 *
 * La comparaison ne se soucie pas de la casse depuis la migration `0016` :
 * `orders.email` est en `citext`. Avant elle, une adresse tapee
 * « Jean@Exemple.fr » ne correspondait a rien et le suivi continuait de
 * relancer un client qui venait de signer.
 */
async function statutCommande(db: SupabaseClient, email: string): Promise<string | null> {
  const { data } = await db
    .from("orders")
    .select("status")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.status as string | undefined) ?? null;
}

/**
 * Le suivi d'une demande s'arrete des que le dossier est tranche. Relancer
 * quelqu'un qui vient de signer le fait douter, et relancer un dossier perdu
 * est du harcelement.
 */
const STATUTS_TRANCHES = new Set(["gagnee", "perdue"]);

async function traiteUne(
  db: SupabaseClient,
  resend: Resend,
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

  const { data: autorise, error: erreurGarde } = await db.rpc("peut_recevoir", {
    cible: contact.email,
    audience: sequence.audience,
  });

  // UN APPEL QUI ECHOUE N'EST PAS UN REFUS. Sans cette distinction, une
  // coupure reseau ou un rechargement du cache de schema apres migration
  // rendait `data` nul, le test tombait dans la branche « non autorise », et
  // toutes les inscriptions du lot etaient arretees DEFINITIVEMENT. Le
  // back-office affichait alors un motif parfaitement credible.
  if (erreurGarde) {
    await libere(db, inscription.id);
    rapport.ignores += 1;
    rapport.journal.push("garde injoignable, reessai au prochain tour");
    return;
  }

  if (autorise !== true) {
    await arrete(db, inscription.id, "envoi non autorise");
    rapport.ignores += 1;
    rapport.journal.push(`refus de la garde pour ${contact.email}`);
    return;
  }

  // Le statut de la demande sert deux fois : pour arreter un dossier tranche,
  // et pour les etapes qui n'ont de sens que dans un etat precis.
  const besoinStatut =
    sequence.audience === "devis" || etape.siStatutCommande !== undefined;
  const statut = besoinStatut ? await statutCommande(db, contact.email) : null;

  if (sequence.audience === "devis" && statut !== null && STATUTS_TRANCHES.has(statut)) {
    await arrete(db, inscription.id, "dossier tranche");
    rapport.ignores += 1;
    return;
  }

  // Une etape peut exiger un etat precis. Le message de relance de devis dit
  // « le devis envoye la semaine derniere » : l'envoyer a quelqu'un dont la
  // demande n'a jamais donne lieu a un devis serait une affirmation fausse.
  // On saute l'etape sans l'envoyer, la suivante reste programmee.
  if (etape.siStatutCommande && (statut === null || !etape.siStatutCommande.includes(statut))) {
    rapport.ignores += 1;
    rapport.journal.push(`etape ${etape.slug} sans objet, statut ${statut ?? "inconnu"}`);
    await avance(db, sequence, inscription);
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
    // SEUL 23505, la violation d'unicite, veut dire « deja parti ». Traiter
    // toute erreur d'insertion comme un doublon faisait avancer l'etape sans
    // qu'aucun message ne soit envoye : une coupure reseau ou une course sur
    // la cle etrangere suffisait a perdre le message pour toujours, avec un
    // journal qui affirmait le contraire.
    if (conflit?.code === "23505") {
      await avance(db, sequence, inscription);
      rapport.ignores += 1;
      rapport.journal.push(`etape deja journalisee pour ${contact.email}`);
      return;
    }
    await libere(db, inscription.id);
    rapport.echecs += 1;
    rapport.journal.push("journal indisponible, reessai au prochain tour");
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
    // Un premier contact professionnel part vers UNE adresse et attend une
    // reponse d'une ligne : il se presente comme une lettre, pas comme une
    // campagne. Voir `Allure` dans le gabarit.
    allure: sequence.audience === "b2b" ? "lettre" : "campagne",
  });

  try {
    const retour = await resend.emails.send({
      // Domaine verifie chez Resend, sinon 403. Voir lib/mail.ts.
      /*
       * L'EXPEDITEUR EST UNE PERSONNE, PAS UNE MARQUE.
       *
       * Le defaut etait `BLF Lab's <carnet@beloucif.com>`. Deux fautes dans une
       * ligne. Un nom de marque et une adresse `carnet@` annoncent une lettre
       * d'information avant que le lecteur ait lu un mot, alors que le message
       * est ecrit par une personne a une autre. Et `carnet@` sert AUSSI a la
       * sequence consentie : les plaintes du demarchage seraient allees abimer
       * la reputation de l'adresse qui porte le carnet, sur un domaine qui
       * envoie egalement les factures.
       */
      from: process.env.RESEND_FROM_PROSPECTION ?? `Adam Beloucif <${SITE.email}>`,
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
  const rapport: Rapport = {
    candidats: 0,
    envoyes: 0,
    ignores: 0,
    echecs: 0,
    purges: 0,
    journal: [],
  };

  const db = serviceClient();
  if (!db) {
    rapport.journal.push("base indisponible");
    return rapport;
  }

  // SANS CLE, ON NE RESERVE MEME PAS. La version precedente reservait la ligne,
  // ecrivait un echec dans le journal, puis rendait la main sans liberer le
  // verrou ni avancer. Quinze minutes plus tard la ligne repassait, l'insertion
  // au journal butait sur l'unicite, et l'etape etait consideree comme deja
  // partie : une cle momentanement absente ou en cours de rotation faisait
  // PERDRE le message au lieu de le retenter.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    rapport.journal.push("cle Resend absente, aucune echeance touchee");
    return rapport;
  }
  const resend = new Resend(apiKey);

  // LA PROMESSE DE PURGE, TENUE. La politique de confidentialite annonce le
  // retrait automatique apres trois ans sans interaction. Sans cet appel,
  // l'engagement etait publie sans rien derriere. Il tourne avant les envois :
  // une fiche caduque ne doit pas recevoir un message de plus.
  /*
   * L'INTERRUPTEUR EN PREMIER, avant meme la purge.
   *
   * Une machine qu'on vient d'arreter ne doit rien faire du tout, pas meme du
   * menage : si l'arret vient d'un doute sur les donnees, toucher aux donnees
   * est precisement ce qu'il ne faut pas faire.
   */
  const reglages = await litReglages(db);
  if (!reglages) {
    rapport.journal.push("reglages illisibles, aucune echeance touchee");
    await journalise(db, rapport);
    return rapport;
  }
  if (!reglages.actif) {
    rapport.journal.push(
      `moteur arrete${reglages.motif_arret ? ` : ${reglages.motif_arret}` : ""}`,
    );
    await journalise(db, rapport);
    return rapport;
  }

  /*
   * LE COUPE-CIRCUIT ENSUITE, avant de reserver quoi que ce soit. Il coupe
   * lui-meme et n'attend pas qu'on vienne le lire : une salve de rebonds se
   * mesure en minutes, et personne ne regarde un tableau de bord la nuit.
   */
  const derive = await tauxHorsLimites(db);
  if (derive) {
    await coupe(db, derive, "coupe-circuit");
    rapport.journal.push(`COUPE-CIRCUIT : ${derive}`);
    await journalise(db, rapport);
    return rapport;
  }

  const { data: purges } = await db.rpc("purge_consentements_caducs");
  if (typeof purges === "number" && purges > 0) {
    rapport.purges = purges;
    rapport.journal.push(`${purges} fiche(s) retiree(s) pour consentement caduc`);
  }

  const deja = await envoyesAujourdhui(db);
  const reste = reglages.plafond_jour - deja;
  if (reste <= 0) {
    rapport.journal.push(
      `plafond du jour atteint : ${deja} sur ${reglages.plafond_jour}`,
    );
    await journalise(db, rapport);
    return rapport;
  }

  const inscriptions = await reserve(db, Math.min(LOT, reste));
  rapport.candidats = inscriptions.length;
  if (!inscriptions.length) {
    await journalise(db, rapport);
    return rapport;
  }

  for (const inscription of inscriptions) {
    await traiteUne(db, resend, inscription, rapport);
    await pause(PAUSE_MS);
  }

  await journalise(db, rapport);
  return rapport;
}

/**
 * Ecrit le battement en base.
 *
 * Le rapport finissait dans un journal GitHub Actions puis disparaissait. Sans
 * trace, rien ne distingue « rien a envoyer » de « plus personne n'appelle la
 * route » : le workflow est vert dans les deux cas, et un moteur mort passe
 * pour un moteur au repos.
 *
 * L'ecriture ne peut pas faire echouer le battement : un journal indisponible
 * est ennuyeux, empecher les envois pour autant serait pire.
 */
async function journalise(db: SupabaseClient, rapport: Rapport): Promise<void> {
  try {
    await db.from("moteur_battements").insert({
      candidats: rapport.candidats,
      envoyes: rapport.envoyes,
      ignores: rapport.ignores,
      echecs: rapport.echecs,
      purges: rapport.purges,
      journal: rapport.journal,
    });
  } catch {
    // Volontairement muet, voir ci-dessus.
  }
}
