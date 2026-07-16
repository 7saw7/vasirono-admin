import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getReviewDetail } from "@/features/backoffice/reviews/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reviewId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("reviews.read");

    const { reviewId } = await context.params;
    const parsedReviewId = Number(reviewId);

    if (!Number.isInteger(parsedReviewId) || parsedReviewId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El reviewId no es válido." },
        { status: 400 }
      );
    }

    const data = await getReviewDetail(parsedReviewId);

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Review no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (reviews reviewId).");
  }
}