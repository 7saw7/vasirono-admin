import { NotificationsView } from "./_components/NotificationsView";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
import { getNotificationsDashboard } from "@/features/backoffice/notifications/service";

type NotificationsPageProps = {
  searchParams?: Promise<{
    search?: string;
    typeId?: string;
    read?: string;
    userId?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  await getBackofficeContext("notifications.read");

  const params = (await searchParams) ?? {};

  const data = await getNotificationsDashboard({
    search: params.search,
    typeId: params.typeId,
    read: params.read,
    userId: params.userId,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <NotificationsView data={data} />;
}