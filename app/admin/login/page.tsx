import Link from "next/link";
import { LoginFields } from "./login-fields";
import { signIn } from "@/app/admin/actions";
export const metadata = { title: "Staff sign in" };
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <section className="admin-login"><div className="admin-login-card">
    <span className="admin-eyebrow">JCORE / STAFF PORTAL</span>
    <h1>Welcome back.</h1><p>Sign in with your authorised staff account.</p>
    {error && <p role="alert" className="admin-error">Unable to sign in. Check your credentials.</p>}
    <form action={signIn}><LoginFields />
    <button type="submit">Sign in</button></form><p style={{marginTop: "16px"}}><Link href="/admin/forgot-password">Forgot password?</Link></p>
  </div></section>;
}
