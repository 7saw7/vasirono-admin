"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepUpModal } from "@/components/auth/StepUpModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type {
  ClaimDetail,
  ClaimWorkflowState,
} from "@/features/backoffice/claims/types";

type Props = { claim: ClaimDetail };
type Command =
  | "start-channel-verification"
  | "schedule-visit"
  | "complete-visit"
  | "submit-review"
  | "approve"
  | "reject"
  | "request-changes";

type CommandResult = {
  state?: ClaimWorkflowState;
  version?: number;
  challengeId?: string;
  destinationMasked?: string;
  status?: string;
  expiresAt?: string;
};

type PendingCommand = { command: Command; body: Record<string, unknown>; label: string };

const channelOptions = [
  { label: "Tel?fono oficial", value: "phone" },
  { label: "Correo oficial", value: "email" },
];

const evidenceOptions = [
  { label: "Documento", value: "document" },
  { label: "Foto de visita", value: "onsite_photo" },
  { label: "Registro oficial", value: "official_record" },
  { label: "Otra evidencia", value: "other" },
];

const stateLabels: Record<ClaimWorkflowState, string> = {
  submitted: "Enviado",
  identity_pending: "Identidad pendiente",
  channel_pending: "Canal pendiente",
  onsite_scheduled: "Visita programada",
  onsite_completed: "Visita completada",
  review_pending: "Revisi?n pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  changes_required: "Cambios requeridos",
};

export function ClaimWorkflowCommandPanel({ claim }: Props) {
  const router = useRouter();
  const [state, setState] = useState(claim.workflowState);
  const [version, setVersion] = useState(claim.version);
  const [channelType, setChannelType] = useState<"phone" | "email">("phone");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [evidenceType, setEvidenceType] = useState<"document" | "onsite_photo" | "official_record" | "other">("official_record");
  const [evidenceReference, setEvidenceReference] = useState(claim.evidenceUrl ?? "");
  const [sensitiveCase, setSensitiveCase] = useState(false);
  const [challenge, setChallenge] = useState<CommandResult | null>(
    claim.otpChallengeId
      ? {
          challengeId: claim.otpChallengeId,
          destinationMasked: claim.otpDestinationMasked ?? undefined,
          expiresAt: claim.otpExpiresAt ?? undefined,
          status: "sent",
        }
      : null,
  );
  const [pending, setPending] = useState<PendingCommand | null>(null);
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const evidenceRefs = evidenceReference.trim()
    ? [{ type: evidenceType, reference: evidenceReference.trim() }]
    : [];
  const canStart = ["submitted", "identity_pending", "changes_required"].includes(state);
  const canSchedule = ["submitted", "identity_pending", "channel_pending", "changes_required"].includes(state);

  async function execute(command: Command, body: Record<string, unknown>, label: string, afterStepUp = false) {
    setSubmitting(label);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `/api/backoffice/claims/${claim.claimRequestId}/commands/${command}`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        data?: CommandResult;
        error?: string;
      };
      if (response.status === 403 && !afterStepUp) {
        setPending({ command, body, label });
        setStepUpOpen(true);
        return;
      }
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || "No se pudo ejecutar el comando.");
      }
      const result = payload.data ?? {};
      if (result.state) setState(result.state);
      if (result.version) setVersion(result.version);
      if (result.challengeId) setChallenge(result);
      setSuccess("Comando ejecutado correctamente.");
      setPending(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo ejecutar el comando.");
    } finally {
      setSubmitting(null);
    }
  }

  async function retryAfterStepUp() {
    if (!pending) return;
    await execute(pending.command, pending.body, pending.label, true);
  }

  function decision(command: "approve" | "reject" | "request-changes") {
    void execute(
      command,
      { expectedVersion: version, reason: notes.trim(), evidenceRefs },
      command,
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-neutral-950">M?quina de estados del claim</p>
          <p className="mt-1 text-sm text-neutral-500">
            Solo se env?an comandos expl?citos. El contacto oficial lo resuelve Branch Service.
          </p>
        </div>
        <div className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
          {stateLabels[state]} ? versi?n {version}
        </div>
      </div>

      {claim.sensitiveCase ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Caso sensible: la decisi?n final debe realizarla un segundo administrador distinto.
        </div>
      ) : null}
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div> : null}

      {challenge ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Desaf?o de canal</p>
          <p className="mt-1">Destino: {challenge.destinationMasked ?? "enmascarado"}</p>
          <p>Estado: {challenge.status ?? "sent"}</p>
          <p>Vence: {challenge.expiresAt ? new Date(challenge.expiresAt).toLocaleString() : "?"}</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-neutral-100 p-4">
          <p className="text-sm font-semibold text-neutral-900">Verificaci?n del canal oficial</p>
          <p className="text-sm text-neutral-500">
            El navegador indica la sucursal y el tipo; nunca el tel?fono o correo de destino.
          </p>
          <Select
            label="Canal"
            value={channelType}
            onChange={(event) => setChannelType(event.target.value as "phone" | "email")}
            options={channelOptions}
          />
          <Button
            type="button"
            disabled={!canStart || !claim.branchId}
            loading={submitting === "start-channel"}
            onClick={() => {
              if (!claim.branchId) return;
              void execute(
                "start-channel-verification",
                { expectedVersion: version, branchId: claim.branchId, channelType },
                "start-channel",
              );
            }}
          >
            Solicitar desaf?o OTP
          </Button>
          {!claim.branchId ? <p className="text-sm text-red-600">El claim no tiene una sucursal asociada.</p> : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-neutral-100 p-4">
          <p className="text-sm font-semibold text-neutral-900">Visita presencial</p>
          <Input
            label="Fecha y hora"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={!canSchedule || !scheduledAt || notes.trim().length < 10}
            loading={submitting === "schedule-visit"}
            onClick={() => void execute(
              "schedule-visit",
              {
                expectedVersion: version,
                scheduledAt: new Date(scheduledAt).toISOString(),
                notes: notes.trim(),
              },
              "schedule-visit",
            )}
          >
            Programar visita
          </Button>
          {state === "onsite_scheduled" ? (
            <Button
              type="button"
              disabled={notes.trim().length < 10 || evidenceRefs.length === 0}
              loading={submitting === "complete-visit"}
              onClick={() => void execute(
                "complete-visit",
                { expectedVersion: version, notes: notes.trim(), evidenceRefs },
                "complete-visit",
              )}
            >
              Completar visita con evidencia
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-neutral-100 p-4">
        <Textarea
          label="Fundamento de la transici?n"
          placeholder="Describe la revisi?n y la evidencia utilizada (m?nimo 10 caracteres)."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Tipo de evidencia"
            value={evidenceType}
            onChange={(event) => setEvidenceType(event.target.value as typeof evidenceType)}
            options={evidenceOptions}
          />
          <Input
            label="Referencia persistente"
            placeholder="URL, ID documental o registro oficial"
            value={evidenceReference}
            onChange={(event) => setEvidenceReference(event.target.value)}
          />
        </div>
        {state === "onsite_completed" ? (
          <>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={sensitiveCase} onChange={(event) => setSensitiveCase(event.target.checked)} />
              Marcar como caso sensible (exige segundo revisor)
            </label>
            <Button
              type="button"
              disabled={notes.trim().length < 10}
              loading={submitting === "submit-review"}
              onClick={() => void execute(
                "submit-review",
                { expectedVersion: version, notes: notes.trim(), sensitiveCase, evidenceRefs },
                "submit-review",
              )}
            >
              Enviar a revisi?n
            </Button>
          </>
        ) : null}
      </div>

      {state === "review_pending" ? (
        <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" disabled={notes.trim().length < 10} loading={submitting === "approve"} onClick={() => decision("approve")}>
            Aprobar
          </Button>
          <Button type="button" variant="secondary" disabled={notes.trim().length < 10} loading={submitting === "request-changes"} onClick={() => decision("request-changes")}>
            Solicitar cambios
          </Button>
          <Button type="button" variant="danger" disabled={notes.trim().length < 10} loading={submitting === "reject"} onClick={() => decision("reject")}>
            Rechazar
          </Button>
        </div>
      ) : null}

      {state === "channel_pending" ? (
        <p className="text-sm text-neutral-500">
          Esperando que el solicitante confirme el OTP. El c?digo nunca se muestra en este panel.
        </p>
      ) : null}

      <StepUpModal
        open={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        onVerified={retryAfterStepUp}
      />
    </div>
  );
}
