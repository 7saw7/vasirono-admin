"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function VerificationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      level: searchParams.get("level") ?? "",
      assignedReviewerId: searchParams.get("assignedReviewerId") ?? "",
      companyId: searchParams.get("companyId") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initialState.search);
  const [status, setStatus] = useState(initialState.status);
  const [level, setLevel] = useState(initialState.level);
  const [assignedReviewerId, setAssignedReviewerId] = useState(
    initialState.assignedReviewerId
  );
  const [companyId, setCompanyId] = useState(initialState.companyId);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of [
      ["search", search.trim()],
      ["status", status],
      ["level", level],
      ["assignedReviewerId", assignedReviewerId.trim()],
      ["companyId", companyId.trim()],
    ]) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/verificaciones?${query}` : "/verificaciones");
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setLevel("");
    setAssignedReviewerId("");
    setCompanyId("");
    router.push("/verificaciones");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        <Input
          label="Buscar"
          placeholder="Empresa, requester, reviewer o correo"
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
          label="Nivel"
          placeholder="Ej. basic"
          value={level}
          onChange={(event) => setLevel(event.target.value)}
        />

        <Input
          label="Reviewer ID"
          placeholder="UUID reviewer"
          value={assignedReviewerId}
          onChange={(event) => setAssignedReviewerId(event.target.value)}
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