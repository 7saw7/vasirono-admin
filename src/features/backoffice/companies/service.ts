import {
  companyDetailSchema,
  companyListFiltersSchema,
  companyListResultSchema,
} from "./schema";
import { mapCompanyDetailRow, mapCompanyListRow } from "./mapper";
import type { CompanyListFilters } from "./types";
import {
  getCompanyDetailQuery,
  listCompaniesQuery,
} from "@/lib/db/queries/backoffice/companies";

export async function getCompaniesList(input: CompanyListFilters) {
  const filters = companyListFiltersSchema.parse(input);
  const result = await listCompaniesQuery(filters);

  const mapped = {
    items: result.rows.map(mapCompanyListRow),
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  };

  return companyListResultSchema.parse(mapped);
}

export async function getCompanyDetail(companyId: number) {
  const detail = await getCompanyDetailQuery(companyId);

  if (!detail) {
    return null;
  }

  const mapped = mapCompanyDetailRow(detail.company, {
    branches: detail.branches,
    media: detail.media,
    verification: detail.verification,
    subscription: detail.subscription,
    payments: detail.payments,
    claims: detail.claims,
    audit: detail.audit,
  });

  return companyDetailSchema.parse(mapped);
}