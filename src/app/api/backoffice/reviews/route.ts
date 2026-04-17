import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getReviewsList } from "@/features/backoffice/reviews/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("reviews.read");

    const { searchParams } = new URL(request.url);

    const data = await getReviewsList({
      search: searchParams.get("search") ?? undefined,
      validated: searchParams.get("validated") ?? undefined,
      hidden: searchParams.get("hidden") ?? undefined,
      branchId: searchParams.get("branchId") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver reseñas."
            : "No se pudo obtener la lista de reseñas.",
      },
      { status }
    );
  }
}