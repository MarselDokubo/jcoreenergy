"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const supabase = getSupabaseBrowserClient();

export function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const error = params.get("error_description");
    if (error) {
      setMessage(error.replace(/\+/g, " "));
      return;
    }
    // Supabase's browser client exchanges recovery URL fragments for a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" && session) { setReady(true); setMessage(""); }
    });
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setMessage("Unable to validate the recovery link. Request a new one.");
      else if (data.session) setReady(true);
      else setMessage("This recovery link is invalid or has expired. Request a new one.");
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 12) { setMessage("Use at least 12 characters."); return; }
    if (password !== confirm) { setMessage("Passwords do not match."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    await supabase.auth.signOut();
    setDone(true); setPassword(""); setConfirm("");
  }

  if (done) return <div role="status"><p>Your password has been updated.</p><Link href="/admin/login">Return to staff sign in</Link></div>;
  return <div>
    {message && <p className="admin-error" role="alert">{message}</p>}
    {ready && <form onSubmit={submit}>
      <label>New password
        <span className="admin-password-wrap">
          <input type={visible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={12} required />
          <button className="admin-password-toggle" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
        </span>
      </label>
      <label>Confirm password<input type={visible ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" minLength={12} required /></label>
      <button type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
    </form>}
    {!ready && <p><Link href="/admin/forgot-password">Request a new recovery link</Link></p>}
  </div>;
}
