import { NextRequest, NextResponse } from "next/server";
import { loginWithCredentials } from "@/features/auth/service";
import { mapAuthRouteError } from "@/lib/auth/route-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const result = await loginWithCredentials(
      await request.json(),
      request.headers,
    );

    if (result.status !== "AUTHENTICATED") {
      return NextResponse.json({ ok: true, data: result }, { status: 200 });
    }

    return NextResponse.json(
      {
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
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[backoffice-login-error]", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
    });
    const mapped = mapAuthRouteError(error, "No se pudo iniciar sesión.");
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}
