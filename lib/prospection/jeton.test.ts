import { describe, expect, it } from "vitest";
import { creeJeton, litJeton } from "./jeton";
import { prepare } from "./gabarit";

// Pose AVANT toute collecte, pas dans un `beforeAll` : le corps d'un `describe`
// s'evalue a la collecte, donc avant les crochets, et l'appel a `prepare`
// ci-dessous levait faute de secret. Le message d'erreur etait juste, c'est le
// test qui s'y prenait trop tard.
process.env.UNSUBSCRIBE_SECRET = "secret-de-test-uniquement";

/**
 * Ces tests portent sur les deux seules choses que personne ne verra jamais
 * echouer a l'oeil nu : un jeton falsifie qui passerait, et un message de
 * prospection parti sans lien de retrait.
 *
 * Le premier laisserait n'importe qui desinscrire n'importe quelle adresse. Le
 * second est une infraction a chaque envoi. Ni l'un ni l'autre ne se voit en
 * relisant le code, d'ou ces tests plutot qu'une relecture attentive.
 */

describe("jetons signes", () => {
  it("rend l'adresse d'origine, en minuscules", () => {
    const jeton = creeJeton("desinscription", "Quelqu'Un@Exemple.FR");
    expect(litJeton("desinscription", jeton)).toBe("quelqu'un@exemple.fr");
  });

  it("refuse un jeton lu avec le mauvais usage", () => {
    // Sans cela, un lien de confirmation d'inscription vaudrait lien de
    // desinscription, et inversement.
    const jeton = creeJeton("confirmation", "a@exemple.fr");
    expect(litJeton("desinscription", jeton)).toBeNull();
  });

  it("refuse une charge modifiee", () => {
    const jeton = creeJeton("desinscription", "victime@exemple.fr");
    const charge = jeton.split(".")[0];
    const signature = jeton.split(".")[1];

    const fausseCharge = Buffer.from(
      JSON.stringify({ u: "desinscription", e: "autre@exemple.fr" }),
    )
      .toString("base64url")
      .replace(/=+$/, "");

    expect(fausseCharge).not.toBe(charge);
    expect(litJeton("desinscription", `${fausseCharge}.${signature}`)).toBeNull();
  });

  it("refuse une signature tronquee ou vide", () => {
    const jeton = creeJeton("desinscription", "a@exemple.fr");
    expect(litJeton("desinscription", jeton.split(".")[0])).toBeNull();
    expect(litJeton("desinscription", `${jeton.split(".")[0]}.`)).toBeNull();
    expect(litJeton("desinscription", "")).toBeNull();
    expect(litJeton("desinscription", null)).toBeNull();
  });

  it("fait expirer un lien de confirmation au bout de sept jours", () => {
    const jeton = creeJeton("confirmation", "a@exemple.fr", 0);
    const sixJours = 6 * 24 * 60 * 60 * 1000;
    const huitJours = 8 * 24 * 60 * 60 * 1000;

    expect(litJeton("confirmation", jeton, sixJours)).toBe("a@exemple.fr");
    expect(litJeton("confirmation", jeton, huitJours)).toBeNull();
  });

  it("ne fait jamais expirer un lien de desinscription", () => {
    // Un droit d'opposition qui expire est un droit d'opposition qui ne marche
    // pas. Le lien doit repondre des annees apres l'envoi du message.
    const jeton = creeJeton("desinscription", "a@exemple.fr", 0);
    const dixAns = 10 * 365 * 24 * 60 * 60 * 1000;
    expect(litJeton("desinscription", jeton, dixAns)).toBe("a@exemple.fr");
  });
});

describe("coquille des messages", () => {
  const message = prepare({
    sujet: "Un sujet",
    corps: '<p>Bonjour <a href="https://exemple.fr">ici</a></p>',
    email: "destinataire@exemple.fr",
    base: "https://beloucif.com",
  });

  it("pose un lien de retrait dans le corps HTML", () => {
    expect(message.html).toContain("/desinscription?jeton=");
    expect(message.html).toContain("Ne plus recevoir ces messages");
  });

  it("pose les en-tetes de desinscription en un clic, RFC 8058", () => {
    expect(message.entetes["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(message.entetes["List-Unsubscribe"]).toContain(
      "<https://beloucif.com/api/desinscription?jeton=",
    );
    expect(message.entetes["List-Unsubscribe"]).toContain("mailto:");
  });

  it("porte le même jeton dans le corps et dans l'en-tete", () => {
    // Deux jetons differents finiraient par diverger, et le bouton natif de la
    // messagerie cesserait de fonctionner sans que personne le remarque.
    const dansEntete = message.entetes["List-Unsubscribe"].split("jeton=")[1].split(">")[0];
    expect(message.html).toContain(dansEntete);
  });

  it("identifie l'expediteur dans chaque message", () => {
    expect(message.html).toContain("SIRET");
    expect(message.texte).toContain("SIRET");
  });

  it("produit une version texte lisible, liens compris", () => {
    expect(message.texte).toContain("Bonjour ici (https://exemple.fr)");
    expect(message.texte).not.toContain("<p>");
  });
});
