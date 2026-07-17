"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const statusOptions = [
  { label: "Todos", value: "" },
  { label: "Borrador", value: "draft" },
  { label: "Pendiente de revisión", value: "pending_review" },
  { label: "Aprobada", value: "approved" },
  { label: "Pausada", value: "paused" },
  { label: "Rechazada", value: "rejected" },
  { label: "Vencida", value: "expired" },
];

const activeOptions = [
  { label: "Cualquier disponibilidad", value: "" },
  { label: "Públicamente disponible", value: "true" },
  { label: "No disponible", value: "false" },
];

export function PromotionsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = useMemo(() => ({
    search: searchParams.get("search") ?? "",
    companyId: searchParams.get("companyId") ?? "",
    status: searchParams.get("status") ?? "",
    active: searchParams.get("active") ?? "",
  }), [searchParams]);

  const [search, setSearch] = useState(initial.search);
  const [companyId, setCompanyId] = useState(initial.companyId);
  const [status, setStatus] = useState(initial.status);
  const [active, setActive] = useState(initial.active);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    const values: Record<string, string> = {
      search: search.trim(),
      companyId: companyId.trim(),
      status,
      active,
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.set("page", "1");
    router.push(params.toString() ? `/promociones?${params}` : "/promociones");
  }

  function clearFilters() {
    setSearch("");
    setCompanyId("");
    setStatus("");
    setActive("");
    router.push("/promociones");
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/[0.075] dark:bg-[#101620]">
      <div className="grid gap-4 xl:grid-cols-[2fr_0.8fr_1fr_1fr_auto]">
        <Input label="Buscar" placeholder="Título, empresa o sucursal" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Input label="ID empresa" type="number" min="1" placeholder="Ej. 120" value={companyId} onChange={(event) => setCompanyId(event.target.value)} />
        <Select label="Estado" value={status} onChange={(event) => setStatus(event.target.value)} options={statusOptions} />
        <Select label="Disponibilidad" value={active} onChange={(event) => setActive(event.target.value)} options={activeOptions} />
        <div className="flex items-end gap-2">
          <Button type="button" onClick={applyFilters}>Aplicar</Button>
          <Button type="button" variant="secondary" onClick={clearFilters}>Limpiar</Button>
        </div>
      </div>
    </div>
  );
}
