-- Cada aluno pode possuir no maximo uma rotina ativa por dia da semana.

create or replace function public.validar_uma_rotina_aluno_por_dia()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ativo and exists (
    select 1
    from public.horarios_recorrentes_alunos h
    where h.aluno_id = new.aluno_id
      and h.dia_semana = new.dia_semana
      and h.ativo = true
      and h.id is distinct from new.id
  ) then
    raise exception 'O aluno ja possui um horario ativo neste dia da semana.';
  end if;

  return new;
end;
$$;

drop trigger if exists tr_uma_rotina_aluno_por_dia
on public.horarios_recorrentes_alunos;

create trigger tr_uma_rotina_aluno_por_dia
before insert or update on public.horarios_recorrentes_alunos
for each row execute function public.validar_uma_rotina_aluno_por_dia();
