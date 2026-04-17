import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getNotificationsDashboard } from "@/features/backoffice/notifications/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await getBackofficeContext("notifications.read");

    const { searchParams } = new URL(request.url);

    const data = await getNotificationsDashboard({
      search: searchParams.get("search") ?? undefined,
      typeId: searchParams.get("typeId") ?? undefined,
      read: searchParams.get("read") ?? undefined,
      userId: searchParams.get("userId") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return NextResponse.json({ ok: true, data });
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
            ? "No tienes permisos para ver notificaciones."
            : status === 401
            ? "No autenticado."
            : "No se pudieron obtener las notificaciones.",
      },
      { status }
    );
  }
}