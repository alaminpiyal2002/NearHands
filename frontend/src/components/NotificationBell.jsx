import { Link } from "react-router-dom";
import { useNotifications } from "../contexts/useNotifications";

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function NotificationBell() {
  const { unreadCount, notificationSocketStatus } = useNotifications();

  return (
    <Link
      to="/notifications"
      className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-teal-700"
      title={`Notifications: ${notificationSocketStatus}`}
    >
      <BellIcon />

      <span>Notifications</span>

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}