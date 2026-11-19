# JCORE Admin V2 — Clerk cutover checklist

The public site and `main` are not changed by this branch.

## 1. Create a Clerk application

At https://dashboard.clerk.com create a new application for JCORE staff. Enable email/password sign-in. Disable public sign-up (Clerk Dashboard → User & Authentication → Restrictions/Sign-up settings; names may vary). Create one user in Clerk Dashboard manually with a strong new password; no Supabase password reset is involved.

## 2. Configure Vercel Preview

Add these environment variables to **Preview**, not Production yet:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from Clerk dashboard)
- `CLERK_SECRET_KEY` (secret, from Clerk dashboard)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/login`

Retain `DATABASE_URL` and `DIRECT_URL` in Preview for Prisma. Do not expose any secret in chat or commit it to GitHub. Redeploy the Preview after saving variables.

## 3. Apply SQL migration

In the existing JCORE Supabase SQL Editor, run `supabase/admin-v2-clerk-migration.sql` once. It preserves staff UUID primary keys and application records, adds `clerk_user_id`, removes the obsolete Supabase Auth foreign key, and revokes obsolete Supabase Auth Data API access. Do not delete tables.

## 4. Authorize the first Clerk user

Copy the **Clerk User ID** (starts `user_`) from Clerk Dashboard → Users. Then run in Supabase SQL Editor, replacing the placeholder with that exact ID:

```sql
UPDATE public.staff_profiles
SET clerk_user_id = 'REPLACE_WITH_CLERK_USER_ID'
WHERE id = 'ac74409d-e11a-443b-bfdd-ef09d7eb5837'
  AND role = 'admin'
  AND active = true
  AND clerk_user_id IS NULL
RETURNING id, full_name, role, active, clerk_user_id;
```

Expected: exactly one row. If zero rows, stop and investigate. Do not create a second admin or match by email automatically.

## 5. Test

On the Vercel Preview, open `/admin/login`, sign in using the new Clerk password, then confirm `/admin` loads and logout works. Unauthorised Clerk users must be rejected. Check Vercel runtime logs for errors.

## Remaining deployment work

The new database was bootstrapped by direct SQL, so Prisma migration history must be reconciled before any `prisma migrate deploy`. Confirm the Preview build and runtime before merging PR #7. Keep Production untouched until verified.
