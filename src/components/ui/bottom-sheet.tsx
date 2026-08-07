"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type BottomSheetProps = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  className?: string;
};

export function BottomSheet({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  className,
}: BottomSheetProps) {
  const tituloId = useId();
  const descricaoId = useId();
  const botaoFecharRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const elementoAnterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botaoFecharRef.current?.focus();

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        aoFechar();
        return;
      }
      if (evento.key !== "Tab") return;

      const focaveis = painelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focaveis?.length) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEscape);
      elementoAnterior?.focus();
    };
  }, [aberto, aoFechar]);

  if (!aberto || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6">
      <button
        type="button"
        aria-label="Fechar painel de acoes"
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px]"
        onClick={aoFechar}
      />
      <section
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descricao ? descricaoId : undefined}
        className={cn(
          "relative z-10 max-h-[88dvh] w-full overflow-y-auto rounded-t-[2rem] border border-border bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_60px_rgba(55,10,66,0.22)] lg:max-w-xl lg:rounded-[2rem] lg:p-7",
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border-strong lg:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={tituloId} className="font-display text-2xl font-semibold text-foreground">
              {titulo}
            </h2>
            {descricao ? (
              <p id={descricaoId} className="mt-1 text-sm leading-6 text-foreground/60">
                {descricao}
              </p>
            ) : null}
          </div>
          <button
            ref={botaoFecharRef}
            type="button"
            aria-label="Fechar"
            onClick={aoFechar}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-foreground transition hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
