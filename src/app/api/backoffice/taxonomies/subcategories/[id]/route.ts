import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { taxonomyIdParamSchema } from "@/features/backoffice/taxonomies/schema";
import { updateSubcategory } from "@/features/backoffice/taxonomies/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("taxonomies.subcategories.manage");

    const params = taxonomyIdParamSchema.parse(await context.params);
    const body = await request.json();

    const data = await updateSubcategory(params.id, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (taxonomies subcategories id).");
  }
}