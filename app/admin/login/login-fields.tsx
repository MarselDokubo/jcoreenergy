"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export function LoginFields() {
 const [visible,setVisible] = useState(false);
 return <>
  <label>Email<input name="email" type="email" required autoComplete="email" /></label>
  <label>Password<span className="admin-password-wrap">
   <input name="password" type={visible ? "text" : "password"} required autoComplete="current-password" />
   <button type="button" className="admin-password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
  </span></label>
 </>;
}
