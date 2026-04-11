// src/app/config/nav.ts

export type NavLeaf = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  items: NavLeaf[];
};

export type NavTopItem =
  | {
      label: string;
      href: string;
      groups?: undefined;
    }
  | {
      label: string;
      href: string;
      groups: NavGroup[];
    };

export const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Nuestra historia", href: "/#historia" },
  { label: "Momentos", href: "/#momentos" },
  { label: "Carta", href: "/#carta" },
  { label: "Sorpresa", href: "/#sorpresa" },
] as const;
