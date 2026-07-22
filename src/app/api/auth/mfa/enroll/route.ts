import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMfaEnrollment } from "@/lib/auth/auth-service-client";
import { mapAuthRouteError } from "@/lib/auth/route-error";

export const runtime = "nodejs";
const schema = z.object({ challengeId: z.string().uuid() });

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const data = await getMfaEnrollment(body.challengeId, request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const mapped = mapAuthRouteError(error, "No se pudo preparar el enrolamiento MFA.");
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}
