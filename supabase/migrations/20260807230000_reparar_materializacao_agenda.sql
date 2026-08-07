-- Repara rotinas legadas duplicadas e limpa apenas ocorrencias futuras derivadas.

with rotinas_ordenadas as (
  select
    id,
    row_number() over (
      partition by aluno_id, dia_semana
      order by updated_at desc, created_at desc, id desc
    ) as ordem
  from public.horarios_recorrentes_alunos
  where ativo = true
)
update public.horarios_recorrentes_alunos
set ativo = false
where id in (
  select id
  from rotinas_ordenadas
  where ordem > 1
);

delete from public.alunos_aulas aa
using public.aulas a
where aa.aula_id = a.id
  and a.data >= current_date
  and a.origem = 'ROTINA'
  and not exists (
    select 1
    from public.horarios_recorrentes_alunos h
    where h.aluno_id = aa.aluno_id
      and h.grupo_aula_id is not distinct from a.grupo_aula_id
      and h.horario_inicio = a.horario_inicio
      and h.ativo = true
      and h.dia_semana = case extract(isodow from a.data)
        when 1 then 'SEGUNDA'::public.dia_semana
        when 2 then 'TERCA'::public.dia_semana
        when 3 then 'QUARTA'::public.dia_semana
        when 4 then 'QUINTA'::public.dia_semana
        when 5 then 'SEXTA'::public.dia_semana
        when 6 then 'SABADO'::public.dia_semana
        when 7 then 'DOMINGO'::public.dia_semana
      end
  );

delete from public.aulas a
where a.data >= current_date
  and a.origem = 'ROTINA'
  and not exists (
    select 1
    from public.alunos_aulas aa
    where aa.aula_id = a.id
  );

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
