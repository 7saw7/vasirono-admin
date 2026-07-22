"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StepUpModal } from "@/components/auth/StepUpModal";
import { Button } from "@/components/ui/Button";
import type { UserSessionItem } from "@/features/auth/types";

type ApiPayload<T> = {
  ok?: boolean;
  data?: T;
  error?: string;
};

function formatDate(value: string | null): string {
  if (!value) return "Sin actividad registrada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function describeDevice(session: UserSessionItem): string {
  if (session.deviceLabel?.trim()) return session.deviceLabel.trim();
  const source = session.userAgent?.toLowerCase() ?? "";
  const browser = source.includes("edg/")
    ? "Microsoft Edge"
    : source.includes("chrome/")
      ? "Google Chrome"
      : source.includes("firefox/")
        ? "Firefox"
        : source.includes("safari/")
          ? "Safari"
          : "Navegador desconocido";
  const platform = source.includes("windows")
    ? "Windows"
    : source.includes("android")
      ? "Android"
      : source.includes("iphone") || source.includes("ipad")
        ? "iOS"
        : source.includes("mac os")
          ? "macOS"
          : source.includes("linux")
            ? "Linux"
            : "dispositivo desconocido";
  return `${browser} en ${platform}`;
}

async function readPayload<T>(response: Response): Promise<ApiPayload<T>> {
  return (await response.json().catch(() => ({}))) as ApiPayload<T>;
}

export function SecuritySessionsPanel() {
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busySessionId, setBusySessionId] = useState<number | null>(null);
  const [bulkAction, setBulkAction] = useState<"others" | "all" | null>(null);
  const [stepUpOpen, setStepUpOpen] = useState(false);

  const currentSession = useMemo(
    () => sessions.find((session) => session.current) ?? null,
    [sessions],
  );

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/sessions", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      const payload = await readPayload<UserSessionItem[]>(response);
      if (!response.ok || payload.ok === false || !Array.isArray(payload.data)) {
        throw new Error(payload.error || "No se pudieron cargar las sesiones activas.");
      }
      setSessions(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudieron cargar las sesiones activas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  async function revokeSession(session: UserSessionItem): Promise<void> {
    if (busySessionId !== null || bulkAction !== null) return;
    setBusySessionId(session.sessionId);
    setError(null);
    try {
      const response = await fetch("/api/auth/sessions", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });
      const payload = await readPayload<{ revoked: boolean }>(response);
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || "No se pudo cerrar la sesión seleccionada.");
      }
      if (session.current) {
        window.location.assign("/login?reason=session-revoked");
        return;
      }
      setSessions((current) => current.filter((item) => item.sessionId !== session.sessionId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cerrar la sesión seleccionada.");
    } finally {
      setBusySessionId(null);
    }
  }

  async function revokeOthers(): Promise<void> {
    if (busySessionId !== null || bulkAction !== null) return;
    setBulkAction("others");
    setError(null);
    try {
      const response = await fetch("/api/auth/sessions", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ action: "revoke-others" }),
      });
      const payload = await readPayload<{ revokedSessions: number }>(response);
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || "No se pudieron cerrar las otras sesiones.");
      }
      setSessions((current) => current.filter((session) => session.current));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudieron cerrar las otras sesiones.");
    } finally {
      setBulkAction(null);
    }
  }

  async function revokeAllAfterStepUp(): Promise<void> {
    setBulkAction("all");
    setError(null);
    try {
      const response = await fetch("/api/auth/sessions", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ action: "revoke-all" }),
      });
      const payload = await readPayload<{ revokedSessions: number }>(response);
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || "No se pudieron cerrar todas las sesiones.");
      }
      window.location.assign("/login?reason=global-logout");
    } catch (caught) {
      const failure = caught instanceof Error
        ? caught
        : new Error("No se pudieron cerrar todas las sesiones.");
      setError(failure.message);
      setBulkAction(null);
      throw failure;
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
            Seguridad de la cuenta
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            Sesiones activas
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Revisa los dispositivos que conservan acceso al backoffice. El cierre global exige una verificación MFA reciente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void loadSessions()} disabled={loading || bulkAction !== null}>
            Actualizar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void revokeOthers()}
            loading={bulkAction === "others"}
            disabled={loading || sessions.filter((session) => !session.current).length === 0 || bulkAction === "all"}
          >
            Cerrar otras
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => setStepUpOpen(true)}
            loading={bulkAction === "all"}
            disabled={loading || sessions.length === 0 || bulkAction === "others"}
          >
            Cerrar todas
          </Button>
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          Cargando sesiones activas…
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          No se encontraron sesiones activas.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-white/[0.07] dark:border-white/10">
          {sessions.map((session) => (
            <article key={session.sessionId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950 dark:text-white">{describeDevice(session)}</p>
                  {session.current ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      Sesión actual
                    </span>
                  ) : null}
                  {session.mfa ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                      MFA
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                  <span>IP: {session.ipAddress ?? "No disponible"}</span>
                  <span>Última actividad: {formatDate(session.lastSeenAt ?? session.createdAt)}</span>
                  <span>Creada: {formatDate(session.createdAt)}</span>
                  <span>Vence: {formatDate(session.expiresAt)}</span>
                </div>
              </div>

              <Button
                type="button"
                variant={session.current ? "danger" : "secondary"}
                size="sm"
                loading={busySessionId === session.sessionId}
                disabled={busySessionId !== null || bulkAction !== null}
                onClick={() => void revokeSession(session)}
              >
                {session.current ? "Cerrar esta sesión" : "Revocar"}
              </Button>
            </article>
          ))}
        </div>
      )}

      {currentSession?.stepUpUntil ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Verificación reforzada vigente hasta {formatDate(currentSession.stepUpUntil)}.
        </p>
      ) : null}

      <StepUpModal
        open={stepUpOpen}
        title="Cerrar todas las sesiones"
        description="Esta operación revocará también la sesión actual. Confirma tu código MFA para continuar."
        onClose={() => setStepUpOpen(false)}
        onVerified={() => revokeAllAfterStepUp()}
      />
    </section>
  );
}
