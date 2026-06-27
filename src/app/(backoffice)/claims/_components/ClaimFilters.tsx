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
          label="Buscar reclamo"
          placeholder="Empresa, local, solicitante, correo, teléfono o canal"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          label="Estado"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          placeholder="Todos"
          options={[
            { label: "Solicitud recibida", value: "received" },
            { label: "Revisión de canal público", value: "pending_public_contact_review" },
            { label: "Código pendiente", value: "otp_pending" },
            { label: "Canal oficial validado", value: "official_channel_verified" },
            { label: "Visita requerida", value: "visit_required" },
            { label: "Visita programada", value: "visit_scheduled" },
            { label: "Visita aprobada", value: "onsite_review_passed" },
            { label: "Acceso básico aprobado", value: "approved_basic_access" },
            { label: "Requiere evidencia", value: "needs_more_evidence" },
            { label: "Rechazado", value: "rejected" },
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