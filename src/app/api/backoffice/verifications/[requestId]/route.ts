import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getVerificationDetail } from "@/features/backoffice/verifications/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("verifications.read");

    const params = await context.params;
    const requestId = Number(params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El requestId no es válido." },
        { status: 400 }
      );
    }

    const data = await getVerificationDetail(requestId);

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Verification request no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (verifications requestId).");
  }
}