import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-neutral-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-medium text-white">{siteConfig.name}</p>
          <p className="mt-1 text-sm text-neutral-400">
            Panel interno para operación, moderación y supervisión de la
            plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-neutral-400 lg:items-end">
          <p>© {year} {siteConfig.creator}. Todos los derechos reservados.</p>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="transition hover:text-white"
            >
              Iniciar sesión
            </Link>

            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}