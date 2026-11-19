import Link from "next/link";
import { requireStaff } from "@/lib/admin-auth";
import { signOut } from "@/app/admin/actions";
import "../admin.css";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
 const staff = await requireStaff();
 return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-logo" href="/admin">JCORE<span> / ADMIN</span></Link>
 <nav aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/enquiries">Enquiries</Link><Link href="/admin/customers">Customers</Link></nav>
 <div className="admin-account"><strong>{staff.fullName}</strong><small>{staff.role}</small><form action={signOut}><button type="submit">Sign out</button></form></div></aside>
 <div className="admin-main"><header className="admin-top"><span>Operations / JCORE</span><Link href="/">View website ↗</Link></header><div className="admin-content">{children}</div></div></div>;
}
