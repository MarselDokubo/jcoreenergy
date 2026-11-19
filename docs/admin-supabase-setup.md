# JCORE Supabase Admin Foundation

## Setup
1. Create a Supabase project and save its Project URL and publishable key.
2. Run `supabase/schema.sql` in the Supabase SQL Editor once.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables. Never expose the service-role key through `NEXT_PUBLIC_` or commit secrets.
4. Create the first admin through Supabase Authentication. In the SQL Editor, after verifying their auth.users ID, run:
```sql
insert into public.staff_profiles(id, full_name, role)
values ('REPLACE-WITH-AUTH-USER-UUID', 'JCORE Administrator', 'admin');
```
5. Build and deploy server-side enquiry submission with validation, anti-spam/rate limiting, and notifications before enabling the public form. The current form is a copy-only prototype.
6. Build protected staff routes using Supabase SSR cookie sessions and enforce authorization in server operations and RLS.

## Data model
- staff_profiles: admin, manager, agent access
- customers: customer directory
- enquiries: website messages and status/assignment
- enquiry_notes: internal follow-up notes
- audit_events: event history foundation

## Security
All CRM tables have RLS enabled. Anonymous users cannot directly read or write CRM data. Staff must have an active profile. Do not use service-role keys in browser code. Ensure audit events are written by trusted server operations; do not treat this schema as a complete audit implementation.

## Next implementation
Install `@supabase/supabase-js` and `@supabase/ssr`; create server/browser clients, protected /admin routes, customer and inbox pages, and a validated POST enquiry endpoint. Update the contact form only after the endpoint is working.
