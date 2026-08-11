import type { Metadata } from "next";
import Link from "next/link";
import { ConsentControls } from "@/components/analytics/ConsentControls";
import { SITE } from "@/lib/site";

/**
 * Politique de gestion des traceurs.
 *
 * A savoir avant de lire : cette page N'EST PAS obligatoire. La CNIL
 * n'impose pas de page dediee, une politique integree a la confidentialite
 * suffit, et c'etait deja le cas ici. Verifie avant de l'ecrire.
 *
 * Elle existe pour une raison pratique : le retrait du consentement doit etre
 * aussi simple que son octroi, et une adresse dediee est plus facile a donner
 * et a retrouver qu'un paragraphe au milieu d'une longue page. C'est aussi la
 * page vers laquelle pointer depuis un pied de page ou un email.
 *
 * Elle ne duplique pas la politique de confidentialite : elle traite le seul
 * sujet des traceurs et renvoie vers elle pour le reste.
 */
export const metadata: Metadata = {
  title: "Gestion des traceurs",
  description:
    "Quels traceurs ce site dépose, à quelle condition, et comment revenir sur votre choix à tout moment.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiesPage() {
  return (
    <article>
      <h1 className="title text-4xl md:text-5xl">Gestion des traceurs</h1>

      <p>
        Ce site ne dépose aucun traceur publicitaire et ne revend aucune
        donnée. La seule mesure présente est une mesure de fréquentation, et
        elle est soumise à votre accord préalable.
      </p>

      <h2 className="title">Ce qui fonctionne sans aucun accord</h2>
      <p>
        Deux informations sont conservées dans votre navigateur, et elles
        n&rsquo;en sortent jamais : le thème clair ou sombre que vous avez
        choisi, et votre réponse à la demande de consentement elle-même. Elles
        ne servent qu&rsquo;à ne pas vous reposer la question à chaque page, ne
        permettent pas de vous identifier, et ne sont transmises à personne.
        Elles relèvent de l&rsquo;exemption prévue pour les traceurs
        strictement nécessaires.
      </p>

      <h2 className="title">Ce qui attend votre accord</h2>
      <p>
        La mesure d&rsquo;audience, assurée par Google Analytics 4. Tant que
        vous n&rsquo;avez pas accepté, <strong>aucune requête</strong> n&rsquo;est
        envoyée à Google : le script n&rsquo;est pas chargé du tout. Ce
        n&rsquo;est pas le mode « consentement refusé » de Google, qui
        télécharge quand même sa bibliothèque.
      </p>
      <p>
        La carte de la zone d&rsquo;intervention, fournie par Google Maps, suit
        la même règle et ne se charge qu&rsquo;au clic.
      </p>
      <ul>
        <li>
          <strong>Finalité</strong> : compter les visites et savoir quelles
          pages sont réellement consultées. Aucun profilage publicitaire, les
          signaux publicitaires de Google sont désactivés.
        </li>
        <li>
          <strong>Base légale</strong> : votre consentement, article 6.1.a du
          RGPD et article 82 de la loi Informatique et Libertés.
        </li>
        <li>
          <strong>Destinataire</strong> : Google Ireland Limited, en qualité de
          sous-traitant.
        </li>
        <li>
          <strong>Durée</strong> : 14 mois au maximum, conformément à la
          recommandation de la CNIL.
        </li>
      </ul>

      <h2 className="title">Revenir sur votre choix</h2>
      <p>
        À tout moment, sans justification, et aussi simplement que vous
        l&rsquo;avez donné :
      </p>
      <ConsentControls />

      <h2 className="title">Le reste</h2>
      <p>
        Les données que vous transmettez par le formulaire de commande, leur
        durée de conservation et vos droits d&rsquo;accès et
        d&rsquo;effacement sont décrits dans la{" "}
        <Link href="/legal/confidentialite">politique de confidentialité</Link>.
        Pour toute question, écrivez à{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </article>
  );
}
