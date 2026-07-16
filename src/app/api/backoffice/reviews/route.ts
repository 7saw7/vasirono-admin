import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
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
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (reviews).");
  }
}