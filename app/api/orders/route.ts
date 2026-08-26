import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/mail";
import { raccordeCommande } from "@/lib/prospection/inscription";
import { clientIp, hashIp, isRateLimited } from "@/lib/rate-limit";
import { serviceClient } from "@/lib/supabase/clients";
import { orderSchemaChecked } from "@/lib/validation";

/**
 * Enregistrement d'une demande de commande.
 *
 * Ordre des operations, choisi pour ne jamais perdre une demande :
 *   1. validation serveur (le client ne fait foi de rien) ;
 *   2. piege a robots ;
 *   3. limitation de debit ;
 *   4. ecriture en base ;
 *   5. envoi des emails, dont l'echec ne fait PAS echouer la requete.
 *
 * Aucune trace technique ne sort vers le client : les details restent dans les
 * journaux du serveur.
 */
export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const parsed = orderSchemaChecked.safeParse(payload);

  if (!parsed.success) {
    // On renvoie les messages par champ pour que le formulaire puisse les
    // afficher au bon endroit, sans exposer la structure interne.
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return NextResponse.json({ error: "Formulaire invalide.", fieldErrors }, { status: 400 });
  }

  const order = parsed.data;

  // Piege a robots : un automate remplit tous les champs, y compris celui qui
  // est masque. On repond un succes pour ne pas lui apprendre qu'il a ete
  // repere, mais rien n'est enregistre.
  if (order.website) {
    return NextResponse.json({ ok: true });
  }

  const supabase = serviceClient();

  // Sans base configuree, on tente quand meme l'email : le site reste
  // utilisable en production degradee.
  if (!supabase) {
    const mailed = await sendOrderEmails(order);
    return NextResponse.json(
      { ok: true, stored: false, mailed },
      { status: mailed ? 200 : 202 },
    );
  }

  const ipHash = hashIp(clientIp(request.headers));
  const userAgent = request.headers.get("user-agent")?.slice(0, 400) ?? null;

  if (await isRateLimited(supabase, ipHash)) {
    return NextResponse.json(
      {
        error:
          "Trop de demandes envoyées depuis cette connexion. Réessayez dans une heure, ou écrivez directement par email.",
      },
      { status: 429 },
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      project_type: order.projectType,
      budget_range: order.budget,
      deadline: order.deadline,
      options: order.options ?? [],
      message: order.message,
      name: order.name,
      email: order.email,
      phone: order.phone ?? null,
      company: order.company ?? null,
      // Facturation : renseigne uniquement pour un client professionnel.
      customer_type: order.customerType,
      company_name: order.companyName ?? null,
      siren: order.siren?.replace(/\s/g, "") ?? null,
      vat_number: order.vatNumber?.replace(/\s/g, "").toUpperCase() ?? null,
      billing_street: order.billingStreet ?? null,
      billing_postal_code: order.billingPostalCode ?? null,
      billing_city: order.billingCity ?? null,
      billing_country: order.billingCountry ?? null,
      consent_at: new Date().toISOString(),
      ip_hash: ipHash,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Echec d'enregistrement de la commande", error);
    // La base est indisponible : on essaie l'email pour ne pas perdre la piste.
    const mailed = await sendOrderEmails(order);
    if (mailed) return NextResponse.json({ ok: true, stored: false, mailed: true });

    return NextResponse.json(
      {
        error:
          "Impossible d'enregistrer la demande pour le moment. Écrivez à adam@beloucif.com, la demande sera traitée de la même façon.",
      },
      { status: 503 },
    );
  }

  const mailed = await sendOrderEmails(order);

  // La trace de l'echec d'envoi vit en base : elle permet de relancer plus tard
  // sans redemander l'information au client.
  if (mailed) {
    await supabase.from("orders").update({ mail_sent: true }).eq("id", data.id);
  }

  // Raccordement au suivi automatise : relance de la demande dans tous les cas,
  // article 6.1.b, et inscription au carnet uniquement si la seconde case a ete
  // cochee, article 6.1.a. Jamais bloquant : la demande est deja enregistree, et
  // un incident sur cette partie ne doit pas la faire echouer.
  try {
    await raccordeCommande({
      email: order.email,
      nom: order.name,
      organisation: order.companyName ?? order.company ?? null,
      prospection: order.prospectionConsent === true,
      ipHash,
      userAgent,
    });
  } catch (erreur) {
    console.error("Echec du raccordement au suivi automatise", erreur);
  }

  return NextResponse.json({ ok: true, stored: true, mailed });
}
