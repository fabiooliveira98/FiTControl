import { Badge } from "@/components/ui/badge";
import type { MensalidadeComAluno } from "@/features/mensalidades/types";
import { formatarDataFinanceira, formatarMoeda, rotuloStatusMensalidade } from "@/utils/financeiro";

export function ResumoFinanceiroAluno({ mensalidades }: { mensalidades: MensalidadeComAluno[] }) {
  if (!mensalidades.length) {
    return <p className="text-sm text-foreground/55">Nenhum lancamento financeiro para este aluno.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {mensalidades.slice(0, 6).map((mensalidade) => (
        <article key={mensalidade.id} className="rounded-2xl border border-border bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display text-2xl">{formatarMoeda(mensalidade.valor_cobrado)}</p>
            <Badge tone={mensalidade.status === "PAGO" ? "success" : mensalidade.status === "ATRASADO" ? "danger" : "default"}>
              {rotuloStatusMensalidade(mensalidade.status)}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-foreground/50">
            Vencimento {formatarDataFinanceira(mensalidade.data_vencimento)}
          </p>
        </article>
      ))}
    </div>
  );
}
