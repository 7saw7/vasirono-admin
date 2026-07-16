import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { verificationRequestIdParamSchema } from "@/features/backoffice/verifications/schema";
import { decideVerificationRequest } from "@/features/backoffice/verifications/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

function getStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : 500;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getBackofficeContext("verifications.decide");
    const params = verificationRequestIdParamSchema.parse(await context.params);
    const body = await request.json();

    const data = await decideVerificationRequest(
      params.requestId,
      session.user.id,
      body
    );

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(error, "No se pudo completar la operación de backoffice (verifications requestId decision).");
  }
}