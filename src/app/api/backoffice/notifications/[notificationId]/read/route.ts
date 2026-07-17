import { NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { markAdminNotificationRead } from "@/features/backoffice/notifications/service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ notificationId: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    await getBackofficeContext("notifications.read");
    const notificationId = Number((await context.params).notificationId);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return NextResponse.json({ ok: false, error: "notificationId inválido." }, { status: 400 });
    }
    const data = await markAdminNotificationRead(notificationId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo marcar la notificación como leída.");
  }
}
