import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
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
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (dashboard).");
  }
}