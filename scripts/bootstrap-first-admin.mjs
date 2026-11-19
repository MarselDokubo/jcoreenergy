/**
 * JCORE V2 one-time first-admin provisioning.
 * Run only from a trusted local shell against a NEW, EMPTY Supabase project.
 * Never import this script into the Next.js application.
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "JCORE_EXPECTED_PROJECT_REF",
  "JCORE_INITIAL_ADMIN_EMAIL",
  "JCORE_INITIAL_ADMIN_PASSWORD",
  "JCORE_INITIAL_ADMIN_NAME",
];
for (const name of required) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}
if (process.env.JCORE_BOOTSTRAP_CONFIRM !== "YES") {
  console.error("Set JCORE_BOOTSTRAP_CONFIRM=YES to explicitly confirm first-admin provisioning.");
  process.exit(1);
}
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
if (url.protocol !== "https:" || url.hostname !== `${process.env.JCORE_EXPECTED_PROJECT_REF}.supabase.co`) {
  console.error("Supabase project URL does not match the expected NEW project reference.");
  process.exit(1);
}
const email = process.env.JCORE_INITIAL_ADMIN_EMAIL.trim().toLowerCase();
const name = process.env.JCORE_INITIAL_ADMIN_NAME.trim();
const password = process.env.JCORE_INITIAL_ADMIN_PASSWORD;
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || password.length < 12) {
  console.error("Provide a valid email, nonempty full name and a password of at least 12 characters.");
  process.exit(1);
}
const supabase = createClient(url.origin, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const prisma = new PrismaClient();
try {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) throw new Error(`Unable to verify empty Auth project: ${error.message}`);
  if (data.users.length !== 0) throw new Error("Auth already has users. Refusing to reuse or delete existing accounts.");
  const count = await prisma.staffProfile.count();
  if (count !== 0) throw new Error("Staff profiles already exist. Refusing to bootstrap over existing staff.");

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (createError || !created.user) throw new Error(`Failed to create administrator: ${createError?.message ?? "no user returned"}`);
  try {
    await prisma.staffProfile.create({
      data: { id: created.user.id, fullName: name, role: "admin", active: true },
    });
  } catch (profileError) {
    // Avoid leaving an orphaned admin Auth account if profile provisioning fails.
    const { error: rollbackError } = await supabase.auth.admin.deleteUser(created.user.id);
    if (rollbackError) console.error("Rollback failed: remove the newly created Auth user manually before retrying.");
    throw profileError;
  }
  console.log("First JCORE V2 administrator provisioned. Remove bootstrap secrets from the shell and disable service-role access outside trusted operations.");
} catch (error) {
  console.error("Bootstrap stopped:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
