import { NextRequest, NextResponse } from "next/server";
import { refreshCurrentSession } from "@/lib/auth/session";
import { mapAuthRouteError } from "@/lib/auth/route-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const data = await refreshCurrentSession(request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const mapped = mapAuthRouteError(error, "No se pudo renovar la sesión.");
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}
