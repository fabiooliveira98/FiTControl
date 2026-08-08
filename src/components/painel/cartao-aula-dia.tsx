"use client";

import { ChevronRight, UserCheck } from "lucide-react";
import { useState } from "react";

import { AcoesAulaBottomSheet } from "@/components/painel/acoes-aula-bottom-sheet";
import { Badge } from "@/components/ui/badge";
import type { AulaDoDia, StatusOperacionalAula } from "@/features/painel/types";
import { cn } from "@/lib/utils";

const statusAula: Record<
  StatusOperacionalAula,
  {
    label: string;
    tone: "default" | "success" | "warning" | "danger";
    borda: string;
    ponto: string;
    destaque?: string;
    acao: string;
  }
> = {
  PROXIMA: {
    label: "Proxima",
    tone: "warning",
    borda: "border-l-warning",
    ponto: "bg-warning",
    destaque: "bg-[rgba(154,103,0,0.06)]",
    acao: "Preparar",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    tone: "success",
    borda: "border-l-success",
    ponto: "bg-success",
    destaque: "bg-[rgba(31,111,95,0.07)]",
    acao: "Finalizar",
  },
  AGENDADA: {
    label: "Agendada",
    tone: "default",
    borda: "border-l-primary",
    ponto: "bg-primary",
    acao: "Acoes",
  },
  PENDENTE_FINALIZACAO: {
    label: "Finalizacao pendente",
    tone: "warning",
    borda: "border-l-warning",
    ponto: "bg-warning",
    destaque: "bg-[rgba(154,103,0,0.06)]",
    acao: "Finalizar",
  },
  CONCLUIDA: {
    label: "Concluida",
    tone: "success",
    borda: "border-l-success/45",
    ponto: "bg-surface-strong",
    acao: "Detalhes",
  },
  CANCELADA: {
    label: "Cancelada",
    tone: "danger",
    borda: "border-l-danger",
    ponto: "bg-danger",
    acao: "Detalhes",
  },
  REMANEJADA: {
    label: "Remanejada",
    tone: "warning",
    borda: "border-l-secondary",
    ponto: "bg-secondary",
    acao: "Detalhes",
  },
};

function nomesAtivos(aula: AulaDoDia) {
  const participantesAtivos = aula.participantes.filter((participante) => !participante.cancelado);
  return (
    participantesAtivos.map((participante) => participante.nome).join(", ") ||
    aula.participantes.map((participante) => participante.nome).join(", ")
  );
}

export function CartaoAulaDia({ aula, hoje }: { aula: AulaDoDia; hoje: string }) {
  const [aberto, setAberto] = useState(false);
  const configuracaoStatus = statusAula[aula.status_operacional];
  const participantesAtivos = aula.participantes.filter((participante) => !participante.cancelado);
  const participantesCancelados = aula.participantes.filter((participante) => participante.cancelado);
  const deveDestacar = ["PROXIMA", "EM_ANDAMENTO", "PENDENTE_FINALIZACAO"].includes(
    aula.status_operacional,
  );

  return (
    <article className="relative pl-6 sm:pl-8">
      <span
        className={cn(
          "absolute left-0 top-6 size-3 rounded-full border-2 border-white ring-1 ring-border sm:left-0.5",
          configuracaoStatus.ponto,
          deveDestacar && "ring-4 ring-current/10",
        )}
      />
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={cn(
          "w-full rounded-[1.35rem] border border-l-4 border-border bg-white p-4 text-left shadow-[0_10px_26px_rgba(33,14,44,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(33,14,44,0.08)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 sm:p-5",
          configuracaoStatus.borda,
          configuracaoStatus.destaque,
        )}
      >
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="min-w-[3.9rem] shrink-0">
            <p className="font-display text-2xl font-semibold leading-none">
              {aula.horario_inicio.slice(0, 5)}
            </p>
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-foreground/45">
              ate {aula.horario_fim.slice(0, 5)}
            </p>
          </div>

          <div className="min-w-0 flex-1 border-l border-border pl-3.5 sm:pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={configuracaoStatus.tone}>{configuracaoStatus.label}</Badge>
              {aula.remanejada ? <Badge tone="warning">Encaixe</Badge> : null}
            </div>
            <p className="mt-2 line-clamp-2 text-base font-semibold leading-6">
              {nomesAtivos(aula)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-foreground/55">
              <span className="inline-flex items-center gap-1.5">
                <UserCheck className="size-3.5" aria-hidden="true" />
                {participantesAtivos.length}/{aula.capacidade}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                {configuracaoStatus.acao}
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </span>
            </div>
            {participantesCancelados.length ? (
              <p className="mt-2 line-clamp-1 text-xs text-danger/85">
                Fora: {participantesCancelados.map((item) => item.nome).join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      </button>

      <AcoesAulaBottomSheet
        aula={aula}
        hoje={hoje}
        aberto={aberto}
        aoFechar={() => setAberto(false)}
      />
    </article>
  );
}
