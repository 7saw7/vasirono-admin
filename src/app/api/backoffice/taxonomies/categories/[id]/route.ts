import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { taxonomyIdParamSchema } from "@/features/backoffice/taxonomies/schema";
import { updateCategory } from "@/features/backoffice/taxonomies/service";

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
    await getBackofficeContext("taxonomies.categories.manage");

    const params = taxonomyIdParamSchema.parse(await context.params);
    const body = await request.json();

    const data = await updateCategory(params.id, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 409
            ? "Ya existe una categoría con ese nombre."
            : status === 404
            ? "La categoría no existe."
            : status === 403
            ? "No tienes permisos para editar categorías."
            : status === 401
            ? "No autenticado."
            : "No se pudo actualizar la categoría.",
      },
      { status }
    );
  }
}