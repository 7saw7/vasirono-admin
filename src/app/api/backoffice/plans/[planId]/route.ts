import { NextRequest, NextResponse } from "next/server";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { billingEntityIdParamSchema, upsertPlanSchema } from "@/features/backoffice/billing/schema";
import { updatePlan } from "@/features/backoffice/billing/plans.service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ planId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("plans.manage");
    const params = billingEntityIdParamSchema.parse({ id: (await context.params).planId });
    const body = upsertPlanSchema.parse(await request.json());
    const data = await updatePlan(params.id, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: "No se pudo actualizar el plan.",
      statusMessages: {
        403: "No tienes permisos para administrar planes.",
        404: "El plan ya no existe.",
        409: "El nombre solicitado ya está en uso.",
        422: "Revisa el nombre del plan.",
      },
    });
  }
}
