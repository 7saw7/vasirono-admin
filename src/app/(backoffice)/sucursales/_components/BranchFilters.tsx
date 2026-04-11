"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function BranchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      companyId: searchParams.get("companyId") ?? "",
      districtId: searchParams.get("districtId") ?? "",
      isActive: searchParams.get("isActive") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initialState.search);
  const [companyId, setCompanyId] = useState(initialState.companyId);
  const [districtId, setDistrictId] = useState(initialState.districtId);
  const [isActive, setIsActive] = useState(initialState.isActive);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (companyId.trim()) params.set("companyId", companyId.trim());
    else params.delete("companyId");

    if (districtId.trim()) params.set("districtId", districtId.trim());
    else params.delete("districtId");

    if (isActive) params.set("isActive", isActive);
    else params.delete("isActive");

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/sucursales?${query}` : "/sucursales");
  }

  function clearFilters() {
    setSearch("");
    setCompanyId("");
    setDistrictId("");
    setIsActive("");
    router.push("/sucursales");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <Input
          label="Buscar sucursal"
          placeholder="Sucursal, empresa, dirección, correo o teléfono"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Input
          label="Company ID"
          placeholder="Ej. 12"
          value={companyId}
          onChange={(event) => setCompanyId(event.target.value)}
        />

        <Input
          label="District ID"
          placeholder="Ej. 7"
          value={districtId}
          onChange={(event) => setDistrictId(event.target.value)}
        />

        <Select
          label="Estado"
          value={isActive}
          onChange={(event) => setIsActive(event.target.value)}
          placeholder="Todos"
          options={[
            { label: "Activa", value: "true" },
            { label: "Inactiva", value: "false" },
          ]}
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