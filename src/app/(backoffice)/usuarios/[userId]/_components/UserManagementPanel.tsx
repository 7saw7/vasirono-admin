"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepUpModal } from "@/components/auth/StepUpModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { UserDetail } from "@/features/backoffice/users/types";

type Props = {
  user: UserDetail;
  roles: SelectOption[];
  permissions: {
    canChangeRole: boolean;
    canChangeStatus: boolean;
    canVerify: boolean;
  };
};

type State = {
  kind: "idle" | "saving" | "success" | "error";
  message?: string;
};

type PendingAction = {
  confirmation: string;
  url: string;
  body: Record<string, unknown>;
};

class UserMutationError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "UserMutationError";
  }
}

const REASON_OPTIONS: SelectOption[] = [
  { value: "RESPONSIBILITY_CHANGE", label: "Cambio de responsabilidades" },
  { value: "ACCOUNT_STATUS_CHANGE", label: "Cambio de estado de cuenta" },
  { value: "SECURITY_RESPONSE", label: "Respuesta de seguridad" },
  { value: "SUPPORT_RESOLUTION", label: "Resolución de soporte" },
  { value: "DATA_CORRECTION", label: "Corrección de datos" },
];

async function patch(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "PATCH",
    credentials: "same-origin",
    cache: "no-store",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.ok === false) {
    throw new UserMutationError(
      String(
        payload?.error?.message ??
          payload?.error ??
          payload?.message ??
          "No se pudo actualizar el usuario.",
      ),
      response.status,
      String(payload?.code ?? "USER_MUTATION_FAILED"),
    );
  }

  return payload?.data;
}

export function UserManagementPanel({ user, roles, permissions }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [selectedRoleId, setSelectedRoleId] = useState(user.roleId);
  const [reasonCode, setReasonCode] = useState("RESPONSIBILITY_CHANGE");
  const [reason, setReason] = useState("");
  const [supportReference, setSupportReference] = useState("");
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const reasonValid = reason.trim().length >= 10;
  const saving = state.kind === "saving";

  useEffect(() => {
    setSelectedRoleId(user.roleId);
  }, [user.roleId, user.version]);

  function commandMetadata() {
    return {
      expectedVersion: user.version,
      reasonCode,
      reason: reason.trim(),
      ...(supportReference.trim()
        ? { supportReference: supportReference.trim() }
        : {}),
      idempotencyKey: globalThis.crypto.randomUUID(),
    };
  }

  async function executeAction(
    action: PendingAction,
    options: { skipConfirmation?: boolean } = {},
  ): Promise<boolean> {
    if (!reasonValid) {
      setState({
        kind: "error",
        message: "Escribe un motivo de al menos 10 caracteres.",
      });
      return false;
    }

    if (!options.skipConfirmation && !window.confirm(action.confirmation)) {
      return false;
    }

    setState({ kind: "saving" });
    try {
      await patch(action.url, action.body);
      setPendingAction(null);
      setState({
        kind: "success",
        message: "Usuario actualizado. Sus controles de acceso se están sincronizando.",
      });
      router.refresh();
      return true;
    } catch (error) {
      if (error instanceof UserMutationError && error.code === "STEP_UP_REQUIRED") {
        setPendingAction(action);
        setStepUpOpen(true);
        setState({
          kind: "idle",
          message: "Confirma nuevamente tu identidad para continuar.",
        });
        return false;
      }

      if (
        error instanceof UserMutationError &&
        (error.status === 409 || error.code === "USER_VERSION_CONFLICT")
      ) {
        router.refresh();
      }

      setPendingAction(null);
      setState({
        kind: "error",
        message:
          error instanceof Error ? error.message : "No se pudo actualizar.",
      });
      return false;
    }
  }

  async function changeRole() {
    await executeAction({
      confirmation:
        "¿Confirmas el cambio de rol? Se revocarán las sesiones activas del usuario.",
      url: `/api/backoffice/users/${user.id}/role`,
      body: {
        targetRoleId: selectedRoleId,
        ...commandMetadata(),
      },
    });
  }

  async function changeVerification() {
    await executeAction({
      confirmation: user.verified
        ? "¿Retirar la verificación? Las sesiones activas serán revocadas."
        : "¿Marcar este usuario como verificado?",
      url: `/api/backoffice/users/${user.id}/verification`,
      body: {
        verified: !user.verified,
        ...commandMetadata(),
      },
    });
  }

  async function changeStatus() {
    await executeAction({
      confirmation: user.isActive
        ? "¿Desactivar este usuario? Sus sesiones y refresh tokens serán revocados."
        : "¿Activar nuevamente este usuario?",
      url: `/api/backoffice/users/${user.id}/active`,
      body: {
        active: !user.isActive,
        ...commandMetadata(),
      },
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.025]">
      <div>
        <h2 className="text-base font-bold text-slate-950 dark:text-white">
          Administración privilegiada
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Las operaciones usan control de versión, motivo obligatorio,
          idempotencia, step-up MFA, auditoría y revocación de sesiones.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Select
          label="Motivo normalizado"
          value={reasonCode}
          options={REASON_OPTIONS}
          disabled={saving}
          onChange={(event) => setReasonCode(event.target.value)}
        />
        <Input
          label="Referencia de soporte (opcional)"
          value={supportReference}
          disabled={saving}
          maxLength={100}
          placeholder="SEC-1248"
          onChange={(event) => setSupportReference(event.target.value)}
        />
        <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Versión del registro
          </p>
          <p className="mt-1">{user.version}</p>
          <p className="mt-2">Un cambio concurrente responderá 409.</p>
        </div>
      </div>

      <div className="mt-4">
        <Textarea
          label="Justificación"
          value={reason}
          disabled={saving}
          minLength={10}
          maxLength={500}
          placeholder="Describe por qué se requiere esta operación y quién la autorizó."
          hint="Obligatoria. Mínimo 10 caracteres; se almacenará en auditoría."
          onChange={(event) => setReason(event.target.value)}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {permissions.canChangeRole ? (
          <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <Select
              label="Rol"
              value={selectedRoleId}
              options={roles}
              disabled={saving || roles.length === 0}
              onChange={(event) => setSelectedRoleId(Number(event.target.value))}
            />
            <p className="text-xs text-slate-500">Actual: {user.roleName}</p>
            <Button
              type="button"
              size="sm"
              loading={saving}
              disabled={!reasonValid || selectedRoleId === user.roleId}
              onClick={() => void changeRole()}
            >
              Aplicar rol
            </Button>
          </div>
        ) : null}

        {permissions.canVerify ? (
          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Verificación
            </p>
            <p className="mt-1 text-sm">
              {user.verified ? "Verificado" : "No verificado"}
            </p>
            <Button
              className="mt-3"
              type="button"
              variant="secondary"
              size="sm"
              loading={saving}
              disabled={!reasonValid}
              onClick={() => void changeVerification()}
            >
              {user.verified ? "Retirar verificación" : "Verificar usuario"}
            </Button>
          </div>
        ) : null}

        {permissions.canChangeStatus ? (
          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Estado de acceso
            </p>
            <p className="mt-1 text-sm">
              {user.isActive ? "Activo" : "Inactivo"}
            </p>
            <Button
              className="mt-3"
              type="button"
              variant={user.isActive ? "danger" : "primary"}
              size="sm"
              loading={saving}
              disabled={!reasonValid}
              onClick={() => void changeStatus()}
            >
              {user.isActive ? "Desactivar" : "Activar"}
            </Button>
          </div>
        ) : null}
      </div>

      {state.message ? (
        <p
          className={`mt-4 text-xs ${
            state.kind === "error" ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <StepUpModal
        open={stepUpOpen}
        title="Autoriza el cambio privilegiado"
        description="Ingresa un código TOTP reciente. Después se reintentará exactamente la misma operación con la misma clave de idempotencia."
        onClose={() => {
          setStepUpOpen(false);
          setPendingAction(null);
        }}
        onVerified={async () => {
          const action = pendingAction;
          if (!action) return;
          setStepUpOpen(false);
          await executeAction(action, { skipConfirmation: true });
        }}
      />
    </section>
  );
}
