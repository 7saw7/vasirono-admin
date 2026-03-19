"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { NAV } from "../app/config/nav";

type NavbarProps = {
  variant?: "light" | "dark";
};

function normalizeHashHref(href: string) {
  if (href === "/") return "/";
  if (href.startsWith("/#")) return href.slice(1); // "/#historia" -> "#historia"
  return href;
}

const Navbar: React.FC<NavbarProps> = ({ variant = "dark" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isDark = variant === "dark";
  const currentPath = pathname || "/";
  const [hoveredPath, setHoveredPath] = useState<string | null>(currentPath);

  const baseClasses =
    "fixed inset-x-0 top-0 z-40 w-full transition-all duration-300";
  const themeClasses = isDark
    ? "text-white bg-transparent"
    : "text-slate-900 bg-transparent";

  const navItems = useMemo(
    () =>
      NAV.map((item) => ({
        ...item,
        normalizedHref: normalizeHashHref(item.href),
      })),
    []
  );

  const closeMobileMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <>
      <nav className={`${baseClasses} ${themeClasses}`}>
        <div className="mx-auto max-w-6xl px-3 pt-3 sm:px-4 sm:pt-4">
          <div
            className={[
              "relative overflow-hidden rounded-[26px]",
              "border border-white/10",
              "bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))]",
              "backdrop-blur-2xl",
              "shadow-[0_18px_60px_rgba(25,0,20,0.40)]",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_120px_at_20%_0%,rgba(251,113,133,0.18),transparent_60%),radial-gradient(380px_120px_at_80%_0%,rgba(232,121,249,0.16),transparent_60%)]" />

            <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
              {/* Identidad */}
              <Link href="/" className="group flex min-w-0 items-center gap-3">
                <div
                  className={[
                    "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl",
                    "border border-pink-200/20",
                    "bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))]",
                    "shadow-[0_10px_28px_rgba(255,105,180,0.18)]",
                  ].join(" ")}
                >
                  <Image
                    src="/assets/images/logo.png"
                    alt="Mi dedicatoria"
                    fill
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_55%)] opacity-80" />
                </div>

                <div className="min-w-0 leading-tight">
                  <span className="block truncate text-[18px] font-semibold tracking-tight text-white sm:text-[20px]">
                    Para ti
                  </span>
                  <span className="block truncate text-[10px] uppercase tracking-[0.28em] text-pink-200/70 sm:text-[11px]">
                    Hecho con cariño
                  </span>
                </div>
              </Link>

              {/* Botón móvil */}
              <button
                type="button"
                className={[
                  "relative flex h-11 w-11 items-center justify-center rounded-2xl sm:hidden",
                  "border border-pink-200/20",
                  "bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))]",
                  "shadow-[0_8px_24px_rgba(25,0,20,0.35)]",
                  "transition-all duration-200 active:scale-95",
                ].join(" ")}
                onClick={toggleMenu}
                aria-label="Abrir menú"
                aria-expanded={isOpen}
              >
                <div className="relative h-5 w-5">
                  <span
                    className={`absolute inset-x-0 h-[2px] rounded-full bg-pink-200 transition-all duration-300 ${
                      isOpen ? "top-1/2 rotate-45" : "top-1"
                    }`}
                  />
                  <span
                    className={`absolute inset-x-0 h-[2px] rounded-full bg-pink-200 transition-all duration-300 ${
                      isOpen ? "opacity-0" : "top-1/2"
                    }`}
                  />
                  <span
                    className={`absolute inset-x-0 h-[2px] rounded-full bg-pink-200 transition-all duration-300 ${
                      isOpen ? "top-1/2 -rotate-45" : "bottom-1"
                    }`}
                  />
                </div>
              </button>

              {/* Desktop menu */}
              <ul
                className="hidden items-center gap-1 text-[13px] font-medium sm:flex"
                onMouseLeave={() => setHoveredPath(currentPath)}
              >
                {navItems.map((item) => {
                  const hovered = hoveredPath === item.href;

                  return (
                    <li
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => setHoveredPath(item.href)}
                    >
                      <Link
                        href={item.normalizedHref}
                        className={[
                          "relative z-10 inline-flex items-center rounded-2xl px-4 py-2.5 transition-colors duration-200",
                          hovered
                            ? "text-pink-100"
                            : "text-white/80 hover:text-white",
                        ].join(" ")}
                      >
                        <span>{item.label}</span>
                      </Link>

                      {hovered && (
                        <motion.div
                          layoutId="navbar-pill-romantic"
                          className="absolute inset-0 rounded-2xl border border-pink-200/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] shadow-[0_10px_30px_rgba(255,105,180,0.10)]"
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 28,
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              key="overlay"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 bg-[rgba(18,8,20,0.72)] backdrop-blur-md sm:hidden"
              onClick={closeMobileMenu}
              aria-label="Cerrar menú"
            />

            <motion.aside
              key="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                ease: "easeOut",
                duration: 0.3,
              }}
              className="fixed bottom-0 right-0 top-0 z-[60] w-[82%] max-w-[340px] sm:hidden"
            >
              <div className="relative h-full">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-[1px] rounded-l-[28px] bg-[linear-gradient(to_bottom,rgba(251,113,133,0.45),rgba(232,121,249,0.28),transparent)] opacity-90"
                />

                <div className="relative flex h-full flex-col rounded-l-[28px] border-l border-pink-200/15 bg-[linear-gradient(180deg,rgba(29,12,25,0.98),rgba(16,8,18,0.98))] shadow-[0_0_40px_rgba(0,0,0,0.55)]">
                  {/* top */}
                  <div className="border-b border-pink-200/10 px-4 pb-3 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-pink-200/15 bg-white/5">
                        <Image
                          src="/assets/images/logo.png"
                          alt="Mi dedicatoria"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="leading-tight">
                        <p className="text-sm font-semibold text-white">
                          Para ti
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-pink-200/60">
                          Hecho con cariño
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* links */}
                  <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-4 text-sm">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.normalizedHref}
                          onClick={closeMobileMenu}
                          className="group relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-white/85 transition-all active:scale-[0.98]"
                        >
                          <span className="text-[13px] font-medium">
                            {item.label}
                          </span>

                          <span className="ml-2 text-[10px] text-pink-200/70 transition-transform group-hover:translate-x-0.5">
                            ▸
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* footer */}
                  <div className="border-t border-pink-200/10 px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-pink-200/55">
                      Una página hecha especialmente para alguien muy importante
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;