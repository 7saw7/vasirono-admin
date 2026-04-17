import { SettingsView } from "./_components/SettingsView";
import { getBackofficeContext } from "@/lib/auth/backoffice-context";
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
  await getBackofficeContext("settings.read");

  const params = (await searchParams) ?? {};

  const data = await getSettingsDashboard({
    search: params.search,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <SettingsView data={data} />;
}