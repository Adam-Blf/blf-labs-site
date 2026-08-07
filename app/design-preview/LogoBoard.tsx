import { LogoBloc } from "@/components/brand/LogoBloc";
import { LogoFiole } from "@/components/brand/LogoFiole";
import { LogoMonogramme } from "@/components/brand/LogoMonogramme";
import { Card } from "@/components/ui/Card";

/**
 * Planche de comparaison des pistes de logo.
 *
 * Chaque piste est montree en grand ET a 32 puis 16 pixels. Un logo se juge a
 * la taille du favicon autant qu'en grand : c'est la reduction qui elimine les
 * dessins trop detailles.
 */
const PISTES = [
  {
    id: "monogramme",
    title: "Piste 1 - Monogramme",
    note: "Les trois lettres sur une grille de 8. Compact, tient en favicon, fonctionne en tampon sur une facture.",
    Logo: LogoMonogramme,
  },
  {
    id: "bloc",
    title: "Piste 2 - Bloc typographique",
    note: "Le nom entier dans un pave plein, BLF en reserve. L'apostrophe coloree signe la marque.",
    Logo: LogoBloc,
  },
  {
    id: "fiole",
    title: "Piste 3 - Embleme",
    note: "Une fiole reduite a sa geometrie. Le plus parlant sur le mot Lab's, le plus risque aussi.",
    Logo: LogoFiole,
  },
];

export function LogoBoard() {
  return (
    <div className="section mx-auto max-w-6xl px-5">
      <h2 className="title text-3xl md:text-5xl">Trois pistes de logo</h2>
      <p className="mt-4 max-w-2xl text-muted">
        Chaque piste est rendue dans la direction artistique selectionnee dans la
        barre du haut : le logo doit tenir dans le style choisi, pas a cote.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PISTES.map(({ id, title, note, Logo }) => (
          <Card key={id} className="p-7">
            <h3 className="title text-xl">{title}</h3>
            <p className="mt-3 min-h-[72px] text-sm text-muted">{note}</p>

            <div className="mt-6 flex items-center justify-center bg-paper p-6">
              <Logo className="h-32 w-auto text-ink" />
            </div>

            {/* Epreuve de reduction : c'est ici que les dessins trop fins
                s'effondrent. */}
            <div className="mt-6 flex items-end gap-5">
              <div className="text-center">
                <Logo className="h-8 w-auto text-ink" />
                <span className="mono mt-2 block text-[10px] text-muted">
                  32 px
                </span>
              </div>
              <div className="text-center">
                <Logo className="h-4 w-auto text-ink" />
                <span className="mono mt-2 block text-[10px] text-muted">
                  16 px
                </span>
              </div>
            </div>

            {/* Mise en situation : sur un aplat d'accent, comme sur un bouton
                ou une carte de visite. */}
            <div className="mt-6 flex items-center gap-3 bg-accent p-4 text-accent-ink">
              <Logo className="h-9 w-auto" />
              <span className="mono text-xs uppercase">sur aplat</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
