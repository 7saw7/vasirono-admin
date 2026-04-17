import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { query } from "@/lib/db/server";

export const runtime = "nodejs";

type BranchScoreRow = {
  branch_id: number | string;
  branch_name: string;
  company_id: number | string;
  company_name: string;
  district_name: string | null;
  final_score: number | string | null;
  popularity_score: number | string | null;
  engagement_score: number | string | null;
  conversion_score: number | string | null;
  trust_score: number | string | null;
  freshness_score: number | string | null;
  visits_30d: number | string | null;
  favorites_30d: number | string | null;
  contact_clicks_30d: number | string | null;
  reviews_90d: number | string | null;
  avg_rating_90d: number | string | null;
  calculated_at: string | null;
};

type TrendRow = {
  label: string;
  value: number | string | null;
};

type SourceRow = {
  source: string;
  visits_count: number | string | null;
  favorites_count: number | string | null;
  contact_clicks: number | string | null;
  reviews_count: number | string | null;
};

type SummaryRow = {
  total_branches: number | string | null;
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
  const sourceClauses: string[] = [];
  const sourceParams: unknown[] = [];
  const historyClauses: string[] = [];
  const historyParams: unknown[] = [];

  const search = searchParams.get("search")?.trim();
  const companyId = searchParams.get("companyId");
  const branchId = searchParams.get("branchId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (search) {
    params.push(`%${search}%`);
    const i = params.length;
    clauses.push(`(cb.name ilike $${i} or c.name ilike $${i})`);
  }

  if (companyId) {
    params.push(Number(companyId));
    const i = params.length;
    clauses.push(`abs.company_id = $${i}`);

    sourceParams.push(Number(companyId));
    sourceClauses.push(`cb.company_id = $${sourceParams.length}`);

    historyParams.push(Number(companyId));
    historyClauses.push(`company_id = $${historyParams.length}`);
  }

  if (branchId) {
    params.push(Number(branchId));
    const i = params.length;
    clauses.push(`abs.branch_id = $${i}`);

    sourceParams.push(Number(branchId));
    sourceClauses.push(`abds.branch_id = $${sourceParams.length}`);

    historyParams.push(Number(branchId));
    historyClauses.push(`branch_id = $${historyParams.length}`);
  }

  if (from) {
    sourceParams.push(from);
    sourceClauses.push(`abds.snapshot_date >= $${sourceParams.length}`);

    historyParams.push(from);
    historyClauses.push(`snapshot_date >= $${historyParams.length}`);
  }

  if (to) {
    sourceParams.push(to);
    sourceClauses.push(`abds.snapshot_date <= $${sourceParams.length}`);

    historyParams.push(to);
    historyClauses.push(`snapshot_date <= $${historyParams.length}`);
  }

  return {
    scoreWhere: clauses.length ? `where ${clauses.join(" and ")}` : "",
    scoreParams: params,
    sourceWhere: sourceClauses.length ? `where ${sourceClauses.join(" and ")}` : "",
    sourceParams,
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

    const {
      scoreWhere,
      scoreParams,
      sourceWhere,
      sourceParams,
      historyWhere,
      historyParams,
    } = buildFilters(searchParams);

    const countResult = await query<{ total: number | string | null }>(
      `
        select count(*)::int as total
        from analytics_branch_scores abs
        inner join company_branches cb
          on cb.branch_id = abs.branch_id
        inner join companies c
          on c.company_id = abs.company_id
        left join districts d
          on d.district_id = abs.district_id
        ${scoreWhere}
      `,
      scoreParams
    );

    const listParams = [...scoreParams, pageSize, offset];

    const [listResult, historyResult, sourcesResult, summaryResult] =
      await Promise.all([
        query<BranchScoreRow>(
          `
            select
              abs.branch_id,
              cb.name as branch_name,
              abs.company_id,
              c.name as company_name,
              d.name as district_name,
              abs.final_score,
              abs.popularity_score,
              abs.engagement_score,
              abs.conversion_score,
              abs.trust_score,
              abs.freshness_score,
              abs.visits_30d,
              abs.favorites_30d,
              abs.contact_clicks_30d,
              abs.reviews_90d,
              abs.avg_rating_90d,
              abs.calculated_at::text as calculated_at
            from analytics_branch_scores abs
            inner join company_branches cb
              on cb.branch_id = abs.branch_id
            inner join companies c
              on c.company_id = abs.company_id
            left join districts d
              on d.district_id = abs.district_id
            ${scoreWhere}
            order by abs.final_score desc, abs.visits_30d desc, abs.branch_id desc
            limit $${listParams.length - 1} offset $${listParams.length}
          `,
          listParams
        ),
        query<TrendRow>(
          `
            select
              to_char(snapshot_date, 'YYYY-MM-DD') as label,
              round(avg(final_score), 2) as value
            from analytics_branch_scores_history
            ${historyWhere}
            group by snapshot_date
            order by snapshot_date desc
            limit 30
          `,
          historyParams
        ),
        query<SourceRow>(
          `
            select
              abds.source,
              coalesce(sum(abds.visits_count), 0)::int as visits_count,
              coalesce(sum(abds.favorites_count), 0)::int as favorites_count,
              coalesce(sum(abds.contact_clicks), 0)::int as contact_clicks,
              coalesce(sum(abds.reviews_count), 0)::int as reviews_count
            from analytics_branch_daily_sources abds
            inner join company_branches cb
              on cb.branch_id = abds.branch_id
            ${sourceWhere}
            group by abds.source
            order by visits_count desc, favorites_count desc
          `,
          sourceParams
        ),
        query<SummaryRow>(
          `
            select
              count(*)::int as total_branches,
              round(avg(abs.final_score), 2) as average_score,
              max(abs.calculated_at)::text as last_calculated_at
            from analytics_branch_scores abs
            inner join company_branches cb
              on cb.branch_id = abs.branch_id
            inner join companies c
              on c.company_id = abs.company_id
            left join districts d
              on d.district_id = abs.district_id
            ${scoreWhere}
          `,
          scoreParams
        ),
      ]);

    const data = {
      items: listResult.rows.map((row) => ({
        branchId: toNumber(row.branch_id),
        branchName: row.branch_name,
        companyId: toNumber(row.company_id),
        companyName: row.company_name,
        districtName: row.district_name,
        finalScore: toNumber(row.final_score),
        popularityScore: toNumber(row.popularity_score),
        engagementScore: toNumber(row.engagement_score),
        conversionScore: toNumber(row.conversion_score),
        trustScore: toNumber(row.trust_score),
        freshnessScore: toNumber(row.freshness_score),
        visits30d: toNumber(row.visits_30d),
        favorites30d: toNumber(row.favorites_30d),
        contactClicks30d: toNumber(row.contact_clicks_30d),
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
      sources: sourcesResult.rows.map((row) => ({
        source: row.source,
        visitsCount: toNumber(row.visits_count),
        favoritesCount: toNumber(row.favorites_count),
        contactClicks: toNumber(row.contact_clicks),
        reviewsCount: toNumber(row.reviews_count),
      })),
      summary: {
        totalBranches: toNumber(summaryResult.rows[0]?.total_branches),
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
            ? "No tienes permisos para ver analytics de sucursales."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener los analytics de sucursales.",
      },
      { status }
    );
  }
}