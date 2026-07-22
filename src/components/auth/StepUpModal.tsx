"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type StepUpModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onVerified: (stepUpUntil: string) => void | Promise<void>;
};

type ApiPayload = {
  ok?: boolean;
  data?: { stepUpUntil?: string };
  error?: string;
};

export function StepUpModal({
  open,
  title = "Confirma nuevamente tu identidad",
  description = "Ingresa el código de tu aplicación autenticadora para autorizar esta acción sensible.",
  onClose,
  onVerified,
}: StepUpModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCode("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, submitting]);

  if (!open) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/step-up", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as ApiPayload;
      if (!response.ok || payload.ok === false || !payload.data?.stepUpUntil) {
        throw new Error(payload.error || "No se pudo verificar el código.");
      }
      await onVerified(payload.data.stepUpUntil);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo verificar el código.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950"
      >
        <h2 id={titleId} className="text-xl font-semibold text-slate-950 dark:text-white">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input
            autoFocus
            label="Código TOTP o de recuperación"
            name="stepUpCode"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="one-time-code"
            inputMode="text"
            minLength={6}
            maxLength={32}
            required
            error={error ?? undefined}
            placeholder="000000"
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting} disabled={code.trim().length < 6}>
              Verificar
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
