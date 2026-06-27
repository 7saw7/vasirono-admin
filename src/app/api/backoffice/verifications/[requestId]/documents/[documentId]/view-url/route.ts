import { NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getVerificationDocumentViewUrl } from "@/features/backoffice/verifications/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ requestId: string; documentId: string }> };

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await getBackofficeContext("verifications.read");
    const params = await context.params;
    const requestId = Number(params.requestId);
    const documentId = Number(params.documentId);

    if (!Number.isInteger(requestId) || requestId <= 0 || !Number.isInteger(documentId) || documentId <= 0) {
      return NextResponse.json({ ok: false, error: "Los parámetros no son válidos." }, { status: 400 });
    }

    const data = await getVerificationDocumentViewUrl(requestId, documentId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status = getStatus(error);
    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver este documento."
            : status === 401
              ? "No autenticado."
              : "No se pudo generar la URL de visualización.",
      },
      { status }
    );
  }
}
