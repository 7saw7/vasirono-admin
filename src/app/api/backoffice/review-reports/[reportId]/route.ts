import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getReviewReportDetail } from "@/features/backoffice/review-reports/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("reviewReports.read");

    const { reportId } = await context.params;
    const parsedReportId = Number(reportId);

    if (!Number.isInteger(parsedReportId) || parsedReportId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El reportId no es válido." },
        { status: 400 }
      );
    }

    const data = await getReviewReportDetail(parsedReportId);

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Reporte no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo obtener el reporte." },
      { status: 500 }
    );
  }
}