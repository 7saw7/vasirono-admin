import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { query } from "@/lib/db/server";

export const runtime = "nodejs";

type TrendRow = {
  label: string;
  value: number | string | null;
};

type CategoryRow = {
  category_name: string | null;
  total: number | string | null;
};

type DistrictRow = {
  district_name: string | null;
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
    clauses.push(`selected_company_id = $${params.length}`);
  }

  if (branchId) {
    params.push(Number(branchId));
    clauses.push(`selected_branch_id = $${params.length}`);
  }

  if (from) {
    params.push(from);
    clauses.push(`created_at::date >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    clauses.push(`created_at::date <= $${params.length}`);
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

    const [trendResult, categoriesResult, districtsResult] = await Promise.all([
      query<TrendRow>(
        `
          select
            to_char(created_at::date, 'YYYY-MM-DD') as label,
            count(*)::int as value
          from analytics_searches
          ${whereSql}
          group by created_at::date
          order by created_at::date desc
          limit 30
        `,
        params
      ),
      query<CategoryRow>(
        `
          select
            c.name as category_name,
            count(*)::int as total
          from analytics_searches s
          left join categories c
            on c.category_id = s.category_id
          ${whereSql}
          group by c.name
          order by total desc nulls last
          limit 10
        `,
        params
      ),
      query<DistrictRow>(
        `
          select
            d.name as district_name,
            count(*)::int as total
          from analytics_searches s
          left join districts d
            on d.district_id = s.district_id
          ${whereSql}
          group by d.name
          order by total desc nulls last
          limit 10
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
        topCategories: categoriesResult.rows.map((row) => ({
          categoryName: row.category_name ?? "Sin categoría",
          total: toNumber(row.total),
        })),
        topDistricts: districtsResult.rows.map((row) => ({
          districtName: row.district_name ?? "Sin distrito",
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
            ? "No tienes permisos para ver búsquedas analytics."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener las búsquedas analytics.",
      },
      { status }
    );
  }
}