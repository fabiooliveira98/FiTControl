import { FormularioAluno } from "@/components/alunos/formulario-aluno";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { buscarSlotsCadastroAluno } from "@/features/alunos/queries";

export default async function NovoAlunoPage() {
  const slots = await buscarSlotsCadastroAluno();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Novo aluno"
        title="Cadastre a pessoa e sua semana em uma etapa."
        description="Somente horarios ativos e com vaga podem ser selecionados. A capacidade escolhida no primeiro cadastro define se o slot sera individual, dupla ou trio."
      />

      {!slots.length ? (
        <Alert title="Nenhum horario disponivel" tone="warning">
          Configure a grade semanal antes de cadastrar a rotina do aluno.
        </Alert>
      ) : null}

      <Card className="p-5 sm:p-7">
        <FormularioAluno slots={slots} />
      </Card>
    </div>
  );
}
