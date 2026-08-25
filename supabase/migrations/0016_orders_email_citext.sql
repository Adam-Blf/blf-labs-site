-- `orders.email` etait en `text`, donc sensible a la casse, et la route
-- d'enregistrement insere l'adresse EXACTEMENT comme elle a ete tapee.
-- `contacts.email` est en `citext` et stocke en minuscules.
--
-- Consequence mesurable, trouvee en revue : le moteur de prospection compare
-- l'adresse d'un contact, forcement en minuscules, a `orders.email`. Pour
-- quelqu'un qui a tape « Jean@Exemple.fr », la comparaison ne trouve rien, donc
-- `dossierTranche` rend faux, donc la sequence de suivi CONTINUE de relancer un
-- client qui vient de signer, ou un dossier deja marque perdu. Exactement les
-- deux cas que cette fonction existe pour empecher.
--
-- Le correctif est le type, pas la requete. Ecrire `lower()` des deux cotes a
-- chaque appel marche jusqu'a ce qu'on oublie un appel ; et `ilike` serait pire
-- ici, le tiret bas est un joker en LIKE et c'est un caractere legal dans une
-- adresse email, donc `jean_dupont@x.fr` matcherait `jeanXdupont@x.fr`.
--
-- `citext` compare sans tenir compte de la casse et conserve la forme saisie,
-- ce qui est le comportement correct pour une adresse : on l'affiche telle que
-- la personne l'a ecrite, on la compare sans y penser.

alter table public.orders alter column email type citext;

-- L'index de limitation de debit porte sur l'empreinte d'IP, pas sur l'email,
-- il n'est pas affecte. Aucun index unique n'existe sur orders.email : une meme
-- personne a le droit de deposer plusieurs demandes.
