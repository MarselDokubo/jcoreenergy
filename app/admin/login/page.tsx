import { signIn } from "@/app/admin/actions";
export const metadata = { title: "Staff sign in" };
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <section className="admin-login"><div className="admin-login-card">
    <span className="admin-eyebrow">JCORE / STAFF PORTAL</span>
    <h1>Welcome back.</h1><p>Sign in with your authorised staff account.</p>
    {error && <p role="alert" className="admin-error">Unable to sign in. Check your credentials.</p>}
    <form action={signIn}><label>Email<input name="email" type="email" required autoComplete="email" /></label>
    <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
    <button type="submit">Sign in</button></form>
  </div></section>;
}
