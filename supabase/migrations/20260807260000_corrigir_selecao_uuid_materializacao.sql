-- PostgreSQL nao oferece min(uuid). Seleciona uma rotina representativa por ordenacao.

create or replace function public.materializar_aulas_periodo(
  p_data_inicio date,
  p_data_fim date
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_rotina record;
  v_data date;
  v_aula_id uuid;
  v_horario_recorrente_id uuid;
  v_total integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if p_data_fim < p_data_inicio or p_data_fim > p_data_inicio + 366 then
    raise exception 'Intervalo de materializacao invalido.';
  end if;

  for v_rotina in
    select distinct
      h.grupo_aula_id,
      h.dia_semana,
      h.horario_inicio,
      h.horario_fim
    from public.horarios_recorrentes_alunos h
    join public.alunos al on al.id = h.aluno_id and al.status = 'ATIVO'
    join public.grupos_aula g on g.id = h.grupo_aula_id and g.ativo = true
    where h.ativo = true
      and h.grupo_aula_id is not null
      and h.vigente_de <= p_data_fim
      and (h.vigente_ate is null or h.vigente_ate >= p_data_inicio)
  loop
    for v_data in
      select serie::date
      from generate_series(p_data_inicio, p_data_fim, interval '1 day') serie
      where extract(isodow from serie) = case v_rotina.dia_semana
        when 'SEGUNDA' then 1
        when 'TERCA' then 2
        when 'QUARTA' then 3
        when 'QUINTA' then 4
        when 'SEXTA' then 5
        when 'SABADO' then 6
        when 'DOMINGO' then 7
      end
      and exists (
        select 1
        from public.horarios_recorrentes_alunos h
        join public.alunos al on al.id = h.aluno_id and al.status = 'ATIVO'
        where h.grupo_aula_id = v_rotina.grupo_aula_id
          and h.dia_semana = v_rotina.dia_semana
          and h.horario_inicio = v_rotina.horario_inicio
          and h.ativo = true
          and h.vigente_de <= serie::date
          and (h.vigente_ate is null or h.vigente_ate >= serie::date)
      )
    loop
      select h.id
        into v_horario_recorrente_id
      from public.horarios_recorrentes_alunos h
      where h.grupo_aula_id = v_rotina.grupo_aula_id
        and h.dia_semana = v_rotina.dia_semana
        and h.horario_inicio = v_rotina.horario_inicio
        and h.ativo = true
        and h.vigente_de <= v_data
        and (h.vigente_ate is null or h.vigente_ate >= v_data)
      order by h.created_at, h.id
      limit 1;

      insert into public.aulas (
        grupo_aula_id,
        horario_recorrente_id,
        data,
        horario_inicio,
        horario_fim,
        status,
        origem
      )
      values (
        v_rotina.grupo_aula_id,
        v_horario_recorrente_id,
        v_data,
        v_rotina.horario_inicio,
        v_rotina.horario_fim,
        'AGENDADA',
        'ROTINA'
      )
      on conflict (data, horario_inicio, grupo_aula_id)
      do update set
        horario_fim = excluded.horario_fim,
        horario_recorrente_id = excluded.horario_recorrente_id
      returning id into v_aula_id;

      delete from public.alunos_aulas aa
      where aa.aula_id = v_aula_id
        and not exists (
          select 1
          from public.horarios_recorrentes_alunos h
          join public.alunos al on al.id = h.aluno_id and al.status = 'ATIVO'
          where h.grupo_aula_id = v_rotina.grupo_aula_id
            and h.dia_semana = v_rotina.dia_semana
            and h.horario_inicio = v_rotina.horario_inicio
            and h.aluno_id = aa.aluno_id
            and h.ativo = true
            and h.vigente_de <= v_data
            and (h.vigente_ate is null or h.vigente_ate >= v_data)
        );

      insert into public.alunos_aulas (aula_id, aluno_id)
      select v_aula_id, h.aluno_id
      from public.horarios_recorrentes_alunos h
      join public.alunos al on al.id = h.aluno_id and al.status = 'ATIVO'
      where h.grupo_aula_id = v_rotina.grupo_aula_id
        and h.dia_semana = v_rotina.dia_semana
        and h.horario_inicio = v_rotina.horario_inicio
        and h.ativo = true
        and h.vigente_de <= v_data
        and (h.vigente_ate is null or h.vigente_ate >= v_data)
      on conflict (aula_id, aluno_id) do nothing;

      v_total := v_total + 1;
    end loop;
  end loop;

  return v_total;
end;
$$;

revoke all on function public.materializar_aulas_periodo(date, date) from public;
grant execute on function public.materializar_aulas_periodo(date, date) to authenticated;
