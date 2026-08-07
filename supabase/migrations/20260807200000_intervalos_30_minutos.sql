-- Inicios a cada 30 minutos e protecao contra sobreposicao de aulas de 1 hora.

create or replace function public.validar_inicio_meia_hora()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if extract(minute from new.horario_inicio) not in (0, 30)
    or extract(second from new.horario_inicio) <> 0 then
    raise exception 'O horario deve iniciar em minuto 00 ou 30.';
  end if;

  return new;
end;
$$;

drop trigger if exists tr_disponibilidade_inicio_meia_hora on public.disponibilidade_semanal;
create trigger tr_disponibilidade_inicio_meia_hora
before insert or update on public.disponibilidade_semanal
for each row execute function public.validar_inicio_meia_hora();

drop trigger if exists tr_bloqueio_inicio_meia_hora on public.bloqueios_agenda;
create trigger tr_bloqueio_inicio_meia_hora
before insert or update on public.bloqueios_agenda
for each row execute function public.validar_inicio_meia_hora();

drop trigger if exists tr_rotina_inicio_meia_hora on public.horarios_recorrentes_alunos;
create trigger tr_rotina_inicio_meia_hora
before insert or update on public.horarios_recorrentes_alunos
for each row execute function public.validar_inicio_meia_hora();

drop trigger if exists tr_aula_inicio_meia_hora on public.aulas;
create trigger tr_aula_inicio_meia_hora
before insert or update on public.aulas
for each row execute function public.validar_inicio_meia_hora();

create or replace function public.validar_sobreposicao_rotina()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ativo and exists (
    select 1
    from public.horarios_recorrentes_alunos h
    where h.dia_semana = new.dia_semana
      and h.ativo = true
      and h.id is distinct from new.id
      and h.horario_inicio < new.horario_fim
      and h.horario_fim > new.horario_inicio
      and not (
        h.horario_inicio = new.horario_inicio
        and h.horario_fim = new.horario_fim
        and h.grupo_aula_id is not distinct from new.grupo_aula_id
      )
  ) then
    raise exception 'O horario se sobrepoe a outra rotina ativa.';
  end if;

  return new;
end;
$$;

drop trigger if exists tr_validar_sobreposicao_rotina on public.horarios_recorrentes_alunos;
create trigger tr_validar_sobreposicao_rotina
before insert or update on public.horarios_recorrentes_alunos
for each row execute function public.validar_sobreposicao_rotina();

create or replace function public.validar_conflito_aluno_aula()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_aula public.aulas%rowtype;
begin
  select * into v_aula
  from public.aulas
  where id = new.aula_id;

  if exists (
    select 1
    from public.alunos_aulas aa
    join public.aulas a on a.id = aa.aula_id
    where aa.aluno_id = new.aluno_id
      and aa.aula_id <> new.aula_id
      and a.data = v_aula.data
      and a.status <> 'CANCELADA'
      and a.horario_inicio < v_aula.horario_fim
      and a.horario_fim > v_aula.horario_inicio
      and not exists (
        select 1
        from public.cancelamentos c
        where c.aula_id = aa.aula_id
          and c.aluno_id = aa.aluno_id
      )
  ) then
    raise exception 'O aluno ja possui outra aula que se sobrepoe a este horario.';
  end if;

  return new;
end;
$$;

drop trigger if exists tr_validar_conflito_aluno_aula on public.alunos_aulas;
create trigger tr_validar_conflito_aluno_aula
before insert or update on public.alunos_aulas
for each row execute function public.validar_conflito_aluno_aula();

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
  v_capacidade integer;
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
    select 1
    from public.disponibilidade_semanal
    where dia_semana = v_dia
      and horario_inicio = p_horario_inicio
      and ativo = true
  ) then
    raise exception 'O horario escolhido nao faz parte da disponibilidade.';
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
      and a.horario_inicio < v_horario_fim
      and a.horario_fim > p_horario_inicio
      and aa.aluno_id = v_aluno_id
      and a.status <> 'CANCELADA'
      and not exists (
        select 1
        from public.cancelamentos c
        where c.aula_id = a.id and c.aluno_id = aa.aluno_id
      )
  ) then
    raise exception 'O aluno ja possui aula em horario sobreposto.';
  end if;

  if exists (
    select 1
    from public.aulas a
    where a.data = p_data
      and a.status <> 'CANCELADA'
      and a.horario_inicio < v_horario_fim
      and a.horario_fim > p_horario_inicio
      and a.horario_inicio <> p_horario_inicio
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
    into v_aula_id, v_capacidade, v_ocupacao
  from public.aulas a
  left join public.grupos_aula g on g.id = a.grupo_aula_id
  where a.data = p_data
    and a.horario_inicio = p_horario_inicio
    and a.status <> 'CANCELADA'
  order by a.created_at
  limit 1;

  if v_aula_id is not null and v_ocupacao >= v_capacidade then
    raise exception 'O horario escolhido esta lotado.';
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

revoke all on function public.confirmar_reposicao(uuid, date, time) from public;
grant execute on function public.confirmar_reposicao(uuid, date, time) to authenticated;
