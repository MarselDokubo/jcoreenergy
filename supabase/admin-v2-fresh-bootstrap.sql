-- JCORE Admin V2: FRESH database bootstrap ONLY.
-- Run ONLY after confirming public tables = 0 and auth users = 0.
-- This creates application tables; it does not alter the public website.
-- Prisma enums are deliberately aligned with prisma/schema.prisma.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE') THEN
    RAISE EXCEPTION 'Refusing to initialize: public schema already contains tables';
  END IF;
  IF EXISTS (SELECT 1 FROM auth.users) THEN
    RAISE EXCEPTION 'Refusing to initialize: existing Auth users detected';
  END IF;
END $$;

CREATE TYPE public."StaffRole" AS ENUM ('admin','manager','agent');
CREATE TYPE public."EnquiryStatus" AS ENUM ('new','in_progress','waiting','resolved','closed');
CREATE TYPE public."EnquiryCategory" AS ENUM ('service','inspection','individual-training','corporate-training','general');

CREATE TABLE public.staff_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role public."StaffRole" NOT NULL DEFAULT 'agent',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text, organisation text, location text, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customers_email_idx ON public.customers(lower(email));
CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  name text NOT NULL, email text NOT NULL, organisation text,
  phone text, location text,
  category public."EnquiryCategory" NOT NULL,
  interest text, message text NOT NULL,
  status public."EnquiryStatus" NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX enquiries_status_created_idx ON public.enquiries(status,created_at DESC);
CREATE TABLE public.enquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.staff_profiles(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE FUNCTION public.is_active_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$ SELECT EXISTS(SELECT 1 FROM public.staff_profiles s WHERE s.id=(SELECT auth.uid()) AND s.active) $$;
CREATE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$ SELECT EXISTS(SELECT 1 FROM public.staff_profiles s WHERE s.id=(SELECT auth.uid()) AND s.active AND s.role='admin') $$;
REVOKE ALL ON FUNCTION public.is_active_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read profiles" ON public.staff_profiles FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "admins manage profiles" ON public.staff_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "staff read customers" ON public.customers FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());
CREATE POLICY "staff update customers" ON public.customers FOR UPDATE TO authenticated USING (public.is_active_staff()) WITH CHECK (public.is_active_staff());
CREATE POLICY "staff read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.is_active_staff()) WITH CHECK (public.is_active_staff());
CREATE POLICY "staff read notes" ON public.enquiry_notes FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "staff add notes" ON public.enquiry_notes FOR INSERT TO authenticated WITH CHECK (public.is_active_staff() AND author_id=(SELECT auth.uid()));
CREATE POLICY "admins read audit" ON public.audit_events FOR SELECT TO authenticated USING (public.is_admin());

-- No anonymous writes. Public enquiry UI currently does not send data.
COMMIT;
