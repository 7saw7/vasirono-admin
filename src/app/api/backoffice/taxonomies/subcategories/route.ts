import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import {
  createSubcategory,
  getSubcategoriesList,
} from "@/features/backoffice/taxonomies/service";

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
    await getBackofficeContext("taxonomies.read");

    const { searchParams } = new URL(request.url);

    const data = await getSubcategoriesList({
      entity: "subcategories",
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
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
            ? "No tienes permisos para consultar subcategorías."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener las subcategorías.",
      },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getBackofficeContext("taxonomies.subcategories.manage");

    const body = await request.json();
    const data = await createSubcategory(body);

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 409
            ? "Ya existe una subcategoría con ese nombre dentro de la categoría seleccionada."
            : status === 404
            ? "La categoría indicada no existe."
            : status === 403
            ? "No tienes permisos para crear subcategorías."
            : status === 401
            ? "No autenticado."
            : "No se pudo crear la subcategoría.",
      },
      { status }
    );
  }
}