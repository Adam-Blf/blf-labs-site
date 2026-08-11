/**
 * Questions reellement posees par un prospect avant de commander.
 *
 * Regle de redaction : chaque reponse engage quelque chose de verifiable. Une
 * FAQ qui repond "cela depend de votre projet" a quatre reprises ne rassure
 * personne et ne sert qu'a remplir la page.
 *
 * IMPORTANT - AUCUN PRIX N'EST AFFICHE ICI POUR L'INSTANT. Les montants engagent
 * l'entreprise : ils doivent venir d'Adam, pas d'une estimation plausible. Des
 * que la grille tarifaire existe, remplacer la reponse "Combien coute un projet"
 * par les vrais planchers et retirer ce paragraphe.
 */
export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "Combien coûte un projet ?",
    answer:
      "Le devis est établi après le premier échange, puis fixé et signé avant que le développement commence : pas de facture surprise à la fin. Décrivez votre besoin dans le formulaire de commande, vous recevez une fourchette de budget en réponse.",
  },
  {
    question: "En combien de temps c'est livré ?",
    answer:
      "Deux à cinq semaines pour un site, un à trois mois pour une application, selon le périmètre convenu au cadrage. Vous recevez une version consultable en ligne dès les premiers jours, puis à chaque bloc terminé : vous ne découvrez jamais le résultat à la fin.",
  },
  {
    question: "À qui appartient le code une fois livré ?",
    answer:
      "À vous. Le dépôt de code, le nom de domaine et les accès d'hébergement sont mis à votre nom. Vous pouvez confier la suite à n'importe quel autre développeur sans rien demander à personne.",
  },
  {
    question: "Qui va travailler sur mon projet ?",
    answer:
      "Adam Beloucif, du premier échange à la mise en ligne. Aucune sous-traitance, aucun intermédiaire commercial : vous parlez toujours à la personne qui écrit le code.",
  },
  {
    question: "Que se passe-t-il après la mise en ligne ?",
    answer:
      "Ce qui ne fonctionne pas comme convenu au devis est repris sans supplément. Au-delà, la maintenance et les évolutions se font à la demande, sans engagement de durée imposée.",
  },
  {
    question: "Facturez-vous la TVA ?",
    answer:
      "Non. L'entreprise bénéficie de la franchise en base, article 293 B du Code général des impôts : le prix annoncé est le prix payé, il n'y a pas de TVA à ajouter.",
  },
  {
    question: "Travaillez-vous en dehors de l'Ile-de-France ?",
    answer:
      "Oui, partout. Le studio travaille entièrement à distance : cadrage en visioconférence, suivi en visio et par écrit, chaque version en ligne à une adresse que vous ouvrez quand vous voulez. Il n'y a pas de rendez-vous sur place, y compris en Ile-de-France, donc aucune contrainte géographique et aucun frais de déplacement.",
  },
];
