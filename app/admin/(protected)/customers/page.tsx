import { prisma } from "@/lib/prisma";
export default async function Customers({searchParams}:{searchParams:Promise<{q?:string}>}) {
 const {q} = await searchParams; const query = (q??"").trim().slice(0,100);
 const customers = await prisma.customer.findMany({where:query?{OR:[{fullName:{contains:query,mode:"insensitive"}},{email:{contains:query,mode:"insensitive"}},{organisation:{contains:query,mode:"insensitive"}}]}:{},orderBy:{createdAt:"desc"},take:100,select:{id:true,fullName:true,email:true,organisation:true,phone:true,createdAt:true,_count:{select:{enquiries:true}}}});
 return <><div className="admin-heading"><span className="admin-eyebrow">CRM / CONTACTS</span><h1>Customers</h1><p>Up to 100 recent customer records.</p></div><form className="admin-search"><input name="q" defaultValue={query} placeholder="Search name, email or organisation" aria-label="Search customers"/><button>Search</button></form>
 <div className="admin-panel admin-table-wrap"><table><thead><tr><th>Customer</th><th>Email</th><th>Organisation</th><th>Phone</th><th>Enquiries</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td><strong>{c.fullName}</strong></td><td>{c.email}</td><td>{c.organisation??"—"}</td><td>{c.phone??"—"}</td><td>{c._count.enquiries}</td></tr>)}</tbody></table>{customers.length===0&&<p className="admin-empty">No matching customers.</p>}</div></>;
}
