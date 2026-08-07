"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import type { ItemNavegacao } from "@/types/dominio";

const navegacao: ItemNavegacao[] = [
  { href: "/painel", label: "Painel", descricao: "Visao diaria da operacao" },
  { href: "/agenda", label: "Agenda", descricao: "Semana, mes e bloqueios" },
  { href: "/alunos", label: "Alunos", descricao: "Cadastros e rotina fixa" },
  { href: "/reposicoes", label: "Reposicoes", descricao: "Pendencias e encaixes" },
  { href: "/financeiro", label: "Financeiro", descricao: "Mensalidades e ajustes" },
  { href: "/configuracoes", label: "Configuracoes", descricao: "Disponibilidade e conta" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-2 pb-24 pt-2 sm:px-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-1rem)] max-w-7xl gap-4 lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[280px_1fr]">
        <aside className="painel hidden rounded-[2rem] p-5 lg:block">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">
              FitControl
            </p>
            <h1 className="mt-3 font-display text-4xl leading-none text-foreground">
              Controle da agenda
            </h1>
          </div>

          <nav className="mt-8 space-y-2">
            {navegacao.map((item) => {
              const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
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

          <div className="mt-8">
            <LogoutButton />
          </div>
        </aside>

        <main className="painel min-w-0 rounded-[1.75rem] p-4 sm:p-6 lg:rounded-[2rem] lg:p-8">
          <div className="mb-7 flex items-center justify-between border-b border-border pb-4 lg:hidden">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-primary">
                FitControl
              </p>
              <p className="mt-1 font-display text-xl leading-none">Agenda em movimento</p>
            </div>
            <span className="size-2 rounded-full bg-success shadow-[0_0_0_5px_rgba(31,111,95,0.1)]" />
          </div>
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
