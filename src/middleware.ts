import { NextRequest, NextResponse } from "next/server";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/;

function configuredOrigins(request: NextRequest): Set<string> {
  const configured = [
    process.env.ADMIN_ALLOWED_ORIGINS,
    process.env.NEXT_PUBLIC_APP_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean)
    .flatMap((value) => {
      try {
        return [new URL(value).origin];
      } catch {
        return [];
      }
    });

  if (configured.length === 0 && process.env.NODE_ENV !== "production") {
    configured.push(request.nextUrl.origin);
  }

  return new Set(configured);
}

function isTrustedUnsafeRequest(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  let normalizedOrigin: string;
  try {
    normalizedOrigin = new URL(origin).origin;
  } catch {
    return false;
  }

  return configuredOrigins(request).has(normalizedOrigin);
}

function contentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");
}

function applySecurityHeaders(
  response: NextResponse,
  requestId: string,
): NextResponse {
  response.headers.set("x-request-id", requestId);
  response.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive, nosnippet",
  );
  response.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Content-Security-Policy", contentSecurityPolicy());
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

export function middleware(request: NextRequest) {
  const incomingRequestId = request.headers.get("x-request-id")?.trim();
  const requestId =
    incomingRequestId && SAFE_REQUEST_ID.test(incomingRequestId)
      ? incomingRequestId
      : crypto.randomUUID();

  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    UNSAFE_METHODS.has(request.method.toUpperCase()) &&
    !isTrustedUnsafeRequest(request)
  ) {
    return applySecurityHeaders(
      NextResponse.json(
        {
          ok: false,
          error: "Solicitud rechazada por política de origen.",
          code: "CSRF_ORIGIN_REJECTED",
          requestId,
        },
        { status: 403 },
      ),
      requestId,
    );
  }

  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-request-id", requestId);

  return applySecurityHeaders(
    NextResponse.next({ request: { headers: forwardedHeaders } }),
    requestId,
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon256.png|robots.txt).*)",
  ],
};
