import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getAnalyticsOverviewQuery } from "@/lib/db/queries/backoffice/analytics";

export const runtime = "nodejs";

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("analytics.read");

    const { searchParams } = new URL(request.url);

    const data = await getAnalyticsOverviewQuery({
      companyId: searchParams.get("companyId") ?? undefined,
      branchId: searchParams.get("branchId") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver el overview analytics."
            : status === 401
            ? "No autenticado."
            : "No se pudo obtener el overview analytics.",
      },
      { status }
    );
  }
}