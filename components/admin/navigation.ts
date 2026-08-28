/**
 * La carte du back-office - quatre poles, et rien de plus.
 *
 * POURQUOI REGROUPER CINQ ENTREES EN TROIS. Leads et Projets sont deux moments
 * du meme fil : une demande arrive, elle devient un projet. Facturation et
 * Comptabilite sont deux faces du meme argent - ce qu'on facture, ce qu'on
 * encaisse. Les tenir separes obligeait a traverser la barre de navigation pour
 * passer d'un devis a la recette qui en decoule.
 *
 * IL N'Y A PAS DE POLE « REGLAGES », et c'est delibere : les deux ecrans qui y
 * seraient (verification en deux etapes, changement de mot de passe) vivent
 * hors de cette coquille, en pleine page, parce qu'on y accede AVANT d'etre
 * pleinement authentifie. Un pole qui ne contiendrait que des liens vers
 * ailleurs serait un menu deguise en section.
 *
 * LES ONGLETS VIVENT DANS L'URL. Un onglet garde en memoire ne se met pas en
 * favori, ne se partage pas, et se perd a chaque rechargement - or on recharge
 * beaucoup un back-office, ne serait-ce qu'apres avoir deplace une carte.
 *
 * Ce fichier est la SEULE source de la navigation : le menu, les onglets et la
 * garde d'architecture le lisent.
 */

export type Onglet = {
  /** Valeur du parametre `?onglet=`. Jamais traduite : elle vit dans l'URL. */
  cle: string;
  libelle: string;
  aide?: string;
};

export type Pole = {
  chemin: string;
  libelle: string;
  /** Ce que le pole regroupe, dit en une ligne sous le titre. */
  aide: string;
  onglets: Onglet[];
};

export const POLES: readonly Pole[] = [
  {
    chemin: "/admin",
    libelle: "Accueil",
    aide: "Ce qui bouge en ce moment.",
    onglets: [],
  },
  {
    chemin: "/admin/activite",
    libelle: "Activité",
    aide: "Les demandes qui arrivent et les projets qui avancent.",
    onglets: [
      {
        cle: "leads",
        libelle: "Demandes",
        aide: "Le pipeline commercial, du premier contact au gain ou à la perte.",
      },
      {
        cle: "projets",
        libelle: "Projets",
        aide: "Les chantiers en cours et leur avancement.",
      },
    ],
  },
  {
    chemin: "/admin/prospection",
    libelle: "Prospection",
    aide: "Qui a accepté d'être contacté, ce qui est parti, et qui s'est retiré.",
    onglets: [
      {
        cle: "contacts",
        libelle: "Contacts",
        aide: "Les adresses de la liste, avec le régime juridique qui autorise l'envoi.",
      },
      {
        cle: "envois",
        libelle: "Envois",
        aide: "Ce qui est parti, ce qui a été ouvert, ce qui a échoué.",
      },
      {
        cle: "messages",
        libelle: "Messages",
        aide: "Les réponses reçues, et de quoi y répondre sans ouvrir sa boîte personnelle.",
      },
      {
        cle: "retraits",
        libelle: "Retraits",
        aide: "La liste de suppression. Une adresse qui y figure ne peut plus être sollicitée.",
      },
    ],
  },
  {
    chemin: "/admin/argent",
    libelle: "Argent",
    aide: "Ce qui est facturé, ce qui est encaissé, ce qui se déclare.",
    onglets: [
      {
        cle: "facturation",
        libelle: "Devis et factures",
        aide: "Les pièces émises et leur statut de paiement.",
      },
      {
        cle: "comptabilite",
        libelle: "Comptabilité",
        aide: "Trésorerie, récapitulatif URSSAF et livre des recettes.",
      },
    ],
  },
];

/** Le pole auquel appartient une adresse, pour l'etat actif du menu. */
export function poleCourant(chemin: string): Pole | undefined {
  /*
   * On compare du plus long au plus court : `/admin` prefixe TOUS les autres
   * chemins, et un test naif le designerait comme actif partout.
   */
  return [...POLES]
    .sort((a, b) => b.chemin.length - a.chemin.length)
    .find((p) => chemin === p.chemin || chemin.startsWith(`${p.chemin}/`));
}

/**
 * L'onglet demande, ou le premier du pole.
 *
 * Une valeur inconnue - un favori d'une version precedente, une faute de
 * frappe - retombe sur le premier onglet plutot que d'afficher un ecran vide.
 * Un ecran qui s'ouvre vide se lit comme « il n'y a rien ».
 */
export function ongletCourant(pole: Pole, demande?: string | null): string {
  if (pole.onglets.length === 0) return "";
  const existe = pole.onglets.some((o) => o.cle === demande);
  return existe ? (demande as string) : pole.onglets[0].cle;
}
