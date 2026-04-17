import { PaymentsView } from "./_components/PaymentsView";
import { getPaymentsDashboard } from "@/features/backoffice/billing/payments.service";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";

type PaymentsPageProps = {
  searchParams?: Promise<{
    search?: string;
    statusId?: string;
    paymentMethodId?: string;
    companyId?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: PaymentsPageProps) {
  await getBackofficeContext("payments.read");

  const params = (await searchParams) ?? {};

  const data = await getPaymentsDashboard({
    search: params.search,
    statusId: params.statusId,
    paymentMethodId: params.paymentMethodId,
    companyId: params.companyId,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <PaymentsView data={data} />;
}