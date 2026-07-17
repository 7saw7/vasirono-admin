import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { billingEntityIdParamSchema, cancelSubscriptionSchema } from "@/features/backoffice/billing/schema";
import { cancelSubscription } from "@/features/backoffice/billing/subscriptions.service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ subscriptionId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("subscriptions.manage");
    const params = billingEntityIdParamSchema.parse({ id: (await context.params).subscriptionId });
    const body = cancelSubscriptionSchema.parse(await request.json().catch(() => ({})));
    const data = await cancelSubscription(params.id, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo cancelar la suscripción.");
  }
}
