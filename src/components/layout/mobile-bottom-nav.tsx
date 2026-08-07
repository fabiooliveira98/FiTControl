"use client";

import { CalendarDays, CalendarRange, MoreHorizontal, RefreshCcw, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const itens = [
  { href: "/painel", label: "Hoje", icon: CalendarDays, caminhos: ["/painel"] },
  { href: "/agenda", label: "Agenda", icon: CalendarRange, caminhos: ["/agenda"] },
  { href: "/alunos", label: "Alunos", icon: Users, caminhos: ["/alunos"] },
  { href: "/reposicoes", label: "Reposicoes", icon: RefreshCcw, caminhos: ["/reposicoes"] },
  {
    href: "/mais",
    label: "Mais",
    icon: MoreHorizontal,
    caminhos: ["/mais", "/financeiro", "/configuracoes"],
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacao principal"
      className="fixed inset-x-2 bottom-2 z-40 rounded-[1.6rem] border border-border bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_18px_48px_rgba(33,14,44,0.22)] backdrop-blur-xl lg:hidden"
    >
      <div className="grid h-[4.35rem] grid-cols-5 items-center">
        {itens.map((item) => {
          const ativo = item.caminhos.some(
            (caminho) => pathname === caminho || pathname.startsWith(`${caminho}/`),
          );
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[0.62rem] font-semibold transition",
                ativo ? "bg-primary text-white" : "text-foreground/55 hover:bg-surface-muted",
              )}
            >
              <item.icon className="size-4.5" aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
