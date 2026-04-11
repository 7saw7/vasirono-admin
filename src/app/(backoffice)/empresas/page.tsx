import { CompaniesView } from "./_components/CompaniesView";
import { getCompaniesList } from "@/features/backoffice/companies/service";

type CompaniesPageProps = {
  searchParams?: Promise<{
    search?: string;
    verificationStatus?: string;
    subscriptionStatus?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const params = (await searchParams) ?? {};

  const data = await getCompaniesList({
    search: params.search,
    verificationStatus: params.verificationStatus,
    subscriptionStatus: params.subscriptionStatus,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <CompaniesView data={data} />;
}