import { NextRequest, NextResponse } from "next/server";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getUserDetail } from "@/features/backoffice/users/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getBackofficeContext("users.read");

    const { userId } = await context.params;
    const data = await getUserDetail(userId);

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: data.sessions });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudieron obtener las sesiones." },
      { status: 500 }
    );
  }
}