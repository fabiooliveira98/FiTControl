"use client";

import { useActionState, useState } from "react";

import { SeletorRotinaSemanal } from "@/components/alunos/seletor-rotina-semanal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { programarAlteracaoRotinaAction } from "@/features/alteracoes-rotina/actions";
import { estadoInicialAlteracaoRotina } from "@/features/alteracoes-rotina/types";
import type {
  AlunoComRotinas,
  RotinaAlunoFormulario,
  SelecaoRotina,
  SlotCadastroAluno,
} from "@/features/alunos/types";

function chaveRotina(dia: string, horario: string) {
  return `${dia}|${horario.slice(0, 5)}`;
}

export function FormularioAlteracaoRotina({
  aluno,
  slots,
  dataMinima,
}: {
  aluno: AlunoComRotinas;
  slots: SlotCadastroAluno[];
  dataMinima: string;
}) {
  const selecaoInicial = Object.fromEntries(
    aluno.rotinas.map((rotina) => {
      const chave = chaveRotina(rotina.dia_semana, rotina.horario_inicio);
      const slot = slots.find((item) => item.chave === chave);
      return [chave, slot?.capacidade_maxima ?? 1];
    }),
  ) as SelecaoRotina;
  const [selecionados, setSelecionados] = useState(selecaoInicial);
  const [dataVigencia, setDataVigencia] = useState(dataMinima);
  const [estado, action, pendente] = useActionState(
    programarAlteracaoRotinaAction.bind(null, aluno.id),
    estadoInicialAlteracaoRotina,
  );
  const rotinas: RotinaAlunoFormulario[] = Object.entries(selecionados).flatMap(
    ([chave, capacidade]) => {
      const slot = slots.find((item) => item.chave === chave);
      if (!slot) return [];
      return [{
        dia_semana: slot.dia_semana,
        horario_inicio: slot.horario_inicio,
        capacidade_maxima: slot.grupo_aula_id ? slot.capacidade_maxima : capacidade,
        grupo_aula_id: slot.grupo_aula_id,
      }];
    },
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="rotinas" value={JSON.stringify(rotinas)} />

      <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <Field
          label="Aplicar em"
          hint={
            dataVigencia === dataMinima
              ? "A nova rotina entra hoje e passa a valer para as proximas aulas."
              : "A rotina atual continua valendo ate o dia anterior da data escolhida."
          }
        >
          <Input
            type="date"
            name="data_vigencia"
            min={dataMinima}
            value={dataVigencia}
            onChange={(evento) => setDataVigencia(evento.target.value)}
            required
            disabled={pendente}
          />
        </Field>
        <Field label="Motivo" hint="Opcional. Ex.: mudanca de trabalho ou aumento de frequencia.">
          <Textarea name="motivo" className="min-h-24" disabled={pendente} />
        </Field>
      </div>

      <SeletorRotinaSemanal
        slots={slots}
        selecionados={selecionados}
        onChange={setSelecionados}
        desabilitado={pendente}
      />

      <Alert title="Como funciona a vigencia" tone="info">
        A mudanca cria uma nova versao da rotina. O historico antigo nao e apagado; ele recebe uma
        data final e a nova rotina comeca na data escolhida.
      </Alert>

      {estado.status !== "inicial" ? (
        <Alert
          title={estado.status === "sucesso" ? "Mudanca programada" : "Nao foi possivel programar"}
          tone={estado.status === "erro" ? "danger" : "info"}
        >
          {estado.mensagem}
        </Alert>
      ) : null}

      <div className="flex justify-end border-t border-border pt-5">
        <Button type="submit" disabled={pendente || !rotinas.length}>
          {pendente
            ? "Salvando..."
            : dataVigencia === dataMinima
              ? "Aplicar rotina agora"
              : "Programar nova rotina"}
        </Button>
      </div>
    </form>
  );
}
