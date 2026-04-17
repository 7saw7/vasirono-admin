import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getCompanyDetail } from "@/features/backoffice/companies/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    companyId: string;
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

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("subscriptions.read");

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

    const company = await getCompanyDetail(companyId);

    if (!company) {
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
      data: company.subscription,
    });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver la suscripción de la empresa."
            : status === 401
            ? "No autenticado."
            : "No se pudo obtener la suscripción de la empresa.",
      },
      { status }
    );
  }
}