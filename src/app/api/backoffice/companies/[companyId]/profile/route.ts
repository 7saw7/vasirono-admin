import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { updateCompanyProfile } from "@/features/backoffice/companies/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ companyId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("companies.update");
    const { companyId: rawCompanyId } = await context.params;
    const companyId = Number(rawCompanyId);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El companyId no es válido." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const data = await updateCompanyProfile(companyId, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: "No se pudo actualizar el perfil de la empresa.",
      statusMessages: {
        403: "No tienes permisos para editar empresas.",
        404: "La empresa ya no existe.",
        409: "La actualización entra en conflicto con datos existentes.",
        422: "Los datos del perfil no son válidos.",
      },
    });
  }
}
