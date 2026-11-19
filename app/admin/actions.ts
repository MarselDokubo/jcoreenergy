"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/admin/login?error=invalid");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=invalid");
  redirect("/admin");
}
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
export async function updateEnquiryStatus(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id) || !["new","in_progress","waiting","resolved","closed"].includes(status)) return;
  await prisma.$transaction(async (tx) => {
    const enquiry = await tx.enquiry.findUnique({ where: { id }, select: { status: true } });
    if (!enquiry || enquiry.status === status) return;
    await tx.enquiry.update({ where: { id }, data: { status: status as "new"|"in_progress"|"waiting"|"resolved"|"closed" } });
    await tx.auditEvent.create({ data: { actorId: staff.id, action: "enquiry.status_changed", entityType: "enquiry", entityId: id, details: { from: enquiry.status, to: status } } });
  });
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}
export async function addEnquiryNote(formData: FormData) {
  const staff = await requireStaff();
  const enquiryId = String(formData.get("enquiryId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(enquiryId) || !body || body.length > 5000) return;
  await prisma.$transaction(async (tx) => {
    await tx.enquiryNote.create({ data: { enquiryId, authorId: staff.id, body } });
    await tx.auditEvent.create({ data: { actorId: staff.id, action: "enquiry.note_added", entityType: "enquiry", entityId: enquiryId } });
  });
  revalidatePath("/admin/enquiries");
}
