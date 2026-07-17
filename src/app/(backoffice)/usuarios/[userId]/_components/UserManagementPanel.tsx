"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select, type SelectOption } from "@/components/ui/Select";
import type { UserDetail } from "@/features/backoffice/users/types";

type Props = { user: UserDetail; roles: SelectOption[] };
type State = {
  kind: "idle" | "saving" | "success" | "error";
  message?: string;
};

async function patch(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) {
    throw new Error(
      String(
        payload?.error?.message ??
          payload?.error ??
          payload?.message ??
          "No se pudo actualizar el usuario.",
      ),
    );
  }
}

export function UserManagementPanel({ user, roles }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [selectedRoleId, setSelectedRoleId] = useState(user.roleId);

  async function runAction(
    confirmation: string,
    url: string,
    body: unknown,
  ): Promise<boolean> {
    if (!window.confirm(confirmation)) return false;
    setState({ kind: "saving" });
    try {
      await patch(url, body);
      setState({
        kind: "success",
        message: "Usuario actualizado correctamente.",
      });
      router.refresh();
      return true;
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error ? error.message : "No se pudo actualizar.",
      });
      return false;
    }
  }

  async function changeRole(nextRoleId: number) {
    const previousRoleId = selectedRoleId;
    setSelectedRoleId(nextRoleId);
    const updated = await runAction(
      "¿Confirmas el cambio de rol? Esta acción puede modificar el acceso del usuario.",
      `/api/backoffice/users/${user.id}/role`,
      { roleId: nextRoleId },
    );
    if (!updated) setSelectedRoleId(previousRoleId);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.025]">
      <div>
        <h2 className="text-base font-bold text-slate-950 dark:text-white">
          Administración del usuario
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Acciones sensibles protegidas por permisos backend, jerarquía de rol
          y reglas contra auto-desactivación o auto-escalamiento.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <Select
            label="Rol"
            value={selectedRoleId}
            options={roles}
            disabled={state.kind === "saving" || roles.length === 0}
            onChange={(event) => void changeRole(Number(event.target.value))}
          />
          <p className="text-xs text-slate-500">Actual: {user.roleName}</p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-700">Verificación</p>
          <p className="mt-1 text-sm">
            {user.verified ? "Verificado" : "No verificado"}
          </p>
          <Button
            className="mt-3"
            type="button"
            variant="secondary"
            size="sm"
            loading={state.kind === "saving"}
            onClick={() =>
              void runAction(
                user.verified
                  ? "¿Retirar la verificación del usuario?"
                  : "¿Marcar este usuario como verificado?",
                `/api/backoffice/users/${user.id}/verification`,
                { verified: !user.verified },
              )
            }
          >
            {user.verified ? "Retirar verificación" : "Verificar usuario"}
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-700">Estado de acceso</p>
          <p className="mt-1 text-sm">
            {user.isActive ? "Activo" : "Inactivo"}
          </p>
          <Button
            className="mt-3"
            type="button"
            variant={user.isActive ? "danger" : "primary"}
            size="sm"
            loading={state.kind === "saving"}
            onClick={() =>
              void runAction(
                user.isActive
                  ? "¿Desactivar este usuario? Sus sesiones dejarán de ser válidas."
                  : "¿Activar nuevamente este usuario?",
                `/api/backoffice/users/${user.id}/active`,
                { active: !user.isActive },
              )
            }
          >
            {user.isActive ? "Desactivar" : "Activar"}
          </Button>
        </div>
      </div>

      {state.message ? (
        <p
          className={`mt-3 text-xs ${
            state.kind === "error" ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
