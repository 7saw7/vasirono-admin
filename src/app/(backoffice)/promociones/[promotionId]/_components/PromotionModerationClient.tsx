"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { PromotionStatus } from "@/features/backoffice/promotions/types";

type Props = {
  promotionId: number;
  status: PromotionStatus;
  canModerate: boolean;
  canUpdateStatus: boolean;
};

type Decision = "approved" | "rejected" | "requires_changes";

export function PromotionModerationClient({ promotionId, status, canModerate, canUpdateStatus }: Props) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision>("approved");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const canReviewStatus = ["draft", "pending_review", "rejected"].includes(status);
  const moderationOptions = status === "rejected"
    ? [{ label: "Aprobar", value: "approved" }]
    : [
        { label: "Aprobar", value: "approved" },
        { label: "Solicitar cambios", value: "requires_changes" },
        { label: "Rechazar", value: "rejected" },
      ];
  const canPause = status === "approved";
  const canReactivate = status === "paused";

  async function request(path: string, body: unknown, successMessage: string) {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(path, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error ?? "No se pudo completar la operación.");
      }
      setFeedback({ type: "success", message: successMessage });
      setReason("");
      router.refresh();
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "No se pudo completar la operación." });
    } finally {
      setLoading(false);
    }
  }

  async function moderate() {
    if ((decision === "rejected" || decision === "requires_changes") && !reason.trim()) {
      setFeedback({ type: "error", message: "Debes indicar el motivo de la decisión." });
      return;
    }
    await request(
      `/api/backoffice/promotions/${promotionId}/moderate`,
      { decision, reason: reason.trim() || undefined },
      decision === "approved" ? "Promoción aprobada." : decision === "rejected" ? "Promoción rechazada." : "Se solicitaron cambios a la empresa.",
    );
  }

  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.075] dark:bg-[#101620]">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Acciones administrativas</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Las decisiones se registran con el administrador y el motivo enviado.</p>

      {feedback ? <div className={`mt-4 rounded-xl px-3 py-2 text-sm ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"}`}>{feedback.message}</div> : null}

      {canModerate && canReviewStatus ? (
        <div className="mt-5 space-y-4">
          <Select label="Decisión" value={decision} onChange={(event) => setDecision(event.target.value as Decision)} options={moderationOptions} />
          <Textarea label="Motivo / observaciones" maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} hint="Obligatorio al rechazar o solicitar cambios." />
          <Button type="button" loading={loading} onClick={() => void moderate()}>Confirmar decisión</Button>
        </div>
      ) : null}

      {canUpdateStatus && (canPause || canReactivate) ? (
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 dark:border-white/[0.065]">
          <Textarea label="Motivo operativo (opcional)" maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} />
          <Button
            type="button"
            variant={canPause ? "danger" : "primary"}
            loading={loading}
            onClick={() => void request(
              `/api/backoffice/promotions/${promotionId}/status`,
              { status: canPause ? "paused" : "approved", reason: reason.trim() || undefined },
              canPause ? "Promoción pausada." : "Promoción reactivada.",
            )}
          >
            {canPause ? "Pausar promoción" : "Reactivar promoción"}
          </Button>
        </div>
      ) : null}

      {!canModerate && !canUpdateStatus ? <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Tu rol tiene acceso de solo lectura.</p> : null}
      {(status === "expired" || status === "deleted") ? <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">La promoción está en un estado terminal y no admite acciones administrativas.</p> : null}
    </section>
  );
}
