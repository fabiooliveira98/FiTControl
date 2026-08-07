"use server";

import { redirect } from "next/navigation";

import { loginSchema } from "@/features/auth/schemas";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseActionClient } from "@/lib/supabase/server";

export type EstadoLogin = {
  error?: string;
};

export async function fazerLogin(_: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const dados = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!dados.success) {
    return {
      error: dados.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  if (!hasSupabaseConfig()) {
    return {
      error: "As credenciais do Supabase ainda não foram configuradas neste ambiente.",
    };
  }

  const supabase = await createSupabaseActionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });

  if (error) {
    return {
      error: "E-mail ou senha inválidos.",
    };
  }

  redirect("/painel");
}
