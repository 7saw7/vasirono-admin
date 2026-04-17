"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function AnalyticsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(
    () => ({
      companyId: searchParams.get("companyId") ?? "",
      branchId: searchParams.get("branchId") ?? "",
      from: searchParams.get("from") ?? "",
      to: searchParams.get("to") ?? "",
    }),
    [searchParams]
  );

  const [companyId, setCompanyId] = useState(initial.companyId);
  const [branchId, setBranchId] = useState(initial.branchId);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of [
      ["companyId", companyId.trim()],
      ["branchId", branchId.trim()],
      ["from", from],
      ["to", to],
    ]) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    router.push(`/analytics?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <Input
          label="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Ej. 10"
        />
        <Input
          label="Branch ID"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          placeholder="Ej. 42"
        />
        <Input
          label="Desde"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          label="Hasta"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <div className="flex items-end">
          <Button type="button" onClick={apply}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}