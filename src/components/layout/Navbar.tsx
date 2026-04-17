import Link from "next/link";
import { siteConfig } from "@/config/site";

const navigation = [
  { label: "Login", href: "/login" },
];

export function Navbar() {
  return (
    <header className="border-b border-white/10 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Vasirono
            </p>
            <p className="truncate text-sm font-semibold text-white">
              {siteConfig.applicationName}
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}