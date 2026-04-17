"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const activeOptions = [
  { label: "Todos", value: "" },
  { label: "Activos", value: "true" },
  { label: "Inactivos", value: "false" },
];

export function TaxonomiesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      active: searchParams.get("active") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initialState.search);
  const [active, setActive] = useState(initialState.active);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (active) params.set("active", active);
    else params.delete("active");

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/taxonomias?${query}` : "/taxonomias");
  }

  function clearFilters() {
    setSearch("");
    setActive("");
    router.push("/taxonomias");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_auto]">
        <Input
          label="Buscar"
          placeholder="Nombre, código o descripción"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          label="Estado servicio"
          value={active}
          onChange={(event) => setActive(event.target.value)}
          options={activeOptions}
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