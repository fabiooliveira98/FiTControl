import Link from "next/link";
import { notFound } from "next/navigation";

import { FormularioCancelamento } from "@/components/reposicoes/formulario-cancelamento";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatarDataCurta } from "@/features/agenda/datas";
import { buscarDetalheAula } from "@/features/reposicoes/queries";
import { aulaIdSchema } from "@/features/reposicoes/schemas";

export default async function DetalheAulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!aulaIdSchema.safeParse(id).success) notFound();
  const aula = await buscarDetalheAula(id);
  if (!aula) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Detalhes da aula"
        title={`${formatarDataCurta(aula.data)} · ${aula.horario_inicio.slice(0, 5)}`}
        description="Cancele apenas a participacao necessária. Em duplas e trios, os outros alunos continuam agendados."
        actions={<Badge>{aula.status}</Badge>}
      />

      <Link href={`/agenda?data=${aula.data}&visualizacao=semana`} className="inline-flex text-sm font-semibold text-primary">
        Voltar para a semana
      </Link>

      <div className="grid gap-4 lg:grid-cols-2">
        {aula.participantes.map((participante) => (
          <Card key={participante.id} className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl">{participante.nome}</h2>
                <p className="mt-1 text-sm text-foreground/55">
                  {participante.telefone || participante.email || "Sem contato informado"}
                </p>
              </div>
              <Badge tone={participante.cancelamento ? "danger" : "success"}>
                {participante.cancelamento ? "Cancelado" : "Confirmado"}
              </Badge>
            </div>

            {participante.cancelamento ? (
              <Alert title="Participacao cancelada" tone="warning" className="mt-5">
                {participante.cancelamento.motivo || "Sem motivo informado."}
                {participante.reposicao
                  ? ` Reposicao: ${participante.reposicao.status.toLowerCase()}.`
                  : participante.cancelamento.ajustado_financeiro
                    ? " Encaminhado para ajuste financeiro."
                    : ""}
              </Alert>
            ) : (
              <FormularioCancelamento
                aulaId={aula.id}
                alunoId={participante.id}
                alunoCincoVezes={participante.treina_segunda_a_sexta}
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
