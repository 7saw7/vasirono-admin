import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { query } from "@/lib/db/server";

export const runtime = "nodejs";

type TrendRow = {
  label: string;
  value: number | string | null;
};

type EventTypeRow = {
  event_type: string;
  total: number | string | null;
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

function buildWhere(searchParams: URLSearchParams) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  const companyId = searchParams.get("companyId");
  const branchId = searchParams.get("branchId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (companyId) {
    params.push(Number(companyId));
    clauses.push(`company_id = $${params.length}`);
  }

  if (branchId) {
    params.push(Number(branchId));
    clauses.push(`branch_id = $${params.length}`);
  }

  if (from) {
    params.push(from);
    clauses.push(`occurred_at::date >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    clauses.push(`occurred_at::date <= $${params.length}`);
  }

  return {
    whereSql: clauses.length ? `where ${clauses.join(" and ")}` : "",
    params,
  };
}

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("analytics.read");

    const { searchParams } = new URL(request.url);
    const { whereSql, params } = buildWhere(searchParams);

    const [trendResult, typesResult] = await Promise.all([
      query<TrendRow>(
        `
          select
            to_char(occurred_at::date, 'YYYY-MM-DD') as label,
            count(*)::int as value
          from analytics_events
          ${whereSql}
          group by occurred_at::date
          order by occurred_at::date desc
          limit 30
        `,
        params
      ),
      query<EventTypeRow>(
        `
          select
            event_type,
            count(*)::int as total
          from analytics_events
          ${whereSql}
          group by event_type
          order by total desc, event_type asc
          limit 15
        `,
        params
      ),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        trend: trendResult.rows
          .slice()
          .reverse()
          .map((row) => ({
            label: row.label,
            value: toNumber(row.value),
          })),
        topEventTypes: typesResult.rows.map((row) => ({
          eventType: row.event_type,
          total: toNumber(row.total),
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
            ? "No tienes permisos para ver eventos."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener los eventos analytics.",
      },
      { status }
    );
  }
}