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
            ? "No tienes permisos para ver suscripciones."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener las suscripciones.",
      },
      { status }
    );
  }
}