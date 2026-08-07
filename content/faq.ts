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
    question: "Combien coute un projet ?",
    answer:
      "Le devis est etabli apres le premier echange, puis fixe et signe avant que le developpement commence : pas de facture surprise a la fin. Decrivez votre besoin dans le formulaire de commande, vous recevez une fourchette de budget en reponse.",
  },
  {
    question: "En combien de temps c'est livre ?",
    answer:
      "Deux a cinq semaines pour un site, un a trois mois pour une application, selon le perimetre convenu au cadrage. Vous recevez une version consultable en ligne des les premiers jours, puis a chaque bloc termine : vous ne decouvrez jamais le resultat a la fin.",
  },
  {
    question: "A qui appartient le code une fois livre ?",
    answer:
      "A vous. Le depot de code, le nom de domaine et les acces d'hebergement sont mis a votre nom. Vous pouvez confier la suite a n'importe quel autre developpeur sans rien demander a personne.",
  },
  {
    question: "Qui va travailler sur mon projet ?",
    answer:
      "Adam Beloucif, du premier echange a la mise en ligne. Aucune sous-traitance, aucun intermediaire commercial : vous parlez toujours a la personne qui ecrit le code.",
  },
  {
    question: "Que se passe-t-il apres la mise en ligne ?",
    answer:
      "Ce qui ne fonctionne pas comme convenu au devis est repris sans supplement. Au dela, la maintenance et les evolutions se font a la demande, sans engagement de duree impose.",
  },
  {
    question: "Facturez-vous la TVA ?",
    answer:
      "Non. L'entreprise beneficie de la franchise en base, article 293 B du Code general des impots : le prix annonce est le prix paye, il n'y a pas de TVA a ajouter.",
  },
  {
    question: "Travaillez-vous en dehors de l'Ile-de-France ?",
    answer:
      "Oui. Le suivi se fait en visio et par ecrit, ce qui n'impose aucune contrainte geographique. Les rendez-vous sur place restent possibles en Ile-de-France.",
  },
];
