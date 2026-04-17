"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function PlansFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = useMemo(
    () => searchParams.get("search") ?? "",
    [searchParams]
  );

  const [search, setSearch] = useState(initialSearch);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/planes?${query}` : "/planes");
  }

  function clearFilters() {
    setSearch("");
    router.push("/planes");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <Input
          label="Buscar plan"
          placeholder="Nombre del plan"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
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