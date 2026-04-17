"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      roleId: searchParams.get("roleId") ?? "",
      verified: searchParams.get("verified") ?? "",
    }),
    [searchParams]
  );

  const [search, setSearch] = useState(initial.search);
  const [roleId, setRoleId] = useState(initial.roleId);
  const [verified, setVerified] = useState(initial.verified);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of [
      ["search", search.trim()],
      ["roleId", roleId],
      ["verified", verified],
    ]) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    params.set("page", "1");
    router.push(`/usuarios?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <Input
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nombre, email o teléfono"
        />

        <Input
          label="Role ID"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          placeholder="Ej. 1"
        />

        <Select
          label="Verificado"
          value={verified}
          onChange={(e) => setVerified(e.target.value)}
          placeholder="Todos"
          options={[
            { label: "Sí", value: "true" },
            { label: "No", value: "false" },
          ]}
        />

        <div className="flex items-end">
          <Button type="button" onClick={apply}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}