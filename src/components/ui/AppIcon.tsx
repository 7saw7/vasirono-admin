import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";

export type IconName =
  | "dashboard"
  | "building"
  | "branches"
  | "claims"
  | "shield"
  | "reviews"
  | "flag"
  | "users"
  | "analytics"
  | "layers"
  | "plans"
  | "subscriptions"
  | "payments"
  | "promotions"
  | "notifications"
  | "settings"
  | "search"
  | "sun"
  | "moon"
  | "menu"
  | "close"
  | "chevronDown"
  | "chevronRight"
  | "logout"
  | "lock"
  | "mail"
  | "key"
  | "sparkles"
  | "arrowUpRight"
  | "command"
  | "filter"
  | "calendar"
  | "check"
  | "alert"
  | "clock"
  | "wallet"
  | "activity"
  | "plus";

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

const paths: Record<IconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="4" rx="2"/><rect x="14" y="11" width="7" height="10" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></>,
  building: <><path d="M4 21h16"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></>,
  branches: <><path d="M7 4v4a4 4 0 0 0 4 4h6"/><path d="M7 20v-4a4 4 0 0 1 4-4"/><circle cx="7" cy="4" r="2"/><circle cx="7" cy="20" r="2"/><circle cx="19" cy="12" r="2"/></>,
  claims: <><path d="M5 4h14v12H8l-3 3z"/><path d="M9 8h6M9 12h4"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></>,
  reviews: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/></>,
  flag: <><path d="M5 21V4"/><path d="M5 5h11l-2 4 2 4H5"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  analytics: <><path d="M3 3v18h18"/><path d="m7 16 4-5 3 3 5-7"/></>,
  layers: <><path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></>,
  plans: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/></>,
  subscriptions: <><path d="M4 7h16M7 3v4M17 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="m9 15 2 2 4-4"/></>,
  payments: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></>,
  promotions: <><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7"/><path d="M2 7h20v5H2zM12 7v14"/><path d="M12 7H7.5A2.5 2.5 0 1 1 10 4.5zM12 7h4.5A2.5 2.5 0 1 0 14 4.5z"/></>,
  notifications: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21h-4v-.09a1.7 1.7 0 0 0-1.1-1.51 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88L4.2 6.56l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3h4v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.28.37.48.8.6 1.25.08.25.08.5.08.75H21v4h-.09c-.54 0-1.06.22-1.43.62z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  chevronDown: <path d="m6 9 6 6 6-6"/>,
  chevronRight: <path d="m9 18 6-6-6-6"/>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l3 3"/></>,
  sparkles: <><path d="m12 3-1.2 3.1L8 7.3l2.8 1.2L12 12l1.2-3.5L16 7.3l-2.8-1.2z"/><path d="m19 13-.8 2.2L16 16l2.2.8L19 19l.8-2.2L22 16l-2.2-.8z"/><path d="m5 13-.8 2.2L2 16l2.2.8L5 19l.8-2.2L8 16l-2.2-.8z"/></>,
  arrowUpRight: <><path d="M7 17 17 7M7 7h10v10"/></>,
  command: <><path d="M9 6V5a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v14a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/></>,
  filter: <path d="M4 5h16l-6 7v5l-4 2v-7z"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  alert: <><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12"/><path d="M16 11h6v4h-6a2 2 0 0 1 0-4z"/></>,
  activity: <><path d="M3 12h4l2-6 4 12 2-6h6"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
};

export function AppIcon({ name, className, ...props }: AppIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
