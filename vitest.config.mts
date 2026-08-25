import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Le depot n'avait pas de configuration de test : l'unique fichier existant
 * n'importait rien du projet, donc rien ne manquait. Des qu'un test touche a du
 * code applicatif, l'alias `@/` de tsconfig.json doit exister ici aussi, sinon
 * l'execution echoue sur le premier import alors que le typecheck, lui, passe.
 *
 * L'alias est donc declare une seconde fois, ce qui est le prix a payer : tsc
 * et vitest ne lisent pas la meme configuration. S'ils divergent, c'est ce
 * fichier qu'il faut aligner sur tsconfig.json, jamais l'inverse.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Perimetre explicite. Un `include` en `**` attrape les suites de tests des
    // dependances : la premiere version de ce fichier faisait tourner les 1900
    // tests de zod, dont quatorze echouaient faute de dependances de
    // developpement absentes. Vitest exclut node_modules par defaut, mais
    // redefinir `exclude` sans `**/node_modules/**` annule cette protection, y
    // compris pour les arborescences imbriquees comme .claude/worktrees.
    include: ["app/**/*.test.{ts,tsx}", "components/**/*.test.{ts,tsx}", "lib/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", ".next/**", ".claude/**"],
  },
});
