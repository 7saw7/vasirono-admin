import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { approveOnsiteVerification } from "@/features/backoffice/claims/service";

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
    const data = await approveOnsiteVerification(claimRequestId, auth.user.id, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    if (message === "CLAIM_NOT_FOUND") return NextResponse.json({ ok: false, error: "Reclamo no encontrado." }, { status: 404 });
    if (message.startsWith("MISSING_")) return NextResponse.json({ ok: false, error: "Faltan catálogos base para aprobar visita presencial." }, { status: 500 });
    const status = getStatus(error);
    return NextResponse.json({ ok: false, error: status === 403 ? "No tienes permisos para revisar reclamos." : status === 401 ? "No autenticado." : "No se pudo aprobar la verificación presencial." }, { status });
  }
}
