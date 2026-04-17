import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getTaxonomiesDashboard } from "@/features/backoffice/taxonomies/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("taxonomies.read");

    const { searchParams } = new URL(request.url);

    const data = await getTaxonomiesDashboard({
      businessTypes: {
        search: searchParams.get("btSearch") ?? undefined,
        page: searchParams.get("btPage") ?? undefined,
        pageSize: searchParams.get("btPageSize") ?? undefined,
      },
      categories: {
        search: searchParams.get("catSearch") ?? undefined,
        page: searchParams.get("catPage") ?? undefined,
        pageSize: searchParams.get("catPageSize") ?? undefined,
      },
      subcategories: {
        search: searchParams.get("subSearch") ?? undefined,
        categoryId: searchParams.get("subCategoryId") ?? undefined,
        page: searchParams.get("subPage") ?? undefined,
        pageSize: searchParams.get("subPageSize") ?? undefined,
      },
      services: {
        search: searchParams.get("srvSearch") ?? undefined,
        active: searchParams.get("srvActive") ?? undefined,
        page: searchParams.get("srvPage") ?? undefined,
        pageSize: searchParams.get("srvPageSize") ?? undefined,
      },
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver taxonomías."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener las taxonomías.",
      },
      { status }
    );
  }
}