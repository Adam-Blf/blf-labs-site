import type { Metadata } from "next";
import { ConsentControls } from "@/components/analytics/ConsentControls";
import { FULL_ADDRESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: { canonical: "/legal/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <article>
      <h1 className="title text-4xl md:text-5xl">
        Politique de confidentialité
      </h1>
      <p>
        Ce site collecte le minimum de données nécessaire pour répondre à une
        demande de projet. Il n&rsquo;utilise aucun traceur publicitaire et ne
        revend rien. La seule mesure d&rsquo;audience présente est soumise à
        votre accord préalable, et le site fonctionne à l&rsquo;identique si
        vous le refusez.
      </p>

      <h2 className="title">Mesure d&rsquo;audience</h2>
      <p>
        Le site utilise Google Analytics 4 pour compter les visites et savoir
        quelles pages sont réellement consultées.
      </p>
      <ul>
        <li>
          <strong>Finalité</strong> : mesurer la fréquentation, sans profilage
          publicitaire. Les signaux publicitaires de Google sont désactivés.
        </li>
        <li>
          <strong>Base légale</strong> : votre consentement, article 6.1.a du
          RGPD et article 82 de la loi Informatique et Libertés.
        </li>
        <li>
          <strong>Dépôt</strong> : aucun cookie de mesure n&rsquo;est déposé et
          aucune requête n&rsquo;est envoyée à Google tant que vous
          n&rsquo;avez pas accepté. Refuser est aussi simple qu&rsquo;accepter.
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
      <p>
        Vous pouvez revenir sur votre choix à tout moment, sans justification :
      </p>
      <ConsentControls />

      <h2 className="title">Responsable du traitement</h2>
      <p>
        {SITE.legalMention}, {FULL_ADDRESS}. Contact :{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2 className="title">Données collectees</h2>
      <p>Uniquement via le formulaire de commande :</p>
      <ul>
        <li>Nom, adresse email, et si vous les indiquez, telephone et organisation.</li>
        <li>Type de projet, budget envisage, échéance et description du besoin.</li>
        <li>Date et heure de votre accord.</li>
        <li>
          Une empreinte technique irreversible de votre adresse IP, ainsi que le
          type de navigateur. L&rsquo;adresse IP elle-même n&rsquo;est jamais
          enregistree : seule une empreinte SHA-256 salee est conservee, ce qui
          permet de limiter les envois automatises sans permettre de vous
          identifier.
        </li>
      </ul>

      <h2 className="title">Finalité et base légale</h2>
      <p>
        Le nom, l&rsquo;adresse électronique, le téléphone, l&rsquo;organisation
        et la description du besoin servent exclusivement à répondre à votre
        demande et, le cas échéant, à établir un devis. La base légale est
        l&rsquo;exécution de mesures précontractuelles prises à votre demande,
        au sens de l&rsquo;article 6.1.b du règlement général sur la protection
        des données. Ces informations ne sont ni revendues, ni utilisées pour de
        la prospection, ni transmises à des tiers à des fins commerciales.
      </p>
      <p>
        L&rsquo;empreinte technique de l&rsquo;adresse IP et le type de
        navigateur relèvent d&rsquo;une finalité distincte : limiter les envois
        automatisés du formulaire. La base légale en est l&rsquo;intérêt
        légitime de l&rsquo;éditeur à se protéger contre les abus, au sens de
        l&rsquo;article 6.1.f du même règlement. L&rsquo;adresse IP n&rsquo;est
        jamais enregistrée en clair : seule une empreinte calculée avec un
        secret non public est conservée, et elle ne sert qu&rsquo;à cette
        vérification.
      </p>

      <h2 className="title">Durée de conservation</h2>
      <p>
        Trois ans à compter du dernier contact pour les informations liées à
        votre demande, durée usuelle pour un dossier de prospection. Les
        demandes qui donnent lieu à un contrat sont conservées selon les
        obligations comptables applicables. Vous pouvez demander la suppression
        à tout moment.
      </p>
      <p>
        L&rsquo;empreinte d&rsquo;adresse IP et le type de navigateur suivent
        une durée distincte, bien plus courte : celle de la fenêtre de
        limitation, soit une heure. Les conserver plus longtemps
        n&rsquo;apporterait rien à la finalité qui les justifie.
      </p>

      <h2 className="title">Destinataires et sous-traitants</h2>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> héberge le site. La durée de conservation
          de ses journaux techniques est celle fixée par sa propre politique de
          confidentialité, consultable à l&rsquo;adresse{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            vercel.com/legal/privacy-policy
          </a>
          .
        </li>
        <li>
          <strong>Supabase</strong> héberge la base de données des demandes, sur
          une infrastructure située dans l&rsquo;Union européenne.
        </li>
        <li>
          <strong>Resend</strong> achemine les messages de notification et
          d&rsquo;accusé de réception, depuis la région Irlande.
        </li>
      </ul>

      <h2 className="title">Transferts hors de l&rsquo;Union européenne</h2>
      <p>
        Le stockage des demandes reste hébergé dans l&rsquo;Union européenne et
        ne fait l&rsquo;objet d&rsquo;aucun transfert. En revanche, Vercel Inc.
        est une société établie aux États-Unis : les journaux techniques de
        connexion, dont l&rsquo;adresse IP avant tout traitement par le site,
        sont donc transférés hors de l&rsquo;Union européenne. Ce transfert est
        encadré par la certification de Vercel Inc. au titre du cadre
        transatlantique de protection des données, reconnu par une décision
        d&rsquo;adéquation de la Commission européenne au sens de
        l&rsquo;article 45 du règlement général sur la protection des données.
      </p>

      <h2 className="title">Vos droits</h2>
      <p>
        Vous disposez d&rsquo;un droit d&rsquo;accès, de rectification,
        d&rsquo;effacement, de limitation et d&rsquo;opposition, ainsi que
        d&rsquo;un droit a la portabilite de vos données. Pour les exercer,
        ecrivez a <a href={`mailto:${SITE.email}`}>{SITE.email}</a> ; une reponse
        vous sera apportee sous un mois. Si la reponse ne vous satisfait pas,
        vous pouvez saisir la Commission nationale de l&rsquo;informatique et des
        libertes,{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        .
      </p>

      <h2 className="title">Sécurité</h2>
      <p>
        Les demandes sont stockees dans une base dont les règles
        d&rsquo;accès interdisent toute lecture anonyme. L&rsquo;accès est
        reserve a l&rsquo;éditeur, après authentification. Les echanges avec le
        site sont chiffres par TLS.
      </p>
    </article>
  );
}
