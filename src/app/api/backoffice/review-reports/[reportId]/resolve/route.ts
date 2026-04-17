import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { reviewReportIdParamSchema } from "@/features/backoffice/reviews/schema";
import { resolveReviewReport } from "@/features/backoffice/reviews/service";

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
    const session = await getBackofficeContext("reviewReports.resolve");
    const params = reviewReportIdParamSchema.parse(await context.params);
    const body = await request.json();

    const data = await resolveReviewReport(
      params.reportId,
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
            ? "El reporte no existe."
            : status === 403
            ? "No tienes permisos para resolver reportes."
            : status === 401
            ? "No autenticado."
            : "No se pudo resolver el reporte.",
      },
      { status }
    );
  }
}