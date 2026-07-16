"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function BackofficeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("backoffice.page.error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
      <div className="w-full rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-400/15 dark:bg-white/[0.035]">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-500">
          Error del backoffice
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
          No se pudo cargar esta sección
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Reintenta la operación. Si el problema continúa, revisa el estado del microservicio asociado.
        </p>
        <div className="mt-6 flex justify-center">
          <Button type="button" onClick={reset}>
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  );
}
