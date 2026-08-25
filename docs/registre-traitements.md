# Registre des activites de traitement

Tenu au titre de l'article 30 du reglement general sur la protection des
donnees. L'exemption prevue pour les structures de moins de 250 salaries ne
s'applique pas : la prospection commerciale n'est pas un traitement occasionnel.

**Responsable de traitement** : Adam Beloucif, entrepreneur individuel exercant
sous le nom commercial BLF Lab's, SIRET 108 386 855 00010, 6 impasse Edouard
Vaillant, 94550 Chevilly-Larue. Contact : adam@beloucif.com.

Derniere mise a jour : 2026-08-25.

---

## Fiche 1 - Demandes de devis

| | |
|---|---|
| Finalite | Repondre a une demande de projet et, le cas echeant, etablir un devis. Comprend un suivi automatise de trois messages au maximum. |
| Base legale | Article 6.1.b, mesures precontractuelles prises a la demande de la personne. |
| Personnes concernees | Toute personne remplissant le formulaire de commande. |
| Donnees | Nom, adresse email, telephone et organisation si fournis, type de projet, budget envisage, echeance, description du besoin, horodatage de l'accord. Pour un client professionnel : raison sociale, SIREN, numero de TVA, adresse de facturation. |
| Donnees techniques | Empreinte SHA-256 salee de l'adresse IP et type de navigateur, finalite distincte, voir fiche 3. |
| Destinataires | Le responsable de traitement seul. |
| Sous-traitants | Vercel Inc. (hebergement), Supabase (base de donnees, Union europeenne), Resend (acheminement des emails, region Irlande). |
| Transferts hors UE | Journaux techniques Vercel, encadres par la certification au cadre de protection des donnees UE - Etats-Unis. |
| Conservation | Trois ans a compter du dernier contact. Les dossiers aboutissant a un contrat suivent les obligations comptables. |
| Securite | Chiffrement en transit, RLS active sur toutes les tables, acces au back-office par mot de passe et double authentification TOTP obligatoire. |
| Table | `public.orders` |

## Fiche 2 - Prospection commerciale par email

| | |
|---|---|
| Finalite | Adresser des informations et propositions commerciales par email. |
| Base legale | Deux regimes, jamais melanges. **Interet legitime, article 6.1.f du RGPD**, pour toute adresse PROFESSIONNELLE dont la fonction est liee a l'offre proposee : l'article L.34-5 du CPCE n'exige le consentement prealable que pour les coordonnees d'une personne physique, et la doctrine de la CNIL admet l'interet legitime des lors que l'objet de la sollicitation est en rapport avec la profession de la personne demarchee. **Consentement, article 6.1.a**, pour toute adresse non professionnelle. La nature juridique de la structure est relevee et conservee (colonne `nature_juridique`), parce qu'un SIREN seul ne dit pas si l'on ecrit a une personne morale ou a une entreprise individuelle, qui est une personne physique. |
| Personnes concernees | Personnes ayant coche la case dediee, et representants de structures dont l'adresse generique est publique. |
| Donnees | Adresse email, nom et organisation si fournis, SIREN, nature juridique INSEE et statut de diffusion Sirene pour le regime professionnel, horodatage du consentement, texte exact affiche, version de la politique de confidentialite, page d'origine, empreinte d'adresse IP, agent utilisateur, date de derniere interaction. |
| Preuve de consentement | Table `public.contact_consents`, en ajout seul. Un declencheur en base refuse toute modification d'une preuve enregistree. |
| Destinataires | Le responsable de traitement seul. Aucune cession, aucune location de fichier. |
| Sous-traitant | Resend, article 28 du RGPD. |
| Conservation | Trois ans a compter de la derniere interaction, ouverture ou clic. Au-dela, le consentement est repute caduc et l'adresse est retiree. |
| Droit d'opposition | Lien de retrait en un clic dans chaque message, plus en-tetes `List-Unsubscribe` et `List-Unsubscribe-Post` conformes a la RFC 8058. Traitement immediat. Le droit est en outre annonce dans un paragraphe DISTINCT du premier message, comme l'exige l'article 21.4. |
| Opposition deja exercee en amont | Le statut de diffusion Sirene est releve a la collecte et conserve. Une unite en diffusion partielle (`P`) s'est opposee aupres de l'INSEE a la publication de ses donnees : la contrainte `contacts_b2b_strict` refuse en base son enregistrement sous le regime sans consentement prealable. Il n'existe plus de statut `N` : toutes les unites anciennement non diffusibles ont ete basculees en `P`, donc le test est `= 'O'` et jamais `<> 'N'`. Le statut se rafraichit avant chaque campagne. |
| Information article 14 | Delivree dans le PREMIER message, comme l'impose l'article 14.3.b lorsque la donnee sert a communiquer avec la personne : origine de l'adresse, finalite, base legale, duree de conservation, droits, et lien vers la politique de confidentialite. |
| Tables | `public.contacts`, `public.contact_consents`, `public.enrollments`, `public.email_sends`, `public.email_events` |

## Fiche 3 - Liste de suppression

| | |
|---|---|
| Finalite | Ne plus jamais solliciter une personne qui s'est opposee. |
| Base legale | Obligation legale, article 6.1.c, decoulant du droit d'opposition de l'article 21. |
| Donnees | Adresse email, motif du retrait, date. Rien d'autre. |
| Conservation | Tant que le traitement de prospection existe. Effacer cette liste reviendrait a perdre la trace de l'opposition, donc a la violer. |
| Table | `public.suppression_list`, en lecture seule depuis le back-office. |

## Fiche 4 - Limitation des envois automatises

| | |
|---|---|
| Finalite | Empecher un automate de saturer les formulaires du site. |
| Base legale | Interet legitime, article 6.1.f. |
| Donnees | Empreinte SHA-256 salee de l'adresse IP, type de navigateur. L'adresse IP n'est jamais enregistree en clair. |
| Conservation | Une heure pour la fenetre de limitation. |

---

## Analyse d'impact

Aucune analyse d'impact au titre de l'article 35 n'est requise en l'etat : pas
de donnees sensibles, pas de profilage automatise produisant des effets
juridiques, pas de surveillance systematique, et des volumes modestes. A
reevaluer si le dispositif evolue vers du score comportemental ou un
enrichissement massif de donnees tierces.

## Regle interne sur l'origine des adresses

**Aucune adresse issue d'un fichier achete, d'un extracteur automatique ou d'un
reseau social ne sert a un premier email de prospection.** Le caractere
publiquement accessible d'une donnee n'a jamais dispense du RGPD, et la position
de la CNIL sur la reutilisation de donnees publiquement accessibles a des fins de
demarchage est constante.

La seule origine admise pour le regime professionnel est l'adresse **generique**
publiee par la structure elle-meme sur son propre site, ou la base SIRENE de
l'INSEE, sous licence ouverte, pour la partie personne morale. Cette origine est
citee dans le premier message au titre de l'article 14 du RGPD, puisque la donnee
ne vient pas de la personne.

Cette regle est portee par la base, pas seulement par ce document : la contrainte
`contacts_b2b_strict` de la migration `0012_prospection.sql` refuse une adresse
nominative en regime professionnel, et exige un SIREN. Un import fait sans y
penser echoue au lieu de passer.

## A produire en cas de controle

1. Ce registre, a jour.
2. La preuve de consentement horodatee pour chaque destinataire actif, extraite
   de `contact_consents`, avec le texte exact affiche au moment du recueil.
3. La politique de confidentialite en vigueur et la date de sa mise en ligne.
4. La procedure de desinscription et la preuve qu'elle fonctionne : la table
   `suppression_list` et les tests de `lib/prospection/jeton.test.ts`.
5. Le contrat de sous-traitance avec Resend au titre de l'article 28.
6. Pour le regime professionnel, l'analyse d'interet legitime ecrite, en balance
   avec les droits des personnes.

## Limite

Ce document est une base de travail redigee en conformite par construction, pas
un avis juridique. Deux points restent a faire valider par un professionnel du
droit avant montee en volume : la region de traitement effective chez Resend, qui
determine s'il existe un transfert hors Union europeenne a documenter, et la
redaction de l'analyse d'interet legitime pour le regime professionnel.
