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
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver esta sucursal."
            : status === 401
            ? "No autenticado."
            : "No se pudo obtener el detalle de la sucursal.",
      },
      { status }
    );
  }
}