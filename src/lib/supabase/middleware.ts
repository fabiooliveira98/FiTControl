import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase/config";

const rotasPublicas = ["/", "/entrar"];

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublica = rotasPublicas.some(
    (rota) => request.nextUrl.pathname === rota || request.nextUrl.pathname.startsWith(`${rota}/`),
  );

  if (!user && !isPublica) {
    const urlLogin = request.nextUrl.clone();
    urlLogin.pathname = "/entrar";
    return NextResponse.redirect(urlLogin);
  }

  if (user && request.nextUrl.pathname === "/entrar") {
    const urlPainel = request.nextUrl.clone();
    urlPainel.pathname = "/painel";
    return NextResponse.redirect(urlPainel);
  }

  return response;
}
