import { query } from "@/lib/db/server";
import type { AnalyticsFilters } from "@/features/backoffice/analytics/types";
import type {
  AnalyticsOverviewRow,
  AnalyticsSeriesRow,
  AnalyticsTopBranchRow,
} from "@/features/backoffice/analytics/mapper";

type SqlFilterParts = {
  sql: string;
  params: unknown[];
};

function pushClause(
  clauses: string[],
  params: unknown[],
  expression: string,
  value: unknown
) {
  params.push(value);
  clauses.push(`${expression} $${params.length}`);
}

function buildEventsWhere(filters: AnalyticsFilters): SqlFilterParts {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.companyId) {
    pushClause(clauses, params, "company_id =", Number(filters.companyId));
  }

  if (filters.branchId) {
    pushClause(clauses, params, "branch_id =", Number(filters.branchId));
  }

  if (filters.from) {
    pushClause(clauses, params, "occurred_at::date >=", filters.from);
  }

  if (filters.to) {
    pushClause(clauses, params, "occurred_at::date <=", filters.to);
  }

  return {
    sql: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

function buildSearchesWhere(filters: AnalyticsFilters): SqlFilterParts {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.companyId) {
    pushClause(
      clauses,
      params,
      "selected_company_id =",
      Number(filters.companyId)
    );
  }

  if (filters.branchId) {
    pushClause(
      clauses,
      params,
      "selected_branch_id =",
      Number(filters.branchId)
    );
  }

  if (filters.from) {
    pushClause(clauses, params, "created_at::date >=", filters.from);
  }

  if (filters.to) {
    pushClause(clauses, params, "created_at::date <=", filters.to);
  }

  return {
    sql: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

function buildFunnelWhere(filters: AnalyticsFilters): SqlFilterParts {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.companyId) {
    pushClause(clauses, params, "company_id =", Number(filters.companyId));
  }

  if (filters.branchId) {
    pushClause(clauses, params, "branch_id =", Number(filters.branchId));
  }

  if (filters.from) {
    pushClause(clauses, params, "snapshot_date >=", filters.from);
  }

  if (filters.to) {
    pushClause(clauses, params, "snapshot_date <=", filters.to);
  }

  return {
    sql: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

function buildBranchScoreHistoryWhere(filters: AnalyticsFilters): SqlFilterParts {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.companyId) {
    pushClause(clauses, params, "company_id =", Number(filters.companyId));
  }

  if (filters.branchId) {
    pushClause(clauses, params, "branch_id =", Number(filters.branchId));
  }

  if (filters.from) {
    pushClause(clauses, params, "snapshot_date >=", filters.from);
  }

  if (filters.to) {
    pushClause(clauses, params, "snapshot_date <=", filters.to);
  }

  return {
    sql: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

function buildCompanyScoreHistoryWhere(
  filters: AnalyticsFilters
): SqlFilterParts {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.companyId) {
    pushClause(clauses, params, "company_id =", Number(filters.companyId));
  }

  if (filters.from) {
    pushClause(clauses, params, "snapshot_date >=", filters.from);
  }

  if (filters.to) {
    pushClause(clauses, params, "snapshot_date <=", filters.to);
  }

  return {
    sql: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

function buildTopBranchesWhere(filters: AnalyticsFilters): SqlFilterParts {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.companyId) {
    pushClause(clauses, params, "abs.company_id =", Number(filters.companyId));
  }

  if (filters.branchId) {
    pushClause(clauses, params, "abs.branch_id =", Number(filters.branchId));
  }

  return {
    sql: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

export async function getAnalyticsOverviewQuery(filters: AnalyticsFilters) {
  const eventsWhere = buildEventsWhere(filters);
  const searchesWhere = buildSearchesWhere(filters);

  const [eventsResult, searchesResult] = await Promise.all([
    query<AnalyticsOverviewRow>(
      `
        select
          count(*)::int as total_events,
          count(*) filter (where event_type = 'profile_view')::int as total_profile_views,
          count(*) filter (
            where event_type in ('contact_click', 'whatsapp_click', 'call_click')
          )::int as total_contact_clicks,
          0::int as total_searches
        from analytics_events
        ${eventsWhere.sql}
      `,
      eventsWhere.params
    ),
    query<{ total_searches: number | string | null }>(
      `
        select count(*)::int as total_searches
        from analytics_searches
        ${searchesWhere.sql}
      `,
      searchesWhere.params
    ),
  ]);

  const base = eventsResult.rows[0];

  return {
    ...(base ?? {
      total_events: 0,
      total_profile_views: 0,
      total_contact_clicks: 0,
      total_searches: 0,
    }),
    total_searches: Number(searchesResult.rows[0]?.total_searches ?? 0),
  };
}

export async function getAnalyticsFunnelQuery(filters: AnalyticsFilters) {
  const funnelWhere = buildFunnelWhere(filters);

  const result = await query<AnalyticsSeriesRow>(
    `
      select label, value
      from (
        select
          'profile_views'::text as label,
          coalesce(sum(profile_views), 0)::numeric as value
        from analytics_conversion_funnel_daily
        ${funnelWhere.sql}

        union all

        select
          'favorites_added'::text as label,
          coalesce(sum(favorites_added), 0)::numeric as value
        from analytics_conversion_funnel_daily
        ${funnelWhere.sql}

        union all

        select
          'promotion_opens'::text as label,
          coalesce(sum(promotion_opens), 0)::numeric as value
        from analytics_conversion_funnel_daily
        ${funnelWhere.sql}

        union all

        select
          'contact_clicks'::text as label,
          coalesce(sum(contact_clicks), 0)::numeric as value
        from analytics_conversion_funnel_daily
        ${funnelWhere.sql}

        union all

        select
          'claim_submissions'::text as label,
          coalesce(sum(claim_submissions), 0)::numeric as value
        from analytics_conversion_funnel_daily
        ${funnelWhere.sql}
      ) funnel
    `,
    [
      ...funnelWhere.params,
      ...funnelWhere.params,
      ...funnelWhere.params,
      ...funnelWhere.params,
      ...funnelWhere.params,
    ]
  );

  return result.rows;
}

export async function getBranchScoreTrendQuery(filters: AnalyticsFilters) {
  const trendWhere = buildBranchScoreHistoryWhere(filters);

  const result = await query<AnalyticsSeriesRow>(
    `
      select
        to_char(snapshot_date, 'YYYY-MM-DD') as label,
        round(avg(final_score), 2) as value
      from analytics_branch_scores_history
      ${trendWhere.sql}
      group by snapshot_date
      order by snapshot_date desc
      limit 14
    `,
    trendWhere.params
  );

  return result.rows.reverse();
}

export async function getCompanyScoreTrendQuery(filters: AnalyticsFilters) {
  const trendWhere = buildCompanyScoreHistoryWhere(filters);

  const result = await query<AnalyticsSeriesRow>(
    `
      select
        to_char(snapshot_date, 'YYYY-MM-DD') as label,
        round(avg(final_score), 2) as value
      from analytics_company_scores_history
      ${trendWhere.sql}
      group by snapshot_date
      order by snapshot_date desc
      limit 14
    `,
    trendWhere.params
  );

  return result.rows.reverse();
}

export async function getTopBranchesAnalyticsQuery(filters: AnalyticsFilters) {
  const where = buildTopBranchesWhere(filters);

  const result = await query<AnalyticsTopBranchRow>(
    `
      select
        abs.branch_id,
        cb.name as branch_name,
        c.name as company_name,
        abs.final_score,
        abs.visits_30d,
        abs.reviews_90d
      from analytics_branch_scores abs
      inner join company_branches cb
        on cb.branch_id = abs.branch_id
      inner join companies c
        on c.company_id = abs.company_id
      ${where.sql}
      order by abs.final_score desc, abs.visits_30d desc
      limit 10
    `,
    where.params
  );

  return result.rows;
}