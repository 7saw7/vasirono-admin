import { SettingsView } from "./_components/SettingsView";
import { requireBackofficePage } from "@/lib/auth/page-guard";
import { getSettingsDashboard } from "@/features/backoffice/settings/service";

type SettingsPageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  await requireBackofficePage("settings.read");

  const params = (await searchParams) ?? {};

  const data = await getSettingsDashboard({
    search: params.search,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <SettingsView data={data} />;
}