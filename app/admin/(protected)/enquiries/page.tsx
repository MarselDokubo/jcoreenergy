import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateEnquiryStatus, addEnquiryNote, convertEnquiryToCustomer, assignEnquiry } from "@/app/admin/actions";
export default async function Enquiries({searchParams}:{searchParams:Promise<{status?:string;q?:string;category?:string}>}){
 const {status,q,category}=await searchParams;
 const allowed=["new","in_progress","waiting","resolved","closed"] as const;
 const categories=["service","inspection","individual_training","corporate_training","general"] as const;
 const filter=allowed.find(x=>x===status);
 const categoryFilter=categories.find(x=>x===category);
 const query=(q??"").trim().slice(0,100);
 const [enquiries,staff]=await Promise.all([
 prisma.enquiry.findMany({where:{...(filter?{status:filter}:{}),...(categoryFilter?{category:categoryFilter}:{}),...(query?{OR:[{name:{contains:query,mode:"insensitive" as const}},{email:{contains:query,mode:"insensitive" as const}},{organisation:{contains:query,mode:"insensitive" as const}},{message:{contains:query,mode:"insensitive" as const}}]}:{})},orderBy:{createdAt:"desc"},take:100,include:{customer:{select:{id:true,fullName:true}},assignee:{select:{fullName:true}},notes:{orderBy:{createdAt:"desc"},take:20,include:{author:{select:{fullName:true}}}}}}),
 prisma.staffProfile.findMany({where:{active:true},select:{id:true,fullName:true},orderBy:{fullName:"asc"}})
 ]);
 const ids=enquiries.map(e=>e.id);
 const events=ids.length?await prisma.auditEvent.findMany({where:{entityType:"enquiry",entityId:{in:ids}},orderBy:{createdAt:"desc"},take:300,include:{actor:{select:{fullName:true}}}}):[];
 return <><div className="admin-heading"><span className="admin-eyebrow">CRM / INBOX</span><h1>Enquiries</h1><p>Search, assign, convert and track every customer request.</p></div>
 <form className="admin-search"><input name="q" defaultValue={query} placeholder="Search name, email, organisation or message" aria-label="Search enquiries"/><select name="status" defaultValue={filter??""} aria-label="Filter by status"><option value="">All statuses</option>{allowed.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select><select name="category" defaultValue={categoryFilter??""} aria-label="Filter by category"><option value="">All categories</option>{categories.map(c=><option key={c} value={c}>{c.replaceAll("_"," ")}</option>)}</select><button>Apply filters</button><Link className="admin-reset" href="/admin/enquiries">Reset</Link></form>
 <p className="admin-result-count">Showing {enquiries.length} most recent matching enquiries</p>
 <div className="admin-enquiry-list">{enquiries.map(e=><article className="admin-panel admin-enquiry" key={e.id}><div className="admin-enquiry-head"><div><span className="admin-eyebrow">{e.category.replaceAll("_"," ")} / {e.source}</span><h2>{e.name}</h2><p>{e.email}{e.phone?" · "+e.phone:""}{e.organisation?" · "+e.organisation:""}</p></div><div className="admin-enquiry-meta"><span className="admin-status">{e.status.replaceAll("_"," ")}</span><time>{e.createdAt.toLocaleString("en-GB",{timeZone:"UTC"})} UTC</time></div></div><p className="admin-message">{e.message}</p>
 <div className="admin-workflow"><form action={updateEnquiryStatus} className="admin-inline-form"><input type="hidden" name="id" value={e.id}/><label>Status<select name="status" defaultValue={e.status}>{allowed.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></label><button type="submit">Update</button></form>
 <form action={assignEnquiry} className="admin-inline-form"><input type="hidden" name="id" value={e.id}/><label>Assigned staff<select name="assignedTo" defaultValue={e.assignedTo??""}><option value="">Unassigned</option>{staff.map(person=><option key={person.id} value={person.id}>{person.fullName}</option>)}</select></label><button type="submit">Assign</button></form>
 <div className="admin-convert">{e.customer?<span className="admin-linked">Linked customer: {e.customer.fullName}</span>:<form action={convertEnquiryToCustomer}><input type="hidden" name="id" value={e.id}/><button type="submit">Convert to customer</button></form>}</div></div>
 <div className="admin-notes"><h3>Internal notes</h3>{e.notes.map(n=><p key={n.id}><strong>{n.author.fullName}</strong> · {n.body}</p>)}<form action={addEnquiryNote}><input type="hidden" name="enquiryId" value={e.id}/><textarea name="body" required maxLength={5000} placeholder="Add a private note..." aria-label={"Add note for "+e.name}/><button type="submit">Add note</button></form></div>
 <details className="admin-history"><summary>Activity history</summary>{events.filter(v=>v.entityId===e.id).map(v=><p key={v.id}><strong>{v.action.replaceAll("_"," ").replaceAll("."," · ")}</strong> · {v.actor?.fullName??"System"} · {v.createdAt.toLocaleString("en-GB",{timeZone:"UTC"})} UTC</p>)}{!events.some(v=>v.entityId===e.id)&&<p>No recorded changes yet.</p>}</details></article>)}
 {enquiries.length===0&&<div className="admin-panel admin-empty">No enquiries match these filters.</div>}</div></>;
}
