import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  excluirMensalidadeAction,
  marcarMensalidadePagaAction,
} from "@/features/mensalidades/actions";
import type { MensalidadeComAluno } from "@/features/mensalidades/types";
import { formatarDataFinanceira, formatarMoeda, rotuloStatusMensalidade } from "@/utils/financeiro";

function tomStatus(status: MensalidadeComAluno["status"]) {
  if (status === "PAGO") return "success" as const;
  if (status === "ATRASADO") return "danger" as const;
  if (status === "AJUSTE") return "warning" as const;
  return "default" as const;
}

export function ListaMensalidades({ mensalidades }: { mensalidades: MensalidadeComAluno[] }) {
  if (!mensalidades.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-foreground/55">
        Nenhum lancamento encontrado para este filtro.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {mensalidades.map((mensalidade) => (
        <article
          key={mensalidade.id}
          className="grid gap-4 rounded-2xl border border-border bg-white p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] md:items-center"
        >
          <div>
            <Link href={`/alunos/${mensalidade.aluno.id}`} className="font-semibold hover:text-primary">
              {mensalidade.aluno.nome}
            </Link>
            <p className="mt-1 text-xs text-foreground/50">
              Vence em {formatarDataFinanceira(mensalidade.data_vencimento)}
            </p>
          </div>
          <div>
            <p className="font-display text-2xl">{formatarMoeda(mensalidade.valor_cobrado)}</p>
            {mensalidade.data_pagamento ? (
              <p className="mt-1 text-xs text-success">
                Pago em {formatarDataFinanceira(mensalidade.data_pagamento)}
              </p>
            ) : null}
          </div>
          <div>
            <Badge tone={tomStatus(mensalidade.status)}>
              {rotuloStatusMensalidade(mensalidade.status)}
            </Badge>
            {mensalidade.observacao ? (
              <p className="mt-2 line-clamp-2 text-xs text-foreground/52">{mensalidade.observacao}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {mensalidade.status !== "PAGO" ? (
              <form action={marcarMensalidadePagaAction}>
                <input type="hidden" name="mensalidade_id" value={mensalidade.id} />
                <Button type="submit" size="sm">Marcar pago</Button>
              </form>
            ) : null}
            <form action={excluirMensalidadeAction}>
              <input type="hidden" name="mensalidade_id" value={mensalidade.id} />
              <Button type="submit" variant="ghost" size="sm">Excluir</Button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
