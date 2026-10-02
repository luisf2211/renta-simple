-- =====================================================================
-- Pickup / return locations catalogue (per tenant). Mirrors the amenities
-- RLS pattern. Contracts keep storing the chosen location as text in their
-- pricing_snapshot (immutability), the catalogue only drives selection.
-- Idempotent.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'location_type') then
    create type public.location_type as enum ('AIRPORT', 'OFFICE', 'HOTEL', 'OTHER');
  end if;
end$$;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name varchar(120) not null,
  address varchar(200),
  type public.location_type not null default 'OFFICE',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists locations_tenant_idx on public.locations(tenant_id);
create unique index if not exists locations_tenant_name_ux
  on public.locations(tenant_id, lower(name));

do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    if not exists (select 1 from pg_trigger where tgname = 'locations_set_updated_at') then
      create trigger locations_set_updated_at before update on public.locations
        for each row execute function public.set_updated_at();
    end if;
  end if;
end$$;

alter table public.locations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='locations' and policyname='locations_select') then
    create policy locations_select on public.locations for select to authenticated
      using (tenant_id = public.current_tenant_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='locations' and policyname='locations_insert') then
    create policy locations_insert on public.locations for insert to authenticated
      with check (tenant_id = public.current_tenant_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='locations' and policyname='locations_update') then
    create policy locations_update on public.locations for update to authenticated
      using (tenant_id = public.current_tenant_id())
      with check (tenant_id = public.current_tenant_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='locations' and policyname='locations_delete') then
    create policy locations_delete on public.locations for delete to authenticated
      using (tenant_id = public.current_tenant_id());
  end if;
end$$;

-- Seed the locations already in use.
insert into public.locations (tenant_id, name, address, type, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'Aeropuerto Internacional Las Américas (SDQ)', 'Santo Domingo, República Dominicana', 'AIRPORT', 10),
  ('11111111-1111-1111-1111-111111111111', 'Oficina Santo Domingo', 'Santo Domingo, República Dominicana', 'OFFICE', 20)
on conflict (tenant_id, lower(name)) do nothing;
