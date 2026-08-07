-- Regras e operacoes atomicas das Fases 4 a 7.

create unique index if not exists uq_horario_recorrente_aluno_slot
on public.horarios_recorrentes_alunos (aluno_id, dia_semana, horario_inicio)
where ativo = true;

create unique index if not exists uq_reposicao_cancelamento
on public.reposicoes (cancelamento_id);

create index if not exists idx_aulas_data_horario
on public.aulas (data, horario_inicio);

create index if not exists idx_reposicoes_status
on public.reposicoes (status);

create or replace function public.validar_capacidade_grupo()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_capacidade smallint;
  v_ocupacao integer;
begin
  select capacidade_maxima
    into v_capacidade
  from public.grupos_aula
  where id = new.grupo_aula_id;

  select count(*)
    into v_ocupacao
  from public.integrantes_grupos_aula
  where grupo_aula_id = new.grupo_aula_id
    and id is distinct from new.id;

  if v_ocupacao >= v_capacidade then
    raise exception 'O grupo ja atingiu a capacidade maxima de % aluno(s).', v_capacidade;
  end if;

  return new;
end;
$$;

drop trigger if exists tr_validar_capacidade_grupo on public.integrantes_grupos_aula;
create trigger tr_validar_capacidade_grupo
before insert or update on public.integrantes_grupos_aula
for each row execute function public.validar_capacidade_grupo();

create or replace function public.validar_capacidade_aula()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_ocupacao integer;
  v_capacidade integer;
begin
  select coalesce(g.capacidade_maxima, 3)
    into v_capacidade
  from public.aulas a
  left join public.grupos_aula g on g.id = a.grupo_aula_id
  where a.id = new.aula_id;

  select count(*)
    into v_ocupacao
  from public.alunos_aulas aa
  where aa.aula_id = new.aula_id
    and aa.id is distinct from new.id
    and not exists (
      select 1
      from public.cancelamentos c
      where c.aula_id = aa.aula_id
        and c.aluno_id = aa.aluno_id
    );

  if v_ocupacao >= coalesce(v_capacidade, 3) then
    raise exception 'A aula ja atingiu a capacidade maxima de % aluno(s).', coalesce(v_capacidade, 3);
  end if;

  return new;
end;
$$;

drop trigger if exists tr_validar_capacidade_aula on public.alunos_aulas;
create trigger tr_validar_capacidade_aula
before insert or update on public.alunos_aulas
for each row execute function public.validar_capacidade_aula();

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
  v_total integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if p_data_fim < p_data_inicio or p_data_fim > p_data_inicio + 366 then
    raise exception 'Intervalo de materializacao invalido.';
  end if;

  for v_rotina in
    select
      h.grupo_aula_id,
      h.dia_semana,
      h.horario_inicio,
      h.horario_fim,
      min(h.id) as horario_recorrente_id
    from public.horarios_recorrentes_alunos h
    join public.alunos al on al.id = h.aluno_id and al.status = 'ATIVO'
    join public.grupos_aula g on g.id = h.grupo_aula_id and g.ativo = true
    where h.ativo = true
      and h.grupo_aula_id is not null
    group by h.grupo_aula_id, h.dia_semana, h.horario_inicio, h.horario_fim
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
    loop
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
        v_rotina.horario_recorrente_id,
        v_data,
        v_rotina.horario_inicio,
        v_rotina.horario_fim,
        'AGENDADA',
        'ROTINA'
      )
      on conflict (data, horario_inicio, grupo_aula_id)
      do update set horario_fim = excluded.horario_fim
      returning id into v_aula_id;

      insert into public.alunos_aulas (aula_id, aluno_id)
      select v_aula_id, h.aluno_id
      from public.horarios_recorrentes_alunos h
      join public.alunos al on al.id = h.aluno_id and al.status = 'ATIVO'
      where h.grupo_aula_id = v_rotina.grupo_aula_id
        and h.dia_semana = v_rotina.dia_semana
        and h.horario_inicio = v_rotina.horario_inicio
        and h.ativo = true
      on conflict (aula_id, aluno_id) do nothing;

      v_total := v_total + 1;
    end loop;
  end loop;

  return v_total;
end;
$$;

create or replace function public.cancelar_aula_aluno(
  p_aula_id uuid,
  p_aluno_id uuid,
  p_motivo text default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_cancelamento_id uuid;
  v_treina_cinco_vezes boolean;
  v_restantes integer;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if not exists (
    select 1 from public.alunos_aulas
    where aula_id = p_aula_id and aluno_id = p_aluno_id
  ) then
    raise exception 'O aluno nao participa desta aula.';
  end if;

  select treina_segunda_a_sexta
    into v_treina_cinco_vezes
  from public.alunos
  where id = p_aluno_id;

  insert into public.cancelamentos (aula_id, aluno_id, motivo, ajustado_financeiro)
  values (p_aula_id, p_aluno_id, nullif(trim(p_motivo), ''), v_treina_cinco_vezes)
  returning id into v_cancelamento_id;

  if not v_treina_cinco_vezes then
    insert into public.reposicoes (cancelamento_id, status)
    values (v_cancelamento_id, 'PENDENTE');
  end if;

  select count(*)
    into v_restantes
  from public.alunos_aulas aa
  where aa.aula_id = p_aula_id
    and not exists (
      select 1 from public.cancelamentos c
      where c.aula_id = aa.aula_id and c.aluno_id = aa.aluno_id
    );

  if v_restantes = 0 then
    update public.aulas set status = 'CANCELADA' where id = p_aula_id;
  end if;

  return v_cancelamento_id;
end;
$$;

create or replace function public.confirmar_reposicao(
  p_reposicao_id uuid,
  p_data date,
  p_horario_inicio time
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_aluno_id uuid;
  v_aula_id uuid;
  v_horario_fim time := p_horario_inicio + interval '1 hour';
  v_dia public.dia_semana;
  v_ocupacao integer;
  v_existem_aulas integer;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  select c.aluno_id
    into v_aluno_id
  from public.reposicoes r
  join public.cancelamentos c on c.id = r.cancelamento_id
  where r.id = p_reposicao_id and r.status = 'PENDENTE'
  for update of r;

  if v_aluno_id is null then
    raise exception 'Reposicao pendente nao encontrada.';
  end if;

  v_dia := case extract(isodow from p_data)
    when 1 then 'SEGUNDA'::public.dia_semana
    when 2 then 'TERCA'::public.dia_semana
    when 3 then 'QUARTA'::public.dia_semana
    when 4 then 'QUINTA'::public.dia_semana
    when 5 then 'SEXTA'::public.dia_semana
    when 6 then 'SABADO'::public.dia_semana
    when 7 then 'DOMINGO'::public.dia_semana
  end;

  if not exists (
    select 1 from public.disponibilidade_semanal
    where dia_semana = v_dia
      and horario_inicio = p_horario_inicio
      and ativo = true
  ) then
    raise exception 'O horario escolhido nao faz parte da disponibilidade.';
  end if;

  if exists (
    select 1 from public.bloqueios_agenda
    where data = p_data and horario_inicio = p_horario_inicio
  ) then
    raise exception 'O horario escolhido esta bloqueado.';
  end if;

  if exists (
    select 1
    from public.aulas a
    join public.alunos_aulas aa on aa.aula_id = a.id
    where a.data = p_data
      and a.horario_inicio = p_horario_inicio
      and aa.aluno_id = v_aluno_id
      and a.status <> 'CANCELADA'
      and not exists (
        select 1 from public.cancelamentos c
        where c.aula_id = a.id and c.aluno_id = aa.aluno_id
      )
  ) then
    raise exception 'O aluno ja possui aula nesse horario.';
  end if;

  select count(*)
    into v_ocupacao
  from public.aulas a
  join public.alunos_aulas aa on aa.aula_id = a.id
  where a.data = p_data
    and a.horario_inicio = p_horario_inicio
    and a.status <> 'CANCELADA'
    and not exists (
      select 1 from public.cancelamentos c
      where c.aula_id = a.id and c.aluno_id = aa.aluno_id
    );

  if v_ocupacao >= 3 then
    raise exception 'O horario escolhido esta lotado.';
  end if;

  select a.id
    into v_aula_id
  from public.aulas a
  left join public.grupos_aula g on g.id = a.grupo_aula_id
  where a.data = p_data
    and a.horario_inicio = p_horario_inicio
    and a.status <> 'CANCELADA'
    and (
      select count(*)
      from public.alunos_aulas aa
      where aa.aula_id = a.id
        and not exists (
          select 1 from public.cancelamentos c
          where c.aula_id = a.id and c.aluno_id = aa.aluno_id
        )
    ) < coalesce(g.capacidade_maxima, 3)
  order by a.created_at
  limit 1;

  select count(*)
    into v_existem_aulas
  from public.aulas
  where data = p_data
    and horario_inicio = p_horario_inicio
    and status <> 'CANCELADA';

  if v_aula_id is null and v_existem_aulas > 0 then
    raise exception 'O formato da aula existente nao permite outro aluno.';
  end if;

  if v_aula_id is null then
    insert into public.aulas (
      data,
      horario_inicio,
      horario_fim,
      status,
      origem,
      observacoes
    )
    values (
      p_data,
      p_horario_inicio,
      v_horario_fim,
      'REPOSTA',
      'REPOSICAO',
      'Aula criada para reposicao.'
    )
    returning id into v_aula_id;
  end if;

  insert into public.alunos_aulas (aula_id, aluno_id)
  values (v_aula_id, v_aluno_id);

  update public.reposicoes
  set aula_reposicao_id = v_aula_id,
      status = 'CONFIRMADA'
  where id = p_reposicao_id;

  return v_aula_id;
end;
$$;

alter function public.atualizar_updated_at() set search_path = '';
alter function public.validar_horario_uma_hora() set search_path = '';

revoke all on function public.materializar_aulas_periodo(date, date) from public;
revoke all on function public.cancelar_aula_aluno(uuid, uuid, text) from public;
revoke all on function public.confirmar_reposicao(uuid, date, time) from public;

grant execute on function public.materializar_aulas_periodo(date, date) to authenticated;
grant execute on function public.cancelar_aula_aluno(uuid, uuid, text) to authenticated;
grant execute on function public.confirmar_reposicao(uuid, date, time) to authenticated;
