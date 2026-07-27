import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import {
  CLAIM_WORKFLOW_COMMANDS,
  executeClaimWorkflowCommand,
  type ClaimWorkflowCommand,
} from "@/features/backoffice/claims/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ claimRequestId: string; command: string }>;
};

function isWorkflowCommand(value: string): value is ClaimWorkflowCommand {
  return CLAIM_WORKFLOW_COMMANDS.some((command) => command === value);
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("claims.review");
    const params = await context.params;
    const claimRequestId = Number(params.claimRequestId);

    if (!Number.isInteger(claimRequestId) || claimRequestId <= 0) {
      return NextResponse.json(
        { ok: false, error: "El identificador del claim no es v?lido." },
        { status: 400 },
      );
    }
    if (!isWorkflowCommand(params.command)) {
      return NextResponse.json(
        { ok: false, error: "El comando solicitado no existe." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const data = await executeClaimWorkflowCommand(
      claimRequestId,
      params.command,
      body,
    );
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(
      error,
      "No se pudo ejecutar el comando del claim.",
    );
  }
}
