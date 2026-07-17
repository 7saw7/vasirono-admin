import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { passwordResetTokenSchema } from "@/features/auth/schema";
import { verifyBackofficePasswordResetToken } from "@/lib/auth/auth-service-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = passwordResetTokenSchema.parse(await request.json());
    const data = await verifyBackofficePasswordResetToken(input.token, request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: "El enlace no es válido." }, { status: 400 });
    }
    const status = Number((error as { status?: number })?.status ?? 400);
    return NextResponse.json({ ok: false, error: "El enlace no es válido o expiró." }, { status: status >= 500 ? 502 : status });
  }
}
