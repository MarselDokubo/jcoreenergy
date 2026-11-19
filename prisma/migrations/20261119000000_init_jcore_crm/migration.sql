-- Initial JCORE CRM schema. Intended for a fresh JCORE production public schema.
-- Prisma-managed tables + Supabase Auth FK, RLS, grants and policies.
-- Fail closed if an earlier manual schema has already been applied.
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('staff_profiles','customers','enquiries','enquiry_notes','audit_events')) THEN
  RAISE EXCEPTION 'JCORE CRM tables already exist. Stop and baseline/reconcile before applying this migration.';
 END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE "StaffRole" AS ENUM ('admin','manager','agent');
CREATE TYPE "EnquiryStatus" AS ENUM ('new','in_progress','waiting','resolved','closed');
CREATE TYPE "EnquiryCategory" AS ENUM ('service','inspection','individual-training','corporate-training','general');

CREATE TABLE public.staff_profiles (
 id UUID PRIMARY KEY,
 full_name TEXT NOT NULL,
 role "StaffRole" NOT NULL DEFAULT 'agent',
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
 CONSTRAINT staff_profiles_auth_user_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE public.customers (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name TEXT NOT NULL,
 email TEXT NOT NULL,
 phone TEXT,
 organisation TEXT,
 location TEXT,
 notes TEXT,
 created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);
CREATE INDEX customers_email_idx ON public.customers (lower(email));
CREATE TABLE public.enquiries (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
 name TEXT NOT NULL,
 email TEXT NOT NULL,
 organisation TEXT,
 phone TEXT,
 location TEXT,
 category "EnquiryCategory" NOT NULL,
 interest TEXT,
 message TEXT NOT NULL,
 status "EnquiryStatus" NOT NULL DEFAULT 'new',
 assigned_to UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
 source TEXT NOT NULL DEFAULT 'website',
 created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);
CREATE INDEX enquiries_status_created_idx ON public.enquiries (status, created_at);
CREATE TABLE public.enquiry_notes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
 author_id UUID NOT NULL REFERENCES public.staff_profiles(id),
 body TEXT NOT NULL,
 created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);
CREATE TABLE public.audit_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
 action TEXT NOT NULL,
 entity_type TEXT NOT NULL,
 entity_id UUID,
 details JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.staff_profiles s WHERE s.id = (SELECT auth.uid()) AND s.active);
$$;
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.staff_profiles s WHERE s.id = (SELECT auth.uid()) AND s.active AND s.role='admin');
$$;
REVOKE ALL ON FUNCTION public.is_active_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff can read profiles" ON public.staff_profiles FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "admins manage staff" ON public.staff_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "staff read customers" ON public.customers FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());
CREATE POLICY "staff update customers" ON public.customers FOR UPDATE TO authenticated USING (public.is_active_staff()) WITH CHECK (public.is_active_staff());
CREATE POLICY "staff read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.is_active_staff()) WITH CHECK (public.is_active_staff());
CREATE POLICY "staff read notes" ON public.enquiry_notes FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff add notes" ON public.enquiry_notes FOR INSERT TO authenticated WITH CHECK (public.is_active_staff() AND author_id=(SELECT auth.uid()));
CREATE POLICY "staff read audit" ON public.audit_events FOR SELECT TO authenticated USING (public.is_admin());
-- No public writes. Website enquiries must use a validated, rate-limited server endpoint.
