import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import {
  createPromotion,
  getPromotionsDashboard,
} from "@/features/backoffice/billing/promotions.service";

export const runtime = "nodejs";

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
    await getBackofficeContext("promotions.read");

    const { searchParams } = new URL(request.url);

    const data = await getPromotionsDashboard({
      search: searchParams.get("search") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
      active: searchParams.get("active") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver promociones."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener las promociones.",
      },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getBackofficeContext("promotions.manage");

    const body = await request.json();
    const data = await createPromotion(body);

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para crear promociones."
            : status === 401
            ? "No autenticado."
            : "No se pudo crear la promoción.",
      },
      { status }
    );
  }
}