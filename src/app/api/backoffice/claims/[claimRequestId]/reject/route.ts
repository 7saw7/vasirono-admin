import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { rejectClaim } from "@/features/backoffice/claims/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    claimRequestId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await getBackofficeContext("claims.review");

    const params = await context.params;
    const claimRequestId = Number(params.claimRequestId);

    if (!Number.isInteger(claimRequestId) || claimRequestId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El identificador del reclamo no es válido." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const data = await rejectClaim(claimRequestId, auth.user.id, {
      decision: "reject",
      notes: body?.notes,
    });

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (claims claimRequestId reject).");
  }
}