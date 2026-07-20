# Fan del Papel

Catálogo en Vue 3 + Vite con productos en Supabase.

## Configuración

En tu archivo `.env` dejá estas variables:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-clave-publica>
VITE_SUPABASE_STORAGE_BUCKET=product-images
```

## Importante para imágenes

El bucket de Storage debe existir y el nombre tiene que coincidir con `VITE_SUPABASE_STORAGE_BUCKET`.

Si ves el error:

> No se encontró el bucket "product-images"

hacé una de estas dos cosas:

- crear un bucket público llamado `product-images`
- o cambiar `VITE_SUPABASE_STORAGE_BUCKET` por el nombre real del bucket que ya exista

## SQL para crear el bucket

```sql
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = true;
```

## SQL para pedidos

Ejecutá el script `supabase/orders.sql` en el SQL Editor de Supabase para crear la tabla de pedidos.

## Policies mínimas de Storage

alter table storage.objects enable row level security;

drop policy if exists "Public read product images" on storage.objects;
drop policy if exists "Allow upload product images" on storage.objects;
drop policy if exists "Allow delete product images" on storage.objects;

create policy "Public read product images"
on storage.objects
for select
using (bucket_id = 'product-images');

create policy "Allow upload product images"
on storage.objects
for insert
with check (bucket_id = 'product-images');

create policy "Allow delete product images"
on storage.objects
for delete
using (bucket_id = 'product-images');
```

