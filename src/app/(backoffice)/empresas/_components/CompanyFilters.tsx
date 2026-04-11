"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function CompanyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      verificationStatus: searchParams.get("verificationStatus") ?? "",
      subscriptionStatus: searchParams.get("subscriptionStatus") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initialState.search);
  const [verificationStatus, setVerificationStatus] = useState(
    initialState.verificationStatus
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    initialState.subscriptionStatus
  );

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (verificationStatus) params.set("verificationStatus", verificationStatus);
    else params.delete("verificationStatus");

    if (subscriptionStatus) params.set("subscriptionStatus", subscriptionStatus);
    else params.delete("subscriptionStatus");

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/empresas?${query}` : "/empresas");
  }

  function clearFilters() {
    setSearch("");
    setVerificationStatus("");
    setSubscriptionStatus("");
    router.push("/empresas");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          label="Buscar empresa"
          placeholder="Nombre, correo, teléfono o web"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          label="Verificación"
          value={verificationStatus}
          onChange={(event) => setVerificationStatus(event.target.value)}
          options={[
            { label: "Pendiente", value: "pending" },
            { label: "En revisión", value: "in_review" },
            { label: "Aprobada", value: "approved" },
            { label: "Rechazada", value: "rejected" },
          ]}
          placeholder="Todos"
        />

        <Select
          label="Suscripción"
          value={subscriptionStatus}
          onChange={(event) => setSubscriptionStatus(event.target.value)}
          options={[
            { label: "Activa", value: "active" },
            { label: "Pendiente", value: "pending" },
            { label: "Cancelada", value: "cancelled" },
            { label: "Expirada", value: "expired" },
          ]}
          placeholder="Todas"
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