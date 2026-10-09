# Boutons et appels à l'action

Règle du 09/10/2026 : un bouton dit ce que le visiteur obtient, pas le geste qu'il fait. Test : « Je veux [libellé] » doit être une phrase naturelle, et le clic doit la tenir tout de suite. Les libellés partagés vivent dans `content/cta.ts`, la garde dans `lib/cta.test.ts`.

Stades : D = découverte, C = considération, X = décision.

## Inventaire avant et après

| Lieu | Stade | Avant | Après | Destination | Gain |
|---|---|---|---|---|---|
| En-tête, menu mobile | X | Démarrer un projet | Recevoir mon estimation | /commander | l'estimation que la page promet |
| En-tête, navigation | C | Contact | Une réponse sous 48 h | /contact | réponse écrite promise par la page, même négative |
| Accueil, hero principal | D | Démarrer un projet | Connaître les prix de départ | /tarifs | les planchers, sans engagement |
| Accueil, hero secondaire | D | Voir les services | Trouver mon type de projet | /services | les quatre familles |
| Cartes d'offre (accueil, Île-de-France) | C | En savoir plus, Voir le détail | Découvrir ce qui est livré | /offre/[slug] | la liste des livrables |
| Page offre | C | Commander ce type de projet | Recevoir mon estimation pour ce projet | /commander?offre= | estimation, offre préremplie |
| Cartes de tarifs (3) | C | Demander un devis | Recevoir mon estimation | /commander | estimation sous 48 h ouvrées |
| Tarifs, bas de page | C | Demander un devis | Estimer mon budget en cinq minutes | /commander | cinq étapes, cinq minutes (page commander) |
| Tarifs, secondaire | C | Questions fréquentes | Lire les réponses aux questions courantes | /questions | les réponses |
| Bandeau de fin de page (CtaBand) | X | Démarrer un projet | Recevoir mon estimation sous 48 h ouvrées | /commander | délai écrit sur /commander, /contact, /rendez-vous |
| Bandeau de fin, secondaire | X | l'adresse email | Parler de mon projet en 20 minutes | /rendez-vous | échange court, sans engagement ; l'email reste en lien texte |
| Barre mobile collante | X | Démarrer un projet | Mon estimation sous 48 h ouvrées | /commander | même promesse, forme courte |
| Pied de page | X | Démarrer un projet, Prendre rendez-vous, Contact | Recevoir mon estimation, Parler de mon projet en 20 minutes, Une réponse sous 48 h | idem | idem |
| Formulaire de commande, dernière étape | X | Envoyer la demande | Recevoir mon estimation sous 48 h ouvrées | envoi | l'estimation promise |
| Carnet (pied de page) | X | S'inscrire | Recevoir le carnet du studio | inscription | un email par mois |
| Contact, bouton principal | X | l'adresse email | Écrire au studio, réponse sous 48 h ouvrées | mailto | adresse et téléphone gardés en liens texte dessous |
| Contact, secondaire | X | le numéro | Obtenir ma réponse de vive voix | tel | numéro visible dessous |
| Contact, cartes | C | Décrire le projet, Voir les questions fréquentes | Recevoir mon estimation, Trouver ma réponse dans les questions courantes | /commander, /questions | |
| Rendez-vous | X | Appeler le 07..., Écrire un message | Caler mes vingt minutes au 07..., Demander mon créneau par écrit | tel, mailto | créneau |
| Maintenance | C | Parler d'un suivi, Budgets et délais | Faire estimer le suivi de mon site, Connaître les budgets et délais | /commander, /tarifs | |
| À propos | C | Voir les réalisations, Comment se déroule un projet | Juger sur des projets livrés, Comprendre le déroulé d'un projet | /references, /methode | |
| Studio ou agence | C | Comment ce studio travaille, Budgets et délais | Comprendre comment le studio travaille, Connaître les budgets et délais | /a-propos, /tarifs | |
| Étude de cas | C | Voir le site en ligne, Les autres réalisations | Visiter le site livré (nouvel onglet annoncé), Découvrir les autres projets livrés | site, /references | |
| Réalisations (accueil) | C | Voir le site | Visiter le site livré | site | |
| 404 | D | Retour à l'accueil, Décrire un projet | Repartir de l'accueil, Recevoir mon estimation | /, /commander | |
| Merci (après commande) | X | Retour à l'accueil, Voir les réalisations | Découvrir des projets livrés en attendant, Revenir à l'accueil | /references, / | |
| Inscription confirmée | X | Voir les réalisations du studio | Découvrir en attendant les projets livrés | /references | |
| Désinscription | X | Retirer mon adresse | Ne plus recevoir ces messages | action | |
| Bandeau de consentement, lien | D | En savoir plus | Lire ce qui est mesuré | /legal/confidentialite | |
| Email de confirmation | X | Confirmer mon inscription | Confirmer et recevoir le carnet | lien de confirmation | |
| Emails du carnet | C/X | Ce qui fait monter un prix ; Lire l'étude de cas (vers /references) ; Caler vingt minutes | Comprendre ce qui fait monter un prix ; Lire l'étude de cas du cabinet (vers /references/ohypnozen) ; Caler mes vingt minutes | idem | la destination tient désormais la promesse |

Gardés tels quels, parce que fonctionnels : Accepter et Refuser (consentement, poids égal exigé), Retour et Continuer (étapes du formulaire), Fermer le menu, accordéons de la FAQ, Payer ma facture (email transactionnel), cartes de navigation de l'accueil (titre de rubrique), liens de texte courant, Lire l'étude de cas, liens de navigation Services, Tarifs, Méthode, Réalisations.

## Contrastes mesurés

Calcul WCAG sur les couleurs calculées, 16 pages, clair et sombre, 1366 et 390 px (2 442 éléments).

| Élément | Avant | Après |
|---|---|---|
| `--faint` sombre sur `--surface` (surtitres du pied de page) | 4,47:1 | 5,05:1 (5,45:1 sur le papier) |
| Texte violet encre sur carte violette de /tarifs | 3,85:1 | 6,15:1 |
| Bouton plein, limite contre la page, clair | 2,88:1 | contour encre, 17:1 |
| Bouton contour, trait contre la page, clair / sombre | 2,1:1 / 2,7:1 | 4,6:1 / 5,45:1 |
| Anneau de focus violet sur papier clair | 2,88:1 | 4,69:1 (`--violet-encre`) |
| Texte du bouton plein (encre sur violet) | 6,15:1 | inchangé, le commentaire annonçait 8,1:1 à tort |

Le survol applique `brightness(1.04)` : le texte reste au-dessus de 6:1. Restent sans contour propre, par choix : les en-têtes d'accordéon de la FAQ (contenus dans une carte au contour 4,6:1) et la pastille d'étape du formulaire.

Aussi corrigés au passage : `id="contenu"` sur la page de connexion admin, cibles de 24 px dans le pied de page, `aside` pour la barre mobile, `scroll-padding` haut et bas.
