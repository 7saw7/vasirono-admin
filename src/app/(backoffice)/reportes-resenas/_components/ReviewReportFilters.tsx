"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function ReviewReportFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      companyId: searchParams.get("companyId") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initial.search);
  const [status, setStatus] = useState(initial.status);
  const [companyId, setCompanyId] = useState(initial.companyId);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of [
      ["search", search.trim()],
      ["status", status],
      ["companyId", companyId.trim()],
    ]) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    params.set("page", "1");
    router.push(`/reportes-resenas?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Empresa, usuario, razón o detalle"
        />

        <Select
          label="Estado"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Todos"
          options={[
            { label: "Resolved", value: "resolved" },
            { label: "Hidden", value: "hidden" },
          ]}
        />

        <Input
          label="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Ej. 4"
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