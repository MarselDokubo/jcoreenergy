import type { Metadata } from "next";
import { ForgotPasswordForm } from "./request-form";
export const metadata: Metadata = { title: "Recover staff access | JCORE" };
export default function ForgotPasswordPage() {
 return <section className="admin-login"><div className="admin-login-card">
 <span className="admin-eyebrow">JCORE / STAFF PORTAL</span>
 <h1>Reset your password.</h1>
 <p>Enter your staff email address to receive a recovery link.</p>
 <ForgotPasswordForm />
 </div></section>;
}
