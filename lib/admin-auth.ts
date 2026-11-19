import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireStaff() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const staff = await prisma.staffProfile.findUnique({
    where: { id: user.id },
    select: { id: true, fullName: true, role: true, active: true }
  });
  if (!staff?.active) redirect("/admin/unauthorized");
  return staff;
}
