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
import { useMemo, useState } from "react";

import { BotaoFinalizarAula } from "@/components/painel/botao-finalizar-aula";
import { FormularioCancelamentoRapido } from "@/components/reposicoes/formulario-cancelamento-rapido";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ButtonLink } from "@/components/ui/button";
import type { AulaDoDia, StatusOperacionalAula } from "@/features/painel/types";
import { cn } from "@/lib/utils";

type TelaAcoes = "menu" | "remanejar" | "cancelar";
type IconeAcao = typeof CalendarClock;

const estadosFinalizacaoPrimeiro = new Set<StatusOperacionalAula>([
  "EM_ANDAMENTO",
  "PENDENTE_FINALIZACAO",
  "PROXIMA",
]);

function nomesParticipantes(aula: AulaDoDia) {
  return aula.participantes.map((participante) => participante.nome).join(", ");
}

function BotaoAcao({
  icone: Icone,
  titulo,
  descricao,
  onClick,
  destaque,
}: {
  icone: IconeAcao;
  titulo: string;
  descricao: string;
  onClick: () => void;
  destaque?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
        destaque
          ? "border-primary bg-primary text-white hover:bg-primary-strong"
          : "border-border bg-white hover:border-primary/25 hover:bg-surface-muted",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl",
          destaque ? "bg-white/14 text-white" : "bg-accent-soft text-primary",
        )}
      >
        <Icone className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{titulo}</span>
        <span
          className={cn(
            "mt-0.5 block text-xs leading-5",
            destaque ? "text-white/70" : "text-foreground/55",
          )}
        >
          {descricao}
        </span>
      </span>
      <ChevronRight
        className={cn("size-4", destaque ? "text-white/55" : "text-foreground/35")}
        aria-hidden="true"
      />
    </button>
  );
}

function ResumoAulaSheet({ aula }: { aula: AulaDoDia }) {
  const participantesAtivos = aula.participantes.filter((participante) => !participante.cancelado);

  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl leading-none">{aula.horario_inicio.slice(0, 5)}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-foreground/45">
            ate {aula.horario_fim.slice(0, 5)}
          </p>
        </div>
        <Badge tone={aula.status_operacional === "CANCELADA" ? "danger" : "default"}>
          {participantesAtivos.length}/{aula.capacidade}
        </Badge>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6">
        {participantesAtivos.map((participante) => participante.nome).join(", ") ||
          nomesParticipantes(aula)}
      </p>
    </div>
  );
}

function SeletorParticipantes({
  aula,
  tipo,
  onCancelar,
}: {
  aula: AulaDoDia;
  tipo: "remanejar" | "cancelar";
  onCancelar: (ids: string[]) => void;
}) {
  const participantesAtivos = aula.participantes.filter((participante) => !participante.cancelado);
  const todosPodemRemanejar = participantesAtivos.every(
    (participante) => !participante.treina_segunda_a_sexta,
  );

  return (
    <div className="space-y-3">
      {participantesAtivos.map((participante) => {
        const ehAlunoCincoVezes = participante.treina_segunda_a_sexta;
        const hrefRemanejamento = `/agenda/aulas/${aula.id}/remanejar?alunos=${participante.aluno_id}`;

        if (tipo === "remanejar" && ehAlunoCincoVezes) {
          return (
            <div
              key={participante.aluno_id}
              className="rounded-2xl border border-warning/25 bg-[rgba(154,103,0,0.07)] p-4"
            >
              <p className="text-sm font-semibold">{participante.nome}</p>
              <p className="mt-1 text-xs leading-5 text-warning">
                Aluno 5x: tratar como ajuste financeiro.
              </p>
            </div>
          );
        }

        if (tipo === "remanejar") {
          return (
            <ButtonLink
              key={participante.aluno_id}
              href={hrefRemanejamento}
              variant="secondary"
              className="w-full justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <User className="size-4" aria-hidden="true" /> {participante.nome}
              </span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          );
        }

        return (
          <button
            key={participante.aluno_id}
            type="button"
            onClick={() => onCancelar([participante.aluno_id])}
            className="flex h-12 w-full items-center justify-between rounded-2xl border border-border-strong bg-white px-4 text-sm font-semibold transition hover:bg-surface-muted"
          >
            <span className="inline-flex items-center gap-2">
              <User className="size-4" aria-hidden="true" /> {participante.nome}
            </span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        );
      })}

      {participantesAtivos.length > 1 && tipo === "cancelar" ? (
        <button
          type="button"
          onClick={() =>
            onCancelar(participantesAtivos.map((participante) => participante.aluno_id))
          }
          className="flex h-12 w-full items-center justify-between rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-strong"
        >
          <span className="inline-flex items-center gap-2">
            <Users className="size-4" aria-hidden="true" /> Cancelar grupo inteiro
          </span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {participantesAtivos.length > 1 && tipo === "remanejar" && todosPodemRemanejar ? (
        <ButtonLink
          href={`/agenda/aulas/${aula.id}/remanejar?alunos=${participantesAtivos.map((participante) => participante.aluno_id).join(",")}`}
          className="w-full justify-between"
        >
          <span className="inline-flex items-center gap-2">
            <Users className="size-4" aria-hidden="true" /> Remanejar grupo inteiro
          </span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function AcoesAulaBottomSheet({
  aula,
  hoje,
  aberto,
  aoFechar,
}: {
  aula: AulaDoDia;
  hoje: string;
  aberto: boolean;
  aoFechar: () => void;
}) {
  const [tela, setTela] = useState<TelaAcoes>("menu");
  const [cancelarIds, setCancelarIds] = useState<string[] | null>(null);
  const participantesAtivos = useMemo(
    () => aula.participantes.filter((participante) => !participante.cancelado),
    [aula.participantes],
  );
  const podeFinalizar = aula.data <= hoje && !["CONCLUIDA", "CANCELADA"].includes(aula.status);
  const finalizacaoPrimeiro =
    podeFinalizar && estadosFinalizacaoPrimeiro.has(aula.status_operacional);
  const participanteUnico = participantesAtivos.length === 1 ? participantesAtivos[0] : null;
  const participantesDoCancelamento = cancelarIds
    ? participantesAtivos.filter((participante) => cancelarIds.includes(participante.aluno_id))
    : [];

  function abrirTela(proximaTela: TelaAcoes) {
    setCancelarIds(null);

    if (proximaTela === "cancelar" && participanteUnico) {
      setCancelarIds([participanteUnico.aluno_id]);
    }

    setTela(proximaTela);
  }

  function voltar() {
    if (tela === "cancelar" && cancelarIds && participantesAtivos.length > 1) {
      setCancelarIds(null);
      return;
    }

    setTela("menu");
    setCancelarIds(null);
  }

  function fechar() {
    setTela("menu");
    setCancelarIds(null);
    aoFechar();
  }

  const acaoFinalizar = podeFinalizar ? (
    <div
      className={cn(
        "rounded-2xl border p-3",
        finalizacaoPrimeiro
          ? "border-success/30 bg-[rgba(31,111,95,0.07)]"
          : "border-border bg-surface-muted",
      )}
    >
      <div className="mb-3 flex items-center gap-3 px-1">
        <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">Finalizar aula</p>
          <p className="text-xs text-foreground/55">Conclui o encontro inteiro.</p>
        </div>
      </div>
      <BotaoFinalizarAula aulaId={aula.id} />
    </div>
  ) : null;

  const acoesOperacionais = participantesAtivos.length ? (
    <>
      {participanteUnico && !participanteUnico.treina_segunda_a_sexta ? (
        <ButtonLink
          href={`/agenda/aulas/${aula.id}/remanejar?alunos=${participanteUnico.aluno_id}`}
          variant="secondary"
          className="w-full justify-between"
        >
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="size-4" aria-hidden="true" /> Remanejar
          </span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      ) : (
        <BotaoAcao
          icone={CalendarClock}
          titulo="Remanejar"
          descricao="Mover sem alterar a rotina."
          onClick={() => abrirTela("remanejar")}
        />
      )}
      <BotaoAcao
        icone={CircleX}
        titulo="Cancelar falta"
        descricao="Registrar motivo opcional."
        onClick={() => abrirTela("cancelar")}
      />
    </>
  ) : null;

  return (
    <BottomSheet
      aberto={aberto}
      aoFechar={fechar}
      titulo={tela === "menu" ? "Acoes da aula" : tela === "remanejar" ? "Remanejar" : "Cancelar falta"}
      descricao={`${nomesParticipantes(aula)} - ${aula.data}`}
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

      <ResumoAulaSheet aula={aula} />

      {tela === "menu" ? (
        <div className="space-y-3">
          {finalizacaoPrimeiro ? acaoFinalizar : null}
          {acoesOperacionais}
          {!finalizacaoPrimeiro ? acaoFinalizar : null}
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
        <SeletorParticipantes aula={aula} tipo="remanejar" onCancelar={setCancelarIds} />
      ) : null}

      {tela === "cancelar" && !cancelarIds ? (
        <SeletorParticipantes aula={aula} tipo="cancelar" onCancelar={setCancelarIds} />
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
  );
}
