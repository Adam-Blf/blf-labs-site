import type { Metadata } from "next";
import { FULL_ADDRESS, SIRET_PRETTY, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  // Une page legale n'a aucune raison d'etre indexee, elle capte des recherches
  // sans rapport avec l'activite.
  alternates: { canonical: "/legal/mentions" },
};

export default function MentionsPage() {
  return (
    <article>
      <h1 className="title text-4xl md:text-5xl">Mentions légales</h1>
      <p>
        Informations publiées en application de l&rsquo;article 6 de la loi
        n&deg; 2004-575 du 21 juin 2004 pour la confiance dans l&rsquo;économie
        numérique.
      </p>

      <h2 className="title">Éditeur du site</h2>
      <ul>
        <li>{SITE.legalMention}</li>
        <li>Forme juridique : {SITE.legalForm}</li>
        <li className="tabular">SIREN : {SITE.siren}</li>
        <li className="tabular">SIRET du siège : {SIRET_PRETTY}</li>
        <li>Siège social : {FULL_ADDRESS}</li>
        <li>
          Courriel : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </li>
        <li className="tabular">
          Téléphone :{" "}
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
        </li>
        <li>Directeur de la publication : Adam Beloucif</li>
      </ul>

      <h2 className="title">Taxe sur la valeur ajoutée</h2>
      <p>{SITE.vat}.</p>

      <h2 className="title">Hébergeur</h2>
      <ul>
        <li>{SITE.host.name}</li>
        <li>{SITE.host.address}</li>
        <li>
          <a href={SITE.host.url} target="_blank" rel="noopener noreferrer">
            {SITE.host.url}
          </a>
        </li>
      </ul>

      <h2 className="title">Médiation de la consommation</h2>
      <p>
        Conformément à l&rsquo;article L. 612-1 du Code de la consommation, tout
        consommateur peut recourir gratuitement à un médiateur en vue de la
        résolution amiable d&rsquo;un litige. Le médiateur retenu est{" "}
        {SITE.mediator.name} ({SITE.mediator.fullName}), {SITE.mediator.address},{" "}
        <a href={SITE.mediator.url} target="_blank" rel="noopener noreferrer">
          {SITE.mediator.url}
        </a>
        . La saisine du médiateur suppose qu&rsquo;une réclamation écrite ait
        d&rsquo;abord été adressée à l&rsquo;éditeur et soit restée sans réponse
        satisfaisante.
      </p>

      <h2 className="title">Propriété intellectuelle</h2>
      <p>
        Les textes, le code source et les éléments graphiques de ce site sont la
        propriété de son éditeur, à l&rsquo;exception des marques et des
        réalisations citées, qui restent la propriété de leurs titulaires
        respectifs. Les pictogrammes proviennent d&rsquo;Icons8. Les polices de
        caractères Space Grotesk et Space Mono sont distribuées sous licence SIL
        Open Font.
      </p>

      <h2 className="title">Données personnelles</h2>
      <p>
        Le traitement des données transmises par le formulaire de commande est
        décrit dans la{" "}
        <a href="/legal/confidentialite">politique de confidentialité</a>.
      </p>
    </article>
  );
}
