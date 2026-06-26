import {
  companyDetailSchema,
  companyListFiltersSchema,
  companyListResultSchema,
} from "./schema";
import type { CompanyListFilters } from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function unwrapData(raw: unknown): unknown {
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: unknown }).data;
  }

  return raw;
}

export async function getCompaniesList(input: CompanyListFilters) {
  const filters = companyListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    "/api/backoffice/companies",
    {
      query: {
        search: filters.search,
        verificationStatusCode: filters.verificationStatus,
        subscriptionStatusCode: filters.subscriptionStatus,
        page: filters.page,
        pageSize: filters.pageSize,
      },
    }
  );

  return companyListResultSchema.parse(unwrapData(raw));
}

export async function getCompanyDetail(companyId: number) {
  const raw = await callBackofficeService<unknown>(
    "companies",
    `/api/backoffice/companies/${companyId}`
  );

  if (!raw) return null;
  return companyDetailSchema.parse(unwrapData(raw));
}
