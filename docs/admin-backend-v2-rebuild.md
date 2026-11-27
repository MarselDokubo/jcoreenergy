# JCORE Admin Backend V2 — Isolated Rebuild

Status: planning and implementation branch; **no production deletion authorised**.

## Protected public website
Do not change public routes (`/`, `/about`, `/services`, `/training`, `/contact`), shared header/footer, styling, images, SEO, or the public enquiry form's UI. Any change to the public enquiry submission endpoint must preserve its request/response contract and pass regression tests.

## Repository audit (main)
- Next.js 15 App Router with Supabase SSR and Prisma 6 dependencies.
- Admin login page invokes `signIn` server action and uses `LoginFields`.
- Forgot-password and reset-password routes exist.
- `lib/supabase/server.ts` creates cookie-aware Supabase server client.
- `prisma/schema.prisma` maps staff_profiles, customers, enquiries, enquiry_notes, audit_events.
- `supabase/schema.sql` contains legacy DDL, RLS policies and auth.users staff foreign key.
- Prisma schema and SQL schema must be reconciled: Prisma enums require compatible database types, whereas legacy SQL declares text + CHECK constraints. Do not run blind migrations.

## Scope of replacement
1. Admin-only routes, forms, actions, session middleware, role gates and recovery.
2. Staff profile lifecycle, admin dashboard, customer/enquiry/note management, audit history.
3. Prisma migrations plus reviewed supplemental SQL for RLS and auth.users FK.
4. Protected server-only API, validation, abuse limits, authorization and security checks.

## Database preflight before destructive changes
Read-only inventory of public tables, exact row counts, FKs, indexes, policies, triggers, functions, Auth user count, Prisma migration history, and public enquiry integration. Confirm there is no data worth preserving, back up schema, and prepare an exact object-by-object deletion manifest. **No DROP, TRUNCATE, auth.users deletion, or destructive migration without a separate explicit approval.**

## Build order
1. Inventory dependencies and current admin routes.
2. Build admin-only V2 authentication with password visibility, clear errors, verified redirect configuration, callback and reset page.
3. Implement staff authorization and one-time first-admin provisioning on a new empty Supabase project; never reuse the legacy administrator.
4. Reconcile Prisma schema, generate and review migration + RLS supplement.
5. Build admin dashboard and CRUD with audit events.
6. Test login, recovery, unauthorized access, public form, public pages and production build.
7. Review PR and deploy only after validation.

## Current state
- Branch: `rebuild/admin-backend-v2`
- No production database or website modified by this branch.
- Live Supabase row counts and migration state have **not** been independently verified.

## Fresh administrator policy (supersedes earlier preservation guidance)
- V2 must start with **zero** Auth users and zero staff profiles in a **separate new Supabase project**. Do not point this bootstrap at the existing production Supabase project.
- The legacy administrator remains untouched in the legacy project until a separately approved retirement; it is **not** migrated to V2.
- Provision exactly one initial admin with `npm run admin:bootstrap` using `scripts/bootstrap-first-admin.mjs`, run from a trusted machine with private environment variables. No publicly accessible setup route is created.
- Script requires `JCORE_BOOTSTRAP_CONFIRM=YES`, `JCORE_EXPECTED_PROJECT_REF`, and verifies zero Auth users and zero staff profiles before creating the account.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only; never add it to `NEXT_PUBLIC_*` or Vercel preview client bundles. Never commit bootstrap credentials.
- Do not switch Vercel production database or Auth environment variables before independent staging tests and explicit cutover approval.
- The bootstrap script has not been executed; no Auth users have been created or removed.
