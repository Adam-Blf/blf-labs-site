import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Fil d'Ariane, visible ET structure.
 *
 * Les deux comptent, et pour des raisons differentes :
 *
 * - Le balisage `BreadcrumbList` remplace l'URL brute sous le titre dans les
 *   resultats Google par le chemin lisible du site. Sur une page profonde comme
 *   `/offre/apps-mobiles`, c'est la difference entre une adresse et une phrase.
 * - Le fil visible sert au visiteur qui arrive directement sur une page interne
 *   depuis un moteur de recherche, donc sans etre passe par l'accueil. Il n'a
 *   aucune idee d'ou il est dans le site, et le bouton retour du navigateur le
 *   renverrait chez Google.
 *
 * L'element courant n'est pas un lien : pointer vers la page qu'on regarde deja
 * n'apporte rien et ajoute une tabulation inutile au clavier. Il porte
 * `aria-current="page"`, qui est ce que les lecteurs d'ecran annoncent.
 */
export type Miette = {
  /** Libelle affiche. */
  nom: string;
  /** Chemin absolu depuis la racine. Absent pour l'element courant. */
  href?: string;
};

export function Breadcrumb({ miettes }: { miettes: Miette[] }) {
  // L'accueil est toujours la premiere miette : on ne le repete pas dans chaque
  // appel, et il ne peut donc pas etre oublie.
  const chemin: Miette[] = [{ nom: "Accueil", href: "/" }, ...miettes];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: chemin.map((miette, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: miette.nom,
      // `item` est omis sur le dernier element : Google demande explicitement
      // que la page courante n'y figure pas.
      ...(miette.href ? { item: `${SITE.url}${miette.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav aria-label="Fil d'Ariane" className="mono text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {chemin.map((miette, index) => (
            <li key={miette.nom} className="flex items-center gap-x-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-faint">
                  /
                </span>
              )}

              {miette.href ? (
                <Link
                  href={miette.href}
                  className="transition-colors hover:text-ink"
                >
                  {miette.nom}
                </Link>
              ) : (
                <span aria-current="page" className="text-muted-strong">
                  {miette.nom}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
