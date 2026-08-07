"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { SeletorRotinaSemanal } from "@/components/alunos/seletor-rotina-semanal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { atualizarAlunoAction, criarAlunoAction } from "@/features/alunos/actions";
import {
  estadoInicialAluno,
  type AlunoComRotinas,
  type RotinaAlunoFormulario,
  type SelecaoRotina,
  type SlotCadastroAluno,
} from "@/features/alunos/types";
import type { DiaSemana } from "@/types/dominio";

function chaveRotina(dia: string, horario: string) {
  return `${dia}|${horario.slice(0, 5)}`;
}

export function FormularioAluno({
  slots,
  aluno,
}: {
  slots: SlotCadastroAluno[];
  aluno?: AlunoComRotinas;
}) {
  const rotinasIniciais = Object.fromEntries(
    (aluno?.rotinas ?? []).map((rotina) => {
      const chave = chaveRotina(rotina.dia_semana, rotina.horario_inicio);
      const slot = slots.find((item) => item.chave === chave);
      return [chave, slot?.capacidade_maxima ?? 1];
    }),
  ) as SelecaoRotina;
  const [selecionados, setSelecionados] = useState<SelecaoRotina>(rotinasIniciais);
  const action = aluno ? atualizarAlunoAction.bind(null, aluno.id) : criarAlunoAction;
  const [estado, formAction, pendente] = useActionState(action, estadoInicialAluno);

  const rotinas: RotinaAlunoFormulario[] = Object.entries(selecionados).flatMap(
    ([chave, capacidade]) => {
      const slot = slots.find((item) => item.chave === chave);
      if (!slot) return [];

      return [
        {
          dia_semana: slot.dia_semana,
          horario_inicio: slot.horario_inicio,
          capacidade_maxima: slot.grupo_aula_id ? slot.capacidade_maxima : capacidade,
          grupo_aula_id: slot.grupo_aula_id,
        },
      ];
    },
  );
  const diasSelecionados = new Set(rotinas.map((rotina) => rotina.dia_semana));
  const diasUteis: DiaSemana[] = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"];
  const cincoVezes = diasUteis.every((dia) =>
    diasSelecionados.has(dia),
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="rotinas" value={JSON.stringify(rotinas)} />

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nome completo">
          <Input name="nome" defaultValue={aluno?.nome ?? ""} required disabled={pendente} />
        </Field>
        <Field label="Telefone">
          <Input
            name="telefone"
            type="tel"
            defaultValue={aluno?.telefone ?? ""}
            placeholder="(00) 00000-0000"
            disabled={pendente}
          />
        </Field>
        <Field label="E-mail">
          <Input
            name="email"
            type="email"
            defaultValue={aluno?.email ?? ""}
            disabled={pendente}
          />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={aluno?.status ?? "ATIVO"} disabled={pendente}>
            <option value="ATIVO">Ativo</option>
            <option value="PAUSADO">Pausado</option>
            <option value="INATIVO">Inativo</option>
          </Select>
        </Field>
      </div>

      <Field
        label="Observacoes"
        hint="Informacoes importantes para o atendimento. Campo opcional."
      >
        <Textarea
          name="observacoes"
          defaultValue={aluno?.observacoes ?? ""}
          disabled={pendente}
        />
      </Field>

      {aluno ? (
        <Alert title="Rotina protegida">
          Nome, contato e observacoes podem ser atualizados aqui. Para trocar dias ou
          horarios, use a secao de alteracao permanente abaixo; assim o historico permanece
          correto.
        </Alert>
      ) : (
        <SeletorRotinaSemanal
          slots={slots}
          selecionados={selecionados}
          onChange={setSelecionados}
          desabilitado={pendente}
        />
      )}

      {cincoVezes ? (
        <Alert title="Rotina de segunda a sexta" tone="warning">
          Faltas deste aluno geram ajuste financeiro e nao entram na fila comum de reposicoes.
        </Alert>
      ) : null}

      {estado.status === "erro" ? (
        <Alert title="Nao foi possivel salvar" tone="danger">
          {estado.mensagem}
        </Alert>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/alunos"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-border-strong bg-white px-5 text-sm font-semibold"
        >
          Cancelar
        </Link>
        <Button type="submit" disabled={pendente || rotinas.length === 0}>
          {pendente ? "Salvando..." : aluno ? "Salvar alteracoes" : "Cadastrar aluno"}
        </Button>
      </div>
    </form>
  );
}
