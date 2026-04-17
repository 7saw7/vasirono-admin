import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import {
  createService,
  getServicesList,
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

    const data = await getServicesList({
      entity: "services",
      search: searchParams.get("search") ?? undefined,
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
            ? "No tienes permisos para consultar servicios."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener los servicios.",
      },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getBackofficeContext("taxonomies.services.manage");

    const body = await request.json();
    const data = await createService(body);

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 409
            ? "Ya existe un servicio con ese nombre o código."
            : status === 403
            ? "No tienes permisos para crear servicios."
            : status === 401
            ? "No autenticado."
            : "No se pudo crear el servicio.",
      },
      { status }
    );
  }
}