import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="max-w-xl p-8 text-center">
        <CardTitle>Página não encontrada</CardTitle>
        <CardDescription className="mt-3">
          A rota que você tentou acessar não existe nesta fase do FitControl.
        </CardDescription>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/">Voltar ao início</ButtonLink>
        </div>
        <Link href="/painel" className="mt-4 block text-sm font-semibold text-primary">
          Ir para o painel
        </Link>
      </Card>
    </main>
  );
}
