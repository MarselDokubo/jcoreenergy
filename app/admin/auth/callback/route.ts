import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const supabase = await createSupabaseServerClient();
  let error: string | undefined;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error?.code ?? result.error?.message;
  } else if (tokenHash && type === "recovery") {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    error = result.error?.code ?? result.error?.message;
  } else {
    error = "missing_recovery_code";
  }

  if (error) {
    console.error("JCORE auth callback failed", { code: error });
    return NextResponse.redirect(new URL("/admin/forgot-password?error=invalid_link", origin));
  }
  return NextResponse.redirect(new URL("/admin/reset-password", origin));
}
