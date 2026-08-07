"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { cn } from "@/lib/utils";
import type { ItemNavegacao } from "@/types/dominio";

const navegacao: ItemNavegacao[] = [
  { href: "/painel", label: "Painel", descricao: "Visão geral da operação" },
  { href: "/agenda", label: "Agenda", descricao: "Semana, mês e bloqueios" },
  { href: "/alunos", label: "Alunos", descricao: "Cadastros e rotina fixa" },
  { href: "/reposicoes", label: "Reposições", descricao: "Pendências e encaixes" },
  { href: "/financeiro", label: "Financeiro", descricao: "Mensalidades e ajustes" },
  { href: "/configuracoes", label: "Configurações", descricao: "Disponibilidade e conta" },
];

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-3 py-3 sm:px-4 lg:px-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="painel rounded-[2rem] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                FitControl
              </p>
              <h1 className="mt-3 font-display text-4xl leading-none text-foreground">
                Controle da agenda
              </h1>
            </div>
            <div className="lg:hidden">
              <LogoutButton />
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navegacao.map((item) => {
              const ativo = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-[1.4rem] border px-4 py-3 transition",
                    ativo
                      ? "border-action bg-action text-on-action shadow-[0_8px_20px_rgba(38,5,46,0.16)]"
                      : "border-transparent bg-surface-muted text-foreground hover:border-border hover:bg-white",
                  )}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-5",
                      ativo ? "text-on-action/80" : "text-foreground/55",
                    )}
                  >
                    {item.descricao}
                  </p>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 hidden lg:block">
            <LogoutButton />
          </div>
        </aside>

        <div className="painel rounded-[2rem] p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
