"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { NotificationsMeta } from "@/features/backoffice/notifications/types";

type NotificationsFiltersProps = {
  meta: NotificationsMeta;
};

const readOptions = [
  { label: "Todas", value: "" },
  { label: "Leídas", value: "true" },
  { label: "No leídas", value: "false" },
];

export function NotificationsFilters({
  meta,
}: NotificationsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      typeId: searchParams.get("typeId") ?? "",
      read: searchParams.get("read") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initialState.search);
  const [typeId, setTypeId] = useState(initialState.typeId);
  const [read, setRead] = useState(initialState.read);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (typeId) params.set("typeId", typeId);
    else params.delete("typeId");

    if (read) params.set("read", read);
    else params.delete("read");

    params.set("page", "1");

    const query = params.toString();
    router.push(query ? `/notificaciones?${query}` : "/notificaciones");
  }

  function clearFilters() {
    setSearch("");
    setTypeId("");
    setRead("");
    router.push("/notificaciones");
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          label="Buscar"
          placeholder="Título, mensaje, usuario o correo"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Select
          label="Tipo"
          value={typeId}
          onChange={(event) => setTypeId(event.target.value)}
          options={meta.types}
          placeholder="Todos"
        />

        <Select
          label="Estado"
          value={read}
          onChange={(event) => setRead(event.target.value)}
          options={readOptions}
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