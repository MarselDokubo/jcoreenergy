"use client";
import { useState } from "react";
import type { AuthError } from "@supabase/supabase-js";

function recoveryError(error: AuthError): string {
 const code = error.code ?? "";
 if (error.status === 429 || code.includes("rate_limit") || code.includes("over_email_send_rate_limit")) return "Too many recovery requests. Wait before trying again. You can also check whether an earlier email arrived.";
 if (code === "email_address_invalid") return "Check the email address and try again.";
 if (error.status === 422) return "Supabase rejected this recovery request. Check the configured redirect URL and authentication settings.";
 if (error.status === 0 || error.message.toLowerCase().includes("fetch")) return "The recovery service could not be reached. Check your connection and try again.";
 return "Recovery email could not be sent. Please contact the site administrator if this continues.";
}
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export function ForgotPasswordForm() {
 const [email, setEmail] = useState("");
 const [busy, setBusy] = useState(false);
 const [sent, setSent] = useState(false);
 const [error, setError] = useState("");
 async function submit(e: React.FormEvent<HTMLFormElement>) {
   e.preventDefault(); setBusy(true); setError("");
   const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
   const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
     redirectTo: window.location.origin + "/admin/reset-password"
   });
   setBusy(false);
   if (error) { console.error("JCORE password recovery failed", { code: error.code, status: error.status }); setError(recoveryError(error)); return; }
   setSent(true);
 }
 return <div>
   {sent ? <p role="status">If this address has an account, a recovery email will arrive shortly. Open only the newest link.</p> :
   <form onSubmit={submit}>
     {error && <p className="admin-error" role="alert">{error}</p>}
     <label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
     <button type="submit" disabled={busy}>{busy ? "Sending…" : "Send recovery link"}</button>
   </form>}
   <p><Link href="/admin/login">Back to staff sign in</Link></p>
 </div>;
}
