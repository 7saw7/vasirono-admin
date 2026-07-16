import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getBranchDetail } from "@/features/backoffice/branches/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    branchId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("branches.read");

    const params = await context.params;
    const branchId = Number(params.branchId);

    if (!Number.isInteger(branchId) || branchId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El branchId no es válido." },
        { status: 400 }
      );
    }

    const data = await getBranchDetail(branchId);

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Sucursal no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (branches branchId).");
  }
}