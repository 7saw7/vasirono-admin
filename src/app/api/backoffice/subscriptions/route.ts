import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getSubscriptionsDashboard } from "@/features/backoffice/billing/subscriptions.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("subscriptions.read");

    const { searchParams } = new URL(request.url);

    const data = await getSubscriptionsDashboard({
      search: searchParams.get("search") ?? undefined,
      statusId: searchParams.get("statusId") ?? undefined,
      planId: searchParams.get("planId") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (subscriptions).");
  }
}