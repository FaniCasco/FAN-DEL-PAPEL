-- Tabla de pedidos para Fan del Papel
-- Ejecutar en el SQL Editor de Supabase

create table if not exists orders (
  id bigint generated always as identity primary key,
  nombre_apellido text not null,
  telefono text not null,
  forma_pago text not null check (forma_pago in ('efectivo', 'transferencia')),
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  pagado boolean not null default false,
  notas text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders enable row level security;

drop policy if exists "Allow read orders" on orders;
drop policy if exists "Allow insert orders" on orders;
drop policy if exists "Allow update orders" on orders;
drop policy if exists "Allow delete orders" on orders;

create policy "Allow read orders"
on orders for select using (true);

create policy "Allow insert orders"
on orders for insert with check (true);

create policy "Allow update orders"
on orders for update using (true) with check (true);

create policy "Allow delete orders"
on orders for delete using (true);
