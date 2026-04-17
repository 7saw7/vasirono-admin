import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getBackofficeAnalytics } from "@/features/backoffice/analytics/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("analytics.read");

    const { searchParams } = new URL(request.url);

    const data = await getBackofficeAnalytics({
      companyId: searchParams.get("companyId") ?? undefined,
      branchId: searchParams.get("branchId") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    return NextResponse.json({ ok: true, data });
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
            ? "No tienes permisos para ver analytics."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener analytics.",
      },
      { status }
    );
  }
}