import { NextRequest, NextResponse } from "next/server";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getPlansDashboard, createPlan } from "@/features/backoffice/billing/plans.service";
import { upsertPlanSchema } from "@/features/backoffice/billing/schema";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("plans.read");
    const { searchParams } = new URL(request.url);
    const data = await getPlansDashboard({
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudieron consultar los planes.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await getBackofficeContext("plans.manage");
    const body = upsertPlanSchema.parse(await request.json());
    const data = await createPlan(body);
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: "No se pudo crear el plan.",
      statusMessages: {
        403: "No tienes permisos para administrar planes.",
        409: "Ya existe un plan con ese nombre.",
        422: "Revisa el nombre del plan.",
      },
    });
  }
}
