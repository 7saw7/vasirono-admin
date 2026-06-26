import { NextRequest } from "next/server";
import { proxyBackofficeAnalytics } from "@/features/backoffice/analytics/api-proxy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return proxyBackofficeAnalytics(
    request,
    "/api/analytics/backoffice/analytics/funnel",
    "No se pudo obtener analytics."
  );
}
