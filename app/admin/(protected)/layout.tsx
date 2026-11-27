import Link from "next/link";
import Image from "next/image";
import { requireStaff } from "@/lib/admin-auth";
import { signOut } from "@/app/admin/actions";
import "../admin.css";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
 const staff = await requireStaff();
 return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-logo" href="/admin"><Image src="/images/jcore-logo-transparent.svg" width={56} height={56} alt="JCORE company logo"/><span className="admin-brand-text"><strong>JCORE</strong><small>OPERATIONS PORTAL</small></span></Link>
 <nav aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/enquiries">Enquiries</Link><Link href="/admin/customers">Customers</Link></nav>
 <div className="admin-account"><strong>{staff.fullName}</strong><small>{staff.role}</small><form action={signOut}><button type="submit">Sign out</button></form></div></aside>
 <div className="admin-main"><header className="admin-top"><span>JCORE <span className="admin-crumb">/ Operations workspace</span></span><Link href="/">View website ↗</Link></header><div className="admin-content">{children}</div></div></div>;
}
