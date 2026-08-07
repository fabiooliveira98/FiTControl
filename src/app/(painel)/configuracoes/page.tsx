import { FormularioExcecaoAgenda } from "@/components/agenda/formulario-excecao-agenda";
import { FormularioFaixaDisponibilidade } from "@/components/agenda/formulario-faixa-disponibilidade";
import { GradeDisponibilidade } from "@/components/agenda/grade-disponibilidade";
import { ListaExcecoesAgenda } from "@/components/agenda/lista-excecoes-agenda";
import { Alert } from "@/components/ui/alert";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { obterDataAtualSaoPaulo } from "@/features/agenda/datas";
import { buscarConfiguracaoAgenda } from "@/features/agenda/queries";

export default async function ConfiguracoesPage() {
  const configuracao = await buscarConfiguracaoAgenda();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuracoes"
        title="Defina quando a agenda pode receber alunos."
        description="Aplique uma faixa semanal em poucos cliques e use excecoes pontuais sem alterar a rotina das outras semanas."
      />

      {!configuracao.bancoPreparado ? (
        <Alert title="Nao foi possivel carregar a agenda" tone="danger">
          {configuracao.mensagemErro}
        </Alert>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <CardTitle>Faixa semanal</CardTitle>
          <CardDescription className="mt-3 mb-6">
            Configure varios dias de uma vez. O padrao inicial e de segunda a sexta,
            das 05:00 as 20:00.
          </CardDescription>
          <FormularioFaixaDisponibilidade
            habilitado={
              configuracao.bancoPreparado &&
              configuracao.catalogoCompleto &&
              configuracao.excecoesPreparadas
            }
          />
        </Card>

        <Card className="p-5 sm:p-6">
          <CardTitle>Excecao por data</CardTitle>
          <CardDescription className="mt-3 mb-6">
            Abra um horario normalmente fechado ou bloqueie um compromisso sem mudar a
            semana recorrente.
          </CardDescription>
          <FormularioExcecaoAgenda
            habilitado={configuracao.bancoPreparado && configuracao.excecoesPreparadas}
            dataMinima={obterDataAtualSaoPaulo()}
          />
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Rotina recorrente</p>
          <h2 className="mt-2 font-display text-4xl">Ajustes por horario</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/55">
            O catalogo cobre o dia inteiro em intervalos de 30 minutos. Os horarios
            desligados continuam guardados e podem ser reativados quando necessario.
          </p>
        </div>
        <GradeDisponibilidade
          disponibilidades={configuracao.disponibilidades}
          horariosOcupados={configuracao.horariosOcupados}
        />
      </section>

      <Card className="p-5 sm:p-6">
        <CardTitle>Proximas excecoes</CardTitle>
        <CardDescription className="mt-3 mb-6">
          Aberturas e bloqueios futuros aplicados somente as datas indicadas.
        </CardDescription>
        <ListaExcecoesAgenda
          aberturas={configuracao.aberturas}
          bloqueios={configuracao.bloqueios}
        />
      </Card>
    </div>
  );
}
