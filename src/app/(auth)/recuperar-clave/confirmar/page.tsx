import type { Metadata } from "next";
import { ConfirmPasswordResetView } from "./ConfirmPasswordResetView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { searchParams?: Promise<{ token?: string }> };

export default async function ConfirmPasswordResetPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";
  return <ConfirmPasswordResetView token={token} />;
}
