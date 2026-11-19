"use client";
import { useState } from "react";
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
   if (error) { setError("Unable to send recovery email right now. Please try again later."); return; }
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
