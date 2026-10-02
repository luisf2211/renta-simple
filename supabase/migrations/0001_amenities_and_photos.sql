-- =====================================================================
-- Amenities catalogue + vehicle<->amenity relation, and vehicle photo
-- primary flag. Mirrors the existing RLS pattern (tenant_id = current_tenant_id()).
-- Safe to re-run (idempotent guards).
-- =====================================================================

-- 1) Amenity category enum ------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'amenity_category') then
    create type public.amenity_category as enum (
      'COMFORT',       -- Confort
      'SAFETY',        -- Seguridad
      'CONNECTIVITY',  -- Conectividad
      'CAPACITY',      -- Capacidad / mecánica
      'OTHER'          -- Otros
    );
  end if;
end$$;

-- 2) amenities (catalogue, per tenant) -----------------------------------
create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name varchar(80) not null,
  icon varchar(40) not null default 'Check',       -- Lucide icon name
  category public.amenity_category not null default 'OTHER',
  description varchar(160),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists amenities_tenant_idx on public.amenities(tenant_id);
create unique index if not exists amenities_tenant_name_ux
  on public.amenities(tenant_id, lower(name));

-- 3) vehicle_amenities (join) --------------------------------------------
create table if not exists public.vehicle_amenities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (vehicle_id, amenity_id)
);

create index if not exists vehicle_amenities_vehicle_idx on public.vehicle_amenities(vehicle_id);
create index if not exists vehicle_amenities_amenity_idx on public.vehicle_amenities(amenity_id);

-- 4) vehicle_photos: primary (thumbnail) flag + ordering -----------------
alter table public.vehicle_photos
  add column if not exists is_primary boolean not null default false;
alter table public.vehicle_photos
  add column if not exists sort_order int not null default 0;

-- 5) updated_at trigger (reuse existing set_updated_at if present) --------
do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    if not exists (select 1 from pg_trigger where tgname = 'amenities_set_updated_at') then
      create trigger amenities_set_updated_at before update on public.amenities
        for each row execute function public.set_updated_at();
    end if;
  end if;
end$$;

-- 6) RLS -----------------------------------------------------------------
alter table public.amenities enable row level security;
alter table public.vehicle_amenities enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='amenities' and policyname='amenities_select') then
    create policy amenities_select on public.amenities for select to authenticated
      using (tenant_id = public.current_tenant_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='amenities' and policyname='amenities_insert') then
    create policy amenities_insert on public.amenities for insert to authenticated
      with check (tenant_id = public.current_tenant_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='amenities' and policyname='amenities_update') then
    create policy amenities_update on public.amenities for update to authenticated
      using (tenant_id = public.current_tenant_id())
      with check (tenant_id = public.current_tenant_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='amenities' and policyname='amenities_delete') then
    create policy amenities_delete on public.amenities for delete to authenticated
      using (tenant_id = public.current_tenant_id());
  end if;

  if not exists (select 1 from pg_policies where tablename='vehicle_amenities' and policyname='vehicle_amenities_select') then
    create policy vehicle_amenities_select on public.vehicle_amenities for select to authenticated
      using (tenant_id = public.current_tenant_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='vehicle_amenities' and policyname='vehicle_amenities_insert') then
    create policy vehicle_amenities_insert on public.vehicle_amenities for insert to authenticated
      with check (tenant_id = public.current_tenant_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='vehicle_amenities' and policyname='vehicle_amenities_delete') then
    create policy vehicle_amenities_delete on public.vehicle_amenities for delete to authenticated
      using (tenant_id = public.current_tenant_id());
  end if;
end$$;
