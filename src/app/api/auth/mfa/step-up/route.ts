import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stepUpBackofficeSession } from "@/lib/auth/auth-service-client";
import { getRawSessionTokenFromCookie } from "@/lib/auth/session";
import { mapAuthRouteError } from "@/lib/auth/route-error";

export const runtime = "nodejs";
const schema = z.object({ code: z.string().trim().min(6).max(32) });

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const token = await getRawSessionTokenFromCookie();
    if (!token) {
      const error = new Error("SESSION_EXPIRED");
      Object.assign(error, { status: 401, code: "SESSION_EXPIRED" });
      throw error;
    }
    const data = await stepUpBackofficeSession(token, body.code, request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const mapped = mapAuthRouteError(error, "No se pudo verificar nuevamente tu identidad.");
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}
