import Link from "next/link";

import { AjustesFinanceiros } from "@/components/mensalidades/ajustes-financeiros";
import { FormularioMensalidade } from "@/components/mensalidades/formulario-mensalidade";
import { ListaMensalidades } from "@/components/mensalidades/lista-mensalidades";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { obterDataAtualSaoPaulo, somarDias } from "@/features/agenda/datas";
import {
  buscarAjustesFinanceirosPendentes,
  buscarAlunosParaFinanceiro,
  buscarMensalidades,
} from "@/features/mensalidades/queries";
import { filtroStatusMensalidadeSchema } from "@/features/mensalidades/schemas";
import type { StatusMensalidade } from "@/types/dominio";
import { cn } from "@/lib/utils";
import { formatarMoeda } from "@/utils/financeiro";

const filtros: Array<{ valor?: StatusMensalidade; rotulo: string }> = [
  { rotulo: "Todos" },
  { valor: "PENDENTE", rotulo: "Pendentes" },
  { valor: "ATRASADO", rotulo: "Atrasados" },
  { valor: "PAGO", rotulo: "Pagos" },
  { valor: "AJUSTE", rotulo: "Ajustes" },
];

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const parametros = await searchParams;
  const status = filtroStatusMensalidadeSchema.parse(parametros.status);
  const hoje = obterDataAtualSaoPaulo();
  const [alunos, mensalidades, ajustes] = await Promise.all([
    buscarAlunosParaFinanceiro(),
    buscarMensalidades({ status }),
    buscarAjustesFinanceirosPendentes(),
  ]);
  const totalAberto = mensalidades
    .filter((item) => item.status !== "PAGO")
    .reduce((total, item) => total + Number(item.valor_cobrado), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Financeiro"
        title="Controle simples para apoiar a operacao."
        description="Registre mensalidades, acompanhe vencimentos e transforme faltas sem reposicao em ajustes rastreaveis."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/48">Lancamentos</p>
          <p className="mt-2 font-display text-4xl">{mensalidades.length}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/48">Em aberto</p>
          <p className="mt-2 font-display text-3xl">{formatarMoeda(totalAberto)}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/48">Ajustes aguardando</p>
          <p className="mt-2 font-display text-4xl">{ajustes.length}</p>
        </Card>
      </div>

      <Card className="p-5 sm:p-7">
        <CardTitle>Novo lancamento</CardTitle>
        <CardDescription className="mt-2 mb-6">
          O financeiro permanece leve: aluno, valor, vencimento e situacao atual.
        </CardDescription>
        <FormularioMensalidade alunos={alunos} dataPadrao={somarDias(hoje, 30)} />
      </Card>

      <Card className="p-5 sm:p-7">
        <CardTitle>Ajustes por falta sem reposicao</CardTitle>
        <CardDescription className="mt-2 mb-6">
          Alunos que treinam de segunda a sexta aparecem aqui quando uma falta exige acerto financeiro.
        </CardDescription>
        <AjustesFinanceiros ajustes={ajustes} dataVencimento={somarDias(hoje, 30)} />
      </Card>

      <Card className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Historico financeiro</CardTitle>
            <CardDescription className="mt-2">
              Filtre a lista para agir primeiro sobre pendencias e atrasos.
            </CardDescription>
          </div>
          <nav className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Filtros financeiros">
            {filtros.map((filtro) => {
              const ativo = filtro.valor === status || (!filtro.valor && !status);
              return (
                <Link
                  key={filtro.rotulo}
                  href={filtro.valor ? `/financeiro?status=${filtro.valor}` : "/financeiro"}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold",
                    ativo
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground",
                  )}
                >
                  {filtro.rotulo}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-6">
          <ListaMensalidades mensalidades={mensalidades} />
        </div>
      </Card>
    </div>
  );
}
