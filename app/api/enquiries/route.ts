import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {Prisma,EnquiryCategory} from "@prisma/client";
export const runtime="nodejs";
const categories=["service","inspection","individual-training","corporate-training","general"] as const;
type Category=typeof categories[number];
const categoryMap:Record<Category,EnquiryCategory>={service:"service",inspection:"inspection","individual-training":"individual_training","corporate-training":"corporate_training",general:"general"};
const isText=(v:unknown,max:number)=>typeof v==="string"&&v.trim().length<=max;
export async function POST(request:NextRequest){
  const origin=request.headers.get("origin");
  if(!origin||origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
  if(Number(request.headers.get("content-length")||0)>12000)return NextResponse.json({error:"Request too large."},{status:413});
  let data:Record<string,unknown>;
  try{data=await request.json();if(!data||typeof data!=="object"||Array.isArray(data))throw Error();}
  catch{return NextResponse.json({error:"Invalid request."},{status:400});}
  if(data.website)return NextResponse.json({ok:true},{status:200});
  const keys=["name","email","organisation","phone","location","interest","message"] as const;
  if(keys.some(k=>!isText(data[k],k==="message"?5000:200))||
    typeof data.category!=="string"||!categories.includes(data.category as Category)||
    !(data.name as string).trim()||!(data.message as string).trim()||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))||
    String(data.email).length>254)
    return NextResponse.json({error:"Please check the required fields and try again."},{status:400});
  const clean=(k:typeof keys[number])=>(data[k] as string).trim();
  try{
    const enquiry=await prisma.enquiry.create({data:{
      name:clean("name"),email:clean("email").toLowerCase(),organisation:clean("organisation")||null,
      phone:clean("phone")||null,location:clean("location")||null,
      category:categoryMap[data.category as Category],interest:clean("interest")||null,
      message:clean("message"),source:"website"
    },select:{id:true}});
    return NextResponse.json({ok:true,id:enquiry.id},{status:201});
  }catch(error){
    console.error("Public enquiry submission failed",error instanceof Prisma.PrismaClientKnownRequestError?error.code:"database error");
    return NextResponse.json({error:"We couldn't submit your enquiry. Please try again."},{status:500});
  }
}
