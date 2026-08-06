import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { confirmPasswordResetSchema } from "@/features/auth/schema";
import { confirmBackofficePasswordReset } from "@/lib/auth/auth-service-client";
import { mapAuthRouteError } from "@/lib/auth/route-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = confirmPasswordResetSchema.parse(await request.json());
    const data = await confirmBackofficePasswordReset(input, request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message ?? "Solicitud inválida.",
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }
    const mapped = mapAuthRouteError(
      error,
      "No se pudo cambiar la contraseña. Solicita un código nuevo.",
    );
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status >= 500 ? 502 : mapped.status },
    );
  }
}
