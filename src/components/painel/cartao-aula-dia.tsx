"use client";

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Info,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

import { BotaoFinalizarAula } from "@/components/painel/botao-finalizar-aula";
import { FormularioCancelamentoRapido } from "@/components/reposicoes/formulario-cancelamento-rapido";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ButtonLink } from "@/components/ui/button";
import type { AulaDoDia, StatusOperacionalAula } from "@/features/painel/types";
import { cn } from "@/lib/utils";

type TelaAcoes = "menu" | "remanejar" | "cancelar";

const statusAula: Record<
  StatusOperacionalAula,
  { label: string; tone: "default" | "success" | "warning" | "danger"; borda: string }
> = {
  PROXIMA: { label: "Proxima", tone: "warning", borda: "border-l-warning" },
  EM_ANDAMENTO: { label: "Em andamento", tone: "success", borda: "border-l-success" },
  AGENDADA: { label: "Agendada", tone: "default", borda: "border-l-primary" },
  PENDENTE_FINALIZACAO: {
    label: "Finalizacao pendente",
    tone: "warning",
    borda: "border-l-warning",
  },
  CONCLUIDA: { label: "Concluida", tone: "success", borda: "border-l-success/45" },
  CANCELADA: { label: "Cancelada", tone: "danger", borda: "border-l-danger" },
  REMANEJADA: { label: "Remanejada", tone: "warning", borda: "border-l-secondary" },
};

function BotaoAcao({
  icone: Icone,
  titulo,
  descricao,
  onClick,
}: {
  icone: typeof CalendarClock;
  titulo: string;
  descricao: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left transition hover:border-primary/25 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-primary">
        <Icone className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{titulo}</span>
        <span className="mt-0.5 block text-xs leading-5 text-foreground/55">{descricao}</span>
      </span>
      <ChevronRight className="size-4 text-foreground/35" aria-hidden="true" />
    </button>
  );
}

export function CartaoAulaDia({ aula, hoje }: { aula: AulaDoDia; hoje: string }) {
  const [aberto, setAberto] = useState(false);
  const [tela, setTela] = useState<TelaAcoes>("menu");
  const [cancelarIds, setCancelarIds] = useState<string[] | null>(null);
  const configuracaoStatus = statusAula[aula.status_operacional];
  const participantesAtivos = aula.participantes.filter((participante) => !participante.cancelado);
  const participantesCancelados = aula.participantes.filter((participante) => participante.cancelado);
  const podeFinalizar =
    aula.data <= hoje && !["CONCLUIDA", "CANCELADA"].includes(aula.status);

  function abrirAcoes() {
    setTela("menu");
    setCancelarIds(null);
    setAberto(true);
  }

  function voltar() {
    if (tela === "cancelar" && cancelarIds) {
      setCancelarIds(null);
      return;
    }
    setTela("menu");
  }

  const participantesDoCancelamento = cancelarIds
    ? participantesAtivos.filter((participante) => cancelarIds.includes(participante.aluno_id))
    : [];

  return (
    <article className="relative pl-6 sm:pl-8">
      <span
        className={cn(
          "absolute left-0 top-6 size-3 rounded-full border-2 border-white ring-1 ring-border sm:left-0.5",
          aula.status_operacional === "EM_ANDAMENTO" ? "bg-success" : "bg-primary",
          ["CANCELADA", "REMANEJADA"].includes(aula.status_operacional) && "bg-danger",
          aula.status_operacional === "CONCLUIDA" && "bg-surface-strong",
        )}
      />
      <button
        type="button"
        onClick={abrirAcoes}
        className={cn(
          "w-full rounded-[1.5rem] border border-l-4 border-border bg-white p-4 text-left shadow-[0_10px_30px_rgba(33,14,44,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(33,14,44,0.09)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 sm:p-5",
          configuracaoStatus.borda,
        )}
      >
        <div className="flex items-start gap-4">
          <div className="min-w-[4.1rem] border-r border-border pr-4">
            <p className="font-display text-2xl font-semibold leading-none">
              {aula.horario_inicio.slice(0, 5)}
            </p>
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-foreground/45">
              ate {aula.horario_fim.slice(0, 5)}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={configuracaoStatus.tone}>{configuracaoStatus.label}</Badge>
              {aula.remanejada ? <Badge tone="warning">Encaixe</Badge> : null}
            </div>
            <p className="mt-3 text-base font-semibold leading-6">
              {participantesAtivos.map((participante) => participante.nome).join(", ") ||
                aula.participantes.map((participante) => participante.nome).join(", ")}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-foreground/55">
              <span>
                {participantesAtivos.length}/{aula.capacidade} participante(s)
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                Acoes <ChevronRight className="size-3.5" aria-hidden="true" />
              </span>
            </div>
            {participantesCancelados.length ? (
              <p className="mt-2 text-xs text-danger">
                Fora desta aula: {participantesCancelados.map((item) => item.nome).join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      </button>

      <BottomSheet
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={tela === "menu" ? aula.horario_inicio.slice(0, 5) : tela === "remanejar" ? "Quem sera remanejado?" : "Quem faltara?"}
        descricao={`${aula.participantes.map((participante) => participante.nome).join(", ")} · ${aula.data}`}
      >
        {tela !== "menu" ? (
          <button
            type="button"
            onClick={voltar}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Voltar
          </button>
        ) : null}

        {tela === "menu" ? (
          <div className="space-y-3">
            {participantesAtivos.length ? (
              <>
                <BotaoAcao
                  icone={CalendarClock}
                  titulo="Remanejar"
                  descricao="Mover esta aula sem alterar a rotina fixa."
                  onClick={() => setTela("remanejar")}
                />
                <BotaoAcao
                  icone={CircleX}
                  titulo="Cancelar"
                  descricao="Registrar falta individual ou de todo o grupo."
                  onClick={() => setTela("cancelar")}
                />
              </>
            ) : null}
            {podeFinalizar ? (
              <div className="rounded-2xl border border-border bg-surface-muted p-3">
                <div className="mb-3 flex items-center gap-3 px-1">
                  <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold">Finalizar aula</p>
                    <p className="text-xs text-foreground/55">Conclui o encontro inteiro.</p>
                  </div>
                </div>
                <BotaoFinalizarAula aulaId={aula.id} />
              </div>
            ) : null}
            <ButtonLink
              href={`/agenda/aulas/${aula.id}`}
              variant="secondary"
              className="w-full justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <Info className="size-4" aria-hidden="true" /> Ver detalhes
              </span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        ) : null}

        {tela === "remanejar" ? (
          <div className="space-y-3">
            {participantesAtivos.map((participante) =>
              participante.treina_segunda_a_sexta ? (
                <div key={participante.aluno_id} className="rounded-2xl border border-warning/25 bg-[rgba(154,103,0,0.07)] p-4">
                  <p className="text-sm font-semibold">{participante.nome}</p>
                  <p className="mt-1 text-xs leading-5 text-warning">Aluno 5x: usar ajuste financeiro.</p>
                </div>
              ) : (
                <ButtonLink
                  key={participante.aluno_id}
                  href={`/agenda/aulas/${aula.id}/remanejar?alunos=${participante.aluno_id}`}
                  variant="secondary"
                  className="w-full justify-between"
                >
                  <span className="inline-flex items-center gap-2"><User className="size-4" /> {participante.nome}</span>
                  <ChevronRight className="size-4" />
                </ButtonLink>
              ),
            )}
            {participantesAtivos.length > 1 &&
            participantesAtivos.every((participante) => !participante.treina_segunda_a_sexta) ? (
              <ButtonLink
                href={`/agenda/aulas/${aula.id}/remanejar?alunos=${participantesAtivos.map((participante) => participante.aluno_id).join(",")}`}
                className="w-full justify-between"
              >
                <span className="inline-flex items-center gap-2"><Users className="size-4" /> Remanejar grupo inteiro</span>
                <ChevronRight className="size-4" />
              </ButtonLink>
            ) : null}
          </div>
        ) : null}

        {tela === "cancelar" && !cancelarIds ? (
          <div className="space-y-3">
            {participantesAtivos.map((participante) => (
              <button
                key={participante.aluno_id}
                type="button"
                onClick={() => setCancelarIds([participante.aluno_id])}
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-border-strong bg-white px-4 text-sm font-semibold transition hover:bg-surface-muted"
              >
                <span className="inline-flex items-center gap-2"><User className="size-4" /> {participante.nome}</span>
                <ChevronRight className="size-4" />
              </button>
            ))}
            {participantesAtivos.length > 1 ? (
              <button
                type="button"
                onClick={() => setCancelarIds(participantesAtivos.map((participante) => participante.aluno_id))}
                className="flex h-12 w-full items-center justify-between rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-strong"
              >
                <span className="inline-flex items-center gap-2"><Users className="size-4" /> Cancelar grupo inteiro</span>
                <ChevronRight className="size-4" />
              </button>
            ) : null}
          </div>
        ) : null}

        {tela === "cancelar" && cancelarIds ? (
          <FormularioCancelamentoRapido
            aulaId={aula.id}
            alunoIds={cancelarIds}
            nomes={participantesDoCancelamento.map((participante) => participante.nome)}
            possuiAlunoCincoVezes={participantesDoCancelamento.some(
              (participante) => participante.treina_segunda_a_sexta,
            )}
          />
        ) : null}
      </BottomSheet>
    </article>
  );
}
