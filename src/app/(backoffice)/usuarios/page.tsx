import { UsersView } from "./_components/UsersView";
import { getUsersList } from "@/features/backoffice/users/service";

type UsersPageProps = {
  searchParams?: Promise<{
    search?: string;
    roleId?: string;
    verified?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = (await searchParams) ?? {};

  const data = await getUsersList({
    search: params.search,
    roleId: params.roleId,
    verified: params.verified,
    page: params.page,
    pageSize: params.pageSize,
  });

  return <UsersView data={data} />;
}