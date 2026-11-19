import { SignIn } from "@clerk/nextjs";
export const metadata = { title: "Staff sign in | JCORE" };
export default function Login() {
  return <section className="admin-login"><div className="admin-login-card">
    <span className="admin-eyebrow">JCORE / STAFF PORTAL</span>
    <h1>Welcome back.</h1>
    <p>Sign in with your authorised JCORE staff account.</p>
    <SignIn routing="path" path="/admin/login" forceRedirectUrl="/admin" signUpUrl={undefined} />
  </div></section>;
}
