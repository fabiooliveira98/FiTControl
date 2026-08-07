create extension if not exists pgcrypto;

create type status_aluno as enum ('ATIVO', 'PAUSADO', 'INATIVO');
create type status_mensalidade as enum ('PENDENTE', 'PAGO', 'ATRASADO', 'AJUSTE');
create type status_reposicao as enum ('PENDENTE', 'CONFIRMADA', 'CONCLUIDA', 'DISPENSADA');
create type dia_semana as enum ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO');
create type tipo_aula as enum ('INDIVIDUAL', 'DUPLA', 'TRIO');
create type status_aula as enum ('AGENDADA', 'CANCELADA', 'REPOSTA', 'CONCLUIDA');

create table if not exists public.alunos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  status status_aluno not null default 'ATIVO',
  treina_segunda_a_sexta boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.disponibilidade_semanal (
  id uuid primary key default gen_random_uuid(),
  dia_semana dia_semana not null,
  horario_inicio time not null,
  horario_fim time not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dia_semana, horario_inicio)
);

create table if not exists public.bloqueios_agenda (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  horario_inicio time not null,
  horario_fim time not null,
  motivo text,
  created_at timestamptz not null default now(),
  unique (data, horario_inicio)
);

create table if not exists public.grupos_aula (
  id uuid primary key default gen_random_uuid(),
  nome_referencia text,
  tipo tipo_aula not null default 'INDIVIDUAL',
  capacidade_maxima smallint not null default 1 check (capacidade_maxima between 1 and 3),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integrantes_grupos_aula (
  id uuid primary key default gen_random_uuid(),
  grupo_aula_id uuid not null references public.grupos_aula(id) on delete cascade,
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (grupo_aula_id, aluno_id)
);

create table if not exists public.horarios_recorrentes_alunos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  grupo_aula_id uuid references public.grupos_aula(id) on delete set null,
  dia_semana dia_semana not null,
  horario_inicio time not null,
  horario_fim time not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  grupo_aula_id uuid references public.grupos_aula(id) on delete set null,
  horario_recorrente_id uuid references public.horarios_recorrentes_alunos(id) on delete set null,
  data date not null,
  horario_inicio time not null,
  horario_fim time not null,
  status status_aula not null default 'AGENDADA',
  origem text not null default 'ROTINA',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (data, horario_inicio, grupo_aula_id)
);

create table if not exists public.alunos_aulas (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas(id) on delete cascade,
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (aula_id, aluno_id)
);

create table if not exists public.cancelamentos (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas(id) on delete cascade,
  aluno_id uuid references public.alunos(id) on delete set null,
  motivo text,
  ajustado_financeiro boolean not null default false,
  created_at timestamptz not null default now(),
  unique (aula_id, aluno_id)
);

create table if not exists public.reposicoes (
  id uuid primary key default gen_random_uuid(),
  cancelamento_id uuid not null references public.cancelamentos(id) on delete cascade,
  aula_reposicao_id uuid references public.aulas(id) on delete set null,
  status status_reposicao not null default 'PENDENTE',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mensalidades (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  valor_cobrado numeric(10,2) not null,
  data_vencimento date not null,
  data_pagamento date,
  status status_mensalidade not null default 'PENDENTE',
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.atualizar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validar_horario_uma_hora()
returns trigger
language plpgsql
as $$
begin
  if new.horario_fim <> new.horario_inicio + interval '1 hour' then
    raise exception 'Os horários do MVP devem ter duração fixa de 1 hora.';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_alunos_updated_at on public.alunos;
create trigger tr_alunos_updated_at
before update on public.alunos
for each row execute function public.atualizar_updated_at();

drop trigger if exists tr_disponibilidade_updated_at on public.disponibilidade_semanal;
create trigger tr_disponibilidade_updated_at
before update on public.disponibilidade_semanal
for each row execute function public.atualizar_updated_at();

drop trigger if exists tr_grupos_updated_at on public.grupos_aula;
create trigger tr_grupos_updated_at
before update on public.grupos_aula
for each row execute function public.atualizar_updated_at();

drop trigger if exists tr_horarios_recorrentes_updated_at on public.horarios_recorrentes_alunos;
create trigger tr_horarios_recorrentes_updated_at
before update on public.horarios_recorrentes_alunos
for each row execute function public.atualizar_updated_at();

drop trigger if exists tr_aulas_updated_at on public.aulas;
create trigger tr_aulas_updated_at
before update on public.aulas
for each row execute function public.atualizar_updated_at();

drop trigger if exists tr_reposicoes_updated_at on public.reposicoes;
create trigger tr_reposicoes_updated_at
before update on public.reposicoes
for each row execute function public.atualizar_updated_at();

drop trigger if exists tr_mensalidades_updated_at on public.mensalidades;
create trigger tr_mensalidades_updated_at
before update on public.mensalidades
for each row execute function public.atualizar_updated_at();

drop trigger if exists tr_disponibilidade_uma_hora on public.disponibilidade_semanal;
create trigger tr_disponibilidade_uma_hora
before insert or update on public.disponibilidade_semanal
for each row execute function public.validar_horario_uma_hora();

drop trigger if exists tr_horarios_recorrentes_uma_hora on public.horarios_recorrentes_alunos;
create trigger tr_horarios_recorrentes_uma_hora
before insert or update on public.horarios_recorrentes_alunos
for each row execute function public.validar_horario_uma_hora();

drop trigger if exists tr_aulas_uma_hora on public.aulas;
create trigger tr_aulas_uma_hora
before insert or update on public.aulas
for each row execute function public.validar_horario_uma_hora();

alter table public.alunos enable row level security;
alter table public.disponibilidade_semanal enable row level security;
alter table public.bloqueios_agenda enable row level security;
alter table public.grupos_aula enable row level security;
alter table public.integrantes_grupos_aula enable row level security;
alter table public.horarios_recorrentes_alunos enable row level security;
alter table public.aulas enable row level security;
alter table public.alunos_aulas enable row level security;
alter table public.cancelamentos enable row level security;
alter table public.reposicoes enable row level security;
alter table public.mensalidades enable row level security;

create policy "Usuarios autenticados podem gerenciar alunos"
on public.alunos for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar disponibilidade"
on public.disponibilidade_semanal for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar bloqueios"
on public.bloqueios_agenda for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar grupos"
on public.grupos_aula for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar integrantes"
on public.integrantes_grupos_aula for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar horarios recorrentes"
on public.horarios_recorrentes_alunos for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar aulas"
on public.aulas for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar alunos_aulas"
on public.alunos_aulas for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar cancelamentos"
on public.cancelamentos for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar reposicoes"
on public.reposicoes for all
to authenticated
using (true)
with check (true);

create policy "Usuarios autenticados podem gerenciar mensalidades"
on public.mensalidades for all
to authenticated
using (true)
with check (true);
