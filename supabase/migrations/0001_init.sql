-- BPO Financeiro · Periscópio Contabilidade
-- Schema inicial: dados compartilhados entre os dois usuários (Marco e sócia),
-- nos dois módulos (pessoal / empresa). Ver §2 e §6 da especificação.

create extension if not exists pgcrypto;

do $$ begin
  create type module_type as enum ('pessoal', 'empresa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('receita', 'despesa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_status as enum ('pago', 'pendente');
exception when duplicate_object then null; end $$;

-- §2.1 Transação
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  module module_type not null,
  type transaction_type not null,
  date date not null,
  category text not null,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  paid_by text,
  note text,
  status transaction_status not null default 'pendente',
  reconciled boolean not null default false,
  fitid text,
  installment_group uuid,
  installment_index integer,
  installment_total integer,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Evita reimportação duplicada de uma linha de extrato OFX (§4.7).
create unique index if not exists transactions_fitid_unique
  on transactions (fitid)
  where fitid is not null;

create index if not exists transactions_module_date_idx on transactions (module, date);
create index if not exists transactions_module_description_idx on transactions (module, description);
create index if not exists transactions_installment_group_idx
  on transactions (installment_group)
  where installment_group is not null;

-- §2.2 Template recorrente
create table if not exists recurring_templates (
  id uuid primary key default gen_random_uuid(),
  module module_type not null,
  type transaction_type not null,
  category text not null,
  description text not null,
  amount numeric(12, 2) not null,
  excluded boolean not null default false,
  custom boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module, description)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_transactions_updated_at on transactions;
create trigger set_transactions_updated_at
  before update on transactions
  for each row execute function set_updated_at();

drop trigger if exists set_recurring_templates_updated_at on recurring_templates;
create trigger set_recurring_templates_updated_at
  before update on recurring_templates
  for each row execute function set_updated_at();

-- §6.1/6.2: os dois usuários enxergam os mesmos dados, nos dois módulos.
-- RLS libera leitura/escrita para qualquer usuário autenticado do projeto;
-- o controle de quem pode se cadastrar fica no Supabase Auth (ver README —
-- desative signups públicos e convide só as duas contas esperadas).
alter table transactions enable row level security;
alter table recurring_templates enable row level security;

drop policy if exists "authenticated read transactions" on transactions;
create policy "authenticated read transactions"
  on transactions for select
  to authenticated
  using (true);

drop policy if exists "authenticated write transactions" on transactions;
create policy "authenticated write transactions"
  on transactions for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated update transactions" on transactions;
create policy "authenticated update transactions"
  on transactions for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated delete transactions" on transactions;
create policy "authenticated delete transactions"
  on transactions for delete
  to authenticated
  using (true);

drop policy if exists "authenticated read recurring_templates" on recurring_templates;
create policy "authenticated read recurring_templates"
  on recurring_templates for select
  to authenticated
  using (true);

drop policy if exists "authenticated write recurring_templates" on recurring_templates;
create policy "authenticated write recurring_templates"
  on recurring_templates for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated update recurring_templates" on recurring_templates;
create policy "authenticated update recurring_templates"
  on recurring_templates for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated delete recurring_templates" on recurring_templates;
create policy "authenticated delete recurring_templates"
  on recurring_templates for delete
  to authenticated
  using (true);

-- §6.3: sincronização em tempo real via Supabase Realtime.
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table recurring_templates;
