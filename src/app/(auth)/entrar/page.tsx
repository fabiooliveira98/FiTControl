import { ArrowLeft, CalendarCheck2, RefreshCcw, Smartphone } from "lucide-react";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { SupabaseEmpty } from "@/components/setup/supabase-empty";
import { Card } from "@/components/ui/card";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const beneficios = [
  { icon: CalendarCheck2, texto: "Aulas do dia em ordem e prontas para agir" },
  { icon: RefreshCcw, texto: "Cancelamentos e reposições no mesmo fluxo" },
  { icon: Smartphone, texto: "Experiência pensada para celular e desktop" },
];

export default function EntrarPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#370a42_0%,#26052e_58%,#662975_100%)] px-4 py-5 sm:px-6 lg:p-8">
      <div className="landing-login-orb landing-login-orb-one" />
      <div className="landing-login-orb landing-login-orb-two" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/12 bg-white/6 shadow-[0_40px_100px_rgba(0,0,0,0.22)] backdrop-blur sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="order-last flex flex-col justify-between p-6 text-white sm:p-9 lg:order-first lg:p-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Voltar para o início">
              <span className="flex size-10 items-center justify-center rounded-full bg-white font-display text-xl font-semibold text-primary">F</span>
              <span className="font-display text-2xl font-semibold">FitControl</span>
            </Link>

            <div className="motion-reveal mt-14 max-w-2xl lg:mt-24">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Controle para uma agenda viva</p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Menos tempo reorganizando. Mais tempo acompanhando evolução.
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
                Entre para visualizar as aulas de hoje, encontrar encaixes e manter cada mudança sob controle.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3 lg:mt-16">
            {beneficios.map((beneficio) => (
              <div key={beneficio.texto} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <beneficio.icon className="size-4 text-accent" aria-hidden="true" />
                <p className="mt-4 text-xs font-semibold leading-5 text-white/72">{beneficio.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="order-first flex items-center bg-[rgba(255,253,253,0.97)] p-4 sm:p-8 lg:order-last lg:p-12">
          <Card className="motion-reveal reveal-delay-1 w-full border-0 bg-transparent p-2 shadow-none sm:p-5">
            <div className="flex flex-col items-start gap-6">
              <Link href="/" className="inline-flex items-center gap-3 lg:hidden" aria-label="FitControl, início">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-xl font-semibold text-white">F</span>
                <span className="font-display text-2xl font-semibold">FitControl</span>
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/55 transition hover:text-primary">
                <ArrowLeft className="size-4" aria-hidden="true" /> Voltar para o início
              </Link>
            </div>
            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Área da personal</p>
            <h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95]">Sua agenda está pronta.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-foreground/60">
              Use seu e-mail e senha para continuar de onde parou.
            </p>

            <div className="mt-8 space-y-4">
              {!hasSupabaseConfig() ? <SupabaseEmpty /> : null}
              <LoginForm />
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
