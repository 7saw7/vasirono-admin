import { NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { toBackofficeErrorResponse } from "@/lib/errors/backoffice-api-error";
import { createPrivateAssetSignedUrl } from "@/features/backoffice/verifications/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ assetId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    await getBackofficeContext("verifications.documents.review");
    const { assetId } = await context.params;
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(assetId)) {
      return NextResponse.json(
        { ok: false, error: "El assetId no es válido." },
        { status: 400 },
      );
    }

    const data = await createPrivateAssetSignedUrl(assetId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toBackofficeErrorResponse(
      error,
      "No se pudo crear la URL firmada del documento privado.",
    );
  }
}
