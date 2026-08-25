import type { Metadata } from "next";
import { FULL_ADDRESS, SITE } from "@/lib/site";

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
        fournies par {SITE.legalMention}. Les coordonnées complètes figurent
        dans les <a href="/legal/mentions">mentions légales</a>. Le
        formulaire de commande du site constitue une demande de devis : il
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
      {/*
        Les penalites des articles L. 441-10 et D. 441-5 relevent du Code de
        COMMERCE : elles regissent les relations entre professionnels. Opposees
        a un consommateur, elles n'ont aucun fondement, et une penalite sans
        fondement d'un tel montant releve de l'article R. 212-2, 3° du Code de
        la consommation, presume abusive. Le paragraphe est donc reserve aux
        seuls clients professionnels.
      */}
      <p>
        Les prix sont exprimés en euros. {SITE.vat}. Sauf mention différente au
        devis, le règlement intervient à trente jours à compter de la date de
        facture.
      </p>
      <p>
        <strong>Entre professionnels uniquement.</strong> Conformément aux
        articles L. 441-10 et D. 441-5 du Code de commerce, tout retard entraîne
        des pénalités au taux de trois fois le taux d&rsquo;intérêt légal, ainsi
        qu&rsquo;une indemnité forfaitaire de quarante euros pour frais de
        recouvrement. Ces pénalités ne sont pas applicables aux clients
        consommateurs et non-professionnels, pour lesquels le retard de paiement
        relève du droit commun.
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

      <h2 className="title">6. Recette, garantie et maintenance</h2>
      {/*
        TROIS OBLIGATIONS DISTINCTES, ET LES CONFONDRE REND LA CLAUSE
        INOPPOSABLE. Une premiere reecriture l'a appris a ses depens : elle
        disait « passe ce delai, les corrections font l'objet d'un devis
        distinct », ce qui REDUIT la garantie legale, gratuite pendant deux ans
        et d'ordre public. C'est la clause noire de l'article R. 212-1, 6°,
        presomption irrefragable, reputee non ecrite sans discussion possible.
        Cette version-la etait donc juridiquement PIRE que la clause illimitee
        qu'elle pretendait corriger.

        1. La RECETTE borne le perimetre du projet. Elle n'a aucun effet sur les
           garanties legales, et le texte doit le dire, sinon elle se lit comme
           une renonciation anticipee.
        2. La GARANTIE COMMERCIALE est de duree libre, mais l'article L. 217-22,
           rendu applicable au numerique par L. 224-25-27, impose d'en declarer
           le contenu, les modalites, le prix, la duree, l'etendue territoriale
           et l'identite du garant. S'il en manque un, elle reste due quand meme.
        3. La GARANTIE LEGALE est d'ordre public (L. 224-25-32) et couvre aussi
           les NON-PROFESSIONNELS (L. 224-25-31), donc les associations clientes,
           que ce document ne mentionnait nulle part.

        Pourquoi quatre-vingt-dix jours et non trente : pendant DOUZE mois, le
        client n'a qu'a etablir l'existence du defaut, pas sa date d'apparition
        (L. 224-25-16). Un defaut signale au 45e jour serait donc corrige
        gratuitement de toute facon. Trente jours ne reduisaient aucune charge
        reelle, ils en donnaient l'illusion. Le vrai levier est la RECETTE, qui
        borne le perimetre, pas la duree de la garantie.

        L'encadre reproduit plus bas n'est pas un ornement : l'article D. 211-3,
        issu du decret 2022-946, en impose la presence dans les conditions
        generales, et D. 217-5 le rend obligatoire dans tout contrat de garantie
        commerciale portant sur du numerique. Sa redaction est fixee par l'annexe
        au code : elle ne doit pas etre reformulee.
      */}
      <p>
        <strong>Recette.</strong> À la livraison, le client dispose de quinze
        jours pour vérifier la prestation et signaler par écrit les écarts avec
        le devis signé. Passé ce délai sans signalement, le périmètre livré est
        réputé accepté. Cette acceptation borne le périmètre du projet ; elle ne
        prive le client d&rsquo;aucune des garanties rappelées ci-dessous.
      </p>
      <p>
        <strong>Garantie commerciale.</strong> En complément des garanties
        légales, {SITE.legalMention} accorde une garantie commerciale{" "}
        <strong>gratuite de quatre-vingt-dix jours</strong> à compter de la
        livraison, valable sans limitation de territoire. Pendant cette durée, le
        prestataire corrige sans supplément, sur signalement écrit adressé à{" "}
        {SITE.email}, tout écart entre la prestation livrée et ce que le devis
        signé décrit. Le garant est {SITE.legalMention}, {FULL_ADDRESS},{" "}
        {SITE.email}, {SITE.phone}.
      </p>
      <p>
        <strong>Ce que la garantie commerciale ne couvre pas.</strong> Un besoin
        qui ne figurait pas au devis, un changement d&rsquo;avis sur une
        fonctionnalité validée, une modification du code, de la configuration ou
        des contenus réalisée par le client ou par un intervenant qu&rsquo;il a
        mandaté lorsqu&rsquo;elle est la cause du dysfonctionnement, ou la
        défaillance d&rsquo;un service tiers que le client a lui-même choisi ou
        qu&rsquo;il administre. Ces demandes restent possibles et font
        l&rsquo;objet d&rsquo;un devis distinct. Le client peut contester cette
        qualification ; à défaut d&rsquo;accord, il conserve l&rsquo;intégralité
        des voies de droit rappelées ci-dessous.
      </p>
      <p>
        <strong>Au-delà.</strong> Sous réserve des garanties légales, les
        évolutions fonctionnelles, les mises à jour techniques, la maintenance et
        l&rsquo;hébergement font l&rsquo;objet d&rsquo;un devis distinct ou
        d&rsquo;un contrat de maintenance.
      </p>
      <p>
        <strong>Articulation avec les garanties légales.</strong> Cette garantie
        commerciale s&rsquo;applique sans préjudice du droit du client
        consommateur ou non-professionnel de bénéficier de la garantie légale de
        conformité des articles L. 224-25-12 et suivants du Code de la
        consommation et de la garantie des vices cachés des articles 1641 à 1649
        du Code civil. Ces garanties légales sont d&rsquo;ordre public,
        s&rsquo;exercent sans frais pendant leur durée propre, et aucune
        stipulation des présentes ne les réduit ni ne les écarte. En cas de
        contradiction entre les présentes et une garantie légale, la garantie
        légale prévaut. Le client professionnel bénéficie du droit commun des
        contrats.
      </p>
      <div className="blk mt-6 p-5 text-sm">
        <p>
          Le consommateur dispose d&rsquo;un délai de deux ans à compter de la
          fourniture du contenu numérique ou du service numérique pour obtenir la
          mise en œuvre de la garantie légale de conformité en cas
          d&rsquo;apparition d&rsquo;un défaut de conformité. Durant un délai
          d&rsquo;un an à compter de la date de fourniture, le consommateur
          n&rsquo;est tenu d&rsquo;établir que l&rsquo;existence du défaut de
          conformité et non la date d&rsquo;apparition de celui-ci.
        </p>
        <p>
          La garantie légale de conformité emporte obligation de fournir toutes
          les mises à jour nécessaires au maintien de la conformité du contenu
          numérique ou du service numérique.
        </p>
        <p>
          La garantie légale de conformité donne au consommateur droit à la mise
          en conformité du contenu numérique ou du service numérique sans retard
          injustifié suivant sa demande, sans frais et sans inconvénient majeur
          pour lui.
        </p>
        <p>
          Le consommateur peut obtenir une réduction du prix en conservant le
          contenu numérique ou le service numérique ou il peut mettre fin au
          contrat en se faisant rembourser intégralement contre renoncement au
          contenu numérique ou au service numérique, si :
        </p>
        <p>
          1° Le professionnel refuse de mettre le contenu numérique ou le service
          numérique en conformité ;
          <br />
          2° La mise en conformité du contenu numérique ou du service numérique
          est retardée de manière injustifiée ;
          <br />
          3° La mise en conformité du contenu numérique ou du service numérique
          ne peut intervenir sans frais imposés au consommateur ;
          <br />
          4° La mise en conformité du contenu numérique ou du service numérique
          occasionne un inconvénient majeur pour le consommateur ;
          <br />
          5° La non-conformité du contenu numérique ou du service numérique
          persiste en dépit de la tentative de mise en conformité du
          professionnel restée infructueuse.
        </p>
        <p>
          Le consommateur a également droit à une réduction du prix ou à la
          résolution du contrat lorsque le défaut de conformité est si grave
          qu&rsquo;il justifie que la réduction du prix ou la résolution du
          contrat soit immédiate. Le consommateur n&rsquo;est alors pas tenu de
          demander la mise en conformité du contenu numérique ou du service
          numérique au préalable.
        </p>
        <p>
          Dans les cas où le défaut de conformité est mineur, le consommateur
          n&rsquo;a droit à l&rsquo;annulation du contrat que si le contrat ne
          prévoit pas le paiement d&rsquo;un prix.
        </p>
        <p>
          Toute période d&rsquo;indisponibilité du contenu numérique ou du
          service numérique en vue de sa remise en conformité suspend la garantie
          qui restait à courir jusqu&rsquo;à la fourniture du contenu numérique
          ou du service numérique de nouveau conforme.
        </p>
        <p>
          Les droits mentionnés ci-dessus résultent de l&rsquo;application des
          articles L. 224-25-1 à L. 224-25-31 du code de la consommation.
        </p>
        <p>
          Le professionnel qui fait obstacle de mauvaise foi à la mise en œuvre
          de la garantie légale de conformité encourt une amende civile
          d&rsquo;un montant maximal de 300 000 euros, qui peut être porté
          jusqu&rsquo;à 10 % du chiffre d&rsquo;affaires moyen annuel (article
          L. 242-18-1 du code de la consommation).
        </p>
        <p>
          Le consommateur bénéficie, en outre, de la garantie légale des vices
          cachés en application des articles 1641 à 1649 du code civil, pendant
          une durée de deux ans à compter de la découverte du défaut. Cette
          garantie donne droit à une réduction de prix si le contenu numérique ou
          le service numérique est conservé ou à un remboursement intégral contre
          renonciation au contenu numérique ou au service numérique.
        </p>
      </div>

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
      {/*
        LA VERSION PRECEDENTE ETAIT NULLE DE PLEIN DROIT, et c'etait un defaut
        plus grave que celui de la clause 6.

        Elle plafonnait la reparation au montant de la prestation, sans
        distinguer le client. Face a un consommateur, c'est la clause noire de
        l'article R. 212-1, 6° : reduire le droit a reparation du prejudice en
        cas de manquement du professionnel. Presomption IRREFRAGABLE, clause
        reputee non ecrite, aucune preuve contraire recevable. Et l'article
        R. 212-5 etend la meme solution aux NON-PROFESSIONNELS, donc aux
        associations clientes.

        Le plafond ne survit donc qu'entre professionnels, et encore : l'article
        1170 du Code civil repute non ecrite la clause qui prive de sa substance
        l'obligation essentielle du debiteur, et un plafond ne couvre jamais la
        faute lourde ni le dol.

        « Obligation de moyens » applique en bloc etait faux par ailleurs.
        Livrer un site conforme a un devis contre un prix ferme comporte une
        part d'obligation de RESULTAT. Le declarer en moyens face a un
        consommateur ne produisait aucun effet, et fournissait surtout la preuve
        d'une intention de reduire ses droits.
      */}
      <p>
        Le prestataire répond des manquements à ses obligations dans les
        conditions du droit commun. Il est tenu d&rsquo;une obligation de
        résultat sur la conformité des livrables au devis signé, et d&rsquo;une
        obligation de moyens sur les performances, le référencement et la
        disponibilité, qui dépendent de facteurs extérieurs.
      </p>
      <p>
        <strong>Clients professionnels.</strong> À leur égard uniquement, la
        responsabilité du prestataire est plafonnée au montant de la prestation
        concernée et ne couvre pas les dommages indirects tels qu&rsquo;une perte
        de chiffre d&rsquo;affaires. Ce plafond ne s&rsquo;applique ni en cas de
        faute lourde ou dolosive, ni en cas de dommage corporel.
      </p>
      <p>
        <strong>Clients consommateurs et non-professionnels.</strong> Aucune
        limitation de responsabilité ne leur est opposée. Le prestataire répond
        de l&rsquo;entier préjudice causé par un manquement à ses obligations,
        dans les conditions prévues par la loi.
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
