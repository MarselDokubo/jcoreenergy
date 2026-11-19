# JCORE staff dashboard deployment

## Required Vercel Production environment variables
- `DATABASE_URL` (server-only Supabase transaction pooler, port 6543)
- `DIRECT_URL` (server-only Supabase session pooler, port 5432)
- `NEXT_PUBLIC_SUPABASE_URL` (Supabase project URL)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase publishable/anon key)

Do not place the database password or service-role key in NEXT_PUBLIC variables. Redeploy after adding the Supabase URL and publishable key.

## Provisioning the first administrator
1. Create a staff account in Supabase Dashboard > Authentication > Users. Set a strong password; require MFA in Supabase if available.
2. Copy the newly created Auth user UUID.
3. In a trusted Supabase SQL Editor session, run this **one-time, administrator-only** statement with the real UUID and full name:

```sql
INSERT INTO public.staff_profiles (id, full_name, role, active)
VALUES ('REPLACE_WITH_AUTH_USER_UUID', 'JCORE Administrator', 'admin', true);
```

Never expose the SQL Editor or a privileged provisioning endpoint to the public website. Future staff provisioning should be through a protected admin workflow.

## Authorization
Every protected page verifies the Supabase Auth user using `auth.getUser()` and then checks the active staff profile using server-side Prisma. Every data-changing action calls the same guard and writes an audit event. Prisma uses a privileged database connection and **does not inherit browser RLS user identity**. Staff authorization must remain server-side.

## Current scope
- `/admin/login`: password-based staff sign-in
- `/admin`: enquiry and customer summary
- `/admin/enquiries`: read messages, update statuses, add internal notes
- `/admin/customers`: list and search customers

The public contact form is not yet wired to Prisma. Admin account provisioning and role management UI are not yet implemented. Keep signup disabled for staff-only access, configure Supabase Auth URL settings for your production domain, and do not advertise this as complete until production smoke tests and authorization checks pass.
