import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getUsersList } from "@/features/backoffice/users/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("users.read");

    const { searchParams } = new URL(request.url);

    const data = await getUsersList({
      search: searchParams.get("search") ?? undefined,
      roleId: searchParams.get("roleId") ?? undefined,
      verified: searchParams.get("verified") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (users).");
  }
}