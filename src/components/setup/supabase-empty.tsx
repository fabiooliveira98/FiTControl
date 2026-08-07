import { Alert } from "@/components/ui/alert";

export function SupabaseEmpty() {
  return (
    <Alert title="Credenciais do Supabase pendentes" tone="warning">
      Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
      <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para validar autenticação e dados reais.
      A base do sistema e a modelagem inicial já foram preparadas.
    </Alert>
  );
}
