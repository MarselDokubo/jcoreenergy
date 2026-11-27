import "server-only";
type EnquiryNotification={id:string;name:string;email:string;category:string;message:string};
export async function notifyNewEnquiry(item:EnquiryNotification){
 const key=process.env.RESEND_API_KEY;
 const to=process.env.EMAIL_TO;
 const from=process.env.EMAIL_FROM;
 const site=process.env.NEXT_PUBLIC_SITE_URL;
 if(!key||!to||!from||!site){console.error("JCORE notification configuration missing");return;}
 try{
  const response=await fetch("https://api.resend.com/emails",{method:"POST",signal:AbortSignal.timeout(8000),headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject:"New JCORE enquiry: "+item.name,reply_to:item.email,text:["New website enquiry", "Reference: "+item.id,"From: "+item.name,"Email: "+item.email,"Category: "+item.category,"",item.message.slice(0,500)+(item.message.length>500?"…":""),"","Review: "+site.replace(/\/+$/,"")+"/admin/enquiries"].join("\n")})});
  if(!response.ok)console.error("JCORE notification delivery failed",response.status);
 }catch{console.error("JCORE notification service unavailable");}
}
