import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { updateAdminUserVerificationSchema, userIdParamSchema } from "@/features/backoffice/users/schema";
import { updateAdminUserVerification } from "@/features/backoffice/users/service";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("users.manage");
    const params = userIdParamSchema.parse(await context.params);
    const body = updateAdminUserVerificationSchema.parse(await request.json());
    const data = await updateAdminUserVerification(params.userId, body);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo actualizar la verificación del usuario.");
  }
}
