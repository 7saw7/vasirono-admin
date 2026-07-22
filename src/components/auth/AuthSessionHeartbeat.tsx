"use client";

import { useEffect, useRef } from "react";

const REFRESH_INTERVAL_MS = 8 * 60 * 1000;
const REFRESH_LOCK_TTL_MS = 30 * 1000;
const REFRESH_STORAGE_KEY = "vasirono.admin.last-session-refresh";
const REFRESH_LOCK_KEY = "vasirono.admin.session-refresh-lock";
const WEB_LOCK_NAME = "vasirono-admin-session-refresh";

type RefreshLockManager = {
  request<T>(
    name: string,
    options: { mode: "exclusive"; ifAvailable: true },
    callback: (lock: unknown | null) => Promise<T> | T,
  ): Promise<T>;
};

type StoredRefreshLock = {
  owner: string;
  expiresAt: number;
};

function readTimestamp(key: string): number {
  try {
    const value = Number(window.localStorage.getItem(key) ?? 0);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function shouldRefresh(): boolean {
  const lastRefresh = readTimestamp(REFRESH_STORAGE_KEY);
  return lastRefresh <= 0 || Date.now() - lastRefresh >= REFRESH_INTERVAL_MS;
}

function rememberSuccessfulRefresh(): void {
  try {
    window.localStorage.setItem(REFRESH_STORAGE_KEY, String(Date.now()));
  } catch {
    // El almacenamiento puede estar deshabilitado. La renovación sigue funcionando.
  }
}

function parseStoredLock(value: string | null): StoredRefreshLock | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredRefreshLock>;
    if (
      typeof parsed.owner !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      !Number.isFinite(parsed.expiresAt)
    ) {
      return null;
    }
    return { owner: parsed.owner, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function acquireStorageLock(owner: string): boolean {
  try {
    const now = Date.now();
    const current = parseStoredLock(window.localStorage.getItem(REFRESH_LOCK_KEY));
    if (current && current.owner !== owner && current.expiresAt > now) return false;

    const next: StoredRefreshLock = {
      owner,
      expiresAt: now + REFRESH_LOCK_TTL_MS,
    };
    window.localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify(next));

    const confirmed = parseStoredLock(window.localStorage.getItem(REFRESH_LOCK_KEY));
    return confirmed?.owner === owner;
  } catch {
    // Sin localStorage no hay coordinación entre pestañas, pero se conserva la sesión actual.
    return true;
  }
}

function releaseStorageLock(owner: string): void {
  try {
    const current = parseStoredLock(window.localStorage.getItem(REFRESH_LOCK_KEY));
    if (current?.owner === owner) window.localStorage.removeItem(REFRESH_LOCK_KEY);
  } catch {
    // No hay nada adicional que hacer.
  }
}

async function withCrossTabRefreshLock(
  owner: string,
  task: () => Promise<void>,
): Promise<void> {
  const lockManager = (navigator as Navigator & { locks?: RefreshLockManager }).locks;

  if (lockManager) {
    await lockManager.request(
      WEB_LOCK_NAME,
      { mode: "exclusive", ifAvailable: true },
      async (lock) => {
        if (!lock || !shouldRefresh()) return;
        await task();
      },
    );
    return;
  }

  if (!acquireStorageLock(owner)) return;
  try {
    // Otra pestaña pudo completar la renovación mientras esta esperaba el bloqueo.
    if (shouldRefresh()) await task();
  } finally {
    releaseStorageLock(owner);
  }
}

function createTabId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function AuthSessionHeartbeat() {
  const refreshingRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    const tabId = createTabId();

    async function performRefresh(): Promise<void> {
      if (disposed || refreshingRef.current) return;
      refreshingRef.current = true;

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { accept: "application/json" },
        });

        if (response.ok) {
          rememberSuccessfulRefresh();
          return;
        }

        if (response.status === 401 || response.status === 403) {
          window.location.assign("/login?reason=session-expired");
        }
      } catch {
        // Un fallo de red transitorio no cierra la sesión; se reintentará en el siguiente pulso.
      } finally {
        refreshingRef.current = false;
      }
    }

    async function refreshSession(): Promise<void> {
      if (disposed || refreshingRef.current || !shouldRefresh()) return;
      await withCrossTabRefreshLock(tabId, performRefresh);
    }

    void refreshSession();
    const interval = window.setInterval(
      () => void refreshSession(),
      REFRESH_INTERVAL_MS,
    );
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshSession();
    };
    const onFocus = () => void refreshSession();
    const onStorage = (event: StorageEvent) => {
      if (event.key === REFRESH_STORAGE_KEY && event.newValue) {
        // La marca compartida evita que esta pestaña reutilice el refresh token anterior.
        return;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      releaseStorageLock(tabId);
    };
  }, []);

  return null;
}
