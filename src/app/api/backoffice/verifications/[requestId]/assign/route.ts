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
    await getBackofficeContext("verifications.review");

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
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "VERIFICATION_NOT_FOUND") {
      return NextResponse.json(
        { ok: false, error: "Verification request no encontrado." },
        { status: 404 }
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
            ? "No tienes permisos para asignar verificaciones."
            : status === 401
            ? "No autenticado."
            : "No se pudo asignar el reviewer.",
      },
      { status }
    );
  }
}