import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import {
  createBusinessType,
  getBusinessTypesList,
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

    const data = await getBusinessTypesList({
      entity: "business-types",
      search: searchParams.get("search") ?? undefined,
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
            ? "No tienes permisos para consultar tipos de negocio."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener los tipos de negocio.",
      },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getBackofficeContext("taxonomies.businessTypes.manage");

    const body = await request.json();
    const data = await createBusinessType(body);

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 409
            ? "Ya existe un tipo de negocio con ese nombre."
            : status === 403
            ? "No tienes permisos para crear tipos de negocio."
            : status === 401
            ? "No autenticado."
            : status === 404
            ? "Recurso relacionado no encontrado."
            : "No se pudo crear el tipo de negocio.",
      },
      { status }
    );
  }
}