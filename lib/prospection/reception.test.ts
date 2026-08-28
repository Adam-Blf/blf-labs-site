import { describe, expect, it } from "vitest";
import { adresseSeule, corpsUtile, demandeUnRetrait } from "./reception";

describe("adresse de l'expediteur", () => {
  it("extrait l'adresse d'un « Nom <adresse> »", () => {
    expect(adresseSeule("Marie Dupont <marie@salon.fr>")).toBe("marie@salon.fr");
  });

  it("rend une adresse nue telle quelle", () => {
    expect(adresseSeule("  Contact@Salon.FR ")).toBe("contact@salon.fr");
  });
});

describe("corps utile", () => {
  /**
   * LE PIEGE PRINCIPAL DE TOUTE CETTE FONCTIONNALITE.
   *
   * Notre pied de page porte la phrase « Ne plus recevoir ces messages ». Un
   * client de messagerie cite le message d'origine dans la reponse. Sans la
   * coupe, cette phrase se retrouve donc dans CHAQUE reponse, et un detecteur
   * naif retirerait de la liste tous ceux qui viennent de dire oui.
   */
  it("coupe tout ce qui suit notre propre pied de page", () => {
    const recu = [
      "Bonjour, oui je suis intéressé, rappelez-moi jeudi.",
      "",
      "Le 27 aout, Adam Beloucif a ecrit :",
      "Adam Beloucif, exercant sous le nom commercial BLF Lab's.",
      "Ne plus recevoir ces messages, en un clic et sans justification.",
    ].join("\n");
    const utile = corpsUtile(recu);
    expect(utile).toContain("rappelez-moi jeudi");
    expect(utile).not.toContain("Ne plus recevoir");
  });

  it("retire les lignes citees marquees", () => {
    expect(corpsUtile("Non merci.\n> Bonjour, je vous ecris au sujet")).toBe(
      "Non merci.",
    );
  });

  it("rend le texte tel quel quand rien n'est cite", () => {
    expect(corpsUtile("  Bonjour, c'est d'accord.  ")).toBe(
      "Bonjour, c'est d'accord.",
    );
  });
});

describe("demande de retrait", () => {
  it("reconnait les formulations explicites, accentuees ou non", () => {
    for (const corps of [
      "Merci de me désinscrire de votre liste.",
      "Je ne souhaite plus recevoir vos messages.",
      "retirez-moi de cette liste",
      "Please remove me from your list.",
      "desabonnement svp",
    ]) {
      expect(demandeUnRetrait("Re: votre message", corps), corps).toBe(true);
    }
  });

  /**
   * Le bouton natif de desinscription d'un client de messagerie envoie un
   * message au sujet impose et au CORPS VIDE. Un detecteur qui ne lit que le
   * corps ne verrait jamais rien.
   */
  it("reconnait un retrait annonce dans le SUJET, corps vide", () => {
    expect(demandeUnRetrait("Unsubscribe", "")).toBe(true);
    expect(demandeUnRetrait("STOP", "")).toBe(true);
  });

  /**
   * Reconnaitre a tort transforme un prospect qui repond en suppression
   * definitive. Et on peut se permettre d'etre prudent : TOUTE reponse arrete
   * deja l'inscription a la sequence, donc une demande non reconnue ne produit
   * aucun message de plus.
   */
  it("ne reconnait pas un refus d'offre comme une demande de retrait", () => {
    for (const corps of [
      "Non merci, ce n'est pas d'actualite cette annee.",
      "Nous avons deja un prestataire, bonne continuation.",
      "Il faut stopper le projet de refonte pour l'instant.",
      "Pas interesse.",
    ]) {
      expect(demandeUnRetrait("Re: votre message", corps), corps).toBe(false);
    }
  });

  it("ne se declenche pas sur notre propre pied de page cite", () => {
    const recu = corpsUtile(
      "Oui, allons-y.\nNe plus recevoir ces messages, en un clic.",
    );
    expect(demandeUnRetrait("Re: votre message", recu)).toBe(false);
  });
});
