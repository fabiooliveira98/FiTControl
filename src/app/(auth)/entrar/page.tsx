import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { SupabaseEmpty } from "@/components/setup/supabase-empty";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default function EntrarPage() {
  return (
    <main className="grade-editorial flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <Card className="w-full max-w-xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Acesso da personal
        </p>
        <CardTitle className="mt-4">Entre para organizar a semana e o mês.</CardTitle>
        <CardDescription className="mt-3">
          O sistema já está preparado para autenticação via Supabase, rotas protegidas e estrutura em fases.
        </CardDescription>

        <div className="mt-8 space-y-4">
          {!hasSupabaseConfig() ? <SupabaseEmpty /> : null}
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
