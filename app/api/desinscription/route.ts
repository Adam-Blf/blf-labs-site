import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/clients";
import { litJeton } from "@/lib/prospection/jeton";

export const runtime = "nodejs";

/**
 * LA DESINSCRIPTION EN UN CLIC.
 *
 * Cette route est appelee de deux facons, et les deux doivent aboutir sans
 * jamais rien demander a personne :
 *
 *   - par la messagerie elle-meme, en POST, sans que la personne voie quoi que
 *     ce soit. C'est le bouton natif de Gmail et d'Outlook, decrit par la
 *     RFC 8058, celui qui evite le bouton "indesirable" ;
 *   - par la page /desinscription, quand la personne a clique sur le lien du
 *     pied de page.
 *
 * TROIS REGLES QUI NE SE NEGOCIENT PAS.
 *
 * 1. AUCUNE AUTHENTIFICATION. Demander de se connecter pour se desinscrire, ou
 *    meme de retaper son adresse, transforme un droit en parcours du
 *    combattant. Le jeton signe porte l'adresse, cela suffit.
 * 2. TRAITEMENT IMMEDIAT. Le delai legal est un plafond, pas un objectif.
 * 3. REPONSE IDENTIQUE DANS TOUS LES CAS. Un jeton valide et un jeton faux
 *    rendent le meme code : cette route est publique, et distinguer les deux
 *    en ferait un moyen de tester quelles adresses sont dans la liste.
 */

async function retire(jeton: string | null): Promise<void> {
  const email = litJeton("desinscription", jeton);
  if (!email) return;

  const db = serviceClient();
  if (!db) return;

  // Un seul appel : la fonction SQL fait la liste de suppression, le statut du
  // contact, l'arret des sequences et l'horodatage du retrait dans la meme
  // transaction. Quatre ecritures separees laisseraient un etat a moitie
  // desinscrit si l'une echouait, et c'est cette moitie qui renverrait un
  // message la semaine suivante.
  await db.rpc("desinscrire", { cible: email, motif: "desinscription" });
}

export async function POST(request: Request) {
  const jeton = new URL(request.url).searchParams.get("jeton");
  await retire(jeton);
  return new NextResponse(null, { status: 200 });
}

/**
 * Certaines messageries suivent le lien en GET avant meme que la personne
 * clique, pour verifier qu'il repond. On redirige donc vers la page de
 * confirmation au lieu de desinscrire, sinon un simple survol de message
 * retirerait quelqu'un de la liste sans qu'il ait rien demande.
 */
export async function GET(request: Request) {
  const jeton = new URL(request.url).searchParams.get("jeton") ?? "";
  return NextResponse.redirect(
    new URL(`/desinscription?jeton=${encodeURIComponent(jeton)}`, request.url),
  );
}
