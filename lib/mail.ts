import { Resend } from "resend";
import { SITE } from "@/lib/site";
import {
  BUDGET_LABELS,
  DEADLINE_LABELS,
  PROJECT_TYPE_LABELS,
  type OrderInput,
} from "@/lib/validation";

/**
 * Envoi des deux emails declenches par une commande : la notification a Adam et
 * l'accuse de reception au client.
 *
 * Degradation gracieuse : sans cle API, rien n'est envoye et la fonction rend
 * `false` sans lever d'exception. La commande reste enregistree en base, et le
 * drapeau `mail_sent` garde la trace du fait qu'il faudra relancer. Perdre une
 * demande client parce qu'une variable d'environnement manque serait la pire
 * des pannes silencieuses.
 *
 * L'expedition part d'un sous-domaine dedie (`send.beloucif.com`) pour ne pas
 * toucher aux enregistrements MX qui font fonctionner la boite adam@beloucif.com.
 */

const FROM = process.env.RESEND_FROM ?? "BLF Lab's <contact@send.beloucif.com>";

/** Neutralise le HTML avant injection dans un email. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function summaryRows(order: OrderInput): string {
  const rows: [string, string][] = [
    ["Type de projet", PROJECT_TYPE_LABELS[order.projectType] ?? order.projectType],
    ["Budget", BUDGET_LABELS[order.budget]],
    ["Echeance", DEADLINE_LABELS[order.deadline]],
    ["Nom", order.name],
    ["Email", order.email],
    ["Telephone", order.phone ?? "non renseigne"],
  ];

  // Les informations de facturation figurent dans la notification : elles
  // permettent d'etablir le devis sans avoir a les redemander au client.
  if (order.customerType === "entreprise") {
    rows.push(
      ["Client", "Entreprise ou association"],
      ["Raison sociale", order.companyName ?? ""],
      ["SIREN / SIRET", order.siren ?? ""],
      ["TVA intracommunautaire", order.vatNumber ?? "non assujetti"],
      [
        "Adresse de facturation",
        [
          order.billingStreet,
          `${order.billingPostalCode ?? ""} ${order.billingCity ?? ""}`.trim(),
          order.billingCountry,
        ]
          .filter(Boolean)
          .join(", "),
      ],
    );
  } else {
    rows.push(["Client", "Particulier"], ["Organisation", order.company ?? "non renseignee"]);
  }

  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#5b6472">${esc(label)}</td>` +
        `<td style="padding:6px 0;font-weight:600">${esc(value)}</td></tr>`,
    )
    .join("");
}

function shell(title: string, body: string): string {
  // Styles en ligne : les clients de messagerie ignorent les feuilles externes.
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f7f8fa;padding:24px;font-family:Segoe UI,system-ui,sans-serif;color:#0d1117">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e5ea;border-radius:16px;padding:28px">
    <p style="margin:0 0 18px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#5b5bd6">BLF Lab&rsquo;s</p>
    <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3">${esc(title)}</h1>
    ${body}
  </div>
  <p style="max-width:560px;margin:16px auto 0;font-size:12px;color:#5b6472">
    ${esc(SITE.legalMention)} - SIRET ${esc(SITE.siret)}
  </p>
</body></html>`;
}

export async function sendOrderEmails(order: OrderInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const resend = new Resend(apiKey);
  const table = `<table style="border-collapse:collapse;font-size:14px">${summaryRows(order)}</table>`;
  const message = `<div style="margin-top:18px;padding:16px;background:#f7f8fa;border-radius:12px;font-size:14px;white-space:pre-wrap">${esc(order.message)}</div>`;

  try {
    // Notification interne. `replyTo` permet de repondre au client d'un clic.
    const notify = await resend.emails.send({
      from: FROM,
      to: SITE.email,
      replyTo: order.email,
      subject: `Nouvelle demande : ${PROJECT_TYPE_LABELS[order.projectType] ?? order.projectType} - ${order.name}`,
      html: shell("Nouvelle demande de projet", table + message),
    });

    if (notify.error) return false;

    // Accuse de reception au client.
    await resend.emails.send({
      from: FROM,
      to: order.email,
      replyTo: SITE.email,
      subject: "Votre demande a bien ete recue - BLF Lab's",
      html: shell(
        "Votre demande est arrivee",
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">Bonjour ${esc(order.name)},</p>
         <p style="margin:0 0 16px;font-size:15px;line-height:1.6">
           Votre demande a bien ete enregistree. Vous recevrez une reponse avec une estimation
           de budget et de delai, ou une orientation vers quelqu'un de plus adapte si le projet
           ne correspond pas a ce que fait le studio.
         </p>
         <p style="margin:0 0 8px;font-size:13px;color:#5b6472">Recapitulatif de votre demande :</p>
         ${table}${message}
         <p style="margin:18px 0 0;font-size:14px;line-height:1.6">
           Pour ajouter une precision, repondez simplement a cet email.
         </p>`,
      ),
    });

    return true;
  } catch {
    // Aucun detail technique ne remonte a l'appelant : la route repondra un
    // succes, la commande etant deja enregistree.
    return false;
  }
}
