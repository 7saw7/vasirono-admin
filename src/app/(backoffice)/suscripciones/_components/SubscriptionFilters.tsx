"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { SubscriptionsMeta } from "@/features/backoffice/billing/types";

type SubscriptionFiltersProps = {
  meta: SubscriptionsMeta;
};

export function SubscriptionFilters({ meta }: SubscriptionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      statusId: searchParams.get("statusId") ?? "",
      planId: searchParams.get("planId") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initialState.search);
  const [statusId, setStatusId] = useState(initialState.statusId);
  const [planId, setPlanId] = useState(initialState.planId);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (statusId) params.set("statusId", statusId);
    else params.delete("statusId");

    if (planId) params.set("planId", planId);
    else params.delete("planId");

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/suscripciones?${query}` : "/suscripciones");
  }

  function clearFilters() {
    setSearch("");
    setStatusId("");
    setPlanId("");
    router.push("/suscripciones");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          label="Buscar"
          placeholder="Empresa o plan"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          label="Estado"
          value={statusId}
          onChange={(event) => setStatusId(event.target.value)}
          options={meta.statuses}
          placeholder="Todos"
        />

        <Select
          label="Plan"
          value={planId}
          onChange={(event) => setPlanId(event.target.value)}
          options={meta.plans}
          placeholder="Todos"
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