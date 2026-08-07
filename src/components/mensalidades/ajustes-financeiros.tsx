import { FormularioAjusteFinanceiro } from "@/components/mensalidades/formulario-ajuste-financeiro";
import type { AjusteFinanceiroPendente } from "@/features/mensalidades/types";
import { formatarDataFinanceira } from "@/utils/financeiro";
import { formatarHorario } from "@/utils/agenda";

export function AjustesFinanceiros({
  ajustes,
  dataVencimento,
}: {
  ajustes: AjusteFinanceiroPendente[];
  dataVencimento: string;
}) {
  if (!ajustes.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-foreground/55">
        Nenhuma falta de aluno 5x aguardando ajuste.
      </p>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {ajustes.map((ajuste) => (
        <article key={ajuste.cancelamento.id} className="rounded-2xl border border-warning/20 bg-[rgba(154,103,0,0.05)] p-4">
          <p className="font-semibold">{ajuste.aluno.nome}</p>
          <p className="mt-1 text-xs text-foreground/55">
            Aula de {formatarDataFinanceira(ajuste.aula.data)} as {formatarHorario(ajuste.aula.horario_inicio)}
          </p>
          {ajuste.cancelamento.motivo ? (
            <p className="mt-2 text-sm text-foreground/65">{ajuste.cancelamento.motivo}</p>
          ) : null}
          <FormularioAjusteFinanceiro
            cancelamentoId={ajuste.cancelamento.id}
            dataVencimento={dataVencimento}
          />
        </article>
      ))}
    </div>
  );
}
