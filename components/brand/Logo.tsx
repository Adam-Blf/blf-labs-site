/**
 * Logo BLF Lab's.
 *
 * Les deux fichiers servis ici sont les originaux fournis par Adam, copies tels
 * quels dans public/brand depuis brand/logos. Ils ne sont ni retraces, ni
 * recolorises, ni regeneres par un script : le logo est la piece d'identite de
 * l'entreprise, il n'appartient pas au code du site.
 *
 * Pourquoi deux fichiers et un basculement CSS plutot qu'un seul SVG en
 * `currentColor` : les couleurs sont fixees dans le fichier source, donc le
 * dessin ne peut pas suivre la couleur du texte. Les deux versions sont donc
 * rendues ensemble et l'une est masquee par la classe `.dark` posee sur
 * <html>. Le basculement se fait alors au premier rendu, sans JavaScript et
 * sans clignotement au changement de mode - ce qu'un choix de source cote
 * client ne permettrait pas.
 *
 * `aria-hidden` sur les deux images et un libelle porte par le conteneur :
 * sans cela, un lecteur d'ecran annoncerait le nom deux fois, une par version.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    // `inline-flex` et non `inline-block` : un conteneur en ligne s'aligne sur
    // la ligne de base du texte voisin, ce qui laissait sous le logo la place
    // reservee aux jambages et le faisait remonter dans la barre de navigation.
    // Le mode flex supprime cet espace et centre le dessin sur sa boite.
    <span
      className={`relative inline-flex items-center ${className}`}
      role="img"
      aria-label="BLF Lab's"
    >
      {/* Version a lettrage sombre : mode clair. */}
      <img
        src="/brand/logo.svg"
        alt=""
        aria-hidden="true"
        className="block h-full w-auto dark:hidden"
      />
      {/* Version a lettrage clair : mode sombre. */}
      <img
        src="/brand/logo-inverse.svg"
        alt=""
        aria-hidden="true"
        className="hidden h-full w-auto dark:block"
      />
    </span>
  );
}
