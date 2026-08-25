import { NextResponse } from "next/server";
import { confirme } from "@/lib/prospection/inscription";

export const runtime = "nodejs";

/**
 * Le clic de confirmation du double opt-in.
 *
 * En GET, parce que c'est un lien dans un email et qu'aucun autre verbe n'y est
 * possible. C'est acceptable ici, contrairement a la desinscription : le pire
 * qu'une messagerie qui pre-visite les liens puisse provoquer, c'est confirmer
 * une inscription que la personne a elle-meme demandee une minute plus tot. Le
 * risque symetrique, une desinscription involontaire, serait bien plus grave,
 * et c'est pour cela que l'autre route passe par une page de confirmation.
 *
 * Le resultat part dans l'adresse, pas dans le corps : la page qui suit doit
 * pouvoir etre rechargee et partagee sans rejouer quoi que ce soit.
 */
export async function GET(request: Request) {
  const jeton = new URL(request.url).searchParams.get("jeton");
  const ok = await confirme(jeton);
  return NextResponse.redirect(
    new URL(ok ? "/inscription/confirmee" : "/inscription/confirmee?echec=1", request.url),
  );
}
