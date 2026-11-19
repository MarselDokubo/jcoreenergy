-- Apply only to JCORE Admin V2 after the five-table bootstrap.
-- Existing staff UUID primary keys remain unchanged for audit and enquiry relationships.
-- Clerk user IDs are text, so store them separately; never cast to UUID.
BEGIN;
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS clerk_user_id text;
CREATE UNIQUE INDEX IF NOT EXISTS staff_profiles_clerk_user_id_key ON public.staff_profiles (clerk_user_id);
-- Existing Supabase Auth FK must be removed to permit Clerk-only staff identities.
ALTER TABLE public.staff_profiles DROP CONSTRAINT IF EXISTS staff_profiles_id_fkey;
-- Do not grant admin based solely on a matching email address.
-- After creating the Clerk user, associate its exact user_... ID with an authorised staff row.
COMMIT;
