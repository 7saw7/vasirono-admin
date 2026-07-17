import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { billingEntityIdParamSchema, updateSubscriptionStatusSchema } from "@/features/backoffice/billing/schema";
import { updateSubscriptionStatus } from "@/features/backoffice/billing/subscriptions.service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ subscriptionId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("subscriptions.manage");
    const params = billingEntityIdParamSchema.parse({ id: (await context.params).subscriptionId });
    const body = updateSubscriptionStatusSchema.parse(await request.json());
    const data = await updateSubscriptionStatus(params.id, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo actualizar el estado de la suscripción.");
  }
}
