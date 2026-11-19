import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {ArrowUpRight,Inbox,Users,Clock3,CheckCircle2,Activity} from "lucide-react";
export default async function AdminOverview(){
 const [customers,enquiries,open,resolved,recent,activity]=await Promise.all([
 prisma.customer.count(),prisma.enquiry.count(),
 prisma.enquiry.count({where:{status:{in:["new","in_progress","waiting"]}}}),
 prisma.enquiry.count({where:{status:{in:["resolved","closed"]}}}),
 prisma.enquiry.findMany({orderBy:{createdAt:"desc"},take:8,select:{id:true,name:true,category:true,status:true,createdAt:true,organisation:true}}),
 prisma.auditEvent.findMany({orderBy:{createdAt:"desc"},take:5,include:{actor:{select:{fullName:true}}}})
 ]);
 const stats=[{label:"Total enquiries",value:enquiries,icon:Inbox,detail:"All recorded requests"},{label:"Open enquiries",value:open,icon:Clock3,detail:"Require follow-up"},{label:"Customers",value:customers,icon:Users,detail:"Linked CRM contacts"},{label:"Resolved / closed",value:resolved,icon:CheckCircle2,detail:"Completed requests"}];
 return <><div className="admin-heading admin-dashboard-heading"><div><span className="admin-eyebrow">JCORE / OPERATIONS OVERVIEW</span><h1>Dashboard<span className="green-dot">.</span></h1><p>Manage incoming requests, customer relationships and daily follow-ups.</p></div><Link className="admin-primary-link" href="/admin/enquiries">Manage enquiries <ArrowUpRight size={17}/></Link></div>
 <div className="admin-stats admin-stats-four">{stats.map(({label,value,icon:Icon,detail})=><article key={label}><div className="admin-stat-top"><small>{label}</small><Icon size={20} strokeWidth={1.7}/></div><strong>{value}</strong><p>{detail}</p></article>)}</div>
 <div className="admin-dashboard-grid"><div className="admin-panel"><div className="admin-panel-head"><div><span className="admin-eyebrow">LATEST ACTIVITY</span><h2>Recent enquiries</h2></div><Link href="/admin/enquiries">View all <ArrowUpRight size={15}/></Link></div><div className="admin-table-wrap"><table><thead><tr><th>Contact</th><th>Category</th><th>Status</th><th>Received</th></tr></thead><tbody>{recent.map(e=><tr key={e.id}><td><Link href="/admin/enquiries"><strong>{e.name}</strong>{e.organisation&&<small className="admin-cell-sub">{e.organisation}</small>}</Link></td><td>{e.category.replaceAll("_"," ")}</td><td><span className={"admin-status admin-status-"+e.status}>{e.status.replaceAll("_"," ")}</span></td><td>{e.createdAt.toLocaleDateString("en-GB",{timeZone:"UTC"})}</td></tr>)}</tbody></table>{recent.length===0&&<p className="admin-empty">No enquiries yet.</p>}</div></div>
 <aside className="admin-panel admin-activity-panel"><div className="admin-panel-head"><div><span className="admin-eyebrow">TEAM WORKFLOW</span><h2>Activity</h2></div><Activity size={20}/></div>{activity.length?activity.map(item=><div className="admin-activity-item" key={item.id}><span className="admin-activity-dot"/><div><strong>{item.action.replaceAll("_"," ").replaceAll("."," · ")}</strong><p>{item.actor?.fullName??"System"}</p><small>{item.createdAt.toLocaleDateString("en-GB",{timeZone:"UTC"})}</small></div></div>):<p className="admin-empty">Staff updates will appear here as enquiries are managed.</p>}<Link className="admin-activity-link" href="/admin/customers">Open customer directory <ArrowUpRight size={15}/></Link></aside></div></>;
}
