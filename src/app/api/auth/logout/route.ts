import { NextResponse } from "next/server";
import { logoutCurrentUser } from "@/features/auth/service";

export const runtime = "nodejs";

export async function POST() {
  try {
    await logoutCurrentUser();

    return NextResponse.json({
      ok: true,
      message: "Sesión cerrada correctamente.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo cerrar la sesión.",
      },
      { status: 500 }
    );
  }
}