import type { StatusMensalidade } from "@/types/dominio";

export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarDataFinanceira(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${data}T12:00:00Z`));
}

export function rotuloStatusMensalidade(status: StatusMensalidade) {
  return {
    PENDENTE: "Pendente",
    PAGO: "Pago",
    ATRASADO: "Atrasado",
    AJUSTE: "Ajuste",
  }[status];
}
