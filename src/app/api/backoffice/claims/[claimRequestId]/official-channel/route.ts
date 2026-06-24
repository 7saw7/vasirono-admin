import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { sendOfficialChannelCode } from "@/features/backoffice/claims/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    claimRequestId: string;
  }>;
};

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

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
    const data = await sendOfficialChannelCode(claimRequestId, auth.user.id, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = getStatus(error);

    if (message === "CLAIM_NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "Claim no encontrado." }, { status: 404 });
    }

    if (message.startsWith("MISSING_") || message === "CHECK_CREATION_FAILED") {
      return NextResponse.json(
        { ok: false, error: "Faltan catálogos o migraciones base para el flujo profesional." },
        { status: 500 }
      );
    }

    if (message === "NOTIFICATIONS_SERVICE_URL_NOT_CONFIGURED") {
      return NextResponse.json(
        { ok: false, error: "Falta configurar NOTIFICATIONS_SERVICE_URL para enviar correo oficial." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para revisar claims."
            : status === 401
            ? "No autenticado."
            : "No se pudo preparar la validación del canal oficial.",
      },
      { status }
    );
  }
}
