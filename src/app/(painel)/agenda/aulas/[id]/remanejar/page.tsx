import Link from "next/link";
import { notFound } from "next/navigation";

import { FormularioRemanejamento } from "@/components/reposicoes/formulario-remanejamento";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatarDataCurta, obterDataAtualSaoPaulo } from "@/features/agenda/datas";
import { buscarOpcoesRemanejamento } from "@/features/reposicoes/queries";
import { aulaIdSchema } from "@/features/reposicoes/schemas";

export default async function RemanejarAulaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ alunos?: string }>;
}) {
  const [{ id }, filtros] = await Promise.all([params, searchParams]);
  if (!aulaIdSchema.safeParse(id).success) notFound();

  const alunoIds = (filtros.alunos ?? "")
    .split(",")
    .map((alunoId) => alunoId.trim())
    .filter(Boolean);
  const opcoes = await buscarOpcoesRemanejamento(id, alunoIds);
  if (!opcoes) notFound();

  const nomes = opcoes.aula.participantes
    .filter((participante) => opcoes.aluno_ids.includes(participante.id))
    .map((participante) => participante.nome);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mudanca pontual"
        title="Remanejar aula"
        description={`${formatarDataCurta(opcoes.aula.data)} as ${opcoes.aula.horario_inicio.slice(0, 5)}. A rotina semanal nao sera alterada.`}
        actions={<Badge>{nomes.length > 1 ? `${nomes.length} participantes` : nomes[0] ?? "Aula"}</Badge>}
      />

      <Link
        href={`/painel?data=${opcoes.aula.data}`}
        className="inline-flex text-sm font-semibold text-primary hover:text-primary-strong"
      >
        Voltar para o dia
      </Link>

      <Card className="p-5 sm:p-7">
        <div className="mb-6 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
            Participantes
          </p>
          <p className="mt-2 font-display text-2xl font-semibold">{nomes.join(", ") || "Nenhum participante"}</p>
        </div>
        <FormularioRemanejamento
          opcoes={opcoes}
          dataMinima={obterDataAtualSaoPaulo()}
        />
      </Card>
    </div>
  );
}
