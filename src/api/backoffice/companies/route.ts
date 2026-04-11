import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getCompaniesList } from "@/features/backoffice/companies/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("companies.read");

    const { searchParams } = new URL(request.url);

    const data = await getCompaniesList({
      search: searchParams.get("search") ?? undefined,
      verificationStatus: searchParams.get("verificationStatus") ?? undefined,
      subscriptionStatus: searchParams.get("subscriptionStatus") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      data,
    });
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
            ? "No tienes permisos para ver empresas."
            : status === 401
            ? "No autenticado."
            : "No se pudo obtener el listado de empresas.",
      },
      { status }
    );
  }
}