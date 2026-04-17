import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { reviewIdParamSchema } from "@/features/backoffice/reviews/schema";
import { hideReview } from "@/features/backoffice/reviews/service";

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
    const body = await request.json();

    const data = await hideReview(
      params.reviewId,
      session.user.id,
      body
    );

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 404
            ? "La reseña no existe."
            : status === 400
            ? "La reseña no puede ocultarse con el estado actual."
            : status === 403
            ? "No tienes permisos para moderar reseñas."
            : status === 401
            ? "No autenticado."
            : "No se pudo ocultar la reseña.",
      },
      { status }
    );
  }
}