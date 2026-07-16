import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import {
  getCompanyDetail,
  updateCompanyStatus,
} from "@/features/backoffice/companies/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ companyId: string }> };

function parseCompanyId(raw: string): number | null {
  const companyId = Number(raw);
  return Number.isInteger(companyId) && companyId > 0 ? companyId : null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("companies.read");
    const params = await context.params;
    const companyId = parseCompanyId(params.companyId);

    if (!companyId) {
      return NextResponse.json(
        { ok: false, error: "El companyId no es válido." },
        { status: 400 },
      );
    }

    const company = await getCompanyDetail(companyId);
    if (!company) {
      return NextResponse.json(
        { ok: false, error: "Empresa no encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        companyId: company.companyId,
        companyName: company.name,
        isActive: company.isActive,
        verificationStatus: company.verificationStatus,
        updatedAt: company.updatedAt,
        branchesCount: company.branches.length,
        activeBranchesCount: company.branches.filter((branch) => branch.isActive)
          .length,
      },
    });
  } catch (error) {
    return toBackofficeErrorResponse(
      error,
      "No se pudo consultar el estado de la empresa.",
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("companies.update");
    const params = await context.params;
    const companyId = parseCompanyId(params.companyId);

    if (!companyId) {
      return NextResponse.json(
        { ok: false, error: "El companyId no es válido." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { isActive?: unknown };
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "isActive debe ser booleano." },
        { status: 422 },
      );
    }

    const data = await updateCompanyStatus(companyId, body.isActive);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: "No se pudo cambiar el estado de la empresa.",
      statusMessages: {
        403: "No tienes permisos para cambiar el estado de empresas.",
        404: "La empresa ya no existe.",
        409: "El cambio de estado entra en conflicto con el estado actual.",
        422: "El estado solicitado no es válido.",
      },
    });
  }
}
