"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function ClaimFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      companyId: searchParams.get("companyId") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initialState.search);
  const [status, setStatus] = useState(initialState.status);
  const [companyId, setCompanyId] = useState(initialState.companyId);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (status) params.set("status", status);
    else params.delete("status");

    if (companyId.trim()) params.set("companyId", companyId.trim());
    else params.delete("companyId");

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/claims?${query}` : "/claims");
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setCompanyId("");
    router.push("/claims");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          label="Buscar claim"
          placeholder="Empresa, solicitante, correo o notas"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          label="Estado"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          placeholder="Todos"
          options={[
            { label: "Pending", value: "pending" },
            { label: "Submitted", value: "submitted" },
            { label: "In review", value: "in_review" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ]}
        />

        <Input
          label="Company ID"
          placeholder="Ej. 25"
          value={companyId}
          onChange={(event) => setCompanyId(event.target.value)}
        />

        <div className="flex items-end gap-2">
          <Button type="button" onClick={applyFilters}>
            Aplicar
          </Button>
          <Button type="button" variant="secondary" onClick={clearFilters}>
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}