import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  listBackofficeSessions,
  revokeAllBackofficeSessions,
  revokeBackofficeSession,
  revokeOtherBackofficeSessions,
} from "@/lib/auth/auth-service-client";
import {
  clearAuthCookies,
  getCurrentSessionUser,
  getRawSessionTokenFromCookie,
} from "@/lib/auth/session";
import { mapAuthRouteError } from "@/lib/auth/route-error";

export const runtime = "nodejs";
const deleteSchema = z.object({ sessionId: z.number().int().positive() });
const actionSchema = z.object({
  action: z.enum(["revoke-others", "revoke-all"]),
});

async function requireToken(): Promise<string> {
  const token = await getRawSessionTokenFromCookie();
  if (!token) {
    const error = new Error("SESSION_EXPIRED");
    Object.assign(error, { status: 401, code: "SESSION_EXPIRED" });
    throw error;
  }
  return token;
}

export async function GET() {
  try {
    const data = await listBackofficeSessions(await requireToken());
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const mapped = mapAuthRouteError(error, "No se pudieron cargar las sesiones.");
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = deleteSchema.parse(await request.json());
    const current = await getCurrentSessionUser();
    const data = await revokeBackofficeSession(await requireToken(), body.sessionId);
    if (current.sessionId === body.sessionId) await clearAuthCookies();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const mapped = mapAuthRouteError(error, "No se pudo revocar la sesión.");
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = actionSchema.parse(await request.json());
    const token = await requireToken();
    const data =
      body.action === "revoke-all"
        ? await revokeAllBackofficeSessions(token)
        : await revokeOtherBackofficeSessions(token);
    if (body.action === "revoke-all") await clearAuthCookies();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const mapped = mapAuthRouteError(error, "No se pudieron revocar las sesiones.");
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}
