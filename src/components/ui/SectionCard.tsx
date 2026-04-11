import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <section className={cn("rounded-2xl border border-neutral-200 bg-white shadow-sm", className)}>
      {title || description ? (
        <header className="border-b border-neutral-100 px-5 py-4">
          {title ? (
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          ) : null}
        </header>
      ) : null}

      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}