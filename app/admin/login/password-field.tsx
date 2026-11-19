"use client";
import { useState } from "react";

export default function PasswordField() {
  const [visible, setVisible] = useState(false);
  return (
    <label>Password
      <span className="admin-password-field">
        <input name="password" type={visible ? "text" : "password"} required autoComplete="current-password" />
        <button type="button" className="admin-password-toggle" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.3A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a16 16 0 0 1-3.2 3.7M6.1 6.1C3.9 7.6 3 12 3 12s3.5 7 9 7a10 10 0 0 0 4.1-.9"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </span>
    </label>
  );
}
