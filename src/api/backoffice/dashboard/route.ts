import { NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getBackofficeDashboardData } from "@/features/backoffice/dashboard/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    await getBackofficeContext("dashboard.read");

    const data = await getBackofficeDashboardData();

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
        ? ((error as { status: number }).status)
        : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver el dashboard."
            : status === 401
            ? "No autenticado."
            : "No se pudo cargar el dashboard.",
      },
      { status }
    );
  }
}