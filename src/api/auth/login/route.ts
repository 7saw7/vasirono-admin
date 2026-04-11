import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { loginWithCredentials } from "@/features/auth/service";

export const runtime = "nodejs";

function getStatusAndMessage(error: unknown) {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  if (error instanceof Error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return {
        status: 401,
        message: "Correo o contraseña incorrectos.",
      };
    }

    if (error.message === "FORBIDDEN") {
      return {
        status: 403,
        message: "Tu usuario no tiene acceso al backoffice.",
      };
    }
  }

  return {
    status: 500,
    message: "No se pudo iniciar sesión.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await loginWithCredentials(body);

    return NextResponse.json(
      {
        ok: true,
        data: {
          user: result.user,
          session: {
            sessionId: result.session.sessionId,
            expiresAt: result.session.expiresAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const mapped = getStatusAndMessage(error);

    return NextResponse.json(
      {
        ok: false,
        error: mapped.message,
      },
      { status: mapped.status }
    );
  }
}