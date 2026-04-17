import { UserFilters } from "./UserFilters";
import { UsersTable } from "./UsersTable";
import type { UsersListResult } from "@/features/backoffice/users/types";

type UsersViewProps = {
  data: UsersListResult;
};

export function UsersView({ data }: UsersViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Backoffice</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Usuarios
        </h1>
      </div>

      <UserFilters />
      <UsersTable data={data} />
    </div>
  );
}