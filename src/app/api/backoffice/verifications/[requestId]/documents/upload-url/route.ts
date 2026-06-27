import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { requestVerificationDocumentUploadUrl } from "@/features/backoffice/verifications/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ requestId: string }> };

function parseRequestId(value: string) {
  const requestId = Number(value);
  return Number.isInteger(requestId) && requestId > 0 ? requestId : null;
}

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
    await getBackofficeContext("verifications.review");
    const params = await context.params;
    const requestId = parseRequestId(params.requestId);

    if (!requestId) {
      return NextResponse.json({ ok: false, error: "El requestId no es válido." }, { status: 400 });
    }

    const body = await request.json();
    const data = await requestVerificationDocumentUploadUrl(requestId, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status = getStatus(error);
    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para subir documentos de verificación."
            : status === 401
              ? "No autenticado."
              : "No se pudo generar la URL de subida.",
      },
      { status }
    );
  }
}
