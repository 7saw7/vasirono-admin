"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function ReviewFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      validated: searchParams.get("validated") ?? "",
      hidden: searchParams.get("hidden") ?? "",
      companyId: searchParams.get("companyId") ?? "",
      branchId: searchParams.get("branchId") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initial.search);
  const [validated, setValidated] = useState(initial.validated);
  const [hidden, setHidden] = useState(initial.hidden);
  const [companyId, setCompanyId] = useState(initial.companyId);
  const [branchId, setBranchId] = useState(initial.branchId);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of [
      ["search", search.trim()],
      ["validated", validated],
      ["hidden", hidden],
      ["companyId", companyId.trim()],
      ["branchId", branchId.trim()],
    ]) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    params.set("page", "1");
    router.push(`/resenas?${params.toString()}`);
  }

  function clearAll() {
    router.push("/resenas");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        <Input
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Usuario, empresa, sucursal o comentario"
        />

        <Select
          label="Validada"
          value={validated}
          onChange={(e) => setValidated(e.target.value)}
          placeholder="Todas"
          options={[
            { label: "Sí", value: "true" },
            { label: "No", value: "false" },
          ]}
        />

        <Select
          label="Oculta"
          value={hidden}
          onChange={(e) => setHidden(e.target.value)}
          placeholder="Todas"
          options={[
            { label: "Sí", value: "true" },
            { label: "No", value: "false" },
          ]}
        />

        <Input
          label="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Ej. 12"
        />

        <Input
          label="Branch ID"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          placeholder="Ej. 48"
        />

        <div className="flex items-end gap-2">
          <Button type="button" onClick={apply}>
            Aplicar
          </Button>
          <Button type="button" variant="secondary" onClick={clearAll}>
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}