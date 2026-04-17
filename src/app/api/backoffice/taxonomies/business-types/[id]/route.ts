import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { taxonomyIdParamSchema } from "@/features/backoffice/taxonomies/schema";
import { updateBusinessType } from "@/features/backoffice/taxonomies/service";

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
    await getBackofficeContext("taxonomies.businessTypes.manage");

    const params = taxonomyIdParamSchema.parse(await context.params);
    const body = await request.json();

    const data = await updateBusinessType(params.id, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 409
            ? "Ya existe un tipo de negocio con ese nombre."
            : status === 404
            ? "El tipo de negocio no existe."
            : status === 403
            ? "No tienes permisos para editar tipos de negocio."
            : status === 401
            ? "No autenticado."
            : "No se pudo actualizar el tipo de negocio.",
      },
      { status }
    );
  }
}