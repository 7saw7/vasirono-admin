import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";

export function queryFromRequest(request: NextRequest) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export async function proxyBackofficeAnalytics(
  request: NextRequest,
  path: string,
  fallbackError: string
) {
  try {
    await getBackofficeContext("analytics.read");

    const data = await callBackofficeService<unknown>("analytics", path, {
      query: queryFromRequest(request),
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: fallbackError,
      statusMessages: {
        403: "No tienes permisos para ver analytics.",
      },
    });
  }
}
