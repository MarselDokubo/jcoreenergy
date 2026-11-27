import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function requireStaff() {
  const { userId } = await auth();
  if (!userId) redirect("/admin/login");
  const staff = await prisma.staffProfile.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, fullName: true, role: true, active: true }
  });
  if (!staff?.active) redirect("/admin/unauthorized");
  return staff;
}
