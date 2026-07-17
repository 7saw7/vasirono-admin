import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { confirmPasswordResetSchema } from "@/features/auth/schema";
import { confirmBackofficePasswordReset } from "@/lib/auth/auth-service-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = confirmPasswordResetSchema.parse(await request.json());
    const data = await confirmBackofficePasswordReset(input, request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message ?? "Solicitud inválida." }, { status: 400 });
    }
    const status = Number((error as { status?: number })?.status ?? 400);
    return NextResponse.json({ ok: false, error: "No se pudo cambiar la contraseña. Solicita un nuevo enlace." }, { status: status >= 500 ? 502 : status });
  }
}
