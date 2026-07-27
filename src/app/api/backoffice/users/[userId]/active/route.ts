import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import {
  updateAdminUserActiveSchema,
  userIdParamSchema,
} from "@/features/backoffice/users/schema";
import { updateAdminUserActive } from "@/features/backoffice/users/service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("users.changeStatus");
    const params = userIdParamSchema.parse(await context.params);
    const body = updateAdminUserActiveSchema.parse(await request.json());
    const data = await updateAdminUserActive(params.userId, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, {
      fallbackMessage: "No se pudo actualizar el estado del usuario.",
      statusMessages: {
        409: "El usuario cambió o no puede dejarse el sistema sin un Superadmin activo.",
      },
    });
  }
}
