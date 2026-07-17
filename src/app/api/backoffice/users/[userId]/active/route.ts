import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { updateAdminUserActiveSchema, userIdParamSchema } from "@/features/backoffice/users/schema";
import { updateAdminUserActive } from "@/features/backoffice/users/service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("users.manage");
    const params = userIdParamSchema.parse(await context.params);
    const body = updateAdminUserActiveSchema.parse(await request.json());
    const data = await updateAdminUserActive(params.userId, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: "No se pudo actualizar el estado del usuario.",
      statusMessages: {
        403: "No puedes modificar este usuario.",
        409: "El usuario cambió mientras realizabas la operación.",
      },
    });
  }
}
