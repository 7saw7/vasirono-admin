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
      data: {
        companyId: company.companyId,
        companyName: company.name,
        verificationStatus: company.verificationStatus,
        updatedAt: company.updatedAt,
        branchesCount: company.branches.length,
        activeBranchesCount: company.branches.filter((branch) => branch.isActive).length,
      },
    });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (companies companyId status).");
  }
}