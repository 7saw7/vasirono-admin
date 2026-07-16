import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getVerificationRequestsList } from "@/features/backoffice/verifications/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("verifications.read");

    const { searchParams } = new URL(request.url);

    const data = await getVerificationRequestsList({
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      assignedReviewerId: searchParams.get("assignedReviewerId") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (verifications).");
  }
}