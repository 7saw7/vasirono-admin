import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getReviewReportsList } from "@/features/backoffice/review-reports/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("reviewReports.read");

    const { searchParams } = new URL(request.url);

    const data = await getReviewReportsList({
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo obtener la lista de reportes." },
      { status: 500 }
    );
  }
}