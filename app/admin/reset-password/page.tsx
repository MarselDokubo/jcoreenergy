import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";
export const metadata: Metadata = { title: "Reset staff password | JCORE" };
export default function ResetPasswordPage() {
  return <section className="admin-login"><div className="admin-login-card">
    <span className="admin-eyebrow">JCORE / STAFF PORTAL</span>
    <h1>Set a new password.</h1>
    <p>Choose a secure password for your staff account.</p>
    <ResetPasswordForm />
  </div></section>;
}
