/**
 * Controle des identifiants d'entreprise francais.
 *
 * Pourquoi valider plutot que stocker tel quel : une facture qui porte un SIREN
 * faux est non conforme, et l'erreur ne se decouvre qu'au moment de
 * l'encaissement. Un controle de cle attrape immediatement la faute de frappe
 * la plus frequente, l'inversion de deux chiffres.
 *
 * Attention a la portee de ce controle : il verifie que le numero est
 * ARITHMETIQUEMENT valide, pas que l'entreprise existe. Seule une consultation
 * de la base Sirene le dirait, ce qui n'est pas fait ici.
 */

/** Cle de Luhn, utilisee par le SIREN (9 chiffres) et le SIRET (14 chiffres). */
export function isLuhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let double = false;

  // On parcourt de droite a gauche en doublant un chiffre sur deux.
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let value = Number(digits[i]);
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }

  return sum % 10 === 0;
}

/** Accepte un SIREN (9 chiffres) ou un SIRET (14 chiffres), espaces tolerees. */
export function isSirenOrSiret(value: string): boolean {
  const digits = value.replace(/\s/g, "");
  if (digits.length !== 9 && digits.length !== 14) return false;

  // Exception documentee : La Poste (356000000) ne respecte pas la cle de Luhn.
  if (digits === "356000000") return true;

  return isLuhnValid(digits);
}

/**
 * Numero de TVA intracommunautaire francais : FR + cle a 2 caracteres + SIREN.
 * Les numeros etrangers sont acceptes sur leur forme generale seulement, faute
 * de pouvoir verifier la cle de chaque pays.
 */
export function isVatNumber(value: string): boolean {
  const clean = value.replace(/\s/g, "").toUpperCase();

  if (clean.startsWith("FR")) {
    if (!/^FR[0-9A-Z]{2}\d{9}$/.test(clean)) return false;
    return isSirenOrSiret(clean.slice(4));
  }

  return /^[A-Z]{2}[0-9A-Z]{2,13}$/.test(clean);
}
