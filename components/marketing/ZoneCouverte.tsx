import Link from "next/link";

/**
 * Zone d'intervention.
 *
 * CE FICHIER A ETE VIDE DE SA CARTE LE 2026-08-12, ET C'EST LE POINT
 * IMPORTANT.
 *
 * La version precedente affichait une carte Google de l'Ile-de-France et
 * annoncait du presentiel « pour le cadrage et les points d'etape », avec un
 * lien d'itineraire et la phrase « les rendez-vous se tiennent chez vous ».
 * Le studio ne se deplace jamais : tout se fait a distance. La section entiere
 * promettait donc quelque chose qui n'existe pas.
 *
 * Une carte est une promesse geographique. En afficher une quand la zone
 * desservie est « partout » ne renseigne sur rien et suggere l'inverse de la
 * verite. Elle est donc retiree, pas reparee. Effet de bord bienvenu : la page
 * d'accueil ne contacte plus Google du tout, et n'a plus besoin de demander
 * l'accord prealable que l'article 82 de la loi Informatique et Libertes
 * imposait pour l'iframe.
 *
 * CE QUI REMPLACE. La question derriere « ou on intervient » n'est pas
 * geographique, elle est : « est-ce que ca va marcher sans qu'on se voie ? ».
 * On y repond par le fonctionnement reel plutot que par une carte.
 */

const MOMENTS = [
  {
    titre: "Le cadrage",
    texte:
      "Une à deux heures en visioconférence, écran partagé, dont sort un " +
      "document écrit que vous gardez. C’est le seul moment qui décide du " +
      "reste.",
  },
  {
    titre: "Pendant",
    texte:
      "Chaque version est en ligne à une adresse que vous ouvrez quand vous " +
      "voulez. Vous n’attendez pas une réunion pour voir où ça en est.",
  },
  {
    titre: "Quand ça coince",
    texte:
      "Une visio dans la journée. Un blocage se règle en regardant le même " +
      "écran, ce qui fonctionne à l’identique à distance.",
  },
];

export function ZoneCouverte() {
  return (
    <section className="rule-t">
      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="title max-w-3xl text-4xl sm:text-5xl">
          Où on <span className="grad-text">intervient</span>
        </h2>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
          Partout, entièrement à distance. Le studio est basé en
          Île-de-France, ne se déplace pas et ne reçoit pas : ni déplacement à
          facturer, ni créneau qui dépend d&rsquo;un train. La méthode est la
          même pour un client à Créteil et pour un client à Toulouse.
        </p>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {MOMENTS.map((moment) => (
            <li key={moment.titre} className="blk flex flex-col gap-4 p-8">
              <h3 className="title text-2xl">{moment.titre}</h3>
              <p className="leading-relaxed text-muted">{moment.texte}</p>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted">
          Tous les rendez-vous se tiennent en visioconférence.{" "}
          <Link
            href="/developpement-web-ile-de-france"
            className="text-ink underline underline-offset-4"
          >
            Comment ça se passe concrètement
          </Link>
        </p>
      </div>
    </section>
  );
}
