type CompanyBulkActionsProps = {
  selectedCount: number;
};

/**
 * Las operaciones masivas se mantienen fuera de la UI hasta contar con un
 * contrato transaccional y auditable en Companies Service.
 */
export function CompanyBulkActions({ selectedCount }: CompanyBulkActionsProps) {
  return (
    <p className="text-sm text-neutral-500">
      {selectedCount > 0
        ? `${selectedCount} empresas seleccionadas. Las acciones masivas no están habilitadas.`
        : "La administración se realiza desde el detalle de cada empresa."}
    </p>
  );
}
