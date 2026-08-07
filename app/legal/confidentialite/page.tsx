import type { Metadata } from "next";
import { FULL_ADDRESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialite",
  robots: { index: false, follow: true },
  alternates: { canonical: "/legal/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <article>
      <h1 className="title text-4xl md:text-5xl">
        Politique de confidentialité
      </h1>
      <p>
        Ce site collecte le minimum de données nécessaire pour répondre a une
        demande de projet. Il n&rsquo;utilise ni traceur publicitaire, ni mesure
        d&rsquo;audience, ni service tiers charge depuis le navigateur : aucun
        bandeau cookies n&rsquo;est donc nécessaire, faute de cookie a consentir.
      </p>

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

      <h2 className="title">Finalite et base légale</h2>
      <p>
        Ces données servent exclusivement a répondre a votre demande et, le cas
        echeant, a etablir un devis. La base légale est l&rsquo;execution de
        mesures precontractuelles prises a votre demande, au sens de
        l&rsquo;article 6.1.b du règlement général sur la protection des données.
        Elles ne sont ni revendues, ni utilisees pour de la prospection, ni
        transmises a des tiers a des fins commerciales.
      </p>

      <h2 className="title">Duree de conservation</h2>
      <p>
        Trois ans a compter du dernier contact, duree usuelle pour un dossier de
        prospection. Les demandes qui donnent lieu a un contrat sont conservees
        selon les obligations comptables applicables. Vous pouvez demander la
        suppression a tout moment.
      </p>

      <h2 className="title">Destinataires et sous-traitants</h2>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> hébergé le site. Les journaux techniques
          sont conserves de façon limitee dans le temps.
        </li>
        <li>
          <strong>Supabase</strong> hébergé la base de données des demandes, sur
          une infrastructure situee dans l&rsquo;Union europeenne.
        </li>
        <li>
          <strong>Resend</strong> achemine les emails de notification et
          d&rsquo;accuse de reception, depuis la region Irlande.
        </li>
      </ul>
      <p>
        Aucun transfert de données en dehors de l&rsquo;Union europeenne
        n&rsquo;est effectue pour le stockage des demandes.
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
