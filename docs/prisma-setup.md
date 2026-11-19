# JCORE Prisma + Supabase

Prisma 6 is pinned to avoid incompatible Prisma 7 configuration changes. The existing Supabase SQL foundation is **not** applied automatically; do not run both competing schema initializations.

1. Set DATABASE_URL (transaction pooler, port 6543) and DIRECT_URL (session pooler, port 5432) privately in Vercel and your local .env. URL-encode the password.
2. Run `npm install` and `npm run db:generate`.
3. Review the Prisma schema. Create the initial migration with `npx prisma migrate dev --name init_crm --create-only` against a disposable development Supabase database. Do **not** point migrate dev at production.
4. Edit the generated migration to add the auth.users foreign key for staff_profiles.id, RLS policies, grants, and necessary indexes from `supabase/schema.sql`. Prisma cannot express these safeguards in its schema.
5. Test the migration on a disposable Supabase project, including unauthorized access checks. Commit the generated migration directory.
6. Configure Vercel environment variables and run `npm run db:deploy` in a controlled deployment step, not automatically on every website build.
7. Create staff users in Supabase Auth, then provision matching staff_profiles rows from a trusted administrative process.
8. Build Supabase SSR sessions and server-side authorization before exposing admin APIs. Prisma pooler connections may bypass RLS: never assume RLS alone secures Prisma queries.

**Status:** ORM model and client scaffolding only. No migrations executed; no database connected; no admin or public form endpoint activated. Existing public website stays unchanged.
