# Admin V2 authentication integration

## Protected scope
Only `/admin/**` and `lib/supabase/**` are modified. The public site remains untouched.

## Recovery link variants
- Browser fragment recovery links (`#access_token=...`) are processed by Supabase browser client on `/admin/reset-password`.
- PKCE `?code=...` links and custom recovery email `?token_hash=...&type=recovery` links are handled at `/admin/auth/callback`, which redirects to `/admin/reset-password`.
- Do not log tokens, recovery codes or passwords.

## Supabase Auth settings
Site URL: `https://jcoreenergy.vercel.app`
Allowed Redirect URLs:
- `https://jcoreenergy.vercel.app/admin/reset-password`
- `https://jcoreenergy.vercel.app/admin/auth/callback`

## Tests before production
1. `npm ci && npm run build` with valid non-production environment variables.
2. Confirm existing administrator login works using a known valid password (no recovery email required).
3. Confirm unauthenticated `/admin` redirects to login.
4. Confirm active staff user reaches dashboard; non-staff user is denied.
5. Test both recovery callback variants on a staging Supabase project.
6. Test sign-out and expired recovery link handling.
7. Regression check public routes and public enquiry submission.
8. Confirm production DB migration status; never run a destructive migration blindly.

No production database reset is included in this branch.
