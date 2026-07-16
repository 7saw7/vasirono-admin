import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { markClaimOnsiteRequired } from "@/features/backoffice/claims/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ claimRequestId: string }> };

function getStatus(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await getBackofficeContext("claims.review");
    const { claimRequestId: rawId } = await context.params;
    const claimRequestId = Number(rawId);
    if (!Number.isInteger(claimRequestId) || claimRequestId <= 0) {
      return NextResponse.json({ ok: false, error: "El identificador del reclamo no es válido." }, { status: 400 });
    }
    const body = await request.json();
    const data = await markClaimOnsiteRequired(claimRequestId, auth.user.id, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (claims claimRequestId onsite-required).");
  }
}
