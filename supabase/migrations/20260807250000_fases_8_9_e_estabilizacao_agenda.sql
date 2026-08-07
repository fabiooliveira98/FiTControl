-- Estabiliza a materializacao e adiciona as estruturas das Fases 8 e 9.

do $$
begin
  create type public.status_alteracao_rotina as enum ('AGENDADA', 'APLICADA', 'CANCELADA');
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.alteracoes_rotina_alunos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  data_vigencia date not null,
  status public.status_alteracao_rotina not null default 'AGENDADA',
  motivo text,
  aplicada_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itens_alteracao_rotina (
  id uuid primary key default gen_random_uuid(),
  alteracao_rotina_id uuid not null references public.alteracoes_rotina_alunos(id) on delete cascade,
  dia_semana public.dia_semana not null,
  horario_inicio time not null,
  horario_fim time not null,
  capacidade_maxima smallint not null default 1 check (capacidade_maxima between 1 and 3),
  created_at timestamptz not null default now(),
  unique (alteracao_rotina_id, dia_semana)
);

alter table public.horarios_recorrentes_alunos
  add column if not exists vigente_de date;

alter table public.horarios_recorrentes_alunos
  add column if not exists vigente_ate date;

alter table public.horarios_recorrentes_alunos
  add column if not exists alteracao_rotina_id uuid
    references public.alteracoes_rotina_alunos(id) on delete set null;

update public.horarios_recorrentes_alunos
set vigente_de = least(created_at::date, current_date)
where vigente_de is null;

alter table public.horarios_recorrentes_alunos
  alter column vigente_de set default current_date;

alter table public.horarios_recorrentes_alunos
  alter column vigente_de set not null;

alter table public.mensalidades
  add column if not exists cancelamento_id uuid
    references public.cancelamentos(id) on delete set null;

create unique index if not exists uq_alteracao_rotina_agendada_data
on public.alteracoes_rotina_alunos (aluno_id, data_vigencia)
where status = 'AGENDADA';

create index if not exists idx_alteracoes_rotina_status_data
on public.alteracoes_rotina_alunos (status, data_vigencia);

create index if not exists idx_horarios_recorrentes_vigencia
on public.horarios_recorrentes_alunos (aluno_id, vigente_de, vigente_ate);

create unique index if not exists uq_mensalidade_cancelamento
on public.mensalidades (cancelamento_id)
where cancelamento_id is not null;

drop trigger if exists tr_alteracoes_rotina_updated_at on public.alteracoes_rotina_alunos;
create trigger tr_alteracoes_rotina_updated_at
before update on public.alteracoes_rotina_alunos
for each row execute function public.atualizar_updated_at();

drop trigger if exists tr_item_alteracao_uma_hora on public.itens_alteracao_rotina;
create trigger tr_item_alteracao_uma_hora
before insert or update on public.itens_alteracao_rotina
for each row execute function public.validar_horario_uma_hora();

drop trigger if exists tr_item_alteracao_inicio_meia_hora on public.itens_alteracao_rotina;
create trigger tr_item_alteracao_inicio_meia_hora
before insert or update on public.itens_alteracao_rotina
for each row execute function public.validar_inicio_meia_hora();

alter table public.alteracoes_rotina_alunos enable row level security;
alter table public.itens_alteracao_rotina enable row level security;

drop policy if exists "Usuarios autenticados podem gerenciar alteracoes de rotina"
on public.alteracoes_rotina_alunos;
create policy "Usuarios autenticados podem gerenciar alteracoes de rotina"
on public.alteracoes_rotina_alunos for all
to authenticated
using (true)
with check (true);

drop policy if exists "Usuarios autenticados podem gerenciar itens de alteracao"
on public.itens_alteracao_rotina;
create policy "Usuarios autenticados podem gerenciar itens de alteracao"
on public.itens_alteracao_rotina for all
to authenticated
using (true)
with check (true);

-- Corrige novamente duplicidades antigas para que esta migration seja autocontida.
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
set
  ativo = false,
  vigente_ate = coalesce(vigente_ate, current_date - 1)
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
      and h.vigente_de <= a.data
      and (h.vigente_ate is null or h.vigente_ate >= a.data)
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

create or replace function public.aplicar_alteracao_rotina(
  p_alteracao_id uuid
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_alteracao public.alteracoes_rotina_alunos%rowtype;
  v_item public.itens_alteracao_rotina%rowtype;
  v_grupo_id uuid;
  v_tipo public.tipo_aula;
  v_total_dias_uteis integer;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  select * into v_alteracao
  from public.alteracoes_rotina_alunos
  where id = p_alteracao_id
  for update;

  if v_alteracao.id is null then
    raise exception 'Alteracao de rotina nao encontrada.';
  end if;

  if v_alteracao.status <> 'AGENDADA' then
    return false;
  end if;

  if v_alteracao.data_vigencia > current_date then
    raise exception 'A data de vigencia desta alteracao ainda nao chegou.';
  end if;

  if not exists (
    select 1 from public.itens_alteracao_rotina
    where alteracao_rotina_id = p_alteracao_id
  ) then
    raise exception 'A alteracao precisa de pelo menos um horario.';
  end if;

  for v_item in
    select *
    from public.itens_alteracao_rotina
    where alteracao_rotina_id = p_alteracao_id
    order by dia_semana, horario_inicio
  loop
    if not exists (
      select 1
      from public.disponibilidade_semanal
      where dia_semana = v_item.dia_semana
        and horario_inicio = v_item.horario_inicio
        and ativo = true
    ) then
      raise exception 'O horario de % as % nao esta disponivel.', v_item.dia_semana, v_item.horario_inicio;
    end if;

    if exists (
      select 1
      from public.horarios_recorrentes_alunos h
      where h.aluno_id <> v_alteracao.aluno_id
        and h.dia_semana = v_item.dia_semana
        and h.ativo = true
        and h.horario_inicio < v_item.horario_fim
        and h.horario_fim > v_item.horario_inicio
        and h.horario_inicio <> v_item.horario_inicio
    ) then
      raise exception 'O horario de % as % se sobrepoe a outra aula.', v_item.dia_semana, v_item.horario_inicio;
    end if;
  end loop;

  delete from public.alunos_aulas aa
  using public.aulas a
  where aa.aula_id = a.id
    and aa.aluno_id = v_alteracao.aluno_id
    and a.origem = 'ROTINA'
    and a.data >= v_alteracao.data_vigencia;

  delete from public.aulas a
  where a.origem = 'ROTINA'
    and a.data >= v_alteracao.data_vigencia
    and not exists (
      select 1 from public.alunos_aulas aa where aa.aula_id = a.id
    );

  update public.horarios_recorrentes_alunos
  set
    ativo = false,
    vigente_ate = v_alteracao.data_vigencia - 1
  where aluno_id = v_alteracao.aluno_id
    and ativo = true;

  delete from public.integrantes_grupos_aula
  where aluno_id = v_alteracao.aluno_id;

  for v_item in
    select *
    from public.itens_alteracao_rotina
    where alteracao_rotina_id = p_alteracao_id
    order by dia_semana, horario_inicio
  loop
    select h.grupo_aula_id
      into v_grupo_id
    from public.horarios_recorrentes_alunos h
    join public.grupos_aula g on g.id = h.grupo_aula_id and g.ativo = true
    where h.dia_semana = v_item.dia_semana
      and h.horario_inicio = v_item.horario_inicio
      and h.horario_fim = v_item.horario_fim
      and h.ativo = true
      and (
        select count(*)
        from public.integrantes_grupos_aula i
        where i.grupo_aula_id = h.grupo_aula_id
      ) < g.capacidade_maxima
    order by h.created_at
    limit 1;

    if v_grupo_id is null then
      if exists (
        select 1
        from public.horarios_recorrentes_alunos h
        where h.dia_semana = v_item.dia_semana
          and h.horario_inicio = v_item.horario_inicio
          and h.horario_fim = v_item.horario_fim
          and h.ativo = true
      ) then
        raise exception 'O horario de % as % esta lotado.', v_item.dia_semana, v_item.horario_inicio;
      end if;

      v_tipo := case v_item.capacidade_maxima
        when 1 then 'INDIVIDUAL'::public.tipo_aula
        when 2 then 'DUPLA'::public.tipo_aula
        else 'TRIO'::public.tipo_aula
      end;

      insert into public.grupos_aula (
        nome_referencia,
        tipo,
        capacidade_maxima,
        ativo
      ) values (
        v_item.dia_semana || ' ' || v_item.horario_inicio || ' - alteracao de rotina',
        v_tipo,
        v_item.capacidade_maxima,
        true
      ) returning id into v_grupo_id;
    end if;

    insert into public.integrantes_grupos_aula (grupo_aula_id, aluno_id)
    values (v_grupo_id, v_alteracao.aluno_id)
    on conflict (grupo_aula_id, aluno_id) do nothing;

    insert into public.horarios_recorrentes_alunos (
      aluno_id,
      grupo_aula_id,
      dia_semana,
      horario_inicio,
      horario_fim,
      ativo,
      vigente_de,
      alteracao_rotina_id
    ) values (
      v_alteracao.aluno_id,
      v_grupo_id,
      v_item.dia_semana,
      v_item.horario_inicio,
      v_item.horario_fim,
      true,
      v_alteracao.data_vigencia,
      p_alteracao_id
    );

    v_grupo_id := null;
  end loop;

  select count(*) into v_total_dias_uteis
  from public.itens_alteracao_rotina
  where alteracao_rotina_id = p_alteracao_id
    and dia_semana in (
      'SEGUNDA'::public.dia_semana,
      'TERCA'::public.dia_semana,
      'QUARTA'::public.dia_semana,
      'QUINTA'::public.dia_semana,
      'SEXTA'::public.dia_semana
    );

  update public.alunos
  set treina_segunda_a_sexta = v_total_dias_uteis = 5
  where id = v_alteracao.aluno_id;

  update public.alteracoes_rotina_alunos
  set status = 'APLICADA', aplicada_em = now()
  where id = p_alteracao_id;

  return true;
end;
$$;

create or replace function public.aplicar_alteracoes_rotina_pendentes(
  p_ate_data date default current_date
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_alteracao record;
  v_total integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  for v_alteracao in
    select id
    from public.alteracoes_rotina_alunos
    where status = 'AGENDADA'
      and data_vigencia <= least(p_ate_data, current_date)
    order by data_vigencia, created_at
  loop
    begin
      if public.aplicar_alteracao_rotina(v_alteracao.id) then
        v_total := v_total + 1;
      end if;
    exception
      when others then
        raise warning 'Alteracao de rotina % nao aplicada: %', v_alteracao.id, sqlerrm;
    end;
  end loop;

  return v_total;
end;
$$;

revoke all on function public.materializar_aulas_periodo(date, date) from public;
revoke all on function public.aplicar_alteracao_rotina(uuid) from public;
revoke all on function public.aplicar_alteracoes_rotina_pendentes(date) from public;

grant execute on function public.materializar_aulas_periodo(date, date) to authenticated;
grant execute on function public.aplicar_alteracao_rotina(uuid) to authenticated;
grant execute on function public.aplicar_alteracoes_rotina_pendentes(date) to authenticated;
