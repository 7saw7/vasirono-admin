import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getTopBranchesAnalyticsQuery } from "@/lib/db/queries/backoffice/analytics";
import { query } from "@/lib/db/server";

export const runtime = "nodejs";

type CompanyRankingRow = {
  company_id: number | string;
  company_name: string;
  final_score: number | string | null;
  active_branches_count: number | string | null;
  reviews_90d: number | string | null;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("analytics.read");

    const { searchParams } = new URL(request.url);

    const filters = {
      companyId: searchParams.get("companyId") ?? undefined,
      branchId: searchParams.get("branchId") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    };

    const [topBranches, topCompaniesResult] = await Promise.all([
      getTopBranchesAnalyticsQuery(filters),
      query<CompanyRankingRow>(
        `
          select
            acs.company_id,
            c.name as company_name,
            acs.final_score,
            acs.active_branches_count,
            acs.reviews_90d
          from analytics_company_scores acs
          inner join companies c
            on c.company_id = acs.company_id
          order by acs.final_score desc, acs.reviews_90d desc
          limit 10
        `
      ),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        topBranches,
        topCompanies: topCompaniesResult.rows.map((row) => ({
          companyId: toNumber(row.company_id),
          companyName: row.company_name,
          finalScore: toNumber(row.final_score),
          activeBranchesCount: toNumber(row.active_branches_count),
          reviews90d: toNumber(row.reviews_90d),
        })),
      },
    });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver rankings."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener los rankings analytics.",
      },
      { status }
    );
  }
}