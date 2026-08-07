-- Painel diario: finalizacao, cancelamento em lote e remanejamento resolvido.

do $$
begin
  create type public.tipo_cancelamento as enum ('FALTA', 'REMANEJAMENTO');
exception
  when duplicate_object then null;
end;
$$;

alter table public.aulas
  add column if not exists finalizada_em timestamptz;

alter table public.aulas
  add column if not exists finalizacao_automatica boolean not null default false;

alter table public.cancelamentos
  add column if not exists tipo public.tipo_cancelamento not null default 'FALTA';

create or replace function public.finalizar_aula(
  p_aula_id uuid
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_atualizada uuid;
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  update public.aulas
  set
    status = 'CONCLUIDA',
    finalizada_em = now(),
    finalizacao_automatica = false
  where id = p_aula_id
    and data <= v_hoje
    and status in ('AGENDADA', 'REPOSTA')
  returning id into v_atualizada;

  return v_atualizada is not null;
end;
$$;

create or replace function public.finalizar_dia(
  p_data date
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_total integer;
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if p_data > v_hoje then
    raise exception 'Nao e possivel finalizar um dia futuro.';
  end if;

  update public.aulas
  set
    status = 'CONCLUIDA',
    finalizada_em = now(),
    finalizacao_automatica = false
  where data = p_data
    and status in ('AGENDADA', 'REPOSTA');

  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

create or replace function public.finalizar_aulas_anteriores()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_total integer;
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  update public.aulas
  set
    status = 'CONCLUIDA',
    finalizada_em = now(),
    finalizacao_automatica = true
  where data < v_hoje
    and status in ('AGENDADA', 'REPOSTA');

  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

create or replace function public.cancelar_participacoes_aula(
  p_aula_id uuid,
  p_aluno_ids uuid[],
  p_motivo text default null
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_aluno_id uuid;
  v_total integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if p_aluno_ids is null or cardinality(p_aluno_ids) = 0 then
    raise exception 'Selecione pelo menos um aluno.';
  end if;

  for v_aluno_id in
    select distinct unnest(p_aluno_ids)
  loop
    if exists (
      select 1
      from public.cancelamentos
      where aula_id = p_aula_id and aluno_id = v_aluno_id
    ) then
      raise exception 'Um dos alunos selecionados ja possui cancelamento nesta aula.';
    end if;

    perform public.cancelar_aula_aluno(p_aula_id, v_aluno_id, p_motivo);
    v_total := v_total + 1;
  end loop;

  return v_total;
end;
$$;

create or replace function public.remanejar_participacoes_aula(
  p_aula_origem_id uuid,
  p_aluno_ids uuid[],
  p_data date,
  p_horario_inicio time,
  p_motivo text default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_aula_origem public.aulas%rowtype;
  v_aula_destino_id uuid;
  v_aluno_id uuid;
  v_cancelamento_id uuid;
  v_horario_fim time := p_horario_inicio + interval '1 hour';
  v_dia public.dia_semana;
  v_quantidade integer;
  v_ocupacao integer;
  v_capacidade integer;
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_agora time := (now() at time zone 'America/Sao_Paulo')::time;
  v_restantes integer;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if p_aluno_ids is null or cardinality(p_aluno_ids) = 0 then
    raise exception 'Selecione pelo menos um aluno.';
  end if;

  select * into v_aula_origem
  from public.aulas
  where id = p_aula_origem_id
    and status <> 'CANCELADA'
  for update;

  if v_aula_origem.id is null then
    raise exception 'Aula de origem nao encontrada.';
  end if;

  if p_data < v_hoje or (p_data = v_hoje and p_horario_inicio <= v_agora) then
    raise exception 'Escolha um horario futuro para o remanejamento.';
  end if;

  if p_data = v_aula_origem.data
    and p_horario_inicio = v_aula_origem.horario_inicio then
    raise exception 'O destino precisa ser diferente da aula de origem.';
  end if;

  perform public.materializar_aulas_periodo(p_data, p_data);

  select count(distinct aluno_id)
    into v_quantidade
  from public.alunos_aulas aa
  where aa.aula_id = p_aula_origem_id
    and aa.aluno_id = any(p_aluno_ids)
    and not exists (
      select 1
      from public.cancelamentos c
      where c.aula_id = p_aula_origem_id
        and c.aluno_id = aa.aluno_id
    );

  if v_quantidade <> (
    select count(distinct selecionados.id)
    from unnest(p_aluno_ids) as selecionados(id)
  ) then
    raise exception 'Um dos alunos nao participa mais da aula de origem.';
  end if;

  if exists (
    select 1
    from public.alunos
    where id = any(p_aluno_ids)
      and treina_segunda_a_sexta = true
  ) then
    raise exception 'Aluno 5x segue para ajuste financeiro e nao possui remanejamento padrao.';
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
    select 1
    from public.disponibilidade_semanal
    where dia_semana = v_dia
      and horario_inicio = p_horario_inicio
      and ativo = true
  ) and not exists (
    select 1
    from public.aberturas_agenda
    where data = p_data
      and horario_inicio = p_horario_inicio
  ) then
    raise exception 'O horario escolhido nao esta disponivel nesta data.';
  end if;

  if exists (
    select 1
    from public.bloqueios_agenda
    where data = p_data
      and horario_inicio < v_horario_fim
      and horario_fim > p_horario_inicio
  ) then
    raise exception 'O horario escolhido se sobrepoe a um bloqueio.';
  end if;

  if exists (
    select 1
    from public.aulas a
    join public.alunos_aulas aa on aa.aula_id = a.id
    where a.data = p_data
      and a.status <> 'CANCELADA'
      and a.horario_inicio < v_horario_fim
      and a.horario_fim > p_horario_inicio
      and aa.aluno_id = any(p_aluno_ids)
      and not exists (
        select 1
        from public.cancelamentos c
        where c.aula_id = a.id and c.aluno_id = aa.aluno_id
      )
  ) then
    raise exception 'Um dos alunos ja possui aula no horario escolhido.';
  end if;

  if exists (
    select 1
    from public.aulas
    where data = p_data
      and status <> 'CANCELADA'
      and horario_inicio < v_horario_fim
      and horario_fim > p_horario_inicio
      and horario_inicio <> p_horario_inicio
  ) then
    raise exception 'O horario escolhido se sobrepoe a outra aula.';
  end if;

  select
    a.id,
    coalesce(g.capacidade_maxima, 3),
    (
      select count(*)
      from public.alunos_aulas aa
      where aa.aula_id = a.id
        and not exists (
          select 1
          from public.cancelamentos c
          where c.aula_id = a.id and c.aluno_id = aa.aluno_id
        )
    )
    into v_aula_destino_id, v_capacidade, v_ocupacao
  from public.aulas a
  left join public.grupos_aula g on g.id = a.grupo_aula_id
  where a.data = p_data
    and a.horario_inicio = p_horario_inicio
    and a.status <> 'CANCELADA'
  order by a.created_at
  limit 1;

  if v_aula_destino_id is not null and v_ocupacao + v_quantidade > v_capacidade then
    raise exception 'O horario escolhido nao possui vagas suficientes.';
  end if;

  if v_aula_destino_id is not null and exists (
    select 1
    from public.alunos_aulas aa
    where aa.aula_id = v_aula_destino_id
      and aa.aluno_id = any(p_aluno_ids)
  ) then
    raise exception 'Um dos alunos ja possui historico na aula de destino.';
  end if;

  if v_aula_destino_id is null then
    insert into public.aulas (
      grupo_aula_id,
      data,
      horario_inicio,
      horario_fim,
      status,
      origem,
      observacoes
    ) values (
      v_aula_origem.grupo_aula_id,
      p_data,
      p_horario_inicio,
      v_horario_fim,
      'REPOSTA',
      'REMANEJAMENTO',
      'Aula criada por remanejamento direto.'
    ) returning id into v_aula_destino_id;
  end if;

  for v_aluno_id in
    select distinct unnest(p_aluno_ids)
  loop
    insert into public.cancelamentos (
      aula_id,
      aluno_id,
      motivo,
      ajustado_financeiro,
      tipo
    ) values (
      p_aula_origem_id,
      v_aluno_id,
      nullif(trim(p_motivo), ''),
      false,
      'REMANEJAMENTO'
    ) returning id into v_cancelamento_id;

    insert into public.alunos_aulas (aula_id, aluno_id)
    values (v_aula_destino_id, v_aluno_id)
    on conflict (aula_id, aluno_id) do nothing;

    insert into public.reposicoes (
      cancelamento_id,
      aula_reposicao_id,
      status,
      observacoes
    ) values (
      v_cancelamento_id,
      v_aula_destino_id,
      'CONFIRMADA',
      'Remanejamento direto confirmado no mesmo fluxo.'
    );
  end loop;

  select count(*)
    into v_restantes
  from public.alunos_aulas aa
  where aa.aula_id = p_aula_origem_id
    and not exists (
      select 1
      from public.cancelamentos c
      where c.aula_id = aa.aula_id and c.aluno_id = aa.aluno_id
    );

  if v_restantes = 0 then
    update public.aulas
    set status = 'CANCELADA'
    where id = p_aula_origem_id;
  end if;

  return v_aula_destino_id;
end;
$$;

revoke all on function public.finalizar_aula(uuid) from public;
revoke all on function public.finalizar_dia(date) from public;
revoke all on function public.finalizar_aulas_anteriores() from public;
revoke all on function public.cancelar_participacoes_aula(uuid, uuid[], text) from public;
revoke all on function public.remanejar_participacoes_aula(uuid, uuid[], date, time, text) from public;

grant execute on function public.finalizar_aula(uuid) to authenticated;
grant execute on function public.finalizar_dia(date) to authenticated;
grant execute on function public.finalizar_aulas_anteriores() to authenticated;
grant execute on function public.cancelar_participacoes_aula(uuid, uuid[], text) to authenticated;
grant execute on function public.remanejar_participacoes_aula(uuid, uuid[], date, time, text) to authenticated;
