import { LoginForm } from "./LoginForm";

export function LoginView() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <div className="hidden bg-neutral-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Vasirono
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
              Backoffice para operar, moderar y supervisar toda la plataforma.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-neutral-300">
              Accede al panel interno para gestionar empresas, sucursales,
              verificaciones, reseñas, usuarios, pagos, promociones y métricas
              globales desde una sola capa operativa.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-white">
                Operación centralizada
              </p>
              <p className="mt-2 text-sm text-neutral-300">
                Revisión de claims, verificaciones, moderación de reseñas y
                control transversal del ecosistema.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-white">
                Acceso restringido
              </p>
              <p className="mt-2 text-sm text-neutral-300">
                Solo perfiles internos autorizados pueden entrar al backoffice.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Vasirono
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950">
                Iniciar sesión
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Accede al backoffice interno de la plataforma.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 hidden lg:block">
                <h2 className="text-2xl font-semibold text-neutral-950">
                  Iniciar sesión
                </h2>
                <p className="mt-2 text-sm text-neutral-500">
                  Usa tus credenciales internas para acceder al panel.
                </p>
              </div>

              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}