import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { query } from "@/lib/db/server";

export const runtime = "nodejs";

type CompanyScoreRow = {
  company_id: number | string;
  company_name: string;
  final_score: number | string | null;
  popularity_score: number | string | null;
  engagement_score: number | string | null;
  conversion_score: number | string | null;
  trust_score: number | string | null;
  freshness_score: number | string | null;
  active_branches_count: number | string | null;
  branches_with_score_count: number | string | null;
  reviews_90d: number | string | null;
  avg_rating_90d: number | string | null;
  calculated_at: string | null;
};

type TrendRow = {
  label: string;
  value: number | string | null;
};

type SummaryRow = {
  total_companies: number | string | null;
  average_score: number | string | null;
  last_calculated_at: string | null;
};

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

function buildFilters(searchParams: URLSearchParams) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  const historyClauses: string[] = [];
  const historyParams: unknown[] = [];

  const search = searchParams.get("search")?.trim();
  const companyId = searchParams.get("companyId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (search) {
    params.push(`%${search}%`);
    clauses.push(`c.name ilike $${params.length}`);
  }

  if (companyId) {
    params.push(Number(companyId));
    clauses.push(`acs.company_id = $${params.length}`);

    historyParams.push(Number(companyId));
    historyClauses.push(`company_id = $${historyParams.length}`);
  }

  if (from) {
    historyParams.push(from);
    historyClauses.push(`snapshot_date >= $${historyParams.length}`);
  }

  if (to) {
    historyParams.push(to);
    historyClauses.push(`snapshot_date <= $${historyParams.length}`);
  }

  return {
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
    historyWhere: historyClauses.length ? `where ${historyClauses.join(" and ")}` : "",
    historyParams,
  };
}

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("analytics.read");

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const pageSize = parsePositiveInt(searchParams.get("pageSize"), 10);
    const offset = (page - 1) * pageSize;

    const { whereSql, params, historyWhere, historyParams } =
      buildFilters(searchParams);

    const countResult = await query<{ total: number | string | null }>(
      `
        select count(*)::int as total
        from analytics_company_scores acs
        inner join companies c
          on c.company_id = acs.company_id
        ${whereSql}
      `,
      params
    );

    const listParams = [...params, pageSize, offset];

    const [listResult, historyResult, summaryResult] = await Promise.all([
      query<CompanyScoreRow>(
        `
          select
            acs.company_id,
            c.name as company_name,
            acs.final_score,
            acs.popularity_score,
            acs.engagement_score,
            acs.conversion_score,
            acs.trust_score,
            acs.freshness_score,
            acs.active_branches_count,
            acs.branches_with_score_count,
            acs.reviews_90d,
            acs.avg_rating_90d,
            acs.calculated_at::text as calculated_at
          from analytics_company_scores acs
          inner join companies c
            on c.company_id = acs.company_id
          ${whereSql}
          order by acs.final_score desc, acs.reviews_90d desc, acs.company_id desc
          limit $${listParams.length - 1} offset $${listParams.length}
        `,
        listParams
      ),
      query<TrendRow>(
        `
          select
            to_char(snapshot_date, 'YYYY-MM-DD') as label,
            round(avg(final_score), 2) as value
          from analytics_company_scores_history
          ${historyWhere}
          group by snapshot_date
          order by snapshot_date desc
          limit 30
        `,
        historyParams
      ),
      query<SummaryRow>(
        `
          select
            count(*)::int as total_companies,
            round(avg(acs.final_score), 2) as average_score,
            max(acs.calculated_at)::text as last_calculated_at
          from analytics_company_scores acs
          inner join companies c
            on c.company_id = acs.company_id
          ${whereSql}
        `,
        params
      ),
    ]);

    const data = {
      items: listResult.rows.map((row) => ({
        companyId: toNumber(row.company_id),
        companyName: row.company_name,
        finalScore: toNumber(row.final_score),
        popularityScore: toNumber(row.popularity_score),
        engagementScore: toNumber(row.engagement_score),
        conversionScore: toNumber(row.conversion_score),
        trustScore: toNumber(row.trust_score),
        freshnessScore: toNumber(row.freshness_score),
        activeBranchesCount: toNumber(row.active_branches_count),
        branchesWithScoreCount: toNumber(row.branches_with_score_count),
        reviews90d: toNumber(row.reviews_90d),
        avgRating90d: toNumber(row.avg_rating_90d),
        calculatedAt: row.calculated_at,
      })),
      page,
      pageSize,
      total: toNumber(countResult.rows[0]?.total),
      history: historyResult.rows
        .slice()
        .reverse()
        .map((row) => ({
          label: row.label,
          value: toNumber(row.value),
        })),
      summary: {
        totalCompanies: toNumber(summaryResult.rows[0]?.total_companies),
        averageScore: toNumber(summaryResult.rows[0]?.average_score),
        lastCalculatedAt: summaryResult.rows[0]?.last_calculated_at ?? null,
      },
    };

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver analytics de empresas."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener los analytics de empresas.",
      },
      { status }
    );
  }
}