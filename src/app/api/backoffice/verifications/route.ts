import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getVerificationRequestsList } from "@/features/backoffice/verifications/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("verifications.read");

    const { searchParams } = new URL(request.url);

    const data = await getVerificationRequestsList({
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      assignedReviewerId: searchParams.get("assignedReviewerId") ?? undefined,
      companyId: searchParams.get("companyId") ?? undefined,
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
            ? "No tienes permisos para ver verificaciones."
            : status === 401
            ? "No autenticado."
            : "No se pudo obtener el listado de verificaciones.",
      },
      { status }
    );
  }
}