import React from "react";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";

type FooterProps = {
  variant?: "light" | "dark";
};

const Footer: React.FC<FooterProps> = ({ variant = "dark" }) => {
  const isLight = variant === "light";

  const baseBg = isLight
    ? "bg-rose-50 text-rose-950"
    : "bg-[#120814] text-rose-50";

  const borderColor = isLight ? "border-rose-200/70" : "border-white/10";
  const subtleText = isLight ? "text-rose-700/80" : "text-rose-100/65";
  const navText = isLight
    ? "text-rose-800 hover:text-rose-950"
    : "text-rose-100/80 hover:text-white";

  return (
    <footer
      className={`${baseBg} ${borderColor} relative overflow-hidden border-t pt-20`}
    >
      {/* Fondo decorativo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-[8%] h-56 w-56 rounded-full bg-rose-400/12 blur-3xl" />
        <div className="absolute top-[22%] right-[10%] h-64 w-64 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_240px_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Bloque principal */}
        <div className="mb-14">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))] shadow-[0_20px_70px_rgba(20,0,20,0.35)] backdrop-blur-2xl">
            <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_140px_at_20%_0%,rgba(251,113,133,0.14),transparent_60%),radial-gradient(420px_140px_at_80%_0%,rgba(232,121,249,0.12),transparent_60%)]" />

              <div className="relative z-10 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.30em] text-pink-200/70">
                  Cierre de esta pequeña sorpresa
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2.2rem]">
                  Gracias por llegar hasta aquí.
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-rose-100/75 sm:text-base sm:leading-8">
                  Esta página fue hecha con cariño, pensando en ti y en lo bonito
                  que es poder dedicar algo especial desde el corazón.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/#historia"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/8 px-5 py-2.5 text-sm font-medium text-rose-50 transition-all duration-300 hover:-translate-y-[1px] hover:bg-white/12 hover:text-white"
                  >
                    Volver a nuestra historia
                  </Link>

                  <Link
                    href="/#sorpresa"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_34px_rgba(236,72,153,0.28)] transition-all duration-300 hover:-translate-y-[1px] hover:brightness-110"
                  >
                    Ver la sorpresa otra vez
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido inferior */}
        <div className="grid gap-10 pb-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
          {/* Marca / dedicatoria */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-400/15 ring-1 ring-pink-300/30">
                <FaHeart className="text-sm text-pink-300" />
              </div>

              <span className="text-[15px] font-semibold tracking-tight text-white">
                Para ti
              </span>
            </div>

            <p className={`max-w-md text-sm leading-7 ${subtleText}`}>
              No quise hacer una página común, sino un pequeño rincón bonito que
              pudiera transmitir una parte de lo mucho que significas para mí.
            </p>

            <div className="flex flex-wrap gap-3 text-xs">
              <span className="rounded-full border border-pink-300/20 bg-pink-400/10 px-3 py-1 text-pink-100">
                Hecho con cariño
              </span>
              <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1 text-rose-100">
                Pensado especialmente para ti
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-rose-100/80">
                Un recuerdo bonito
              </span>
            </div>
          </div>

          {/* Navegación */}
          <div className="space-y-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-200/75">
              Navegación
            </p>

            <div className="grid grid-cols-1 gap-y-2">
              <Link href="/" className={`transition ${navText}`}>
                Inicio
              </Link>
              <Link href="/#historia" className={`transition ${navText}`}>
                Nuestra historia
              </Link>
              <Link href="/#momentos" className={`transition ${navText}`}>
                Momentos
              </Link>
              <Link href="/#carta" className={`transition ${navText}`}>
                Carta
              </Link>
              <Link href="/#sorpresa" className={`transition ${navText}`}>
                Sorpresa
              </Link>
            </div>
          </div>

          {/* Cierre emocional */}
          <div className="space-y-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-200/75">
              Un último mensaje
            </p>

            <div className="space-y-3">
              <p className={subtleText}>
                Gracias por tomarte el tiempo de recorrer esta página.
              </p>
              <p className={subtleText}>
                Ojalá cada sección te haya sacado una sonrisa.
              </p>
              <p className="font-medium text-pink-200">
                Todo esto fue hecho pensando en ti. ❤️
              </p>
            </div>
          </div>
        </div>

        {/* Línea final */}
        <div className={`border-t ${borderColor} py-5 text-xs ${subtleText}`}>
          <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
            <p>Hecho con amor y dedicación.</p>
            <span className="hidden sm:inline">•</span>
            <p>{new Date().getFullYear()} · Un pequeño rincón creado especialmente para ti</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;