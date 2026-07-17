import { requireBackofficePage } from "@/lib/auth/page-guard";
import { notFound } from "next/navigation";
import { UserDetailView } from "./_components/UserDetailView";
import { getUserDetail } from "@/features/backoffice/users/service";
import { getSettingsDashboard } from "@/features/backoffice/settings/service";

type Props = { params: Promise<{ userId: string }> };
export const dynamic = "force-dynamic";

const ADMIN_ASSIGNABLE_ROLES = new Set([
  "super_admin", "admin", "moderator", "analyst", "support",
  "business_owner", "company_owner", "company_manager",
  "business_manager", "business_admin", "user",
]);

function normalizeRole(value: string) {
  return value.trim().toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
}

export default async function UserDetailPage({ params }: Props) {
  const context = await requireBackofficePage("users.read");
  const { userId } = await params;
  const canManage = context.hasPermission("users.manage");
  const [data, settings] = await Promise.all([
    getUserDetail(userId),
    canManage ? getSettingsDashboard({ page: 1, pageSize: 100 }) : Promise.resolve(null),
  ]);
  if (!data) notFound();

  const actorRole = normalizeRole(String(context.user.role));
  const roles = (settings?.roles.items ?? [])
    .filter((item) => {
      const role = normalizeRole(item.name);
      if (!ADMIN_ASSIGNABLE_ROLES.has(role)) return false;
      return actorRole === "super_admin" || role !== "super_admin";
    })
    .map((item) => ({ value: item.id, label: item.name }));

  return <UserDetailView data={data} canManage={canManage} roles={roles} />;
}
