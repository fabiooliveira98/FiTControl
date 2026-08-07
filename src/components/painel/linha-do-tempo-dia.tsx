import { CalendarOff } from "lucide-react";

import { CartaoAulaDia } from "@/components/painel/cartao-aula-dia";
import { EmptyState } from "@/components/ui/empty-state";
import type { AulaDoDia } from "@/features/painel/types";

export function LinhaDoTempoDia({ aulas, hoje }: { aulas: AulaDoDia[]; hoje: string }) {
  if (!aulas.length) {
    return (
      <EmptyState
        icon={<CalendarOff className="size-6" />}
        title="Nenhuma aula neste dia"
        description="Os horarios livres continuam disponiveis logo abaixo para novos encaixes."
      />
    );
  }

  return (
    <div className="relative space-y-3 before:absolute before:bottom-7 before:left-[5px] before:top-7 before:w-px before:bg-border sm:before:left-[8px]">
      {aulas.map((aula) => (
        <CartaoAulaDia key={aula.id} aula={aula} hoje={hoje} />
      ))}
    </div>
  );
}
