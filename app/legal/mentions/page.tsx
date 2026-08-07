import type { Metadata } from "next";
import { FULL_ADDRESS, SIRET_PRETTY, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions legales",
  // Une page legale n'a aucune raison d'etre indexee, elle capte des recherches
  // sans rapport avec l'activite.
  robots: { index: false, follow: true },
  alternates: { canonical: "/legal/mentions" },
};

export default function MentionsPage() {
  return (
    <article>
      <h1 className="title text-4xl md:text-5xl">Mentions legales</h1>
      <p>
        Informations publiees en application de l&rsquo;article 6 de la loi
        n&deg; 2004-575 du 21 juin 2004 pour la confiance dans l&rsquo;economie
        numerique.
      </p>

      <h2 className="title">Editeur du site</h2>
      <ul>
        <li>{SITE.legalMention}</li>
        <li>Forme juridique : {SITE.legalForm}</li>
        <li className="tabular">SIREN : {SITE.siren}</li>
        <li className="tabular">SIRET du siege : {SIRET_PRETTY}</li>
        <li>
          Code APE : {SITE.ape} ({SITE.apeLabel})
        </li>
        <li>Siege social : {FULL_ADDRESS}</li>
        <li>
          Courriel : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </li>
        <li>Directeur de la publication : Adam Beloucif</li>
      </ul>

      <h2 className="title">Taxe sur la valeur ajoutee</h2>
      <p>{SITE.vat}.</p>

      <h2 className="title">Hebergeur</h2>
      <ul>
        <li>{SITE.host.name}</li>
        <li>{SITE.host.address}</li>
        <li>
          <a href={SITE.host.url} target="_blank" rel="noopener noreferrer">
            {SITE.host.url}
          </a>
        </li>
      </ul>

      <h2 className="title">Mediation de la consommation</h2>
      <p>
        Conformement a l&rsquo;article L. 612-1 du Code de la consommation, tout
        consommateur peut recourir gratuitement a un mediateur en vue de la
        resolution amiable d&rsquo;un litige. Le mediateur retenu est{" "}
        {SITE.mediator.name} ({SITE.mediator.fullName}), {SITE.mediator.address},{" "}
        <a href={SITE.mediator.url} target="_blank" rel="noopener noreferrer">
          {SITE.mediator.url}
        </a>
        . La saisine du mediateur suppose qu&rsquo;une reclamation ecrite ait
        d&rsquo;abord ete adressee a l&rsquo;editeur et soit restee sans reponse
        satisfaisante.
      </p>

      <h2 className="title">Propriete intellectuelle</h2>
      <p>
        Les textes, le code source et les elements graphiques de ce site sont la
        propriete de son editeur, a l&rsquo;exception des marques et des
        realisations citees, qui restent la propriete de leurs titulaires
        respectifs. Les pictogrammes proviennent d&rsquo;Icons8. Les polices de
        caracteres Space Grotesk et Space Mono sont distribuees sous licence SIL
        Open Font.
      </p>

      <h2 className="title">Donnees personnelles</h2>
      <p>
        Le traitement des donnees transmises par le formulaire de commande est
        decrit dans la{" "}
        <a href="/legal/confidentialite">politique de confidentialite</a>.
      </p>
    </article>
  );
}
