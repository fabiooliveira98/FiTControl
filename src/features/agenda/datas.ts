import type { DiaSemana } from "@/types/dominio";

const todosOsDias: DiaSemana[] = [
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
  "DOMINGO",
];

export type VisualizacaoAgenda = "semana" | "mes";

function paraDataIso(data: Date) {
  return data.toISOString().slice(0, 10);
}

export function obterDataAtualSaoPaulo() {
  const dataLocal = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return dataLocal;
}

export function obterIntervaloSemanaAtual() {
  return obterIntervaloSemana(obterDataAtualSaoPaulo());
}

export function somarDias(dataIso: string, quantidade: number) {
  const data = new Date(`${dataIso}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + quantidade);
  return paraDataIso(data);
}

export function obterDiaSemana(dataIso: string): DiaSemana {
  const indice = new Date(`${dataIso}T12:00:00Z`).getUTCDay();
  return {
    0: "DOMINGO",
    1: "SEGUNDA",
    2: "TERCA",
    3: "QUARTA",
    4: "QUINTA",
    5: "SEXTA",
    6: "SABADO",
  }[indice] as DiaSemana;
}

export function obterIntervaloSemana(dataReferencia: string) {
  const hoje = new Date(`${dataReferencia}T12:00:00Z`);
  const diaAtual = hoje.getUTCDay();
  const distanciaSegunda = diaAtual === 0 ? -6 : 1 - diaAtual;
  const inicio = new Date(hoje);
  inicio.setUTCDate(hoje.getUTCDate() + distanciaSegunda);

  const dias = todosOsDias.map((dia, indice) => {
    const data = new Date(inicio);
    data.setUTCDate(inicio.getUTCDate() + indice);

    return { dia, data: paraDataIso(data) };
  });

  return {
    inicio: dias[0].data,
    fim: dias[dias.length - 1].data,
    dias,
  };
}

export function obterIntervaloMes(dataReferencia: string) {
  const data = new Date(`${dataReferencia}T12:00:00Z`);
  const inicio = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), 1, 12));
  const fim = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + 1, 0, 12));
  const dias: Array<{ dia: DiaSemana; data: string }> = [];

  for (let atual = new Date(inicio); atual <= fim; atual.setUTCDate(atual.getUTCDate() + 1)) {
    const dataIso = paraDataIso(atual);
    dias.push({ dia: obterDiaSemana(dataIso), data: dataIso });
  }

  return { inicio: paraDataIso(inicio), fim: paraDataIso(fim), dias };
}

export function obterIntervaloAgenda(
  dataReferencia: string,
  visualizacao: VisualizacaoAgenda,
) {
  return visualizacao === "mes"
    ? obterIntervaloMes(dataReferencia)
    : obterIntervaloSemana(dataReferencia);
}

export function navegarPeriodo(
  dataReferencia: string,
  visualizacao: VisualizacaoAgenda,
  direcao: -1 | 1,
) {
  if (visualizacao === "semana") return somarDias(dataReferencia, direcao * 7);

  const data = new Date(`${dataReferencia}T12:00:00Z`);
  data.setUTCMonth(data.getUTCMonth() + direcao, 1);
  return paraDataIso(data);
}

export function formatarTituloPeriodo(
  inicio: string,
  fim: string,
  visualizacao: VisualizacaoAgenda,
) {
  if (visualizacao === "mes") {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${inicio}T12:00:00Z`));
  }

  const formatador = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
  return `${formatador.format(new Date(`${inicio}T12:00:00Z`))} a ${formatador.format(
    new Date(`${fim}T12:00:00Z`),
  )}`;
}

export function formatarDataCurta(dataIso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${dataIso}T12:00:00Z`));
}
