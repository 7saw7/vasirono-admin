import {
  companyDetailSchema,
  companyListFiltersSchema,
  companyListResultSchema,
} from "./schema";
import type { CompanyListFilters } from "./types";
import { callBackofficeService } from "@/lib/microservices/backoffice-client";

function unwrapList(raw: any) {
  return raw?.items ? raw : raw?.data?.items ? raw.data : raw;
}

export async function getCompaniesList(input: CompanyListFilters) {
  const filters = companyListFiltersSchema.parse(input);
  const raw = await callBackofficeService<unknown>("companies", "/api/backoffice/companies", {
    query: filters,
  });
  return companyListResultSchema.parse(unwrapList(raw));
}

export async function getCompanyDetail(companyId: number) {
  const raw = await callBackofficeService<unknown>("companies", `/api/backoffice/companies/${companyId}`);
  if (!raw) return null;
  return companyDetailSchema.parse(raw);
}
