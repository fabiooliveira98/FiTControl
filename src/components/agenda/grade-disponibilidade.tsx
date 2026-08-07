import { ChevronDown, LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { alternarDisponibilidadeAction } from "@/features/agenda/actions";
import type { OcupacaoHorarioRecorrente } from "@/features/agenda/types";
import { cn } from "@/lib/utils";
import type { DisponibilidadeSemanal } from "@/types/dominio";
import {
  compararHorarios,
  diasSemana,
  formatarDiaSemana,
  formatarHorario,
  horariosSeSobrepoem,
} from "@/utils/agenda";

export function GradeDisponibilidade({
  disponibilidades,
  horariosOcupados,
}: {
  disponibilidades: DisponibilidadeSemanal[];
  horariosOcupados: OcupacaoHorarioRecorrente[];
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {diasSemana.map((dia, indice) => {
        const horarios = disponibilidades
          .filter((item) => item.dia_semana === dia)
          .sort((a, b) => compararHorarios(a.horario_inicio, b.horario_inicio));
        const ativos = horarios.filter((item) => item.ativo).length;

        return (
          <details
            key={dia}
            open={indice === 0}
            className="group rounded-3xl border border-border bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 sm:px-5">
              <div>
                <h3 className="font-display text-2xl">{formatarDiaSemana(dia)}</h3>
                <p className="mt-1 text-xs text-foreground/50">
                  {ativos} de {horarios.length} inicios disponiveis
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{ativos ? "Com expediente" : "Fechado"}</Badge>
                <ChevronDown
                  size={18}
                  className="text-primary transition group-open:rotate-180"
                />
              </div>
            </summary>

            <div className="border-t border-border p-4 sm:p-5">
              <p className="mb-3 text-xs leading-5 text-foreground/55">
                Toque em um inicio para alternar. Cada aula ocupa uma hora; horarios em uso
                por alunos fixos ficam protegidos.
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {horarios.map((item) => {
                  const horario = formatarHorario(item.horario_inicio);
                  const ocupacoesSobrepostas = horariosOcupados.filter(
                    (ocupacao) =>
                      ocupacao.dia_semana === dia &&
                      horariosSeSobrepoem(
                        item.horario_inicio,
                        item.horario_fim,
                        ocupacao.horario_inicio,
                        ocupacao.horario_fim,
                      ),
                  );
                  const ocupacaoExata = ocupacoesSobrepostas.find(
                    (ocupacao) => ocupacao.horario_inicio === horario,
                  );
                  const bloqueadoPorAula = ocupacoesSobrepostas.length > 0;
                  const alunos = Array.from(
                    new Set(ocupacoesSobrepostas.flatMap((ocupacao) => ocupacao.alunos)),
                  );
                  const referencia = ocupacaoExata
                    ? alunos.join(", ") || "Em uso"
                    : ocupacoesSobrepostas.length
                      ? `Conflito com ${ocupacoesSobrepostas[0].horario_inicio}`
                      : null;

                  return (
                    <form key={item.id} action={alternarDisponibilidadeAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="ativo" value={String(item.ativo)} />
                      <button
                        type="submit"
                        disabled={bloqueadoPorAula}
                        aria-pressed={item.ativo}
                        aria-label={
                          bloqueadoPorAula
                            ? `${horario}, indisponivel por ${referencia}`
                            : `${item.ativo ? "Desativar" : "Ativar"} ${horario}`
                        }
                        title={referencia ?? undefined}
                        className={cn(
                          "flex h-12 w-full flex-col items-center justify-center rounded-xl border px-1 text-xs font-semibold transition",
                          item.ativo
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-surface-muted text-foreground/55 hover:border-primary/40 hover:text-foreground",
                          bloqueadoPorAula &&
                            "cursor-not-allowed border-border-strong bg-surface-strong text-foreground",
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {bloqueadoPorAula ? <LockKeyhole size={12} /> : null}
                          {horario}
                        </span>
                        {referencia ? (
                          <span className="mt-0.5 max-w-full truncate text-[0.58rem] font-medium opacity-65">
                            {referencia}
                          </span>
                        ) : null}
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
