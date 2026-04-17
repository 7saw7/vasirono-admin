import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { approveClaim } from "@/features/backoffice/claims/service";

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
        { ok: false, error: "El claimRequestId no es válido." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const data = await approveClaim(claimRequestId, auth.user.id, {
      decision: "approve",
      notes: body?.notes,
    });

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "CLAIM_NOT_FOUND") {
      return NextResponse.json(
        { ok: false, error: "Claim no encontrado." },
        { status: 404 }
      );
    }

    if (
      message === "MISSING_APPROVED_CLAIM_STATUS" ||
      message === "MISSING_VERIFICATION_REQUEST_STATUS" ||
      message === "MISSING_VERIFICATION_LEVEL"
    ) {
      return NextResponse.json(
        { ok: false, error: "Faltan catálogos base para aprobar el claim." },
        { status: 500 }
      );
    }

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para aprobar claims."
            : status === 401
            ? "No autenticado."
            : "No se pudo aprobar el claim.",
      },
      { status }
    );
  }
}