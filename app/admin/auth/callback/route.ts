import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Retour du lien magique. On echange le `code` contre une session (aal1), puis
 * on renvoie vers `/admin` : le proxy prend le relais et route vers
 * l'enrolement ou la verification TOTP selon l'etat du compte.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (code) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}/admin`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=lien_invalide`);
}
