import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { promotionIdParamSchema } from "@/features/backoffice/billing/schema";
import { updatePromotion } from "@/features/backoffice/billing/promotions.service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ promotionId: string }>;
};

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("promotions.manage");

    const params = promotionIdParamSchema.parse(await context.params);
    const body = await request.json();

    const data = await updatePromotion(params.promotionId, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 404
            ? "La promoción no existe."
            : status === 403
            ? "No tienes permisos para editar promociones."
            : status === 401
            ? "No autenticado."
            : "No se pudo actualizar la promoción.",
      },
      { status }
    );
  }
}