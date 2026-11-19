import { prisma } from "@/lib/prisma";
import { updateEnquiryStatus, addEnquiryNote } from "@/app/admin/actions";
export default async function Enquiries({searchParams}:{searchParams:Promise<{status?:string}>}) {
 const {status} = await searchParams;
 const allowed = ["new","in_progress","waiting","resolved","closed"] as const;
 const filter = allowed.find(x=>x===status);
 const enquiries = await prisma.enquiry.findMany({where:filter?{status:filter}:{},orderBy:{createdAt:"desc"},take:100,include:{notes:{orderBy:{createdAt:"desc"},take:5,include:{author:{select:{fullName:true}}}}}});
 return <><div className="admin-heading"><span className="admin-eyebrow">CRM / INBOX</span><h1>Enquiries</h1><p>Review messages, update progress and add internal notes.</p></div>
 <form className="admin-search"><select name="status" defaultValue={filter??""} aria-label="Filter by status"><option value="">All statuses</option>{allowed.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select><button>Filter</button></form>
 <div className="admin-enquiry-list">{enquiries.map(e=><article className="admin-panel admin-enquiry" key={e.id}><div className="admin-enquiry-head"><div><span className="admin-eyebrow">{e.category.replaceAll("-"," ")} / {e.source}</span><h2>{e.name}</h2><p>{e.email}{e.phone?" · "+e.phone:""}{e.organisation?" · "+e.organisation:""}</p></div><time>{e.createdAt.toLocaleString("en-GB",{timeZone:"UTC"})} UTC</time></div><p className="admin-message">{e.message}</p>
 <form action={updateEnquiryStatus} className="admin-inline-form"><input type="hidden" name="id" value={e.id}/><label>Status <select name="status" defaultValue={e.status}>{allowed.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></label><button type="submit">Update</button></form>
 <div className="admin-notes"><h3>Internal notes</h3>{e.notes.map(n=><p key={n.id}><strong>{n.author.fullName}</strong> · {n.body}</p>)}<form action={addEnquiryNote}><input type="hidden" name="enquiryId" value={e.id}/><textarea name="body" required maxLength={5000} placeholder="Add a private note..." aria-label={"Add note for "+e.name}/><button type="submit">Add note</button></form></div></article>)}
 {enquiries.length===0&&<div className="admin-panel admin-empty">No enquiries found.</div>}</div></>;
}
