import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getBranchesList } from "@/features/backoffice/branches/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("branches.read");

    const { searchParams } = new URL(request.url);

    const data = await getBranchesList({
      search: searchParams.get("search") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      districtId: searchParams.get("districtId") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

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
            ? "No tienes permisos para ver sucursales."
            : status === 401
            ? "No autenticado."
            : "No se pudo obtener el listado de sucursales.",
      },
      { status }
    );
  }
}