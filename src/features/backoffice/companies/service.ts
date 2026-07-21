import {
  companyDetailSchema,
  companyListFiltersSchema,
  companyListResultSchema,
  companyUpdateProfileSchema,
  companyUpdateStatusSchema,
  companyUpdateTaxonomySchema,
} from "./schema";
import type {
  CompanyListFilters,
  CompanyUpdateProfileInput,
  CompanyUpdateTaxonomyInput,
} from "./types";
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
    },
  );

  return companyListResultSchema.parse(unwrapData(raw));
}

export async function getCompanyDetail(companyId: number) {
  const raw = await callBackofficeService<unknown>(
    "companies",
    `/api/backoffice/companies/${companyId}`,
  );

  if (!raw) return null;
  return companyDetailSchema.parse(unwrapData(raw));
}

export async function updateCompanyProfile(
  companyId: number,
  input: CompanyUpdateProfileInput,
) {
  const payload = companyUpdateProfileSchema.parse(input);
  await callBackofficeService<unknown>(
    "companies",
    `/api/backoffice/companies/${companyId}/profile`,
    { method: "PATCH", body: payload },
  );
  return getCompanyDetail(companyId);
}

export async function updateCompanyTaxonomy(
  companyId: number,
  input: CompanyUpdateTaxonomyInput,
) {
  const payload = companyUpdateTaxonomySchema.parse(input);
  const raw = await callBackofficeService<unknown>(
    "companies",
    `/api/backoffice/companies/${companyId}/taxonomy`,
    { method: "PATCH", body: payload },
  );
  return companyDetailSchema.parse(unwrapData(raw));
}

export async function updateCompanyStatus(
  companyId: number,
  isActive: boolean,
) {
  const payload = companyUpdateStatusSchema.parse({ isActive });
  await callBackofficeService<unknown>(
    "companies",
    `/api/backoffice/companies/${companyId}/status`,
    { method: "PATCH", body: payload },
  );
  return getCompanyDetail(companyId);
}
