import type { Metadata } from "next";
import { ConfirmPasswordResetView } from "./ConfirmPasswordResetView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { searchParams?: Promise<{ email?: string }> };

export default async function ConfirmPasswordResetPage({ searchParams }: Props) {
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email : "";
  return <ConfirmPasswordResetView initialEmail={email} />;
}
