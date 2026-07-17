import { PaymentsView } from "./_components/PaymentsView";
import { getPaymentsDashboard } from "@/features/backoffice/billing/payments.service";
import { getSettingsDashboard } from "@/features/backoffice/settings/service";
import { requireBackofficePage } from "@/lib/auth/page-guard";
type Props={searchParams?:Promise<{search?:string;statusId?:string;paymentMethodId?:string;companyId?:string;page?:string;pageSize?:string}>};
export const dynamic="force-dynamic";
export default async function PaymentsPage({searchParams}:Props){const context=await requireBackofficePage("payments.read");const params=(await searchParams)??{};const [data,settings]=await Promise.all([getPaymentsDashboard(params),getSettingsDashboard({page:1,pageSize:100})]);const statuses=settings.paymentStatuses.items.map(item=>({value:item.id,label:item.name}));return <PaymentsView data={data} canManage={context.hasPermission("payments.manage")} statuses={statuses}/>}
