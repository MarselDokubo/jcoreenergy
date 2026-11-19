import "server-only";
type EnquiryNotification={id:string;name:string;email:string;category:string;message:string};
export async function notifyNewEnquiry(item:EnquiryNotification){
 const key=process.env.RESEND_API_KEY;
 const to=process.env.JCORE_ENQUIRY_NOTIFY_EMAIL;
 const from=process.env.JCORE_ENQUIRY_FROM_EMAIL;
 if(!key||!to||!from)return;
 try{
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject:"New JCORE enquiry: "+item.name,reply_to:item.email,text:["New website enquiry", "Reference: "+item.id,"From: "+item.name,"Email: "+item.email,"Category: "+item.category,"",item.message,"","Review: https://jcoreenergy.vercel.app/admin/enquiries"].join("\n")})});
  if(!response.ok)console.error("JCORE notification delivery failed",response.status);
 }catch{console.error("JCORE notification service unavailable");}
}
