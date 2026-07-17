import { NextRequest, NextResponse } from "next/server";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getAdminPromotionsDashboard } from "@/features/backoffice/promotions/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("promotions.read");
    const { searchParams } = new URL(request.url);
    const data = await getAdminPromotionsDashboard({
      search: searchParams.get("search") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      branchId: searchParams.get("branchId") ?? undefined,
      districtId: searchParams.get("districtId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      active: searchParams.get("active") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudieron consultar las promociones.");
  }
}
