import { notFound } from "next/navigation";

import { FormularioAlteracaoRotina } from "@/components/alteracoes-rotina/formulario-alteracao-rotina";
import { HistoricoAlteracoesRotina } from "@/components/alteracoes-rotina/historico-alteracoes-rotina";
import { FormularioAluno } from "@/components/alunos/formulario-aluno";
import { ResumoRotinaAluno } from "@/components/alunos/resumo-rotina-aluno";
import { ResumoFinanceiroAluno } from "@/components/mensalidades/resumo-financeiro-aluno";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { buscarAlteracoesRotinaAluno } from "@/features/alteracoes-rotina/queries";
import { obterDataAtualSaoPaulo } from "@/features/agenda/datas";
import { buscarAlunoPorId, buscarSlotsCadastroAluno } from "@/features/alunos/queries";
import { alunoIdSchema } from "@/features/alunos/schemas";
import { buscarMensalidades } from "@/features/mensalidades/queries";

export default async function EditarAlunoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criado?: string; atualizado?: string; sincronizacao?: string }>;
}) {
  const { id } = await params;
  const retorno = await searchParams;
  if (!alunoIdSchema.safeParse(id).success) notFound();

  const [aluno, slots, historicoAlteracoes, mensalidades] = await Promise.all([
    buscarAlunoPorId(id),
    buscarSlotsCadastroAluno(id),
    buscarAlteracoesRotinaAluno(id),
    buscarMensalidades({ alunoId: id, limite: 6 }),
  ]);
  if (!aluno) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Editar aluno"
        title={aluno.nome}
        description="Atualize o cadastro e programe mudancas de rotina sem perder o historico das aulas anteriores."
        actions={aluno.treina_segunda_a_sexta ? <Badge tone="warning">5x na semana</Badge> : undefined}
      />

      {retorno.criado === "1" ? (
        <Alert title="Aluno cadastrado e horarios reservados">
          A rotina foi salva. As proximas aulas serao mantidas sincronizadas com a agenda.
        </Alert>
      ) : retorno.atualizado === "1" ? (
        <Alert title="Dados cadastrais atualizados">
          Nome, contato, status e observacoes foram salvos. A rotina e alterada na secao propria abaixo.
        </Alert>
      ) : null}

      {retorno.sincronizacao === "pendente" ? (
        <Alert title="Cadastro salvo; agenda aguardando sincronizacao" tone="warning">
          O aluno nao foi apagado. A agenda tentara materializar as aulas novamente ao ser aberta.
        </Alert>
      ) : null}

      <ResumoRotinaAluno rotinas={aluno.rotinas} />

      <Card className="p-5 sm:p-7">
        <CardTitle>Dados cadastrais</CardTitle>
        <CardDescription className="mt-2 mb-6">
          Nome, contato, status e observacoes. A rotina possui um fluxo separado para proteger o historico.
        </CardDescription>
        <FormularioAluno slots={slots} aluno={aluno} />
      </Card>

      <Card className="p-5 sm:p-7">
        <CardTitle>Alteracao permanente de rotina</CardTitle>
        <CardDescription className="mt-2 mb-6">
          A rotina atual vale ate o dia anterior da vigencia escolhida. Salve com a data de hoje
          para aplicar agora ou escolha uma data futura para programar.
        </CardDescription>
        <FormularioAlteracaoRotina
          aluno={aluno}
          slots={slots}
          dataMinima={obterDataAtualSaoPaulo()}
        />
      </Card>

      <Card className="p-5 sm:p-7">
        <CardTitle>Historico de mudancas</CardTitle>
        <CardDescription className="mt-2 mb-5">
          A tela mostra as mudancas mais recentes para evitar leitura longa. Mudancas aplicadas
          permanecem registradas e agendadas podem ser canceladas antes da vigencia.
        </CardDescription>
        <HistoricoAlteracoesRotina alunoId={aluno.id} historico={historicoAlteracoes} />
      </Card>

      <Card className="p-5 sm:p-7">
        <CardTitle>Resumo financeiro</CardTitle>
        <CardDescription className="mt-2 mb-5">
          Ultimos lancamentos deste aluno. O controle completo permanece na tela Financeiro.
        </CardDescription>
        <ResumoFinanceiroAluno mensalidades={mensalidades} />
      </Card>
    </div>
  );
}
