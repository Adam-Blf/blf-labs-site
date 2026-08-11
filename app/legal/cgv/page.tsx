import type { Metadata } from "next";
import { FULL_ADDRESS, SIRET_PRETTY, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  alternates: { canonical: "/legal/cgv" },
};

export default function CgvPage() {
  return (
    <article>
      <h1 className="title text-4xl md:text-5xl">
        Conditions générales de vente
      </h1>
      <p>
        Ces conditions s&rsquo;appliquent aux prestations de développement
        fournies par {SITE.legalMention}, {FULL_ADDRESS}, SIRET {SIRET_PRETTY}.
        Le formulaire de commande du site constitue une demande de devis : il
        n&rsquo;emporte aucun engagement tant qu&rsquo;un devis n&rsquo;a pas été
        signé par les deux parties.
      </p>

      <h2 className="title">1. Prestations</h2>
      <p>
        Conception, développement, mise en ligne et maintenance de sites,
        d&rsquo;applications web et mobiles, et d&rsquo;outils de traitement de
        données. Le périmètre exact, les livrables et le calendrier figurent au
        devis, qui prévaut sur toute description générale du site.
      </p>

      <h2 className="title">2. Devis et commande</h2>
      <p>
        Chaque devis précise le prix, le délai et le contenu de la prestation. Il
        est valable trente jours. La commande est ferme à compter de la signature
        du devis et du versement de l&rsquo;acompte qui y est indiqué.
      </p>

      <h2 className="title">3. Prix et paiement</h2>
      <p>
        Les prix sont exprimés en euros. {SITE.vat}. Sauf mention différente au
        devis, le règlement intervient à trente jours à compter de la date de
        facture. Conformément aux articles L. 441-10 et D. 441-5 du Code de
        commerce, tout retard entraîne des pénalités au taux de trois fois le
        taux d&rsquo;intérêt légal, ainsi qu&rsquo;une indemnité forfaitaire de
        quarante euros pour frais de recouvrement.
      </p>

      <h2 className="title">4. Obligations du client</h2>
      <p>
        Le client fournit en temps utile les contenus, accès et validations
        nécessaires. Tout retard de sa part décale le calendrier à due
        concurrence. Il garantit détenir les droits sur les éléments
        qu&rsquo;il transmet.
      </p>

      <h2 className="title">5. Propriété intellectuelle</h2>
      <p>
        Les droits sur les livrables spécifiques sont cédés au client au
        paiement intégral du prix. Les composants génériques et les
        bibliothèques tierces restent régis par leurs licences respectives. Le
        prestataire conserve le droit de citer la prestation à titre de
        référence, sauf demande contraire écrite du client.
      </p>

      <h2 className="title">6. Garantie et maintenance</h2>
      <p>
        Les non-conformités au devis signalées après la livraison sont corrigées
        sans supplément. Les évolutions fonctionnelles, la maintenance et
        l&rsquo;hébergement font l&rsquo;objet d&rsquo;un accord distinct.
      </p>

      <h2 className="title">7. Droit de rétractation</h2>
      <p>
        Le consommateur au sens du Code de la consommation dispose d&rsquo;un
        délai de quatorze jours pour se rétracter d&rsquo;un contrat conclu à
        distance, conformément à l&rsquo;article L. 221-18. S&rsquo;il demande
        expressément que la prestation commence avant la fin de ce délai, il
        reste redevable du travail déjà réalisé en cas de rétractation. Ce droit
        ne s&rsquo;applique pas aux contrats conclus entre professionnels.
      </p>
      {/*
        Le formulaire type n'est pas une formalite de confort : l'article
        L. 221-5 7° impose de le FOURNIR, et son absence porte le delai de
        retractation de quatorze jours a douze mois (L. 221-20), en plus d'une
        amende administrative. Sans lui, un client particulier pouvait annuler
        un projet livre depuis onze mois.

        Le texte reprend le modele annexe a l'article R. 221-1, dont la
        redaction est imposee et ne doit donc pas etre reformulee.
      */}
      <p className="blk mt-6 p-5 text-sm">
        <strong>Formulaire type de rétractation</strong> (annexe à
        l&rsquo;article R. 221-1 du Code de la consommation), à recopier et à
        envoyer à {SITE.email} :
        <br />
        <br />
        <em>
          &laquo;&nbsp;À l&rsquo;attention de {SITE.legalMention},{" "}
          {FULL_ADDRESS}, {SITE.email} : je vous notifie par la présente ma
          rétractation du contrat portant sur la prestation de services
          ci-dessous : … . Commandé le … . Nom du consommateur : … . Adresse du
          consommateur : … . Signature du consommateur, uniquement en cas de
          notification du présent formulaire sur papier : … . Date :
          … .&nbsp;&raquo;
        </em>
      </p>
      <p>
        Ce formulaire est également rappelé sur chaque devis adressé à un
        client particulier : le contrat se noue à la signature du devis, et
        c&rsquo;est donc ce document qui doit porter l&rsquo;information avant
        que le client soit lié.
      </p>

      <h2 className="title">8. Responsabilité</h2>
      <p>
        Le prestataire est tenu d&rsquo;une obligation de moyens. Sa
        responsabilité est plafonnée au montant de la prestation concernée et ne
        couvre pas les dommages indirects tels que perte de chiffre
        d&rsquo;affaires ou de données imputable à un tiers ou au client.
      </p>

      <h2 className="title">9. Données personnelles</h2>
      <p>
        Le traitement des données du client est décrit dans la{" "}
        <a href="/legal/confidentialite">politique de confidentialité</a>. Lorsque
        la prestation conduit le prestataire à traiter des données pour le compte
        du client, un accord de sous-traitance conforme à l&rsquo;article 28 du
        règlement général sur la protection des données est conclu.
      </p>

      <h2 className="title">10. Médiation et droit applicable</h2>
      <p>
        Conformément à l&rsquo;article L. 612-1 du Code de la consommation, le
        consommateur peut recourir gratuitement au médiateur{" "}
        {SITE.mediator.name}, {SITE.mediator.address},{" "}
        <a href={SITE.mediator.url} target="_blank" rel="noopener noreferrer">
          {SITE.mediator.url}
        </a>
        , après avoir adressé une réclamation écrite restée sans réponse
        satisfaisante. Les présentes conditions sont soumises au droit français.
      </p>
    </article>
  );
}
