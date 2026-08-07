/**
 * Les huit directions artistiques soumises au choix.
 *
 * L'ordre est celui de la planche de comparaison. `note` sert a nommer ce que
 * chaque direction raconte : sans cela, on compare des couleurs au lieu de
 * comparer des intentions.
 */
export type Direction = {
  id: string;
  code: string;
  label: string;
  note: string;
};

export const DIRECTIONS: Direction[] = [
  {
    id: "dir-brut",
    code: "01",
    label: "Brut",
    note: "Neobrutalisme, navy et laiton. Traits epais, ombres dures, capitales. Les couleurs de vos badges GitHub.",
  },
  {
    id: "dir-affiche",
    code: "02",
    label: "Affiche",
    note: "Affichiste suisse, noir blanc rouge. Typo enorme, aucun trait, aucune ombre : tout repose sur l'echelle et le vide.",
  },
  {
    id: "dir-editorial",
    code: "03",
    label: "Editorial",
    note: "Revue imprimee. Serif d'affichage en bas de casse, filets fins, grandes marges. Le plus calme et le plus haut de gamme.",
  },
  {
    id: "dir-tech",
    code: "04",
    label: "Tech",
    note: "Produit logiciel contemporain. Angles adoucis, ombres diffuses, un seul accent lumineux. Registre Linear et Vercel.",
  },
  {
    id: "dir-blueprint",
    code: "05",
    label: "Blueprint",
    note: "Plan d'ingenieur. Bleu nuit, traits fins, titres en monospace. Le plus litteralement laboratoire.",
  },
  {
    id: "dir-riso",
    code: "06",
    label: "Riso",
    note: "Impression risographie. Deux encres franches, ombre decalee coloree, papier chaud. Artisanal et chaleureux.",
  },
  {
    id: "dir-bento",
    code: "07",
    label: "Bento",
    note: "Cartes souples contemporaines. Grands rayons, aucun trait, ombres tres douces. Le plus doux, registre application.",
  },
  {
    id: "dir-terminal",
    code: "08",
    label: "Terminal",
    note: "Console. Tout en monospace, phosphore sur noir. Le plus radical et le plus clivant.",
  },
];
