import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyMfaLogin } from "@/lib/auth/auth-service-client";
import { setAuthCookies } from "@/lib/auth/session";
import { mapAuthRouteError } from "@/lib/auth/route-error";

export const runtime = "nodejs";
const schema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().trim().min(6).max(32),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const result = await verifyMfaLogin(body, request.headers);
    await setAuthCookies({
      accessToken: result.session.token,
      accessExpiresAt: new Date(result.session.expiresAt),
      refreshToken: result.refreshToken,
      refreshExpiresAt: new Date(result.refreshTokenExpiresAt),
    });
    return NextResponse.json({
      ok: true,
      data: {
        status: result.status,
        user: result.user,
        session: {
          sessionId: result.session.sessionId,
          expiresAt: result.session.expiresAt,
          absoluteExpiresAt: result.session.absoluteExpiresAt,
        },
      },
    });
  } catch (error) {
    const mapped = mapAuthRouteError(error, "No se pudo verificar el MFA.");
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}
