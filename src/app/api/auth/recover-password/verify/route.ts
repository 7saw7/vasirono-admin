import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { passwordResetCodeSchema } from "@/features/auth/schema";
import { verifyBackofficePasswordResetCode } from "@/lib/auth/auth-service-client";
import { mapAuthRouteError } from "@/lib/auth/route-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = passwordResetCodeSchema.parse(await request.json());
    const data = await verifyBackofficePasswordResetCode(input, request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message ?? "Datos inválidos.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }
    const mapped = mapAuthRouteError(
      error,
      "No se pudo validar el código de recuperación.",
    );
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status >= 500 ? 502 : mapped.status },
    );
  }
}
