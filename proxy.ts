import { type NextRequest } from "next/server";
import { updateAdminSession } from "@/lib/supabase/proxy";

/**
 * Proxy (ex-middleware, renomme en Next 16). Restreint au back-office : le
 * `matcher` ne cible que `/admin/*`, le site public n'est jamais intercepte.
 */
export async function proxy(request: NextRequest) {
  return updateAdminSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
