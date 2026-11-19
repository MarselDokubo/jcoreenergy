import Link from "next/link";
import { prisma } from "@/lib/prisma";
export default async function AdminOverview() {
 const [customers, enquiries, open, recent] = await Promise.all([
  prisma.customer.count(), prisma.enquiry.count(),
  prisma.enquiry.count({ where: { status: { in: ["new","in_progress","waiting"] } } }),
  prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, category: true, status: true, createdAt: true } })
 ]);
 return <><div className="admin-heading"><div><span className="admin-eyebrow">OPERATIONS OVERVIEW</span><h1>Dashboard</h1><p>Customer relationships and incoming enquiries.</p></div></div>
 <div className="admin-stats"><article><small>Total enquiries</small><strong>{enquiries}</strong></article><article><small>Open enquiries</small><strong>{open}</strong></article><article><small>Customers</small><strong>{customers}</strong></article></div>
 <div className="admin-panel"><div className="admin-panel-head"><h2>Recent enquiries</h2><Link href="/admin/enquiries">View all ↗</Link></div>
 <div className="admin-table-wrap"><table><thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Received</th></tr></thead><tbody>{recent.map(e=><tr key={e.id}><td><Link href="/admin/enquiries">{e.name}</Link></td><td>{e.category}</td><td><span className="admin-status">{e.status.replaceAll("_"," ")}</span></td><td>{e.createdAt.toLocaleDateString("en-GB",{timeZone:"UTC"})}</td></tr>)}</tbody></table>{recent.length===0 && <p className="admin-empty">No enquiries yet.</p>}</div></div></>;
}
