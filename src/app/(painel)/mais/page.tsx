import { ChevronRight, CircleDollarSign, LogOut, Settings2 } from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/layout/logout-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const atalhos = [
  {
    href: "/financeiro",
    titulo: "Financeiro",
    descricao: "Mensalidades, pagamentos e ajustes.",
    icon: CircleDollarSign,
  },
  {
    href: "/configuracoes",
    titulo: "Configuracoes",
    descricao: "Disponibilidade, bloqueios e conta.",
    icon: Settings2,
  },
];

export default function MaisPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Menu"
        title="Mais"
        description="Acesse as areas administrativas sem sobrecarregar a navegacao diaria."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {atalhos.map((atalho) => (
          <Link key={atalho.href} href={atalho.href}>
            <Card className="flex h-full items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary/25">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-primary">
                <atalho.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{atalho.titulo}</span>
                <span className="mt-1 block text-xs leading-5 text-foreground/55">
                  {atalho.descricao}
                </span>
              </span>
              <ChevronRight className="size-4 text-foreground/35" aria-hidden="true" />
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <LogOut className="size-5 text-danger" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Encerrar sessao</p>
            <p className="mt-1 text-xs text-foreground/55">Sair com seguranca deste aparelho.</p>
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <LogoutButton />
        </div>
      </Card>
    </div>
  );
}
