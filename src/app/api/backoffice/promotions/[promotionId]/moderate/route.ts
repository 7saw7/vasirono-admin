import { NextRequest, NextResponse } from "next/server";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { moderatePromotionSchema, promotionIdParamSchema } from "@/features/backoffice/promotions/schema";
import { moderateAdminPromotion } from "@/features/backoffice/promotions/service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ promotionId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("promotions.moderate");
    const params = promotionIdParamSchema.parse(await context.params);
    const body = moderatePromotionSchema.parse(await request.json());
    const data = await moderateAdminPromotion(params.promotionId, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo registrar la decisión de moderación.");
  }
}
