import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { reviewReportIdParamSchema } from "@/features/backoffice/reviews/schema";
import { resolveReviewReport } from "@/features/backoffice/review-reports/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reportId: string;
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
    await getBackofficeContext("reviewReports.resolve");
    const params = reviewReportIdParamSchema.parse(await context.params);
    const body = await request.json();

    const data = await resolveReviewReport(params.reportId, "", {
      status: body?.status ?? body?.resolution ?? "resolved",
      resolutionNotes: body?.resolutionNotes ?? body?.notes ?? null,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (review-reports reportId resolve).");
  }
}
