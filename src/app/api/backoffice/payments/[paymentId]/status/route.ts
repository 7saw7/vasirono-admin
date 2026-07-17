import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { billingEntityIdParamSchema, updatePaymentStatusSchema } from "@/features/backoffice/billing/schema";
import { updatePaymentStatus } from "@/features/backoffice/billing/payments.service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ paymentId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("payments.manage");
    const params = billingEntityIdParamSchema.parse({ id: (await context.params).paymentId });
    const body = updatePaymentStatusSchema.parse(await request.json());
    const data = await updatePaymentStatus(params.id, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: "No se pudo actualizar el estado del pago.",
      statusMessages: {
        403: "No tienes permisos para ajustar pagos.",
        404: "El pago ya no existe.",
        409: "El pago cambió mientras realizabas la operación.",
        422: "El estado seleccionado no es válido.",
      },
    });
  }
}
