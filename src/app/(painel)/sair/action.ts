"use server";

import { redirect } from "next/navigation";

import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseActionClient } from "@/lib/supabase/server";

export async function fazerLogout() {
  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseActionClient();
    await supabase.auth.signOut();
  }

  redirect("/entrar");
}
