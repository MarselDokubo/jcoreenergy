import Link from "next/link";
import { signOut } from "@/app/admin/actions";
export default function Unauthorized() {
 return <section className="admin-login"><div className="admin-login-card"><h1>Access restricted.</h1><p>Your account is not registered as an active JCORE staff member. Contact an administrator.</p><form action={signOut}><button type="submit">Sign out</button></form><Link href="/">Return to website</Link></div></section>;
}
