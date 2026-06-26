import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import {
  BackofficeServiceError,
  callBackofficeService,
} from "@/lib/microservices/backoffice-client";

export function queryFromRequest(request: NextRequest) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

function getStatus(error: unknown) {
  if (error instanceof BackofficeServiceError) return error.status;
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
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
    const status = getStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error:
          status === 403
            ? "No tienes permisos para ver analytics."
            : status === 401
            ? "No autenticado."
            : getErrorMessage(error, fallbackError),
      },
      { status }
    );
  }
}
