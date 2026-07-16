import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { assignVerificationReviewer } from "@/features/backoffice/verifications/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("verifications.assign");

    const params = await context.params;
    const requestId = Number(params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El requestId no es válido." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const data = await assignVerificationReviewer(requestId, {
      reviewerUserId: body?.reviewerUserId,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (verifications requestId assign).");
  }
}