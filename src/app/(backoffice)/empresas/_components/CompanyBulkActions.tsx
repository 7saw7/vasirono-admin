"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type CompanyBulkActionsProps = {
  selectedCount: number;
};

export function CompanyBulkActions({
  selectedCount,
}: CompanyBulkActionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    try {
      setIsExporting(true);
      alert(
        `Exportación masiva pendiente de implementación. Seleccionadas: ${selectedCount}`
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-neutral-500">
        {selectedCount} seleccionada{selectedCount === 1 ? "" : "s"}
      </p>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={selectedCount === 0 || isExporting}
        loading={isExporting}
        onClick={handleExport}
      >
        Exportar
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={selectedCount === 0}
        onClick={() =>
          alert("Acción masiva pendiente: aprobación o cambio de estado.")
        }
      >
        Acción masiva
      </Button>
    </div>
  );
}