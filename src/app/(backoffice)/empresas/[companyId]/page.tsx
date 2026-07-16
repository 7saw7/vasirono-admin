import { requireBackofficePage } from "@/lib/auth/page-guard";
import { notFound } from "next/navigation";
import { CompanyDetailView } from "./_components/CompanyDetailView";
import { getCompanyDetail } from "@/features/backoffice/companies/service";

type CompanyDetailPageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  await requireBackofficePage("companies.read");
  const resolvedParams = await params;
  const companyId = Number(resolvedParams.companyId);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    notFound();
  }

  const data = await getCompanyDetail(companyId);

  if (!data) {
    notFound();
  }

  return <CompanyDetailView data={data} />;
}