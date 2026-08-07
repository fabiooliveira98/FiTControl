import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link href="/" className="inline-flex items-center gap-3" aria-label="FitControl, início">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-xl font-semibold text-white">
          F
        </span>
        <span>
          <span className="block font-display text-xl font-semibold leading-none">FitControl</span>
          <span className="mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-foreground/45">
            Agenda em movimento
          </span>
        </span>
      </Link>

      <nav className="hidden items-center gap-7 text-sm font-semibold text-foreground/65 md:flex">
        <a href="#problema" className="transition hover:text-primary">O problema</a>
        <a href="#solucao" className="transition hover:text-primary">Como funciona</a>
        <a href="#rotina" className="transition hover:text-primary">Na prática</a>
      </nav>

      <ButtonLink href="/entrar" size="sm">
        Acessar
      </ButtonLink>
    </header>
  );
}
