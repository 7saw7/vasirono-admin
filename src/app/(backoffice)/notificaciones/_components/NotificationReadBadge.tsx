type NotificationReadBadgeProps = {
  read: boolean;
};

export function NotificationReadBadge({
  read,
}: NotificationReadBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        read
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-amber-200"
      }`}
    >
      {read ? "Leída" : "No leída"}
    </span>
  );
}