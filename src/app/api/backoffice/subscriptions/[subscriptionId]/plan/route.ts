import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { billingEntityIdParamSchema, changeSubscriptionPlanSchema } from "@/features/backoffice/billing/schema";
import { changeSubscriptionPlan } from "@/features/backoffice/billing/subscriptions.service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ subscriptionId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("subscriptions.manage");
    const params = billingEntityIdParamSchema.parse({ id: (await context.params).subscriptionId });
    const body = changeSubscriptionPlanSchema.parse(await request.json());
    const data = await changeSubscriptionPlan(params.id, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo cambiar el plan de la suscripción.");
  }
}
