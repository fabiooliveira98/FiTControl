import { cancelarAlteracaoRotinaAction } from "@/features/alteracoes-rotina/actions";
import type { HistoricoAlteracoesRotinaResumo } from "@/features/alteracoes-rotina/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatarDiaSemana, formatarHorario } from "@/utils/agenda";

function formatarData(data: string) {
  return data.split("-").reverse().join("/");
}

export function HistoricoAlteracoesRotina({
  alunoId,
  historico,
}: {
  alunoId: string;
  historico: HistoricoAlteracoesRotinaResumo;
}) {
  const { alteracoes, total, limite } = historico;
  const existemMaisRegistros = total > alteracoes.length;

  if (!alteracoes.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-foreground/55">
        Nenhuma mudanca permanente registrada.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-surface-muted px-4 py-3">
        <p className="text-sm font-semibold">
          Mostrando {alteracoes.length} de {total} mudanca(s) mais recente(s)
        </p>
        <p className="mt-1 text-xs leading-5 text-foreground/55">
          O historico completo fica preservado no banco. A tela mostra apenas as ultimas {limite}
          para manter a leitura leve.
        </p>
      </div>

      {alteracoes.map((alteracao) => (
        <article key={alteracao.id} className="rounded-2xl border border-border bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">Vigencia em {formatarData(alteracao.data_vigencia)}</p>
                <Badge
                  tone={
                    alteracao.status === "APLICADA"
                      ? "success"
                      : alteracao.status === "CANCELADA"
                        ? "danger"
                        : "warning"
                  }
                >
                  {alteracao.status.toLowerCase()}
                </Badge>
              </div>
              {alteracao.motivo ? (
                <p className="mt-2 text-sm text-foreground/58">{alteracao.motivo}</p>
              ) : null}
            </div>

            {alteracao.status === "AGENDADA" ? (
              <form action={cancelarAlteracaoRotinaAction}>
                <input type="hidden" name="alteracao_id" value={alteracao.id} />
                <input type="hidden" name="aluno_id" value={alunoId} />
                <Button type="submit" variant="ghost" size="sm">Cancelar mudanca</Button>
              </form>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {alteracao.itens.map((item) => (
              <span key={item.id} className="rounded-xl bg-surface-muted px-3 py-2 text-xs font-medium">
                {formatarDiaSemana(item.dia_semana)} {formatarHorario(item.horario_inicio)}
              </span>
            ))}
          </div>
        </article>
      ))}

      {existemMaisRegistros ? (
        <p className="rounded-2xl border border-dashed border-border-strong px-4 py-3 text-center text-xs text-foreground/55">
          Existem mudancas antigas registradas. A paginacao completa fica planejada para a proxima
          evolucao deste historico.
        </p>
      ) : null}
    </div>
  );
}
