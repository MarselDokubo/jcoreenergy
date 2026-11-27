-- JCORE ADMIN V2: READ-ONLY pre-reset inventory.
-- Run in existing project's SQL Editor. No data is changed.
-- Do not share passwords, access tokens or service-role keys.

-- 1. Tables, exact counts for known JCORE tables (missing tables are reported as absent).
WITH expected(name) AS (
 VALUES ('staff_profiles'),('customers'),('enquiries'),('enquiry_notes'),('audit_events'),('_prisma_migrations')
)
SELECT name AS table_name,
       CASE WHEN to_regclass(format('public.%I',name)) IS NULL THEN 'absent' ELSE 'present' END AS state,
       CASE WHEN to_regclass(format('public.%I',name)) IS NULL THEN NULL
            ELSE (xpath('/row/n/text()', query_to_xml(
               format('SELECT count(*) AS n FROM public.%I',name),false,true,'')))[1]::text::bigint END AS exact_rows
FROM expected ORDER BY name;

-- 2. All public tables, including any not listed above.
SELECT table_schema,table_name FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;

-- 3. Foreign keys that reference JCORE tables or auth.users.
SELECT conrelid::regclass::text AS source_table,conname AS constraint_name,
       confrelid::regclass::text AS referenced_table
FROM pg_constraint WHERE contype='f' AND
 (conrelid::regclass::text IN ('staff_profiles','customers','enquiries','enquiry_notes','audit_events',
 'public.staff_profiles','public.customers','public.enquiries','public.enquiry_notes','public.audit_events')
 OR confrelid::regclass::text IN ('staff_profiles','customers','enquiries','enquiry_notes','audit_events',
 'public.staff_profiles','public.customers','public.enquiries','public.enquiry_notes','public.audit_events','auth.users'))
ORDER BY source_table,constraint_name;

-- 4. RLS and policies.
SELECT schemaname,tablename,policyname,cmd,roles,qual,with_check
FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname;

-- 5. Database functions and triggers in public.
SELECT routine_name,routine_type FROM information_schema.routines
WHERE routine_schema='public' ORDER BY routine_name;
SELECT event_object_table,trigger_name,action_statement
FROM information_schema.triggers WHERE trigger_schema='public'
ORDER BY event_object_table,trigger_name;

-- 6. Auth user count only (no personal details).
SELECT count(*) AS auth_user_count FROM auth.users;
