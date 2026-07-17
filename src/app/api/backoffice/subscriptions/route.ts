import { NextRequest, NextResponse } from "next/server";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getSubscriptionsDashboard, createSubscription } from "@/features/backoffice/billing/subscriptions.service";
import { createSubscriptionSchema } from "@/features/backoffice/billing/schema";

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
    return toBackofficeErrorResponse(error, "No se pudieron consultar las suscripciones.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await getBackofficeContext("subscriptions.manage");
    const body = createSubscriptionSchema.parse(await request.json());
    const data = await createSubscription(body);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: "No se pudo crear la suscripción.",
      statusMessages: {
        403: "No tienes permisos para administrar suscripciones.",
        404: "La empresa o el plan no existen.",
        409: "Ya existe una operación equivalente o la empresa tiene una suscripción incompatible.",
        422: "Revisa los datos de la suscripción.",
      },
    });
  }
}
