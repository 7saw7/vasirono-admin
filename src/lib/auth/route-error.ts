import { ZodError } from "zod";

const AUTH_MESSAGES: Record<string, { status: number; message: string }> = {
  INVALID_CREDENTIALS: { status: 401, message: "Correo o contraseña incorrectos." },
  FORBIDDEN: { status: 403, message: "No tienes acceso al panel administrativo." },
  INVALID_PORTAL_ACCESS: { status: 403, message: "Tu cuenta no tiene acceso administrativo." },
  AUTH_PORTAL_MISMATCH: { status: 403, message: "El contexto de sesión no es administrativo." },
  AUTH_PERMISSIONS_MISSING: { status: 403, message: "La sesión no contiene permisos administrativos válidos." },
  MFA_CHALLENGE_INVALID: { status: 400, message: "El desafío MFA ya no es válido." },
  MFA_CHALLENGE_EXPIRED: { status: 410, message: "El desafío MFA venció. Inicia sesión nuevamente." },
  MFA_CODE_INVALID: { status: 401, message: "El código de verificación no es válido." },
  MFA_TOO_MANY_ATTEMPTS: { status: 429, message: "Se agotaron los intentos de verificación. Inicia sesión nuevamente." },
  STEP_UP_REQUIRED: { status: 403, message: "Debes volver a verificar tu identidad." },
  SESSION_EXPIRED: { status: 401, message: "La sesión venció." },
  SESSION_REVOKED: { status: 401, message: "La sesión fue revocada." },
  REFRESH_TOKEN_REUSE_DETECTED: { status: 401, message: "La sesión fue cerrada por seguridad. Inicia sesión nuevamente." },
  REFRESH_TOKEN_MISSING: { status: 401, message: "No existe una sesión renovable." },
};

export function mapAuthRouteError(
  error: unknown,
  fallback = "No se pudo completar la operación.",
): { status: number; message: string; code?: string } {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: error.issues[0]?.message ?? "Datos inválidos.",
      code: "VALIDATION_ERROR",
    };
  }

  const status = (error as { status?: number })?.status;
  const code =
    (error as { code?: string })?.code ||
    (error instanceof Error ? error.message : undefined);
  if (code && AUTH_MESSAGES[code]) {
    return { ...AUTH_MESSAGES[code], code };
  }

  return {
    status: typeof status === "number" && status >= 400 ? status : 500,
    message: fallback,
    code,
  };
}
