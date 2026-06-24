"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { ClaimDetail } from "@/features/backoffice/claims/types";

type ClaimProfessionalFlowPanelProps = {
  claim: ClaimDetail;
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type OfficialChannelResponse = {
  channel: "email" | "whatsapp";
  to: string;
  codeExpiresAt: string;
  notification: {
    sent: boolean;
    prepared: boolean;
    manualActionRequired: boolean;
    manualSendUrl?: string | null;
    messageText?: string | null;
    provider?: string | null;
    error?: string | null;
  };
};

const channelOptions = [
  { label: "WhatsApp oficial público", value: "whatsapp" },
  { label: "Correo oficial público", value: "email" },
];

function normalizeInitialChannel(value: string | null) {
  const normalized = value?.toLowerCase();
  return normalized === "email" || normalized === "whatsapp" ? normalized : "whatsapp";
}

export function ClaimProfessionalFlowPanel({ claim }: ClaimProfessionalFlowPanelProps) {
  const router = useRouter();
  const [channelType, setChannelType] = useState(normalizeInitialChannel(claim.declaredChannelType));
  const [channelValue, setChannelValue] = useState(claim.declaredChannelValue ?? claim.branchPhone ?? claim.branchEmail ?? "");
  const [evidenceUrl, setEvidenceUrl] = useState(claim.evidenceUrl ?? "");
  const [notes, setNotes] = useState("");
  const [visitScheduledAt, setVisitScheduledAt] = useState("");
  const [visitAddress, setVisitAddress] = useState(claim.branchAddress ?? "");
  const [visitContactPerson, setVisitContactPerson] = useState(claim.claimantName ?? "");
  const [visitContactPhone, setVisitContactPhone] = useState(claim.claimantPhone ?? "");
  const [onsiteApprovalNotes, setOnsiteApprovalNotes] = useState("");
  const [documentsReviewed, setDocumentsReviewed] = useState(true);
  const [addressVerified, setAddressVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [officialResult, setOfficialResult] = useState<OfficialChannelResponse | null>(null);

  const hasOfficialChannel = useMemo(() => {
    return channelValue.trim().length >= 3 && (channelType === "email" || channelType === "whatsapp");
  }, [channelType, channelValue]);

  async function post<T>(path: string, body: unknown, label: string) {
    setIsSubmitting(label);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as ApiResponse<T>;
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "No se pudo completar la acción.");
        return null;
      }
      router.refresh();
      return payload.data ?? null;
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado.");
      return null;
    } finally {
      setIsSubmitting(null);
    }
  }

  async function handleSendOfficialCode() {
    const result = await post<OfficialChannelResponse>(
      `/api/backoffice/claims/${claim.claimRequestId}/official-channel`,
      {
        channelType,
        channelValue,
        evidenceUrl: evidenceUrl || null,
        reviewerNotes: notes || null,
        matchedWithBranchContact: true,
      },
      "official-channel"
    );

    if (result) {
      setOfficialResult(result);
      setSuccess(
        result.channel === "whatsapp"
          ? "Código preparado. Abre WhatsApp y envía el mensaje desde el número oficial público."
          : "Código enviado al correo oficial público."
      );
    }
  }

  async function handleOnsiteRequired() {
    const result = await post(
      `/api/backoffice/claims/${claim.claimRequestId}/onsite-required`,
      {
        scheduledAt: visitScheduledAt || null,
        visitAddress: visitAddress || null,
        contactPerson: visitContactPerson || null,
        contactPhone: visitContactPhone || null,
        notes: notes || "No se encontró canal oficial público suficiente. Se requiere visita presencial.",
      },
      "onsite-required"
    );
    if (result) setSuccess("El claim fue derivado a verificación presencial.");
  }

  async function handleOnsiteApprove() {
    const result = await post(
      `/api/backoffice/claims/${claim.claimRequestId}/onsite-approve`,
      {
        notes: onsiteApprovalNotes,
        documentsReviewed,
        addressVerified,
      },
      "onsite-approve"
    );
    if (result) setSuccess("Verificación presencial aprobada y perfil de confianza actualizado.");
  }

  async function handleNeedsMoreEvidence() {
    const result = await post(
      `/api/backoffice/claims/${claim.claimRequestId}/needs-more-evidence`,
      { notes: notes || "Se requiere evidencia adicional para continuar la validación." },
      "needs-more-evidence"
    );
    if (result) setSuccess("El claim quedó marcado como requiere más evidencia.");
  }

  async function handleReject() {
    const result = await post(
      `/api/backoffice/claims/${claim.claimRequestId}/reject`,
      { decision: "reject", notes: notes || "No se pudo comprobar relación con el negocio." },
      "reject"
    );
    if (result) setSuccess("Claim rechazado.");
  }

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-base font-semibold text-neutral-950">Flujo profesional de verificación</p>
        <p className="mt-1 text-sm text-neutral-500">
          Usa esta consola para validar canal oficial, derivar a visita presencial o pedir más evidencia. El acceso al panel empresa no debe otorgarse solo por la solicitud.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 p-4">
          <p className="text-sm font-semibold text-neutral-900">1. Canal oficial público</p>
          <p className="mt-1 text-sm text-neutral-500">
            Envía un código solo al canal encontrado en fuente pública. Para WhatsApp se generará un link manual wa.me.
          </p>

          <div className="mt-4 grid gap-3">
            <Select
              label="Tipo de canal"
              value={channelType}
              onChange={(event) => setChannelType(event.target.value as "email" | "whatsapp")}
              options={channelOptions}
            />
            <Input
              label="Valor oficial público"
              placeholder={channelType === "whatsapp" ? "51999888777" : "contacto@negocio.com"}
              value={channelValue}
              onChange={(event) => setChannelValue(event.target.value)}
            />
            <Input
              label="URL de evidencia pública"
              placeholder="Google Maps, Instagram, web oficial, etc."
              value={evidenceUrl}
              onChange={(event) => setEvidenceUrl(event.target.value)}
            />
            <Textarea
              label="Notas de revisión"
              placeholder="Fuente revisada, coincidencia con ficha pública, observaciones..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <Button
              type="button"
              loading={isSubmitting === "official-channel"}
              disabled={!hasOfficialChannel}
              onClick={() => void handleSendOfficialCode()}
            >
              Enviar código / preparar WhatsApp
            </Button>
          </div>

          {officialResult?.notification.manualSendUrl ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">WhatsApp preparado</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-800">
                {officialResult.notification.messageText ?? "Mensaje listo para enviar."}
              </p>
              <a
                className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                href={officialResult.notification.manualSendUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir WhatsApp
              </a>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-neutral-100 p-4">
          <p className="text-sm font-semibold text-neutral-900">2. Visita presencial</p>
          <p className="mt-1 text-sm text-neutral-500">
            Si no existe fuente pública confiable, deriva el caso a visita presencial. Si la visita ya fue satisfactoria, aprueba el control operativo del local.
          </p>

          <div className="mt-4 grid gap-3">
            <Input
              label="Fecha/hora programada"
              type="datetime-local"
              value={visitScheduledAt}
              onChange={(event) => setVisitScheduledAt(event.target.value)}
            />
            <Input
              label="Dirección de visita"
              value={visitAddress}
              onChange={(event) => setVisitAddress(event.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Persona de contacto"
                value={visitContactPerson}
                onChange={(event) => setVisitContactPerson(event.target.value)}
              />
              <Input
                label="Teléfono contacto"
                value={visitContactPhone}
                onChange={(event) => setVisitContactPhone(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              loading={isSubmitting === "onsite-required"}
              onClick={() => void handleOnsiteRequired()}
            >
              Coordinar visita presencial
            </Button>
          </div>

          <div className="mt-5 border-t border-neutral-100 pt-4">
            <Textarea
              label="Notas de aprobación presencial"
              placeholder="Ej.: Local existe, dirección coincide, encargado presentó RUC/licencia/recibo..."
              value={onsiteApprovalNotes}
              onChange={(event) => setOnsiteApprovalNotes(event.target.value)}
            />
            <div className="mt-3 grid gap-2 text-sm text-neutral-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={addressVerified} onChange={(event) => setAddressVerified(event.target.checked)} />
                Dirección del local validada presencialmente
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={documentsReviewed} onChange={(event) => setDocumentsReviewed(event.target.checked)} />
                Documentos revisados durante visita
              </label>
            </div>
            <Button
              type="button"
              className="mt-3"
              loading={isSubmitting === "onsite-approve"}
              disabled={onsiteApprovalNotes.trim().length < 5}
              onClick={() => void handleOnsiteApprove()}
            >
              Aprobar verificación presencial
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
        <Button
          type="button"
          variant="secondary"
          loading={isSubmitting === "needs-more-evidence"}
          onClick={() => void handleNeedsMoreEvidence()}
        >
          Pedir más evidencia
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={isSubmitting === "reject"}
          onClick={() => void handleReject()}
        >
          Rechazar solicitud
        </Button>
      </div>
    </div>
  );
}
