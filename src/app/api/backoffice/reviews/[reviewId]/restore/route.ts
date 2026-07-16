import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { reviewIdParamSchema } from "@/features/backoffice/reviews/schema";
import { restoreReview } from "@/features/backoffice/reviews/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getBackofficeContext("reviews.moderate");
    const params = reviewIdParamSchema.parse(await context.params);
    const body = await request.json().catch(() => ({}));

    const data = await restoreReview(
      params.reviewId,
      session.user.id,
      body
    );

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (reviews reviewId restore).");
  }
}