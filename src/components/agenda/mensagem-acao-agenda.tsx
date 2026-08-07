import { Alert } from "@/components/ui/alert";
import type { EstadoAcaoAgenda } from "@/features/agenda/types";

export function MensagemAcaoAgenda({ estado }: { estado: EstadoAcaoAgenda }) {
  if (estado.status === "inicial" || !estado.mensagem) return null;

  return (
    <Alert title={estado.status === "sucesso" ? "Tudo certo" : "Nao foi possivel"} tone={estado.status === "erro" ? "danger" : "info"}>
      {estado.mensagem}
    </Alert>
  );
}
