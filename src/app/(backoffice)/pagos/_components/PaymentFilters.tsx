"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { PaymentsMeta } from "@/features/backoffice/billing/types";

type PaymentFiltersProps = {
  meta: PaymentsMeta;
};

export function PaymentFilters({ meta }: PaymentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      statusId: searchParams.get("statusId") ?? "",
      paymentMethodId: searchParams.get("paymentMethodId") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initialState.search);
  const [statusId, setStatusId] = useState(initialState.statusId);
  const [paymentMethodId, setPaymentMethodId] = useState(
    initialState.paymentMethodId
  );

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (statusId) params.set("statusId", statusId);
    else params.delete("statusId");

    if (paymentMethodId) params.set("paymentMethodId", paymentMethodId);
    else params.delete("paymentMethodId");

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/pagos?${query}` : "/pagos");
  }

  function clearFilters() {
    setSearch("");
    setStatusId("");
    setPaymentMethodId("");
    router.push("/pagos");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          label="Buscar empresa"
          placeholder="Nombre de empresa"
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
          label="Método"
          value={paymentMethodId}
          onChange={(event) => setPaymentMethodId(event.target.value)}
          options={meta.paymentMethods}
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