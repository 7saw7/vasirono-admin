import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getCompanyDetail } from "@/features/backoffice/companies/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    companyId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("companies.read");

    const params = await context.params;
    const companyId = Number(params.companyId);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "El companyId no es válido.",
        },
        { status: 400 }
      );
    }

    const data = await getCompanyDetail(companyId);

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: "Empresa no encontrada.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (companies companyId).");
  }
}