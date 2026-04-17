import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await getCurrentUser();

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo obtener la sesión actual.",
      },
      { status: 500 }
    );
  }
}