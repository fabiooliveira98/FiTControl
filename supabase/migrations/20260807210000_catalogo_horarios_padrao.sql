-- Catalogo semanal completo: inicios de 30 em 30 minutos entre 00:00 e 22:30.
-- Aberturas por data permitem excecoes sem alterar a rotina semanal.

create table if not exists public.aberturas_agenda (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  horario_inicio time not null,
  horario_fim time not null,
  motivo text,
  created_at timestamptz not null default now(),
  unique (data, horario_inicio)
);

create index if not exists idx_aberturas_agenda_data
on public.aberturas_agenda (data, horario_inicio);

drop trigger if exists tr_abertura_uma_hora on public.aberturas_agenda;
create trigger tr_abertura_uma_hora
before insert or update on public.aberturas_agenda
for each row execute function public.validar_horario_uma_hora();

drop trigger if exists tr_abertura_inicio_meia_hora on public.aberturas_agenda;
create trigger tr_abertura_inicio_meia_hora
before insert or update on public.aberturas_agenda
for each row execute function public.validar_inicio_meia_hora();

alter table public.aberturas_agenda enable row level security;

drop policy if exists "Usuarios autenticados podem gerenciar aberturas"
on public.aberturas_agenda;

create policy "Usuarios autenticados podem gerenciar aberturas"
on public.aberturas_agenda for all
to authenticated
using (true)
with check (true);

with dias(dia) as (
  values
    ('SEGUNDA'::public.dia_semana),
    ('TERCA'::public.dia_semana),
    ('QUARTA'::public.dia_semana),
    ('QUINTA'::public.dia_semana),
    ('SEXTA'::public.dia_semana),
    ('SABADO'::public.dia_semana),
    ('DOMINGO'::public.dia_semana)
),
horarios as (
  select
    (time '00:00' + indice * interval '30 minutes')::time as horario_inicio
  from generate_series(0, 45) as indice
)
insert into public.disponibilidade_semanal (
  dia_semana,
  horario_inicio,
  horario_fim,
  ativo
)
select
  dias.dia,
  horarios.horario_inicio,
  (horarios.horario_inicio + interval '1 hour')::time,
  dias.dia in (
    'SEGUNDA'::public.dia_semana,
    'TERCA'::public.dia_semana,
    'QUARTA'::public.dia_semana,
    'QUINTA'::public.dia_semana,
    'SEXTA'::public.dia_semana
  )
  and horarios.horario_inicio between time '05:00' and time '20:00'
from dias
cross join horarios
on conflict (dia_semana, horario_inicio) do nothing;

create or replace function public.aplicar_faixa_disponibilidade(
  p_dias public.dia_semana[],
  p_horario_inicio time,
  p_ultimo_inicio time,
  p_desativar_dias boolean default false
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_total integer;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if p_dias is null or cardinality(p_dias) = 0 then
    raise exception 'Selecione pelo menos um dia.';
  end if;

  if not p_desativar_dias and p_horario_inicio > p_ultimo_inicio then
    raise exception 'O primeiro horario deve ser anterior ao ultimo.';
  end if;

  update public.disponibilidade_semanal as disponibilidade
  set ativo =
    (not p_desativar_dias and horario_inicio between p_horario_inicio and p_ultimo_inicio)
    or exists (
      select 1
      from public.horarios_recorrentes_alunos h
      where h.dia_semana = disponibilidade.dia_semana
        and h.horario_inicio = disponibilidade.horario_inicio
        and h.ativo = true
    )
  where disponibilidade.dia_semana = any(p_dias);

  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

revoke all on function public.aplicar_faixa_disponibilidade(
  public.dia_semana[],
  time,
  time,
  boolean
) from public;

grant execute on function public.aplicar_faixa_disponibilidade(
  public.dia_semana[],
  time,
  time,
  boolean
) to authenticated;

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
