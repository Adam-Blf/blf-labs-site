import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde du back-office, appelee par `proxy.ts` (ex-middleware, renomme en
 * Next 16). Deux roles :
 *
 *  1. rafraichir la session Supabase a chaque requete (sinon l'utilisateur est
 *     deconnecte au hasard) ;
 *  2. rediriger de maniere optimiste selon l'etat d'authentification.
 *
 * Ce n'est qu'un aiguillage : l'autorisation reelle est refaite cote serveur
 * dans le layout admin, et surtout garantie par RLS en base (aal2 + whitelist).
 * Le proxy ne doit jamais etre l'unique barriere.
 *
 * Etats geres pour un chemin /admin :
 *   - pas de session            -> /admin/login
 *   - session aal1, sans TOTP   -> /admin/2fa/enroll   (enrolement force)
 *   - session aal1, avec TOTP   -> /admin/2fa          (verification du code)
 *   - session aal2              -> acces
 */
export async function updateAdminSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Sans base configuree, on ne bloque pas la navigation : le site public reste
  // servi, seul le back-office sera inutilisable (et le dira).
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/auth") ||
    pathname.startsWith("/admin/2fa");

  // NE RIEN executer entre createServerClient et getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (target: string): NextResponse => {
    const next = request.nextUrl.clone();
    next.pathname = target;
    next.search = "";
    return NextResponse.redirect(next);
  };

  if (!user) {
    return isAuthRoute && !pathname.startsWith("/admin/2fa")
      ? response
      : redirectTo("/admin/login");
  }

  // Niveau d'assurance : aal2 = 2FA validee.
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const verified = aal?.currentLevel === "aal2";
  const needsFactor = aal?.nextLevel === "aal2" && aal?.currentLevel === "aal1";

  if (verified) {
    // Deja authentifie a fond : les ecrans d'auth n'ont plus lieu d'etre.
    if (isAuthRoute) return redirectTo("/admin");
    return response;
  }

  // Session aal1. `nextLevel === 'aal2'` => un facteur TOTP existe, il faut le
  // verifier ; sinon il faut d'abord en enroler un.
  if (needsFactor) {
    return pathname.startsWith("/admin/2fa/enroll")
      ? redirectTo("/admin/2fa")
      : pathname.startsWith("/admin/2fa")
        ? response
        : redirectTo("/admin/2fa");
  }

  // Aucun facteur : enrolement obligatoire.
  return pathname.startsWith("/admin/2fa/enroll")
    ? response
    : redirectTo("/admin/2fa/enroll");
}
