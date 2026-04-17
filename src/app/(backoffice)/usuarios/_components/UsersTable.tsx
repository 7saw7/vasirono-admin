import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/utils/dates";
import type { UsersListResult } from "@/features/backoffice/users/types";
import { UserStatusBadge } from "./UserStatusBadge";

type UsersTableProps = {
  data: UsersListResult;
};

export function UsersTable({ data }: UsersTableProps) {
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          {
            key: "name",
            title: "Usuario",
            render: (row) => (
              <Link href={`/usuarios/${row.id}`} className="block">
                <p className="font-medium text-neutral-900">{row.name}</p>
                <p className="text-xs text-neutral-500">{row.email}</p>
              </Link>
            ),
          },
          {
            key: "roleName",
            title: "Rol",
          },
          {
            key: "verified",
            title: "Estado",
            render: (row) => <UserStatusBadge verified={row.verified} />,
          },
          {
            key: "reviewsCount",
            title: "Reviews",
          },
          {
            key: "sessionsCount",
            title: "Sesiones",
          },
          {
            key: "createdAt",
            title: "Creado",
            render: (row) => <span>{formatDateTime(row.createdAt)}</span>,
          },
        ]}
        rows={data.items}
        getRowKey={(row) => row.id}
        emptyState={
          <EmptyState
            title="No hay usuarios"
            description="No se encontraron usuarios con los filtros actuales."
          />
        }
      />

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} />
    </div>
  );
}