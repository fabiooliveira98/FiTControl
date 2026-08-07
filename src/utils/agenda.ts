import type { DiaSemana, StatusAluno, StatusMensalidade } from "@/types/dominio";

export const diasSemana: DiaSemana[] = [
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
  "DOMINGO",
];

export const statusAlunoOptions: StatusAluno[] = ["ATIVO", "PAUSADO", "INATIVO"];
export const statusMensalidadeOptions: StatusMensalidade[] = [
  "PENDENTE",
  "PAGO",
  "ATRASADO",
  "AJUSTE",
];

const primeiroInicioAgendaMinutos = 0;
const ultimoInicioAgendaMinutos = 22 * 60 + 30;
const intervaloInicioMinutos = 30;

export function formatarDiaSemana(dia: DiaSemana) {
  return {
    SEGUNDA: "Segunda",
    TERCA: "Terça",
    QUARTA: "Quarta",
    QUINTA: "Quinta",
    SEXTA: "Sexta",
    SABADO: "Sábado",
    DOMINGO: "Domingo",
  }[dia];
}

export function formatarHorario(horario: string) {
  return horario.slice(0, 5);
}

export function montarIntervalosPadrao() {
  return Array.from(
    {
      length:
        (ultimoInicioAgendaMinutos - primeiroInicioAgendaMinutos) /
          intervaloInicioMinutos +
        1,
    },
    (_, index) => {
      const minutos = primeiroInicioAgendaMinutos + index * intervaloInicioMinutos;
      const hora = Math.floor(minutos / 60);
      const minuto = minutos % 60;
      return `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`;
    },
  );
}

export function horarioParaMinutos(horario: string) {
  const [hora, minuto] = formatarHorario(horario).split(":").map(Number);
  return hora * 60 + minuto;
}

export function horariosSeSobrepoem(
  inicioA: string,
  fimA: string,
  inicioB: string,
  fimB: string,
) {
  return (
    horarioParaMinutos(inicioA) < horarioParaMinutos(fimB) &&
    horarioParaMinutos(fimA) > horarioParaMinutos(inicioB)
  );
}

export function calcularHorarioFim(horarioInicio: string) {
  const [hora, minuto] = horarioInicio.split(":").map(Number);
  const minutosTotais = hora * 60 + minuto + 60;
  const horaFim = Math.floor(minutosTotais / 60) % 24;
  const minutoFim = minutosTotais % 60;

  return `${horaFim.toString().padStart(2, "0")}:${minutoFim
    .toString()
    .padStart(2, "0")}`;
}

export function compararHorarios(a: string, b: string) {
  return formatarHorario(a).localeCompare(formatarHorario(b));
}
