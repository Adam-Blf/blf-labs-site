import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Graduation } from "@/components/ui/Graduation";
import { FOURCHETTES, OPTIONS, PALIERS_DE_TACHES } from "@/content/tarifs";
import { SITE } from "@/lib/site";

/**
 * Les trois paliers de prix, en colonnes.
 *
 * D'OU VIENT CETTE MISE EN PAGE, ET CE QUI N'EN VIENT PAS.
 *
 * La structure - trois colonnes, un palier mis en avant, une liste de ce qui
 * est compris, une action par carte - est reprise d'un composant du catalogue
 * 21st.dev. Le CODE, lui, est ecrit ici.
 *
 * Ce n'est pas une coquetterie. Le composant d'origine tire `lucide-react`,
 * `class-variance-authority`, `@radix-ui/react-slot`, plus trois fichiers
 * `Button`, `Card` et `Badge` de la pile shadcn. Aucune de ces cinq
 * dependances n'est installee dans ce depot, et les deux primitives que le
 * composant demande existent DEJA ici, avec une autre interface. L'installer
 * tel quel aurait ajoute cinq paquets et deux composants en double, pour un
 * resultat qui n'aurait pas porte la direction artistique du site.
 *
 * Trois autres raisons de ne pas copier le code du catalogue :
 *
 *   - la licence suit le code, et la voie shadcn le copie DANS le depot, qui
 *     est public et sous MIT. C'est ce qui a fait ecarter une autre
 *     bibliotheque le meme jour ;
 *   - plusieurs composants de catalogue chargent une police ou un avatar depuis
 *     un domaine tiers, ce que le depot interdit sur un site livre ;
 *   - le composant d'origine est une grille d'abonnement SaaS, avec une
 *     mensualite et un palier « populaire ». Ici il n'y a ni abonnement ni
 *     mensualite : trois perimetres, chacun avec un plancher.
 *
 * CE QUI EST AFFICHE, ET POURQUOI CHAQUE MENTION Y EST.
 *
 * Le prix seul ne suffit pas. L'article 1er de l'arrete du 3 decembre 1987
 * impose d'annoncer la somme totale effectivement payee, d'ou `mention_prix` ;
 * son article 3 impose d'indiquer ce que le prix NE comprend pas des lors que
 * c'est indispensable au service, d'ou `hors_forfait`, qui est commun aux trois
 * paliers et affiche une seule fois sous la grille plutot que repete trois
 * fois.
 */
export function Tarifs() {
  if (FOURCHETTES.length === 0) return null;

  const commun = FOURCHETTES[0];

  return (
    <section className="rule-b">
      <div className="section mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Graduation className="mb-12 opacity-40" />

        <h2 className="title text-3xl sm:text-4xl">Points de départ</h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted">
          Trois périmètres, trois planchers. Le prix se calcule ensuite sur le
          nombre d&rsquo;écrans réellement différents, et le devis le détaille
          poste par poste avant tout engagement.
        </p>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {FOURCHETTES.map((f, index) => (
            <li key={f.nom} className="flex">
              {/*
                Le palier du milieu est mis en avant, pas parce qu'il serait
                « populaire » - une seule vente reelle a ce jour, l'affirmer
                serait faux - mais parce que c'est le seul dont le perimetre
                ait ete reellement livre et mesure.
              */}
              <Card
                tone={index === 1 ? "accent" : "surface"}
                className="flex w-full flex-col gap-5 p-8"
              >
                <div>
                  <h3 className="title text-xl">{f.nom}</h3>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${
                      index === 1 ? "text-accent-ink/80" : "text-muted"
                    }`}
                  >
                    {f.pour_qui}
                  </p>
                </div>

                <p
                  className={`tabular title text-3xl ${
                    index === 1 ? "text-accent-ink" : "text-accent"
                  }`}
                >
                  {f.plancher}
                </p>

                <p
                  className={`text-sm leading-relaxed ${
                    index === 1 ? "text-accent-ink/80" : "text-muted"
                  }`}
                >
                  {f.couvre}
                </p>

                <ul className="flex flex-col gap-3">
                  {f.inclus.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed">
                      <span
                        aria-hidden="true"
                        className={index === 1 ? "text-accent-ink" : "text-accent"}
                      >
                        &rarr;
                      </span>
                      <span className={index === 1 ? "text-accent-ink" : "text-ink"}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                <p
                  className={`text-sm leading-relaxed ${
                    index === 1 ? "text-accent-ink/70" : "text-muted"
                  }`}
                >
                  <strong>Ce qui fait monter :</strong> {f.fait_monter}
                </p>

                <div className="mt-auto pt-2">
                  <Link
                    href="/commander"
                    className={`btn-pill inline-block px-6 py-3 text-sm font-semibold ${
                      index === 1
                        ? "bg-paper text-ink"
                        : "border border-line-strong text-ink"
                    }`}
                  >
                    Demander un devis
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        {/*
          Mentions communes, affichees une fois sous la grille. Les repeter dans
          chaque carte les rendrait illisibles, et une mention illisible ne vaut
          pas mieux qu'une mention absente au sens de l'article L121-3.
        */}
        <div className="blk-flat mt-10 p-6 text-sm leading-relaxed text-muted">
          <p>{commun.mention_prix}</p>
          <p className="mt-3">{commun.hors_forfait}</p>
          <p className="mt-3">{commun.date_effet}</p>
        </div>

        {/*
          LE DETAIL PAR TACHE.

          Ce bloc n'est pas une seconde grille : c'est la DECOMPOSITION des
          planchers ci-dessus, et la somme des taches d'un palier fait
          exactement son plancher. La garde de test le verifie a chaque
          execution. Annoncer un forfait a 600 EUR et des taches totalisant
          davantage reviendrait a annoncer un prix auquel on ne peut pas
          fournir, ce que l'article L121-4 repute trompeur en toutes
          circonstances.

          Pourquoi l'afficher. Un client qui doit tenir un budget peut retirer
          une ligne, pas negocier un forfait : le detail transforme un refus en
          arbitrage.
        */}
        <div className="mt-16">
          <h3 className="title text-2xl">Ce que chaque tâche coûte</h3>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">
            Chaque palier ci-dessus est une addition, et la voici. Vous pouvez
            retirer une ligne dont vous n&rsquo;avez pas besoin, ou n&rsquo;en
            prendre qu&rsquo;une. Le prix de la tâche ne dépend pas du temps
            qu&rsquo;elle nous prend.
          </p>

          <div className="mt-8 space-y-10">
            {PALIERS_DE_TACHES.map((palier) => (
              <div key={palier.nom}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-hair pb-2">
                  <h4 className="title text-lg">{palier.nom}</h4>
                  <p className="text-sm text-muted">
                    {palier.ajoute === palier.total ? (
                      <>
                        soit{" "}
                        <strong className="text-ink">
                          {palier.total.toLocaleString("fr-FR")} &euro;
                        </strong>
                      </>
                    ) : (
                      <>
                        s&rsquo;ajoute au palier précédent :{" "}
                        <strong className="text-ink">
                          +{palier.ajoute.toLocaleString("fr-FR")} &euro;
                        </strong>
                        , soit {palier.total.toLocaleString("fr-FR")} &euro; au
                        total
                      </>
                    )}
                  </p>
                </div>
                <ul className="mt-4 space-y-3">
                  {palier.taches.map((t) => (
                    <li
                      key={t.intitule}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"
                    >
                      <span className="max-w-xl">
                        <strong className="text-ink">{t.intitule}</strong>
                        <span className="block text-sm leading-relaxed text-muted">
                          {t.detail}
                        </span>
                      </span>
                      <span className="tabular-nums text-ink">
                        {t.prix.toLocaleString("fr-FR")} &euro;
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-hair pb-2">
                <h4 className="title text-lg">À la carte</h4>
                <p className="text-sm text-muted">une ligne au devis, chacune</p>
              </div>
              <ul className="mt-4 space-y-3">
                {OPTIONS.map((t) => (
                  <li
                    key={t.intitule}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"
                  >
                    <span className="max-w-xl">
                      <strong className="text-ink">{t.intitule}</strong>
                      <span className="block text-sm leading-relaxed text-muted">
                        {t.detail}
                      </span>
                    </span>
                    <span className="tabular-nums text-ink">
                      {t.prix.toLocaleString("fr-FR")} &euro;
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/*
          LES FAMILLES SANS PLANCHER.

          L'article L112-3 du Code de la consommation impose un mode de calcul
          pour TOUTE prestation dont le prix n'est pas calculable a l'avance,
          pas seulement pour celles ou l'on a une reference livree. Les
          applications mobiles et les traitements de donnees n'ont pas de
          plancher publie, faute de projet livre. Le mode de calcul publie est
          desormais la TACHE et non plus l'heure : le cadrage nomme chaque
          tache et lui attache un prix avant tout engagement, et ce cadrage est
          lui-meme une tache chiffree ci-dessus.
        */}
        <div className="mt-16">
          <h3 className="title text-2xl">Les autres prestations</h3>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">
            Les applications mobiles et les traitements de données ne portent pas
            de prix de départ, et c&rsquo;est volontaire : aucun projet de ces
            familles n&rsquo;a encore été livré, et publier un chiffre sans rien
            derrière serait une promesse que le premier devis contredirait.
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            Leur prix se calcule comme tout le reste :{" "}
            <strong className="text-ink">tâche par tâche</strong>. Le cadrage
            nomme chacune d&rsquo;elles et lui attache un prix avant que vous ne
            vous engagiez, de sorte que vous pouvez en retirer une, ou vous
            arrêter au cadrage. Ce montant est un prix total : la TVA
            n&rsquo;est pas applicable et rien ne s&rsquo;y ajoute.
          </p>
        </div>

        {/*
          MENTIONS SUBSTANTIELLES DE L'INVITATION A L'ACHAT.

          Des lors qu'une communication commerciale mentionne un prix et les
          caracteristiques du service, l'article L121-3 rend substantielles
          l'identite du vendeur, les modalites de paiement lorsqu'elles
          s'ecartent des usages, et l'existence du droit de retractation. Leur
          omission est une pratique commerciale trompeuse.
        */}
        <div className="blk-flat mt-10 p-6 text-sm leading-relaxed text-muted">
          <p>
            <strong className="text-ink">
              Qui vend, comment on paie, comment on annule.
            </strong>{" "}
            Ces prestations sont vendues par {SITE.legalMention}, {SITE.email}.
            Le contrat se forme à la signature du devis, accompagnée de
            l&rsquo;acompte qui y figure ; le solde est dû à trente jours à
            compter de la facture.
          </p>
          <p className="mt-3">
            Si vous êtes un particulier et que le devis est signé à distance,
            vous disposez d&rsquo;un délai de quatorze jours pour vous rétracter.
            Le formulaire à recopier figure dans les{" "}
            <a href="/legal/cgv">conditions générales de vente</a>, qui vous sont
            adressées avec chaque devis.
          </p>
        </div>
      </div>
    </section>
  );
}
