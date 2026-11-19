import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import "../admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff access check | JCORE" };

type Check = "passed" | "failed" | "not checked";
export default async function AdminAuthCheck() {
  const { userId } = await auth();
  if (!userId) redirect("/admin/login");

  let database: Check = "not checked";
  let profile: Check = "not checked";
  let permission: Check = "not checked";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "passed";
    try {
      const staff = await prisma.staffProfile.findUnique({
        where: { clerkUserId: userId },
        select: { active: true, role: true },
      });
      profile = staff ? "passed" : "failed";
      permission = staff?.active && ["admin", "manager", "agent"].includes(staff.role)
        ? "passed" : "failed";
    } catch {
      profile = "failed";
    }
  } catch {
    database = "failed";
  }

  const allPassed = database === "passed" && profile === "passed" && permission === "passed";
  return <section className="admin-login">
    <div className="admin-login-card">
      <span className="admin-eyebrow">JCORE / STAFF PORTAL</span>
      <h1>Staff access check</h1>
      <p>Signed-in account detected. These checks do not display private records.</p>
      <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
        <li>Clerk session: passed</li>
        <li>Database connection: {database}</li>
        <li>Staff profile lookup: {profile}</li>
        <li>Active staff permission: {permission}</li>
      </ul>
      {allPassed
        ? <p><Link href="/admin">Open live dashboard →</Link></p>
        : <p>Share these four status lines with your developer. Do not share API keys or passwords.</p>}
      <p><Link href="/admin-preview">View dashboard design preview →</Link></p>
    </div>
  </section>;
}
