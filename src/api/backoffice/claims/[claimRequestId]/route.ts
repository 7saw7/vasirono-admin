import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getClaimDetail } from "@/features/backoffice/claims/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    claimRequestId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("claims.read");

    const params = await context.params;
    const claimRequestId = Number(params.claimRequestId);

    if (!Number.isInteger(claimRequestId) || claimRequestId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El claimRequestId no es válido." },
        { status: 400 }
      );
    }

    const data = await getClaimDetail(claimRequestId);

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Claim no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
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
            ? "No tienes permisos para ver este claim."
            : status === 401
            ? "No autenticado."
            : "No se pudo obtener el detalle del claim.",
      },
      { status }
    );
  }
}