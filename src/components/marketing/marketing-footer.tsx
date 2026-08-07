import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div>
          <p className="font-display text-xl font-semibold">FitControl</p>
          <p className="mt-1 text-xs text-foreground/48">Menos improviso. Mais controle sobre cada aula.</p>
        </div>
        <div className="flex items-center gap-6 font-semibold text-foreground/62">
          <a href="#solucao" className="transition hover:text-primary">Como funciona</a>
          <Link href="/entrar" className="transition hover:text-primary">Entrar</Link>
        </div>
      </div>
    </footer>
  );
}
