import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
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
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (companies).");
  }
}