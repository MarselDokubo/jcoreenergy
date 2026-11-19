-- Apply only to JCORE Admin V2 after the five-table bootstrap.
-- Existing staff UUID primary keys remain unchanged for audit and enquiry relationships.
-- Clerk user IDs are text, so store them separately; never cast to UUID.
BEGIN;
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS clerk_user_id text;
CREATE UNIQUE INDEX IF NOT EXISTS staff_profiles_clerk_user_id_key ON public.staff_profiles (clerk_user_id);
-- Existing Supabase Auth FK must be removed to permit Clerk-only staff identities.
ALTER TABLE public.staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_id_fkey;
-- Clerk-authenticated staff use server-side Prisma, not Supabase Data API JWTs.
-- Remove the obsolete Supabase Auth RLS policies; leave RLS enabled, default-deny.
DROP POLICY IF EXISTS "staff read profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "admins manage profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "staff read customers" ON public.customers;
DROP POLICY IF EXISTS "staff insert customers" ON public.customers;
DROP POLICY IF EXISTS "staff update customers" ON public.customers;
DROP POLICY IF EXISTS "staff read enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "staff update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "staff read notes" ON public.enquiry_notes;
DROP POLICY IF EXISTS "staff add notes" ON public.enquiry_notes;
DROP POLICY IF EXISTS "admins read audit" ON public.audit_events;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
DROP FUNCTION IF EXISTS public.is_active_staff();
DROP FUNCTION IF EXISTS public.is_admin();
-- Do not grant admin based solely on a matching email address.
-- After creating the Clerk user, associate its exact user_... ID with an authorised staff row.
COMMIT;
