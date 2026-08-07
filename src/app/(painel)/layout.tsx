import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/entrar");
    }

    await supabase.rpc("finalizar_aulas_anteriores");
  }

  return <AppShell>{children}</AppShell>;
}
