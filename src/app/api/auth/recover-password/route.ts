import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { recoverPasswordSchema } from "@/features/auth/schema";
import { requestBackofficePasswordReset } from "@/lib/auth/auth-service-client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = recoverPasswordSchema.parse(await request.json());
    await requestBackofficePasswordReset(input.email, request.headers);
    return NextResponse.json({ ok: true, data: { accepted: true } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message ?? "Correo inválido." }, { status: 400 });
    }
    console.error("[backoffice-password-reset-request]", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "No se pudo procesar la solicitud." }, { status: 502 });
  }
}
