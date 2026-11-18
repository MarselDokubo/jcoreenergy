-- JCORE CRM foundation. Apply in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.staff_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 role text not null default 'agent' check(role in ('admin','manager','agent')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.customers (
 id uuid primary key default gen_random_uuid(),
 full_name text not null,
 email text not null,
 phone text,
 organisation text,
 location text,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists customers_email_idx on public.customers(lower(email));
create table if not exists public.enquiries (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid references public.customers(id) on delete set null,
 name text not null,
 email text not null,
 organisation text,
 phone text,
 location text,
 category text not null check(category in ('service','inspection','individual-training','corporate-training','general')),
 interest text,
 message text not null,
 status text not null default 'new' check(status in ('new','in_progress','waiting','resolved','closed')),
 assigned_to uuid references public.staff_profiles(id) on delete set null,
 source text not null default 'website',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists enquiries_status_created_idx on public.enquiries(status,created_at desc);
create table if not exists public.enquiry_notes (
 id uuid primary key default gen_random_uuid(),
 enquiry_id uuid not null references public.enquiries(id) on delete cascade,
 author_id uuid not null references public.staff_profiles(id),
 body text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.audit_events (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references public.staff_profiles(id) on delete set null,
 action text not null,
 entity_type text not null,
 entity_id uuid,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create or replace function public.is_active_staff()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.staff_profiles s where s.id = (select auth.uid()) and s.active);
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.staff_profiles s where s.id = (select auth.uid()) and s.active and s.role='admin');
$$;
revoke all on function public.is_active_staff() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
alter table public.staff_profiles enable row level security;
alter table public.customers enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_notes enable row level security;
alter table public.audit_events enable row level security;
create policy "staff can read profiles" on public.staff_profiles for select to authenticated using (public.is_active_staff());
create policy "admins manage staff" on public.staff_profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "staff read customers" on public.customers for select to authenticated using (public.is_active_staff());
create policy "staff insert customers" on public.customers for insert to authenticated with check (public.is_active_staff());
create policy "staff update customers" on public.customers for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy "staff read enquiries" on public.enquiries for select to authenticated using (public.is_active_staff());
create policy "staff update enquiries" on public.enquiries for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
create policy "staff read notes" on public.enquiry_notes for select to authenticated using (public.is_active_staff());
create policy "staff add notes" on public.enquiry_notes for insert to authenticated with check (public.is_active_staff() and author_id=(select auth.uid()));
create policy "staff read audit" on public.audit_events for select to authenticated using (public.is_admin());
-- No anon write policies: website submissions must pass through a validated, rate-limited server endpoint.
-- Never put the service-role key in client code.
