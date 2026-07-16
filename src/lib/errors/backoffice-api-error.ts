import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthGuardError } from "@/lib/auth/guards";
import { BackofficeAccessError } from "@/lib/auth/backoffice-context";
import { BackofficeServiceError } from "@/lib/microservices/backoffice-client";

export type BackofficeApiErrorOptions = {
  fallbackMessage: string;
  statusMessages?: Partial<Record<number, string>>;
};

type ErrorLike = {
  status?: unknown;
  code?: unknown;
  message?: unknown;
  name?: unknown;
};

function asErrorLike(error: unknown): ErrorLike {
  return error && typeof error === "object" ? (error as ErrorLike) : {};
}

function inferStatus(error: unknown): number {
  if (error instanceof ZodError) return 422;
  if (error instanceof AuthGuardError) return error.status;
  if (error instanceof BackofficeAccessError) return error.status;
  if (error instanceof BackofficeServiceError) return error.status;

  const candidate = asErrorLike(error).status;
  if (typeof candidate === "number" && candidate >= 400 && candidate <= 599) {
    return candidate;
  }

  const message = getRawMessage(error).toUpperCase();
  if (message.includes("NOT_FOUND")) return 404;
  if (message.includes("CONFLICT") || message.includes("ALREADY_")) return 409;
  if (message.includes("VALIDATION") || message.includes("INVALID_")) return 422;
  if (message.includes("UNAUTHORIZED")) return 401;
  if (message.includes("FORBIDDEN") || message.includes("PERMISSION")) return 403;

  if (asErrorLike(error).name === "AbortError") return 504;

  return 500;
}

function getRawMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  const candidate = asErrorLike(error).message;
  return typeof candidate === "string" ? candidate : "";
}

function getCode(error: unknown, status: number): string {
  if (error instanceof BackofficeServiceError) return error.code;
  if (error instanceof BackofficeAccessError) return error.code;

  const candidate = asErrorLike(error).code;
  if (typeof candidate === "string" && candidate.trim()) return candidate;

  if (error instanceof ZodError) return "BACKOFFICE_VALIDATION_ERROR";

  return `BACKOFFICE_HTTP_${status}`;
}

function defaultMessage(status: number, fallback: string): string {
  switch (status) {
    case 400:
      return "La solicitud no es válida.";
    case 401:
      return "Tu sesión no es válida o ha expirado.";
    case 403:
      return "No tienes permisos para completar esta operación.";
    case 404:
      return "El recurso solicitado no existe.";
    case 409:
      return "La operación entra en conflicto con el estado actual del recurso.";
    case 422:
      return "Los datos enviados no superaron la validación.";
    case 429:
      return "Se alcanzó el límite de solicitudes. Inténtalo nuevamente más tarde.";
    case 502:
    case 503:
      return "El servicio asociado no está disponible temporalmente.";
    case 504:
      return "El servicio asociado tardó demasiado en responder.";
    default:
      return fallback;
  }
}

function resolveMessage(
  error: unknown,
  status: number,
  options: BackofficeApiErrorOptions
): string {
  const override = options.statusMessages?.[status];
  if (override) return override;

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? defaultMessage(status, options.fallbackMessage);
  }

  const raw = getRawMessage(error);

  // Los mensajes funcionales 4xx de los servicios sí son seguros y útiles.
  if (status >= 400 && status < 500 && raw && !raw.startsWith("Forbidden:")) {
    return raw;
  }

  return defaultMessage(status, options.fallbackMessage);
}

export function toBackofficeErrorResponse(
  error: unknown,
  options: BackofficeApiErrorOptions | string
) {
  const normalizedOptions =
    typeof options === "string" ? { fallbackMessage: options } : options;

  const status = inferStatus(error);
  const code = getCode(error, status);
  const message = resolveMessage(error, status, normalizedOptions);

  console.error("backoffice.api.error", {
    status,
    code,
    message,
    originalMessage: getRawMessage(error),
  });

  return NextResponse.json(
    {
      ok: false,
      error: message,
      code,
    },
    { status }
  );
}
