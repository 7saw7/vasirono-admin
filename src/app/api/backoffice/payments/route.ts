import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getPaymentsDashboard } from "@/features/backoffice/billing/payments.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("payments.read");

    const { searchParams } = new URL(request.url);

    const data = await getPaymentsDashboard({
      search: searchParams.get("search") ?? undefined,
      statusId: searchParams.get("statusId") ?? undefined,
      paymentMethodId: searchParams.get("paymentMethodId") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (payments).");
  }
}