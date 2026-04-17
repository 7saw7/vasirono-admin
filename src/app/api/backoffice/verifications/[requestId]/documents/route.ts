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

    const detail = await getVerificationDetail(requestId);

    if (!detail) {
      return NextResponse.json(
        { ok: false, error: "Verification request no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: detail.documents,
    });
  } catch (error) {
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
            ? "No tienes permisos para ver documentos de verificación."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener los documentos.",
      },
      { status }
    );
  }
}