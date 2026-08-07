"use client";

import { Check, Clock3, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  SelecaoRotina,
  SlotCadastroAluno,
} from "@/features/alunos/types";
import type { DiaSemana } from "@/types/dominio";
import {
  compararHorarios,
  diasSemana,
  formatarDiaSemana,
} from "@/utils/agenda";

function descricaoFormato(capacidade: number) {
  if (capacidade === 1) return "Individual";
  if (capacidade === 2) return "Dupla";
  return "Trio";
}

export function SeletorRotinaSemanal({
  slots,
  selecionados,
  onChange,
  desabilitado,
}: {
  slots: SlotCadastroAluno[];
  selecionados: SelecaoRotina;
  onChange: (proximo: SelecaoRotina) => void;
  desabilitado: boolean;
}) {
  const primeiroDiaSelecionado = diasSemana.find((dia) =>
    Object.keys(selecionados).some((chave) => chave.startsWith(`${dia}|`)),
  );
  const primeiroDiaDisponivel = diasSemana.find((dia) =>
    slots.some((slot) => slot.dia_semana === dia && slot.disponivel),
  );
  const [diaAtivo, setDiaAtivo] = useState<DiaSemana>(
    primeiroDiaSelecionado ?? primeiroDiaDisponivel ?? "SEGUNDA",
  );

  const slotPorChave = new Map(slots.map((slot) => [slot.chave, slot]));
  const slotsSelecionados = Object.keys(selecionados)
    .map((chave) => slotPorChave.get(chave))
    .filter((slot): slot is SlotCadastroAluno => Boolean(slot))
    .sort((a, b) => {
      const ordemDia = diasSemana.indexOf(a.dia_semana) - diasSemana.indexOf(b.dia_semana);
      return ordemDia || compararHorarios(a.horario_inicio, b.horario_inicio);
    });

  function alternar(slot: SlotCadastroAluno) {
    if (desabilitado) return;

    const proximo = { ...selecionados };
    if (proximo[slot.chave] !== undefined) {
      delete proximo[slot.chave];
    } else {
      Object.keys(proximo).forEach((chave) => {
        if (slotPorChave.get(chave)?.dia_semana === slot.dia_semana) {
          delete proximo[chave];
        }
      });
      proximo[slot.chave] = slot.grupo_aula_id ? slot.capacidade_maxima : 1;
    }
    onChange(proximo);
  }

  const slotsDoDia = slots
    .filter(
      (slot) =>
        slot.dia_semana === diaAtivo &&
        (selecionados[slot.chave] !== undefined || slot.disponivel),
    )
    .sort((a, b) => compararHorarios(a.horario_inicio, b.horario_inicio));

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Rotina semanal
          </p>
          <h2 className="mt-2 font-display text-3xl">Escolha os dias e horarios</h2>
          <p className="mt-2 text-sm text-foreground/55">
            Escolha um horario por dia. Ao selecionar outro no mesmo dia, o anterior sera
            substituido.
          </p>
        </div>
        <Badge tone={slotsSelecionados.length ? "success" : "default"}>
          {slotsSelecionados.length} selecionados
        </Badge>
      </div>

      <div className="rounded-3xl border border-border bg-surface-muted/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/48">
          Rotina escolhida
        </p>
        {slotsSelecionados.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {slotsSelecionados.map((slot) => (
              <div
                key={slot.chave}
                className="inline-flex items-center gap-2 rounded-2xl border border-success/20 bg-white px-3 py-2 text-sm"
              >
                <span>
                  <strong>{formatarDiaSemana(slot.dia_semana).slice(0, 3)}</strong>
                  {" "}
                  {slot.horario_inicio}
                  {" - "}
                  {descricaoFormato(selecionados[slot.chave])}
                </span>
                <button
                  type="button"
                  onClick={() => alternar(slot)}
                  disabled={desabilitado}
                  className="grid size-6 place-items-center rounded-full text-danger transition hover:bg-[rgba(166,56,85,0.08)] disabled:opacity-50"
                  aria-label={`Remover ${formatarDiaSemana(slot.dia_semana)} ${slot.horario_inicio}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-foreground/50">
            Nenhum horario selecionado. Comece escolhendo um dia abaixo.
          </p>
        )}
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max gap-2" role="tablist" aria-label="Dias da semana">
          {diasSemana.map((dia) => {
            const quantidadeSelecionada = slotsSelecionados.filter(
              (slot) => slot.dia_semana === dia,
            ).length;
            const quantidadeDisponivel = slots.filter(
              (slot) => slot.dia_semana === dia && slot.disponivel,
            ).length;
            const ativo = diaAtivo === dia;

            return (
              <button
                key={dia}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setDiaAtivo(dia)}
                className={cn(
                  "min-w-28 rounded-2xl border px-4 py-3 text-left transition",
                  ativo
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground hover:border-primary/35",
                )}
              >
                <span className="block text-sm font-semibold">{formatarDiaSemana(dia)}</span>
                <span className={cn("mt-1 block text-xs", ativo ? "text-white/70" : "text-foreground/45")}>
                  {quantidadeSelecionada
                    ? `${quantidadeSelecionada} escolhido(s)`
                    : `${quantidadeDisponivel} disponiveis`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-2xl">{formatarDiaSemana(diaAtivo)}</p>
            <p className="mt-1 text-xs text-foreground/50">
              Escolha um horario. Toque em outro para trocar a selecao deste dia.
            </p>
          </div>
          <Clock3 className="text-primary" size={20} />
        </div>

        {slotsDoDia.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {slotsDoDia.map((slot) => {
              const marcado = selecionados[slot.chave] !== undefined;
              const descricaoOcupacao = slot.grupo_aula_id
                ? `${slot.tipo?.toLowerCase()} | ${slot.ocupacao}/${slot.capacidade_maxima} ocupados`
                : "Horario vazio";

              return (
                <div
                  key={slot.chave}
                  className={cn(
                    "rounded-2xl border transition",
                    marcado
                      ? "border-success/35 bg-[rgba(31,111,95,0.06)]"
                      : "border-border bg-white hover:border-primary/30",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => alternar(slot)}
                    disabled={desabilitado}
                    aria-pressed={marcado}
                    className="flex w-full items-start justify-between gap-3 p-3 text-left disabled:opacity-60"
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        {slot.horario_inicio} - {slot.horario_fim}
                      </span>
                      <span className="mt-1 block text-xs text-foreground/52">
                        {descricaoOcupacao}
                      </span>
                      {slot.nomes_ocupantes.length ? (
                        <span className="mt-1 block text-xs font-medium text-primary">
                          Com {slot.nomes_ocupantes.join(", ")}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full border",
                        marcado
                          ? "border-success bg-success text-white"
                          : "border-border-strong bg-white",
                      )}
                    >
                      {marcado ? <Check size={13} /> : null}
                    </span>
                  </button>

                  {marcado && !slot.grupo_aula_id ? (
                    <div className="border-t border-success/15 p-3 pt-2">
                      <Select
                        aria-label={`Formato de ${formatarDiaSemana(diaAtivo)} ${slot.horario_inicio}`}
                        value={selecionados[slot.chave]}
                        disabled={desabilitado}
                        onChange={(evento) =>
                          onChange({
                            ...selecionados,
                            [slot.chave]: Number(evento.target.value),
                          })
                        }
                      >
                        <option value={1}>Individual</option>
                        <option value={2}>Dupla</option>
                        <option value={3}>Trio</option>
                      </Select>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-border-strong px-4 py-7 text-center">
            <p className="text-sm font-semibold">Nenhum horario livre neste dia</p>
            <p className="mt-1 text-xs text-foreground/50">
              Tente outro dia ou revise a faixa semanal da agenda.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
