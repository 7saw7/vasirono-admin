import { notFound } from "next/navigation";
import { UserDetailView } from "./_components/UserDetailView";
import { getUserDetail } from "@/features/backoffice/users/service";

type UserDetailPageProps = {
  params: Promise<{ userId: string }>;
};

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: UserDetailPageProps) {
  const { userId } = await params;
  const data = await getUserDetail(userId);

  if (!data) notFound();

  return <UserDetailView data={data} />;
}