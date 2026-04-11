import { NextRequest, NextResponse } from "next/server";
import { getVerificationDetail } from "@/features/backoffice/verifications/service";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";

export async function GET(_: NextRequest, context: any) {
  await getBackofficeContext("verifications.read");

  const requestId = Number(context.params.requestId);

  const data = await getVerificationDetail(requestId);

  if (!data) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data });
}