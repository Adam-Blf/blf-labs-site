import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { traiteEcheances } from "@/lib/prospection/moteur";

export const runtime = "nodejs";
/** Aucune mise en cache : cette route a un effet, elle ne rend pas un document. */
export const dynamic = "force-dynamic";

/**
 * Le battement du moteur d'envoi.
 *
 * APPELEE PAR GITHUB ACTIONS, PAS PAR VERCEL CRON. Le plan Hobby de Vercel
 * limite une tache planifiee a une execution par jour, alors qu'une sequence a
 * des echeances a l'heure. Un workflow planifie qui appelle cette adresse est
 * gratuit, independant du plan d'hebergement, et se relit dans le depot.
 * Voir .github/workflows/prospection.yml.
 *
 * La garde est un secret partage compare a temps constant. Une comparaison
 * naive fuit, octet par octet, de quoi reconstruire le secret ; et un secret
 * qui declenche des envois d'email vaut la peine d'etre protege serieusement.
 */

function secretValide(entete: string | null): boolean {
  const attendu = process.env.CRON_SECRET;
  if (!attendu) return false;
  if (!entete?.startsWith("Bearer ")) return false;

  const fourni = Buffer.from(entete.slice(7));
  const reference = Buffer.from(attendu);
  return fourni.length === reference.length && timingSafeEqual(fourni, reference);
}

export async function POST(request: Request) {
  if (!secretValide(request.headers.get("authorization"))) {
    // Aucun detail : ni "secret absent", ni "secret faux". Les deux se
    // ressemblent vus de l'exterieur, et c'est exactement ce qu'on veut.
    return new NextResponse(null, { status: 401 });
  }

  const rapport = await traiteEcheances();
  return NextResponse.json(rapport);
}
