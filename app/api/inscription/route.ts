import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, hashIp } from "@/lib/rate-limit";
import { serviceClient } from "@/lib/supabase";
import { inscrire } from "@/lib/prospection/inscription";

export const runtime = "nodejs";

/**
 * Inscription a la liste de diffusion.
 *
 * Une seule reponse pour tous les cas de figure : adresse nouvelle, adresse
 * deja inscrite, adresse desinscrite qui tente de revenir. Le formulaire dit
 * toujours "regardez votre boite". C'est une question de vie privee autant que
 * de securite : une reponse differente selon le cas transformerait ce
 * formulaire en outil pour savoir qui est client de qui.
 *
 * Le piege a robots et la limitation de debit reprennent exactement le motif de
 * app/api/orders/route.ts. Un formulaire d'inscription non protege est la
 * premiere porte qu'un automate essaie, et chaque envoi declenche un vrai
 * email : c'est la reputation du domaine qui paie l'addition.
 */

const schema = z.object({
  email: z.email({ message: "Adresse email invalide." }).max(180),
  nom: z.string().trim().max(120).optional(),
  organisation: z.string().trim().max(160).optional(),
  source: z.string().trim().max(60).default("pied_de_page"),
  pageOrigine: z.string().trim().max(200).default("/"),
  /**
   * Piege a robots : un humain ne le voit pas, donc ne le remplit pas.
   *
   * Volontairement SANS contrainte de longueur. Le refuser au niveau du schema
   * ferait echouer la validation et repondrait 400, ce qui apprend a l'automate
   * qu'il a ete repere. Le champ est donc accepte, et c'est la route qui rend
   * un succes factice sans rien enregistrer.
   */
  website: z.string().optional(),
});

/** Cinq inscriptions par heure et par empreinte d'adresse IP. */
const PLAFOND_HORAIRE = 5;

export async function POST(request: Request) {
  let charge: unknown;
  try {
    charge = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const analyse = schema.safeParse(charge);
  if (!analyse.success) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const donnees = analyse.data;

  // Succes apparent, rien d'enregistre : inutile d'apprendre a l'automate qu'il
  // a ete repere.
  if (donnees.website) return NextResponse.json({ ok: true });

  const ipHash = hashIp(clientIp(request.headers));
  const db = serviceClient();

  if (db) {
    const debut = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await db
      .from("contact_consents")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("donne_at", debut);

    if ((count ?? 0) >= PLAFOND_HORAIRE) {
      return NextResponse.json(
        { error: "Trop de tentatives depuis cette connexion. Réessayez dans une heure." },
        { status: 429 },
      );
    }
  }

  const resultat = await inscrire({
    email: donnees.email,
    nom: donnees.nom || null,
    organisation: donnees.organisation || null,
    source: donnees.source,
    pageOrigine: donnees.pageOrigine,
    ipHash,
    userAgent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
  });

  if (resultat === "indisponible") {
    return NextResponse.json(
      { error: "Inscription impossible pour le moment. Réessayez plus tard." },
      { status: 503 },
    );
  }

  // "refuse" et "deja_inscrit" rendent le meme succes que "confirmation_envoyee".
  return NextResponse.json({ ok: true });
}
