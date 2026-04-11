import { companyDetailSchema } from "./schema";
import { mapCompanyDetailRow } from "./mapper";
import { getCompanyDetailQuery } from "@/lib/db/queries/backoffice/companies";

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