import { NextRequest, NextResponse } from "next/server";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { promotionIdParamSchema, updatePromotionStatusSchema } from "@/features/backoffice/promotions/schema";
import { updateAdminPromotionStatus } from "@/features/backoffice/promotions/service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ promotionId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("promotions.updateStatus");
    const params = promotionIdParamSchema.parse(await context.params);
    const body = updatePromotionStatusSchema.parse(await request.json());
    const data = await updateAdminPromotionStatus(params.promotionId, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo actualizar el estado operativo de la promoción.");
  }
}
