import { NextResponse } from "next/server";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { promotionIdParamSchema } from "@/features/backoffice/promotions/schema";
import { getAdminPromotionDetail } from "@/features/backoffice/promotions/service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ promotionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await getBackofficeContext("promotions.read");
    const params = promotionIdParamSchema.parse(await context.params);
    const data = await getAdminPromotionDetail(params.promotionId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo consultar la promoción.");
  }
}
